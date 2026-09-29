import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import {
  ContextStyle,
  SentenceCheckResult,
  VocabularyEntry,
} from "../types/vocabulary";

export interface CardDeepExplanation {
  koreanWord: string;
  memoryTipVietnamese: string;
  usageComparisonVietnamese: string;
  miniDialogueKorean: string;
  miniDialogueVietnamese: string;
}

const TEXT_MODELS_FALLBACK_ORDER = [
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

const clientModelCooldownUntil = new Map<string, number>();
let cachedRuntimeApiKey: string | null = null;

function sanitizeKeyCandidate(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const cleaned = raw.replace(/^["']+|["']+$/g, "").trim();
  if (
    !cleaned ||
    cleaned === "MY_GEMINI_API_KEY" ||
    cleaned === "undefined" ||
    cleaned === "null" ||
    cleaned.startsWith("{env.") ||
    cleaned.startsWith("${")
  ) {
    return "";
  }
  return cleaned;
}

/**
 * Resolves the Gemini API key for Static / Caddy deployments where /api/* returns HTTP 404.
 * Checks:
 * 1. Vite build-time injected env vars (process.env.GEMINI_API_KEY, import.meta.env.VITE_GEMINI_API_KEY)
 * 2. Coolify Caddy runtime endpoint (/api/runtime-env) injected by scripts/postbuild-coolify.mjs
 * 3. Static build fallback (/env-config.json)
 */
async function resolveFallbackGeminiKey(): Promise<string> {
  if (cachedRuntimeApiKey) {
    return cachedRuntimeApiKey;
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })
    .env;

  const buildCandidates = [
    typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "",
    typeof process !== "undefined" ? process.env?.VITE_GEMINI_API_KEY : "",
    typeof process !== "undefined" ? process.env?.GOOGLE_API_KEY : "",
    typeof process !== "undefined" ? process.env?.API_KEY : "",
    metaEnv?.VITE_GEMINI_API_KEY,
    metaEnv?.GEMINI_API_KEY,
  ];

  for (const candidate of buildCandidates) {
    const valid = sanitizeKeyCandidate(candidate);
    if (valid) {
      cachedRuntimeApiKey = valid;
      return valid;
    }
  }

  // Try fetching from /api/runtime-env (served by Coolify Caddy or Express) or /env-config.json
  for (const endpoint of ["/api/runtime-env", "/env-config.json"]) {
    try {
      const res = await fetch(endpoint, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        const runtimeCandidates = [
          data?.geminiApiKey,
          data?.viteGeminiApiKey,
          data?.googleApiKey,
          data?.apiKey,
        ];
        for (const candidate of runtimeCandidates) {
          const valid = sanitizeKeyCandidate(candidate);
          if (valid) {
            cachedRuntimeApiKey = valid;
            return valid;
          }
        }
      }
    } catch {
      // Ignore and try next source
    }
  }

  return "";
}

function cleanJsonString(raw: string): string {
  let cleaned = String(raw || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Direct @google/genai SDK execution used automatically when the host is deployed
 * as a Static Site (e.g., Coolify Caddy mode returning HTTP 404 on /api/vocabulary/*).
 */
async function generateDirectStructuredJson<T>(params: {
  contents: string;
  systemInstruction: string;
  responseSchema: Record<string, unknown>;
}): Promise<T> {
  const apiKey = await resolveFallbackGeminiKey();
  if (!apiKey) {
    throw new Error(
      "Máy chủ đang chạy ở chế độ Static (HTTP 404 cho /api/*) và chưa tìm thấy GEMINI_API_KEY. Trên Coolify: hãy tích chọn 'Available at Buildtime' (Build Variable) cho biến GEMINI_API_KEY (hoặc tắt 'Is it a static site?' để chạy Node server) rồi bấm Redeploy."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const now = Date.now();

  const orderedModels = [...TEXT_MODELS_FALLBACK_ORDER].sort((a, b) => {
    const aCooling = (clientModelCooldownUntil.get(a) || 0) > now ? 1 : 0;
    const bCooling = (clientModelCooldownUntil.get(b) || 0) > now ? 1 : 0;
    return aCooling - bCooling;
  });

  let lastError: unknown = null;

  for (const modelName of orderedModels) {
    try {
      const config: Record<string, unknown> = {
        systemInstruction: params.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: params.responseSchema,
        ...(modelName === "gemini-3.8-flash"
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      };

      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config,
      });

      const text = response.text;
      if (!text) {
        throw new Error(`Empty response from ${modelName}`);
      }

      const parsed = JSON.parse(cleanJsonString(text)) as T;
      clientModelCooldownUntil.delete(modelName);
      return parsed;
    } catch (err) {
      lastError = err;
      clientModelCooldownUntil.set(modelName, Date.now() + 90_000);
    }
  }

  throw (
    lastError ||
    new Error("Không thể hoàn tất yêu cầu với Gemini AI. Vui lòng thử lại.")
  );
}

/**
 * Dual-Engine Request Helper:
 * 1. Tries backend API route (/api/vocabulary/...) first.
 * 2. If backend returns HTTP 404 / 405 / non-JSON (Coolify Static / Caddy deployment)
 *    or network failure, automatically executes the request via @google/genai SDK fallback.
 */
async function callBackendWithDirectFallback<T>(
  url: string,
  bodyPayload: Record<string, unknown>,
  directFallbackFn: () => Promise<T>
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    const contentType = response.headers.get("content-type") || "";

    // If the server returned 404, 405, 502, 504 or non-JSON (e.g. Caddy static server on Coolify),
    // immediately switch to Direct Gemini SDK execution.
    if (
      response.status === 404 ||
      response.status === 405 ||
      response.status === 502 ||
      response.status === 504 ||
      !contentType.includes("application/json")
    ) {
      return await directFallbackFn();
    }

    const data = await response.json();
    if (!response.ok || data?.error) {
      // If server.ts returned 500/503, try direct fallback if client key exists, otherwise surface server error
      const fallbackKey = await resolveFallbackGeminiKey();
      if (fallbackKey) {
        try {
          return await directFallbackFn();
        } catch {
          // Fall through to throw server's specific error message
        }
      }
      throw new Error(
        data?.error || `Yêu cầu thất bại với mã trạng thái ${response.status}.`
      );
    }

    return data as T;
  } catch (err) {
    // If fetch itself failed or threw, attempt direct fallback before giving up
    const fallbackKey = await resolveFallbackGeminiKey();
    if (fallbackKey) {
      return await directFallbackFn();
    }
    throw err instanceof Error
      ? err
      : new Error("Không thể kết nối tới máy chủ Gemini AI.");
  }
}

const VOCABULARY_ENTRY_PROPERTIES = {
  koreanWord: {
    type: Type.STRING,
    description: "Từ vựng tiếng Hàn ở dạng nguyên mẫu chuẩn (Hangul).",
  },
  romanization: {
    type: Type.STRING,
    description: "Phiên âm Revised Romanization của từ.",
  },
  vietnamesePronunciation: {
    type: Type.STRING,
    description: "Gợi ý cách đọc gần đúng bằng tiếng Việt (ví dụ: xol-lê-đa).",
  },
  partOfSpeech: {
    type: Type.STRING,
    description: "Từ loại song ngữ Hàn - Việt (ví dụ: 동사 · Động từ).",
  },
  topikLevel: {
    type: Type.STRING,
    description: "Cấp độ TOPIK ước lượng (ví dụ: TOPIK I · Sơ cấp 2).",
  },
  hanjaOrigin: {
    type: Type.STRING,
    description:
      "Chữ Hán và Âm Hán Việt nếu là từ Hán Hàn, hoặc ghi '순우리말 · Từ thuần Hàn' nếu là từ thuần Hàn.",
  },
  vietnameseMeaning: {
    type: Type.STRING,
    description: "Nghĩa tiếng Việt chính xác, cô đọng.",
  },
  koreanDefinition: {
    type: Type.STRING,
    description:
      "Định nghĩa giải thích nghĩa của từ bằng tiếng Hàn chuẩn (한국어 사전적 의미).",
  },
  vietnameseExplanation: {
    type: Type.STRING,
    description:
      "Giải thích chi tiết bằng tiếng Việt về sắc thái ngữ cảnh, cách dùng trong đời sống Hàn Quốc và lưu ý khi sử dụng.",
  },
  synonyms: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
  },
  antonyms: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
  },
  collocations: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        korean: { type: Type.STRING },
        vietnamese: { type: Type.STRING },
      },
      required: ["korean", "vietnamese"],
    },
  },
  examples: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        register: { type: Type.STRING },
        contextSituation: { type: Type.STRING },
        koreanSentence: { type: Type.STRING },
        highlightedForm: { type: Type.STRING },
        romanization: { type: Type.STRING },
        koreanMeaning: { type: Type.STRING },
        vietnameseMeaning: { type: Type.STRING },
        grammarAndNuanceNote: { type: Type.STRING },
        wordBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              korean: { type: Type.STRING },
              vietnamese: { type: Type.STRING },
              role: { type: Type.STRING },
            },
            required: ["korean", "vietnamese", "role"],
          },
        },
      },
      required: [
        "id",
        "register",
        "contextSituation",
        "koreanSentence",
        "highlightedForm",
        "romanization",
        "koreanMeaning",
        "vietnameseMeaning",
        "grammarAndNuanceNote",
        "wordBreakdown",
      ],
    },
  },
};

const VOCABULARY_ENTRY_REQUIRED = [
  "koreanWord",
  "romanization",
  "vietnamesePronunciation",
  "partOfSpeech",
  "topikLevel",
  "hanjaOrigin",
  "vietnameseMeaning",
  "koreanDefinition",
  "vietnameseExplanation",
  "synonyms",
  "antonyms",
  "collocations",
  "examples",
];

/**
 * 1. Phân tích từ vựng tiếng Hàn (hoặc tiếng Việt) và tạo 2 câu ví dụ song ngữ Hàn - Việt
 */
export async function analyzeVocabularyWithAI(
  word: string,
  contextStyle: ContextStyle = "daily"
): Promise<Omit<VocabularyEntry, "id" | "createdAt">> {
  const trimmedWord = word.trim();

  return callBackendWithDirectFallback<Omit<VocabularyEntry, "id" | "createdAt">>(
    "/api/vocabulary/analyze",
    { word: trimmedWord, contextStyle },
    async () => {
      const stylePrompts: Record<ContextStyle, string> = {
        daily:
          "Example 1 in polite informal daily conversation (해요체) and Example 2 in polite formal or expressive everyday storytelling (합쇼체/해요체).",
        topik:
          "Example 1 for TOPIK I/II reading comprehension context and Example 2 for TOPIK II academic/essay or formal interview context (합쇼체/해라체).",
        business:
          "Example 1 in polite office/workplace conversation (해요체) and Example 2 in formal business email, meeting, or presentation (합쇼체).",
        culture:
          "Example 1 in K-Drama / emotional daily life dialogue and Example 2 in cultural reflection or travel situation in Korea.",
      };

      const selectedStyleGuide =
        stylePrompts[contextStyle] || stylePrompts.daily;

      return generateDirectStructuredJson<
        Omit<VocabularyEntry, "id" | "createdAt">
      >({
        contents: `Phân tích chuyên sâu từ vựng tiếng Hàn cho người Việt học tiếng Hàn.
Từ đầu vào của người dùng: "${trimmedWord}" (Nếu người dùng nhập tiếng Việt, hãy dịch sang từ vựng tiếng Hàn chuẩn xác và phổ biến nhất tương ứng rồi phân tích từ tiếng Hàn đó; nếu người dùng nhập từ tiếng Hàn đã chia đuôi, hãy đưa về dạng nguyên mẫu từ điển ở trường koreanWord).

Yêu cầu BẮT BUỘC:
1. Giải thích rõ nghĩa tiếng Việt (vietnameseMeaning), định nghĩa bằng tiếng Hàn dễ hiểu (koreanDefinition), âm Hán Việt / nguồn gốc từ (hanjaOrigin), cách phát âm Latinh & bồi âm tiếng Việt dễ đọc.
2. Tạo ĐÚNG 2 câu ví dụ (examples) thực tế, tự nhiên, chuẩn ngữ pháp người bản xứ Hàn Quốc theo định hướng: ${selectedStyleGuide}
3. Trong MỖI câu ví dụ (cả câu 1 và câu 2), bắt buộc phải có đầy đủ:
   - koreanSentence: Câu ví dụ bằng tiếng Hàn có chứa từ vựng đó.
   - highlightedForm: Dạng của từ vựng xuất hiện trực tiếp trong câu koreanSentence (để tô sáng trên giao diện).
   - romanization: Phiên âm Latinh của cả câu.
   - koreanMeaning: Giải nghĩa / diễn giải ý nghĩa của cả câu ví dụ này bằng tiếng Hàn dễ hiểu (한국어 의미 풀이).
   - vietnameseMeaning: Dịch nghĩa tiếng Việt tự nhiên, chuẩn xác của cả câu ví dụ (Nghĩa tiếng Việt).
   - grammarAndNuanceNote: Giải thích ngắn gọn ngữ pháp và sắc thái dùng từ trong câu bằng tiếng Việt.
   - wordBreakdown: Phân tách từng cụm từ/thành phần trong câu (korean, vietnamese, role).`,
        systemInstruction:
          "Bạn là chuyên gia ngôn ngữ học Hàn - Việt (Korean-Vietnamese Lexicographer & TOPIK Instructor). Hãy trả về JSON chính xác theo schema, ngôn từ sư phạm, rõ ràng, chuẩn xác cho người Việt học tiếng Hàn.",
        responseSchema: {
          type: Type.OBJECT,
          properties: VOCABULARY_ENTRY_PROPERTIES,
          required: VOCABULARY_ENTRY_REQUIRED,
        },
      });
    }
  );
}

/**
 * 2. Kiểm tra ngữ pháp và độ tự nhiên của câu tiếng Hàn do người học tự đặt
 */
export async function checkSentenceWithAI(
  targetWord: string,
  userSentence: string
): Promise<SentenceCheckResult> {
  const trimmedTarget = targetWord.trim();
  const trimmedSentence = userSentence.trim();

  return callBackendWithDirectFallback<SentenceCheckResult>(
    "/api/vocabulary/check-sentence",
    { targetWord: trimmedTarget, userSentence: trimmedSentence },
    async () =>
      generateDirectStructuredJson<SentenceCheckResult>({
        contents: `Người học đang luyện đặt câu với từ vựng tiếng Hàn "${trimmedTarget}".
Câu của người học: "${trimmedSentence}"

Hãy đánh giá câu này về ngữ pháp, cách chia đuôi từ, tiểu từ và độ tự nhiên, sau đó trả về kết quả JSON theo schema.`,
        systemInstruction:
          "Bạn là giáo viên bản ngữ tiếng Hàn tận tâm hướng dẫn học viên người Việt. Hãy nhận xét chi tiết, khích lệ và đưa ra câu sửa tự nhiên nhất.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isNatural: { type: Type.BOOLEAN },
            correctedKorean: { type: Type.STRING },
            koreanExplanation: { type: Type.STRING },
            vietnameseTranslation: { type: Type.STRING },
            feedbackVietnamese: { type: Type.STRING },
          },
          required: [
            "isNatural",
            "correctedKorean",
            "koreanExplanation",
            "vietnameseTranslation",
            "feedbackVietnamese",
          ],
        },
      })
  );
}

/**
 * 3. Giải thích chuyên sâu & tạo mẹo ghi nhớ nhanh cho thẻ từ vựng trong trò chơi ghép thẻ
 */
export async function explainCardWithAI(
  koreanWord: string,
  vietnameseMeaning: string
): Promise<CardDeepExplanation> {
  const trimmedWord = koreanWord.trim();
  const trimmedMeaning = vietnameseMeaning.trim();

  return callBackendWithDirectFallback<CardDeepExplanation>(
    "/api/vocabulary/explain-card",
    { koreanWord: trimmedWord, vietnameseMeaning: trimmedMeaning },
    async () =>
      generateDirectStructuredJson<CardDeepExplanation>({
        contents: `Giải thích chuyên sâu và tạo mẹo ghi nhớ siêu tốc cho từ vựng tiếng Hàn "${trimmedWord}" (nghĩa tiếng Việt: "${trimmedMeaning}").
Hãy cung cấp:
1. memoryTipVietnamese: Mẹo ghi nhớ nhanh bằng âm Hán Việt hoặc liên tưởng âm thanh/hình ảnh thú vị cho người Việt.
2. usageComparisonVietnamese: Phân biệt ngắn gọn từ này với 1 từ dễ nhầm lẫn trong tiếng Hàn.
3. miniDialogueKorean: Hội thoại ngắn 2 câu (A và B) cực tự nhiên có dùng từ này.
4. miniDialogueVietnamese: Dịch nghĩa tiếng Việt của đoạn hội thoại ngắn đó.`,
        systemInstruction:
          "Bạn là giảng viên tiếng Hàn truyền cảm hứng cho học viên người Việt. Hãy giải thích ngắn gọn, dễ nhớ, súc tích.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            koreanWord: { type: Type.STRING },
            memoryTipVietnamese: { type: Type.STRING },
            usageComparisonVietnamese: { type: Type.STRING },
            miniDialogueKorean: { type: Type.STRING },
            miniDialogueVietnamese: { type: Type.STRING },
          },
          required: [
            "koreanWord",
            "memoryTipVietnamese",
            "usageComparisonVietnamese",
            "miniDialogueKorean",
            "miniDialogueVietnamese",
          ],
        },
      })
  );
}

/**
 * 4. Tạo nhanh bộ từ vựng Hàn - Việt (tối đa 5-10 từ) theo chủ đề bằng Gemini AI để luyện ghép thẻ
 */
export async function generateTopicDeckWithAI(
  topic: string,
  count: number = 5
): Promise<{ words: Omit<VocabularyEntry, "id" | "createdAt">[] }> {
  const trimmedTopic = topic.trim();
  const safeCount = Math.min(Math.max(Number(count) || 5, 2), 8);

  return callBackendWithDirectFallback<{
    words: Omit<VocabularyEntry, "id" | "createdAt">[];
  }>(
    "/api/vocabulary/generate-deck",
    { topic: trimmedTopic, count: safeCount },
    async () =>
      generateDirectStructuredJson<{
        words: Omit<VocabularyEntry, "id" | "createdAt">[];
      }>({
        contents: `Hãy tạo danh sách gồm ĐÚNG ${safeCount} từ vựng tiếng Hàn thiết thực nhất thuộc chủ đề: "${trimmedTopic}" dành cho người Việt học tiếng Hàn.
Mỗi từ vựng phải có đầy đủ: koreanWord, romanization, vietnamesePronunciation, partOfSpeech, topikLevel, hanjaOrigin, vietnameseMeaning, koreanDefinition, vietnameseExplanation, synonyms, antonyms, collocations, và ĐÚNG 2 câu ví dụ (examples) có koreanSentence, highlightedForm, romanization, koreanMeaning, vietnameseMeaning, grammarAndNuanceNote, wordBreakdown.`,
        systemInstruction:
          "Bạn là chuyên gia biên soạn giáo trình từ vựng Hàn - Việt. Hãy trả về JSON đúng theo schema.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: VOCABULARY_ENTRY_PROPERTIES,
                required: VOCABULARY_ENTRY_REQUIRED,
              },
            },
          },
          required: ["words"],
        },
      })
  );
}

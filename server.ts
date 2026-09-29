import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveGeminiApiKey(): string {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    "";
  const cleaned = rawKey.replace(/^["']+|["']+$/g, "").trim();
  if (cleaned && cleaned !== "MY_GEMINI_API_KEY") {
    return cleaned;
  }

  // Fallback: scan process.env for any Google Gemini key (starts with AIza)
  for (const val of Object.values(process.env)) {
    if (typeof val === "string") {
      const candidate = val.replace(/^["']+|["']+$/g, "").trim();
      if (/^AIza[A-Za-z0-9_-]{25,}$/.test(candidate)) {
        return candidate;
      }
    }
  }

  return "";
}

function getAiClient() {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "Chưa cấu hình GEMINI_API_KEY hợp lệ trên máy chủ. Hãy thêm biến môi trường GEMINI_API_KEY trong phần Environment Variables trên Coolify rồi Redeploy."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Track model cooldowns if a model temporarily returns 503 / 429 high demand
const modelCooldownUntil = new Map<string, number>();

const TEXT_MODELS_FALLBACK_ORDER = [
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

function cleanJsonString(raw: string): string {
  let cleaned = String(raw || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

async function generateStructuredJson(params: {
  contents: string;
  systemInstruction: string;
  responseSchema: Record<string, unknown>;
}) {
  const ai = getAiClient();
  const now = Date.now();

  // Sort models so any model currently in 503 cooldown is tried last
  const orderedModels = [...TEXT_MODELS_FALLBACK_ORDER].sort((a, b) => {
    const aCooling = (modelCooldownUntil.get(a) || 0) > now ? 1 : 0;
    const bCooling = (modelCooldownUntil.get(b) || 0) > now ? 1 : 0;
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

      const parsed = JSON.parse(cleanJsonString(text));
      // Clear cooldown on success
      modelCooldownUntil.delete(modelName);
      return parsed;
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Gemini Fallback] Model ${modelName} failed (${errMsg}). Trying next fallback model...`
      );
      // Put this model on a 90-second cooldown if overloaded / unavailable
      modelCooldownUntil.set(modelName, Date.now() + 90_000);
    }
  }

  throw lastError || new Error("Tất cả các mô hình Gemini hiện đang bận.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.disable("x-powered-by");
  app.use(express.json({ limit: "2mb" }));

  // Coolify & Container Healthcheck Endpoints
  app.get(["/api/health", "/health"], (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "hanviet-lexicon",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(resolveGeminiApiKey()),
    });
  });

  // Runtime environment fallback endpoint for hybrid Coolify deployments
  app.get("/api/runtime-env", (_req, res) => {
    const key = resolveGeminiApiKey();
    res.status(200).json({
      geminiConfigured: Boolean(key && key !== "MY_GEMINI_API_KEY"),
      geminiApiKey: key && key !== "MY_GEMINI_API_KEY" ? key : "",
    });
  });

  // 1. Endpoint: Analyze Korean vocabulary & generate 2 bilingual Korean-Vietnamese example sentences
  app.post(["/api/vocabulary/analyze", "/vocabulary/analyze"], async (req, res) => {
    try {
      const { word, contextStyle = "daily" } = req.body || {};
      if (!word || typeof word !== "string" || !word.trim()) {
        return res.status(400).json({
          error: "Vui lòng nhập một từ vựng tiếng Hàn (hoặc tiếng Việt) để phân tích.",
        });
      }

      const trimmedWord = word.trim();

      const stylePrompts = {
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
        contextStyle === "topik"
          ? stylePrompts.topik
          : contextStyle === "business"
            ? stylePrompts.business
            : contextStyle === "culture"
              ? stylePrompts.culture
              : stylePrompts.daily;

      const parsed = await generateStructuredJson({
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
          properties: {
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
              description: "Cấp độ TOPIK ước lượng (ví dụ: TOPIK I · Sơ cấp 2 hoặc TOPIK II · Trung cấp 3).",
            },
            hanjaOrigin: {
              type: Type.STRING,
              description: "Chữ Hán và Âm Hán Việt nếu là từ Hán Hàn, hoặc ghi '순우리말 · Từ thuần Hàn' nếu là từ thuần Hàn.",
            },
            vietnameseMeaning: {
              type: Type.STRING,
              description: "Nghĩa tiếng Việt chính xác, cô đọng.",
            },
            koreanDefinition: {
              type: Type.STRING,
              description: "Định nghĩa giải thích nghĩa của từ bằng tiếng Hàn chuẩn (한국어 사전적 의미).",
            },
            vietnameseExplanation: {
              type: Type.STRING,
              description: "Giải thích chi tiết bằng tiếng Việt về sắc thái ngữ cảnh, cách dùng trong đời sống Hàn Quốc và lưu ý khi sử dụng.",
            },
            synonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 từ đồng nghĩa hoặc gần nghĩa trong tiếng Hàn kèm nghĩa Việt ngắn gọn.",
            },
            antonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-2 từ trái nghĩa trong tiếng Hàn kèm nghĩa Việt ngắn gọn.",
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
              description: "3 cụm từ kết hợp phổ biến (Collocations) với từ này.",
            },
            examples: {
              type: Type.ARRAY,
              description: "Chính xác 2 câu ví dụ song ngữ kèm giải nghĩa tiếng Hàn và tiếng Việt.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  register: {
                    type: Type.STRING,
                    description: "Cấp độ kính ngữ / văn phong (ví dụ: 해요체 · Giao tiếp lịch sự).",
                  },
                  contextSituation: {
                    type: Type.STRING,
                    description: "Bối cảnh sử dụng câu ví dụ (song ngữ Hàn · Việt).",
                  },
                  koreanSentence: {
                    type: Type.STRING,
                    description: "Câu ví dụ tiếng Hàn hoàn chỉnh, tự nhiên.",
                  },
                  highlightedForm: {
                    type: Type.STRING,
                    description: "Từ hoặc cụm từ mục tiêu đúng như dạng đã chia trong koreanSentence.",
                  },
                  romanization: {
                    type: Type.STRING,
                    description: "Phiên âm Latinh của câu ví dụ.",
                  },
                  koreanMeaning: {
                    type: Type.STRING,
                    description: "Giải nghĩa câu ví dụ bằng tiếng Hàn dễ hiểu (한국어 의미 풀이).",
                  },
                  vietnameseMeaning: {
                    type: Type.STRING,
                    description: "Nghĩa dịch sang tiếng Việt tự nhiên, sát nghĩa.",
                  },
                  grammarAndNuanceNote: {
                    type: Type.STRING,
                    description: "Điểm ngữ pháp và sắc thái từ vựng đáng chú ý trong câu.",
                  },
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
          },
          required: [
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
          ],
        },
      });

      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/vocabulary/analyze:", error);
      return res.status(500).json({
        error:
          "Máy chủ Gemini AI hiện đang quá tải tạm thời. Hệ thống đã thử chuyển đổi mô hình dự phòng nhưng chưa phản hồi kịp, vui lòng bấm 'Thử lại' sau vài giây.",
      });
    }
  });

  // 2. Endpoint: Evaluate learner's practice sentence with the target Korean word
  app.post(["/api/vocabulary/check-sentence", "/vocabulary/check-sentence"], async (req, res) => {
    try {
      const { targetWord, userSentence } = req.body || {};
      if (!targetWord || !userSentence || !userSentence.trim()) {
        return res.status(400).json({
          error: "Vui lòng nhập câu tiếng Hàn bạn muốn kiểm tra.",
        });
      }

      const parsed = await generateStructuredJson({
        contents: `Người học đang luyện đặt câu với từ vựng tiếng Hàn "${targetWord}".
Câu của người học: "${userSentence.trim()}"

Hãy đánh giá câu này về ngữ pháp, cách chia đuôi từ, tiểu từ và độ tự nhiên, sau đó trả về kết quả JSON theo schema.`,
        systemInstruction:
          "Bạn là giáo viên bản ngữ tiếng Hàn tận tâm hướng dẫn học viên người Việt. Hãy nhận xét chi tiết, khích lệ và đưa ra câu sửa tự nhiên nhất.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isNatural: {
              type: Type.BOOLEAN,
              description: "True nếu câu đúng ngữ pháp và tự nhiên.",
            },
            correctedKorean: {
              type: Type.STRING,
              description: "Câu tiếng Hàn đã được chỉnh sửa hoàn chỉnh, tự nhiên nhất.",
            },
            koreanExplanation: {
              type: Type.STRING,
              description: "Giải thích ý nghĩa câu đã sửa bằng tiếng Hàn.",
            },
            vietnameseTranslation: {
              type: Type.STRING,
              description: "Nghĩa tiếng Việt của câu đã chỉnh sửa.",
            },
            feedbackVietnamese: {
              type: Type.STRING,
              description: "Nhận xét chi tiết bằng tiếng Việt về tiểu từ, cách chia động/tính từ và độ tự nhiên.",
            },
          },
          required: [
            "isNatural",
            "correctedKorean",
            "koreanExplanation",
            "vietnameseTranslation",
            "feedbackVietnamese",
          ],
        },
      });

      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/vocabulary/check-sentence:", error);
      return res.status(500).json({
        error: "Không thể kiểm tra câu lúc này do máy chủ AI đang bận. Vui lòng thử lại.",
      });
    }
  });

  // 3. Endpoint: Korean Speech Synthesis using Gemini TTS (gemini-3.8-flash-lite-tts)
  app.post(["/api/vocabulary/tts", "/vocabulary/tts"], async (req, res) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Thiếu văn bản cần đọc." });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: "Clear, natural standard Seoul Korean pronunciation for language learners",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

      if (!base64Audio) {
        return res.status(502).json({ error: "Không thể tạo âm thanh từ Gemini TTS." });
      }

      return res.json({ audioBase64: base64Audio, mimeType });
    } catch (error) {
      console.error("Error in /api/vocabulary/tts:", error);
      const message =
        error instanceof Error ? error.message : "Lỗi khi tạo giọng đọc tiếng Hàn.";
      return res.status(500).json({ error: message });
    }
  });

  // 4. Endpoint: Deep AI explanation & memory tip for a selected card in the 10-word Elimination Game
  app.post(["/api/vocabulary/explain-card", "/vocabulary/explain-card"], async (req, res) => {
    try {
      const { koreanWord, vietnameseMeaning = "" } = req.body || {};
      if (!koreanWord || typeof koreanWord !== "string" || !koreanWord.trim()) {
        return res.status(400).json({ error: "Thiếu từ tiếng Hàn cần giải thích." });
      }

      const parsed = await generateStructuredJson({
        contents: `Giải thích chuyên sâu và tạo mẹo ghi nhớ siêu tốc cho từ vựng tiếng Hàn "${koreanWord.trim()}" (nghĩa tiếng Việt: "${vietnameseMeaning}").
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
      });

      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/vocabulary/explain-card:", error);
      const msg =
        error instanceof Error ? error.message : "Không thể tải giải thích AI lúc này.";
      return res.status(500).json({ error: msg });
    }
  });

  // 5. Endpoint: Generate a thematic deck of Korean-Vietnamese vocabulary words (up to 5-10 words) via Gemini AI
  app.post(["/api/vocabulary/generate-deck", "/vocabulary/generate-deck"], async (req, res) => {
    try {
      const { topic, count = 5 } = req.body || {};
      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "Vui lòng nhập chủ đề từ vựng cần tạo." });
      }

      const safeCount = Math.min(Math.max(Number(count) || 5, 2), 8);

      const parsed = await generateStructuredJson({
        contents: `Hãy tạo danh sách gồm ĐÚNG ${safeCount} từ vựng tiếng Hàn thiết thực nhất thuộc chủ đề: "${topic.trim()}" dành cho người Việt học tiếng Hàn.
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
                properties: {
                  koreanWord: { type: Type.STRING },
                  romanization: { type: Type.STRING },
                  vietnamesePronunciation: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  topikLevel: { type: Type.STRING },
                  hanjaOrigin: { type: Type.STRING },
                  vietnameseMeaning: { type: Type.STRING },
                  koreanDefinition: { type: Type.STRING },
                  vietnameseExplanation: { type: Type.STRING },
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
                },
                required: [
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
                ],
              },
            },
          },
          required: ["words"],
        },
      });

      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/vocabulary/generate-deck:", error);
      const msg =
        error instanceof Error ? error.message : "Không thể tạo bộ từ vựng với Gemini AI.";
      return res.status(500).json({ error: msg });
    }
  });

  // Ensure any unmatched /api/* route always returns valid JSON (never HTML 404)
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: `Không tìm thấy API endpoint: ${req.method} ${req.originalUrl}`,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        index: false,
      })
    );
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`HanViet Lexicon Server running on http://${HOST}:${PORT}`);
  });

  // In production container environments (Coolify / Nixpacks), also listen on
  // fallback port 80 or 3000 if PORT was set differently by a Caddy/Static preset.
  if (process.env.NODE_ENV === "production") {
    const extraPorts = [3000, 80].filter((p) => p !== PORT);
    for (const extraPort of extraPorts) {
      try {
        const extraServer = app.listen(extraPort, HOST, () => {
          console.log(
            `HanViet Lexicon Server also listening on fallback http://${HOST}:${extraPort}`
          );
        });
        extraServer.on("error", () => {
          // Ignore if port is privileged or already bound
        });
      } catch {
        // Ignore fallback port binding errors
      }
    }
  }

  // Graceful shutdown for Coolify / Docker rolling deployments
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();

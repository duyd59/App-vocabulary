import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. Endpoint: Analyze Korean vocabulary & generate 2 bilingual Korean-Vietnamese example sentences
  app.post("/api/vocabulary/analyze", async (req, res) => {
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

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
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
        config: {
          systemInstruction:
            "Bạn là chuyên gia ngôn ngữ học Hàn - Việt (Korean-Vietnamese Lexicographer & TOPIK Instructor). Hãy trả về JSON chính xác theo schema, ngôn từ sư phạm, rõ ràng, chuẩn xác cho người Việt học tiếng Hàn.",
          responseMimeType: "application/json",
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
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(502).json({
          error: "Không nhận được phản hồi từ Gemini AI. Vui lòng thử lại.",
        });
      }

      const parsed = JSON.parse(text.trim());
      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/vocabulary/analyze:", error);
      const message =
        error instanceof Error ? error.message : "Lỗi máy chủ khi gọi Gemini AI.";
      return res.status(500).json({ error: message });
    }
  });

  // 2. Endpoint: Evaluate learner's practice sentence with the target Korean word
  app.post("/api/vocabulary/check-sentence", async (req, res) => {
    try {
      const { targetWord, userSentence } = req.body || {};
      if (!targetWord || !userSentence || !userSentence.trim()) {
        return res.status(400).json({
          error: "Vui lòng nhập câu tiếng Hàn bạn muốn kiểm tra.",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Người học đang luyện đặt câu với từ vựng tiếng Hàn "${targetWord}".
Câu của người học: "${userSentence.trim()}"

Hãy đánh giá câu này về ngữ pháp, cách chia đuôi từ, tiểu từ và độ tự nhiên, sau đó trả về kết quả JSON theo schema.`,
        config: {
          systemInstruction:
            "Bạn là giáo viên bản ngữ tiếng Hàn tận tâm hướng dẫn học viên người Việt. Hãy nhận xét chi tiết, khích lệ và đưa ra câu sửa tự nhiên nhất.",
          responseMimeType: "application/json",
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
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(502).json({ error: "Không nhận được phản hồi từ Gemini AI." });
      }
      return res.json(JSON.parse(text.trim()));
    } catch (error) {
      console.error("Error in /api/vocabulary/check-sentence:", error);
      const message =
        error instanceof Error ? error.message : "Lỗi khi kiểm tra câu với Gemini AI.";
      return res.status(500).json({ error: message });
    }
  });

  // 3. Endpoint: Korean Speech Synthesis using Gemini TTS (gemini-3.8-flash-lite-tts)
  app.post("/api/vocabulary/tts", async (req, res) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Thiếu văn bản cần đọc." });
      }

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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HanViet Lexicon Server running on http://localhost:${PORT}`);
  });
}

startServer();

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

async function fetchJsonWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = 1
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Máy chủ trả về định dạng không phải JSON (HTTP ${response.status}). Hãy đảm bảo biến GEMINI_API_KEY đã được cấu hình trên server.`
        );
      }

      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(
          data?.error || `Yêu cầu thất bại với mã trạng thái ${response.status}.`
        );
      }

      return data as T;
    } catch (err) {
      lastError =
        err instanceof Error
          ? err
          : new Error("Lỗi kết nối tới máy chủ Gemini AI.");
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  throw lastError || new Error("Không thể kết nối tới máy chủ Gemini AI.");
}

/**
 * 1. Phân tích từ vựng tiếng Hàn (hoặc tiếng Việt) và tạo 2 câu ví dụ song ngữ Hàn - Việt
 */
export async function analyzeVocabularyWithAI(
  word: string,
  contextStyle: ContextStyle = "daily"
): Promise<Omit<VocabularyEntry, "id" | "createdAt">> {
  return fetchJsonWithRetry<Omit<VocabularyEntry, "id" | "createdAt">>(
    "/api/vocabulary/analyze",
    {
      method: "POST",
      body: JSON.stringify({ word: word.trim(), contextStyle }),
    },
    1
  );
}

/**
 * 2. Kiểm tra ngữ pháp và độ tự nhiên của câu tiếng Hàn do người học tự đặt
 */
export async function checkSentenceWithAI(
  targetWord: string,
  userSentence: string
): Promise<SentenceCheckResult> {
  return fetchJsonWithRetry<SentenceCheckResult>(
    "/api/vocabulary/check-sentence",
    {
      method: "POST",
      body: JSON.stringify({
        targetWord: targetWord.trim(),
        userSentence: userSentence.trim(),
      }),
    },
    1
  );
}

/**
 * 3. Giải thích chuyên sâu & tạo mẹo ghi nhớ nhanh cho thẻ từ vựng trong trò chơi ghép thẻ
 */
export async function explainCardWithAI(
  koreanWord: string,
  vietnameseMeaning: string
): Promise<CardDeepExplanation> {
  return fetchJsonWithRetry<CardDeepExplanation>(
    "/api/vocabulary/explain-card",
    {
      method: "POST",
      body: JSON.stringify({
        koreanWord: koreanWord.trim(),
        vietnameseMeaning: vietnameseMeaning.trim(),
      }),
    },
    1
  );
}

/**
 * 4. Tạo nhanh bộ từ vựng Hàn - Việt (tối đa 5-10 từ) theo chủ đề bằng Gemini AI để luyện ghép thẻ
 */
export async function generateTopicDeckWithAI(
  topic: string,
  count: number = 5
): Promise<{ words: Omit<VocabularyEntry, "id" | "createdAt">[] }> {
  return fetchJsonWithRetry<{
    words: Omit<VocabularyEntry, "id" | "createdAt">[];
  }>(
    "/api/vocabulary/generate-deck",
    {
      method: "POST",
      body: JSON.stringify({ topic: topic.trim(), count }),
    },
    1
  );
}

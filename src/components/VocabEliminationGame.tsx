import React, { useState, useEffect } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { VocabularyEntry } from "../types/vocabulary";
import { playKoreanAudio } from "../utils/audioPlayer";
import {
  CardDeepExplanation,
  explainCardWithAI,
} from "../services/geminiClient";

interface VocabEliminationGameProps {
  selectedWords: VocabularyEntry[];
  onExitToNotebook: () => void;
  onInspectInWorkspace: (entry: VocabularyEntry) => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const VocabEliminationGame: React.FC<VocabEliminationGameProps> = ({
  selectedWords,
  onExitToNotebook,
  onInspectInWorkspace,
}) => {
  // Remaining Korean cards on the board
  const [remainingCards, setRemainingCards] = useState<VocabularyEntry[]>([]);
  // Current target word whose Vietnamese meaning is shown
  const [targetWord, setTargetWord] = useState<VocabularyEntry | null>(null);
  // The Korean card most recently clicked by the user (to display its full explanation)
  const [inspectedCard, setInspectedCard] = useState<VocabularyEntry | null>(
    null
  );
  const [lastClickStatus, setLastClickStatus] = useState<
    "idle" | "correct" | "wrong"
  >("idle");
  const [wrongCardId, setWrongCardId] = useState<string | null>(null);
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [clearedHistory, setClearedHistory] = useState<VocabularyEntry[]>([]);
  const [aiExplanations, setAiExplanations] = useState<
    Record<string, CardDeepExplanation>
  >({});
  const [isLoadingAiExplain, setIsLoadingAiExplain] = useState(false);
  const [aiExplainError, setAiExplainError] = useState<string | null>(null);

  const handleFetchAiDeepExplain = async (card: VocabularyEntry) => {
    if (aiExplanations[card.koreanWord] || isLoadingAiExplain) return;
    setIsLoadingAiExplain(true);
    setAiExplainError(null);
    try {
      const result = await explainCardWithAI(
        card.koreanWord,
        card.vietnameseMeaning
      );
      setAiExplanations((prev) => ({
        ...prev,
        [card.koreanWord]: result,
      }));
    } catch (err) {
      setAiExplainError(
        err instanceof Error
          ? err.message
          : "Không thể gọi Gemini AI giải thích lúc này."
      );
    } finally {
      setIsLoadingAiExplain(false);
    }
  };

  const startNewGame = (words: VocabularyEntry[]) => {
    const capped = words.slice(0, 10);
    const shuffledCards = shuffleArray(capped);
    setRemainingCards(shuffledCards);
    if (shuffledCards.length > 0) {
      const randomTarget =
        shuffledCards[Math.floor(Math.random() * shuffledCards.length)];
      setTargetWord(randomTarget);
    } else {
      setTargetWord(null);
    }
    setInspectedCard(null);
    setLastClickStatus("idle");
    setWrongCardId(null);
    setRemovingCardId(null);
    setAttemptsCount(0);
    setCorrectCount(0);
    setClearedHistory([]);
  };

  useEffect(() => {
    startNewGame(selectedWords);
  }, [selectedWords]);

  const handleSelectKoreanCard = (card: VocabularyEntry) => {
    if (!targetWord || removingCardId) return;

    // Always explain the clicked Korean word and play its pronunciation
    setInspectedCard(card);
    playKoreanAudio(card.koreanWord, false);
    setAttemptsCount((prev) => prev + 1);

    if (card.id === targetWord.id) {
      // Correct match! Explain it and remove that card from the board
      setLastClickStatus("correct");
      setWrongCardId(null);
      setRemovingCardId(card.id);
      setCorrectCount((prev) => prev + 1);
      setClearedHistory((prev) => [card, ...prev]);

      setTimeout(() => {
        setRemainingCards((prev) => {
          const nextRemaining = prev.filter((item) => item.id !== card.id);
          if (nextRemaining.length > 0) {
            const nextTarget =
              nextRemaining[Math.floor(Math.random() * nextRemaining.length)];
            setTargetWord(nextTarget);
          } else {
            setTargetWord(null);
          }
          return nextRemaining;
        });
        setRemovingCardId(null);
      }, 450);
    } else {
      // Wrong match! Show the explanation of the clicked card so the user learns what it means
      setLastClickStatus("wrong");
      setWrongCardId(card.id);
    }
  };

  const totalInitial = Math.min(selectedWords.length, 10);
  const isFinished = totalInitial > 0 && remainingCards.length === 0;
  const accuracy =
    attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Control Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToNotebook}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chọn lại từ trong Sổ từ vựng</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 font-display">
              Trò Chơi Ghép &amp; Xóa Thẻ Từ Vựng Hàn - Việt
            </h2>
            <p className="text-xs text-slate-500">
              Chọn thẻ tiếng Hàn khớp với nghĩa tiếng Việt để xem giải thích và xóa thẻ khỏi bàn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <span className="text-slate-600">
            Còn lại:{" "}
            <strong className="text-slate-900">{remainingCards.length}</strong> /{" "}
            {totalInitial} thẻ
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700 font-semibold">
            Đã xóa: {clearedHistory.length} thẻ
          </span>
          <button
            type="button"
            onClick={() => startNewGame(selectedWords)}
            className="px-3 py-1.5 text-xs font-sans font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* When all cards have been matched and deleted */}
      {isFinished ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 font-display">
              Hoàn Thành! Đã Xóa Hết {totalInitial} Thẻ Từ Vựng
            </h3>
            <p className="text-sm text-slate-600">
              Bạn đã ghép đúng và xóa toàn bộ các thẻ tiếng Hàn tương ứng với nghĩa tiếng Việt.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-600 pt-1 tabular-nums">
              <span>Tổng số thẻ đã xóa: {totalInitial}</span>
              <span aria-hidden="true">·</span>
              <span>Số lần chọn: {attemptsCount}</span>
              <span aria-hidden="true">·</span>
              <span>Độ chính xác: {accuracy}%</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => startNewGame(selectedWords)}
                className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại {totalInitial} từ này</span>
              </button>
              <button
                type="button"
                onClick={onExitToNotebook}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Chọn bộ từ khác (Tối đa 10 từ)
              </button>
            </div>
          </div>

          {/* Review of all cleared cards and their explanations */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Tổng hợp giải nghĩa các từ vựng vừa hoàn thành:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clearedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-korean-serif font-semibold text-slate-900">
                        {item.koreanWord}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        [{item.romanization} · {item.vietnamesePronunciation}]
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => playKoreanAudio(item.koreanWord, false)}
                      className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe</span>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-[#1D4ED8]">
                    Nghĩa tiếng Việt: {item.vietnameseMeaning}
                  </p>
                  <p className="text-xs font-korean text-slate-700">
                    한국어 의미: {item.koreanDefinition}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.vietnameseExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Two-Zone Game Board */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 columns: Step 1 (Vietnamese Target Prompt) + Step 2 & 3 (Remaining Korean Cards) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Target Vietnamese Word Card */}
            {targetWord && (
              <div className="bg-white border-2 border-[#1D4ED8] rounded-xl p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-semibold text-[#1D4ED8]">
                    BƯỚC 1 · TỪ TIẾNG VIỆT MỤC TIÊU CẦN TÌM
                  </span>
                  <span>
                    {targetWord.partOfSpeech} · {targetWord.topikLevel}
                  </span>
                </div>

                <p className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
                  &ldquo;{targetWord.vietnameseMeaning}&rdquo;
                </p>

                <p className="text-xs text-slate-500">
                  Hãy chọn đúng thẻ từ vựng tiếng Hàn bên dưới có nghĩa tương ứng với câu/từ tiếng Việt này để xóa thẻ đó.
                </p>
              </div>
            )}

            {/* STEP 2 & 3: Remaining Korean Vocabulary Cards Grid */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-semibold text-slate-800">
                  BƯỚC 2 &amp; 3 · CÁC THẺ TỪ VỰNG TIẾNG HÀN CÒN LẠI ({remainingCards.length} THẺ)
                </span>
                <span className="text-xs text-slate-500">
                  Nhấp vào bất kỳ thẻ nào để nghe và xem giải thích nghĩa
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {remainingCards.map((card) => {
                  const isBeingRemoved = removingCardId === card.id;
                  const isWrongSelected = wrongCardId === card.id;
                  const isInspected = inspectedCard?.id === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectKoreanCard(card)}
                      disabled={Boolean(removingCardId)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[112px] cursor-pointer ${
                        isBeingRemoved
                          ? "bg-emerald-50 border-emerald-500 scale-95 opacity-20"
                          : isWrongSelected
                            ? "bg-red-50/70 border-red-400"
                            : isInspected
                              ? "bg-blue-50/60 border-[#1D4ED8]"
                              : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-[#1D4ED8]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="text-2xl font-korean-serif font-semibold text-slate-900">
                          {card.koreanWord}
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 w-full flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono truncate">
                          [{card.romanization}]
                        </span>
                        <span>{card.partOfSpeech.split("·")[0].trim()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 columns: Real-time Explanation Panel for whichever Korean card the user clicks */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 sticky top-24">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Giải Thích Nghĩa Thẻ Tiếng Hàn Bạn Vừa Chọn</span>
                </h3>
                {inspectedCard && (
                  <button
                    type="button"
                    onClick={() =>
                      playKoreanAudio(inspectedCard.koreanWord, false)
                    }
                    className="text-xs font-medium text-[#1D4ED8] hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe lại</span>
                  </button>
                )}
              </div>

              {!inspectedCard ? (
                <div className="py-10 text-center space-y-2 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">
                    Chưa có thẻ tiếng Hàn nào được chọn
                  </p>
                  <p className="max-w-xs mx-auto leading-relaxed">
                    Khi bạn bấm vào bất kỳ thẻ tiếng Hàn nào bên trái, hệ thống sẽ giải thích chi tiết nghĩa tiếng Việt, định nghĩa tiếng Hàn, âm Hán Việt và ví dụ của từ đó tại đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Match Status Banner */}
                  {lastClickStatus === "correct" && (
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          Chính xác! Đã xóa thẻ &ldquo;{inspectedCard.koreanWord}&rdquo; khỏi bàn.
                        </p>
                        <p className="text-emerald-800 mt-0.5">
                          Hãy xem nhanh giải nghĩa bên dưới và tiếp tục tìm từ tiếng Việt mới ở Bước 1!
                        </p>
                      </div>
                    </div>
                  )}

                  {lastClickStatus === "wrong" && (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          Thẻ &ldquo;{inspectedCard.koreanWord}&rdquo; chưa khớp với nghĩa tiếng Việt mục tiêu!
                        </p>
                        <p className="text-amber-800 mt-0.5">
                          Dưới đây là giải thích nghĩa của từ &ldquo;{inspectedCard.koreanWord}&rdquo; để bạn ghi nhớ. Hãy chọn thẻ khác cho từ mục tiêu nhé!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full Word Explanation */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="text-2xl font-korean-serif font-semibold text-slate-900">
                        {inspectedCard.koreanWord}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        [{inspectedCard.romanization} · đọc:{" "}
                        {inspectedCard.vietnamesePronunciation}]
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      {inspectedCard.partOfSpeech} · {inspectedCard.topikLevel}{" "}
                      · {inspectedCard.hanjaOrigin}
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                      <p className="text-xs text-slate-400">
                        Nghĩa tiếng Việt:
                      </p>
                      <p className="text-sm font-semibold text-[#1D4ED8]">
                        {inspectedCard.vietnameseMeaning}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">
                        Định nghĩa tiếng Hàn (한국어 의미):
                      </p>
                      <p className="text-xs font-korean font-medium text-slate-800">
                        {inspectedCard.koreanDefinition}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">
                        Giải thích cách dùng:
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {inspectedCard.vietnameseExplanation}
                      </p>
                    </div>

                    {inspectedCard.examples?.[0] && (
                      <div className="pt-2 border-t border-slate-200/70 space-y-1 text-xs">
                        <p className="text-slate-400">Câu ví dụ tiêu biểu:</p>
                        <p className="font-korean font-medium text-slate-900">
                          {inspectedCard.examples[0].koreanSentence}
                        </p>
                        <p className="text-slate-600">
                          → {inspectedCard.examples[0].vietnameseMeaning}
                        </p>
                      </div>
                    )}

                    {/* Live Gemini AI Deep Explanation & Memory Tip */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                      {aiExplanations[inspectedCard.koreanWord] ? (
                        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 space-y-2 text-xs">
                          <p className="font-semibold text-[#1D4ED8] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Gemini AI · Mẹo ghi nhớ &amp; Mở rộng:</span>
                          </p>
                          <p className="text-slate-700 leading-relaxed">
                            <strong>Mẹo nhớ nhanh:</strong>{" "}
                            {
                              aiExplanations[inspectedCard.koreanWord]
                                .memoryTipVietnamese
                            }
                          </p>
                          <p className="text-slate-700 leading-relaxed">
                            <strong>Phân biệt từ:</strong>{" "}
                            {
                              aiExplanations[inspectedCard.koreanWord]
                                .usageComparisonVietnamese
                            }
                          </p>
                          <div className="p-2 bg-white rounded border border-blue-100 space-y-1">
                            <p className="font-korean font-medium text-slate-900">
                              {
                                aiExplanations[inspectedCard.koreanWord]
                                  .miniDialogueKorean
                              }
                            </p>
                            <p className="text-slate-500">
                              {
                                aiExplanations[inspectedCard.koreanWord]
                                  .miniDialogueVietnamese
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            disabled={isLoadingAiExplain}
                            onClick={() =>
                              handleFetchAiDeepExplain(inspectedCard)
                            }
                            className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isLoadingAiExplain ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang kết nối Gemini AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>
                                  Nhờ Gemini AI Tạo Mẹo Nhớ &amp; Hội Thoại Cho &ldquo;{inspectedCard.koreanWord}&rdquo;
                                </span>
                              </>
                            )}
                          </button>
                          {aiExplainError && (
                            <p className="text-[11px] text-red-600">
                              {aiExplainError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onInspectInWorkspace(inspectedCard)}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Mở phân tích 2 câu ví dụ chi tiết</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

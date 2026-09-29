import React, { useState } from "react";
import {
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { VocabularyEntry } from "../types/vocabulary";
import { playKoreanAudio } from "../utils/audioPlayer";

interface FlashcardTrainerProps {
  entries: VocabularyEntry[];
  onUpdateMastery: (id: string, level: "learning" | "reviewing" | "mastered") => void;
  onSelectEntryForWorkspace: (entry: VocabularyEntry) => void;
}

export const FlashcardTrainer: React.FC<FlashcardTrainerProps> = ({
  entries,
  onUpdateMastery,
  onSelectEntryForWorkspace,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [clozeInput, setClozeInput] = useState("");
  const [clozeStatus, setClozeStatus] = useState<"idle" | "correct" | "wrong">("idle");

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
        <p className="text-base font-semibold text-slate-900">
          Chưa có từ vựng nào trong bộ thẻ ôn tập
        </p>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Hãy tra cứu một từ tiếng Hàn bất kỳ trên thanh tìm kiếm để Gemini AI tạo câu ví dụ và tự động thêm vào bộ thẻ học tập.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, entries.length - 1);
  const currentCard = entries[safeIndex];
  const primaryExample = currentCard.examples[0];

  const handleNext = () => {
    setIsFlipped(false);
    setClozeInput("");
    setClozeStatus("idle");
    setCurrentIndex((prev) => (prev + 1) % entries.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setClozeInput("");
    setClozeStatus("idle");
    setCurrentIndex((prev) => (prev - 1 + entries.length) % entries.length);
  };

  const handleCheckCloze = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = clozeInput.trim();
    if (!cleaned) return;
    if (
      cleaned === currentCard.koreanWord ||
      (primaryExample && cleaned === primaryExample.highlightedForm)
    ) {
      setClozeStatus("correct");
    } else {
      setClozeStatus("wrong");
    }
  };

  const renderClozeSentence = () => {
    if (!primaryExample) return null;
    const { koreanSentence, highlightedForm } = primaryExample;
    if (!highlightedForm || !koreanSentence.includes(highlightedForm)) {
      return koreanSentence;
    }
    const parts = koreanSentence.split(highlightedForm);
    return (
      <span>
        {parts[0]}
        <span className="inline-block px-3 py-0.5 mx-1 border-b-2 border-[#1D4ED8] bg-blue-50 text-[#1D4ED8] font-mono text-sm">
          {clozeStatus === "correct" ? highlightedForm : "________"}
        </span>
        {parts.slice(1).join(highlightedForm)}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Ôn tập chủ động · Active Recall & Contextual Cloze
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 font-display">
            Luyện Tập Thẻ Từ & Điền Câu Ngữ Cảnh
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600 tabular-nums">
          <span>
            Thẻ {safeIndex + 1} / {entries.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Đã thuộc: {entries.filter((e) => e.masteryLevel === "mastered").length} từ
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Flashcard Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-8 min-h-[340px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span>{currentCard.partOfSpeech}</span>
                <span aria-hidden="true">·</span>
                <span>{currentCard.topikLevel}</span>
                <span aria-hidden="true">·</span>
                <span>{currentCard.hanjaOrigin}</span>
              </div>
              <button
                type="button"
                onClick={() => playKoreanAudio(currentCard.koreanWord, false)}
                className="flex items-center gap-1.5 text-[#1D4ED8] hover:underline font-medium whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe phát âm</span>
              </button>
            </div>

            {!isFlipped ? (
              <div className="py-10 text-center space-y-4">
                <p className="text-4xl md:text-5xl font-korean-serif font-semibold text-slate-900 tracking-tight">
                  {currentCard.koreanWord}
                </p>
                <p className="text-sm font-mono text-slate-500">
                  [{currentCard.romanization} · {currentCard.vietnamesePronunciation}]
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap"
                  >
                    Lật xem nghĩa & 2 câu ví dụ Hàn - Việt
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Nghĩa tiếng Việt & Định nghĩa Hàn</p>
                  <h2 className="text-xl font-semibold text-[#1D4ED8]">
                    {currentCard.vietnameseMeaning}
                  </h2>
                  <p className="text-sm font-korean text-slate-700 mt-1">
                    {currentCard.koreanDefinition}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-700">
                    2 Câu Ví Dụ Song Ngữ Của Từ &ldquo;{currentCard.koreanWord}&rdquo;:
                  </p>
                  {currentCard.examples.map((ex, idx) => (
                    <div key={ex.id || idx} className="p-3.5 bg-slate-50 rounded-lg space-y-1">
                      <p className="text-sm font-korean font-medium text-slate-900">
                        0{idx + 1}. {ex.koreanSentence}
                      </p>
                      <p className="text-xs font-korean text-slate-600">
                        한국어 의미: {ex.koreanMeaning}
                      </p>
                      <p className="text-xs text-slate-800 font-medium">
                        Nghĩa Việt: {ex.vietnameseMeaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  aria-label="Thẻ trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped((f) => !f)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? "Úp mặt chữ Hàn" : "Lật mặt giải nghĩa"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  aria-label="Thẻ tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mastery status buttons */}
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { key: "learning", label: "Đang học" },
                    { key: "reviewing", label: "Cần ôn lại" },
                    { key: "mastered", label: "Đã thuộc lòng" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onUpdateMastery(currentCard.id, item.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      currentCard.masteryLevel === item.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Cloze Exercise (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1D4ED8]" />
              <span>Bài Tập Điền Từ Vào Câu Ví Dụ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Điền từ nguyên mẫu hoặc dạng đã chia vào chỗ trống dựa theo nghĩa tiếng Việt.
            </p>
          </div>

          {primaryExample && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-base font-korean font-medium text-slate-900 leading-relaxed">
                  {renderClozeSentence()}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Nghĩa tiếng Việt:</strong> {primaryExample.vietnameseMeaning}
                </p>
                <p className="text-xs font-korean text-slate-500">
                  <strong>한국어 의미:</strong> {primaryExample.koreanMeaning}
                </p>
              </div>

              <form onSubmit={handleCheckCloze} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Nhập từ tiếng Hàn còn thiếu:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clozeInput}
                      onChange={(e) => {
                        setClozeInput(e.target.value);
                        setClozeStatus("idle");
                      }}
                      placeholder={`Gợi ý: ${currentCard.koreanWord} hoặc ${primaryExample.highlightedForm}`}
                      className="flex-1 px-3.5 py-2 text-sm font-korean bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap"
                    >
                      Kiểm tra
                    </button>
                  </div>
                </div>

                {clozeStatus === "correct" && (
                  <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Chính xác! Dạng trong câu là &ldquo;{primaryExample.highlightedForm}&rdquo; (gốc từ: {currentCard.koreanWord}).
                    </span>
                  </p>
                )}

                {clozeStatus === "wrong" && (
                  <p className="text-xs font-medium text-red-700">
                    Chưa chính xác. Đáp án đúng là &ldquo;{primaryExample.highlightedForm}&rdquo; (nguyên mẫu: &ldquo;{currentCard.koreanWord}&rdquo;).
                  </p>
                )}
              </form>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setClozeInput(primaryExample.highlightedForm || currentCard.koreanWord);
                    setClozeStatus("correct");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Hiện đáp án
                </button>

                <button
                  type="button"
                  onClick={() => onSelectEntryForWorkspace(currentCard)}
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem phân tích đầy đủ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

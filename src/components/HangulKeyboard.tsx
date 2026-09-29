import React from "react";
import { Delete, CornerDownLeft, X } from "lucide-react";

interface HangulKeyboardProps {
  value: string;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];

const JONGSEONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const COMPOUND_VOWELS: Record<string, string> = {
  "ㅗㅏ": "ㅘ",
  "ㅗㅐ": "ㅙ",
  "ㅗㅣ": "ㅚ",
  "ㅜㅓ": "ㅝ",
  "ㅜㅔ": "ㅞ",
  "ㅜㅣ": "ㅟ",
  "ㅡㅣ": "ㅢ",
};

const COMPOUND_JONGSEONG: Record<string, string> = {
  "ㄱㅅ": "ㄳ",
  "ㄴㅈ": "ㄵ",
  "ㄴㅎ": "ㄶ",
  "ㄹㄱ": "ㄺ",
  "ㄹㅁ": "ㄻ",
  "ㄹㅂ": "ㄼ",
  "ㄹㅅ": "ㄹㅅ",
  "ㄹㅌ": "ㄾ",
  "ㄹㅍ": "ㄿ",
  "ㄹㅎ": "ㅀ",
  "ㅂㅅ": "ㅄ",
};

function isHangulSyllable(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function decomposeSyllable(char: string): { cho: number; jung: number; jong: number } {
  const code = char.charCodeAt(0) - 0xac00;
  const jong = code % 28;
  const jung = ((code - jong) / 28) % 21;
  const cho = Math.floor((code - jong) / 28 / 21);
  return { cho, jung, jong };
}

function composeSyllable(cho: number, jung: number, jong: number = 0): string {
  return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + jong);
}

export function appendHangulJamo(currentText: string, jamo: string): string {
  if (!currentText) return jamo;
  const lastChar = currentText[currentText.length - 1];
  const prefix = currentText.slice(0, -1);

  const isVowel = JUNGSEONG.includes(jamo);
  const isConsonant = CHOSEONG.includes(jamo);

  // Case 1: Last character is a single Choseong consonant and user types a vowel
  if (CHOSEONG.includes(lastChar) && isVowel) {
    const choIdx = CHOSEONG.indexOf(lastChar);
    const jungIdx = JUNGSEONG.indexOf(jamo);
    if (choIdx !== -1 && jungIdx !== -1) {
      return prefix + composeSyllable(choIdx, jungIdx, 0);
    }
  }

  // Case 2: Last character is an existing Hangul syllable
  if (isHangulSyllable(lastChar)) {
    const { cho, jung, jong } = decomposeSyllable(lastChar);

    // 2a: No jongseong yet
    if (jong === 0) {
      if (isVowel) {
        // Check compound vowel
        const currentVowel = JUNGSEONG[jung];
        const combinedVowel = COMPOUND_VOWELS[currentVowel + jamo];
        if (combinedVowel) {
          const newJung = JUNGSEONG.indexOf(combinedVowel);
          return prefix + composeSyllable(cho, newJung, 0);
        }
      } else if (isConsonant) {
        const jongIdx = JONGSEONG.indexOf(jamo);
        if (jongIdx > 0) {
          return prefix + composeSyllable(cho, jung, jongIdx);
        }
      }
    } else {
      // 2b: Already has a jongseong
      const currentJongChar = JONGSEONG[jong];
      if (isVowel) {
        // Split jongseong into previous syllable + new syllable choseong
        const nextChoIdx = CHOSEONG.indexOf(currentJongChar);
        const nextJungIdx = JUNGSEONG.indexOf(jamo);
        if (nextChoIdx !== -1 && nextJungIdx !== -1) {
          return (
            prefix +
            composeSyllable(cho, jung, 0) +
            composeSyllable(nextChoIdx, nextJungIdx, 0)
          );
        }
      } else if (isConsonant) {
        const combinedJong = COMPOUND_JONGSEONG[currentJongChar + jamo];
        if (combinedJong && JONGSEONG.includes(combinedJong)) {
          const newJongIdx = JONGSEONG.indexOf(combinedJong);
          return prefix + composeSyllable(cho, jung, newJongIdx);
        }
      }
    }
  }

  return currentText + jamo;
}

const CONSONANT_ROW_1 = ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅃ", "ㅉ", "ㄸ", "ㄲ", "ㅆ"];
const CONSONANT_ROW_2 = ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅋ", "ㅌ", "ㅊ", "ㅍ"];
const VOWEL_ROW = ["ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "ㅠ", "ㅜ", "ㅡ"];

const QUICK_SYLLABLES = [
  "설레다",
  "눈치",
  "배려",
  "꾸준히",
  "그립다",
  "소확행",
  "인연",
  "행복하다",
];

export const HangulKeyboard: React.FC<HangulKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  onClose,
}) => {
  const handleJamoClick = (jamo: string) => {
    onChange(appendHangulJamo(value, jamo));
  };

  const handleBackspace = () => {
    if (!value) return;
    const lastChar = value[value.length - 1];
    const prefix = value.slice(0, -1);
    if (isHangulSyllable(lastChar)) {
      const { cho, jung, jong } = decomposeSyllable(lastChar);
      if (jong > 0) {
        onChange(prefix + composeSyllable(cho, jung, 0));
        return;
      }
      onChange(prefix + CHOSEONG[cho]);
      return;
    }
    onChange(prefix);
  };

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Bàn phím Hangul thông minh (두벌식)</span>
          <span aria-hidden="true">·</span>
          <span>Tự động ghép phụ âm + nguyên âm thành chữ Hàn hoàn chỉnh</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          aria-label="Đóng bàn phím ảo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick word suggestions */}
      <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-slate-100">
        <span className="text-xs text-slate-400 mr-1">Chèn nhanh:</span>
        {QUICK_SYLLABLES.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => onChange(word)}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-md transition-colors whitespace-nowrap"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {/* Consonant Row 1 */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {CONSONANT_ROW_1.map((jamo) => (
            <button
              key={jamo}
              type="button"
              onClick={() => handleJamoClick(jamo)}
              className="min-w-[38px] h-10 px-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 active:scale-95 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 transition-all"
            >
              {jamo}
            </button>
          ))}
        </div>

        {/* Consonant Row 2 */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {CONSONANT_ROW_2.map((jamo) => (
            <button
              key={jamo}
              type="button"
              onClick={() => handleJamoClick(jamo)}
              className="min-w-[38px] h-10 px-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 active:scale-95 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 transition-all"
            >
              {jamo}
            </button>
          ))}
        </div>

        {/* Vowel Row */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {VOWEL_ROW.map((jamo) => (
            <button
              key={jamo}
              type="button"
              onClick={() => handleJamoClick(jamo)}
              className="min-w-[38px] h-10 px-2.5 bg-blue-50/50 hover:bg-blue-100/80 hover:border-blue-300 active:scale-95 border border-blue-200/70 rounded-lg text-sm font-semibold text-blue-950 transition-all"
            >
              {jamo}
            </button>
          ))}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 h-10 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Xóa hết
          </button>
          <button
            type="button"
            onClick={() => onChange(value + " ")}
            className="px-8 h-10 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Dấu cách (Space)
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="px-3.5 h-10 flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Delete className="w-4 h-4" />
            <span>Xóa 1 nét</span>
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 h-10 flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap"
          >
            <CornerDownLeft className="w-4 h-4" />
            <span>Tra cứu AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { ArrowRight, Layout, Type, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { ActiveViewTab } from "../types/vocabulary";

interface UILayoutBlueprintProps {
  onNavigateTab: (tab: ActiveViewTab) => void;
  onSelectDemoWord: (word: string) => void;
}

export const UILayoutBlueprint: React.FC<UILayoutBlueprintProps> = ({
  onNavigateTab,
  onSelectDemoWord,
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">
            Tài liệu Kiến trúc Giao diện · UI/UX Design & Layout Specification
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display tracking-tight">
            Bản Thiết Kế & Bố Cục Giao Diện HanViệt Lexicon
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Thiết kế chuyên biệt cho việc học từ vựng Hàn - Việt qua ngữ cảnh song ngữ. Áp dụng nguyên lý{" "}
            <strong className="font-semibold text-slate-900">Two-Zone Split Educational Stage</strong> giúp người học quan sát đồng thời từ vựng gốc, giải nghĩa Hàn - Việt và 2 câu ví dụ của Gemini AI mà không bị rối mắt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab("workspace")}
          className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
        >
          <span>Mở Không Gian Tra Cứu AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Section 1: Interactive Wireframe & Spatial Architecture */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#1D4ED8]" />
            <span>01. Sơ Đồ Bố Cục Không Gian (1440px Desktop & Responsive Split-Stage)</span>
          </h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Tỷ lệ vàng: 65% Phân tích AI · 35% Thực hành & Sổ từ
          </span>
        </div>

        {/* Visual Blueprint Diagram */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {/* Top Bar Zone Wireframe */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">ZONE A · TOP BAR</span>
              <span className="text-xs text-slate-600">
                3-Zone Header: Thương hiệu HanViệt Lexicon — 5 Tab điều hướng — Nút Bàn phím Hangul & Sổ từ
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Chiều cao cố định: 64px</span>
          </div>

          {/* Search & Prompt Control Bar Wireframe */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                ZONE B · THANH NHẬP TỪ VỰNG & BỘ CHỌN NGỮ CẢNH GEMINI AI
              </span>
              <span className="text-xs font-mono text-slate-500">Full-width Command Bar</span>
            </div>
            <p className="text-xs text-slate-600">
              Ô tìm kiếm từ tiếng Hàn (hoặc tiếng Việt) tích hợp <strong>Bàn phím ảo Hangul tự ghép chữ</strong> + Bộ chọn 4 ngữ cảnh câu ví dụ (Hội thoại đời sống · Luyện thi TOPIK · Công sở · Văn hóa) + Thanh gợi ý từ vựng nhanh.
            </p>
          </div>

          {/* 2-Column Split Workspace Wireframe */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            {/* Left 8 cols (65%) */}
            <div className="lg:col-span-8 border border-slate-200 rounded-lg p-5 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-xs font-semibold text-slate-900">
                  ZONE C1 · CỘT CHÍNH (65% — 8/12 CỘT): PHÂN TÍCH TỪ VỰNG & 2 CÂU VÍ DỤ SONG NGỮ
                </span>
                <span className="text-xs text-slate-400 font-mono">Primary Focal Stage</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 bg-slate-50 rounded-lg border-l-2 border-[#1D4ED8]">
                  <p className="font-semibold text-slate-900 mb-1">
                    1. Thẻ Từ Vựng Trung Tâm (Lexicon Headword Header)
                  </p>
                  <p>
                    Hiển thị chữ Hàn cỡ lớn (32px–36px Noto Serif KR), nút phát âm giọng chuẩn Seoul (Gemini TTS), phiên âm Latinh · bồi âm tiếng Việt · từ loại · cấp độ TOPIK · gốc chữ Hán & Âm Hán Việt. Định nghĩa song ngữ: <strong>Nghĩa tiếng Việt</strong> và <strong>한국어 사전적 의미 (Định nghĩa tiếng Hàn)</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border-l-2 border-emerald-600">
                  <p className="font-semibold text-slate-900 mb-1">
                    2. Khối 2 Câu Ví Dụ Song Ngữ Do Gemini AI Tạo (Dual Contextual Examples)
                  </p>
                  <p>
                    Mỗi từ vựng luôn được Gemini AI sinh ra đúng <strong>2 câu ví dụ ở 2 sắc thái/tình huống khác nhau</strong>. Mỗi thẻ câu ví dụ bao gồm 4 tầng thông tin rõ ràng:
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-700 pl-4 list-disc">
                    <li>
                      <strong>Câu gốc tiếng Hàn (Korean Sentence):</strong> Tô sáng trực tiếp từ vựng đang học ngay trong câu + nút nghe phát âm cả câu.
                    </li>
                    <li>
                      <strong>Giải nghĩa bằng tiếng Hàn (한국어 의미 풀이):</strong> Diễn giải lại ý nghĩa của câu bằng tiếng Hàn dễ hiểu để rèn tư duy phản xạ Hàn - Hàn.
                    </li>
                    <li>
                      <strong>Nghĩa dịch tiếng Việt (Nghĩa tiếng Việt):</strong> Bản dịch tiếng Việt tự nhiên, chuẩn xác theo ngữ cảnh.
                    </li>
                    <li>
                      <strong>Phân tích Ngữ pháp & Giải nghĩa từng cụm từ (Word-by-Word Breakdown):</strong> Bóc tách từng thành phần trong câu kèm vai trò ngữ pháp.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border-l-2 border-slate-400">
                  <p className="font-semibold text-slate-900 mb-1">
                    3. Cụm Từ Cố Định (Collocations) & Từ Đồng / Trái Nghĩa
                  </p>
                  <p>
                    Danh sách các cụm từ đi kèm phổ biến và từ liên quan. Nhấp vào bất kỳ từ nào để tra cứu nối tiếp bằng Gemini AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4 cols (35%) */}
            <div className="lg:col-span-4 border border-slate-200 rounded-lg p-5 space-y-4 bg-slate-50/40">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="font-mono text-xs font-semibold text-slate-900">
                  ZONE C2 · CỘT PHỤ (35% — 4/12 CỘT): TƯƠNG TÁC & ÔN TẬP
                </span>
                <span className="text-xs text-slate-400 font-mono">Practice Deck</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 bg-white rounded-lg border border-slate-200/80">
                  <p className="font-semibold text-slate-900 mb-1">
                    1. Luyện Đặt Câu & Gemini AI Chấm Chữa
                  </p>
                  <p>
                    Người học tự đặt câu tiếng Hàn với từ vừa tra. Gemini AI sẽ kiểm tra ngữ pháp, sửa lại câu tự nhiên nhất và giải thích bằng cả tiếng Hàn lẫn tiếng Việt.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-lg border border-slate-200/80">
                  <p className="font-semibold text-slate-900 mb-1">
                    2. Bài Tập Điền Khuyết Nhanh (Cloze Test trên 2 câu ví dụ)
                  </p>
                  <p>
                    Chế độ ẩn từ vựng mục tiêu trong 2 câu ví dụ để người học tự kiểm tra khả năng ghi nhớ mặt chữ ngay tại chỗ.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-lg border border-slate-200/80">
                  <p className="font-semibold text-slate-900 mb-1">
                    3. Sổ Từ Vựng Đã Lưu & Lịch Sử Tra Cứu
                  </p>
                  <p>
                    Lưu trữ tức thì các từ đã học để chuyển đổi nhanh hoặc mở sang chế độ Luyện tập Flashcard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Typography & Color System */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-[#1D4ED8]" />
            <span>02. Hệ Thống Chữ Viết Song Ngữ (Bilingual Typography)</span>
          </h3>
          <div className="space-y-3 divide-y divide-slate-100 text-xs">
            <div className="pt-2 first:pt-0">
              <p className="text-slate-400 font-mono mb-1">Display & Từ khóa tiếng Hàn · Noto Serif KR + Fraunces</p>
              <p className="text-2xl font-korean-serif font-semibold text-slate-900">
                설레다 · Bồi hồi, xao xuyến
              </p>
            </div>
            <div className="pt-3">
              <p className="text-slate-400 font-mono mb-1">Văn bản câu ví dụ & Giải nghĩa · Noto Sans KR + Plus Jakarta Sans</p>
              <p className="text-sm font-korean text-slate-800">
                내일 처음으로 서울에 가는데 마음이 너무 설레서 잠이 안 와요.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Ngày mai là lần đầu tiên tôi đi Seoul nên trong lòng bồi hồi quá không ngủ được.
              </p>
            </div>
            <div className="pt-3">
              <p className="text-slate-400 font-mono mb-1">Phiên âm & Chỉ số TOPIK · IBM Plex Mono (tabular-nums)</p>
              <p className="text-xs font-mono text-slate-700 tabular-nums">
                [seolleda · xol-lê-đa] · TOPIK II · 02 Câu ví dụ ngữ cảnh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1D4ED8]" />
            <span>03. Quy Tắc Phối Màu 60-30-10 & Tương Phản Học Thuật</span>
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="w-8 h-8 rounded-md bg-[#F8FAFC] border border-slate-300 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">60% Nền Giấy Sáng Dịu Mắt (#F8FAFC Porcelain Canvas)</p>
                <p>Giảm mỏi mắt khi đọc song song chữ Hangul và dấu tiếng Việt trong thời gian dài.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-300 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">30% Bề Mặt Cấu Trúc (#FFFFFF & Viền mảnh #E2E8F0)</p>
                <p>Phân tách rõ ràng giữa định nghĩa từ gốc, câu ví dụ 1 và câu ví dụ 2 bằng khoảng trắng.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-200">
              <div className="w-8 h-8 rounded-md bg-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">10% Điểm Nhấn Chàm Hàn Quốc (#1D4ED8 Joseon Cobalt)</p>
                <p>Dành riêng cho nút phân tích AI, từ vựng được tô sáng trong câu ví dụ và trạng thái đang chọn.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Try Live Flow directly from Blueprint */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4ED8]">
            <Sparkles className="w-4 h-4" />
            <span>Trải nghiệm trực tiếp luồng hoạt động của Gemini AI</span>
          </div>
          <p className="text-sm text-slate-700">
            Chọn thử một từ tiếng Hàn bên dưới để xem giao diện phân tích và tạo 2 câu ví dụ song ngữ Hàn - Việt:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["설레다", "눈치", "배려", "소확행", "그립다"].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onSelectDemoWord(w)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#1D4ED8] border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Thử từ &ldquo;{w}&rdquo;</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

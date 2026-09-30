import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  LogOut,
  Sparkles,
  UserCheck,
  Target,
  Crown,
  BookOpen,
  Flame,
  RefreshCw,
} from "lucide-react";
import {
  ActiveViewTab,
  ContextStyle,
  SubscriptionTier,
  TargetTopikGoal,
  UserProfileData,
  VocabularyEntry,
} from "../types/vocabulary";

interface UserPersonalizationHubProps {
  userProfile: UserProfileData | null;
  isAuthLoading: boolean;
  authError?: string | null;
  savedEntries: VocabularyEntry[];
  onSignInGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSavePreferences: (updates: {
    displayName: string;
    photoURL: string;
    targetTopikLevel: TargetTopikGoal;
    preferredContextStyle: ContextStyle;
    dailyGoalWords: number;
    subscriptionTier: SubscriptionTier;
  }) => Promise<void>;
  onNavigateTab: (tab: ActiveViewTab) => void;
}

const TOPIK_GOALS: TargetTopikGoal[] = [
  "TOPIK I - Cấp 1-2",
  "TOPIK II - Cấp 3-4",
  "TOPIK II - Cấp 5-6",
  "Giao tiếp Thương mại",
];

const CONTEXT_OPTIONS: { id: ContextStyle; label: string; desc: string }[] = [
  {
    id: "daily",
    label: "Hội thoại đời sống (해요체)",
    desc: "Ưu tiên câu giao tiếp tự nhiên hàng ngày tại Hàn Quốc",
  },
  {
    id: "topik",
    label: "Luyện thi TOPIK I & II",
    desc: "Ưu tiên cấu trúc đọc hiểu và viết nghị luận học thuật",
  },
  {
    id: "business",
    label: "Công sở & Doanh nghiệp (합쇼체)",
    desc: "Ưu tiên ngữ cảnh email, họp hành và làm việc tại công ty Hàn",
  },
  {
    id: "culture",
    label: "Văn hóa & K-Drama",
    desc: "Ưu tiên hội thoại giàu cảm xúc và thành ngữ đời thường",
  },
];

const COMMERCIAL_PLANS: {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  subtitle: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}[] = [
  {
    id: "free",
    name: "Gói Cơ Bản (Free Starter)",
    price: "0đ",
    period: "/ trọn đời",
    subtitle: "Dành cho người mới bắt đầu làm quen từ vựng tiếng Hàn",
    features: [
      "Tra cứu từ vựng Hàn - Việt & tạo 2 câu ví dụ song ngữ",
      "Lưu sổ từ vựng cá nhân đồng bộ đám mây theo tài khoản Google",
      "Trò chơi ghép & xóa tối đa 10 thẻ từ vựng",
      "Phát âm tiêu chuẩn Hàn Quốc",
    ],
    cta: "Đang sử dụng gói Cơ Bản",
  },
  {
    id: "pro",
    name: "HanViệt Pro (Cá Nhân Hóa AI)",
    price: "99.000đ",
    period: "/ tháng",
    subtitle: "Tối ưu toàn diện cho học viên luyện thi TOPIK & người đi làm",
    features: [
      "Không giới hạn lượt phân tích từ vựng & tạo 2 câu ví dụ Gemini AI",
      "AI chấm chữa câu tiếng Hàn tự đặt không giới hạn",
      "Giọng đọc thần kinh Gemini TTS chuẩn Seoul tự nhiên",
      "Tạo bộ từ vựng theo chủ đề cá nhân hóa & Ghi chú riêng từng từ",
      "Mẹo ghi nhớ Hán-Hàn chuyên sâu trong trò chơi ghép thẻ",
    ],
    cta: "Kích hoạt gói HanViệt Pro",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Gói Học Viện / Doanh Nghiệp",
    price: "299.000đ",
    period: "/ tháng",
    subtitle: "Dành cho trung tâm tiếng Hàn, giáo viên & phòng ban công ty",
    features: [
      "Toàn bộ quyền lợi không giới hạn của gói HanViệt Pro",
      "Bộ từ vựng chuyên ngành Thương mại, IT, Biên phiên dịch Hàn - Việt",
      "Đồng bộ đa thiết bị tốc độ cao & Xuất học liệu",
      "Hỗ trợ ưu tiên 24/7",
    ],
    cta: "Kích hoạt gói Học Viện",
  },
];

export const UserPersonalizationHub: React.FC<UserPersonalizationHubProps> = ({
  userProfile,
  isAuthLoading,
  authError,
  savedEntries,
  onSignInGoogle,
  onSignOut,
  onSavePreferences,
  onNavigateTab,
}) => {
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || ""
  );
  const [targetTopikLevel, setTargetTopikLevel] = useState<TargetTopikGoal>(
    userProfile?.targetTopikLevel || "TOPIK II - Cấp 3-4"
  );
  const [preferredContextStyle, setPreferredContextStyle] =
    useState<ContextStyle>(userProfile?.preferredContextStyle || "daily");
  const [dailyGoalWords, setDailyGoalWords] = useState<number>(
    userProfile?.dailyGoalWords || 10
  );
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(
    userProfile?.subscriptionTier || "free"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setTargetTopikLevel(userProfile.targetTopikLevel);
      setPreferredContextStyle(userProfile.preferredContextStyle);
      setDailyGoalWords(userProfile.dailyGoalWords);
      setSubscriptionTier(userProfile.subscriptionTier);
    }
  }, [userProfile]);

  const masteredCount = savedEntries.filter(
    (item) => item.masteryLevel === "mastered"
  ).length;
  const reviewingCount = savedEntries.filter(
    (item) => item.masteryLevel === "reviewing"
  ).length;
  const dailyProgressPct = Math.min(
    100,
    Math.round(
      (Math.min(savedEntries.length, dailyGoalWords) /
        Math.max(dailyGoalWords, 1)) *
        100
    )
  );

  const handleSubmitPreferences = async (
    e?: React.FormEvent,
    overrideTier?: SubscriptionTier
  ) => {
    if (e) e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    const nextTier = overrideTier || subscriptionTier;
    try {
      await onSavePreferences({
        displayName: displayName.trim() || userProfile.displayName,
        photoURL: userProfile.photoURL,
        targetTopikLevel,
        preferredContextStyle,
        dailyGoalWords,
        subscriptionTier: nextTier,
      });
      setSubscriptionTier(nextTier);
      setSaveSuccessMsg(
        overrideTier
          ? `Đã cập nhật gói dịch vụ thành công (${overrideTier.toUpperCase()})!`
          : "Đã lưu cấu hình cá nhân hóa và đồng bộ lên đám mây!"
      );
    } catch (err) {
      setSaveErrorMsg(
        err instanceof Error
          ? err.message
          : "Không thể lưu thiết lập. Vui lòng thử lại."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Google Account & Commercial SaaS Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        {!userProfile ? (
          <div className="max-w-2xl mx-auto text-center space-y-5 py-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono font-semibold text-[#1D4ED8]">
                ĐỒNG BỘ ĐÁM MÂY &amp; CÁ NHÂN HÓA LỘ TRÌNH HỌC
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 font-display">
                Đăng Nhập Google Để Tối Ưu Cho Riêng Bạn
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mỗi học viên sẽ có Sổ từ vựng đám mây riêng biệt, ghi chú cá nhân cho từng từ, lưu tiến độ trò chơi xóa thẻ và tùy chỉnh cấp độ câu ví dụ Gemini AI theo mục tiêu TOPIK của chính mình.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={onSignInGoogle}
                className="px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.65 5 12c0-3.65 3.36-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
                </svg>
                <span>
                  {isAuthLoading
                    ? "Đang kết nối Google..."
                    : "Đăng Nhập Nhanh Bằng Tài Khoản Google"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("workspace")}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                Tiếp tục tra cứu thử nghiệm
              </button>
            </div>

            {authError && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold">Hướng dẫn cấu hình tên miền đăng nhập:</p>
                <p className="leading-relaxed">{authError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border border-slate-200 object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1D4ED8] text-white font-semibold text-lg flex items-center justify-center shrink-0">
                  {userProfile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 font-display">
                    {userProfile.displayName}
                  </h1>
                  <span className="text-xs font-mono font-semibold text-[#1D4ED8]">
                    · Gói{" "}
                    {userProfile.subscriptionTier === "pro"
                      ? "HANVIỆT PRO"
                      : userProfile.subscriptionTier === "enterprise"
                        ? "HỌC VIỆN / ENTERPRISE"
                        : "FREE STARTER"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {userProfile.email} · Mục tiêu:{" "}
                  <strong className="text-slate-700">
                    {userProfile.targetTopikLevel}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab("notebook")}
                className="px-4 py-2 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sổ từ đám mây ({savedEntries.length} từ)</span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Personalized Analytics & Settings Grid (When Signed In) */}
      {userProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 7 Cols: Personalization Configuration Form */}
          <form
            onSubmit={(e) => handleSubmitPreferences(e)}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-semibold text-slate-900 font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1D4ED8]" />
                <span>Cấu Hình Cá Nhân Hóa AI Cho Tài Khoản Của Bạn</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống sẽ tự động điều chỉnh phong cách 2 câu ví dụ song ngữ Hàn - Việt và mục tiêu ôn tập dựa trên hồ sơ của bạn.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên hiển thị học viên
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mục tiêu trình độ tiếng Hàn của bạn
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TOPIK_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setTargetTopikLevel(goal)}
                      className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                        targetTopikLevel === goal
                          ? "bg-blue-50/80 border-[#1D4ED8] text-[#1D4ED8] font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phong cách mặc định khi Gemini AI tạo 2 câu ví dụ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CONTEXT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredContextStyle(opt.id)}
                      className={`p-3 rounded-lg border text-left transition-colors space-y-1 ${
                        preferredContextStyle === opt.id
                          ? "bg-blue-50/80 border-[#1D4ED8]"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          preferredContextStyle === opt.id
                            ? "text-[#1D4ED8]"
                            : "text-slate-900"
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mục tiêu số từ vựng cần nắm vững mỗi ngày ({dailyGoalWords} từ/ngày)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[5, 10, 15, 20, 30].map((goalNum) => (
                    <button
                      key={goalNum}
                      type="button"
                      onClick={() => setDailyGoalWords(goalNum)}
                      className={`px-4 py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                        dailyGoalWords === goalNum
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {goalNum} từ / ngày
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {saveErrorMsg && (
              <p className="text-xs text-red-600">{saveErrorMsg}</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lưu Thiết Lập Cá Nhân Hóa</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right 5 Cols: Personal Study Statistics & Daily Goal Progress */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Thống Kê Học Tập Cá Nhân</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Cập nhật: {userProfile.lastStudyDate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs text-slate-500">Chuỗi ngày học</p>
                  <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
                    {userProfile.streakDays} ngày
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs text-slate-500">Lượt tra cứu AI</p>
                  <p className="text-2xl font-mono font-semibold text-[#1D4ED8] tabular-nums">
                    {userProfile.totalLookups}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs text-slate-500">Câu tự đặt đã chấm</p>
                  <p className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
                    {userProfile.totalSentencesChecked}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs text-slate-500">Vòng xóa thẻ hoàn tất</p>
                  <p className="text-2xl font-mono font-semibold text-emerald-700 tabular-nums">
                    {userProfile.totalGamesCleared}
                  </p>
                </div>
              </div>

              {/* Mastery Progress */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Tiến độ Sổ từ vựng cá nhân
                  </span>
                  <span className="font-mono text-slate-900 font-semibold tabular-nums">
                    Đã thuộc {masteredCount} · Cần ôn {reviewingCount} / Tổng{" "}
                    {savedEntries.length} từ
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1D4ED8] transition-all"
                    style={{ width: `${dailyProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commercial SaaS Membership Plans Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-mono font-semibold text-[#1D4ED8]">
              GÓI THÀNH VIÊN &amp; THƯƠNG MẠI HÓA · SAAS SUBSCRIPTION TIERS
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 font-display mt-1">
              Nâng Cấp Tài Khoản Học Từ Vựng Hàn - Việt Chuyên Sâu
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Đồng bộ tức thì với tài khoản Google của từng học viên
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {COMMERCIAL_PLANS.map((plan) => {
            const isCurrentTier =
              userProfile?.subscriptionTier === plan.id ||
              (!userProfile && plan.id === "free");

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl p-6 flex flex-col justify-between space-y-6 border transition-all ${
                  plan.highlighted
                    ? "border-2 border-[#1D4ED8] shadow-xs"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                      {plan.highlighted && (
                        <Crown className="w-4 h-4 text-[#1D4ED8]" />
                      )}
                      <span>{plan.name}</span>
                    </h3>
                    {isCurrentTier && (
                      <span className="text-[11px] font-mono font-semibold text-emerald-700">
                        ĐANG DÙNG
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-slate-900 font-display tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500">
                      {plan.period}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {plan.subtitle}
                  </p>

                  <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {!userProfile ? (
                    <button
                      type="button"
                      onClick={onSignInGoogle}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        plan.highlighted
                          ? "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Đăng nhập Google để đăng ký
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isCurrentTier || isSaving}
                      onClick={() => handleSubmitPreferences(undefined, plan.id)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isCurrentTier
                          ? "bg-slate-100 text-slate-500 cursor-default"
                          : plan.highlighted
                            ? "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isCurrentTier ? "Gói hiện tại của bạn" : plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

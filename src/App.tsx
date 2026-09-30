import React, { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  RefreshCw,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Trash2,
  ArrowUpRight,
  Play,
  CheckSquare,
  Square,
  Crown,
} from "lucide-react";
import {
  VocabularyEntry,
  ContextStyle,
  ActiveViewTab,
  SentenceCheckResult,
  UserProfileData,
  TargetTopikGoal,
  SubscriptionTier,
} from "./types/vocabulary";
import {
  INITIAL_CURATED_VOCABULARY,
  TOPIK_EXPLORER_GROUPS,
} from "./data/curatedVocabulary";
import { playKoreanAudio } from "./utils/audioPlayer";
import { HangulKeyboard } from "./components/HangulKeyboard";
import { UILayoutBlueprint } from "./components/UILayoutBlueprint";
import { FlashcardTrainer } from "./components/FlashcardTrainer";
import { VocabEliminationGame } from "./components/VocabEliminationGame";
import { UserPersonalizationHub } from "./components/UserPersonalizationHub";
import {
  analyzeVocabularyWithAI,
  checkSentenceWithAI,
  generateTopicDeckWithAI,
} from "./services/geminiClient";
import {
  auth,
  activeFirebaseProjectId,
  signInWithGooglePopup,
  signOutCurrentUser,
  ensureUserProfileInCloud,
  updateUserPreferencesInCloud,
  incrementUserStudyStatsInCloud,
  saveVocabularyEntryToCloud,
  updateVocabularyMetaInCloud,
  deleteVocabularyFromCloud,
  subscribeToUserVocabularies,
} from "./firebase";

const STORAGE_KEY = "hanviet_lexicon_saved_v1";

const CONTEXT_STYLES: { id: ContextStyle; label: string; desc: string }[] = [
  {
    id: "daily",
    label: "Hội thoại đời sống",
    desc: "Câu 1 thân mật lịch sự (해요체) · Câu 2 kể chuyện tự nhiên",
  },
  {
    id: "topik",
    label: "Luyện thi TOPIK",
    desc: "Câu 1 đọc hiểu trung cấp · Câu 2 nghị luận / học thuật",
  },
  {
    id: "business",
    label: "Công sở & Thương mại",
    desc: "Câu 1 giao tiếp văn phòng · Câu 2 email / họp trang trọng (합쇼체)",
  },
  {
    id: "culture",
    label: "Văn hóa & K-Drama",
    desc: "Câu 1 thoại cảm xúc đời thường · Câu 2 văn hóa Hàn Quốc",
  },
];

const QUICK_SUGGESTIONS = [
  { korean: "설레다", viet: "bồi hồi, xao xuyến" },
  { korean: "눈치", viet: "tinh ý, nhìn sắc mặt" },
  { korean: "배려", viet: "quan tâm, chu đáo" },
  { korean: "꾸준히", viet: "đều đặn, bền bỉ" },
  { korean: "소확행", viet: "hạnh phúc nhỏ đích thực" },
  { korean: "그립다", viet: "nhớ nhung, hoài niệm" },
  { korean: "인연", viet: "nhân duyên" },
  { korean: "해결하다", viet: "giải quyết" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveViewTab>("workspace");
  const [savedEntries, setSavedEntries] = useState<VocabularyEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingWords = new Set(
            parsed.map((item: VocabularyEntry) => item.koreanWord)
          );
          const missingDefaults = INITIAL_CURATED_VOCABULARY.filter(
            (item) => !existingWords.has(item.koreanWord)
          );
          return [...parsed, ...missingDefaults];
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    return INITIAL_CURATED_VOCABULARY;
  });

  const [currentEntry, setCurrentEntry] = useState<VocabularyEntry>(
    () => INITIAL_CURATED_VOCABULARY[0]
  );
  const [searchInput, setSearchInput] = useState("");
  const [contextStyle, setContextStyle] = useState<ContextStyle>("daily");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [clozePreviewMode, setClozePreviewMode] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Practice sentence checker state
  const [practiceSentence, setPracticeSentence] = useState("");
  const [isCheckingSentence, setIsCheckingSentence] = useState(false);
  const [sentenceCheckResult, setSentenceCheckResult] =
    useState<SentenceCheckResult | null>(null);
  const [sentenceCheckError, setSentenceCheckError] = useState<string | null>(
    null
  );

  // Notebook filter & 10-word selection game state
  const [notebookQuery, setNotebookQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState<
    "all" | "learning" | "reviewing" | "mastered"
  >("all");
  const [selectedNotebookIds, setSelectedNotebookIds] = useState<string[]>(() =>
    INITIAL_CURATED_VOCABULARY.slice(0, 6).map((item) => item.id)
  );
  const [isPlayingNotebookGame, setIsPlayingNotebookGame] = useState(false);
  const [selectionLimitNotice, setSelectionLimitNotice] = useState<
    string | null
  >(null);
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);

  // Authenticated Google User & Personalization Profile State
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [personalNoteDraft, setPersonalNoteDraft] = useState<string>("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);
  const hasSeededCloudRef = useRef<string | null>(null);

  // Sync personalNoteDraft whenever currentEntry changes
  useEffect(() => {
    const matchedSaved = savedEntries.find(
      (item) => item.koreanWord === currentEntry.koreanWord
    );
    setPersonalNoteDraft(
      matchedSaved?.personalNote ?? currentEntry.personalNote ?? ""
    );
    setNoteSavedFeedback(false);
  }, [currentEntry.koreanWord, savedEntries]);

  // Listen to Google Auth state and attach real-time Firestore vocabulary listener per user
  useEffect(() => {
    let unsubscribeVocab: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeVocab) {
        unsubscribeVocab();
        unsubscribeVocab = null;
      }

      if (!firebaseUser) {
        setUserProfile(null);
        setIsAuthLoading(false);
        return;
      }

      setIsAuthLoading(true);
      try {
        const profile = await ensureUserProfileInCloud(firebaseUser);
        setUserProfile(profile);
        setContextStyle(profile.preferredContextStyle);

        unsubscribeVocab = subscribeToUserVocabularies(
          profile.uid,
          async (cloudItems) => {
            if (
              cloudItems.length === 0 &&
              hasSeededCloudRef.current !== profile.uid
            ) {
              hasSeededCloudRef.current = profile.uid;
              // Seed user's initial vocabulary items into their private cloud notebook
              const seedList = savedEntries.slice(0, 8);
              for (let i = 0; i < seedList.length; i++) {
                await saveVocabularyEntryToCloud(
                  profile.uid,
                  seedList[i],
                  i < 6
                );
              }
              return;
            }

            if (cloudItems.length > 0) {
              setSavedEntries(cloudItems);
              const cloudSelectedIds = cloudItems
                .filter((item) => item.isSelectedForGame)
                .map((item) => item.id)
                .slice(0, 10);
              if (cloudSelectedIds.length > 0) {
                setSelectedNotebookIds(cloudSelectedIds);
              }
            }
          }
        );
      } catch (err) {
        console.error("Failed to initialize user profile:", err);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeVocab) {
        unsubscribeVocab();
      }
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGooglePopup();
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      const currentHost =
        typeof window !== "undefined" ? window.location.hostname : "domain-cua-ban.com";

      if (code === "auth/unauthorized-domain") {
        setAuthError(
          `Tên miền "${currentHost}" chưa được khai báo trong dự án Firebase hiện tại ("${activeFirebaseProjectId}"). Hãy mở đúng dự án "${activeFirebaseProjectId}" trên Firebase Console → Authentication → Settings → Authorized domains (승인된 도메인) và thêm "${currentHost}".`
        );
        setActiveTab("account-pro");
      } else if (code === "auth/popup-blocked") {
        setAuthError(
          "Trình duyệt đã chặn cửa sổ bật lên (Popup). Vui lòng cho phép mở Popup trên trình duyệt rồi bấm Đăng nhập lại."
        );
      } else if (code !== "auth/popup-closed-by-user") {
        setAuthError(
          err instanceof Error
            ? err.message
            : "Không thể hoàn tất đăng nhập Google. Vui lòng thử lại."
        );
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOutUser = async () => {
    setIsAuthLoading(true);
    try {
      await signOutCurrentUser();
      setUserProfile(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSaveUserPreferences = async (updates: {
    displayName: string;
    photoURL: string;
    targetTopikLevel: TargetTopikGoal;
    preferredContextStyle: ContextStyle;
    dailyGoalWords: number;
    subscriptionTier: SubscriptionTier;
  }) => {
    if (!userProfile) return;
    await updateUserPreferencesInCloud(userProfile.uid, updates);
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            ...updates,
          }
        : null
    );
    setContextStyle(updates.preferredContextStyle);
  };

  const handleRecordUserMetric = async (
    metric: "lookup" | "sentence" | "game"
  ) => {
    if (!userProfile) return;
    try {
      const updated = await incrementUserStudyStatsInCloud(userProfile, metric);
      setUserProfile(updated);
    } catch (err) {
      console.error("Failed to record user study metric:", err);
    }
  };

  const handleSavePersonalNoteForCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = personalNoteDraft.trim().slice(0, 1000);
    const updatedEntry: VocabularyEntry = {
      ...currentEntry,
      personalNote: trimmedNote,
    };
    setCurrentEntry(updatedEntry);

    setSavedEntries((prev) => {
      const idx = prev.findIndex(
        (item) => item.koreanWord === currentEntry.koreanWord
      );
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], personalNote: trimmedNote };
        return copy;
      }
      return [updatedEntry, ...prev];
    });

    if (userProfile) {
      const existing = savedEntries.find(
        (item) => item.koreanWord === currentEntry.koreanWord
      );
      const targetEntry = existing
        ? { ...existing, personalNote: trimmedNote }
        : updatedEntry;
      await saveVocabularyEntryToCloud(
        userProfile.uid,
        targetEntry,
        selectedNotebookIds.includes(targetEntry.id)
      );
    }

    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2500);
  };

  const handleGenerateTopicDeck = async (topicToGenerate: string) => {
    const trimmedTopic = topicToGenerate.trim();
    if (!trimmedTopic || isGeneratingDeck) return;
    setIsGeneratingDeck(true);
    setSelectionLimitNotice(null);

    try {
      const result = await generateTopicDeckWithAI(trimmedTopic, 5);
      if (Array.isArray(result.words) && result.words.length > 0) {
        const now = Date.now();
        const generatedEntries: VocabularyEntry[] = result.words.map(
          (w, index) => ({
            id: `vocab-ai-${now}-${index}`,
            koreanWord: w.koreanWord,
            romanization: w.romanization || "",
            vietnamesePronunciation: w.vietnamesePronunciation || "",
            partOfSpeech: w.partOfSpeech || "어휘 · Từ vựng",
            topikLevel: w.topikLevel || "TOPIK I–II",
            hanjaOrigin: w.hanjaOrigin || "순우리말 · Từ thuần Hàn",
            vietnameseMeaning: w.vietnameseMeaning || "",
            koreanDefinition: w.koreanDefinition || "",
            vietnameseExplanation: w.vietnameseExplanation || "",
            synonyms: Array.isArray(w.synonyms) ? w.synonyms : [],
            antonyms: Array.isArray(w.antonyms) ? w.antonyms : [],
            collocations: Array.isArray(w.collocations) ? w.collocations : [],
            examples: Array.isArray(w.examples) ? w.examples.slice(0, 2) : [],
            createdAt: new Date().toISOString(),
            masteryLevel: "learning",
            personalNote: "",
            isSelectedForGame: true,
          })
        );

        setSavedEntries((prev) => {
          const existingWords = new Set(
            generatedEntries.map((item) => item.koreanWord)
          );
          const filteredPrev = prev.filter(
            (item) => !existingWords.has(item.koreanWord)
          );
          return [...generatedEntries, ...filteredPrev];
        });

        // Auto-select the newly generated AI words (capped at 10)
        setSelectedNotebookIds((prev) => {
          const combined = [
            ...generatedEntries.map((item) => item.id),
            ...prev,
          ];
          return Array.from(new Set(combined)).slice(0, 10);
        });
        setAiTopicInput("");

        if (userProfile) {
          for (const entry of generatedEntries) {
            await saveVocabularyEntryToCloud(userProfile.uid, entry, true);
          }
          await handleRecordUserMetric("lookup");
        }
      }
    } catch (err) {
      setSelectionLimitNotice(
        err instanceof Error
          ? err.message
          : "Không thể tạo bộ từ vựng bằng Gemini AI lúc này."
      );
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleToggleSelectNotebookWord = (id: string) => {
    setSelectionLimitNotice(null);
    setSelectedNotebookIds((prev) => {
      const isCurrentlySelected = prev.includes(id);
      if (isCurrentlySelected) {
        const next = prev.filter((item) => item !== id);
        if (userProfile) {
          const target = savedEntries.find((item) => item.id === id);
          if (target) {
            updateVocabularyMetaInCloud(userProfile.uid, id, {
              masteryLevel: target.masteryLevel || "learning",
              personalNote: target.personalNote || "",
              isSelectedForGame: false,
            }).catch(() => {});
          }
        }
        return next;
      }
      if (prev.length >= 10) {
        setSelectionLimitNotice(
          "Bạn đã chọn tối đa 10 từ vựng. Hãy bỏ chọn bớt nếu muốn đổi từ khác."
        );
        return prev;
      }
      const next = [...prev, id];
      if (userProfile) {
        const target = savedEntries.find((item) => item.id === id);
        if (target) {
          updateVocabularyMetaInCloud(userProfile.uid, id, {
            masteryLevel: target.masteryLevel || "learning",
            personalNote: target.personalNote || "",
            isSelectedForGame: true,
          }).catch(() => {});
        }
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEntries));
    } catch {
      // ignore localStorage write errors
    }
  }, [savedEntries]);

  const isCurrentSaved = savedEntries.some(
    (item) => item.koreanWord === currentEntry.koreanWord
  );

  const handleToggleSaveCurrent = async () => {
    if (isCurrentSaved) {
      const target = savedEntries.find(
        (item) => item.koreanWord === currentEntry.koreanWord
      );
      setSavedEntries((prev) =>
        prev.filter((item) => item.koreanWord !== currentEntry.koreanWord)
      );
      if (userProfile && target) {
        await deleteVocabularyFromCloud(userProfile.uid, target.id);
      }
    } else {
      setSavedEntries((prev) => [currentEntry, ...prev]);
      if (userProfile) {
        await saveVocabularyEntryToCloud(
          userProfile.uid,
          currentEntry,
          selectedNotebookIds.includes(currentEntry.id)
        );
      }
    }
  };

  const handleUpdateMastery = async (
    id: string,
    level: "learning" | "reviewing" | "mastered"
  ) => {
    setSavedEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, masteryLevel: level } : item
      )
    );
    if (currentEntry.id === id) {
      setCurrentEntry((prev) => ({ ...prev, masteryLevel: level }));
    }
    if (userProfile) {
      const target = savedEntries.find((item) => item.id === id);
      if (target) {
        await updateVocabularyMetaInCloud(userProfile.uid, id, {
          masteryLevel: level,
          personalNote: target.personalNote || "",
          isSelectedForGame: selectedNotebookIds.includes(id),
        });
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setSavedEntries((prev) => prev.filter((item) => item.id !== id));
    if (userProfile) {
      await deleteVocabularyFromCloud(userProfile.uid, id);
    }
  };

  const handlePlayAudio = async (
    text: string,
    audioKey: string,
    useAiVoice: boolean = false
  ) => {
    setPlayingAudioId(audioKey);
    try {
      await playKoreanAudio(text, useAiVoice);
    } finally {
      setPlayingAudioId(null);
    }
  };

  const analyzeWordWithGemini = async (
    wordToLookup: string,
    style: ContextStyle = contextStyle
  ) => {
    const trimmed = wordToLookup.trim();
    if (!trimmed) return;

    setActiveTab("workspace");
    setIsLoadingAI(true);
    setAiError(null);
    setSentenceCheckResult(null);
    setSentenceCheckError(null);

    try {
      const data = await analyzeVocabularyWithAI(trimmed, style);

      const newEntry: VocabularyEntry = {
        id: `vocab-${Date.now()}`,
        koreanWord: data.koreanWord || trimmed,
        romanization: data.romanization || "",
        vietnamesePronunciation: data.vietnamesePronunciation || "",
        partOfSpeech: data.partOfSpeech || "어휘 · Từ vựng",
        topikLevel: data.topikLevel || "TOPIK I–II",
        hanjaOrigin: data.hanjaOrigin || "순우리말 · Từ thuần Hàn",
        vietnameseMeaning: data.vietnameseMeaning || "",
        koreanDefinition: data.koreanDefinition || "",
        vietnameseExplanation: data.vietnameseExplanation || "",
        synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
        antonyms: Array.isArray(data.antonyms) ? data.antonyms : [],
        collocations: Array.isArray(data.collocations) ? data.collocations : [],
        examples:
          Array.isArray(data.examples) && data.examples.length >= 2
            ? data.examples.slice(0, 2)
            : data.examples || [],
        contextStyle: style,
        createdAt: new Date().toISOString(),
        masteryLevel: "learning",
      };

      setCurrentEntry(newEntry);
      setSearchInput(newEntry.koreanWord);

      const matchedExisting = savedEntries.find(
        (item) => item.koreanWord === newEntry.koreanWord
      );
      const entryToPersist: VocabularyEntry = matchedExisting
        ? {
            ...newEntry,
            id: matchedExisting.id,
            masteryLevel: matchedExisting.masteryLevel || "learning",
            personalNote: matchedExisting.personalNote || "",
            isSelectedForGame: matchedExisting.isSelectedForGame,
          }
        : newEntry;

      // Update or prepend in savedEntries so user history is preserved
      setSavedEntries((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.koreanWord === newEntry.koreanWord
        );
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = entryToPersist;
          return updated;
        }
        return [entryToPersist, ...prev];
      });

      if (userProfile) {
        await saveVocabularyEntryToCloud(
          userProfile.uid,
          entryToPersist,
          selectedNotebookIds.includes(entryToPersist.id)
        );
        await handleRecordUserMetric("lookup");
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi kết nối với Gemini AI.";
      setAiError(msg);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    analyzeWordWithGemini(searchInput, contextStyle);
  };

  const handleCheckPracticeSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceSentence.trim()) return;
    setIsCheckingSentence(true);
    setSentenceCheckError(null);

    try {
      const data = await checkSentenceWithAI(
        currentEntry.koreanWord,
        practiceSentence.trim()
      );
      setSentenceCheckResult(data);
      if (userProfile) {
        await handleRecordUserMetric("sentence");
      }
    } catch (err) {
      setSentenceCheckError(
        err instanceof Error ? err.message : "Lỗi khi chấm câu với Gemini AI."
      );
    } finally {
      setIsCheckingSentence(false);
    }
  };

  // Helper to highlight target word inside Korean example sentence
  const renderHighlightedSentence = (
    sentence: string,
    highlightedForm: string
  ) => {
    if (!highlightedForm || !sentence.includes(highlightedForm)) {
      return <span>{sentence}</span>;
    }
    const parts = sentence.split(highlightedForm);
    return (
      <>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <span>{part}</span>
            {idx < parts.length - 1 && (
              <span
                className={`font-semibold transition-colors ${
                  clozePreviewMode
                    ? "px-3 py-0.5 mx-1 bg-slate-200 text-transparent rounded select-none border-b-2 border-slate-400"
                    : "text-[#1D4ED8] underline decoration-[#1D4ED8]/40 decoration-2 underline-offset-4"
                }`}
                title={
                  clozePreviewMode
                    ? "Nhấp tắt chế độ ẩn từ để xem đáp án"
                    : `Dạng chia trong câu của "${currentEntry.koreanWord}"`
                }
              >
                {highlightedForm}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const filteredNotebookEntries = savedEntries.filter((entry) => {
    const matchesMastery =
      masteryFilter === "all" || entry.masteryLevel === masteryFilter;
    const q = notebookQuery.trim().toLowerCase();
    if (!q) return matchesMastery;
    return (
      matchesMastery &&
      (entry.koreanWord.toLowerCase().includes(q) ||
        entry.vietnameseMeaning.toLowerCase().includes(q) ||
        entry.romanization.toLowerCase().includes(q) ||
        entry.hanjaOrigin.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("workspace");
          }}
          className="text-lg font-semibold tracking-tight text-slate-900 font-display whitespace-nowrap"
        >
          HanViệt Lexicon
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#workspace"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("workspace");
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === "workspace"
                ? "text-slate-900 underline decoration-[#1D4ED8] decoration-2 underline-offset-8 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Tra cứu &amp; Phân tích
          </a>
          <a
            href="#notebook"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("notebook");
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === "notebook"
                ? "text-slate-900 underline decoration-[#1D4ED8] decoration-2 underline-offset-8 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Sổ từ vựng ({savedEntries.length})
          </a>
          <a
            href="#flashcards"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("flashcards");
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === "flashcards"
                ? "text-slate-900 underline decoration-[#1D4ED8] decoration-2 underline-offset-8 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Luyện tập Flashcard
          </a>
          <a
            href="#topik"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("topik");
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === "topik"
                ? "text-slate-900 underline decoration-[#1D4ED8] decoration-2 underline-offset-8 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Khám phá TOPIK
          </a>
          <a
            href="#account-pro"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("account-pro");
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === "account-pro"
                ? "text-slate-900 underline decoration-[#1D4ED8] decoration-2 underline-offset-8 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Hồ sơ &amp; Gói Pro
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions (Hangul Keyboard + Google Account / Commercial Pro CTA) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("workspace");
              setShowKeyboard((prev) => !prev);
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showKeyboard
                ? "bg-blue-50 border-blue-300 text-[#1D4ED8]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bàn phím Hangul</span>
          </button>

          {userProfile ? (
            <button
              type="button"
              onClick={() => setActiveTab("account-pro")}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <Crown className="w-3.5 h-3.5 text-[#1D4ED8]" />
              )}
              <span className="max-w-[120px] truncate">
                {userProfile.displayName}
              </span>
              <span className="font-mono text-[10px] text-[#1D4ED8] uppercase">
                · {userProfile.subscriptionTier}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isAuthLoading}
              onClick={handleSignInWithGoogle}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.65 5 12c0-3.65 3.36-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
              </svg>
              <span>
                {isAuthLoading ? "Đang kết nối..." : "Đăng nhập Google"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {(
          [
            { id: "workspace", label: "Tra cứu AI" },
            { id: "notebook", label: `Sổ từ (${savedEntries.length})` },
            { id: "flashcards", label: "Flashcard" },
            { id: "topik", label: "TOPIK" },
            { id: "account-pro", label: "Hồ sơ & Gói Pro" },
            { id: "ui-blueprint", label: "Bố cục UI" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 pt-7 pb-16">
        {activeTab === "account-pro" && (
          <UserPersonalizationHub
            userProfile={userProfile}
            isAuthLoading={isAuthLoading}
            authError={authError}
            savedEntries={savedEntries}
            onSignInGoogle={handleSignInWithGoogle}
            onSignOut={handleSignOutUser}
            onSavePreferences={handleSaveUserPreferences}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "ui-blueprint" && (
          <UILayoutBlueprint
            onNavigateTab={setActiveTab}
            onSelectDemoWord={(word) => {
              setSearchInput(word);
              analyzeWordWithGemini(word, contextStyle);
            }}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardTrainer
            entries={savedEntries}
            onUpdateMastery={handleUpdateMastery}
            onSelectEntryForWorkspace={(entry) => {
              setCurrentEntry(entry);
              setSearchInput(entry.koreanWord);
              setActiveTab("workspace");
            }}
          />
        )}

        {activeTab === "topik" && (
          <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Kho từ vựng chọn lọc · Curated Korean-Vietnamese Lexicon
                </p>
                <h1 className="text-2xl font-semibold text-slate-900 font-display">
                  Khám Phá Từ Vựng Theo Chủ Đề &amp; Cấp Độ TOPIK
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Nhấp vào bất kỳ từ tiếng Hàn nào bên dưới để Gemini AI phân tích chuyên sâu và tạo 2 câu ví dụ song ngữ Hàn - Việt.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {TOPIK_EXPLORER_GROUPS.map((group) => (
                <section
                  key={group.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {group.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        {group.description}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                      {group.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.words.map((item) => (
                      <button
                        key={item.korean}
                        type="button"
                        onClick={() => {
                          setSearchInput(item.korean);
                          analyzeWordWithGemini(item.korean, contextStyle);
                        }}
                        className="text-left p-4 rounded-lg border border-slate-200/80 hover:border-[#1D4ED8] hover:bg-blue-50/30 transition-all group flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-korean-serif font-semibold text-slate-900 group-hover:text-[#1D4ED8]">
                              {item.korean}
                            </span>
                            <span className="text-xs text-slate-400">
                              · {item.pos}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-800">
                            {item.vietnamese}
                          </p>
                          <p className="text-xs text-slate-500">{item.hanja}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D4ED8] shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notebook" && (
          <div className="space-y-6 pb-12">
            {isPlayingNotebookGame ? (
              <VocabEliminationGame
                selectedWords={savedEntries
                  .filter((entry) => selectedNotebookIds.includes(entry.id))
                  .slice(0, 10)}
                onExitToNotebook={() => setIsPlayingNotebookGame(false)}
                onInspectInWorkspace={(entry) => {
                  setCurrentEntry(entry);
                  setSearchInput(entry.koreanWord);
                  setIsPlayingNotebookGame(false);
                  setActiveTab("workspace");
                }}
                onGameCompleted={() => handleRecordUserMetric("game")}
              />
            ) : (
              <>
                <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Lưu trữ cá nhân · Personal Bilingual Lexicon
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900 font-display">
                      Sổ Từ Vựng Hàn - Việt Đã Lưu ({savedEntries.length})
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Interactive Segmented Filter Control */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      {(
                        [
                          { id: "all", label: "Tất cả" },
                          { id: "learning", label: "Đang học" },
                          { id: "reviewing", label: "Cần ôn" },
                          { id: "mastered", label: "Đã thuộc" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setMasteryFilter(tab.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            masteryFilter === tab.id
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={notebookQuery}
                        onChange={(e) => setNotebookQuery(e.target.value)}
                        placeholder="Lọc từ Hàn hoặc nghĩa Việt..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1D4ED8] w-52"
                      />
                    </div>
                  </div>
                </div>

                {/* Word Selection Panel (Max 10 Words) for Elimination Card Game */}
                <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1D4ED8] tabular-nums">
                        <span>CHỌN TỪ VỰNG LUYỆN GHÉP &amp; XÓA THẺ</span>
                        <span>·</span>
                        <span>
                          ĐÃ CHỌN{" "}
                          {
                            savedEntries.filter((e) =>
                              selectedNotebookIds.includes(e.id)
                            ).length
                          }{" "}
                          / 10 TỪ (TỐI ĐA 10 TỪ)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        1. Đưa ra 1 nghĩa tiếng Việt mục tiêu · 2. Hiển thị các thẻ từ tiếng Hàn (bấm vào thẻ nào sẽ giải thích nghĩa từ đó) · 3. Chọn đúng nghĩa sẽ xóa thẻ đó đi · 4. Tiếp tục đến khi hết thẻ.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectionLimitNotice(null);
                          setSelectedNotebookIds(
                            filteredNotebookEntries
                              .slice(0, 10)
                              .map((item) => item.id)
                          );
                        }}
                        className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Chọn nhanh 10 từ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectionLimitNotice(null);
                          setSelectedNotebookIds(
                            filteredNotebookEntries
                              .slice(0, 5)
                              .map((item) => item.id)
                          );
                        }}
                        className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Chọn 5 từ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectionLimitNotice(null);
                          setSelectedNotebookIds([]);
                        }}
                        className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Bỏ chọn
                      </button>
                      <button
                        type="button"
                        disabled={
                          savedEntries.filter((e) =>
                            selectedNotebookIds.includes(e.id)
                          ).length === 0
                        }
                        onClick={() => setIsPlayingNotebookGame(true)}
                        className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>
                          Bắt Đầu Ghép &amp; Xóa Thẻ (
                          {
                            savedEntries.filter((e) =>
                              selectedNotebookIds.includes(e.id)
                            ).length
                          }{" "}
                          từ)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Selected Words Preview Row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400">Các từ đang chọn:</span>
                    {savedEntries.filter((e) =>
                      selectedNotebookIds.includes(e.id)
                    ).length === 0 ? (
                      <span className="text-slate-500">
                        Chưa chọn từ nào. Hãy tích chọn các từ trong bảng bên dưới (tối đa 10 từ).
                      </span>
                    ) : (
                      savedEntries
                        .filter((e) => selectedNotebookIds.includes(e.id))
                        .slice(0, 10)
                        .map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleToggleSelectNotebookWord(item.id)
                            }
                            className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#1D4ED8] rounded-md font-korean font-medium flex items-center gap-1.5 transition-colors"
                            title="Nhấp để bỏ chọn từ này"
                          >
                            <span className="font-mono text-[11px] text-blue-500">
                              {index + 1}.
                            </span>
                            <span>{item.koreanWord}</span>
                            <span className="text-blue-400 hover:text-blue-800">
                              ×
                            </span>
                          </button>
                        ))
                    )}
                  </div>

                  {selectionLimitNotice && (
                    <p className="text-xs font-medium text-amber-700">
                      {selectionLimitNotice}
                    </p>
                  )}

                  {/* AI Topic Vocabulary Generator inside Notebook */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGenerateTopicDeck(aiTopicInput);
                      }}
                      className="flex flex-1 items-center gap-2"
                    >
                      <input
                        type="text"
                        value={aiTopicInput}
                        onChange={(e) => setAiTopicInput(e.target.value)}
                        placeholder="Nhập chủ đề để Gemini AI tạo thêm 5 từ mới (VD: Du lịch Seoul, Phỏng vấn, Nhà hàng)..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                      />
                      <button
                        type="submit"
                        disabled={isGeneratingDeck || !aiTopicInput.trim()}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        {isGeneratingDeck ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gemini đang tạo 5 từ...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Tạo Từ Theo Chủ Đề</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="text-slate-400">Chủ đề nhanh:</span>
                      {[
                        "Du lịch Hàn Quốc",
                        "Phỏng vấn công sở",
                        "Ẩm thực đường phố",
                      ].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          disabled={isGeneratingDeck}
                          onClick={() => handleGenerateTopicDeck(topic)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-[#1D4ED8] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          + {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {filteredNotebookEntries.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
                    <p className="text-base font-semibold text-slate-900">
                      Không tìm thấy từ vựng phù hợp
                    </p>
                    <p className="text-xs text-slate-500">
                      Hãy thử thay đổi bộ lọc hoặc tra cứu thêm từ mới với Gemini AI.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                            <th className="py-3.5 pl-5 pr-2 w-28">
                              Chọn (≤10)
                            </th>
                            <th className="py-3.5 px-4">Từ vựng (Hangul)</th>
                            <th className="py-3.5 px-4">
                              Nghĩa tiếng Việt &amp; Định nghĩa Hàn
                            </th>
                            <th className="py-3.5 px-4">Hán-Hàn · TOPIK</th>
                            <th className="py-3.5 px-4">2 Câu Ví Dụ Song Ngữ</th>
                            <th className="py-3.5 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredNotebookEntries.map((entry) => {
                            const isChecked = selectedNotebookIds.includes(
                              entry.id
                            );
                            return (
                              <tr
                                key={entry.id}
                                className={`transition-colors ${
                                  isChecked
                                    ? "bg-blue-50/30 hover:bg-blue-50/50"
                                    : "hover:bg-slate-50/80"
                                }`}
                              >
                                <td className="py-4 pl-5 pr-2 align-top whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleSelectNotebookWord(entry.id)
                                    }
                                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
                                      isChecked
                                        ? "bg-[#1D4ED8] border-[#1D4ED8] text-white"
                                        : "bg-white border-slate-300 text-slate-600 hover:border-[#1D4ED8]"
                                    }`}
                                  >
                                    {isChecked ? (
                                      <>
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        <span>Đã chọn</span>
                                      </>
                                    ) : (
                                      <>
                                        <Square className="w-3.5 h-3.5" />
                                        <span>Chọn</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td className="py-4 px-4 align-top whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentEntry(entry);
                                      setSearchInput(entry.koreanWord);
                                      setActiveTab("workspace");
                                    }}
                                    className="text-left group"
                                  >
                                    <span className="text-lg font-korean-serif font-semibold text-slate-900 group-hover:text-[#1D4ED8] block">
                                      {entry.koreanWord}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">
                                      [{entry.romanization}]
                                    </span>
                                  </button>
                                </td>
                                <td className="py-4 px-4 align-top max-w-xs">
                                  <p className="font-semibold text-slate-900 text-xs">
                                    {entry.vietnameseMeaning}
                                  </p>
                                  <p className="text-xs font-korean text-slate-500 mt-1 line-clamp-2">
                                    {entry.koreanDefinition}
                                  </p>
                                </td>
                                <td className="py-4 px-4 align-top text-xs text-slate-500 whitespace-nowrap">
                                  <p className="text-slate-700">
                                    {entry.hanjaOrigin}
                                  </p>
                                  <p className="mt-0.5">
                                    {entry.partOfSpeech} · {entry.topikLevel}
                                  </p>
                                </td>
                                <td className="py-4 px-4 align-top max-w-md">
                                  {entry.examples.slice(0, 2).map((ex, i) => (
                                    <div
                                      key={i}
                                      className="mb-2 last:mb-0 text-xs"
                                    >
                                      <p className="font-korean font-medium text-slate-800 truncate">
                                        0{i + 1}. {ex.koreanSentence}
                                      </p>
                                      <p className="text-slate-500 truncate">
                                        → {ex.vietnameseMeaning}
                                      </p>
                                    </div>
                                  ))}
                                </td>
                                <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCurrentEntry(entry);
                                        setSearchInput(entry.koreanWord);
                                        setActiveTab("workspace");
                                      }}
                                      className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                    >
                                      Mở chi tiết
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteEntry(entry.id)
                                      }
                                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                      aria-label="Xóa từ vựng"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PRIMARY WORKSPACE VIEW: KOREAN WORD INPUT + 2 GEMINI AI BILINGUAL EXAMPLES */}
        {activeTab === "workspace" && (
          <div className="space-y-7">
            {/* ZONE B: Search & Gemini AI Context Command Stage */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 font-display tracking-tight">
                    Từ Điển Ngữ Cảnh Hàn - Việt &amp; Tạo Câu Ví Dụ Gemini AI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Nhập một từ tiếng Hàn (hoặc tiếng Việt) để Gemini AI phân tích nghĩa và tạo{" "}
                    <strong className="font-semibold text-slate-900">
                      2 câu ví dụ kèm giải nghĩa bằng cả tiếng Hàn và tiếng Việt
                    </strong>
                    .
                  </p>
                </div>

                {/* Context Style Segmented Selector */}
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs text-slate-500">
                    Phong cách ngữ cảnh cho 2 câu ví dụ:
                  </span>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
                    {CONTEXT_STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setContextStyle(st.id);
                          if (currentEntry.koreanWord) {
                            analyzeWordWithGemini(
                              currentEntry.koreanWord,
                              st.id
                            );
                          }
                        }}
                        disabled={isLoadingAI}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          contextStyle === st.id
                            ? "bg-white text-slate-900 shadow-xs font-semibold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Bar Form */}
              <form
                onSubmit={handleFormSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nhập từ tiếng Hàn (VD: 설레다, 눈치, 꾸준히, 배려) hoặc nghĩa tiếng Việt..."
                    className="w-full pl-11 pr-28 py-3 text-base font-korean bg-slate-50/70 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyboard((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Hangul</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingAI || !searchInput.trim()}
                  className="px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  {isLoadingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini đang tạo 2 câu ví dụ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo 2 Câu Ví Dụ Hàn - Việt</span>
                    </>
                  )}
                </button>
              </form>

              {/* Optional Virtual Hangul Keyboard */}
              {showKeyboard && (
                <HangulKeyboard
                  value={searchInput}
                  onChange={setSearchInput}
                  onSubmit={() => handleFormSubmit()}
                  onClose={() => setShowKeyboard(false)}
                />
              )}

              {/* Quick Starter Words Row */}
              <div className="flex items-center gap-2 flex-wrap pt-4 mt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium mr-1">
                  Từ vựng gợi ý:
                </span>
                {QUICK_SUGGESTIONS.map((item) => {
                  const isActive = currentEntry.koreanWord === item.korean;
                  return (
                    <button
                      key={item.korean}
                      type="button"
                      disabled={isLoadingAI}
                      onClick={() => {
                        setSearchInput(item.korean);
                        const preloaded = savedEntries.find(
                          (e) => e.koreanWord === item.korean
                        );
                        if (preloaded && preloaded.examples.length >= 2) {
                          setCurrentEntry(preloaded);
                          setAiError(null);
                        } else {
                          analyzeWordWithGemini(item.korean, contextStyle);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? "bg-blue-50 border-blue-300 text-[#1D4ED8] font-semibold"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-korean">{item.korean}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{item.viet}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error Banner if API call fails */}
              {aiError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3 text-xs text-red-800">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Không thể hoàn tất yêu cầu với Gemini AI
                      </p>
                      <p className="mt-0.5 text-red-700">{aiError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      analyzeWordWithGemini(
                        searchInput || currentEntry.koreanWord,
                        contextStyle
                      )
                    }
                    className="px-3 py-1.5 bg-white border border-red-300 text-red-800 font-semibold rounded-md hover:bg-red-100 whitespace-nowrap"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </section>

            {/* ZONE C: Two-Zone Educational Split Workspace (8 cols Main Stage + 4 cols Practice Deck) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* LEFT / MAIN STAGE (8 columns = ~67% width) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Loading Skeleton Overlay when Gemini AI is generating */}
                {isLoadingAI ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="h-9 w-44 bg-slate-200 rounded-lg" />
                        <div className="h-4 w-72 bg-slate-100 rounded" />
                      </div>
                      <div className="h-9 w-32 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="h-24 bg-slate-100 rounded-lg" />
                      <div className="h-24 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="h-5 w-64 bg-slate-200 rounded" />
                      <div className="h-36 bg-slate-100 rounded-lg" />
                      <div className="h-36 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. Headword & Bilingual Core Meaning Panel */}
                    <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                      {/* Headword Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-3xl sm:text-4xl font-korean-serif font-semibold text-slate-900 tracking-tight">
                              {currentEntry.koreanWord}
                            </h2>
                            <button
                              type="button"
                              onClick={() =>
                                handlePlayAudio(
                                  currentEntry.koreanWord,
                                  "headword-std",
                                  false
                                )
                              }
                              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                              title="Nghe phát âm nhanh"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span>Nghe phát âm</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handlePlayAudio(
                                  currentEntry.koreanWord,
                                  "headword-ai",
                                  true
                                )
                              }
                              disabled={playingAudioId === "headword-ai"}
                              className="px-3 py-1.5 text-xs font-medium text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                              title="Phát âm chuẩn bằng giọng Gemini TTS"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>
                                {playingAudioId === "headword-ai"
                                  ? "Đang tải giọng AI..."
                                  : "Giọng chuẩn Gemini"}
                              </span>
                            </button>
                          </div>

                          {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono text-slate-700">
                              [{currentEntry.romanization} · đọc như:{" "}
                              {currentEntry.vietnamesePronunciation}]
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-slate-700">
                              {currentEntry.partOfSpeech}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{currentEntry.topikLevel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{currentEntry.hanjaOrigin}</span>
                          </div>
                        </div>

                        {/* Save & Regenerate Actions */}
                        <div className="flex items-center gap-2 self-start">
                          <button
                            type="button"
                            onClick={handleToggleSaveCurrent}
                            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                              isCurrentSaved
                                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isCurrentSaved ? (
                              <>
                                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                                <span>Đã lưu sổ từ</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-4 h-4" />
                                <span>Lưu vào sổ từ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bilingual Meaning Columns (Vietnamese Meaning + Korean Definition) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-400">
                            Nghĩa tiếng Việt (베트남어 의미)
                          </p>
                          <p className="text-lg font-semibold text-[#1D4ED8] leading-snug">
                            {currentEntry.vietnameseMeaning}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {currentEntry.vietnameseExplanation}
                          </p>
                        </div>

                        <div className="space-y-2 md:border-l md:border-slate-100 md:pl-6">
                          <p className="text-xs font-medium text-slate-400">
                            Định nghĩa bằng tiếng Hàn (한국어 사전적 의미)
                          </p>
                          <p className="text-base font-korean font-medium text-slate-900 leading-relaxed">
                            {currentEntry.koreanDefinition}
                          </p>
                          <p className="text-xs text-slate-500 pt-1">
                            Định nghĩa chuẩn Hàn-Hàn giúp bạn nắm bắt cốt lõi nghĩa gốc khi làm bài đọc hiểu TOPIK.
                          </p>
                        </div>
                      </div>

                      {/* Personal Study Note per User (Synced to Cloud Firestore) */}
                      <form
                        onSubmit={handleSavePersonalNoteForCurrent}
                        className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2.5"
                      >
                        <input
                          type="text"
                          maxLength={1000}
                          value={personalNoteDraft}
                          onChange={(e) => setPersonalNoteDraft(e.target.value)}
                          placeholder={
                            userProfile
                              ? `Ghi chú cá nhân của ${userProfile.displayName} cho từ "${currentEntry.koreanWord}" (tự động đồng bộ đám mây)...`
                              : `Thêm ghi chú cá nhân / mẹo nhớ riêng cho từ "${currentEntry.koreanWord}"...`
                          }
                          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {noteSavedFeedback
                            ? "✓ Đã lưu ghi chú"
                            : "Lưu ghi chú riêng"}
                        </button>
                      </form>
                    </article>

                    {/* 2. THE CORE REQUIREMENT: 2 AI-GENERATED BILINGUAL EXAMPLE SENTENCES */}
                    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 font-display">
                            02 Câu Ví Dụ Ngữ Cảnh &amp; Giải Nghĩa Song Ngữ Hàn - Việt
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tạo bởi Gemini AI cho từ{" "}
                            <strong className="font-korean text-slate-800">
                              &ldquo;{currentEntry.koreanWord}&rdquo;
                            </strong>{" "}
                            kèm giải nghĩa tiếng Hàn (한국어 의미) và dịch nghĩa tiếng Việt.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setClozePreviewMode((prev) => !prev)
                            }
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            {clozePreviewMode ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Hiện từ trong câu</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Ẩn từ để tự nhẩm</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              analyzeWordWithGemini(
                                currentEntry.koreanWord,
                                contextStyle
                              )
                            }
                            disabled={isLoadingAI}
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Tạo 2 câu ví dụ mới</span>
                          </button>
                        </div>
                      </div>

                      {/* Render the 2 Examples separated by clean hairline dividers */}
                      <div className="divide-y divide-slate-200/80 space-y-8">
                        {currentEntry.examples.slice(0, 2).map((example, idx) => (
                          <div
                            key={example.id || idx}
                            className={idx > 0 ? "pt-8 space-y-5" : "space-y-5"}
                          >
                            {/* Example Kicker Metadata (Zero-pill unboxed text) */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono font-semibold text-slate-900">
                                  0{idx + 1}. Câu ví dụ {idx + 1}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-700 font-medium">
                                  {example.register}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{example.contextSituation}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePlayAudio(
                                      example.koreanSentence,
                                      `ex-${idx}-std`,
                                      false
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                                  <span>Nghe câu</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePlayAudio(
                                      example.koreanSentence,
                                      `ex-${idx}-ai`,
                                      true
                                    )
                                  }
                                  disabled={playingAudioId === `ex-${idx}-ai`}
                                  className="px-2.5 py-1 text-xs font-medium text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>
                                    {playingAudioId === `ex-${idx}-ai`
                                      ? "Đang đọc..."
                                      : "Giọng AI"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Korean Sentence Display */}
                            <div className="space-y-1.5">
                              <p className="text-xl sm:text-2xl font-korean font-medium text-slate-900 leading-relaxed">
                                {renderHighlightedSentence(
                                  example.koreanSentence,
                                  example.highlightedForm
                                )}
                              </p>
                              <p className="text-xs font-mono text-slate-400">
                                {example.romanization}
                              </p>
                            </div>

                            {/* Dual Meaning Block: Meaning in Korean + Meaning in Vietnamese */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500">
                                  Nghĩa tiếng Việt (베트남어 번역)
                                </p>
                                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                                  {example.vietnameseMeaning}
                                </p>
                              </div>

                              <div className="space-y-1 md:border-l md:border-slate-200/80 md:pl-4">
                                <p className="text-xs font-semibold text-slate-500">
                                  Giải nghĩa bằng tiếng Hàn (한국어 의미 풀이)
                                </p>
                                <p className="text-sm font-korean text-slate-800 leading-relaxed">
                                  {example.koreanMeaning}
                                </p>
                              </div>
                            </div>

                            {/* Grammar & Nuance Note */}
                            <div className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-[#1D4ED8]">
                              <strong className="font-semibold text-slate-900">
                                Điểm ngữ pháp &amp; cách dùng từ:{" "}
                              </strong>
                              {example.grammarAndNuanceNote}
                            </div>

                            {/* Word-by-Word Breakdown Row */}
                            {Array.isArray(example.wordBreakdown) &&
                              example.wordBreakdown.length > 0 && (
                                <div className="pt-1">
                                  <p className="text-xs text-slate-400 mb-2">
                                    Phân tách thành phần câu:
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {example.wordBreakdown.map((chunk, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60"
                                      >
                                        <p className="text-xs font-korean font-semibold text-slate-900">
                                          {chunk.korean}
                                        </p>
                                        <p className="text-xs text-[#1D4ED8] font-medium mt-0.5">
                                          {chunk.vietnamese}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                          {chunk.role}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 3. Collocations & Synonyms/Antonyms Network */}
                    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
                      <h3 className="text-base font-semibold text-slate-900">
                        03. Cụm Từ Kết Hợp (Collocations) &amp; Mở Rộng Từ Vựng
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Collocations */}
                        <div className="space-y-2.5">
                          <p className="text-xs font-medium text-slate-400">
                            Cụm từ cố định thường đi cùng &ldquo;{currentEntry.koreanWord}&rdquo;
                          </p>
                          <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {currentEntry.collocations.map((col, idx) => (
                              <div
                                key={idx}
                                className="py-2.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePlayAudio(
                                      col.korean,
                                      `col-${idx}`,
                                      false
                                    )
                                  }
                                  className="font-korean font-semibold text-slate-900 hover:text-[#1D4ED8] flex items-center gap-1.5 text-left"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{col.korean}</span>
                                </button>
                                <span className="text-slate-600 text-right">
                                  {col.vietnamese}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Synonyms & Antonyms */}
                        <div className="space-y-4 md:border-l md:border-slate-100 md:pl-6">
                          <div>
                            <p className="text-xs font-medium text-slate-400 mb-2">
                              Từ đồng nghĩa / gần nghĩa (유의어) — Nhấp để tra cứu AI
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {currentEntry.synonyms.map((syn, idx) => {
                                const pureKorean = syn.split("(")[0].trim();
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchInput(pureKorean);
                                      analyzeWordWithGemini(
                                        pureKorean,
                                        contextStyle
                                      );
                                    }}
                                    className="px-3 py-1.5 text-xs font-korean text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-[#1D4ED8] border border-slate-200 rounded-lg transition-colors text-left"
                                  >
                                    {syn}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-400 mb-2">
                              Từ trái nghĩa (반의어)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {currentEntry.antonyms.map((ant, idx) => {
                                const pureKorean = ant.split("(")[0].trim();
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchInput(pureKorean);
                                      analyzeWordWithGemini(
                                        pureKorean,
                                        contextStyle
                                      );
                                    }}
                                    className="px-3 py-1.5 text-xs font-korean text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-[#1D4ED8] border border-slate-200 rounded-lg transition-colors text-left"
                                  >
                                    {ant}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* RIGHT / STUDY & PRACTICE DECK (4 columns = ~33% width) */}
              <aside className="lg:col-span-4 space-y-6">
                {/* 1. Interactive Sentence Builder & Gemini AI Grammar Evaluator */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-semibold text-slate-900">
                      Tự Đặt Câu &amp; AI Chấm Chữa
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hãy thử viết 1 câu tiếng Hàn có chứa từ{" "}
                      <strong className="font-korean text-slate-800">
                        &ldquo;{currentEntry.koreanWord}&rdquo;
                      </strong>
                      . Gemini AI sẽ kiểm tra ngữ pháp và độ tự nhiên giúp bạn.
                    </p>
                  </div>

                  <form
                    onSubmit={handleCheckPracticeSentence}
                    className="space-y-3"
                  >
                    <textarea
                      rows={3}
                      value={practiceSentence}
                      onChange={(e) => setPracticeSentence(e.target.value)}
                      placeholder={`Ví dụ: đặt câu với "${currentEntry.koreanWord}"...`}
                      className="w-full p-3 text-sm font-korean bg-slate-50/70 focus:bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                    <button
                      type="submit"
                      disabled={
                        isCheckingSentence || !practiceSentence.trim()
                      }
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isCheckingSentence ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini đang chấm câu...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kiểm Tra Câu Với Gemini AI</span>
                        </>
                      )}
                    </button>
                  </form>

                  {sentenceCheckError && (
                    <p className="text-xs text-red-600">{sentenceCheckError}</p>
                  )}

                  {sentenceCheckResult && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            sentenceCheckResult.isNatural
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        />
                        <span>
                          {sentenceCheckResult.isNatural
                            ? "Câu viết rất tự nhiên và đúng ngữ pháp!"
                            : "Gợi ý chỉnh sửa để câu tự nhiên hơn:"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-slate-200/80 space-y-1">
                        <p className="text-sm font-korean font-semibold text-[#1D4ED8]">
                          {sentenceCheckResult.correctedKorean}
                        </p>
                        <p className="text-slate-700 font-medium">
                          Nghĩa Việt: {sentenceCheckResult.vietnameseTranslation}
                        </p>
                        <p className="font-korean text-slate-500">
                          한국어 의미: {sentenceCheckResult.koreanExplanation}
                        </p>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        <strong>Nhận xét:</strong>{" "}
                        {sentenceCheckResult.feedbackVietnamese}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Saved & Recent Vocabulary Deck */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Sổ Từ Vựng Gần Đây
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {savedEntries.length} từ đã phân tích song ngữ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("flashcards")}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Ôn Flashcard</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                    {savedEntries.slice(0, 8).map((entry) => {
                      const isSelected =
                        entry.koreanWord === currentEntry.koreanWord;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setCurrentEntry(entry);
                            setSearchInput(entry.koreanWord);
                            setAiError(null);
                          }}
                          className={`w-full text-left py-3 px-2.5 rounded-lg transition-colors flex items-start justify-between gap-2 ${
                            isSelected
                              ? "bg-blue-50/70"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`text-base font-korean-serif font-semibold ${
                                  isSelected
                                    ? "text-[#1D4ED8]"
                                    : "text-slate-900"
                                }`}
                              >
                                {entry.koreanWord}
                              </span>
                              <span className="text-xs font-mono text-slate-400 truncate">
                                [{entry.romanization}]
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {entry.vietnameseMeaning}
                            </p>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                            {entry.examples.length} ví dụ
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayingNotebookGame(false);
                        setActiveTab("notebook");
                      }}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Chọn từ &amp; Ghép xóa thẻ (≤10) →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedNotebookIds.length === 0) {
                          setSelectedNotebookIds(
                            savedEntries.slice(0, 6).map((item) => item.id)
                          );
                        }
                        setIsPlayingNotebookGame(true);
                        setActiveTab("notebook");
                      }}
                      className="text-[#1D4ED8] hover:underline font-semibold"
                    >
                      Chơi xóa thẻ ngay
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HanViệt Lexicon — Ứng dụng học từ vựng tiếng Hàn qua ngữ cảnh song ngữ Hàn - Việt
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              className="hover:text-slate-900 transition-colors"
            >
              Tra cứu AI
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("flashcards")}
              className="hover:text-slate-900 transition-colors"
            >
              Ôn tập Flashcard
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("ui-blueprint")}
              className="hover:text-slate-900 transition-colors"
            >
              Bản thiết kế UI
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export type ContextStyle = "daily" | "topik" | "business" | "culture";

export type TargetTopikGoal =
  | "TOPIK I - Cấp 1-2"
  | "TOPIK II - Cấp 3-4"
  | "TOPIK II - Cấp 5-6"
  | "Giao tiếp Thương mại";

export type SubscriptionTier = "free" | "pro" | "enterprise";

export type ActiveViewTab =
  | "workspace"
  | "notebook"
  | "flashcards"
  | "topik"
  | "account-pro"
  | "ui-blueprint";

export interface WordBreakdownItem {
  korean: string;
  vietnamese: string;
  role: string;
}

export interface CollocationItem {
  korean: string;
  vietnamese: string;
}

export interface ExampleSentence {
  id: number;
  register: string;
  contextSituation: string;
  koreanSentence: string;
  highlightedForm: string;
  romanization: string;
  koreanMeaning: string;
  vietnameseMeaning: string;
  grammarAndNuanceNote: string;
  wordBreakdown: WordBreakdownItem[];
}

export interface VocabularyEntry {
  id: string;
  koreanWord: string;
  romanization: string;
  vietnamesePronunciation: string;
  partOfSpeech: string;
  topikLevel: string;
  hanjaOrigin: string;
  vietnameseMeaning: string;
  koreanDefinition: string;
  vietnameseExplanation: string;
  synonyms: string[];
  antonyms: string[];
  collocations: CollocationItem[];
  examples: ExampleSentence[];
  contextStyle?: ContextStyle;
  createdAt: string;
  masteryLevel?: "learning" | "reviewing" | "mastered";
  personalNote?: string;
  isSelectedForGame?: boolean;
}

export interface SentenceCheckResult {
  isNatural: boolean;
  correctedKorean: string;
  koreanExplanation: string;
  vietnameseTranslation: string;
  feedbackVietnamese: string;
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  targetTopikLevel: TargetTopikGoal;
  preferredContextStyle: ContextStyle;
  dailyGoalWords: number;
  streakDays: number;
  totalLookups: number;
  totalSentencesChecked: number;
  totalGamesCleared: number;
  subscriptionTier: SubscriptionTier;
  lastStudyDate: string;
}

export type ContextStyle = "daily" | "topik" | "business" | "culture";

export type ActiveViewTab =
  | "workspace"
  | "notebook"
  | "flashcards"
  | "topik"
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
}

export interface SentenceCheckResult {
  isNatural: boolean;
  correctedKorean: string;
  koreanExplanation: string;
  vietnameseTranslation: string;
  feedbackVietnamese: string;
}

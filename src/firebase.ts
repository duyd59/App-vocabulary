import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import {
  ContextStyle,
  SubscriptionTier,
  TargetTopikGoal,
  UserProfileData,
  VocabularyEntry,
} from "./types/vocabulary";

const customFirebaseApiKey = (
  import.meta.env?.VITE_FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  ""
).trim();

const customProjectId =
  (
    import.meta.env?.VITE_FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    ""
  ).trim() || "appvocabulary-75d41";

const resolvedFirebaseConfig = customFirebaseApiKey
  ? {
      ...firebaseConfig,
      apiKey: customFirebaseApiKey,
      projectId: customProjectId,
      authDomain:
        (
          import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ||
          process.env.VITE_FIREBASE_AUTH_DOMAIN ||
          ""
        ).trim() || `${customProjectId}.firebaseapp.com`,
      storageBucket: `${customProjectId}.firebasestorage.app`,
      appId:
        (
          import.meta.env?.VITE_FIREBASE_APP_ID ||
          process.env.VITE_FIREBASE_APP_ID ||
          ""
        ).trim() || firebaseConfig.appId,
      firestoreDatabaseId: (
        import.meta.env?.VITE_FIREBASE_DATABASE_ID ||
        process.env.VITE_FIREBASE_DATABASE_ID ||
        ""
      ).trim(),
    }
  : firebaseConfig;

const app = initializeApp(resolvedFirebaseConfig);
export const db = resolvedFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const activeFirebaseProjectId = resolvedFirebaseConfig.projectId;
export const activeFirebaseAuthDomain = resolvedFirebaseConfig.authDomain;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// Defensive Sanitization Helpers (Strictly matching firebase-blueprint.json)
// ============================================================================
export function sanitizeDocId(rawId: string): string {
  const cleaned = String(rawId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 120);
  return cleaned || `item-${Date.now()}`;
}

function clampString(val: unknown, maxLen: number, fallback = ""): string {
  const str = typeof val === "string" ? val.trim() : "";
  if (!str) return fallback.slice(0, maxLen);
  return str.slice(0, maxLen);
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================================
// Authentication Actions
// ============================================================================
export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

// ============================================================================
// User Profile Operations (/users/{userId})
// ============================================================================
export async function ensureUserProfileInCloud(
  user: User
): Promise<UserProfileData> {
  const uid = sanitizeDocId(user.uid);
  const path = `users/${uid}`;
  const userRef = doc(db, "users", uid);

  try {
    const snap = await getDoc(userRef);
    const today = getTodayIsoDate();

    if (snap.exists()) {
      const data = snap.data();
      const profile: UserProfileData = {
        uid,
        displayName: clampString(
          data.displayName,
          100,
          user.displayName || "Học viên HanViệt"
        ),
        email: clampString(
          data.email,
          150,
          user.email || "learner@example.com"
        ),
        photoURL: clampString(data.photoURL, 500, user.photoURL || ""),
        targetTopikLevel: ([
          "TOPIK I - Cấp 1-2",
          "TOPIK II - Cấp 3-4",
          "TOPIK II - Cấp 5-6",
          "Giao tiếp Thương mại",
        ].includes(data.targetTopikLevel)
          ? data.targetTopikLevel
          : "TOPIK II - Cấp 3-4") as TargetTopikGoal,
        preferredContextStyle: (["daily", "topik", "business", "culture"].includes(
          data.preferredContextStyle
        )
          ? data.preferredContextStyle
          : "daily") as ContextStyle,
        dailyGoalWords:
          typeof data.dailyGoalWords === "number"
            ? Math.min(Math.max(Math.round(data.dailyGoalWords), 1), 100)
            : 10,
        streakDays:
          typeof data.streakDays === "number"
            ? Math.max(Math.round(data.streakDays), 1)
            : 1,
        totalLookups:
          typeof data.totalLookups === "number"
            ? Math.max(Math.round(data.totalLookups), 0)
            : 0,
        totalSentencesChecked:
          typeof data.totalSentencesChecked === "number"
            ? Math.max(Math.round(data.totalSentencesChecked), 0)
            : 0,
        totalGamesCleared:
          typeof data.totalGamesCleared === "number"
            ? Math.max(Math.round(data.totalGamesCleared), 0)
            : 0,
        subscriptionTier: (["free", "pro", "enterprise"].includes(
          data.subscriptionTier
        )
          ? data.subscriptionTier
          : "free") as SubscriptionTier,
        lastStudyDate: clampString(data.lastStudyDate, 30, today),
      };
      return profile;
    }

    // Create initial UserProfile document strictly conforming to isValidUserProfile
    const newProfile: UserProfileData = {
      uid,
      displayName: clampString(
        user.displayName,
        100,
        user.email?.split("@")[0] || "Học viên HanViệt"
      ),
      email: clampString(user.email, 150, "learner@example.com"),
      photoURL: clampString(user.photoURL, 500, ""),
      targetTopikLevel: "TOPIK II - Cấp 3-4",
      preferredContextStyle: "daily",
      dailyGoalWords: 10,
      streakDays: 1,
      totalLookups: 0,
      totalSentencesChecked: 0,
      totalGamesCleared: 0,
      subscriptionTier: "free",
      lastStudyDate: today,
    };

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserPreferencesInCloud(
  uid: string,
  updates: {
    displayName: string;
    photoURL: string;
    targetTopikLevel: TargetTopikGoal;
    preferredContextStyle: ContextStyle;
    dailyGoalWords: number;
    subscriptionTier: SubscriptionTier;
  }
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const path = `users/${safeUid}`;
  const userRef = doc(db, "users", safeUid);

  try {
    await updateDoc(userRef, {
      displayName: clampString(updates.displayName, 100, "Học viên HanViệt"),
      photoURL: clampString(updates.photoURL, 500, ""),
      targetTopikLevel: updates.targetTopikLevel,
      preferredContextStyle: updates.preferredContextStyle,
      dailyGoalWords: Math.min(
        Math.max(Math.round(updates.dailyGoalWords || 10), 1),
        100
      ),
      subscriptionTier: updates.subscriptionTier,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function incrementUserStudyStatsInCloud(
  profile: UserProfileData,
  metric: "lookup" | "sentence" | "game"
): Promise<UserProfileData> {
  const safeUid = sanitizeDocId(profile.uid);
  const path = `users/${safeUid}`;
  const userRef = doc(db, "users", safeUid);
  const today = getTodayIsoDate();

  let nextStreak = profile.streakDays || 1;
  if (profile.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    nextStreak =
      profile.lastStudyDate === yesterday ? nextStreak + 1 : Math.max(nextStreak, 1);
  }

  const nextProfile: UserProfileData = {
    ...profile,
    streakDays: nextStreak,
    totalLookups:
      profile.totalLookups + (metric === "lookup" ? 1 : 0),
    totalSentencesChecked:
      profile.totalSentencesChecked + (metric === "sentence" ? 1 : 0),
    totalGamesCleared:
      profile.totalGamesCleared + (metric === "game" ? 1 : 0),
    lastStudyDate: today,
  };

  try {
    await updateDoc(userRef, {
      streakDays: nextProfile.streakDays,
      totalLookups: nextProfile.totalLookups,
      totalSentencesChecked: nextProfile.totalSentencesChecked,
      totalGamesCleared: nextProfile.totalGamesCleared,
      lastStudyDate: nextProfile.lastStudyDate,
      updatedAt: serverTimestamp(),
    });
    return nextProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================================
// User Vocabulary Subcollection Operations (/users/{userId}/vocabularies/{vocabId})
// ============================================================================
export async function saveVocabularyEntryToCloud(
  uid: string,
  entry: VocabularyEntry,
  isSelectedForGame: boolean = false
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const vocabId = sanitizeDocId(entry.id || `vocab-${Date.now()}`);
  const path = `users/${safeUid}/vocabularies/${vocabId}`;
  const vocabRef = doc(db, "users", safeUid, "vocabularies", vocabId);

  const sanitizedSynonyms = (Array.isArray(entry.synonyms) ? entry.synonyms : [])
    .slice(0, 10)
    .map((s) => clampString(s, 200, ""))
    .filter(Boolean);

  const sanitizedAntonyms = (Array.isArray(entry.antonyms) ? entry.antonyms : [])
    .slice(0, 10)
    .map((s) => clampString(s, 200, ""))
    .filter(Boolean);

  const sanitizedCollocations = (
    Array.isArray(entry.collocations) ? entry.collocations : []
  )
    .slice(0, 10)
    .map((c) => ({
      korean: clampString(c?.korean, 200, ""),
      vietnamese: clampString(c?.vietnamese, 200, ""),
    }));

  const sanitizedExamples = (
    Array.isArray(entry.examples) ? entry.examples : []
  )
    .slice(0, 5)
    .map((ex, idx) => ({
      id: typeof ex?.id === "number" ? ex.id : idx + 1,
      register: clampString(ex?.register, 120, "해요체 · Lịch sự"),
      contextSituation: clampString(ex?.contextSituation, 200, "Giao tiếp"),
      koreanSentence: clampString(ex?.koreanSentence, 400, ""),
      highlightedForm: clampString(ex?.highlightedForm, 120, ""),
      romanization: clampString(ex?.romanization, 400, ""),
      koreanMeaning: clampString(ex?.koreanMeaning, 400, ""),
      vietnameseMeaning: clampString(ex?.vietnameseMeaning, 400, ""),
      grammarAndNuanceNote: clampString(ex?.grammarAndNuanceNote, 500, ""),
      wordBreakdown: (Array.isArray(ex?.wordBreakdown) ? ex.wordBreakdown : [])
        .slice(0, 10)
        .map((wb) => ({
          korean: clampString(wb?.korean, 100, ""),
          vietnamese: clampString(wb?.vietnamese, 150, ""),
          role: clampString(wb?.role, 100, ""),
        })),
    }));

  const baseFields = {
    koreanWord: clampString(entry.koreanWord, 120, "한국어"),
    romanization: clampString(entry.romanization, 200, ""),
    vietnamesePronunciation: clampString(entry.vietnamesePronunciation, 200, ""),
    partOfSpeech: clampString(entry.partOfSpeech, 100, "어휘 · Từ vựng"),
    topikLevel: clampString(entry.topikLevel, 100, "TOPIK I–II"),
    hanjaOrigin: clampString(entry.hanjaOrigin, 200, "순우리말 · Từ thuần Hàn"),
    vietnameseMeaning: clampString(entry.vietnameseMeaning, 500, "Từ vựng tiếng Hàn"),
    koreanDefinition: clampString(entry.koreanDefinition, 1000, ""),
    vietnameseExplanation: clampString(entry.vietnameseExplanation, 2000, ""),
    masteryLevel: ["learning", "reviewing", "mastered"].includes(
      entry.masteryLevel || ""
    )
      ? entry.masteryLevel
      : "learning",
    personalNote: clampString(entry.personalNote, 1000, ""),
    isSelectedForGame: Boolean(isSelectedForGame),
    synonyms: sanitizedSynonyms,
    antonyms: sanitizedAntonyms,
    collocations: sanitizedCollocations,
    examples: sanitizedExamples,
  };

  try {
    const existingSnap = await getDoc(vocabRef);
    if (existingSnap.exists()) {
      await updateDoc(vocabRef, {
        ...baseFields,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(vocabRef, {
        vocabId,
        userId: safeUid,
        ...baseFields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateVocabularyMetaInCloud(
  uid: string,
  vocabId: string,
  updates: {
    masteryLevel: "learning" | "reviewing" | "mastered";
    personalNote: string;
    isSelectedForGame: boolean;
  }
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const safeVocabId = sanitizeDocId(vocabId);
  const path = `users/${safeUid}/vocabularies/${safeVocabId}`;
  const vocabRef = doc(db, "users", safeUid, "vocabularies", safeVocabId);

  try {
    await updateDoc(vocabRef, {
      masteryLevel: updates.masteryLevel,
      personalNote: clampString(updates.personalNote, 1000, ""),
      isSelectedForGame: Boolean(updates.isSelectedForGame),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVocabularyFromCloud(
  uid: string,
  vocabId: string
): Promise<void> {
  const safeUid = sanitizeDocId(uid);
  const safeVocabId = sanitizeDocId(vocabId);
  const path = `users/${safeUid}/vocabularies/${safeVocabId}`;
  const vocabRef = doc(db, "users", safeUid, "vocabularies", safeVocabId);

  try {
    await deleteDoc(vocabRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserVocabularies(
  uid: string,
  onReceive: (entries: VocabularyEntry[]) => void
): () => void {
  const safeUid = sanitizeDocId(uid);
  const path = `users/${safeUid}/vocabularies`;
  // Enforce resource.data.userId == request.auth.uid in the query for Pillar 8 compliance
  const q = query(
    collection(db, "users", safeUid, "vocabularies"),
    where("userId", "==", safeUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: VocabularyEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.vocabId || docSnap.id,
          koreanWord: d.koreanWord || "",
          romanization: d.romanization || "",
          vietnamesePronunciation: d.vietnamesePronunciation || "",
          partOfSpeech: d.partOfSpeech || "어휘 · Từ vựng",
          topikLevel: d.topikLevel || "TOPIK I–II",
          hanjaOrigin: d.hanjaOrigin || "순우리말 · Từ thuần Hàn",
          vietnameseMeaning: d.vietnameseMeaning || "",
          koreanDefinition: d.koreanDefinition || "",
          vietnameseExplanation: d.vietnameseExplanation || "",
          synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
          antonyms: Array.isArray(d.antonyms) ? d.antonyms : [],
          collocations: Array.isArray(d.collocations) ? d.collocations : [],
          examples: Array.isArray(d.examples) ? d.examples : [],
          masteryLevel: d.masteryLevel || "learning",
          personalNote: d.personalNote || "",
          isSelectedForGame: Boolean(d.isSelectedForGame),
          createdAt:
            d.createdAt?.toDate?.()?.toISOString?.() ||
            new Date().toISOString(),
        };
      });
      onReceive(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

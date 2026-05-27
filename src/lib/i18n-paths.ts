import { useLanguage, LangCode } from "./i18n";

type PathsTranslations = {
  // Page header
  learningPaths: string;
  roadmapsToMastery: string;
  roadmapsDesc: string;
  totalQuizzes: string;
  completedL: string;

  // Sidebar
  pctComplete: string;
  quizzesCompleted: string;

  // Roadmap details
  pctMastered: string;
  startPath: string;
  continueL: string;
  masteredL: string;

  // Next actions
  nextUnlockTier: string;
  takeQuizToUnlock: string;
  quizNow: string;

  // Stage labels
  completeL: string;
  lockedL: string;
  inProgressL: string;

  // Node statuses
  statusCompleted: string;
  statusLocked: string;
  statusAvailable: string;
  studyWithAITutor: string;
};

const en: PathsTranslations = {
  learningPaths: "Learning Paths",
  roadmapsToMastery: "Roadmaps to mastery",
  roadmapsDesc: "Your path adapts to your quiz performance in real-time. Complete quizzes to unlock higher tiers and track subject mastery.",
  totalQuizzes: "Total Quizzes",
  completedL: "completed",
  pctComplete: "complete",
  quizzesCompleted: "completed",
  pctMastered: "mastered",
  startPath: "Start Path",
  continueL: "Continue",
  masteredL: "Mastered!",
  nextUnlockTier: "Next: Unlock",
  takeQuizToUnlock: "Take a quiz to unlock",
  quizNow: "Quiz now",
  completeL: "Complete",
  lockedL: "Locked",
  inProgressL: "In Progress",
  statusCompleted: "✅ Completed",
  statusLocked: "🔒 Complete previous stage",
  statusAvailable: "▶ Available — click to study",
  studyWithAITutor: "Study with AI Tutor",
};

const hi: Partial<PathsTranslations> = {
  learningPaths: "सीखने के रास्ते",
  roadmapsToMastery: "महारत हासिल करने का रोडमैप",
  roadmapsDesc: "आपका रास्ता वास्तविक समय में आपके क्विज़ प्रदर्शन के अनुकूल होता है। उच्च स्तरों को अनलॉक करने और विषय में महारत को ट्रैक करने के लिए क्विज़ पूरे करें।",
  totalQuizzes: "कुल क्विज़",
  completedL: "पूरा हुआ",
  pctComplete: "पूर्ण",
  quizzesCompleted: "पूर्ण",
  pctMastered: "महारत हासिल",
  startPath: "रास्ता शुरू करें",
  continueL: "जारी रखें",
  masteredL: "महारत हासिल!",
  nextUnlockTier: "अगला: अनलॉक करें",
  takeQuizToUnlock: "अनलॉक करने के लिए क्विज़ लें",
  quizNow: "अभी क्विज़ लें",
  completeL: "पूर्ण",
  lockedL: "लॉक",
  inProgressL: "प्रगति पर",
  statusCompleted: "✅ पूरा हुआ",
  statusLocked: "🔒 पिछला चरण पूरा करें",
  statusAvailable: "▶ उपलब्ध — अध्ययन करने के लिए क्लिक करें",
  studyWithAITutor: "एआई ट्यूटर के साथ अध्ययन करें",
};

const mr: Partial<PathsTranslations> = {
  learningPaths: "शिकण्याचे मार्ग",
  roadmapsToMastery: "प्रभुत्वाचे मार्ग",
  roadmapsDesc: "तुमचा मार्ग रिअल-टाइममध्ये तुमच्या क्विझच्या कामगिरीनुसार बदलतो. उच्च स्तर अनलॉक करण्यासाठी आणि विषयावरील प्रभुत्व ट्रॅक करण्यासाठी क्विझ पूर्ण करा.",
  totalQuizzes: "एकूण क्विझ",
  completedL: "पूर्ण",
  pctComplete: "पूर्ण",
  quizzesCompleted: "पूर्ण",
  pctMastered: "प्रभुत्व मिळवले",
  startPath: "मार्ग सुरू करा",
  continueL: "सुरू ठेवा",
  masteredL: "प्रभुत्व मिळवले!",
  nextUnlockTier: "पुढील: अनलॉक करा",
  takeQuizToUnlock: "अनलॉक करण्यासाठी क्विझ घ्या",
  quizNow: "आता क्विझ घ्या",
  completeL: "पूर्ण",
  lockedL: "लॉक केलेले",
  inProgressL: "प्रगतीपथावर",
  statusCompleted: "✅ पूर्ण झाले",
  statusLocked: "🔒 मागील टप्पा पूर्ण करा",
  statusAvailable: "▶ उपलब्ध — अभ्यास करण्यासाठी क्लिक करा",
  studyWithAITutor: "एआय ट्यूटर सोबत अभ्यास करा",
};

function make(overrides: Partial<PathsTranslations>): PathsTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, PathsTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function usePathsLanguage() {
  const { lang } = useLanguage();
  return { tp: (key: keyof PathsTranslations) => translations[lang][key] || translations['en'][key] };
}

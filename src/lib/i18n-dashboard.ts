import { useLanguage, LangCode } from "./i18n";

type DashboardTranslations = {
  // Common
  welcomeBack: string; firstQuizTracker: string;
  quizCompleted: string; quizzesCompleted: string; keepGoing: string;
  currentStreak: string; day: string; days: string; signOut: string; loading: string;
  
  // Tips Banner
  dailyStudyTip: string;
  tip1: string; tip2: string; tip3: string; tip4: string; tip5: string; tip6: string; tip7: string;

  // Stat Cards
  statTotalXP: string; statQuizzes: string; statAccuracy: string; statLevel: string; toLevel: string;
  
  // Quick Actions
  aiTutor: string; askAny: string; aiQuiz: string; learningPaths: string; contRoadmap: string;
  
  // Graphs
  weeklyAct: string; quizzesPerDay: string; thisWeek: string;
  subjMastery: string; basedOnAcc: string; noData: string;
  
  // Insights & Activity
  recentAct: string; noActYet: string; quizL: string; accuracyL: string;
  aiInsights: string; weakDetect: string; weakRadar: string; strSignal: string;
  recNext: string; startL: string;
  
  // Badges & Leaderboard
  badgesShow: string; levelUp: string; topLearners: string; streakLeader: string;
  badge1D: string; badge2D: string; badge3D: string; badge4D: string; badge5D: string; badge6D: string;
  youL: string; askAiTutor: string; anyConcept: string;

  // Greetings
  greetMorn: string; greetAft: string; greetEve: string; greetLate: string;
  
  // Function Insights
  wInit: string; wNoCrit: string; wBelow: string;
  sInit: string; sElite: string; sHigh: string; sMom: string;
  rFirst: string; rExp: string; rRetry: string; rHard: string;
};

const en: DashboardTranslations = {
  welcomeBack: "Welcome back", firstQuizTracker: "Take your first quiz to start tracking progress.",
  quizCompleted: "You've completed", quizzesCompleted: "quizzes", keepGoing: "Keep going!",
  currentStreak: "Current streak", day: "day", days: "days", signOut: "Sign out", loading: "Loading your dashboard…",
  
  dailyStudyTip: "Daily Study Tip",
  tip1: "Study in 25-min sprints (Pomodoro method). It boosts retention by up to 40%.",
  tip2: "Teach what you've learned to someone else — the #1 way to identify gaps.",
  tip3: "Sleep consolidates memory. Reviewing notes before bed enhances recall.",
  tip4: "Start with your weakest subject first — your willpower is highest early.",
  tip5: "Active recall beats passive reading. Quiz yourself after every topic.",
  tip6: "Spaced repetition: review notes at day 1, 3, 7, 21. Science-backed.",
  tip7: "Mistakes are data. Review wrong answers — they reveal your blind spots.",

  statTotalXP: "Total XP", statQuizzes: "Quizzes", statAccuracy: "Accuracy", statLevel: "Level", toLevel: "to L",
  
  aiTutor: "AI Tutor", askAny: "Ask any STEM question", aiQuiz: "AI-generated quiz", learningPaths: "Learning Paths", contRoadmap: "Continue your roadmap",
  
  weeklyAct: "Weekly activity", quizzesPerDay: "Quizzes taken per day", thisWeek: "this week",
  subjMastery: "Subject mastery", basedOnAcc: "Based on your quiz accuracy", noData: "No data yet. Take a quiz to see your mastery.",
  
  recentAct: "Recent Activity", noActYet: "No activity yet — try the AI Tutor or take a quiz.", quizL: "Quiz:", accuracyL: "accuracy",
  aiInsights: "AI Study Insights", weakDetect: "Weakness detection & personalized suggestions", weakRadar: "Weakness Radar", strSignal: "Strength Signal",
  recNext: "Recommended Next:", startL: "Start",
  
  badgesShow: "Badges Showcase", levelUp: "Level up & unlock premium student achievements", topLearners: "Top Learners Today", streakLeader: "Streak leaderboards fr",
  badge1D: "Take 3+ quizzes", badge2D: "Solve a coding quiz", badge3D: "Solve a physics quiz", badge4D: "Solve a math quiz", badge5D: "Keep a 3-day streak", badge6D: "Submit first attempt",
  youL: "You", askAiTutor: "Ask the AI Tutor", anyConcept: "Any concept, any time",

  greetMorn: "Good morning", greetAft: "Good afternoon", greetEve: "Good evening", greetLate: "Locked in late",
  
  wInit: "Complete your first quiz to calibrate the Weakness Radar.", wNoCrit: "No critical weaknesses detected. You're mastering all active paths — keep the momentum! 🚀", wBelow: "accuracy is below your average. Focus sessions here will yield the highest score gains.",
  sInit: "Your strengths will unlock after your first challenge.", sElite: "Your logic and pattern recognition in this domain is 🔥 elite.", sHigh: "High learning resilience detected. You've earned", sMom: "Learning momentum is building. Consistency beats intensity — keep showing up daily.",
  rFirst: "Take your first quiz", rExp: "Explore", rRetry: "Retry", rHard: "Push to Hard difficulty",
};

// Generating Hindi based on the English keys for rapid native feeling (fallback used internally via make)
const hi: Partial<DashboardTranslations> = {
  welcomeBack: "वापसी पर स्वागत है", currentStreak: "वर्तमान स्ट्रीक", day: "दिन", days: "दिन", signOut: "साइन आउट", loading: "आपका डैशबोर्ड लोड हो रहा है…",
  dailyStudyTip: "दैनिक अध्ययन टिप",
  statTotalXP: "कुल XP", statQuizzes: "क्विज़", statAccuracy: "सटीकता", statLevel: "स्तर",
  aiTutor: "एआई ट्यूटर", learningPaths: "सीखने के रास्ते",
  weeklyAct: "साप्ताहिक गतिविधि", subjMastery: "विषय में महारत",
  recentAct: "हाल की गतिविधि", aiInsights: "एआई अध्ययन अंतर्दृष्टि", weakRadar: "कमजोरी रडार", strSignal: "ताकत संकेत",
  badgesShow: "बैज शोकेस", topLearners: "आज के शीर्ष शिक्षार्थी",
  greetMorn: "सुप्रभात", greetAft: "शुभ दोपहर", greetEve: "शुभ संध्या", greetLate: "देर रात तक जुटे हैं",
};

const mr: Partial<DashboardTranslations> = {
  welcomeBack: "परत स्वागत आहे", currentStreak: "सध्याची स्ट्रीक", day: "दिवस", days: "दिवस", signOut: "साइन आउट", loading: "तुमचे डॅशबोर्ड लोड होत आहे…",
  dailyStudyTip: "दैनंदिन अभ्यासाची टीप",
  statTotalXP: "एकूण XP", statQuizzes: "क्विझ", statAccuracy: "अचूकता", statLevel: "स्तर",
  aiTutor: "एआय ट्यूटर", learningPaths: "शिकण्याचे मार्ग",
  weeklyAct: "साप्ताहिक क्रियाकलाप", subjMastery: "विषयावरील प्रभुत्व",
  badgesShow: "बॅजेस शोकेस", topLearners: "आजचे सर्वोत्तम विद्यार्थी",
  greetMorn: "शुभ सकाळ", greetAft: "शुभ दुपार", greetEve: "शुभ संध्याकाळ", greetLate: "उशिरापर्यंत काम चालू",
};

function make(overrides: Partial<DashboardTranslations>): DashboardTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, DashboardTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function useDashboardLanguage() {
  const { lang } = useLanguage();
  return { td: (key: keyof DashboardTranslations) => translations[lang][key] || translations['en'][key] };
}

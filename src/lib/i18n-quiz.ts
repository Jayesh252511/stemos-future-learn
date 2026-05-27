import { useLanguage, LangCode } from "./i18n";

type QuizTranslations = {
  // Gen-Z Phrases (arrays of strings)
  genZPraises: string[];
  genZFailures: string[];

  // Intro
  quizGenTitle: string;
  testIntell1: string; testIntell2: string;
  customizeSession: string;
  
  // Selection
  chooseSubject: string; topicL: string; customizeBtn: string;
  chooseCodingLang: string; selectSyntax: string;
  selectSubtopic: string; lockInSpecific: string;
  allTopics: string; cancel: string;
  difficultyL: string;
  
  // Generator button
  genQuiz: string; generatingQuiz: string;
  
  // Active Quiz
  comboStreak: string; questionL: string; ofL: string;
  explanationL: string;
  
  // Results
  quizComplete: string; correctL: string; wrongL: string; xpGained: string; bonusL: string;
  retryFr: string; newChallenge: string;
};

const en: QuizTranslations = {
  genZPraises: [
    "You absolutely cooked this quiz! 🔥",
    "Consistency King/Queen fr 👑",
    "Lowkey mastered. Absolute W!",
    "Brain level upgraded. Locked in mode! 🧠",
    "No notes, you executed this perfectly 💯",
    "XP farming in progress. We love to see it! 🚀",
  ],
  genZFailures: [
    "Not quite cooking yet, but we go again! 🫡",
    "XP crop was a bit dry, let's farming again!",
    "Lowkey struggling but the comeback is personal.",
    "Streak saver active, try another round!",
  ],
  quizGenTitle: "Quiz Generator 2.0",
  testIntell1: "Test your", testIntell2: "STEM intelligence",
  customizeSession: "Customize your study session. AI generates 5 high-fidelity questions tailored exactly to your focus.",
  chooseSubject: "Choose a subject", topicL: "Topic:", customizeBtn: "Customize →",
  chooseCodingLang: "Choose Coding Language", selectSyntax: "Select the syntax you want to challenge yourself with.",
  selectSubtopic: "Select Subtopic for", lockInSpecific: "Lock in a specific domain for laser-focused practice.",
  allTopics: "All Topics", cancel: "Cancel",
  difficultyL: "Difficulty",
  genQuiz: "Generate Quiz", generatingQuiz: "Generating your quiz…",
  comboStreak: "COMBO STREAK 🔥", questionL: "Question", ofL: "of",
  explanationL: "Explanation:",
  quizComplete: "Quiz Complete!", correctL: "Correct", wrongL: "Wrong", xpGained: "XP Gained", bonusL: " (Bonus!)",
  retryFr: "Retry fr", newChallenge: "New challenge",
};

const hi: Partial<QuizTranslations> = {
  genZPraises: [
    "आपने बिल्कुल धूम मचा दी! 🔥",
    "कंसिस्टेंसी किंग/क्वीन 👑",
    "महारत हासिल कर ली! 💯",
    "दिमाग का लेवल बढ़ गया! 🧠",
    "एकदम परफेक्ट! 💯",
    "XP की खेती चल रही है! 🚀",
  ],
  genZFailures: [
    "अभी पूरी तरह से नहीं, लेकिन हम फिर से कोशिश करेंगे! 🫡",
    "XP फसल थोड़ी सूखी थी, चलो फिर से खेती करें!",
    "थोड़ी मुश्किल हो रही है, लेकिन वापसी शानदार होगी।",
    "एक और राउंड ट्राई करें!",
  ],
  quizGenTitle: "क्विज़ जेनरेटर 2.0",
  testIntell1: "अपनी", testIntell2: "STEM बुद्धिमत्ता का परीक्षण करें",
  customizeSession: "अपने अध्ययन सत्र को अनुकूलित करें। AI आपके फोकस के बिल्कुल अनुरूप 5 प्रश्न तैयार करता है।",
  chooseSubject: "एक विषय चुनें", topicL: "विषय:", customizeBtn: "कस्टमाइज़ करें →",
  chooseCodingLang: "कोडिंग भाषा चुनें", selectSyntax: "वह सिंटैक्स चुनें जिसके साथ आप खुद को चुनौती देना चाहते हैं।",
  selectSubtopic: "के लिए उप-विषय चुनें", lockInSpecific: "लेजर-केंद्रित अभ्यास के लिए एक विशिष्ट डोमेन चुनें।",
  allTopics: "सभी विषय", cancel: "रद्द करें",
  difficultyL: "कठिनाई",
  genQuiz: "क्विज़ उत्पन्न करें", generatingQuiz: "आपकी क्विज़ उत्पन्न हो रही है…",
  comboStreak: "कॉम्बो स्ट्रीक 🔥", questionL: "प्रश्न", ofL: "में से",
  explanationL: "व्याख्या:",
  quizComplete: "क्विज़ पूरा हुआ!", correctL: "सही", wrongL: "गलत", xpGained: "प्राप्त XP", bonusL: " (बोनस!)",
  retryFr: "फिर से प्रयास करें", newChallenge: "नई चुनौती",
};

const mr: Partial<QuizTranslations> = {
  quizGenTitle: "क्विझ जनरेटर 2.0",
  testIntell1: "तुमची", testIntell2: "STEM बुद्धिमत्ता तपासा",
  chooseSubject: "एक विषय निवडा", topicL: "विषय:", customizeBtn: "सानुकूलित करा →",
  chooseCodingLang: "कोडिंग भाषा निवडा", selectSubtopic: "साठी उपविषय निवडा",
  allTopics: "सर्व विषय", cancel: "रद्द करा",
  difficultyL: "काठिण्य पातळी",
  genQuiz: "क्विझ तयार करा", generatingQuiz: "तुमची क्विझ तयार होत आहे…",
  comboStreak: "कॉम्बो स्ट्रीक 🔥", questionL: "प्रश्न", ofL: "पैकी",
  explanationL: "स्पष्टीकरण:",
  quizComplete: "क्विझ पूर्ण झाले!", correctL: "बरोबर", wrongL: "चूक", xpGained: "मिळवलेले XP", bonusL: " (बोनस!)",
  retryFr: "पुन्हा प्रयत्न करा", newChallenge: "नवीन आव्हान",
};

function make(overrides: Partial<QuizTranslations>): QuizTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, QuizTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function useQuizLanguage() {
  const { lang } = useLanguage();
  return { tq: (key: keyof QuizTranslations) => translations[lang][key] || translations['en'][key] };
}

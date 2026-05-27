import { useLanguage, LangCode } from "./i18n";

type TutorTranslations = {
  emptyChats: string;
  youL: string;
  deleteL: string;
  onlineRepliesIn: string;
  stemosTutor: string;
  helpMeWith: string;
  topics: { name: string; key: string }[];
  suggestions: string[][];
};

const en: TutorTranslations = {
  emptyChats: "Your chats will appear here.",
  youL: "You",
  deleteL: "Delete",
  onlineRepliesIn: "Online · Replies in",
  stemosTutor: "STEMOS Smart Tutor",
  helpMeWith: "Help me with",
  topics: [
    { name: "Physics", key: "Physics" },
    { name: "Math", key: "Math" },
    { name: "Chemistry", key: "Chemistry" },
    { name: "Coding", key: "Coding" },
  ],
  suggestions: [
    [
      "Explain quantum entanglement like I'm 15",
      "Solve: ∫ x·sin(x) dx step by step",
      "Why does ice float on water?",
      "Write a Python function for binary search",
    ],
    [
      "What is Newton's third law with examples?",
      "How do you find eigenvalues?",
      "Explain acid-base reactions simply",
      "What's the difference between a list and a tuple?",
    ],
    [
      "Explain photosynthesis step by step",
      "What is Euler's formula e^(iπ) + 1 = 0?",
      "How does a nuclear reactor work?",
      "Explain Big O notation with examples",
    ],
  ],
};

const hi: Partial<TutorTranslations> = {
  emptyChats: "आपकी चैट यहां दिखाई देंगी।",
  youL: "आप",
  deleteL: "हटाएं",
  onlineRepliesIn: "ऑनलाइन · उत्तर",
  stemosTutor: "STEMOS स्मार्ट ट्यूटर",
  helpMeWith: "मेरी मदद करें",
  topics: [
    { name: "भौतिक विज्ञान", key: "Physics" },
    { name: "गणित", key: "Math" },
    { name: "रसायन विज्ञान", key: "Chemistry" },
    { name: "कोडिंग", key: "Coding" },
  ],
  suggestions: [
    ["क्वांटम उलझाव क्या है?", "∫ x·sin(x) dx हल करें", "बर्फ पानी पर क्यों तैरती है?", "Python में binary search लिखें"],
    ["न्यूटन का तीसरा नियम समझाएं", "eigenvalues कैसे निकालते हैं?", "अम्ल-क्षार अभिक्रिया सरल भाषा में", "list और tuple का अंतर"],
  ],
};

const mr: Partial<TutorTranslations> = {
  emptyChats: "तुमचे चॅट्स येथे दिसतील.",
  youL: "तुम्ही",
  deleteL: "हटवा",
  onlineRepliesIn: "ऑनलाइन · उत्तरे",
  stemosTutor: "STEMOS स्मार्ट ट्यूटर",
  helpMeWith: "मला मदत करा",
  topics: [
    { name: "भौतिकशास्त्र", key: "Physics" },
    { name: "गणित", key: "Math" },
    { name: "रसायनशास्त्र", key: "Chemistry" },
    { name: "कोडिंग", key: "Coding" },
  ],
  suggestions: [
    ["क्वांटम एन्टँगलमेंट काय आहे?", "∫ x·sin(x) dx सोडवा", "बर्फ पाण्यावर का तरतो?", "Python मध्ये binary search लिहा"],
  ],
};

function make(overrides: Partial<TutorTranslations>): TutorTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, TutorTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function useTutorLanguage() {
  const { lang } = useLanguage();
  return { tt: (key: keyof TutorTranslations) => translations[lang][key] || translations['en'][key] };
}

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LangCode =
  | "en" | "hi" | "mr" | "ta" | "te" | "bn" | "gu" | "kn" | "ml" | "pa" | "ur"
  | "es" | "fr" | "de" | "ja" | "ko" | "ar";

export type LangMeta = {
  code: LangCode;
  name: string;       // native name
  label: string;      // English label
  flag: string;
  rtl?: boolean;
};

export const LANGUAGES: LangMeta[] = [
  { code: "en", name: "English",      label: "English",    flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी",       label: "Hindi",      flag: "🇮🇳" },
  { code: "mr", name: "मराठी",        label: "Marathi",    flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்",        label: "Tamil",      flag: "🇮🇳" },
  { code: "te", name: "తెలుగు",       label: "Telugu",     flag: "🇮🇳" },
  { code: "bn", name: "বাংলা",        label: "Bengali",    flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી",      label: "Gujarati",   flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ",        label: "Kannada",    flag: "🇮🇳" },
  { code: "ml", name: "മലയാളം",       label: "Malayalam",  flag: "🇮🇳" },
  { code: "pa", name: "ਪੰਜਾਬੀ",       label: "Punjabi",    flag: "🇮🇳" },
  { code: "ur", name: "اردو",         label: "Urdu",       flag: "🇵🇰", rtl: true },
  { code: "es", name: "Español",      label: "Spanish",    flag: "🇪🇸" },
  { code: "fr", name: "Français",     label: "French",     flag: "🇫🇷" },
  { code: "de", name: "Deutsch",      label: "German",     flag: "🇩🇪" },
  { code: "ja", name: "日本語",        label: "Japanese",   flag: "🇯🇵" },
  { code: "ko", name: "한국어",        label: "Korean",     flag: "🇰🇷" },
  { code: "ar", name: "العربية",      label: "Arabic",     flag: "🇸🇦", rtl: true },
];

// Full AI language name for system prompt injection
export const AI_LANG_NAME: Record<LangCode, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu",
  bn: "Bengali", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
  ur: "Urdu", es: "Spanish", fr: "French", de: "German", ja: "Japanese",
  ko: "Korean", ar: "Arabic",
};

// ── Translation keys ─────────────────────────────────────────────────────────
type Translations = {
  // Nav
  home: string; tutor: string; quizzes: string; paths: string; dashboard: string;
  signIn: string; signOut: string; getStarted: string;
  // Hero / Home
  heroTitle: string; heroSub: string; startLearning: string; tryAiTutor: string;
  goToDashboard: string; noCardRequired: string;
  // Dashboard
  welcomeBack: string; currentStreak: string; totalXP: string; accuracy: string;
  level: string; weeklyActivity: string; subjectMastery: string; recentActivity: string;
  aiInsights: string; weaknessRadar: string; strengthSignal: string;
  quizzesLabel: string; badgesShowcase: string; topLearners: string;
  dailyTip: string; quickActions: string; continuePath: string;
  // Tutor
  whatToLearn: string; askAnything: string; thinking: string; stopGenerate: string;
  newChat: string; recentChats: string; explainSimply: string; realWorldEx: string;
  createQuiz: string; summarize: string; goDeeper: string; quickFlashcard: string;
  poweredBy: string; tutorDisclaimer: string; showDifferent: string;
  // Quiz
  chooseSubject: string; difficulty: string; generateQuiz: string; generating: string;
  question: string; of: string; correct: string; wrong: string; xpGained: string;
  quizComplete: string; retry: string; newChallenge: string; explanation: string;
  easy: string; medium: string; hard: string;
  allTopics: string; cancel: string; chooseLang: string; selectSubtopic: string;
  // Paths
  learningPaths: string; roadmapsToMastery: string; pathsDesc: string;
  beginner: string; intermediate: string; advanced: string;
  completed: string; locked: string; inProgress: string; available: string;
  startPath: string; continue: string; mastered: string; studyWithTutor: string;
  totalQuizzes: string;
  // Auth
  createAccount: string; emailLabel: string; passwordLabel: string; nameLabel: string;
  alreadyHaveAccount: string; dontHaveAccount: string; signInTitle: string;
  signInSubtitle: string; signUpSubtitle: string;
  // Language
  language: string; searchLanguage: string;
  // Gamification & Gen-Z
  badgeQuizGrinder: string; badgeCodingWarrior: string; badgeMathMaster: string;
  badgePhysicsPro: string; badgeConsistencyKing: string; badgeLockedInLearner: string;
  genZCooked: string; genZLockedIn: string; genZBrainXP: string; genZLowkey: string; genZGrind: string;
  dayStreak: string; seeYouTomorrow: string; beta: string;
  noLangsFound: string; aiRespondsIn: string;
};

type TranslationMap = Record<LangCode, Translations>;

const en: Translations = {
  home:"Home", tutor:"AI Tutor", quizzes:"Quizzes", paths:"Paths", dashboard:"Dashboard",
  signIn:"Sign in", signOut:"Sign out", getStarted:"Get started",
  heroTitle:"The Future of STEM Learning", heroSub:"An AI-powered learning OS that adapts to how you think.",
  startLearning:"Start Learning Free", tryAiTutor:"Try AI Tutor", goToDashboard:"Go to Dashboard",
  noCardRequired:"No credit card required · Free for students · Join 120K+ learners",
  welcomeBack:"Welcome back", currentStreak:"Current streak", totalXP:"Total XP",
  accuracy:"Accuracy", level:"Level", weeklyActivity:"Weekly activity",
  subjectMastery:"Subject mastery", recentActivity:"Recent Activity", aiInsights:"AI Study Insights",
  weaknessRadar:"Weakness Radar", strengthSignal:"Strength Signal", quizzesLabel:"Quizzes",
  badgesShowcase:"Badges Showcase", topLearners:"Top Learners Today", dailyTip:"Daily Study Tip",
  quickActions:"Quick Actions", continuePath:"Continue Path",
  whatToLearn:"What do you want to learn today?",
  askAnything:"Ask anything in STEM… (Shift+Enter for newline)",
  thinking:"Thinking…", stopGenerate:"Stop", newChat:"New chat", recentChats:"Recent",
  explainSimply:"Explain Simply", realWorldEx:"Real World Example", createQuiz:"Create Quiz",
  summarize:"Summarize", goDeeper:"Go Deeper", quickFlashcard:"Quick Flashcard",
  poweredBy:"STEMOS Tutor · Powered by Groq",
  tutorDisclaimer:"STEMOS may produce inaccurate information. Always verify important answers.",
  showDifferent:"Show different suggestions",
  chooseSubject:"Choose a subject", difficulty:"Difficulty", generateQuiz:"Generate customized quiz",
  generating:"Generating your quiz…", question:"Question", of:"of", correct:"Correct",
  wrong:"Wrong", xpGained:"XP Gained", quizComplete:"Quiz complete!", retry:"Retry",
  newChallenge:"New challenge", explanation:"Explanation", easy:"Easy", medium:"Medium", hard:"Hard",
  allTopics:"All Topics", cancel:"Cancel", chooseLang:"Choose Coding Language",
  selectSubtopic:"Select Subtopic",
  learningPaths:"Learning Paths", roadmapsToMastery:"Roadmaps to mastery",
  pathsDesc:"Your path adapts to your quiz performance in real-time.",
  beginner:"Beginner", intermediate:"Intermediate", advanced:"Advanced",
  completed:"Completed", locked:"Locked (Complete previous stage)", inProgress:"In Progress",
  available:"Available to learn", startPath:"Start Path", continue:"Continue",
  mastered:"Mastered!", studyWithTutor:"Study with AI Tutor", totalQuizzes:"Total Quizzes",
  createAccount:"Create your account", emailLabel:"Email", passwordLabel:"Password",
  nameLabel:"Name", alreadyHaveAccount:"Already have an account?",
  dontHaveAccount:"Don't have an account?", signInTitle:"Sign in to STEMOS",
  signInSubtitle:"Sign in to pick up where you left off.", signUpSubtitle:"Start learning STEM with your personal AI tutor.",
  language:"Language", searchLanguage:"Search language…",
  badgeQuizGrinder: "Quiz Grinder", badgeCodingWarrior: "Coding Warrior", badgeMathMaster: "Math Master",
  badgePhysicsPro: "Physics Pro", badgeConsistencyKing: "Consistency King", badgeLockedInLearner: "Locked In Learner",
  genZCooked: "You cooked this quiz 🔥", genZLockedIn: "Locked in mode 🧠", genZBrainXP: "Brain XP upgraded 🚀",
  genZLowkey: "Lowkey mastering ", genZGrind: " grind continues 📈",
  dayStreak: "day streak", seeYouTomorrow: "See you tomorrow! 👋", beta: "Beta",
  noLangsFound: "No languages found", aiRespondsIn: "AI responds in selected language",
};

// Compact helper for missing translations
function make(overrides: Partial<Translations>): Translations {
  return { ...en, ...overrides };
}

const hi = make({
  home:"होम", tutor:"AI ट्यूटर", quizzes:"क्विज़", paths:"पाठ्यक्रम", dashboard:"डैशबोर्ड",
  signIn:"साइन इन", signOut:"साइन आउट", getStarted:"शुरू करें",
  heroTitle:"STEM शिक्षा का भविष्य", heroSub:"एक AI-संचालित लर्निंग OS जो आपकी सोच के अनुसार ढलता है।",
  startLearning:"मुफ्त में सीखना शुरू करें", tryAiTutor:"AI ट्यूटर आज़माएं", goToDashboard:"डैशबोर्ड पर जाएं",
  noCardRequired:"कोई क्रेडिट कार्ड नहीं · छात्रों के लिए मुफ्त",
  welcomeBack:"वापसी पर स्वागत है", currentStreak:"वर्तमान स्ट्रीक", totalXP:"कुल XP",
  accuracy:"सटीकता", level:"स्तर", weeklyActivity:"साप्ताहिक गतिविधि",
  subjectMastery:"विषय महारत", recentActivity:"हाल की गतिविधि", aiInsights:"AI अध्ययन अंतर्दृष्टि",
  weaknessRadar:"कमजोरी रडार", strengthSignal:"ताकत संकेत", quizzesLabel:"क्विज़",
  badgesShowcase:"बैज शोकेस", topLearners:"आज के शीर्ष शिक्षार्थी", dailyTip:"दैनिक अध्ययन टिप",
  quickActions:"त्वरित क्रियाएं", continuePath:"पाठ्यक्रम जारी रखें",
  whatToLearn:"आप आज क्या सीखना चाहते हैं?",
  askAnything:"STEM में कुछ भी पूछें…",
  thinking:"सोच रहा हूँ…", stopGenerate:"रोकें", newChat:"नई चैट", recentChats:"हाल की",
  explainSimply:"सरल भाषा में समझाएं", realWorldEx:"वास्तविक उदाहरण", createQuiz:"क्विज़ बनाएं",
  summarize:"सारांश", goDeeper:"गहराई में जाएं", quickFlashcard:"त्वरित फ्लैशकार्ड",
  poweredBy:"STEMOS ट्यूटर · Groq द्वारा संचालित",
  tutorDisclaimer:"STEMOS गलत जानकारी दे सकता है। महत्वपूर्ण उत्तरों की जांच करें।",
  showDifferent:"अन्य सुझाव दिखाएं",
  chooseSubject:"विषय चुनें", difficulty:"कठिनाई", generateQuiz:"कस्टम क्विज़ बनाएं",
  generating:"आपकी क्विज़ बन रही है…", question:"प्रश्न", of:"में से", correct:"सही",
  wrong:"गलत", xpGained:"XP अर्जित", quizComplete:"क्विज़ पूरी हुई!", retry:"फिर कोशिश करें",
  newChallenge:"नई चुनौती", explanation:"व्याख्या", easy:"आसान", medium:"मध्यम", hard:"कठिन",
  allTopics:"सभी विषय", cancel:"रद्द करें", chooseLang:"कोडिंग भाषा चुनें",
  selectSubtopic:"उपविषय चुनें",
  learningPaths:"शिक्षण पथ", roadmapsToMastery:"महारत की राह",
  pathsDesc:"आपका पथ आपके प्रदर्शन के अनुसार ढलता है।",
  beginner:"शुरुआती", intermediate:"मध्यवर्ती", advanced:"उन्नत",
  completed:"पूर्ण", locked:"बंद (पिछला चरण पूरा करें)", inProgress:"प्रगति में",
  available:"सीखने के लिए उपलब्ध", startPath:"पथ शुरू करें", continue:"जारी रखें",
  mastered:"महारत हासिल!", studyWithTutor:"AI ट्यूटर से पढ़ें", totalQuizzes:"कुल क्विज़",
  createAccount:"अपना खाता बनाएं", emailLabel:"ईमेल", passwordLabel:"पासवर्ड",
  nameLabel:"नाम", alreadyHaveAccount:"पहले से खाता है?",
  dontHaveAccount:"खाता नहीं है?", signInTitle:"STEMOS में साइन इन करें",
  signInSubtitle:"जहां से छोड़ा था, वहीं से शुरू करने के लिए साइन इन करें।", signUpSubtitle:"अपने निजी AI ट्यूटर के साथ STEM सीखना शुरू करें।",
  genZCooked: "गजब क्विज़ किया 🔥", genZLockedIn: "लॉक-इन मोड 🧠", genZBrainXP: "ब्रेन XP अपग्रेड 🚀",
  genZLowkey: "धीमे से महारत ", genZGrind: " ग्राइंड जारी 📈",
  dayStreak: "दिन स्ट्रीक", seeYouTomorrow: "कल मिलते हैं! 👋", beta: "बीटा",
  noLangsFound: "कोई भाषा नहीं मिली", aiRespondsIn: "AI चुनी हुई भाषा में उत्तर देगा",
  language:"भाषा", searchLanguage:"भाषा खोजें…",
});

const mr = make({
  home:"मुख्यपृष्ठ", tutor:"AI शिक्षक", quizzes:"प्रश्नमंजुषा", paths:"शिकण्याचे मार्ग", dashboard:"डॅशबोर्ड",
  signIn:"साइन इन", signOut:"साइन आउट", getStarted:"सुरुवात करा",
  heroTitle:"STEM शिक्षणाचे भविष्य", heroSub:"एक AI-चालित शिक्षण प्रणाली जी तुमच्या विचारांनुसार बदलते.",
  startLearning:"मोफत शिकणे सुरू करा", tryAiTutor:"AI शिक्षक वापरा", goToDashboard:"डॅशबोर्डवर जा",
  noCardRequired:"क्रेडिट कार्ड नाही · विद्यार्थ्यांसाठी मोफत",
  welcomeBack:"परत स्वागत आहे", currentStreak:"सध्याची streak", totalXP:"एकूण XP",
  accuracy:"अचूकता", level:"स्तर", weeklyActivity:"साप्ताहिक क्रियाकलाप",
  subjectMastery:"विषय प्रभुत्व", recentActivity:"अलीकडील क्रियाकलाप", aiInsights:"AI अभ्यास अंतर्दृष्टी",
  weaknessRadar:"कमकुवत रडार", strengthSignal:"ताकद संकेत", quizzesLabel:"प्रश्नमंजुषा",
  badgesShowcase:"बॅज प्रदर्शन", topLearners:"आजचे शीर्ष शिकणारे", dailyTip:"दैनिक अभ्यास टिप",
  quickActions:"जलद क्रिया", continuePath:"मार्ग सुरू ठेवा",
  whatToLearn:"आज तुम्हाला काय शिकायचे आहे?",
  askAnything:"STEM मध्ये काहीही विचारा…",
  thinking:"विचार करत आहे…", stopGenerate:"थांबवा", newChat:"नवीन चॅट", recentChats:"अलीकडील",
  explainSimply:"सोप्या भाषेत समजावा", realWorldEx:"वास्तविक उदाहरण", createQuiz:"प्रश्नमंजुषा तयार करा",
  summarize:"सारांश", goDeeper:"अधिक खोलात जा", quickFlashcard:"जलद फ्लॅशकार्ड",
  poweredBy:"STEMOS शिक्षक · Groq द्वारे चालित",
  tutorDisclaimer:"STEMOS चुकीची माहिती देऊ शकतो. महत्त्वाची उत्तरे तपासा.",
  showDifferent:"वेगळे सुचवणे दाखवा",
  chooseSubject:"विषय निवडा", difficulty:"कठीणता", generateQuiz:"सानुकूल प्रश्नमंजुषा तयार करा",
  generating:"तुमची प्रश्नमंजुषा तयार होत आहे…", question:"प्रश्न", of:"पैकी", correct:"बरोबर",
  wrong:"चुकीचे", xpGained:"XP मिळाले", quizComplete:"प्रश्नमंजुषा पूर्ण!", retry:"पुन्हा प्रयत्न करा",
  newChallenge:"नवीन आव्हान", explanation:"स्पष्टीकरण", easy:"सोपे", medium:"मध्यम", hard:"कठीण",
  allTopics:"सर्व विषय", cancel:"रद्द करा", chooseLang:"कोडिंग भाषा निवडा",
  selectSubtopic:"उपविषय निवडा",
  learningPaths:"शिकण्याचे मार्ग", roadmapsToMastery:"प्रभुत्वाचा रस्ता",
  pathsDesc:"तुमचा मार्ग तुमच्या कामगिरीनुसार बदलतो.",
  beginner:"नवशिके", intermediate:"मध्यवर्ती", advanced:"प्रगत",
  completed:"पूर्ण", locked:"बंद (मागील टप्पा पूर्ण करा)", inProgress:"प्रगतीत",
  available:"शिकण्यासाठी उपलब्ध", startPath:"मार्ग सुरू करा", continue:"सुरू ठेवा",
  mastered:"प्रभुत्व मिळवले!", studyWithTutor:"AI शिक्षकासह शिका", totalQuizzes:"एकूण प्रश्नमंजुषा",
  createAccount:"तुमचे खाते तयार करा", emailLabel:"ईमेल", passwordLabel:"पासवर्ड",
  nameLabel:"नाव", alreadyHaveAccount:"आधीच खाते आहे?",
  dontHaveAccount:"खाते नाही?", signInTitle:"STEMOS मध्ये साइन इन करा",
  language:"भाषा", searchLanguage:"भाषा शोधा…",
});

const ta = make({
  home:"முகப்பு", tutor:"AI ஆசிரியர்", quizzes:"வினாடி வினா", paths:"கற்றல் பாதை", dashboard:"டாஷ்போர்டு",
  signIn:"உள்நுழைக", signOut:"வெளியேறு", getStarted:"தொடங்குங்கள்",
  heroTitle:"STEM கல்வியின் எதிர்காலம்",
  startLearning:"இலவசமாக கற்கத் தொடங்குங்கள்", tryAiTutor:"AI ஆசிரியரை முயற்சிக்கவும்",
  goToDashboard:"டாஷ்போர்டுக்கு செல்லுங்கள்",
  whatToLearn:"நீங்கள் இன்று என்ன கற்க விரும்புகிறீர்கள்?",
  askAnything:"STEM இல் எதையும் கேளுங்கள்…",
  thinking:"சிந்திக்கிறேன்…", newChat:"புதிய அரட்டை",
  quizComplete:"வினாடி வினா முடிந்தது!", language:"மொழி", searchLanguage:"மொழி தேடுங்கள்…",
  beginner:"தொடக்கநிலை", intermediate:"இடைநிலை", advanced:"மேம்பட்ட",
  difficulty:"சிரமம்", easy:"எளிது", medium:"நடுத்தரம்", hard:"கடினம்",
});

const te = make({
  home:"హోమ్", tutor:"AI ట్యూటర్", quizzes:"క్విజ్", paths:"నేర్చుకోవడం మార్గాలు", dashboard:"డాష్‌బోర్డ్",
  signIn:"సైన్ ఇన్", signOut:"సైన్ అవుట్", getStarted:"ప్రారంభించండి",
  heroTitle:"STEM అభ్యాసం యొక్క భవిష్యత్తు",
  startLearning:"ఉచితంగా నేర్చుకోండి", tryAiTutor:"AI ట్యూటర్‌ని ప్రయత్నించండి",
  goToDashboard:"డాష్‌బోర్డ్‌కి వెళ్ళండి",
  whatToLearn:"మీరు ఈరోజు ఏమి నేర్చుకోవాలనుకుంటున్నారు?",
  askAnything:"STEM లో ఏదైనా అడగండి…",
  thinking:"ఆలోచిస్తున్నాను…", newChat:"కొత్త చాట్",
  quizComplete:"క్విజ్ పూర్తయింది!", language:"భాష", searchLanguage:"భాష వెతకండి…",
  beginner:"ప్రారంభకుడు", intermediate:"మధ్యవర్తి", advanced:"అభివృద్ధి చెందిన",
  difficulty:"కష్టం", easy:"సులభం", medium:"మధ్యస్తం", hard:"కష్టమైన",
});

const bn = make({
  home:"হোম", tutor:"AI শিক্ষক", quizzes:"কুইজ", paths:"শিক্ষার পথ", dashboard:"ড্যাশবোর্ড",
  signIn:"সাইন ইন", signOut:"সাইন আউট", getStarted:"শুরু করুন",
  heroTitle:"STEM শিক্ষার ভবিষ্যৎ",
  startLearning:"বিনামূল্যে শিখুন", tryAiTutor:"AI শিক্ষক ব্যবহার করুন",
  goToDashboard:"ড্যাশবোর্ডে যান",
  whatToLearn:"আজ আপনি কী শিখতে চান?",
  askAnything:"STEM এ যেকোনো কিছু জিজ্ঞেস করুন…",
  thinking:"ভাবছি…", newChat:"নতুন চ্যাট",
  quizComplete:"কুইজ সম্পন্ন!", language:"ভাষা", searchLanguage:"ভাষা খুঁজুন…",
  beginner:"শিক্ষানবিস", intermediate:"মধ্যবর্তী", advanced:"উন্নত",
  difficulty:"কঠিনতা", easy:"সহজ", medium:"মাঝারি", hard:"কঠিন",
});

const gu = make({
  home:"હોમ", tutor:"AI ટ્યૂટર", quizzes:"ક્વિઝ", paths:"શીખવાના માર્ગ", dashboard:"ડૅશબૉર્ડ",
  signIn:"સાઇન ઇન", signOut:"સાઇન આઉટ", getStarted:"શરૂ કરો",
  heroTitle:"STEM શિક્ષણનું ભવિષ્ય",
  startLearning:"મફતમાં શીખો", tryAiTutor:"AI ટ્યૂટર અજમાવો",
  goToDashboard:"ડૅશબૉર્ડ પર જાઓ",
  whatToLearn:"આજે તમે શું શીખવા માગો છો?",
  askAnything:"STEM માં ગમે તે પૂછો…",
  thinking:"વિચારી રહ્યો છું…", newChat:"નવી ચેટ",
  quizComplete:"ક્વિઝ પૂર્ણ!", language:"ભાષા", searchLanguage:"ભાષા શોધો…",
  beginner:"નવા", intermediate:"મધ્યવર્તી", advanced:"અદ્યતન",
  difficulty:"મુશ્કેલી", easy:"સહેલું", medium:"મધ્યમ", hard:"મુશ્કેલ",
});

const kn = make({
  home:"ಮುಖಪುಟ", tutor:"AI ಶಿಕ್ಷಕ", quizzes:"ರಸಪ್ರಶ್ನೆ", paths:"ಕಲಿಕಾ ಮಾರ್ಗ", dashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  signIn:"ಸೈನ್ ಇನ್", signOut:"ಸೈನ್ ಔಟ್", getStarted:"ಪ್ರಾರಂಭಿಸಿ",
  heroTitle:"STEM ಶಿಕ್ಷಣದ ಭವಿಷ್ಯ",
  startLearning:"ಉಚಿತವಾಗಿ ಕಲಿಯಿರಿ", tryAiTutor:"AI ಶಿಕ್ಷಕ ಪ್ರಯತ್ನಿಸಿ",
  goToDashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ",
  whatToLearn:"ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?",
  askAnything:"STEM ನಲ್ಲಿ ಏನನ್ನಾದರೂ ಕೇಳಿ…",
  thinking:"ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ…", newChat:"ಹೊಸ ಚಾಟ್",
  quizComplete:"ರಸಪ್ರಶ್ನೆ ಪೂರ್ಣಗೊಂಡಿದೆ!", language:"ಭಾಷೆ", searchLanguage:"ಭಾಷೆ ಹುಡುಕಿ…",
  beginner:"ಆರಂಭಿಕ", intermediate:"ಮಧ್ಯಂತರ", advanced:"ಮುಂದುವರಿದ",
  difficulty:"ಕಷ್ಟ", easy:"ಸುಲಭ", medium:"ಮಧ್ಯಮ", hard:"ಕಷ್ಟ",
});

const ml = make({
  home:"ഹോം", tutor:"AI ട്യൂട്ടർ", quizzes:"ക്വിസ്", paths:"പഠന പഥം", dashboard:"ഡാഷ്‌ബോർഡ്",
  signIn:"സൈൻ ഇൻ", signOut:"സൈൻ ഔട്ട്", getStarted:"ആരംഭിക്കുക",
  heroTitle:"STEM പഠനത്തിന്റെ ഭാവി",
  startLearning:"സൗജന്യമായി പഠിക്കുക", tryAiTutor:"AI ട്യൂട്ടർ പരീക്ഷിക്കുക",
  goToDashboard:"ഡാഷ്‌ബോർഡിലേക്ക് പോകുക",
  whatToLearn:"ഇന്ന് നിങ്ങൾ എന്ത് പഠിക്കാൻ ആഗ്രഹിക്കുന്നു?",
  askAnything:"STEM-ൽ എന്തും ചോദിക്കൂ…",
  thinking:"ചിന്തിക്കുന്നു…", newChat:"പുതിയ ചാറ്റ്",
  quizComplete:"ക്വിസ് പൂർത്തിയായി!", language:"ഭാഷ", searchLanguage:"ഭാഷ തിരയുക…",
  beginner:"തുടക്കക്കാർ", intermediate:"ഇടക്കാർ", advanced:"വിദഗ്ധ",
  difficulty:"ബുദ്ധിമുട്ട്", easy:"എളുപ്പം", medium:"ഇടത്തരം", hard:"ബുദ്ധിമുട്ടുള്ള",
});

const pa = make({
  home:"ਘਰ", tutor:"AI ਅਧਿਆਪਕ", quizzes:"ਕੁਇਜ਼", paths:"ਸਿੱਖਣ ਦੇ ਰਸਤੇ", dashboard:"ਡੈਸ਼ਬੋਰਡ",
  signIn:"ਸਾਈਨ ਇਨ", signOut:"ਸਾਈਨ ਆਊਟ", getStarted:"ਸ਼ੁਰੂ ਕਰੋ",
  heroTitle:"STEM ਸਿੱਖਿਆ ਦਾ ਭਵਿੱਖ",
  startLearning:"ਮੁਫ਼ਤ ਵਿੱਚ ਸਿੱਖੋ", tryAiTutor:"AI ਅਧਿਆਪਕ ਅਜ਼ਮਾਓ",
  goToDashboard:"ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ",
  whatToLearn:"ਅੱਜ ਤੁਸੀਂ ਕੀ ਸਿੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
  askAnything:"STEM ਵਿੱਚ ਕੁਝ ਵੀ ਪੁੱਛੋ…",
  thinking:"ਸੋਚ ਰਿਹਾ ਹਾਂ…", newChat:"ਨਵੀਂ ਚੈਟ",
  quizComplete:"ਕੁਇਜ਼ ਮੁਕੰਮਲ!", language:"ਭਾਸ਼ਾ", searchLanguage:"ਭਾਸ਼ਾ ਲੱਭੋ…",
  beginner:"ਸ਼ੁਰੂਆਤੀ", intermediate:"ਮੱਧਮ", advanced:"ਉੱਨਤ",
  difficulty:"ਮੁਸ਼ਕਲ", easy:"ਆਸਾਨ", medium:"ਮੱਧਮ", hard:"ਔਖਾ",
});

const ur = make({
  home:"ہوم", tutor:"AI استاد", quizzes:"کوئز", paths:"سیکھنے کی راہیں", dashboard:"ڈیش بورڈ",
  signIn:"سائن ان", signOut:"سائن آؤٹ", getStarted:"شروع کریں",
  heroTitle:"STEM تعلیم کا مستقبل",
  startLearning:"مفت سیکھنا شروع کریں", tryAiTutor:"AI استاد آزمائیں",
  goToDashboard:"ڈیش بورڈ پر جائیں",
  whatToLearn:"آج آپ کیا سیکھنا چاہتے ہیں؟",
  askAnything:"STEM میں کچھ بھی پوچھیں…",
  thinking:"سوچ رہا ہوں…", newChat:"نئی چیٹ",
  quizComplete:"کوئز مکمل!", language:"زبان", searchLanguage:"زبان تلاش کریں…",
  beginner:"ابتدائی", intermediate:"درمیانی", advanced:"اعلی",
  difficulty:"مشکل", easy:"آسان", medium:"درمیانہ", hard:"مشکل",
});

const es = make({
  home:"Inicio", tutor:"Tutor IA", quizzes:"Cuestionarios", paths:"Rutas", dashboard:"Panel",
  signIn:"Iniciar sesión", signOut:"Cerrar sesión", getStarted:"Comenzar",
  heroTitle:"El futuro del aprendizaje STEM",
  startLearning:"Empieza a aprender gratis", tryAiTutor:"Prueba el Tutor IA",
  goToDashboard:"Ir al panel", whatToLearn:"¿Qué quieres aprender hoy?",
  askAnything:"Pregunta cualquier cosa en STEM…",
  thinking:"Pensando…", newChat:"Nuevo chat",
  quizComplete:"¡Cuestionario completo!", language:"Idioma", searchLanguage:"Buscar idioma…",
  beginner:"Principiante", intermediate:"Intermedio", advanced:"Avanzado",
  difficulty:"Dificultad", easy:"Fácil", medium:"Medio", hard:"Difícil",
});

const fr = make({
  home:"Accueil", tutor:"Tuteur IA", quizzes:"Quiz", paths:"Parcours", dashboard:"Tableau de bord",
  signIn:"Se connecter", signOut:"Se déconnecter", getStarted:"Commencer",
  heroTitle:"L'avenir de l'apprentissage STEM",
  startLearning:"Commencez à apprendre gratuitement", tryAiTutor:"Essayez le Tuteur IA",
  goToDashboard:"Aller au tableau de bord", whatToLearn:"Que voulez-vous apprendre aujourd'hui ?",
  askAnything:"Posez n'importe quelle question en STEM…",
  thinking:"Je réfléchis…", newChat:"Nouveau chat",
  quizComplete:"Quiz terminé !", language:"Langue", searchLanguage:"Rechercher une langue…",
  beginner:"Débutant", intermediate:"Intermédiaire", advanced:"Avancé",
  difficulty:"Difficulté", easy:"Facile", medium:"Moyen", hard:"Difficile",
});

const de = make({
  home:"Startseite", tutor:"KI-Tutor", quizzes:"Quizze", paths:"Lernpfade", dashboard:"Dashboard",
  signIn:"Anmelden", signOut:"Abmelden", getStarted:"Loslegen",
  heroTitle:"Die Zukunft des STEM-Lernens",
  startLearning:"Kostenlos lernen", tryAiTutor:"KI-Tutor ausprobieren",
  goToDashboard:"Zum Dashboard", whatToLearn:"Was möchtest du heute lernen?",
  askAnything:"Frag alles zu STEM…",
  thinking:"Nachdenken…", newChat:"Neuer Chat",
  quizComplete:"Quiz abgeschlossen!", language:"Sprache", searchLanguage:"Sprache suchen…",
  beginner:"Anfänger", intermediate:"Fortgeschrittener", advanced:"Experte",
  difficulty:"Schwierigkeit", easy:"Leicht", medium:"Mittel", hard:"Schwer",
});

const ja = make({
  home:"ホーム", tutor:"AIチューター", quizzes:"クイズ", paths:"学習パス", dashboard:"ダッシュボード",
  signIn:"サインイン", signOut:"サインアウト", getStarted:"始める",
  heroTitle:"STEM学習の未来",
  startLearning:"無料で学ぶ", tryAiTutor:"AIチューターを試す",
  goToDashboard:"ダッシュボードへ", whatToLearn:"今日は何を学びたいですか?",
  askAnything:"STEMについて何でも聞いてください…",
  thinking:"考えています…", newChat:"新しいチャット",
  quizComplete:"クイズ完了!", language:"言語", searchLanguage:"言語を検索…",
  beginner:"初級", intermediate:"中級", advanced:"上級",
  difficulty:"難易度", easy:"簡単", medium:"普通", hard:"難しい",
});

const ko = make({
  home:"홈", tutor:"AI 튜터", quizzes:"퀴즈", paths:"학습 경로", dashboard:"대시보드",
  signIn:"로그인", signOut:"로그아웃", getStarted:"시작하기",
  heroTitle:"STEM 학습의 미래",
  startLearning:"무료로 배우기", tryAiTutor:"AI 튜터 체험",
  goToDashboard:"대시보드로 이동", whatToLearn:"오늘 무엇을 배우고 싶으신가요?",
  askAnything:"STEM에 대해 무엇이든 물어보세요…",
  thinking:"생각 중…", newChat:"새 채팅",
  quizComplete:"퀴즈 완료!", language:"언어", searchLanguage:"언어 검색…",
  beginner:"초급", intermediate:"중급", advanced:"고급",
  difficulty:"난이도", easy:"쉬움", medium:"보통", hard:"어려움",
});

const ar = make({
  home:"الرئيسية", tutor:"المدرس الذكي", quizzes:"اختبارات", paths:"مسارات التعلم", dashboard:"لوحة التحكم",
  signIn:"تسجيل الدخول", signOut:"تسجيل الخروج", getStarted:"ابدأ الآن",
  heroTitle:"مستقبل تعلم العلوم والتقنية",
  startLearning:"ابدأ التعلم مجاناً", tryAiTutor:"جرّب المدرس الذكي",
  goToDashboard:"إلى لوحة التحكم", whatToLearn:"ماذا تريد أن تتعلم اليوم؟",
  askAnything:"اسأل أي شيء في العلوم…",
  thinking:"أفكر…", newChat:"محادثة جديدة",
  quizComplete:"اكتمل الاختبار!", language:"اللغة", searchLanguage:"ابحث عن لغة…",
  beginner:"مبتدئ", intermediate:"متوسط", advanced:"متقدم",
  difficulty:"الصعوبة", easy:"سهل", medium:"متوسط", hard:"صعب",
});

const TRANSLATIONS: TranslationMap = {
  en, hi, mr, ta, te, bn, gu, kn, ml, pa, ur, es, fr, de, ja, ko, ar,
};

// ── Context ───────────────────────────────────────────────────────────────────
type LangCtx = {
  lang: LangCode;
  meta: LangMeta;
  setLang: (l: LangCode) => void;
  t: (key: keyof Translations) => string;
};

const Ctx = createContext<LangCtx>({
  lang: "en",
  meta: LANGUAGES[0],
  setLang: () => {},
  t: (k) => en[k],
});

const LS_KEY = "stemos.lang.v1";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(LS_KEY) as LangCode | null;
    return (saved && LANGUAGES.find(l => l.code === saved)) ? saved : "en";
  });

  const meta = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  // Apply RTL + lang attr on html element
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [lang, meta.rtl]);

  const setLang = (l: LangCode) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, l);
  };

  const t = (key: keyof Translations): string =>
    (TRANSLATIONS[lang] as Translations)[key] ?? en[key];

  return <Ctx.Provider value={{ lang, meta, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() { return useContext(Ctx); }

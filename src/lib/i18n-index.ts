import { useLanguage, LangCode } from "./i18n";

type IndexTranslations = {
  // Subjects
  subjMath: string; subjMathDesc: string;
  subjPhys: string; subjPhysDesc: string;
  subjChem: string; subjChemDesc: string;
  subjProg: string; subjProgDesc: string;
  
  // Stats
  statActive: string; statQs: string; statStreaks: string; statChats: string;
  
  // Storytelling Sections
  story1Title: string; story1Desc: string;
  story2Title: string; story2Desc: string;
  story3Title: string; story3Desc: string;
  story4Title: string; story4Desc: string;
  story5Title: string; story5Desc: string;
  story6Title: string; story6Desc: string;
  
  // Gen-Z & Handcrafted Vibe phrases
  tagline: string;
  
  // Old Features/Pricing/Testimonials (Keeping them for compatibility or redesign)
  hwSuper: string; hwTitle: string;
  hw1Title: string; hw1Desc: string; hw2Title: string; hw2Desc: string;
  hw3Title: string; hw3Desc: string; hw4Title: string; hw4Desc: string;
  
  featSuper: string; featTitle: string; featDescSub: string;
  feat1Title: string; feat1Desc: string; feat2Title: string; feat2Desc: string;
  feat3Title: string; feat3Desc: string; feat4Title: string; feat4Desc: string;
  feat5Title: string; feat5Desc: string; feat6Title: string; feat6Desc: string;
  
  testSuper: string; testTitle: string;
  test1Name: string; test1Role: string; test1Q: string;
  test2Name: string; test2Role: string; test2Q: string;
  test3Name: string; test3Role: string; test3Q: string;
  
  priceSuper: string; priceTitle: string;
  price1Name: string; price1Desc: string; price1F1: string; price1F2: string; price1F3: string; price1F4: string; price1CTA: string;
  price2Name: string; price2Desc: string; price2F1: string; price2F2: string; price2F3: string; price2F4: string; price2F5: string; price2CTA: string; price2Tag: string;
  price3Name: string; price3Desc: string; price3F1: string; price3F2: string; price3F3: string; price3F4: string; price3F5: string; price3CTA: string;
  
  ctaBadge: string; ctaTitle: string; ctaDesc: string; ctaBtn1: string; ctaBtn2: string;
  
  masterDomain: string; statsActive: string; statsQs: string; statsPass: string; statsSession: string;
  dashStreak: string; dashXP: string; dashLessons: string; dashWeekly: string; dashHours: string; dashUpNext: string;
};

const en: IndexTranslations = {
  subjMath: "Mathematics", subjMathDesc: "Algebra → Calculus → Linear Algebra",
  subjPhys: "Physics", subjPhysDesc: "Mechanics → Quantum → Relativity",
  subjChem: "Chemistry", subjChemDesc: "Atomic → Organic → Spectroscopy",
  subjProg: "Programming", subjProgDesc: "Basics → Algorithms → System Design",
  
  statActive: "Active now", statQs: "Questions solved today", statStreaks: "Streaks active", statChats: "AI chats today",
  
  // --- STORYTELLING ---
  story1Title: "Learning is broken.", 
  story1Desc: "Traditional education forces you into a box. Memorize this. Forget that. No room for exploration. We believe learning should feel like play.",
  
  story2Title: "How STEMOS adapts to you.",
  story2Desc: "It bends to your brain. You learn at your pace, in your style, without ever feeling stuck. No more rigid syllabus.",
  
  story3Title: "Your AI study companion.",
  story3Desc: "Ask questions naturally. Get step-by-step explanations, real-world examples, and instant feedback. Like a tutor who never sleeps.",
  
  story4Title: "Locked in and learning.",
  story4Desc: "Brain XP loading... Build your streak, earn badges, and watch your mastery grow. Studying finally feels like a game you want to play.",
  
  story5Title: "Learn in your language.",
  story5Desc: "Fluidly switch between 17 languages. Because brilliance has no language barrier.",
  
  story6Title: "The future of AI education.",
  story6Desc: "Join the next generation of curious minds building the future.",
  
  tagline: "A futuristic creative learning studio.",
  
  // --- OLD ---
  hwSuper: "How it works", hwTitle: "From confused to confident in 4 steps",
  hw1Title: "Choose your subject", hw1Desc: "Pick Math, Physics, Chemistry, or Programming. Then select your subtopic and difficulty.",
  hw2Title: "Learn with AI Tutor", hw2Desc: "Ask any question. Get step-by-step breakdowns with real-world examples and analogies.",
  hw3Title: "Test with Smart Quizzes", hw3Desc: "AI generates 5 adaptive questions targeting your exact weak spots. Earn XP for every correct answer.",
  hw4Title: "Track your mastery", hw4Desc: "Watch your progress bars fill. Unlock badges, maintain streaks, and climb the leaderboard.",
  
  featSuper: "Features", featTitle: "Everything you need to master STEM", featDescSub: "From first principles to advanced topics — STEMOS adapts to your pace, finds your gaps, and builds the path forward.",
  feat1Title: "AI Tutor", feat1Desc: "Ask anything. Get step-by-step explanations grounded in first principles, not just answers.",
  feat2Title: "Smart Quizzes", feat2Desc: "Adaptive MCQs that target your weak spots and reinforce mastery via spaced repetition.",
  feat3Title: "XP & Streaks", feat3Desc: "Earn XP, build streaks, unlock badges. Gamified for motivation that actually lasts.",
  feat4Title: "Deep Analytics", feat4Desc: "Per-topic mastery, time-on-task, and predictive insights into where you'll struggle next.",
  feat5Title: "Personalized Paths", feat5Desc: "Roadmaps from beginner to expert, custom-tuned to your goals — exams, research, or curiosity.",
  feat6Title: "Exam Prep", feat6Desc: "SAT, AP, IB, JEE, A-Levels. Curated content and realistic timed practice.",
  
  testSuper: "Loved by students", testTitle: "Real students. Real results.",
  test1Name: "Ananya Rao", test1Role: "JEE Aspirant", test1Q: "The AI tutor explains physics in a way my school never did. I jumped 40 percentile in 3 months.",
  test2Name: "Marcus Chen", test2Role: "CS Undergrad", test2Q: "STEMOS is what Khan Academy would look like if it was rebuilt today. Incredibly polished and smart.",
  test3Name: "Priya Sharma", test3Role: "High School Senior", test3Q: "I'm addicted to my learning streak. The AI quiz generator is genuinely hard but fair — studying finally feels like a game I want to play.",
  
  priceSuper: "Pricing", priceTitle: "Simple, student-friendly pricing",
  price1Name: "Free", price1Desc: "For curious learners getting started.", price1F1: "Unlimited AI tutor (50 msgs/day)", price1F2: "Basic quizzes", price1F3: "1 learning path", price1F4: "Community access", price1CTA: "Start free",
  price2Name: "Pro", price2Desc: "For serious students.", price2F1: "Unlimited AI tutor", price2F2: "Adaptive quiz engine", price2F3: "All learning paths", price2F4: "Advanced analytics", price2F5: "Exam prep modules", price2CTA: "Go Pro", price2Tag: "Most popular",
  price3Name: "Campus", price3Desc: "For schools and universities.", price3F1: "Everything in Pro", price3F2: "Teacher dashboard", price3F3: "Class analytics", price3F4: "SSO & LMS integration", price3F5: "Dedicated support", price3CTA: "Contact sales",
  
  ctaBadge: "Start for free · No credit card", ctaTitle: "Ready to think differently?", ctaDesc: "Join 120,000+ students transforming how they learn STEM with AI.", ctaBtn1: "Start free", ctaBtn2: "Try AI Tutor",
  
  masterDomain: "Master every STEM domain — from zero to advanced",
  statsActive: "Active students", statsQs: "Questions solved", statsPass: "Pass rate", statsSession: "Avg. daily session",
  dashStreak: "Learning streak", dashXP: "XP earned", dashLessons: "Lessons", dashWeekly: "Weekly progress", dashHours: "Hours studied across subjects", dashUpNext: "Up next",
};

const hi: Partial<IndexTranslations> = {
  story1Title: "सीखना टूट गया है।",
  story1Desc: "पारंपरिक शिक्षा आपको एक बक्से में बंद कर देती है। हम मानते हैं कि सीखना खेल जैसा होना चाहिए।",
  story2Title: "STEMOS कैसे आपके अनुकूल होता है।",
  story2Desc: "यह आपके दिमाग के अनुसार झुकता है। आप अपनी गति से सीखते हैं।",
  story3Title: "आपका AI अध्ययन साथी।",
  story3Desc: "स्वाभाविक रूप से प्रश्न पूछें। एक ट्यूटर जो कभी नहीं सोता।",
  story4Title: "लॉक इन और लर्निंग।",
  story4Desc: "ब्रेन XP लोड हो रहा है... अपनी स्ट्रीक बनाएं, बैज अर्जित करें।",
  story5Title: "अपनी भाषा में सीखें।",
  story5Desc: "17 भाषाओं के बीच आसानी से स्विच करें।",
  story6Title: "AI शिक्षा का भविष्य।",
  story6Desc: "भविष्य का निर्माण करने वाले जिज्ञासु दिमागों की अगली पीढ़ी में शामिल हों।",
};

const mr: Partial<IndexTranslations> = {
  story1Title: "शिक्षण व्यवस्था मोडली आहे.",
  story1Desc: "पारंपारिक शिक्षण तुम्हाला एका चौकटीत अडकवते. आम्हाला वाटते शिक्षण हे खेळासारखे असावे.",
  story2Title: "STEMOS तुमच्याशी कसे जुळवून घेते.",
  story2Desc: "ते तुमच्या विचारानुसार बदलते. तुम्ही तुमच्या गतीने शिकता.",
  story3Title: "तुमचा AI अभ्यासाचा सोबती.",
  story3Desc: "नैसर्गिकरित्या प्रश्न विचारा. कधीही न झोपणारा शिक्षक.",
};

function make(overrides: Partial<IndexTranslations>): IndexTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, IndexTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function useIndexLanguage() {
  const { lang } = useLanguage();
  return { ti: (key: keyof IndexTranslations) => translations[lang][key] || translations['en'][key] };
}

import { useLanguage, LangCode } from "./i18n";

type LabTranslations = {
  labTitle: string;
  labSubtitle: string;
  physicsTab: string;
  mathTab: string;
  chemTab: string;

  // Physics
  physicsDesc: string;
  gravityStrength: string;
  simSpeed: string;
  satelliteMass: string;
  orbitTrace: string;
  clearAll: string;
  launchSatellite: string;
  dragSun: string;
  liveCalculations: string;
  distance: string;
  currentVelocity: string;
  gravForce: string;

  // Math
  mathDesc: string;
  amplitude: string;
  frequency: string;
  phase: string;
  selectPreset: string;
  sineWave: string;
  dampedWave: string;
  polynomialWave: string;
  calculusInsight: string;
  slope: string;

  // Chem
  chemDesc: string;
  igniteMix: string;
  tempTracker: string;
  reactants: string;
  equation: string;
  enthalpy: string;
  thermoType: string;
  sodiumWater: string;
  combustion: string;
  neutralization: string;
  neutralColor: string;
  exothermic: string;
  endothermic: string;
  temp: string;

  // Global Play/Pause
  pause: string;
  play: string;
};

const en: LabTranslations = {
  labTitle: "STEMOS Lab & Sandbox",
  labSubtitle: "Interactive micro-simulators bringing Math, Physics, and Chemistry to life.",
  physicsTab: "🪐 Newtonian Gravity",
  mathTab: "📈 Calculus Grapher",
  chemTab: "🧪 Chemical Arena",

  physicsDesc: "Click anywhere on the space grid to launch a satellite with a dynamic velocity vector! You can drag the yellow Sun in the center to alter gravitational fields in real-time.",
  gravityStrength: "Gravity Strength ($G$)",
  simSpeed: "Simulation Speed",
  satelliteMass: "Satellite Mass ($m$)",
  orbitTrace: "Trace Orbits",
  clearAll: "Reset Sandbox",
  launchSatellite: "Launch Satellite",
  dragSun: "Drag Sun to Reposition",
  liveCalculations: "Live Kinematic Data",
  distance: "Distance ($r$)",
  currentVelocity: "Velocity ($v$)",
  gravForce: "Force ($F_g$)",

  mathDesc: "Adjust sliders to manipulate the trigonometric wave. Hover your cursor over the coordinate plane to track the tangent line (the derivative $dy/dx$) calculated instantly.",
  amplitude: "Amplitude ($A$)",
  frequency: "Frequency ($f$)",
  phase: "Phase Shift ($\phi$)",
  selectPreset: "Wave Preset",
  sineWave: "Trigonometric Sine Wave: A sin(f·x + φ)",
  dampedWave: "Damped Harmonic Oscillation: A e^-x sin(f·x + φ)",
  polynomialWave: "Complex Harmonics: A [sin(f·x) + 0.5 sin(2f·x)]",
  calculusInsight: "Calculus Insights",
  slope: "Derivative Slope (dy/dx)",

  chemDesc: "Select chemical reactants and hit 'Ignite / Mix' to spark high-speed particle collisions. Observe particle bonding dynamics and molecular heat graphs.",
  igniteMix: "Ignite / Mix Reactants",
  tempTracker: "Calorimeter Temperature Tracker",
  reactants: "Reactants",
  equation: "Balanced Chemical Equation",
  enthalpy: "Reaction Enthalpy (ΔH)",
  thermoType: "Thermodynamic Category",
  sodiumWater: "Active Alkali Metal: Sodium + Water",
  combustion: "Hydrocarbon Combustion: Methane + Oxygen",
  neutralization: "Acid-Base Neutralization: HCl + NaOH",
  neutralColor: "pH Indicator (Universal Colors)",
  exothermic: "Exothermic Reaction (Releases Heat! 🔥)",
  endothermic: "Endothermic Reaction (Absorbs Heat! ❄️)",
  temp: "Temp (°C)",

  pause: "Pause",
  play: "Play",
};

const hi: Partial<LabTranslations> = {
  labTitle: "स्टेमॉस लैब और सैंडबॉक्स",
  labSubtitle: "गणित, भौतिकी और रसायन विज्ञान को जीवंत बनाने वाले इंटरैक्टिव सिम्युलेटर।",
  physicsTab: "🪐 न्यूटोनियन गुरुत्वाकर्षण",
  mathTab: "📈 कैलकुलस ग्राफ़र",
  chemTab: "🧪 रासायनिक अखाड़ा",

  physicsDesc: "एक गतिशील वेग वेक्टर के साथ उपग्रह लॉन्च करने के लिए स्पेस ग्रिड पर कहीं भी क्लिक करें! गुरुत्वाकर्षण क्षेत्रों को बदलने के लिए आप पीले सूर्य को खींच सकते हैं।",
  gravityStrength: "गुरुत्वाकर्षण शक्ति ($G$)",
  simSpeed: "सिम्युलेशन स्पीड",
  satelliteMass: "उपग्रह का द्रव्यमान ($m$)",
  orbitTrace: "कक्षा का पता लगाएं",
  clearAll: "सैंडबॉक्स रीसेट करें",
  launchSatellite: "उपग्रह लॉन्च करें",
  dragSun: "सूर्य को खींचकर रखें",
  liveCalculations: "सजीव गतिकी डेटा",
  distance: "दूरी ($r$)",
  currentVelocity: "वेग ($v$)",
  gravForce: "बल ($F_g$)",

  mathDesc: "त्रिकोणमितीय तरंग को नियंत्रित करने के लिए स्लाइडर्स समायोजित करें। वास्तविक समय में गणना की गई स्पर्शरेखा रेखा (अवकलज $dy/dx$) को ट्रैक करने के लिए कर्सर घुमाएं।",
  amplitude: "आयाम ($A$)",
  frequency: "आवृत्ति ($f$)",
  phase: "चरण बदलाव ($\phi$)",
  selectPreset: "तरंग प्रीसेट",
  sineWave: "त्रिकोणमितीय साइन तरंग: A sin(f·x + φ)",
  dampedWave: "मंदित हार्मोनिक दोलन: A e^-x sin(f·x + φ)",
  polynomialWave: "जटिल हार्मोनिक्स: A [sin(f·x) + 0.5 sin(2f·x)]",
  calculusInsight: "कैलकुलस अंतर्दृष्टि",
  slope: "अवकलज ढलान (dy/dx)",

  chemDesc: "तेज़ गति से कणों की टक्कर शुरू करने के लिए अभिकारकों का चयन करें और 'इग्नाइट / मिक्स' पर क्लिक करें। कणों के जुड़ने और तापमान के ग्राफ को देखें।",
  igniteMix: "अभिकारकों को प्रज्वलित / मिलाएं",
  tempTracker: "कैलोरीमीटर तापमान ट्रैकर",
  reactants: "अभिकारक",
  equation: "संतुलित रासायनिक समीकरण",
  enthalpy: "प्रतिक्रिया एन्थैल्पी (ΔH)",
  thermoType: "ऊष्मागतिकी श्रेणी",
  sodiumWater: "सक्रिय क्षार धातु: सोडियम + पानी",
  combustion: "हाइड्रोकार्बन दहन: मीथेन + ऑक्सीजन",
  neutralization: "अम्ल-क्षार उदासीनीकरण: HCl + NaOH",
  neutralColor: "पीएच संकेतक (pH Colors)",
  exothermic: "ऊष्माक्षेपी प्रतिक्रिया (गर्मी जारी! 🔥)",
  endothermic: "ऊष्माशोषी प्रतिक्रिया (ठंडक अवशोषण! ❄️)",
  temp: "तापमान (°C)",

  pause: "रोकें",
  play: "शुरू करें",
};

const mr: Partial<LabTranslations> = {
  labTitle: "स्टेमॉस लॅब आणि सँडबॉक्स",
  labSubtitle: "गणित, भौतिकशास्त्र आणि रसायनशास्त्र जिवंत करणारे परस्परसंवादी सिम्युलेटर्स.",
  physicsTab: "🪐 न्यूटोनियन गुरुत्वाकर्षण",
  mathTab: "📈 कॅल्क्युलस ग्राफर",
  chemTab: "🧪 रासायनिक आखाडा",

  physicsDesc: "डायनॅमिक वेग वेक्टरसह उपग्रह लॉन्च करण्यासाठी स्पेस ग्रिडवर कोठेही क्लिक करा! गुरुत्वाकर्षण क्षेत्र बदलण्यासाठी तुम्ही पिवळा सूर्य ओढू शकता.",
  gravityStrength: "गुरुत्वाकर्षण शक्ती ($G$)",
  simSpeed: "सिम्युलेशन गती",
  satelliteMass: "उपग्रहाचे वस्तुमान ($m$)",
  orbitTrace: "कक्षा रेखांकित करा",
  clearAll: "सँडबॉक्स रीसेट करा",
  launchSatellite: "उपग्रह सोडा",
  dragSun: "सूर्य हलवण्यासाठी ओढा",
  liveCalculations: "थेट गती डेटा",
  distance: "अंतर ($r$)",
  currentVelocity: "वेग ($v$)",
  gravForce: "बल ($F_g$)",

  mathDesc: "तरंग बदलण्यासाठी स्लाइडर्स वापरा. तात्काळ मोजलेली स्पर्शरेषा (अवकलन $dy/dx$) पाहण्यासाठी कर्सर आलेख ग्रिडवर फिरवा.",
  amplitude: "आयाम ($A$)",
  frequency: "वारंवारता ($f$)",
  phase: "फेज शिफ्ट ($\phi$)",
  selectPreset: "तरंग प्रीसेट",
  sineWave: "त्रिकोणमितीय साइन तरंग: A sin(f·x + φ)",
  dampedWave: "डँप्ड हार्मोनिक दोलन: A e^-x sin(f·x + φ)",
  polynomialWave: "जटिल हार्मोनिक्स: A [sin(f·x) + 0.5 sin(2f·x)]",
  calculusInsight: "कॅल्क्युलस विश्लेषण",
  slope: "अवकलन उतार (dy/dx)",

  chemDesc: "जलद कण टक्कर सुरू करण्यासाठी रासायनिक अभिकारक निवडा आणि 'इग्नाइट / मिक्स' दाबा. कणांचे बाँडिंग आणि तापमान आलेख पहा.",
  igniteMix: "अभिकारक एकत्र करा / पेटवा",
  tempTracker: "कॅलरीमीटर तापमान मापक",
  reactants: "अभिकारक",
  equation: "संतुलित रासायनिक समीकरण",
  enthalpy: "प्रतिक्रिया एन्थॅल्पी (ΔH)",
  thermoType: "ऊष्मागतिकी श्रेणी",
  sodiumWater: "सक्रिय अल्कली धातू: सोडियम + पाणी",
  combustion: "हायड्रोकार्बन ज्वलन: मिथेन + ऑक्सिजन",
  neutralization: "आम्ल-अल्कली उदासीनीकरण: HCl + NaOH",
  neutralColor: "पीएच दर्शक रंग (pH Colors)",
  exothermic: "ऊष्मादायी प्रतिक्रिया (उष्णता सोडते! 🔥)",
  endothermic: "ऊष्माशोषी प्रतिक्रिया (उष्णता शोषून घेते! ❄️)",
  temp: "तापमान (°C)",

  pause: "थांबवा",
  play: "चालू करा",
};

function make(overrides: Partial<LabTranslations>): LabTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, LabTranslations> = {
  en,
  hi: make(hi),
  mr: make(mr),
  ta: make({}),
  te: make({}),
  bn: make({}),
  gu: make({}),
  kn: make({}),
  ml: make({}),
  pa: make({}),
  ur: make({}),
  es: make({}),
  fr: make({}),
  de: make({}),
  ja: make({}),
  ko: make({}),
  ar: make({}),
};

export function useLabLanguage() {
  const { lang } = useLanguage();
  return { tl: (key: keyof LabTranslations) => translations[lang][key] || translations['en'][key] };
}

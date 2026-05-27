import { useLanguage, LangCode } from "./i18n";

type FooterTranslations = {
  description: string;
  product: string;
  subjects: string;
  company: string;
  about: string;
  careers: string;
  pricing: string;
  contact: string;
  rights: string;
  builtFor: string;
};

const en: FooterTranslations = {
  description: "The AI-powered learning operating system for the next generation of STEM students.",
  product: "Product",
  subjects: "Subjects",
  company: "Company",
  about: "About",
  careers: "Careers",
  pricing: "Pricing",
  contact: "Contact",
  rights: "© 2026 STEMOS Inc. All rights reserved.",
  builtFor: "Built for curious minds.",
};

const hi: Partial<FooterTranslations> = {
  description: "अगली पीढ़ी के STEM छात्रों के लिए AI-संचालित लर्निंग ऑपरेटिंग सिस्टम।",
  product: "उत्पाद",
  subjects: "विषय",
  company: "कंपनी",
  about: "हमारे बारे में",
  careers: "करियर",
  pricing: "मूल्य निर्धारण",
  contact: "संपर्क करें",
  rights: "© 2026 STEMOS Inc. सर्वाधिकार सुरक्षित।",
  builtFor: "जिज्ञासु दिमागों के लिए निर्मित।",
};

const mr: Partial<FooterTranslations> = {
  description: "पुढील पिढीच्या STEM विद्यार्थ्यांसाठी AI-चालित लर्निंग ऑपरेटिंग सिस्टीम.",
  product: "उत्पादन",
  subjects: "विषय",
  company: "कंपनी",
  about: "आमच्याबद्दल",
  careers: "करिअर",
  pricing: "किंमत",
  contact: "संपर्क",
  rights: "© 2026 STEMOS Inc. सर्व हक्क राखीव.",
  builtFor: "उत्सुक मनांसाठी बनवलेले.",
};

function make(overrides: Partial<FooterTranslations>): FooterTranslations {
  return { ...en, ...overrides };
}

const translations: Record<LangCode, FooterTranslations> = {
  en, hi: make(hi), mr: make(mr), ta: make({}), te: make({}), bn: make({}), gu: make({}), kn: make({}), ml: make({}), pa: make({}), ur: make({}), es: make({}), fr: make({}), de: make({}), ja: make({}), ko: make({}), ar: make({}),
};

export function useFooterLanguage() {
  const { lang } = useLanguage();
  return { tf: (key: keyof FooterTranslations) => translations[lang][key] || translations['en'][key] };
}

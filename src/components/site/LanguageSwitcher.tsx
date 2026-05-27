import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, Check } from "lucide-react";
import { LANGUAGES, useLanguage, type LangCode } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else setSearch("");
  }, [open]);

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.includes(search.toLowerCase())
  );

  const current = LANGUAGES.find(l => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline max-w-[60px] truncate">{current.name}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground text-[10px]"
        >▾</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl border bg-card shadow-card z-[100] overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("searchLanguage")}
                  className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Language list */}
            <div className="max-h-72 overflow-y-auto scrollbar-thin p-1">
              {filtered.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">{t("noLangsFound")}</div>
              )}
              {filtered.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code as LangCode); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition group ${
                    l.code === lang ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" dir={l.rtl ? "rtl" : "ltr"}>
                      {l.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{l.label}</div>
                  </div>
                  {l.code === lang && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>

            {/* Footer note */}
            <div className="border-t px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              {t("aiRespondsIn")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

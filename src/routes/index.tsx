import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, BrainCircuit, Atom, FlaskConical, Code2, Sigma,
  Zap, Trophy, BarChart3, Check, Star, GraduationCap, BookOpen, Target,
  Flame, Users, MessageSquare, Play, ChevronRight, MessageCircle
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useIndexLanguage } from "@/lib/i18n-index";
import { DoodleAtom, DoodleRocket, DoodleStar, DoodleFlask, DoodleFormula, DoodleArrow, DoodleUnderline, DoodleScribble, DoodleLightbulb, DoodleCode, DoodleNeural, DoodleZigzag } from "@/components/site/Doodles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STEMOS — The Future of STEM Learning" },
      { name: "description", content: "A futuristic creative learning studio for the next generation of curious minds." },
    ],
  }),
  component: Index,
});

function TypewriterLoop({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : 100, Math.random() * 150));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <div className="font-mono text-sm font-medium text-emerald-500 h-6 flex items-center">
      {`> ${words[index].substring(0, subIndex)}`}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-2 h-4 bg-emerald-500 ml-1 inline-block"
      />
    </div>
  );
}

function DashCard({ title, value, suffix = "", icon: Icon, accent }: { title: string, value: string, suffix?: string, icon: any, accent: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 relative overflow-hidden group">
      <div className={`absolute right-0 top-0 h-16 w-16 -mr-6 -mt-6 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition duration-500 group-hover:scale-150 ${accent}`} />
      <div className="flex items-center justify-between mb-4 relative">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-1.5 relative">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {suffix && <div className="text-xs text-muted-foreground font-medium">{suffix}</div>}
      </div>
    </div>
  );
}

function Index() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { ti } = useIndexLanguage();
  
  const [chatDemo, setChatDemo] = useState(0);
  const chatDemoMessages = [
    { role: "user", msg: "Explain quantum entanglement like I'm 10." },
    { role: "ai", msg: "Imagine you have a pair of magical dice. If you roll a 6 on one die in New York, the other die in Tokyo instantly rolls a 6 too! They share a hidden connection, no matter how far apart they are. 🎲✨" },
  ];

  useEffect(() => {
    if (chatDemo >= chatDemoMessages.length - 1) return;
    const t = setTimeout(() => setChatDemo((i) => i + 1), 2000);
    return () => clearTimeout(t);
  }, [chatDemo]);

  return (
    <Layout>
      {/* 1. HERO - Asymmetrical Handcrafted Workspace */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
        <div className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        
        {/* Floating Doodles Background */}
        <DoodleFormula className="hidden md:block absolute top-32 left-10 text-primary" size={100} opacity={0.2} />
        <DoodleRocket className="hidden md:block absolute bottom-40 right-20 text-violet-500" size={80} opacity={0.15} />
        <DoodleStar className="hidden md:block absolute top-1/2 left-1/4 text-amber-500" size={50} opacity={0.25} />
        <DoodleLightbulb className="hidden md:block absolute top-20 right-1/4 text-yellow-500" size={70} opacity={0.2} />
        <DoodleZigzag className="hidden md:block absolute bottom-24 left-1/3 text-emerald-500" size={60} opacity={0.15} />
        
        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start text-left relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-yellow-100/10 backdrop-blur px-3 py-1.5 text-xs text-yellow-500 font-medium mb-6 shadow-soft -rotate-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              {ti("tagline")}
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] relative">
              <span className="relative z-10">Think.</span><br />
              <span className="relative z-10 text-gradient">Explore.</span><br />
              <span className="relative z-10">Master.</span>
              <DoodleUnderline className="absolute -bottom-4 left-0 text-primary w-full max-w-[200px]" opacity={0.4} />
            </h1>
            
            <p className="mt-8 max-w-lg text-lg text-muted-foreground leading-relaxed">
              {t("heroSub")}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to={user ? "/dashboard" : "/signup"} className="group relative inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-3.5 text-sm font-medium shadow-soft hover:-translate-y-0.5 transition-all">
                {user ? t("goToDashboard") : t("startLearning")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/tutor" className="group inline-flex items-center gap-2 rounded-xl border bg-surface px-6 py-3.5 text-sm font-medium hover:bg-secondary transition shadow-soft">
                <Play className="h-4 w-4 text-primary fill-primary group-hover:scale-110 transition-transform" />
                {t("tryAiTutor")}
              </Link>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <DoodleArrow className="text-muted-foreground -ml-4" size={40} opacity={0.3} />
              <span>{t("noCardRequired")}</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* The Notebook / Workspace Canvas */}
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-[3rem]" />
            
            <div className="relative w-full max-w-md aspect-[4/5] bg-surface rounded-2xl border shadow-card p-6 rotate-2 hover:rotate-1 transition-transform duration-500">
              {/* Paper styling */}
              <div className="absolute top-0 bottom-0 left-6 w-px bg-red-500/20" />
              <div className="space-y-6 pt-4 pl-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Sigma className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-mono">Calculus.ts</div>
                    <div className="text-xs text-muted-foreground">in progress...</div>
                  </div>
                </div>
                
                <div className="space-y-4 bg-secondary/10 p-4 rounded-xl border border-secondary/50">
                  <TypewriterLoop words={["bro is locked in 🧠", "cooked the midterm 🔥", "zero cap learning 🧢", "brain xp loaded 🚀"]} />
                  <div className="h-2 w-3/4 rounded-md bg-secondary/80" />
                  <div className="h-2 w-1/2 rounded-md bg-secondary/80" />
                </div>
                
                <div className="mt-8 p-4 rounded-xl border bg-card/50 shadow-sm transform -rotate-2 relative">
                   <div className="absolute -top-3 -right-3 h-6 w-6 bg-red-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">1</div>
                   <div className="text-xs font-medium text-foreground mb-1">New insight!</div>
                   <div className="text-xs text-muted-foreground">Integrals are just fancy addition.</div>
                </div>
              </div>
              
              {/* Overlapping Sticky Note */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="absolute -right-2 -bottom-4 md:-right-6 md:-bottom-6 w-40 md:w-48 aspect-square bg-yellow-200/90 backdrop-blur rounded-br-2xl rounded-tl-sm shadow-xl p-3 md:p-4 transform rotate-6 border border-yellow-300 will-change-transform"
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 md:w-12 h-2 md:h-3 bg-red-500/10 rounded-full" />
                <div className="mt-3 md:mt-4 text-yellow-900 font-medium text-xs md:text-sm leading-relaxed">
                  "Don't just memorize formulas. Understand why they exist."
                </div>
                <div className="mt-1 md:mt-2 text-yellow-800/60 text-[10px] md:text-xs font-mono">- Feynman</div>
              </motion.div>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* 2. STORY 1: Learning is broken */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-background">
        <DoodleScribble className="hidden md:block absolute top-0 right-10 text-muted-foreground" size={150} opacity={0.1} />
        <DoodleZigzag className="hidden md:block absolute bottom-10 left-10 text-rose-500" size={90} opacity={0.15} />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight">
              {ti("story1Title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {ti("story1Desc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. STORY 2: How STEMOS adapts */}
      <section className="py-16 md:py-24 bg-surface-elevated border-y relative overflow-hidden">
        <DoodleNeural className="hidden md:block absolute top-10 right-10 text-cyan-500" size={120} opacity={0.1} />
        <DoodleCode className="hidden md:block absolute bottom-20 left-10 text-emerald-500" size={90} opacity={0.1} />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4 sm:pt-8">
                  <div className="bg-card border rounded-2xl p-5 shadow-soft transform -rotate-2 hover:rotate-0 transition">
                    <Atom className="h-6 w-6 text-cyan-500 mb-3" />
                    <div className="font-medium text-sm">Physics</div>
                    <div className="text-xs text-muted-foreground mt-1">Adaptive paths based on what you actually know.</div>
                  </div>
                  <div className="bg-card border rounded-2xl p-5 shadow-soft transform rotate-1 hover:rotate-0 transition">
                    <FlaskConical className="h-6 w-6 text-fuchsia-500 mb-3" />
                    <div className="font-medium text-sm">Chemistry</div>
                    <div className="text-xs text-muted-foreground mt-1">Interactive reaction sandbox.</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card border rounded-2xl p-5 shadow-soft transform rotate-2 hover:rotate-0 transition">
                    <Sigma className="h-6 w-6 text-violet-500 mb-3" />
                    <div className="font-medium text-sm">Math</div>
                    <div className="text-xs text-muted-foreground mt-1">Calculus visualizers built-in.</div>
                  </div>
                  <div className="bg-card border rounded-2xl p-5 shadow-soft transform -rotate-1 hover:rotate-0 transition">
                    <Code2 className="h-6 w-6 text-emerald-500 mb-3" />
                    <div className="font-medium text-sm">Code</div>
                    <div className="text-xs text-muted-foreground mt-1">Compile in the browser.</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight relative inline-block">
                {ti("story2Title")}
                <DoodleUnderline className="absolute -bottom-2 left-0 text-emerald-500" opacity={0.5} />
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {ti("story2Desc")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. STORY 3: AI Tutor */}
      <section className="py-16 md:py-24 relative bg-background overflow-hidden">
        <DoodleFlask className="hidden md:block absolute top-20 left-10 text-fuchsia-500" size={80} opacity={0.1} />
        <DoodleStar className="hidden md:block absolute bottom-20 right-20 text-yellow-500" size={60} opacity={0.15} />
        <div className="mx-auto max-w-7xl px-6 text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-4 md:mb-6">{ti("story3Title")}</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{ti("story3Desc")}</p>
        </div>
        
        <div className="mx-auto max-w-4xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border bg-surface shadow-card overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b px-4 py-3 bg-surface-elevated">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />
              </div>
              <div className="ml-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" />
                stemos.app/tutor
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-gradient-to-b from-transparent to-surface-elevated/30">
              {chatDemoMessages.slice(0, chatDemo + 1).map((m, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'ai' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm shadow-sm'
                  }`}>
                    {m.msg}
                  </div>
                </motion.div>
              ))}
              {chatDemo < chatDemoMessages.length - 1 && (
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-card border rounded-tl-sm text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. STORY 4: Gamification */}
      <section className="py-16 md:py-24 bg-surface-elevated border-y relative overflow-hidden">
        <DoodleAtom className="hidden md:block absolute bottom-10 right-10 text-emerald-500" size={90} opacity={0.1} />
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight">{ti("story4Title")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{ti("story4Desc")}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashCard title={ti("dashStreak")} value="42" suffix="days" icon={Flame} accent="from-amber-400 to-orange-500" />
              <DashCard title={ti("dashXP")} value="12,840" icon={Trophy} accent="from-violet-400 to-fuchsia-500" />
              <div className="col-span-1 sm:col-span-2 rounded-xl border bg-card p-5">
                <div className="text-sm font-medium mb-3">{ti("dashUpNext")}</div>
                <div className="space-y-3">
                  {[
                    { t: "Quantum mechanics", s: "Physics · 18 min", p: 75 },
                    { t: "Linear algebra", s: "Math · 24 min", p: 30 },
                  ].map((x) => (
                    <div key={x.t} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{x.t}</div>
                        <div className="text-xs text-muted-foreground">{x.s}</div>
                        <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${x.p}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Gen-Z badge floating */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-2 top-0 md:-right-6 md:top-1/4 flex items-center gap-2 glass-strong border border-yellow-500/20 rounded-xl px-3 py-1.5 md:px-4 md:py-2 shadow-card will-change-transform z-10"
            >
              <span className="text-lg md:text-xl">🧠</span>
              <span className="text-[10px] md:text-xs font-bold text-foreground">Brain XP Upgraded</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 6. STORY 5: Languages */}
      <section className="py-16 md:py-24 bg-background relative text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-4 md:mb-6">{ti("story5Title")}</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 md:mb-12">{ti("story5Desc")}</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "हिन्दी" },
              { code: "mr", label: "मराठी" },
              { code: "es", label: "Español" },
              { code: "fr", label: "Français" },
              { code: "de", label: "Deutsch" },
              { code: "ja", label: "日本語" },
              { code: "ar", label: "العربية" }
            ].map((langObj, i) => (
              <motion.button
                key={langObj.code}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const event = new CustomEvent('change-language', { detail: langObj.code });
                    window.dispatchEvent(event);
                    import("sonner").then(({ toast }) => toast.success(`Language set to ${langObj.label}`));
                  }
                }}
                className="px-5 py-2.5 rounded-full border bg-surface shadow-soft text-sm font-medium hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                {langObj.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FUTURE & CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute inset-0 bg-gradient-hero opacity-30 blur-[100px]" />
        
        <DoodleScribble className="hidden md:block absolute top-10 left-10 text-primary" size={120} opacity={0.2} />
        <DoodleRocket className="hidden md:block absolute bottom-10 right-10 text-violet-500" size={100} opacity={0.2} />
        
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">
            {ti("story6Title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {ti("story6Desc")}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={user ? "/dashboard" : "/signup"} className="rounded-xl bg-foreground text-background px-8 py-4 text-base font-semibold shadow-xl hover:scale-105 transition-transform">
              {user ? t("goToDashboard") : t("startLearning")}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

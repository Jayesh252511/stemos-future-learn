import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Square, Timer, Leaf, Trophy, Trash2, Heart, Award, Award as Ribbon, Activity } from "lucide-react";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "STEM Garden — STEMOS" },
      { name: "description", content: "Deep Work Focus Gamification. Plant virtual STEM seeds, focus, and watch them bloom into beautiful scientific flowers while earning XP!" }
    ]
  }),
  component: GardenPage,
});

type PlantType = {
  key: string;
  name: string;
  category: string;
  seedIcon: string;
  bloomIcon: string;
  color: string;
  glowColor: string;
  gradient: string;
};

const SEEDS: PlantType[] = [
  {
    key: "quantum_rose",
    name: "Quantum Solar Rose",
    category: "Physics",
    seedIcon: "⚛️ Seed",
    bloomIcon: "⚛️🌹",
    color: "text-cyan-400",
    glowColor: "shadow-cyan-500/35",
    gradient: "from-cyan-500/20 via-blue-600/10 to-transparent border-cyan-500/30"
  },
  {
    key: "dna_vine",
    name: "Double Helix Spiral Vine",
    category: "Biology",
    seedIcon: "🧬 Seed",
    bloomIcon: "🧬🌿",
    color: "text-emerald-400",
    glowColor: "shadow-emerald-500/35",
    gradient: "from-emerald-500/20 via-teal-600/10 to-transparent border-emerald-500/30"
  },
  {
    key: "fibonacci_lily",
    name: "Algebraic Fibonacci Lily",
    category: "Mathematics",
    seedIcon: "📐 Seed",
    bloomIcon: "📐🌸",
    color: "text-violet-400",
    glowColor: "shadow-violet-500/35",
    gradient: "from-violet-500/20 via-purple-600/10 to-transparent border-violet-500/30"
  },
  {
    key: "binary_bonsai",
    name: "Compiler Binary Bonsai",
    category: "Coding",
    seedIcon: "💻 Seed",
    bloomIcon: "💻🌲",
    color: "text-amber-400",
    glowColor: "shadow-amber-500/35",
    gradient: "from-amber-500/20 via-orange-600/10 to-transparent border-amber-500/30"
  }
];

type GrownPlant = {
  id: string;
  key: string;
  name: string;
  category: string;
  bloomIcon: string;
  color: string;
  grownAt: string;
  durationMinutes: number;
};

function GardenPage() {
  const [session, setSession] = useState<any>(null);
  
  // Setup focus configuration
  const [selectedSeed, setSelectedSeed] = useState<PlantType>(SEEDS[0]);
  const [duration, setDuration] = useState<number>(25); // minutes
  
  // Timer States
  const [isFocusing, setIsFocusing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [initialTime, setInitialTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [hasWithered, setHasWithered] = useState(false);
  
  // Grown Garden Gallery
  const [garden, setGarden] = useState<GrownPlant[]>([]);

  const intervalRef = useRef<any>(null);

  // Load user session and garden gallery
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const stored = localStorage.getItem(`stemos_garden_${session.user.id}`);
          if (stored) setGarden(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const startFocus = () => {
    if (isFocusing) return;
    setIsFocusing(true);
    setHasFinished(false);
    setHasWithered(false);
    const totalSeconds = duration * 60;
    setTimeLeft(totalSeconds);
    setInitialTime(totalSeconds);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast.success(`Plant seeded! Focusing for ${duration} minutes. Lock in!`);
  };

  const giveUp = () => {
    if (!isFocusing) return;
    clearInterval(intervalRef.current);
    setIsFocusing(false);
    setHasWithered(true);
    toast.error("Oh no! The plant withered away. Try locking in next time!");
  };

  const handleSuccess = async () => {
    setIsFocusing(false);
    setHasFinished(true);

    // Save plant to local gallery showcase
    if (session) {
      const newPlant: GrownPlant = {
        id: crypto.randomUUID(),
        key: selectedSeed.key,
        name: selectedSeed.name,
        category: selectedSeed.category,
        bloomIcon: selectedSeed.bloomIcon,
        color: selectedSeed.color,
        grownAt: new Date().toLocaleDateString(),
        durationMinutes: duration
      };

      const updated = [newPlant, ...garden];
      setGarden(updated);
      localStorage.setItem(`stemos_garden_${session.user.id}`, JSON.stringify(updated));

      // Award exactly 150 XP for completing Pomodoro Deep Work!
      try {
        await supabase.from("quiz_attempts").insert({
          user_id: session.user.id,
          subject: `Focus Session: ${selectedSeed.name}`,
          score: 1,
          total_questions: 1,
          difficulty: `${duration} min`,
          xp_earned: 150
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", session.user.id)
          .single();

        const currentXp = profile?.total_xp || 0;
        await supabase
          .from("profiles")
          .update({ total_xp: currentXp + 150 })
          .eq("id", session.user.id);

        // Dispatch navbar trigger
        window.dispatchEvent(new Event("stemos_xp_updated"));
        toast.success(`🎉 Masterpiece grown! +150 XP awarded!`);
      } catch (err) {
        console.error("Failed to save focus XP:", err);
      }
    }
  };

  const clearGarden = () => {
    if (!session) return;
    if (confirm("Are you sure you want to clear your garden? All your flowers will be harvested.")) {
      setGarden([]);
      localStorage.removeItem(`stemos_garden_${session.user.id}`);
      toast.success("Garden cleared.");
    }
  };

  // Determine current growth stage (0 to 3)
  const getGrowthStage = () => {
    if (hasWithered) return -1;
    if (hasFinished) return 3;
    if (!isFocusing) return 0;
    
    const elapsedPercent = ((initialTime - timeLeft) / initialTime) * 100;
    if (elapsedPercent < 25) return 0; // Seed/Sprout
    if (elapsedPercent < 65) return 1; // Sprouting leaves
    return 2; // Budding
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rSecs.toString().padStart(2, "0")}`;
  };

  const progressPercent = isFocusing ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const currentStage = getGrowthStage();

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-8 relative overflow-hidden">
        
        {/* Slow Calming Breathing Pulse on Background when focusing */}
        <AnimatePresence>
          {isFocusing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="fixed inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none z-0"
            />
          )}
        </AnimatePresence>

        {/* Title */}
        <div className="text-center relative z-10 space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow mx-auto mb-3">
            <Leaf className="h-6 w-6 text-primary-foreground animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">STEM Garden Focus Mode</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Lock into deep study sessions. Select a scientific seed, focus to grow it, and harvest XP into your permanent showcase gallery!
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 relative z-10">
          
          {/* Main Focus Clock Panel */}
          <section className="bg-card border rounded-[2.5rem] shadow-soft p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[450px]">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {!isFocusing && !hasFinished && !hasWithered ? (
              // Stage 1: Configurations
              <div className="w-full max-w-md space-y-6 text-center">
                <h3 className="font-display text-lg font-bold flex items-center justify-center gap-1.5"><Timer className="h-5 w-5 text-primary" /> Choose Focus Session</h3>
                
                {/* Duration select */}
                <div className="flex justify-center gap-2">
                  {[15, 25, 45, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setDuration(m)}
                      className={`px-4 py-2 text-sm font-bold rounded-xl border transition cursor-pointer ${duration === m ? "bg-primary text-primary-foreground border-primary" : "bg-surface hover:bg-secondary text-muted-foreground border-border"}`}
                    >
                      {m} Min
                    </button>
                  ))}
                </div>

                <div className="h-px bg-border" />

                <h3 className="font-display text-lg font-bold flex items-center justify-center gap-1.5"><Leaf className="h-5 w-5 text-emerald-500" /> Plant a STEM Seed</h3>
                
                {/* Seed Picker */}
                <div className="grid grid-cols-2 gap-3">
                  {SEEDS.map(seed => {
                    const isSelected = selectedSeed.key === seed.key;
                    return (
                      <button
                        key={seed.key}
                        onClick={() => setSelectedSeed(seed)}
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition cursor-pointer shadow-soft group hover:scale-102 ${isSelected ? `bg-card border-emerald-500/50 shadow-glow ${seed.glowColor}` : "bg-surface hover:bg-secondary border-border"}`}
                      >
                        <span className="text-2xl">{seed.seedIcon.split(" ")[0]}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black truncate">{seed.name}</h4>
                          <span className="text-[10px] text-muted-foreground">{seed.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={startFocus}
                  className="w-full py-3 rounded-2xl bg-foreground text-background font-bold text-sm hover:opacity-90 hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 shadow-soft cursor-pointer mt-6"
                >
                  <Play className="h-4 w-4 fill-current" /> Plant Seed & Focus
                </button>
              </div>
            ) : (
              // Stage 2: Active countdown or conclusion
              <div className="flex flex-col items-center justify-center w-full max-w-sm text-center space-y-6">
                
                {/* Growth visual box */}
                <div className={`relative h-44 w-44 rounded-[2.5rem] bg-gradient-to-br ${selectedSeed.gradient} border flex items-center justify-center shadow-glow ${selectedSeed.glowColor}`}>
                  
                  {/* Dynamic GROW emoji stages */}
                  <AnimatePresence mode="wait">
                    {hasWithered ? (
                      <motion.span key="wither" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, -5, 0] }} exit={{ scale: 0 }} className="text-7xl filter drop-shadow">🥀</motion.span>
                    ) : currentStage === 0 ? (
                      <motion.span key="seed" initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1, 0.8], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-6xl filter drop-shadow">🌱</motion.span>
                    ) : currentStage === 1 ? (
                      <motion.span key="sprout" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-7xl filter drop-shadow">🌿</motion.span>
                    ) : currentStage === 2 ? (
                      <motion.span key="bud" initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl filter drop-shadow">🌸</motion.span>
                    ) : (
                      // Final Bloom!
                      <motion.span 
                        key="bloom" 
                        initial={{ scale: 0, rotate: -45 }} 
                        animate={{ scale: [1, 1.2, 1], rotate: 0 }} 
                        transition={{ duration: 0.8 }} 
                        className="text-8xl filter drop-shadow"
                      >
                        {selectedSeed.bloomIcon.replace(/[A-Za-z0-9\s#]/g, "")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-xl">{hasFinished ? "Bloom Complete!" : hasWithered ? "Plant Withered" : selectedSeed.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedSeed.category}</p>
                </div>

                {isFocusing && (
                  <>
                    {/* Massive ticking time clock */}
                    <div className="font-mono text-5xl font-black tracking-widest text-foreground py-2 select-none animate-pulse">
                      {formatTime(timeLeft)}
                    </div>
                    
                    {/* Tiny Progress bar */}
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 shadow-glow shadow-emerald-500/20" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <button
                      onClick={giveUp}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-destructive/15 border border-destructive/20 hover:bg-destructive/25 text-destructive text-xs font-bold transition cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" /> Harvest Early (Give Up)
                    </button>
                  </>
                )}

                {hasFinished && (
                  <div className="space-y-4 w-full">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-1">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                        <Ribbon className="h-4 w-4" /> SUCCESSFUL STUDY LOCK IN!
                      </span>
                      <p className="text-xs text-muted-foreground">Your {selectedSeed.name} has been planted into your permanent garden gallery. You earned +150 XP!</p>
                    </div>
                    <button
                      onClick={() => { setHasFinished(false); setHasWithered(false); }}
                      className="w-full py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer"
                    >
                      Plant Another Seed
                    </button>
                  </div>
                )}

                {hasWithered && (
                  <div className="space-y-4 w-full">
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-1">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                        <Heart className="h-4 w-4" /> Keep Going!
                      </span>
                      <p className="text-xs text-muted-foreground">"Failure is simply the opportunity to begin again, this time more intelligently." — Henry Ford. Lock in again!</p>
                    </div>
                    <button
                      onClick={() => { setHasFinished(false); setHasWithered(false); }}
                      className="w-full py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer"
                    >
                      Plant a New Seed
                    </button>
                  </div>
                )}

              </div>
            )}

          </section>

          {/* Right Sidebar: My Grown Garden Gallery Showcase */}
          <aside className="bg-card border rounded-[2.5rem] shadow-soft p-5 flex flex-col overflow-hidden max-h-[500px]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="font-display font-extrabold text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500 animate-bounce" /> My Showcase Garden
              </h2>
              {garden.length > 0 && (
                <button onClick={clearGarden} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-destructive rounded-lg transition" title="Clear Garden">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto space-y-3.5 pr-1 scrollbar-thin">
              {garden.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <span className="text-4xl filter grayscale">🌸</span>
                  <p className="text-xs font-semibold text-muted-foreground">No scientific flowers grown yet. Complete a Pomodoro focus clock to populate your garden showcase!</p>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {garden.map(plant => (
                    <div key={plant.id} className="bg-background border p-3 rounded-2xl flex items-center gap-3.5 hover:shadow-soft transition-all">
                      <span className="text-3xl shrink-0 filter drop-shadow">{plant.bloomIcon.replace(/[A-Za-z0-9\s#]/g, "")}</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black truncate leading-tight">{plant.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 border rounded-full bg-surface text-muted-foreground">{plant.category}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{plant.grownAt}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-violet-500 font-mono shrink-0">+150 XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>

      </div>
    </Layout>
  );
}

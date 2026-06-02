import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, ShieldAlert, UserPlus, Users, MessageSquare, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "Live Arena — STEMOS" }] }),
  component: ArenaPage,
});

type Message = { id: string; user_id: string; username: string; content: string; isSystem?: boolean; };
type Friend = { id: string; username: string };

type Boss = {
  name: string;
  maxHp: number;
  hp: number;
  avatar: string;
  element: string;
  timer: number;
};

type MCQQuestion = {
  q: string;
  options: string[];
  a: string; // "A" | "B" | "C" | "D"
  position?: { top: string; left: string; };
  boss?: Boss;
};

const RAPID_FIRE_QUESTIONS: MCQQuestion[] = [
  {
    q: "Which element has the highest thermal conductivity of all known elements?",
    options: ["Copper", "Diamond", "Silver", "Gold"],
    a: "B"
  },
  {
    q: "What is the correct order of the stages of a cellular action potential?",
    options: [
      "Depolarization, Repolarization, Hyperpolarization",
      "Resting, Depolarization, Threshold, Peak",
      "Threshold, Depolarization, Repolarization, Underflow",
      "Resting state, Threshold, Depolarization, Peak, Repolarization, Hyperpolarization"
    ],
    a: "D"
  },
  {
    q: "Which subatomic particle has a spin value of 1/2 and is classified as a lepton?",
    options: ["Electron", "Proton", "Neutron", "Gluon"],
    a: "A"
  },
  {
    q: "In late 2022, which NASA mission successfully redirected an asteroid's orbit via kinetic impact?",
    options: ["OSIRIS-REx", "DART (Double Asteroid Redirection Test)", "Lucy", "Psyche"],
    a: "B"
  }
];

function ArenaPage() {
  const [session, setSession] = useState<any>(null);
  
  // Global Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  
  // Rapid Fire State
  const [activeQuestion, setActiveQuestion] = useState<MCQQuestion | null>(null);
  
  // STEM Boss Raid States
  const [activeBoss, setActiveBoss] = useState<Boss | null>(null);
  const [bossAttackFlash, setBossAttackFlash] = useState(false);
  const [lobbyShield, setLobbyShield] = useState(100);
  const [screenFlashRed, setScreenFlashRed] = useState(false);
  
  // Friends State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [activePrivateChat, setActivePrivateChat] = useState<Friend | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const [privateInput, setPrivateInput] = useState("");

  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "buddies">("chat");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const channelRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const privateScrollRef = useRef<HTMLDivElement>(null);

  const activeQuestionRef = useRef<MCQQuestion | null>(null);
  const activeBossRef = useRef<Boss | null>(null);

  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  useEffect(() => {
    activeBossRef.current = activeBoss;
  }, [activeBoss]);

  const triggerNewQuestion = async () => {
    try {
      const res = await fetch("/api/generate-question");
      if (!res.ok) throw new Error("Failed to fetch generated question");
      const q = await res.json();
      
      // Dynamic random position in Arena viewport (safe boundaries: 15-65% top, 10-60% left)
      const top = `${Math.floor(Math.random() * 50) + 15}%`;
      const left = `${Math.floor(Math.random() * 50) + 10}%`;
      q.position = { top, left };

      // 50% chance of spawning a STEM Boss Raid instead of standard MCQ
      const isBossRaid = Math.random() < 0.5;
      if (isBossRaid) {
        const bossNames = ["Calculus Dragon", "Quantum Leviathan", "Entropy Behemoth"];
        const bossElements = ["Mathematics", "Physics", "Thermodynamics"];
        const bossAvatars = ["🐉", "🐋", "👹"];
        const idx = Math.floor(Math.random() * bossNames.length);

        const boss = {
          name: bossNames[idx],
          maxHp: 100,
          hp: 100,
          avatar: bossAvatars[idx],
          element: bossElements[idx],
          timer: 60
        };
        q.boss = boss;
        setActiveBoss(boss);
      } else {
        setActiveBoss(null);
      }

      channelRef.current?.send({ type: "broadcast", event: "rapid_fire", payload: q });
      setActiveQuestion(q);
    } catch (err) {
      console.error("Failed to generate dynamic question:", err);
      // Fallback to static MCQs
      const baseQ = RAPID_FIRE_QUESTIONS[Math.floor(Math.random() * RAPID_FIRE_QUESTIONS.length)];
      const q = { ...baseQ };
      const top = `${Math.floor(Math.random() * 50) + 15}%`;
      const left = `${Math.floor(Math.random() * 50) + 10}%`;
      q.position = { top, left };
      
      const isBossRaid = Math.random() < 0.5;
      if (isBossRaid) {
        const boss = {
          name: "Calculus Dragon",
          maxHp: 100,
          hp: 100,
          avatar: "🐉",
          element: "Mathematics",
          timer: 60
        };
        q.boss = boss;
        setActiveBoss(boss);
      } else {
        setActiveBoss(null);
      }
      
      channelRef.current?.send({ type: "broadcast", event: "rapid_fire", payload: q });
      setActiveQuestion(q);
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        // Load mock friends from local storage
        try {
          const storedF = localStorage.getItem(`stemos_friends_${data.session.user.id}`);
          if (storedF) setFriends(JSON.parse(storedF));
        } catch {}

        // Load global chat messages from localStorage
        try {
          const storedChat = localStorage.getItem("stemos_arena_global_chat");
          if (storedChat) setMessages(JSON.parse(storedChat));
        } catch {}
      }
    })();

    const channel = supabase.channel("live-arena", {
      config: { presence: { key: "user" }, broadcast: { self: true } }
    });

    channel
      .on("broadcast", { event: "chat" }, (payload) => {
        setMessages(prev => [...prev, payload.payload]);
      })
      .on("broadcast", { event: "system" }, (payload) => {
        setMessages(prev => [...prev, payload.payload]);
        if (payload.payload.action === "question_solved") {
          setActiveQuestion(null);
          setActiveBoss(null);
        }
      })
      .on("broadcast", { event: "rapid_fire" }, (payload) => {
        setActiveQuestion(payload.payload);
        if (payload.payload.boss) {
          setActiveBoss(payload.payload.boss);
        } else {
          setActiveBoss(null);
        }
      })
      .on("broadcast", { event: "boss_damage" }, (payload) => {
        // Trigger visual card shake
        setBossAttackFlash(true);
        setTimeout(() => setBossAttackFlash(false), 500);

        setActiveBoss(prev => {
          if (!prev) return null;
          const newHp = Math.max(prev.hp - payload.payload.damage, 0);
          if (newHp === 0) {
            toast.success(`🏆 The lobby has defeated the ${prev.name}!`);
            return null;
          }
          return { ...prev, hp: newHp };
        });
      })
      .on("broadcast", { event: "friend_request" }, (payload) => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user.id === payload.payload.to_id) {
            setPendingRequests(prev => {
              if (prev.find(p => p.id === payload.payload.from_id)) return prev;
              return [...prev, { id: payload.payload.from_id, username: payload.payload.from_username }];
            });
            toast.info(`New Study Buddy request from ${payload.payload.from_username}!`);
          }
        });
      })
      .on("broadcast", { event: "friend_accept" }, (payload) => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user.id === payload.payload.to_id) {
            const newFriend = { id: payload.payload.from_id, username: payload.payload.from_username };
            setFriends(prev => {
              const updated = [...prev, newFriend];
              localStorage.setItem(`stemos_friends_${data.session?.user.id}`, JSON.stringify(updated));
              return updated;
            });
            toast.success(`${payload.payload.from_username} accepted your request!`);
          }
        });
      })
      .on("broadcast", { event: "private_message" }, (payload) => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user.id === payload.payload.to_id || data.session?.user.id === payload.payload.from_id) {
            const partnerId = data.session?.user.id === payload.payload.to_id ? payload.payload.from_id : payload.payload.to_id;
            setPrivateMessages(prev => {
              const chat = prev[partnerId] || [];
              return { ...prev, [partnerId]: [...chat, payload.payload.msg] };
            });
          }
        });
      })
      .on("presence", { event: "sync" }, () => {
        setOnlineCount(Object.keys(channel.presenceState()).length || 1);
      })
      .on("broadcast", { event: "request_state" }, () => {
        if (activeQuestionRef.current) {
          channel.send({
            type: "broadcast",
            event: "respond_state",
            payload: {
              activeQuestion: activeQuestionRef.current,
              activeBoss: activeBossRef.current
            }
          });
        }
      })
      .on("broadcast", { event: "respond_state" }, (payload) => {
        if (!activeQuestionRef.current && payload.payload.activeQuestion) {
          setActiveQuestion(payload.payload.activeQuestion);
          if (payload.payload.activeBoss) {
            setActiveBoss(payload.payload.activeBoss);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
          setMessages([{ id: "sys1", user_id: "sys", username: "AI Moderator", content: "Welcome to the Arena. The AI is monitoring all chats to ensure study-focused topics only.", isSystem: true }]);
          // Request current active question/boss state from other clients
          channel.send({ type: "broadcast", event: "request_state", payload: {} });
        }
      });

    channelRef.current = channel;

    // Initial trigger
    const timeout = setTimeout(triggerNewQuestion, 5000);

    const interval = setInterval(triggerNewQuestion, 60000); // Popup every 60s (1 minute)

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time ticking boss countdown timer
  useEffect(() => {
    if (!activeBoss) {
      setLobbyShield(100);
      return;
    }
    const timer = setInterval(() => {
      setActiveBoss(prev => {
        if (!prev) return null;
        if (prev.timer <= 1) {
          clearInterval(timer);
          toast.error(`😢 Time ran out! The ${prev.name} has escaped!`);
          setActiveQuestion(null);
          return null;
        }
        
        const nextTimer = prev.timer - 1;
        // Boss Attacks every 15 seconds!
        if (nextTimer % 15 === 0 && nextTimer > 0) {
          const attacks = [
            "unleashed an Algebraic Storm",
            "fired a Quantum Entropy Beam",
            "triggered a Gravity Disruption wave",
            "cast a Thermodynamics Heatwave"
          ];
          const attackMove = attacks[Math.floor(Math.random() * attacks.length)];
          
          setScreenFlashRed(true);
          setTimeout(() => setScreenFlashRed(false), 500);

          setLobbyShield(s => {
            const nextShield = Math.max(s - 15, 0);
            if (nextShield === 0) {
              clearInterval(timer);
              toast.error(`☠️ DEFEATED! The ${prev.name} has shattered your lobby shield!`);
              setActiveQuestion(null);
              // Send defeat message
              const defeatMsg = {
                id: Math.random().toString(),
                user_id: "sys",
                username: "Boss Raid Bot",
                content: `❌ RAID DEFEATED! The ${prev.name} has shattered the lobby shield! The raid party has been wiped out.`,
                isSystem: true,
                action: "question_solved"
              };
              channelRef.current?.send({ type: "broadcast", event: "system", payload: defeatMsg });
              return 100;
            }
            toast.warning(`⚠️ BOSS ATTACK! The ${prev.name} ${attackMove}! -15 Lobby Shield!`);
            return nextShield;
          });
        }

        return { ...prev, timer: nextTimer };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeBoss]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (privateScrollRef.current) privateScrollRef.current.scrollTop = privateScrollRef.current.scrollHeight;
  }, [privateMessages, activePrivateChat]);

  // Save global chat messages to localStorage to persist after page refreshes
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("stemos_arena_global_chat", JSON.stringify(messages.slice(-50)));
      } catch (err) {
        console.error("Failed to save arena chat to localStorage:", err);
      }
    }
  }, [messages]);

  const checkModeration = async (text: string) => {
    const res = await fetch("/api/moderate-chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text })
    });
    return await res.json();
  };

  const handleGlobalSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !session) return;
    const text = input.trim();
    setInput(""); setSending(true);

    try {
      const mod = await checkModeration(text);
      if (!mod.allowed) {
        toast.error(`Blocked: ${mod.reason}`);
        setMessages(prev => [...prev, { id: Math.random().toString(), user_id: "sys", username: "AI Moderator", content: `⚠️ Blocked: ${mod.reason}`, isSystem: true }]);
        return;
      }
      const payload: Message = { id: Math.random().toString(), user_id: session.user.id, username: session.user.email?.split('@')[0] || "Student", content: text };
      channelRef.current?.send({ type: "broadcast", event: "chat", payload });
    } catch {
      toast.error("Moderation failed.");
    } finally {
      setSending(false);
    }
  };

  const handlePrivateSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateInput.trim() || sending || !session || !activePrivateChat) return;
    const text = privateInput.trim();
    setPrivateInput(""); setSending(true);

    try {
      const mod = await checkModeration(text);
      if (!mod.allowed) {
        toast.error(`Blocked: ${mod.reason}`);
        return;
      }
      const msg: Message = { id: Math.random().toString(), user_id: session.user.id, username: session.user.email?.split('@')[0] || "Student", content: text };
      channelRef.current?.send({ type: "broadcast", event: "private_message", payload: { from_id: session.user.id, to_id: activePrivateChat.id, msg } });
    } catch {
      toast.error("Moderation failed.");
    } finally {
      setSending(false);
    }
  };

  const handleRapidFireChoice = async (choice: string) => {
    if (!activeQuestion || !session) return;

    if (choice === activeQuestion.a) {
      const optionIndex = activeQuestion.a.charCodeAt(0) - 65;
      const optionText = activeQuestion.options[optionIndex] || activeQuestion.a;

      if (activeBoss) {
        // 1. Send boss damage broadcast to everyone
        channelRef.current?.send({ 
          type: "broadcast", 
          event: "boss_damage", 
          payload: { damage: 20, from_username: session.user.email?.split('@')[0] } 
        });

        // 2. Award exactly 21 XP/points for the successful strike!
        await supabase.from("quiz_attempts").insert({ 
          user_id: session.user.id, 
          subject: `Arena Boss Strike: ${activeBoss.name}`, 
          score: 1, 
          xp_earned: 21,
          total_questions: 1,
          difficulty: "Hard"
        });

        // 3. Update Profiles total_xp and emit dynamic update!
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("total_xp")
            .eq("id", session.user.id)
            .single();
          const currentXp = profile?.total_xp || 0;
          await supabase
            .from("profiles")
            .update({ total_xp: currentXp + 21 })
            .eq("id", session.user.id);
          window.dispatchEvent(new Event("stemos_xp_updated"));
        } catch (err) {
          console.error("Failed to increment user XP:", err);
        }

        // Check if this strike fully defeats the boss (since current HP inside state is before subtraction)
        if (activeBoss.hp <= 20) {
          const winMsg = { 
            id: Math.random().toString(), 
            user_id: "sys", 
            username: "Boss Raid Bot", 
            content: `🏆 LOBBY VICTORY! The ${activeBoss.name} has been defeated! Final blow dealt by ${session.user.email?.split('@')[0]}. Everyone earns a massive +100 XP shared bonus!`, 
            isSystem: true, 
            action: "question_solved" 
          };
          channelRef.current?.send({ type: "broadcast", event: "system", payload: winMsg });

          // Award Victory Shared XP!
          await supabase.from("quiz_attempts").insert({ 
            user_id: session.user.id, 
            subject: `Arena Raid Win: ${activeBoss.name}`, 
            score: 1, 
            xp_earned: 100,
            total_questions: 1,
            difficulty: "Hard"
          });
          
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("total_xp")
              .eq("id", session.user.id)
              .single();
            const currentXp = profile?.total_xp || 0;
            await supabase
              .from("profiles")
              .update({ total_xp: currentXp + 100 })
              .eq("id", session.user.id);
            window.dispatchEvent(new Event("stemos_xp_updated"));
          } catch (err) {
            console.error("Failed to increment victory XP:", err);
          }

          setActiveBoss(null);
          setActiveQuestion(null);
          toast.success("Calculus solved! Boss defeated! +100 XP bonus!");
        } else {
          // Send attack system message in general log
          const attackMsg = {
            id: Math.random().toString(),
            user_id: "sys",
            username: "Boss Raid Bot",
            content: `💥 ${session.user.email?.split('@')[0]} dealt 20 damage to the ${activeBoss.name}! (${activeBoss.hp - 20}/${activeBoss.maxHp} HP left)`,
            isSystem: true
          };
          channelRef.current?.send({ type: "broadcast", event: "system", payload: attackMsg });
          toast.success("Correct answer! Dealt 20 damage to the boss!");
        }
      } else {
        // Standard MCQ Rapid Fire solved
        setActiveQuestion(null); // Hide question instantly for blazing fast visual response!
        const winMsg = { 
          id: Math.random().toString(), 
          user_id: "sys", 
          username: "Rapid Fire Bot", 
          content: `🎉 ${session.user.email?.split('@')[0]} answered correctly! Option ${activeQuestion.a}: "${optionText}". +21 XP!`, 
          isSystem: true, 
          action: "question_solved" 
        };
        
        // Award exactly 21 XP/points!
        await supabase.from("quiz_attempts").insert({ 
          user_id: session.user.id, 
          subject: "Arena Rapid Fire MCQ", 
          score: 1, 
          xp_earned: 21,
          total_questions: 1,
          difficulty: "Hard"
        });

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("total_xp")
            .eq("id", session.user.id)
            .single();
          const currentXp = profile?.total_xp || 0;
          await supabase
            .from("profiles")
            .update({ total_xp: currentXp + 21 })
            .eq("id", session.user.id);
          window.dispatchEvent(new Event("stemos_xp_updated"));
        } catch (err) {
          console.error("Failed to increment user XP:", err);
        }
        
        channelRef.current?.send({ type: "broadcast", event: "system", payload: winMsg });
        toast.success("Correct answer! +21 points!");
      }
    } else {
      if (activeBoss) {
        // Counter-attack on wrong answer choice!
        setLobbyShield(s => {
          const nextShield = Math.max(s - 10, 0);
          if (nextShield === 0) {
            toast.error(`☠️ DEFEATED! Counter-attack shattered the lobby shield!`);
            setActiveQuestion(null);
            setActiveBoss(null);
            
            const defeatMsg = {
              id: Math.random().toString(),
              user_id: "sys",
              username: "Boss Raid Bot",
              content: `❌ RAID DEFEATED! The party was wiped out by a devastating boss counter-attack on an incorrect answer.`,
              isSystem: true,
              action: "question_solved"
            };
            channelRef.current?.send({ type: "broadcast", event: "system", payload: defeatMsg });
            return 100;
          }
          toast.error(`💥 COUNTER-ATTACK! Wrong choice! The ${activeBoss.name} strikes the party shield for 10 damage!`);
          return nextShield;
        });
      } else {
        toast.error("Incorrect! Try another option.");
      }
    }
  };

  const sendFriendRequest = (u_id: string, u_name: string) => {
    if (!session || u_id === session.user.id || friends.find(f => f.id === u_id)) return;
    channelRef.current?.send({ type: "broadcast", event: "friend_request", payload: { from_id: session.user.id, from_username: session.user.email?.split('@')[0], to_id: u_id } });
    toast.success("Friend request sent!");
  };

  const acceptRequest = (f: Friend) => {
    if (!session) return;
    const updated = [...friends, f];
    setFriends(updated);
    localStorage.setItem(`stemos_friends_${session.user.id}`, JSON.stringify(updated));
    setPendingRequests(prev => prev.filter(p => p.id !== f.id));
    channelRef.current?.send({ type: "broadcast", event: "friend_accept", payload: { from_id: session.user.id, from_username: session.user.email?.split('@')[0], to_id: f.id } });
    toast.success("Added to Study Buddies!");
  };

  return (
    <Layout>
      {/* Red screen flash when boss attacks */}
      <AnimatePresence>
        {screenFlashRed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-4 md:py-6 h-[calc(100vh-100px)] md:h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 md:gap-6 relative">
        
        {/* Mobile Navigation Tab Bar (Visible only on mobile) */}
        {isMobile && (
          <div className="flex bg-card border rounded-2xl p-1 gap-1 flex-shrink-0 w-full">
            <button 
              onClick={() => setMobileTab("chat")} 
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mobileTab === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"}`}
            >
              Global Chat
            </button>
            <button 
              onClick={() => setMobileTab("buddies")} 
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mobileTab === "buddies" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"} flex items-center justify-center gap-1.5`}
            >
              Study Buddies
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Left Sidebar: Study Buddies */}
        <div className={`w-full md:w-64 flex-shrink-0 bg-card border rounded-[2rem] shadow-sm flex flex-col overflow-hidden ${isMobile && mobileTab !== "buddies" ? "hidden" : "flex"}`}>
          <div className="p-5 border-b bg-surface">
            <h2 className="font-display font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Study Buddies
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Requests</h3>
                <div className="space-y-2">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-background border p-2 rounded-xl text-sm">
                      <span className="font-medium truncate">{r.username}</span>
                      <button onClick={() => acceptRequest(r)} className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20"><Check className="h-4 w-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">My Friends</h3>
              {friends.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Click the add button next to users in the global chat to add them!</p>
              ) : (
                <div className="space-y-2">
                  {friends.map(f => (
                    <button key={f.id} onClick={() => setActivePrivateChat(f)} className="w-full flex items-center gap-3 bg-background border p-3 rounded-xl hover:shadow-soft transition text-left">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{f.username.slice(0,2).toUpperCase()}</div>
                      <span className="font-medium text-sm flex-1 truncate">{f.username}</span>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Global Chat */}
        <div className={`flex-1 bg-card border rounded-[2rem] shadow-sm flex flex-col overflow-hidden ${isMobile && mobileTab !== "chat" ? "hidden" : "flex"}`}>
          <div className="flex items-center justify-between bg-surface border-b p-5">
            <div>
              <h1 className="font-display text-xl font-bold flex items-center gap-2">
                Global Study Hub
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> AI Moderated Study-Only Zone
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => triggerNewQuestion()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border border-primary/30 hover:bg-primary/25 text-primary text-xs font-bold rounded-full transition shadow-soft cursor-pointer hover:scale-105 active:scale-95 duration-200"
                title="Immediately trigger a new AI MCQ or Collaborative STEM Boss Raid!"
              >
                <Zap className="h-3.5 w-3.5 fill-current animate-pulse text-primary" /> Spawn Raid
              </button>

              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{onlineCount} Online</span>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 bg-background overflow-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((m) => {
                const isMe = m.user_id === session?.user?.id;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${m.isSystem ? "text-amber-500" : isMe ? "text-primary" : "text-muted-foreground"}`}>
                        {m.username}
                      </span>
                      {!isMe && !m.isSystem && session && (
                        <button onClick={() => sendFriendRequest(m.user_id, m.username)} className="text-muted-foreground hover:text-primary transition" title="Add Study Buddy">
                          <UserPlus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl ${
                      m.isSystem ? "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-medium" 
                      : isMe ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-surface border shadow-soft rounded-tl-sm"
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="bg-surface border-t p-4">
            <form onSubmit={handleGlobalSend} className="flex gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Discuss study topics..." className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary transition" disabled={!session || sending} />
              <button type="submit" disabled={!input.trim() || sending || !session} className="px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Private Chat Modal Overlay */}
        <AnimatePresence>
          {activePrivateChat && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`absolute bg-card border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-40 ${
                isMobile 
                  ? "fixed bottom-4 left-4 right-4 h-96 w-auto" 
                  : "bottom-6 right-6 w-80 h-96"
              }`}
              style={isMobile ? { bottom: "16px", left: "16px", right: "16px", top: "auto" } : undefined}
            >
              <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                <div className="font-semibold text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4"/> {activePrivateChat.username}</div>
                <button onClick={() => setActivePrivateChat(null)} className="hover:opacity-80"><X className="h-4 w-4"/></button>
              </div>
              <div ref={privateScrollRef} className="flex-1 bg-background overflow-auto p-4 space-y-3">
                <div className="text-xs text-center text-muted-foreground mb-4">AI Moderation is active. Keep it academic!</div>
                {(privateMessages[activePrivateChat.id] || []).map((m) => {
                  const isMe = m.user_id === session?.user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-3 py-2 text-sm rounded-xl ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-surface border rounded-tl-sm"}`}>
                        {m.content}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 bg-surface border-t">
                <form onSubmit={handlePrivateSend} className="flex gap-2">
                  <input type="text" value={privateInput} onChange={e => setPrivateInput(e.target.value)} placeholder="Message..." className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none" disabled={sending} />
                  <button type="submit" disabled={!privateInput.trim() || sending} className="p-2 rounded-lg bg-primary text-primary-foreground"><Send className="h-4 w-4"/></button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rapid Fire & STEM Boss Overlay Panel */}
        <AnimatePresence>
          {activeQuestion && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={
                bossAttackFlash 
                  ? { x: [-10, 10, -10, 10, 0], scale: [1, 1.05, 0.95, 1.02, 1], transition: { duration: 0.4 } } 
                  : { opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0, scale: 0.8 }} 
              className={`absolute bg-gradient-to-br p-[2px] rounded-[2rem] shadow-glow z-30 transition-all duration-300 ${
                isMobile ? "fixed left-4 right-4 w-auto" : "w-80"
              } ${activeBoss ? "from-red-500 via-orange-500 to-amber-500" : "from-amber-500 to-orange-600"}`}
              style={
                isMobile
                  ? { bottom: "16px", top: "auto", left: "16px", right: "16px" }
                  : {
                      top: activeQuestion.position?.top || "20%",
                      left: activeQuestion.position?.left || "30%",
                      right: "auto"
                    }
              }
            >
              <div className="bg-card text-foreground h-full w-full rounded-[calc(2rem-2px)] p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Zap className="h-24 w-24" /></div>
                
                {/* STEM Boss Raid Header details */}
                {activeBoss ? (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl animate-bounce shrink-0">{activeBoss.avatar}</span>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">STEM BOSS RAID</h4>
                          <h3 className="font-display font-extrabold text-sm text-foreground mt-1 leading-none truncate">{activeBoss.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-red-500/25 text-red-500 px-2 py-1 rounded-lg text-xs font-black font-mono shrink-0">
                        <Clock className="h-3.5 w-3.5 animate-spin" /> {activeBoss.timer}s
                      </div>
                    </div>
                    
                    {/* Glowing Health Bar */}
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden border border-red-500/15 relative shrink-0">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300 shadow-glow" 
                        style={{ width: `${(activeBoss.hp / activeBoss.maxHp) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-foreground drop-shadow font-mono select-none">
                        {activeBoss.hp} / {activeBoss.maxHp} HP
                      </span>
                    </div>

                    {/* Glowing Lobby Shield Bar */}
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden border border-cyan-500/15 relative shrink-0">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-600 to-teal-500 transition-all duration-300 shadow-glow" 
                        style={{ width: `${lobbyShield}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-foreground drop-shadow font-mono select-none">
                        🛡️ LOBBY SHIELD: {lobbyShield} / 100 HP
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 fill-current" /> Rapid Fire MCQ
                  </div>
                )}

                <h3 className="font-display font-bold text-xs leading-snug mb-4">
                  {activeBoss ? `🛡️ WEAKNESS: ${activeQuestion.q}` : activeQuestion.q}
                </h3>
                
                <div className="space-y-2">
                  {activeQuestion.options.map((opt: string, idx: number) => {
                    const label = String.fromCharCode(65 + idx); // A, B, C, D
                    return (
                      <button
                        key={idx}
                        onClick={() => handleRapidFireChoice(label)}
                        className={`w-full text-left bg-background border px-4 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2 group text-foreground cursor-pointer ${
                          activeBoss 
                            ? "hover:bg-red-500/10 border-red-500/20 hover:border-red-500" 
                            : "hover:bg-amber-500/10 border-amber-500/20 hover:border-amber-500"
                        }`}
                      >
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          activeBoss
                            ? "bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                            : "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                        }`}>
                          {label}
                        </span>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}

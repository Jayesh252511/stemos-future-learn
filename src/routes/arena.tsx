import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, ShieldAlert, UserPlus, Users, MessageSquare, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "Live Arena — STEMOS" }] }),
  component: ArenaPage,
});

type Message = { id: string; user_id: string; username: string; content: string; isSystem?: boolean; };
type Friend = { id: string; username: string };

type MCQQuestion = {
  q: string;
  options: string[];
  a: string; // "A" | "B" | "C" | "D"
  position?: { top: string; left: string; };
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
  
  // Friends State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [activePrivateChat, setActivePrivateChat] = useState<Friend | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const [privateInput, setPrivateInput] = useState("");

  const channelRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const privateScrollRef = useRef<HTMLDivElement>(null);

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
        }
      })
      .on("broadcast", { event: "rapid_fire" }, (payload) => {
        setActiveQuestion(payload.payload);
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
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
          setMessages([{ id: "sys1", user_id: "sys", username: "AI Moderator", content: "Welcome to the Arena. The AI is monitoring all chats to ensure study-focused topics only.", isSystem: true }]);
        }
      });

    channelRef.current = channel;

    const triggerNewQuestion = async () => {
      try {
        const res = await fetch("/api/generate-question");
        if (!res.ok) throw new Error("Failed to fetch generated question");
        const q = await res.json();
        
        // Dynamic random position in Arena viewport (safe boundaries: 15-65% top, 10-60% left)
        const top = `${Math.floor(Math.random() * 50) + 15}%`;
        const left = `${Math.floor(Math.random() * 50) + 10}%`;
        q.position = { top, left };

        channel.send({ type: "broadcast", event: "rapid_fire", payload: q });
        setActiveQuestion(q);
      } catch (err) {
        console.error("Failed to generate dynamic question:", err);
        // Fallback to static MCQs
        const baseQ = RAPID_FIRE_QUESTIONS[Math.floor(Math.random() * RAPID_FIRE_QUESTIONS.length)];
        const q = { ...baseQ };
        const top = `${Math.floor(Math.random() * 50) + 15}%`;
        const left = `${Math.floor(Math.random() * 50) + 10}%`;
        q.position = { top, left };
        
        channel.send({ type: "broadcast", event: "rapid_fire", payload: q });
        setActiveQuestion(q);
      }
    };

    // Initial trigger
    setTimeout(triggerNewQuestion, 5000);

    const interval = setInterval(triggerNewQuestion, 60000); // Popup every 60s (1 minute)

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (privateScrollRef.current) privateScrollRef.current.scrollTop = privateScrollRef.current.scrollHeight;
  }, [privateMessages, activePrivateChat]);

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
        xp_earned: 21 
      });
      
      channelRef.current?.send({ type: "broadcast", event: "system", payload: winMsg });
      setActiveQuestion(null);
      toast.success("Correct answer! +21 points!");
    } else {
      toast.error("Incorrect! Try another option.");
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
      <div className="mx-auto max-w-7xl px-4 py-6 h-[calc(100vh-80px)] flex gap-6 relative">
        
        {/* Left Sidebar: Study Buddies */}
        <div className="w-64 flex-shrink-0 bg-card border rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
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
        <div className="flex-1 bg-card border rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-surface border-b p-5">
            <div>
              <h1 className="font-display text-xl font-bold flex items-center gap-2">
                Global Study Hub
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> AI Moderated Study-Only Zone
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{onlineCount} Online</span>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute bottom-6 right-6 w-80 h-96 bg-card border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-40">
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

        {/* Rapid Fire Overlay Panel */}
        <AnimatePresence>
          {activeQuestion && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              className="absolute w-80 bg-gradient-to-br from-amber-500 to-orange-600 text-white p-[2px] rounded-[2rem] shadow-glow z-30"
              style={{
                top: activeQuestion.position?.top || "20%",
                left: activeQuestion.position?.left || "30%",
                right: "auto"
              }}
            >
              <div className="bg-card text-foreground h-full w-full rounded-[calc(2rem-2px)] p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Zap className="h-24 w-24" /></div>
                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Zap className="h-3.5 w-3.5 fill-current" /> Rapid Fire MCQ
                </div>
                <h3 className="font-display font-bold text-sm leading-snug mb-4">{activeQuestion.q}</h3>
                
                <div className="space-y-2">
                  {activeQuestion.options.map((opt: string, idx: number) => {
                    const label = String.fromCharCode(65 + idx); // A, B, C, D
                    return (
                      <button
                        key={idx}
                        onClick={() => handleRapidFireChoice(label)}
                        className="w-full text-left bg-background hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 px-4 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2 group text-foreground"
                      >
                        <span className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 transition">
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

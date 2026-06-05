import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Sparkles, Send, Atom, Sigma, FlaskConical, Code2, Plus, MessageSquare,
  BrainCircuit, Lightbulb, ListChecks, Globe2, FileText, Square,
  BookOpen, Zap, Copy, Check, ChevronDown, Mic, Volume2, VolumeX, Pause
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { streamChat, type ChatMsg } from "@/lib/ai-stream";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, AI_LANG_NAME } from "@/lib/i18n";
import { useTutorLanguage } from "@/lib/i18n-tutor";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "STEMOS AI Tutor" },
      { name: "description", content: "Ask any STEM question and get step-by-step explanations from the STEMOS Tutor." },
    ],
  }),
  component: TutorPage,
});

import { DoodleAtom, DoodleCode, DoodleFormula, DoodleStar } from "@/components/site/Doodles";

const topicStyles: Record<string, any> = {
  Physics: { icon: Atom, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  Math: { icon: Sigma, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  Chemistry: { icon: FlaskConical, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10 border-fuchsia-500/20" },
  Coding: { icon: Code2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

const quickActions = [
  { key: "explainSimply" as const, icon: Lightbulb, prompt: "Explain that again, simply, like I'm a beginner. Use an everyday analogy." },
  { key: "realWorldEx" as const, icon: Globe2, prompt: "Give me a real-world example of that concept that I'd encounter in daily life." },
  { key: "createQuiz" as const, icon: ListChecks, prompt: "Create 3 multiple-choice questions to test my understanding of what you just explained. Show the answers at the end." },
  { key: "summarize" as const, icon: FileText, prompt: "Summarize everything we've discussed so far in 5 bullet points." },
  { key: "goDeeper" as const, icon: BookOpen, prompt: "Go deeper into the last concept. Explain it at an advanced level with more technical detail." },
  { key: "quickFlashcard" as const, icon: Zap, prompt: "Make a flashcard format: Q on top, A below, for the key concept we just discussed." },
];

type Conversation = { id: string; title: string; messages: ChatMsg[]; updatedAt: number };
const STORAGE_KEY = "stemos.chats.v2";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveConversations(list: Conversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30))); } catch {}
}
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function TutorPage() {
  const { lang, t } = useLanguage();
  const { tt } = useTutorLanguage();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice Mode States & Refs
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const [voiceEngine, setVoiceEngine] = useState<"system" | "elevenlabs">("system");
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [autoListen, setAutoListen] = useState(true);
  const [liveTranscript, _setLiveTranscript] = useState("");
  const [currentSpokenSentence, setCurrentSpokenSentence] = useState("");

  const liveTranscriptRef = useRef("");
  const setLiveTranscript = (val: string) => {
    liveTranscriptRef.current = val;
    _setLiveTranscript(val);
  };

  const speechQueue = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const interruptedRef = useRef<boolean>(false);
  const currentResponseBuffer = useRef<string>("");
  const lastProcessedIndex = useRef<number>(0);

  // Stop speaking and clean up on component unmount
  useEffect(() => {
    return () => {
      interrupt();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Web Speech API Best Practice: Pre-load and cache voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const interrupt = () => {
    interruptedRef.current = true;
    speechQueue.current = [];
    isSpeakingRef.current = false;
    setSpeaking(false);
    
    // Stop system TTS
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setVoiceState("idle");
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (!enabled) {
      interrupt();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setVoiceState("idle");
      // Short delay for UI transition, then start listening
      setTimeout(() => {
        startAutoListening();
      }, 500);
    }
  };

  const startAutoListening = () => {
    if (interruptedRef.current || !voiceEnabled) return;
    
    // Cancel active synthesis/playback before listening
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setVoiceState("listening");
    setLiveTranscript("");
    
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    
    if (!recognitionRef.current) {
      initializeRecognition();
    }
    
    // Configure for auto-send in Voice Console
    recognitionRef.current.onend = () => {
      setRecording(false);
      const textToSend = liveTranscriptRef.current?.trim();
      if (textToSend && voiceEnabled) {
        send(textToSend);
      } else {
        setVoiceState("idle");
      }
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log("Speech recognition start attempt:", err);
    }
  };

  const initializeRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : "en-US";
    
    rec.onstart = () => {
      setRecording(true);
      if (voiceEnabled) {
        setVoiceState("listening");
      }
      setLiveTranscript("");
    };
    
    rec.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (interimTranscript) {
        setLiveTranscript(interimTranscript);
      } else if (finalTranscript) {
        setLiveTranscript(finalTranscript);
      }
    };
    
    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setRecording(false);
      if (voiceEnabled) {
        setVoiceState("idle");
      }
    };
    
    recognitionRef.current = rec;
  };

  const queueSentence = (sentence: string) => {
    if (interruptedRef.current) return;
    
    // Remove markdown symbols to read cleanly
    const clean = sentence
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/#+\s+/g, "")
      .trim();
      
    if (!clean) return;
    speechQueue.current.push(clean);
    processQueue();
  };

  const processQueue = async () => {
    if (interruptedRef.current) {
      isSpeakingRef.current = false;
      setVoiceState("idle");
      return;
    }

    if (speechQueue.current.length === 0) {
      isSpeakingRef.current = false;
      if (!streaming) {
        if (voiceEnabled && autoListen) {
          startAutoListening();
        } else {
          setVoiceState("idle");
        }
      } else {
        setVoiceState("thinking");
      }
      return;
    }

    isSpeakingRef.current = true;
    setVoiceState("speaking");
    const sentence = speechQueue.current.shift()!;
    setCurrentSpokenSentence(sentence);

    try {
      await speakSentence(sentence);
    } catch (err) {
      console.error("Speech playback error:", err);
    } finally {
      isSpeakingRef.current = false;
      processQueue();
    }
  };

  const speakSentence = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (interruptedRef.current) {
        resolve();
        return;
      }

      if (voiceEngine === "system") {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("System speech synthesis not supported"));
          return;
        }
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : "en-US";
        
        const voices = window.speechSynthesis.getVoices();
        const matchVoice = voices.find(v => v.lang.startsWith(utterance.lang) && v.name.toLowerCase().includes("google"));
        if (matchVoice) {
          utterance.voice = matchVoice;
        }
        
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          console.error("System TTS error:", e);
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        })
        .then(resp => {
          if (!resp.ok) throw new Error("ElevenLabs returned error");
          return resp.blob();
        })
        .then(blob => {
          if (interruptedRef.current) {
            resolve();
            return;
          }
          
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onended = () => resolve();
          audio.onerror = () => {
            console.warn("ElevenLabs audio play error. Falling back to system TTS for this sentence...");
            audioRef.current = null;
            speakSentenceSystemFallback(text).then(resolve);
          };
          
          audio.play().catch(err => {
            console.error("Audio playback play() failed:", err);
            speakSentenceSystemFallback(text).then(resolve);
          });
        })
        .catch(err => {
          console.warn("ElevenLabs request failed, falling back to system TTS:", err);
          speakSentenceSystemFallback(text).then(resolve);
        });
      }
    });
  };

  const speakSentenceSystemFallback = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis || interruptedRef.current) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : "en-US";
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const toggleRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    interrupt();
    setLiveTranscript("");

    if (!recognitionRef.current) {
      initializeRecognition();
    }

    // Configure for inline typing
    recognitionRef.current.onend = () => {
      setRecording(false);
      const text = liveTranscriptRef.current?.trim();
      if (text) {
        setInput(prev => (prev + " " + text).trim());
      }
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log("Speech recognition start attempt:", err);
    }
  };

  useEffect(() => {
    setConversations(loadConversations());
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "";
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamed]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      // Clear the param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Wait briefly for states to initialize
      setTimeout(() => {
        const msg = t("helpMeWith") ? `${t("helpMeWith")} ${q}.` : `Help me learn about: ${q}. Let's start with the basics.`;
        send(msg);
      }, 300);
    }
  }, []);

  const persist = (msgs: ChatMsg[]) => {
    if (msgs.length === 0) return;
    const firstUser = msgs.find(m => m.role === "user")?.content ?? "New chat";
    const title = firstUser.slice(0, 60);
    const id = activeId ?? crypto.randomUUID();
    const next: Conversation = { id, title, messages: msgs, updatedAt: Date.now() };
    setActiveId(id);
    setConversations(prev => {
      const list = [next, ...prev.filter(c => c.id !== id)];
      saveConversations(list);
      return list;
    });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setStreamed("");

    let acc = "";
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const localeStr = lang !== "en" ? AI_LANG_NAME[lang] : undefined;

    // Reset speech states
    interrupt();
    interruptedRef.current = false;
    if (voiceEnabled) {
      setVoiceState("thinking");
      currentResponseBuffer.current = "";
      lastProcessedIndex.current = 0;
    }

    try {
      await streamChat({
        messages: next,
        signal: ctrl.signal,
        locale: localeStr,
        onDelta: chunk => { 
          acc += chunk; 
          setStreamed(acc); 
          
          if (voiceEnabled) {
            currentResponseBuffer.current = acc;
            // Match completed sentences (ending with ., ?, !, or newlines)
            let lastIdx = lastProcessedIndex.current;
            const remainingText = acc.slice(lastIdx);
            const matches = [...remainingText.matchAll(/[^.!?\n\r]+[.!?\n\r]+/g)];
            if (matches.length > 0) {
              for (const m of matches) {
                const sentence = m[0].trim();
                if (sentence) {
                  queueSentence(sentence);
                }
                lastIdx += m[0].length;
              }
              lastProcessedIndex.current = lastIdx;
            }
          }
        },
      });
      const finalMsgs = [...next, { role: "assistant" as const, content: acc }];
      setMessages(finalMsgs);
      persist(finalMsgs);
      
      if (voiceEnabled) {
        // Queue any final remaining text that didn't end with a punctuation mark
        const remaining = acc.slice(lastProcessedIndex.current).trim();
        if (remaining) {
          queueSentence(remaining);
        }
        // Run queue processor to ensure final sentence starts playing
        processQueue();
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        if (acc) {
          const finalMsgs = [...next, { role: "assistant" as const, content: acc + "\n\n_[stopped]_" }];
          setMessages(finalMsgs);
          persist(finalMsgs);
        }
      } else {
        toast.error(e?.message ?? "Something went wrong");
        setMessages(next);
      }
    } finally {
      setStreamed("");
      setStreaming(false);
      abortRef.current = null;
      if (voiceEnabled) {
        processQueue();
      }
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeaking(false);
    }
  };
  const newChat = () => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeaking(false);
    }
    setMessages([]); setActiveId(null); setStreamed("");
    setSuggestionIdx(i => i + 1);
  };
  const openChat = (c: Conversation) => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeaking(false);
    }
    setActiveId(c.id); setMessages(c.messages); setStreamed("");
  };
  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeaking(false);
    }
    setConversations(prev => { const list = prev.filter(c => c.id !== id); saveConversations(list); return list; });
    if (activeId === id) { setMessages([]); setActiveId(null); }
  };

  const allSuggestions = tt("suggestions") as unknown as string[][];
  const suggestions = allSuggestions[suggestionIdx % allSuggestions.length];
  const topics = tt("topics") as unknown as { name: string; key: string }[];

  return (
    <Layout hideFooter>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-65px)]">
        <aside className="hidden lg:flex flex-col rounded-2xl border bg-surface overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={newChat}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> {t("newChat")}
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{t("recentChats")}</div>
            {conversations.length === 0 && (
              <div className="px-2.5 py-6 text-center text-xs text-muted-foreground">
                {tt("emptyChats")}
              </div>
            )}
            {conversations.map(c => (
              <button key={c.id} onClick={() => openChat(c)}
                className={`w-full text-left rounded-lg px-2.5 py-2 transition group ${activeId === c.id ? "bg-secondary" : "hover:bg-secondary"}`}>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(c.updatedAt)}</div>
                  </div>
                  <button onClick={e => deleteChat(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition text-[10px] px-1" title={tt("deleteL") as string}>✕</button>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t text-[11px] text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5" /> {t("poweredBy")}
          </div>
        </aside>

        <section className="flex flex-col rounded-2xl border bg-card shadow-soft overflow-hidden h-full relative">
          <div className="relative border-b px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">{tt("stemosTutor")}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {tt("onlineRepliesIn")} {lang !== "en" ? AI_LANG_NAME[lang] : "Groq LLaMA"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Voice Mode Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none text-muted-foreground hover:text-foreground transition">
                <Volume2 className={`h-4 w-4 ${voiceEnabled ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <span>Voice Mode</span>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => handleVoiceToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
              </label>

              <div className="hidden sm:flex gap-1.5">
                {topics.map(tp => {
                  const style = topicStyles[tp.key];
                  return (
                    <button key={tp.key} onClick={() => send(`${tt("helpMeWith")} ${tp.name}.`)}
                      disabled={streaming}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs hover:opacity-80 transition disabled:opacity-50 ${style.bg}`}>
                      <style.icon className={`h-3.5 w-3.5 ${style.color}`} /> {tp.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-4 md:px-8 py-6 space-y-6">
            {messages.length === 0 && !streaming && (
              <div className="h-full flex flex-col items-center justify-center text-center pt-12 relative">
                {/* Background doodles on empty state */}
                <DoodleStar className="absolute top-4 left-8 text-amber-500" size={36} opacity={0.12} />
                <DoodleFormula className="absolute bottom-16 right-4 text-violet-500" size={70} opacity={0.1} />

                <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold">
                  {userName ? t("whatToLearn").replace("?", `, ${userName.split(" ")[0]}?`) : t("whatToLearn")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {t("askAnything")}
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left rounded-xl border bg-card hover:bg-secondary transition p-3.5 text-sm shadow-soft group">
                      <span className="group-hover:text-primary transition-colors">{s}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSuggestionIdx(i => i + 1)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                  <ChevronDown className="h-3.5 w-3.5" /> {t("showDifferent")}
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            </AnimatePresence>
            {streaming && <Bubble msg={{ role: "assistant", content: streamed }} typing />}
          </div>

          {messages.length > 0 && !streaming && (
            <div className="relative border-t border-b bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Zap className="h-4 w-4 animate-pulse" /> Ready to test what you just learned?
              </div>
              <button 
                onClick={() => {
                  const chatContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\\n\\n");
                  sessionStorage.setItem("stemos_quiz_context", chatContext);
                  window.location.href = "/quiz";
                }} 
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-background text-xs font-bold rounded-lg hover:opacity-90 transition"
              >
                <ListChecks className="h-3.5 w-3.5" /> Generate Interactive Quiz
              </button>
            </div>
          )}

          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && !streaming && (
            <div className="relative border-t px-4 py-2.5 flex flex-wrap gap-1.5 bg-surface">
              {quickActions.map(a => (
                <button key={a.key} onClick={() => send(a.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary transition">
                  <a.icon className="h-3 w-3" /> {t(a.key)}
                </button>
              ))}
            </div>
          )}

          <div className="relative border-t bg-surface p-4">
            <form onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft focus-within:ring-glow transition">
              
              {/* Vocal input mic button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition shrink-0 border ${
                  recording 
                    ? "bg-red-500 text-white border-red-500 animate-pulse shadow-glow-red" 
                    : "bg-surface hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Vocal Input (Speech to Text)"
              >
                <Mic className="h-4 w-4" />
              </button>

              <textarea ref={textareaRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={t("askAnything")} rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none max-h-40" />
              {streaming ? (
                <button type="button" onClick={stop}
                  className="h-9 w-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition shrink-0" aria-label={t("stopGenerate")}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()}
                  className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition shrink-0" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">{t("tutorDisclaimer")}</p>
          </div>

          {/* Voice Console Overlay */}
          <AnimatePresence>
            {voiceEnabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-background/95 backdrop-blur-xl z-30 flex flex-col justify-between p-6 md:p-10 text-foreground"
              >
                {/* Top Controls */}
                <div className="w-full flex items-center justify-between border-b pb-4 border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold tracking-tight text-foreground">STEMOS Voice Console</span>
                  </div>
                  
                  {/* Toggle Switches */}
                  <div className="flex items-center gap-4">
                    {/* TTS Engine Switcher */}
                    <div className="flex bg-secondary p-1 rounded-xl border border-border/40 text-xs">
                      <button
                        type="button"
                        onClick={() => setVoiceEngine("system")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${voiceEngine === "system" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        System (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceEngine("elevenlabs")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${voiceEngine === "elevenlabs" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        ElevenLabs (Premium)
                      </button>
                    </div>

                    {/* Auto Listen Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none text-muted-foreground hover:text-foreground transition">
                      <span>Hands-Free Loop</span>
                      <input
                        type="checkbox"
                        checked={autoListen}
                        onChange={(e) => setAutoListen(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {/* Main Console Center (Visualizer & Orb) */}
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  
                  <div className="h-64 w-64 md:h-80 md:w-80 flex items-center justify-center relative">
                    
                    {/* Glowing Aura rings behind */}
                    <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-3xl opacity-60 animate-pulse" />

                    <AnimatePresence mode="wait">
                      {voiceState === "listening" && (
                        <motion.div
                          key="listening"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="relative flex items-center justify-center h-48 w-48"
                        >
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0.7, opacity: 0.8 }}
                              animate={{ scale: 1.6, opacity: 0 }}
                              transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.7, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full border border-emerald-500 bg-emerald-500/5"
                            />
                          ))}
                          <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="relative h-28 w-28 rounded-full bg-emerald-500 text-background flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-emerald-400"
                          >
                            <Mic className="h-10 w-10 text-white" />
                          </motion.div>
                        </motion.div>
                      )}

                      {voiceState === "thinking" && (
                        <motion.div
                          key="thinking"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="relative flex items-center justify-center h-40 w-40"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-violet-500 border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute inset-4 rounded-full border-b-2 border-l-2 border-fuchsia-500 border-t-transparent border-r-transparent"
                          />
                          <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/30">
                            <Sparkles className="h-8 w-8 text-violet-400 animate-pulse" />
                          </div>
                        </motion.div>
                      )}

                      {voiceState === "speaking" && (
                        <motion.div
                          key="speaking"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-end justify-center gap-2 h-32 w-full px-4"
                        >
                          {[...Array(9)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                height: ["15%", `${25 + Math.sin(i * 0.5) * 60 + Math.random() * 15}%`, "15%"],
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 0.4 + Math.random() * 0.4, 
                                ease: "easeInOut",
                                delay: i * 0.04
                              }}
                              className="w-3 rounded-full bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            />
                          ))}
                        </motion.div>
                      )}

                      {voiceState === "idle" && (
                        <motion.div
                          key="idle"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="h-32 w-32 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex items-center justify-center cursor-pointer hover:border-amber-500/60 transition-colors"
                          onClick={startAutoListening}
                        >
                          <Volume2 className="h-10 w-10 text-amber-500 opacity-60 animate-pulse" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Live Subtitles / Transcripts */}
                  <div className="w-full max-w-lg mt-6 text-center space-y-2 px-4 h-24 overflow-hidden flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {voiceState === "listening" && (
                        <motion.div
                          key="listening-sub"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-emerald-500 font-bold">Listening</div>
                          <p className="text-sm font-medium text-foreground italic">
                            {liveTranscript || "Speak your question..."}
                          </p>
                        </motion.div>
                      )}

                      {voiceState === "thinking" && (
                        <motion.div
                          key="thinking-sub"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-violet-400 font-bold">Thinking</div>
                          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
                            Formulating explanation...
                          </p>
                        </motion.div>
                      )}

                      {voiceState === "speaking" && (
                        <motion.div
                          key="speaking-sub"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">STEMOS Speaking</div>
                          <p className="text-sm font-medium text-foreground max-w-md mx-auto line-clamp-3">
                            {currentSpokenSentence || "Reading response..."}
                          </p>
                        </motion.div>
                      )}

                      {voiceState === "idle" && (
                        <motion.div
                          key="idle-sub"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1"
                        >
                          <div className="text-[11px] uppercase tracking-wider text-amber-500 font-bold">Idle</div>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Click the center sphere or speak to begin.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Control Actions */}
                <div className="w-full flex items-center justify-center gap-4 border-t pt-6 border-border/40">
                  {/* Mute/Interrupt Button */}
                  {voiceState === "speaking" && (
                    <button
                      type="button"
                      onClick={interrupt}
                      className="flex items-center gap-2 bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/20 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Square className="h-4 w-4 fill-current" /> Stop Audio
                    </button>
                  )}

                  {voiceState === "listening" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (recognitionRef.current) {
                          recognitionRef.current.stop();
                        }
                        setVoiceState("idle");
                      }}
                      className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Volume2 className="h-4 w-4" /> Pause Mic
                    </button>
                  )}

                  {voiceState === "idle" && (
                    <button
                      type="button"
                      onClick={startAutoListening}
                      className="flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-2xl text-xs font-bold hover:opacity-90 transition shadow-sm cursor-pointer animate-pulse"
                    >
                      <Mic className="h-4 w-4" /> Start Speaking
                    </button>
                  )}

                  {/* Exit Voice Mode */}
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle(false)}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 border text-muted-foreground hover:text-foreground px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Exit Voice Mode
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </Layout>
  );
}

function Bubble({ msg, typing }: { msg: ChatMsg; typing?: boolean }) {
  const { tt } = useTutorLanguage();
  const { t } = useLanguage();
  const isUser = msg.role === "user";
  const showLoader = typing && !msg.content;
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0 shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[80%] group relative rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-foreground text-background" : "bg-card border shadow-soft"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : showLoader ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
              ))}
            </div>
            <span className="text-xs">{t("thinking")}</span>
          </div>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_h2]:font-display [&_h3]:font-display">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {typing && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
            </div>
            {!typing && (
              <button onClick={copyText}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition rounded-md p-1 hover:bg-secondary text-muted-foreground" title="Copy">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-xs font-medium">
          {tt("youL")}
        </div>
      )}
    </motion.div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Trophy, Gift, BookOpen, Shirt, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Reward Shop — STEMOS" },
      { name: "description", content: "Redeem your hard-earned XP for real rewards!" },
    ],
  }),
  component: ShopPage,
});

const SHOP_ITEMS = [
  { id: 1, name: "STEMOS Premium Course Unlock", description: "Unlock any advanced premium course on the platform.", cost: 1500, icon: BookOpen, color: "from-blue-500 to-indigo-500" },
  { id: 2, name: "10% Amazon Voucher", description: "Get a 10% discount voucher for books and electronics.", cost: 3000, icon: Gift, color: "from-yellow-500 to-amber-500" },
  { id: 3, name: "STEMOS Hoodie (Physical)", description: "Exclusive high-quality hoodie shipped to your door.", cost: 10000, icon: Shirt, color: "from-slate-700 to-slate-900" },
  { id: 4, name: "Profile 'Genius' Badge", description: "Show off a glowing animated badge next to your name.", cost: 500, icon: Zap, color: "from-emerald-400 to-teal-500" },
];

function ShopPage() {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemed, setRedeemed] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      // Calculate total XP from quiz attempts
      const { data } = await supabase.from("quiz_attempts").select("xp_earned").eq("user_id", session.user.id);
      if (data) {
        const total = data.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0);
        // Add some dummy XP for the hackathon demo so they can actually buy stuff
        setXp(total + 2000); 
      }
      setLoading(false);
    })();
  }, []);

  const handleRedeem = (item: typeof SHOP_ITEMS[0]) => {
    if (xp < item.cost) {
      toast.error("Not enough XP! Keep studying!");
      return;
    }
    setXp(prev => prev - item.cost);
    setRedeemed(prev => [...prev, item.id]);
    toast.success(`Successfully redeemed: ${item.name}! Check your email for details.`);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-medium text-primary uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <ShoppingCart className="h-3.5 w-3.5" /> Reward Shop
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Redeem your effort.</h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Turn your hard-earned study XP into real-world rewards, vouchers, and exclusive profile badges.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-card border shadow-soft rounded-2xl p-5">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Your Balance</div>
              <div className="font-display text-3xl font-bold text-amber-500 tabular-nums">
                {loading ? "..." : xp.toLocaleString()} <span className="text-lg">XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item, i) => {
            const isRedeemed = redeemed.includes(item.id);
            const canAfford = xp >= item.cost;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="relative bg-card border rounded-[2rem] p-6 shadow-soft hover:shadow-card transition flex flex-col overflow-hidden group"
              >
                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none`} />
                
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-glow mb-6`}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="font-display text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-bold text-lg flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    {item.cost.toLocaleString()} XP
                  </div>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={isRedeemed || !canAfford}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                      isRedeemed 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                        : canAfford 
                        ? "bg-primary text-primary-foreground shadow-glow hover:opacity-90" 
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {isRedeemed ? <><CheckCircle2 className="h-4 w-4" /> Redeemed</> : "Redeem"}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Layout>
  );
}

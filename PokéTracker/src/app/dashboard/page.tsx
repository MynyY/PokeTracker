import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: cards } = await supabase.from("cards").select("*").eq("user_id", user.id);

  const actualCards = cards?.filter((c) => c.status === "actual") ?? [];
  const historyCards = cards?.filter((c) => c.status === "history") ?? [];
  const totalInvested = actualCards.reduce((sum, c) => sum + (c.price_bought ?? 0), 0);
  const totalActualValue = actualCards.reduce((sum, c) => sum + (c.actual_price ?? 0), 0);
  const totalProfit = historyCards.reduce((sum, c) => sum + ((c.price_sold ?? 0) - (c.price_bought ?? 0)), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, <span style={{ color: "var(--neon)" }}>{profile?.username ?? "Trainer"}</span> 👋
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Here's your collection overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cards in Collection" value={actualCards.length.toString()} icon="🃏" />
        <StatCard label="Total Invested" value={`€${totalInvested.toFixed(2)}`} icon="💰" />
        <StatCard label="Current Value" value={`€${totalActualValue.toFixed(2)}`} icon="📈" />
        <StatCard label="Realised Profit" value={`€${totalProfit.toFixed(2)}`} icon="✅" highlight={totalProfit >= 0 ? "green" : "red"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/cards?tab=actual" className="flex items-center gap-4 p-5 rounded-xl transition-all group" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--neon)44")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--neon-dim)" }}>🃏</div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>My Collection</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{actualCards.length} cards currently owned</p>
          </div>
        </Link>

        <Link href="/dashboard/cards?tab=history" className="flex items-center gap-4 p-5 rounded-xl transition-all" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--neon)44")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--bg-elevated)" }}>📚</div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Sale History</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{historyCards.length} cards sold</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: "green" | "red" }) {
  const valueColor = highlight === "green" ? "#00FF88" : highlight === "red" ? "#FF6B6B" : "var(--text-primary)";
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-3" style={{ color: valueColor }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}

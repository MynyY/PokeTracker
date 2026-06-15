import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id);

  const actualCards = cards?.filter((c) => c.status === "actual") ?? [];
  const historyCards = cards?.filter((c) => c.status === "history") ?? [];

  const totalInvested = actualCards.reduce((sum, c) => sum + (c.price_bought ?? 0), 0);
  const totalActualValue = actualCards.reduce((sum, c) => sum + (c.actual_price ?? 0), 0);
  const totalProfit = historyCards.reduce(
    (sum, c) => sum + ((c.price_sold ?? 0) - (c.price_bought ?? 0)),
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.username ?? "Trainer"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your collection overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cards in Collection" value={actualCards.length.toString()} icon="🃏" />
        <StatCard label="Total Invested" value={`€${totalInvested.toFixed(2)}`} icon="💰" />
        <StatCard label="Current Value" value={`€${totalActualValue.toFixed(2)}`} icon="📈" />
        <StatCard
          label="Realised Profit"
          value={`€${totalProfit.toFixed(2)}`}
          icon="✅"
          highlight={totalProfit >= 0 ? "green" : "red"}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/cards?tab=actual"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-red-100 transition-colors">
            🃏
          </div>
          <div>
            <p className="font-semibold text-gray-900">My Collection</p>
            <p className="text-sm text-gray-500">{actualCards.length} cards currently owned</p>
          </div>
        </Link>

        <Link
          href="/dashboard/cards?tab=history"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-gray-100 transition-colors">
            📚
          </div>
          <div>
            <p className="font-semibold text-gray-900">Sale History</p>
            <p className="text-sm text-gray-500">{historyCards.length} cards sold</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: "green" | "red";
}) {
  const valueColor =
    highlight === "green"
      ? "text-green-600"
      : highlight === "red"
      ? "text-red-600"
      : "text-gray-900";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

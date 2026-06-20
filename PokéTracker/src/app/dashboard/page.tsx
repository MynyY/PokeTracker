import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/cards/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: cards } = await supabase.from("cards").select("*").eq("user_id", user.id);

  const actualCards = cards?.filter((c) => c.status === "actual" && !c.is_wishlist) ?? [];
  const historyCards = cards?.filter((c) => c.status === "history" && !c.is_wishlist) ?? [];
  const totalInvested = actualCards.reduce((sum, c) => sum + (c.price_bought ?? 0), 0);
  const totalActualValue = actualCards.reduce((sum, c) => sum + (c.actual_price ?? 0), 0);
  const totalProfit = historyCards.reduce((sum, c) => sum + ((c.price_sold ?? 0) - (c.price_bought ?? 0)), 0);

  return (
    <DashboardClient
      username={profile?.username ?? "Trainer"}
      actualCount={actualCards.length}
      historyCount={historyCards.length}
      totalInvested={totalInvested}
      totalActualValue={totalActualValue}
      totalProfit={totalProfit}
    />
  );
}

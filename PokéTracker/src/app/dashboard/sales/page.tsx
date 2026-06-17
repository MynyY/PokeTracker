import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SalesClientPage from "@/components/cards/SalesClientPage";

export default async function SalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch ALL sold cards (both collection and inventory, excluding wishlist)
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "history")
    .eq("is_wishlist", false);

  return <SalesClientPage cards={cards ?? []} />;
}

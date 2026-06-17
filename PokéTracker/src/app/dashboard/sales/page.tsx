import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SalesClientPage from "@/components/cards/SalesClientPage";

export default async function SalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "history")
    .not("date_sold", "is", null);

  return <SalesClientPage cards={cards ?? []} />;
}

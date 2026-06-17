import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WishlistClientPage from "@/components/cards/WishlistClientPage";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_wishlist", true)
    .order("created_at", { ascending: false });

  return <WishlistClientPage cards={cards ?? []} userId={user.id} />;
}

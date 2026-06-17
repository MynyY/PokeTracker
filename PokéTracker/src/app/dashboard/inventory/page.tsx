import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardsClientPage from "@/components/cards/CardsClientPage";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_wishlist", false)
    .eq("collection_type", "inventory")
    .order("created_at", { ascending: false });

  return (
    <CardsClientPage
      cards={cards ?? []}
      currentUserId={user.id}
      targetUserId={user.id}
      isOwn={true}
      currentUserProfile={profile}
      targetProfile={profile}
      initialTab="actual"
      collectionType="inventory"
      pageTitle="Inventory"
    />
  );
}

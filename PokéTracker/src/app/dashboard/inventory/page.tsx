import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardsClientPage from "@/components/cards/CardsClientPage";
import { CardLot } from "@/types";

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

  const cardIds = (cards ?? []).map((c) => c.id);
  const { data: lots } = cardIds.length > 0
    ? await supabase.from("card_lots").select("*").in("card_id", cardIds)
    : { data: [] };

  const lotsMap: Record<string, CardLot[]> = {};
  for (const lot of lots ?? []) {
    if (!lotsMap[lot.card_id]) lotsMap[lot.card_id] = [];
    lotsMap[lot.card_id].push(lot);
  }

  return (
    <CardsClientPage
      cards={cards ?? []}
      initialLotsMap={lotsMap}
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

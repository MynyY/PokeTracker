import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardsClientPage from "@/components/cards/CardsClientPage";
import { CardLot } from "@/types";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; userId?: string }>;
}) {
  const { tab, userId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Determine whose cards we're viewing
  const targetUserId = userId ?? user.id;
  const isOwn = targetUserId === user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", targetUserId)
    .eq("is_wishlist", false)
    .eq("collection_type", "collection")
    .order("created_at", { ascending: false });

  // Fetch lots for all cards
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
      targetUserId={targetUserId}
      isOwn={isOwn}
      currentUserProfile={profile}
      targetProfile={targetProfile}
      initialTab={(tab as "actual" | "history") ?? "actual"}
      collectionType="collection"
      pageTitle={isOwn ? "My Collection" : undefined}
    />
  );
}

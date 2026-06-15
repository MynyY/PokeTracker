import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardsClientPage from "@/components/cards/CardsClientPage";

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
    .order("created_at", { ascending: false });

  return (
    <CardsClientPage
      cards={cards ?? []}
      currentUserId={user.id}
      targetUserId={targetUserId}
      isOwn={isOwn}
      currentUserProfile={profile}
      targetProfile={targetProfile}
      initialTab={(tab as "actual" | "history") ?? "actual"}
    />
  );
}

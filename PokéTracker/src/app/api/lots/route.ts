import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST: add a lot to a card
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { card_id, price_bought, date_bought } = body;

  // Verify card belongs to user
  const { data: card } = await supabase.from("cards").select("id").eq("id", card_id).eq("user_id", user.id).single();
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("card_lots")
    .insert({ card_id, price_bought: price_bought || null, date_bought: date_bought || null, status: "actual" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lot: data });
}

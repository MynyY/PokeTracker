import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "master") {
    return NextResponse.json({ error: "Only masters can create users" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, username, full_name, role } = body;

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Email, password and username are required" }, { status: 400 });
  }

  // Use service role to create user (requires SUPABASE_SERVICE_ROLE_KEY)
  // For client-side creation we use the admin API via a workaround:
  // We sign up with Supabase Auth, then the trigger creates the profile
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, full_name: full_name ?? "", role: role ?? "user" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ user: newUser.user });
}

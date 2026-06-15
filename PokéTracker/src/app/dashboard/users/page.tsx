import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UsersClientPage from "@/components/cards/UsersClientPage";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("username");

  return (
    <UsersClientPage
      users={users ?? []}
      currentProfile={currentProfile}
    />
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

export default function NavBar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/cards", label: "My Cards" },
    { href: "/dashboard/users", label: "Users" },
  ];

  return (
    <nav style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }} className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold" style={{ color: "var(--text-primary)" }}>
            <img src="/pokeball.jpg" alt="" className="w-6 h-6 rounded-full" style={{ boxShadow: "0 0 8px #00D4FF66" }} />
            <span className="hidden sm:inline">PokéTracker</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--neon-dim)" : "transparent",
                    color: isActive ? "var(--neon)" : "var(--text-secondary)",
                    border: isActive ? "1px solid var(--neon)44" : "1px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{profile.username}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={
                  profile.role === "master"
                    ? { backgroundColor: "#00D4FF22", color: "var(--neon)", border: "1px solid #00D4FF44" }
                    : { backgroundColor: "#2A2A2A", color: "var(--text-secondary)" }
                }
              >
                {profile.role}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

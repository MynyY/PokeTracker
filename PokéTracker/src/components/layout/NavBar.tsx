"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { useTheme } from "./ThemeProvider";

export default function NavBar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/cards", label: "Personal Collection" },
    { href: "/dashboard/inventory", label: "Inventory" },
    { href: "/dashboard/wishlist", label: "Wishlist" },
    { href: "/dashboard/sales", label: "Sales History" },
    { href: "/dashboard/users", label: "Users" },
  ];

  return (
    <nav style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }} className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold" style={{ color: "var(--text-primary)" }}>
            <div className="flex-shrink-0" style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 0 10px #00E5CC55",
              background: "#111",
            }}>
              <img
                src="/logo.jpg"
                alt="PokéTracker logo"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
              />
            </div>
            <span className="hidden sm:inline">PokéTracker</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--neon-dim)" : "transparent",
                    color: isActive ? "var(--neon)" : "var(--text-secondary)",
                    border: isActive ? "1px solid var(--neon)44" : "1px solid transparent",
                  }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{profile.username}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={profile.role === "master"
                  ? { backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid var(--neon)44" }
                  : { backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                {profile.role}
              </span>
            </div>
            <button onClick={toggle} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-base"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={handleSignOut} className="text-sm px-3 py-1.5 rounded-lg"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

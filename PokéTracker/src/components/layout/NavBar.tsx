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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
            <img src="/pokeball.jpg" alt="" className="w-6 h-6 rounded-full" />
            <span className="hidden sm:inline">PokéTracker</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600">{profile.username}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile.role === "master"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.role}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

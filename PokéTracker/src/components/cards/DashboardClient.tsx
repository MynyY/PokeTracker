"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  username: string;
  actualCount: number;
  historyCount: number;
  totalInvested: number;
  totalActualValue: number;
  totalProfit: number;
}

export default function DashboardClient({ username, actualCount, historyCount, totalInvested, totalActualValue, totalProfit }: Props) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, <span style={{ color: "var(--neon)" }}>{username}</span> 👋
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Here's your collection overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cards in Collection" value={actualCount.toString()} icon="🃏" />
        <StatCard label="Total Invested" value={`€${totalInvested.toFixed(2)}`} icon="💰" />
        <StatCard label="Current Value" value={`€${totalActualValue.toFixed(2)}`} icon="📈" />
        <StatCard label="Realised Profit" value={`€${totalProfit.toFixed(2)}`} icon="✅" highlight={totalProfit >= 0 ? "green" : "red"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink href="/dashboard/cards?tab=actual" icon="🃏" label="My Collection" sub={`${actualCount} cards currently owned`} neon />
        <QuickLink href="/dashboard/cards?tab=history" icon="📚" label="Sale History" sub={`${historyCount} cards sold`} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: "green" | "red" }) {
  const valueColor = highlight === "green" ? "#00FF88" : highlight === "red" ? "#FF6B6B" : "var(--text-primary)";
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-3" style={{ color: valueColor }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, sub, neon }: { href: string; icon: string; label: string; sub: string; neon?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-5 rounded-xl transition-all"
      style={{
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--neon)44" : "var(--border)"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: neon ? "var(--neon-dim)" : "var(--bg-elevated)" }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{sub}</p>
      </div>
    </Link>
  );
}

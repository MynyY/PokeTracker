"use client";

import { useState, useMemo } from "react";
import { Card } from "@/types";
import { format, parse } from "date-fns";

interface Props {
  cards: Card[];
}

interface DaySummary {
  date: string;           // ISO date string e.g. "2024-06-16"
  cards: Card[];
  totalBought: number;
  totalSold: number;
  profit: number;
}

type SortKey = "date" | "totalBought" | "totalSold" | "profit" | "count";
type SortDir = "asc" | "desc";

export default function SalesClientPage({ cards }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Group cards by date_sold
  const grouped = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const card of cards) {
      // Normalize date to YYYY-MM-DD, fallback to "unknown"
      const dateKey = card.date_sold ? card.date_sold.split("T")[0] : "unknown";
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(card);
    }
    return Object.entries(map).map(([date, dayCards]): DaySummary => ({
      date,
      cards: dayCards,
      totalBought: dayCards.reduce((s, c) => s + (c.price_bought ?? 0), 0),
      totalSold:   dayCards.reduce((s, c) => s + (c.price_sold   ?? 0), 0),
      profit:      dayCards.reduce((s, c) => s + ((c.price_sold ?? 0) - (c.price_bought ?? 0)), 0),
    }));
  }, [cards]);

  // Filter by search (matches formatted date)
  const filtered = grouped.filter((d) => {
    if (!search.trim()) return true;
    const formatted = format(new Date(d.date), "dd/MM/yyyy");
    return formatted.includes(search.trim()) || d.date.includes(search.trim());
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av: number | string;
    let bv: number | string;
    switch (sortKey) {
      case "date":        av = a.date;        bv = b.date;        break;
      case "totalBought": av = a.totalBought; bv = b.totalBought; break;
      case "totalSold":   av = a.totalSold;   bv = b.totalSold;   break;
      case "profit":      av = a.profit;      bv = b.profit;      break;
      case "count":       av = a.cards.length; bv = b.cards.length; break;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "date" ? "desc" : "desc"); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "var(--neon)", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className={`px-4 py-3 font-semibold cursor-pointer select-none ${right ? "text-right" : "text-left"}`}
        style={{ color: sortKey === k ? "var(--neon)" : "var(--text-secondary)" }}
        onClick={() => handleSort(k)}
      >
        {label}<SortIcon k={k} />
      </th>
    );
  }

  // Totals
  const totalBought = sorted.reduce((s, d) => s + d.totalBought, 0);
  const totalSold   = sorted.reduce((s, d) => s + d.totalSold,   0);
  const totalProfit = sorted.reduce((s, d) => s + d.profit,      0);
  const totalCards  = sorted.reduce((s, d) => s + d.cards.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Sales History</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {grouped.length} sale days · {cards.length} cards sold
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Sale Days",     value: grouped.length.toString(),    icon: "📅" },
          { label: "Total Bought",  value: `€${totalBought.toFixed(2)}`, icon: "💸" },
          { label: "Total Sold",    value: `€${totalSold.toFixed(2)}`,   icon: "🏷️" },
          { label: "Total Profit",  value: `€${totalProfit.toFixed(2)}`, icon: "✅", highlight: totalProfit >= 0 ? "green" : "red" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xl font-bold mt-2" style={{ color: s.highlight === "green" ? "#00FF88" : s.highlight === "red" ? "#FF6B6B" : "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by date (e.g. 16/06/2024)"
          autoComplete="off"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", minWidth: 280 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>×</button>}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            {cards.length === 0 ? "No sales recorded yet" : "No results for this date"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <th className="px-4 py-3 w-8" style={{ color: "var(--text-muted)" }}></th>
                  <Th k="date"        label="Date" />
                  <Th k="count"       label="Cards" right />
                  <Th k="totalBought" label="Total Bought" right />
                  <Th k="totalSold"   label="Total Sold" right />
                  <Th k="profit"      label="Profit / Loss" right />
                </tr>
              </thead>
              <tbody>
                {sorted.map((day, i) => (
                  <>
                    {/* Summary row */}
                    <tr
                      key={day.date}
                      className="cursor-pointer"
                      style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                      onClick={() => setExpanded(expanded === day.date ? null : day.date)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {expanded === day.date ? "▾" : "▸"}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {day.date === "unknown" ? "No date" : format(new Date(day.date), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                        {day.cards.length}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>
                        €{day.totalBought.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>
                        €{day.totalSold.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: day.profit >= 0 ? "#00FF88" : "#FF6B6B" }}>
                        {day.profit >= 0 ? "+" : ""}€{day.profit.toFixed(2)}
                      </td>
                    </tr>

                    {/* Expanded detail rows */}
                    {expanded === day.date && day.cards.map((card) => {
                      const p = (card.price_sold ?? 0) - (card.price_bought ?? 0);
                      return (
                        <tr key={card.id} style={{ backgroundColor: "var(--bg-elevated)", borderTop: "1px solid var(--border)" }}>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                            <span className="text-xs">↳</span> {card.card_name}
                            {card.set_name && <span className="text-xs ml-1 font-mono" style={{ color: "var(--text-muted)" }}>({card.set_name})</span>}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid var(--neon)44" }}>
                              {card.quality}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right text-xs" style={{ color: "var(--text-secondary)" }}>
                            {card.price_bought != null ? `€${card.price_bought.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-4 py-2 text-right text-xs" style={{ color: "var(--text-secondary)" }}>
                            {card.price_sold != null ? `€${card.price_sold.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-4 py-2 text-right text-xs font-semibold" style={{ color: p >= 0 ? "#00FF88" : "#FF6B6B" }}>
                            {p >= 0 ? "+" : ""}€{p.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}

                {/* Totals footer */}
                <tr style={{ borderTop: "2px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>TOTAL ({sorted.length} days)</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>{totalCards}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>€{totalBought.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>€{totalSold.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: totalProfit >= 0 ? "#00FF88" : "#FF6B6B" }}>
                    {totalProfit >= 0 ? "+" : ""}€{totalProfit.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Profile } from "@/types";
import { POKEMON_SETS } from "@/lib/sets";
import CardModal from "./CardModal";
import SoldModal from "./SoldModal";
import { format } from "date-fns";

interface Props {
  cards: Card[];
  currentUserId: string;
  targetUserId: string;
  isOwn: boolean;
  currentUserProfile: Profile | null;
  targetProfile: Profile | null;
  initialTab: "actual" | "history";
}

type SortKey = "card_name" | "card_id" | "card_number" | "set_name" | "quality" | "extra_info" | "price_bought" | "actual_price" | "price_sold" | "pl";
type SortDir = "asc" | "desc";
type ColKey = "card_id" | "card_number" | "set" | "quality" | "bought" | "current_value" | "pl" | "extra_info";

const ALL_COLUMNS: { key: ColKey; label: string }[] = [
  { key: "card_id",       label: "Card ID" },
  { key: "card_number",   label: "Card Number" },
  { key: "set",           label: "Set" },
  { key: "quality",       label: "Quality" },
  { key: "bought",        label: "Bought" },
  { key: "current_value", label: "Current Value / Sold" },
  { key: "pl",            label: "P&L" },
  { key: "extra_info",    label: "Extra Info" },
];

const DEFAULT_VISIBLE: ColKey[] = ["set", "quality", "bought", "current_value", "pl"];
const STORAGE_KEY = "poketracker_columns";

export default function CardsClientPage({ cards: initialCards, currentUserId, targetUserId, isOwn, currentUserProfile, targetProfile, initialTab }: Props) {
  const [cards, setCards]               = useState<Card[]>(initialCards);
  const [tab, setTab]                   = useState<"actual" | "history">(initialTab);
  const [editCard, setEditCard]         = useState<Card | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [soldCard, setSoldCard]         = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Card | null>(null);
  const [search, setSearch]             = useState("");
  const [sortKey, setSortKey]           = useState<SortKey>("card_name");
  const [sortDir, setSortDir]           = useState<SortDir>("asc");
  const [visibleCols, setVisibleCols]   = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colMenuOpen, setColMenuOpen]   = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + "_" + currentUserId);
      if (saved) setVisibleCols(JSON.parse(saved));
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setColMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleCol(key: ColKey) {
    setVisibleCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try { localStorage.setItem(STORAGE_KEY + "_" + currentUserId, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const show = (key: ColKey) => visibleCols.includes(key);

  const actualCards  = cards.filter((c) => c.status === "actual");
  const historyCards = cards.filter((c) => c.status === "history");

  const realisedProfit  = (c: Card) => c.price_sold  != null && c.price_bought != null ? c.price_sold  - c.price_bought : null;
  const unrealisedProfit = (c: Card) => c.actual_price != null && c.price_bought != null ? c.actual_price - c.price_bought : null;

  function getSortValue(card: Card, key: SortKey): number | string {
    switch (key) {
      case "card_name":    return card.card_name?.toLowerCase()  ?? "";
      case "card_id":      return card.card_id?.toLowerCase()    ?? "";
      case "card_number": { const n = card.card_number ?? ""; const num = parseFloat(n.replace(/[^0-9.]/g, "")); return isNaN(num) ? n.toLowerCase() : num; }
      case "set_name":     return card.set_name?.toLowerCase()   ?? "";
      case "quality":      return card.quality ?? "";
      case "extra_info":   return card.extra_info?.toLowerCase() ?? "";
      case "price_bought": return card.price_bought  ?? -Infinity;
      case "actual_price": return card.actual_price  ?? -Infinity;
      case "price_sold":   return card.price_sold    ?? -Infinity;
      case "pl": return (tab === "actual" ? unrealisedProfit(card) : realisedProfit(card)) ?? -Infinity;
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const allDisplayed = tab === "actual" ? actualCards : historyCards;
  const filtered = search.trim()
    ? allDisplayed.filter((c) =>
        [c.card_name, c.set_name, c.card_id, c.card_number, c.quality]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
      )
    : allDisplayed;

  const displayed = [...filtered].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  async function handleDelete(card: Card) {
    const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    if (res.ok) { setCards((prev) => prev.filter((c) => c.id !== card.id)); setDeleteConfirm(null); }
  }

  async function handleSold(card: Card, priceSold: number, dateSold: string) {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "history", price_sold: priceSold, date_sold: dateSold }),
    });
    if (res.ok) {
      const { card: updated } = await res.json();
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSoldCard(null);
    }
  }

  function handleCardSaved(card: Card) {
    setCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      return exists ? prev.map((c) => (c.id === card.id ? card : c)) : [card, ...prev];
    });
    setEditCard(null); setShowAdd(false);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "var(--neon)", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function ThHeader({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th className={`px-4 py-3 font-semibold cursor-pointer select-none ${right ? "text-right" : "text-left"}`}
        style={{ color: sortKey === k ? "var(--neon)" : "var(--text-secondary)" }}
        onClick={() => handleSort(k)}>
        {label}<SortIcon k={k} />
      </th>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isOwn ? "My Collection" : `${targetProfile?.username}'s Cards`}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{actualCards.length} owned · {historyCards.length} sold</p>
        </div>
        {isOwn && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg" style={{ backgroundColor: "var(--neon)", color: "#000" }}>
            <span>+</span> Add To Collection
          </button>
        )}
      </div>

      {/* Tabs + Search + Columns */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-card)" }}>
          {(["actual", "history"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: tab === t ? "var(--bg-elevated)" : "transparent", color: tab === t ? "var(--neon)" : "var(--text-secondary)", border: tab === t ? "1px solid var(--neon)33" : "1px solid transparent" }}>
              {t === "actual" ? `Actual (${actualCards.length})` : `History (${historyCards.length})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..." autoComplete="off"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>×</button>}
        </div>

        {/* Columns dropdown */}
        <div className="relative" ref={colMenuRef}>
          <button onClick={() => setColMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: colMenuOpen ? "var(--neon-dim)" : "var(--bg-card)", border: `1px solid ${colMenuOpen ? "var(--neon)44" : "var(--border)"}`, color: colMenuOpen ? "var(--neon)" : "var(--text-secondary)" }}>
            ⚙ Columns {visibleCols.length !== DEFAULT_VISIBLE.length && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--neon)", color: "#000" }}>{visibleCols.length}</span>}
          </button>

          {colMenuOpen && (
            <div className="absolute right-0 top-10 z-50 rounded-xl shadow-xl w-52 overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>TOGGLE COLUMNS</p>
              </div>
              <div className="py-1">
                {ALL_COLUMNS.map((col) => (
                  <button key={col.key} onClick={() => toggleCol(col.key)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <span className="w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0"
                      style={{ backgroundColor: show(col.key) ? "var(--neon)" : "var(--bg-elevated)", border: `1px solid ${show(col.key) ? "var(--neon)" : "var(--border)"}`, color: "#000" }}>
                      {show(col.key) ? "✓" : ""}
                    </span>
                    {col.label}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2" style={{ borderTop: "1px solid var(--border)" }}>
                <button onClick={() => { setVisibleCols(DEFAULT_VISIBLE); try { localStorage.removeItem(STORAGE_KEY + "_" + currentUserId); } catch {} }}
                  className="text-xs w-full text-center" style={{ color: "var(--text-muted)" }}>
                  Reset to default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🃏</div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No cards here yet</p>
          {isOwn && tab === "actual" && !search && (
            <button onClick={() => setShowAdd(true)} className="mt-4 text-sm font-medium" style={{ color: "var(--neon)" }}>Add your first card →</button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {/* Card name always visible */}
                  <ThHeader k="card_name" label="Card" />
                  {/* Optional columns */}
                  {show("card_id")       && <ThHeader k="card_id" label="Card ID" />}
                  {show("card_number")   && <ThHeader k="card_number" label="Number" />}
                  {show("set")           && <ThHeader k="set_name" label="Set" />}
                  {show("quality")       && <ThHeader k="quality" label="Quality" />}
                  {show("extra_info")    && <ThHeader k="extra_info" label="Extra Info" />}
                  {show("bought")        && <ThHeader k="price_bought" label="Bought" right />}
                  {show("current_value") && <ThHeader k={tab === "actual" ? "actual_price" : "price_sold"} label={tab === "actual" ? "Current Value" : "Sold"} right />}
                  {show("pl")            && <ThHeader k="pl" label="P&L" right />}
                  {isOwn && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map((card, i) => {
                  const u = unrealisedProfit(card);
                  const r = realisedProfit(card);
                  return (
                    <tr key={card.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>

                      {/* Card name — always visible */}
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: "var(--text-primary)" }}>{card.card_name}</div>
                      </td>

                      {/* Card ID column */}
                      {show("card_id") && (
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          {card.card_id || "—"}
                        </td>
                      )}

                      {/* Card Number column */}
                      {show("card_number") && (
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {card.card_number ? `#${card.card_number}` : "—"}
                        </td>
                      )}

                      {/* Set column */}
                      {show("set") && (
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {card.set_name ? (() => {
                            const s = POKEMON_SETS.find((x) => x.code === card.set_name);
                            return s
                              ? <span title={s.series}>{s.name} <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>({s.code})</span></span>
                              : card.set_name;
                          })() : "—"}
                        </td>
                      )}

                      {/* Quality column */}
                      {show("quality") && (
                        <td className="px-4 py-3">
                          {card.quality
                            ? <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid var(--neon)44" }}>{card.quality}</span>
                            : <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                      )}

                      {/* Extra Info column */}
                      {show("extra_info") && (
                        <td className="px-4 py-3 text-xs italic" style={{ color: "var(--text-secondary)" }}>
                          {card.extra_info || "—"}
                        </td>
                      )}

                      {/* Bought column */}
                      {show("bought") && (
                        <td className="px-4 py-3 text-right">
                          <div style={{ color: "var(--text-primary)" }}>{card.price_bought != null ? `€${card.price_bought.toFixed(2)}` : "—"}</div>
                          {card.date_bought && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{format(new Date(card.date_bought), "dd/MM/yy")}</div>}
                        </td>
                      )}

                      {/* Current Value / Sold column */}
                      {show("current_value") && (
                        <td className="px-4 py-3 text-right">
                          {tab === "actual" ? (
                            <div style={{ color: "var(--text-primary)" }}>{card.actual_price != null ? `€${card.actual_price.toFixed(2)}` : "—"}</div>
                          ) : (
                            <div>
                              <div style={{ color: "var(--text-primary)" }}>{card.price_sold != null ? `€${card.price_sold.toFixed(2)}` : "—"}</div>
                              {card.date_sold && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{format(new Date(card.date_sold), "dd/MM/yy")}</div>}
                            </div>
                          )}
                        </td>
                      )}

                      {/* P&L column */}
                      {show("pl") && (
                        <td className="px-4 py-3 text-right">
                          {tab === "actual"
                            ? u != null ? <span className="font-semibold" style={{ color: u >= 0 ? "#00FF88" : "#FF6B6B" }}>{u >= 0 ? "+" : ""}€{u.toFixed(2)}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>
                            : r != null ? <span className="font-semibold" style={{ color: r >= 0 ? "#00FF88" : "#FF6B6B" }}>{r >= 0 ? "+" : ""}€{r.toFixed(2)}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>
                          }
                        </td>
                      )}

                      {/* Actions */}
                      {isOwn && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {tab === "actual" && (
                              <button onClick={() => setSoldCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>Sold</button>
                            )}
                            <button onClick={() => setEditCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid var(--neon)44" }}>Edit</button>
                            <button onClick={() => setDeleteConfirm(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: "#FF003322", color: "#FF6B6B", border: "1px solid #FF003344" }}>Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showAdd || editCard) && <CardModal card={editCard ?? undefined} userId={targetUserId} onSave={handleCardSaved} onClose={() => { setShowAdd(false); setEditCard(null); }} />}
      {soldCard && <SoldModal card={soldCard} onConfirm={handleSold} onClose={() => setSoldCard(null)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Delete Card</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.card_name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#FF003344", border: "1px solid #FF003366", color: "#FF6B6B" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

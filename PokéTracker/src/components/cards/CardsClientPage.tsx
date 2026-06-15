"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, Profile, QUALITY_COLORS } from "@/types";
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

export default function CardsClientPage({ cards: initialCards, currentUserId, targetUserId, isOwn, currentUserProfile, targetProfile, initialTab }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [tab, setTab] = useState<"actual" | "history">(initialTab);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [soldCard, setSoldCard] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Card | null>(null);
  const [search, setSearch] = useState("");

  const actualCards = cards.filter((c) => c.status === "actual");
  const historyCards = cards.filter((c) => c.status === "history");
  const allDisplayed = tab === "actual" ? actualCards : historyCards;
  const displayed = search.trim()
    ? allDisplayed.filter((c) =>
        [c.card_name, c.set_name, c.card_id, c.card_number, c.quality]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
      )
    : allDisplayed;

  async function handleDelete(card: Card) {
    const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    if (res.ok) { setCards((prev) => prev.filter((c) => c.id !== card.id)); setDeleteConfirm(null); }
  }

  async function handleSold(card: Card, priceSold: number, dateSold: string) {
    const res = await fetch(`/api/cards/${card.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "history", price_sold: priceSold, date_sold: dateSold }) });
    if (res.ok) { const { card: updated } = await res.json(); setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c))); setSoldCard(null); }
  }

  function handleCardSaved(card: Card) {
    setCards((prev) => { const exists = prev.find((c) => c.id === card.id); return exists ? prev.map((c) => (c.id === card.id ? card : c)) : [card, ...prev]; });
    setEditCard(null); setShowAdd(false);
  }

  const realisedProfit = (card: Card) => card.price_sold != null && card.price_bought != null ? card.price_sold - card.price_bought : null;
  const unrealisedProfit = (card: Card) => card.actual_price != null && card.price_bought != null ? card.actual_price - card.price_bought : null;
  const profit = realisedProfit;

  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isOwn ? "My Cards" : `${targetProfile?.username}'s Cards`}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{actualCards.length} owned · {historyCards.length} sold</p>
        </div>
        {isOwn && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all" style={{ backgroundColor: "var(--neon)", color: "#000" }}>
            <span>+</span> Add Card
          </button>
        )}
      </div>

      {/* Tabs + Search */}
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>×</button>
          )}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="text-5xl mb-3">🃏</div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No cards here yet</p>
          {isOwn && tab === "actual" && (
            <button onClick={() => setShowAdd(true)} className="mt-4 text-sm font-medium" style={{ color: "var(--neon)" }}>Add your first card →</button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Card</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Set</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Quality</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Bought</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>{tab === "actual" ? "Actual" : "Sold"}</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>P&amp;L</th>
                  {isOwn && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map((card, i) => {
                  const p = profit(card);
                  return (
                    <tr key={card.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: "var(--text-primary)" }}>{card.card_name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{[card.card_id, card.card_number].filter(Boolean).join(" · ")}</div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{card.set_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: "#00D4FF22", color: "var(--neon)", border: "1px solid #00D4FF44" }}>{card.quality}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div style={{ color: "var(--text-primary)" }}>{card.price_bought != null ? `€${card.price_bought.toFixed(2)}` : "—"}</div>
                        {card.date_bought && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{format(new Date(card.date_bought), "dd/MM/yy")}</div>}
                      </td>
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
                      <td className="px-4 py-3 text-right">
                        {tab === "actual" ? (() => {
                          const u = unrealisedProfit(card);
                          return u != null ? (
                            <span className="font-semibold" style={{ color: u >= 0 ? "#00FF88" : "#FF6B6B" }}>{u >= 0 ? "+" : ""}€{u.toFixed(2)}</span>
                          ) : <span style={{ color: "var(--text-muted)" }}>—</span>;
                        })() : (() => {
                          const r = realisedProfit(card);
                          return r != null ? (
                            <span className="font-semibold" style={{ color: r >= 0 ? "#00FF88" : "#FF6B6B" }}>{r >= 0 ? "+" : ""}€{r.toFixed(2)}</span>
                          ) : <span style={{ color: "var(--text-muted)" }}>—</span>;
                        })()}
                      </td>
                      {isOwn && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {tab === "actual" && (
                              <button onClick={() => setSoldCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>Sold</button>
                            )}
                            <button onClick={() => setEditCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors" style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid #00D4FF44" }}>Edit</button>
                            <button onClick={() => setDeleteConfirm(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#FF003322", color: "#FF6B6B", border: "1px solid #FF003344" }}>Delete</button>
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

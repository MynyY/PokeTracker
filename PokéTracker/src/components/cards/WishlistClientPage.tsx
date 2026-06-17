"use client";

import { useState } from "react";
import { Card, CardQuality } from "@/types";
import { POKEMON_SETS } from "@/lib/sets";
import WishlistModal from "./WishlistModal";
import BoughtModal from "./BoughtModal";

interface Props {
  cards: Card[];
  userId: string;
}

type SortKey = "card_name" | "card_number" | "set_name" | "actual_price";
type SortDir = "asc" | "desc";

export default function WishlistClientPage({ cards: initialCards, userId }: Props) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [showAdd, setShowAdd] = useState(false);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [boughtCard, setBoughtCard] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Card | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("card_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function getSortValue(card: Card, key: SortKey): number | string {
    switch (key) {
      case "card_name":   return card.card_name?.toLowerCase() ?? "";
      case "card_number": { const n = card.card_number ?? ""; const num = parseFloat(n.replace(/[^0-9.]/g, "")); return isNaN(num) ? n.toLowerCase() : num; }
      case "set_name":    return card.set_name?.toLowerCase() ?? "";
      case "actual_price": return card.actual_price ?? -Infinity;
    }
  }

  const filtered = search.trim()
    ? cards.filter((c) =>
        [c.card_name, c.set_name, c.card_number]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
      )
    : cards;

  const displayed = [...filtered].sort((a, b) => {
    const av = getSortValue(a, sortKey);
    const bv = getSortValue(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSaved(card: Card) {
    setCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      return exists ? prev.map((c) => (c.id === card.id ? card : c)) : [card, ...prev];
    });
    setShowAdd(false);
    setEditCard(null);
  }

  async function handleBought(card: Card, quality: CardQuality, priceBought: number, dateBought: string) {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_wishlist: false,
        quality,
        price_bought: priceBought,
        date_bought: dateBought,
      }),
    });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      setBoughtCard(null);
    }
  }

  async function handleDelete(card: Card) {
    const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    if (res.ok) { setCards((prev) => prev.filter((c) => c.id !== card.id)); setDeleteConfirm(null); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "var(--neon)", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Wishlist</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{cards.length} cards on wishlist</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg"
          style={{ backgroundColor: "var(--neon)", color: "#000" }}>
          <span>+</span> Add to Wishlist
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wishlist..." autoComplete="off"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>×</button>}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">⭐</div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            {cards.length === 0 ? "Your wishlist is empty" : "No results found"}
          </p>
          {cards.length === 0 && (
            <button onClick={() => setShowAdd(true)} className="mt-4 text-sm font-medium" style={{ color: "var(--neon)" }}>
              Add your first wishlist item →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <Th k="card_name"   label="Card" />
                  <Th k="card_number" label="Number" />
                  <Th k="set_name"    label="Set" />
                  <Th k="actual_price" label="Current Value" right />
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Extra Info</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((card, i) => (
                  <tr key={card.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{card.card_name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {card.card_number ? `#${card.card_number}` : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {card.set_name ? (() => {
                        const s = POKEMON_SETS.find((x) => x.code === card.set_name);
                        return s
                          ? <span>{s.name} <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>({s.code})</span></span>
                          : card.set_name;
                      })() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>
                      {card.actual_price != null ? `€${card.actual_price.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs italic" style={{ color: "var(--text-secondary)" }}>
                      {card.extra_info || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setBoughtCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid var(--neon)44" }}>
                          Bought
                        </button>
                        <button onClick={() => setEditCard(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(card)} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ backgroundColor: "#FF003322", color: "#FF6B6B", border: "1px solid #FF003344" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showAdd || editCard) && (
        <WishlistModal
          card={editCard ?? undefined}
          userId={userId}
          onSave={handleSaved}
          onClose={() => { setShowAdd(false); setEditCard(null); }}
        />
      )}

      {boughtCard && (
        <BoughtModal
          card={boughtCard}
          onConfirm={handleBought}
          onClose={() => setBoughtCard(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Remove from Wishlist</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to remove <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.card_name}</strong> from your wishlist?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#FF003344", border: "1px solid #FF003366", color: "#FF6B6B" }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

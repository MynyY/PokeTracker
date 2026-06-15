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

export default function CardsClientPage({
  cards: initialCards,
  currentUserId,
  targetUserId,
  isOwn,
  currentUserProfile,
  targetProfile,
  initialTab,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [tab, setTab] = useState<"actual" | "history">(initialTab);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [soldCard, setSoldCard] = useState<Card | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Card | null>(null);

  const actualCards = cards.filter((c) => c.status === "actual");
  const historyCards = cards.filter((c) => c.status === "history");
  const displayed = tab === "actual" ? actualCards : historyCards;

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleDelete(card: Card) {
    const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      setDeleteConfirm(null);
    }
  }

  async function handleSold(card: Card, priceSold: number, dateSold: string) {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    setEditCard(null);
    setShowAdd(false);
  }

  const profit = (card: Card) =>
    card.price_sold != null && card.price_bought != null
      ? card.price_sold - card.price_bought
      : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOwn ? "My Cards" : `${targetProfile?.username}'s Cards`}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {actualCards.length} owned · {historyCards.length} sold
          </p>
        </div>
        {isOwn && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <span>+</span> Add Card
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        {(["actual", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "actual" ? `Actual (${actualCards.length})` : `History (${historyCards.length})`}
          </button>
        ))}
      </div>

      {/* Cards table */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🃏</div>
          <p className="font-medium text-gray-500">No cards here yet</p>
          {isOwn && tab === "actual" && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Add your first card →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Card</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Set</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Quality</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Bought</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    {tab === "actual" ? "Actual" : "Sold"}
                  </th>
                  {tab === "history" && (
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Profit</th>
                  )}
                  {isOwn && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((card) => {
                  const p = profit(card);
                  return (
                    <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{card.card_name}</div>
                        <div className="text-xs text-gray-400">
                          {[card.card_id, card.card_number].filter(Boolean).join(" · ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{card.set_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            QUALITY_COLORS[card.quality]
                          }`}
                        >
                          {card.quality}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-gray-900">
                          {card.price_bought != null ? `€${card.price_bought.toFixed(2)}` : "—"}
                        </div>
                        {card.date_bought && (
                          <div className="text-xs text-gray-400">{format(new Date(card.date_bought), "dd/MM/yy")}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {tab === "actual" ? (
                          <div className="text-gray-900">
                            {card.actual_price != null ? `€${card.actual_price.toFixed(2)}` : "—"}
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-900">
                              {card.price_sold != null ? `€${card.price_sold.toFixed(2)}` : "—"}
                            </div>
                            {card.date_sold && (
                              <div className="text-xs text-gray-400">{format(new Date(card.date_sold), "dd/MM/yy")}</div>
                            )}
                          </div>
                        )}
                      </td>
                      {tab === "history" && (
                        <td className="px-4 py-3 text-right">
                          {p != null ? (
                            <span
                              className={`font-semibold ${
                                p >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {p >= 0 ? "+" : ""}€{p.toFixed(2)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {isOwn && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {tab === "actual" && (
                              <button
                                onClick={() => setSoldCard(card)}
                                className="text-xs px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                              >
                                Sold
                              </button>
                            )}
                            <button
                              onClick={() => setEditCard(card)}
                              className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(card)}
                              className="text-xs px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors"
                            >
                              Delete
                            </button>
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

      {/* Modals */}
      {(showAdd || editCard) && (
        <CardModal
          card={editCard ?? undefined}
          userId={targetUserId}
          onSave={handleCardSaved}
          onClose={() => {
            setShowAdd(false);
            setEditCard(null);
          }}
        />
      )}

      {soldCard && (
        <SoldModal
          card={soldCard}
          onConfirm={handleSold}
          onClose={() => setSoldCard(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Card</h3>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.card_name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

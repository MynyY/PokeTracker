"use client";

import { useState } from "react";
import { Card, CardQuality, QUALITY_OPTIONS } from "@/types";

interface Props {
  card: Card;
  onConfirm: (card: Card, quality: CardQuality, priceBought: number, dateBought: string) => Promise<void>;
  onClose: () => void;
}

export default function BoughtModal({ card, onConfirm, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [quality, setQuality] = useState<CardQuality>("NM");
  const [priceBought, setPriceBought] = useState("");
  const [dateBought, setDateBought] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceBought) { setError("Please enter a price."); return; }
    setLoading(true);
    setError(null);
    await onConfirm(card, quality, parseFloat(priceBought), dateBought);
    setLoading(false);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="rounded-2xl w-full max-w-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Mark as Bought</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{card.card_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quality *</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value as CardQuality)}
              className={inputCls} style={inputStyle}>
              {QUALITY_OPTIONS.map((q) => (
                <option key={q.value} value={q.value}>{q.value} — {q.description}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Price Bought (€) *</label>
            <input type="number" step="0.01" min="0" value={priceBought}
              onChange={(e) => setPriceBought(e.target.value)}
              required autoFocus className={inputCls} style={inputStyle} placeholder="0.00"
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date Bought</label>
            <input type="date" value={dateBought} onChange={(e) => setDateBought(e.target.value)}
              className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--neon)", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : "Move to Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

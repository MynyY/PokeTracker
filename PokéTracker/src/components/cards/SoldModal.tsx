"use client";

import { useState } from "react";
import { Card } from "@/types";

interface Props { card: Card; onConfirm: (card: Card, priceSold: number, dateSold: string) => Promise<void>; onClose: () => void; }

export default function SoldModal({ card, onConfirm, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [priceSold, setPriceSold] = useState("");
  const [dateSold, setDateSold] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceSold) { setError("Please enter a sale price."); return; }
    setLoading(true); setError(null);
    await onConfirm(card, parseFloat(priceSold), dateSold);
    setLoading(false);
  }

  const profit = priceSold && card.price_bought != null ? parseFloat(priceSold) - card.price_bought : null;
  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="rounded-2xl w-full max-w-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Mark as Sold</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{card.card_name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Sale Price (€) *</label>
            <input type="number" step="0.01" min="0" value={priceSold} onChange={(e) => setPriceSold(e.target.value)} required autoFocus className={inputCls} style={inputStyle} placeholder="0.00"
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date Sold</label>
            <input type="date" value={dateSold} onChange={(e) => setDateSold(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          {profit != null && (
            <div className="p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: profit >= 0 ? "#00FF8822" : "#FF003322", color: profit >= 0 ? "#00FF88" : "#FF6B6B", border: `1px solid ${profit >= 0 ? "#00FF8844" : "#FF003344"}` }}>
              Profit: {profit >= 0 ? "+" : ""}€{profit.toFixed(2)}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#00FF88", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : "Confirm Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card } from "@/types";
import SetSelector from "./SetSelector";

interface Props {
  card?: Card;
  userId: string;
  onSave: (card: Card) => void;
  onClose: () => void;
}

export default function WishlistModal({ card, userId, onSave, onClose }: Props) {
  const isEdit = !!card;
  const [form, setForm] = useState({
    card_name: card?.card_name ?? "",
    card_number: card?.card_number ?? "",
    set_name: card?.set_name ?? "",
    actual_price: card?.actual_price?.toString() ?? "",
    extra_info: card?.extra_info ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      card_name: form.card_name,
      card_number: form.card_number || null,
      set_name: form.set_name || null,
      actual_price: form.actual_price ? parseFloat(form.actual_price) : null,
      extra_info: form.extra_info || null,
      is_wishlist: true,
      status: "actual",
      quality: "NM",
    };

    const url = isEdit ? `/api/cards/${card!.id}` : "/api/cards";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? payload : { ...payload, user_id: userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    onSave(data.card);
    setLoading(false);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="rounded-2xl w-full max-w-md" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Edit Wishlist Item" : "Add to Wishlist"}
          </h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Card Name *</label>
            <input required value={form.card_name} onChange={(e) => set("card_name", e.target.value)}
              className={inputCls} style={inputStyle} placeholder="Charizard ex"
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Card Number</label>
            <input value={form.card_number} onChange={(e) => set("card_number", e.target.value)}
              className={inputCls} style={inputStyle} placeholder="199/165"
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Set</label>
            <SetSelector value={form.set_name} onChange={(v) => set("set_name", v)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Current Value (€)</label>
            <input type="number" step="0.01" min="0" value={form.actual_price}
              onChange={(e) => set("actual_price", e.target.value)}
              className={inputCls} style={inputStyle} placeholder="0.00"
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Extra Info</label>
            <textarea value={form.extra_info} onChange={(e) => set("extra_info", e.target.value)}
              rows={2} placeholder="Notes..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--neon)", color: "#000", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add to Wishlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

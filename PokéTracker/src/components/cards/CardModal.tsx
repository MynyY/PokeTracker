"use client";

import { useState } from "react";
import { Card, CardQuality, QUALITY_OPTIONS } from "@/types";
import SetSelector from "./SetSelector";

interface Props { card?: Card; userId: string; collectionType?: 'collection' | 'inventory'; onSave: (card: Card) => void; onSaveAndContinue?: (card: Card) => void; onSaveAndNext?: (card: Card) => void; onClose: () => void; }

export default function CardModal({ card, userId, collectionType = 'collection', onSave, onSaveAndContinue, onSaveAndNext, onClose }: Props) {
  const isEdit = !!card;
  const [form, setForm] = useState({
    card_name: card?.card_name ?? "", card_number: card?.card_number ?? "", card_id: card?.card_id ?? "",
    set_name: card?.set_name ?? "", quality: card?.quality ?? "NM" as CardQuality,
    price_bought: card?.price_bought?.toString() ?? "", date_bought: card?.date_bought ?? "",
    price_sold: card?.price_sold?.toString() ?? "", date_sold: card?.date_sold ?? "",
    actual_price: card?.actual_price?.toString() ?? "",
    extra_info: card?.extra_info ?? "",
  });
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addAnother, setAddAnother] = useState(false);
  const [saveNext, setSaveNext] = useState(false);

  function set(key: string, value: string) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null);
    const payload = {
      card_name: form.card_name, card_number: form.card_number || null, card_id: form.card_id || null,
      set_name: form.set_name || null, quality: form.quality,
      price_bought: form.price_bought ? parseFloat(form.price_bought) : null,
      date_bought: form.date_bought || null,
      price_sold: form.price_sold ? parseFloat(form.price_sold) : null,
      date_sold: form.date_sold || null,
      actual_price: form.actual_price ? parseFloat(form.actual_price) : null,
      extra_info: form.extra_info || null,
      collection_type: collectionType,
    };
    const res = await fetch(isEdit ? `/api/cards/${card!.id}` : "/api/cards", {
      method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? payload : { ...payload, user_id: userId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return; }
    if (addAnother && onSaveAndContinue) {
      onSaveAndContinue(data.card);
    } else if (saveNext && onSaveAndNext) {
      onSaveAndNext(data.card);
    } else {
      onSave(data.card);
    }
    setAddAnother(false);
    setSaveNext(false);
    setLoading(false);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{isEdit ? "Edit Card" : "Add Card"}</h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Card Name *</label>
              <input required value={form.card_name} onChange={(e) => set("card_name", e.target.value)} className={inputCls} style={inputStyle} placeholder="Charizard ex"
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Card Number</label>
              <input value={form.card_number} onChange={(e) => set("card_number", e.target.value)} className={inputCls} style={inputStyle} placeholder="199/165"
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Card ID</label>
              <input value={form.card_id} onChange={(e) => set("card_id", e.target.value)} className={inputCls} style={inputStyle} placeholder="sv3pt5-199"
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Set</label>
              <SetSelector value={form.set_name} onChange={(v) => set("set_name", v)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quality *</label>
              <select value={form.quality} onChange={(e) => set("quality", e.target.value)} className={inputCls} style={inputStyle}>
                {QUALITY_OPTIONS.map((q) => <option key={q.value} value={q.value}>{q.value} — {q.description}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Price Bought (€)</label>
              <input type="number" step="0.01" min="0" value={form.price_bought} onChange={(e) => set("price_bought", e.target.value)} className={inputCls} style={inputStyle} placeholder="0.00"
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date Bought</label>
              <input type="date" value={form.date_bought} onChange={(e) => set("date_bought", e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Current Value (€)</label>
              <input type="number" step="0.01" min="0" value={form.actual_price} onChange={(e) => set("actual_price", e.target.value)} className={inputCls} style={inputStyle} placeholder="0.00"
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            {isEdit && card?.status === "history" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Price Sold (€)</label>
                  <input type="number" step="0.01" min="0" value={form.price_sold} onChange={(e) => set("price_sold", e.target.value)} className={inputCls} style={inputStyle} placeholder="0.00"
                    onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date Sold</label>
                  <input type="date" value={form.date_sold} onChange={(e) => set("date_sold", e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              </>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Extra Info</label>
              <textarea
                value={form.extra_info}
                onChange={(e) => set("extra_info", e.target.value)}
                rows={3}
                placeholder="Notes, grading info, purchase location…"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {!isEdit && (
              <button
                type="submit"
                disabled={loading}
                onClick={() => { setAddAnother(true); setSaveNext(false); }}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--neon)44", color: "var(--neon)", opacity: loading ? 0.6 : 1 }}
              >
                {loading && addAnother ? "Saving…" : "+ Add Another One"}
              </button>
            )}
            {isEdit && onSaveAndNext && (
              <button
                type="submit"
                disabled={loading}
                onClick={() => { setSaveNext(true); setAddAnother(false); }}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--neon)44", color: "var(--neon)", opacity: loading ? 0.6 : 1 }}
              >
                {loading && saveNext ? "Saving…" : "Save & Go To Next →"}
              </button>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              <button type="submit" disabled={loading} onClick={() => { setAddAnother(false); setSaveNext(false); }} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--neon)", color: "#000", opacity: loading ? 0.6 : 1 }}>
                {loading && !addAnother && !saveNext ? "Saving…" : isEdit ? "Save Changes" : amount > 1 ? `Add ${amount} Items` : "Add Item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

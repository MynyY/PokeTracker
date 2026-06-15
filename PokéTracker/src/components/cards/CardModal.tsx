"use client";

import { useState } from "react";
import { Card, CardQuality, QUALITY_OPTIONS } from "@/types";

interface Props {
  card?: Card;
  userId: string;
  onSave: (card: Card) => void;
  onClose: () => void;
}

export default function CardModal({ card, userId, onSave, onClose }: Props) {
  const isEdit = !!card;

  const [form, setForm] = useState({
    card_name: card?.card_name ?? "",
    card_number: card?.card_number ?? "",
    card_id: card?.card_id ?? "",
    set_name: card?.set_name ?? "",
    quality: card?.quality ?? "NM" as CardQuality,
    price_bought: card?.price_bought?.toString() ?? "",
    date_bought: card?.date_bought ?? "",
    price_sold: card?.price_sold?.toString() ?? "",
    date_sold: card?.date_sold ?? "",
    actual_price: card?.actual_price?.toString() ?? "",
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
      card_id: form.card_id || null,
      set_name: form.set_name || null,
      quality: form.quality,
      price_bought: form.price_bought ? parseFloat(form.price_bought) : null,
      date_bought: form.date_bought || null,
      price_sold: form.price_sold ? parseFloat(form.price_sold) : null,
      date_sold: form.date_sold || null,
      actual_price: form.actual_price ? parseFloat(form.actual_price) : null,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Card" : "Add Card"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Card Name *">
                <input
                  required
                  value={form.card_name}
                  onChange={(e) => set("card_name", e.target.value)}
                  className={inputCls}
                  placeholder="Charizard ex"
                />
              </Field>
            </div>

            <Field label="Card Number">
              <input
                value={form.card_number}
                onChange={(e) => set("card_number", e.target.value)}
                className={inputCls}
                placeholder="199/165"
              />
            </Field>

            <Field label="Card ID">
              <input
                value={form.card_id}
                onChange={(e) => set("card_id", e.target.value)}
                className={inputCls}
                placeholder="sv3pt5-199"
              />
            </Field>

            <div className="col-span-2">
              <Field label="Set">
                <input
                  value={form.set_name}
                  onChange={(e) => set("set_name", e.target.value)}
                  className={inputCls}
                  placeholder="151"
                />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Quality *">
                <select
                  value={form.quality}
                  onChange={(e) => set("quality", e.target.value)}
                  className={inputCls}
                >
                  {QUALITY_OPTIONS.map((q) => (
                    <option key={q.value} value={q.value}>
                      {q.value} — {q.description}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Price Bought (€)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price_bought}
                onChange={(e) => set("price_bought", e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </Field>

            <Field label="Date Bought">
              <input
                type="date"
                value={form.date_bought}
                onChange={(e) => set("date_bought", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Actual Price (€)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.actual_price}
                onChange={(e) => set("actual_price", e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </Field>

            {isEdit && card?.status === "history" && (
              <>
                <Field label="Price Sold (€)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_sold}
                    onChange={(e) => set("price_sold", e.target.value)}
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Date Sold">
                  <input
                    type="date"
                    value={form.date_sold}
                    onChange={(e) => set("date_sold", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

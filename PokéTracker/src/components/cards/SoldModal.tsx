"use client";

import { useState } from "react";
import { Card } from "@/types";

interface Props {
  card: Card;
  onConfirm: (card: Card, priceSold: number, dateSold: string) => Promise<void>;
  onClose: () => void;
}

export default function SoldModal({ card, onConfirm, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [priceSold, setPriceSold] = useState("");
  const [dateSold, setDateSold] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceSold) {
      setError("Please enter a sale price.");
      return;
    }
    setLoading(true);
    setError(null);
    await onConfirm(card, parseFloat(priceSold), dateSold);
    setLoading(false);
  }

  const profit =
    priceSold && card.price_bought != null
      ? parseFloat(priceSold) - card.price_bought
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Mark as Sold</h2>
          <p className="text-sm text-gray-500 mt-0.5">{card.card_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceSold}
              onChange={(e) => setPriceSold(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Sold</label>
            <input
              type="date"
              value={dateSold}
              onChange={(e) => setDateSold(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          {profit != null && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                profit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              Profit: {profit >= 0 ? "+" : ""}€{profit.toFixed(2)}
            </div>
          )}

          <div className="flex gap-3 pt-1">
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
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? "Saving…" : "Confirm Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

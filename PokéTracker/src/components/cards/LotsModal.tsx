"use client";

import { useState } from "react";
import { Card, CardLot } from "@/types";
import { format } from "date-fns";

interface Props {
  card: Card;
  lots: CardLot[];
  onClose: () => void;
  onLotsChanged: (cardId: string, lots: CardLot[]) => void;
}

export default function LotsModal({ card, lots: initialLots, onClose, onLotsChanged }: Props) {
  const [lots, setLots] = useState<CardLot[]>(initialLots);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ price_bought: "", date_bought: new Date().toISOString().split("T")[0] });
  const [soldLot, setSoldLot] = useState<CardLot | null>(null);
  const [soldForm, setSoldForm] = useState({ price_sold: "", date_sold: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualLots  = lots.filter((l) => l.status === "actual");
  const historyLots = lots.filter((l) => l.status === "history");
  const avgBought   = actualLots.length > 0 && actualLots.some((l) => l.price_bought != null)
    ? actualLots.reduce((s, l) => s + (l.price_bought ?? 0), 0) / actualLots.filter((l) => l.price_bought != null).length
    : null;

  async function handleAddLot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_id: card.id,
        price_bought: addForm.price_bought ? parseFloat(addForm.price_bought) : null,
        date_bought: addForm.date_bought || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    const updated = [...lots, data.lot];
    setLots(updated);
    onLotsChanged(card.id, updated);
    setAddForm({ price_bought: "", date_bought: new Date().toISOString().split("T")[0] });
    setShowAddForm(false);
    setLoading(false);
  }

  async function handleSellLot(e: React.FormEvent) {
    e.preventDefault();
    if (!soldLot) return;
    setLoading(true); setError(null);
    const res = await fetch(`/api/lots/${soldLot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "history",
        price_sold: soldForm.price_sold ? parseFloat(soldForm.price_sold) : null,
        date_sold: soldForm.date_sold || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    const updated = lots.map((l) => l.id === soldLot.id ? data.lot : l);
    setLots(updated);
    onLotsChanged(card.id, updated);
    setSoldLot(null);
    setSoldForm({ price_sold: "", date_sold: new Date().toISOString().split("T")[0] });
    setLoading(false);
  }

  async function handleDeleteLot(lot: CardLot) {
    setLoading(true);
    const res = await fetch(`/api/lots/${lot.id}`, { method: "DELETE" });
    if (res.ok) {
      const updated = lots.filter((l) => l.id !== lot.id);
      setLots(updated);
      onLotsChanged(card.id, updated);
    }
    setLoading(false);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="sticky top-0 px-6 py-4 flex items-start justify-between rounded-t-2xl" style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{card.card_name}</h2>
            <div className="flex gap-4 mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>{actualLots.length}× in stock</span>
              {avgBought != null && <span>Avg. bought: <strong style={{ color: "var(--neon)" }}>€{avgBought.toFixed(2)}</strong></span>}
            </div>
          </div>
          <button onClick={onClose} className="text-xl leading-none mt-1" style={{ color: "var(--text-muted)" }}>×</button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>}

          {/* In Stock lots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>IN STOCK ({actualLots.length})</h3>
              <button onClick={() => setShowAddForm((v) => !v)} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: "var(--neon)", color: "#000" }}>
                + Add Purchase
              </button>
            </div>

            {/* Add purchase form */}
            {showAddForm && (
              <form onSubmit={handleAddLot} className="flex gap-3 mb-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Price (€)</label>
                  <input type="number" step="0.01" min="0" value={addForm.price_bought}
                    onChange={(e) => setAddForm((p) => ({ ...p, price_bought: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="0.00"
                    onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Date</label>
                  <input type="date" value={addForm.date_bought}
                    onChange={(e) => setAddForm((p) => ({ ...p, date_bought: e.target.value }))}
                    className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" disabled={loading} className="px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: "var(--neon)", color: "#000" }}>Save</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                </div>
              </form>
            )}

            {actualLots.length === 0 ? (
              <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>No stock — add a purchase above.</p>
            ) : (
              <div className="space-y-2">
                {actualLots.map((lot, i) => (
                  <div key={lot.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <div className="text-sm">
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {lot.price_bought != null ? `€${lot.price_bought.toFixed(2)}` : "—"}
                      </span>
                      {lot.date_bought && (
                        <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          {format(new Date(lot.date_bought), "dd/MM/yy")}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSoldLot(lot); setSoldForm({ price_sold: "", date_sold: new Date().toISOString().split("T")[0] }); }}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: "#00FF8822", color: "#00FF88", border: "1px solid #00FF8844" }}>
                        Sell
                      </button>
                      <button onClick={() => handleDeleteLot(lot)} disabled={loading}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: "#FF003322", color: "#FF6B6B", border: "1px solid #FF003344" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sell lot form */}
          {soldLot && (
            <form onSubmit={handleSellLot} className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid #00FF8844" }}>
              <p className="text-sm font-semibold" style={{ color: "#00FF88" }}>Sell lot (bought at €{soldLot.price_bought?.toFixed(2) ?? "?"})</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sold for (€)</label>
                  <input type="number" step="0.01" min="0" value={soldForm.price_sold}
                    onChange={(e) => setSoldForm((p) => ({ ...p, price_sold: e.target.value }))}
                    required autoFocus className={inputCls} style={inputStyle} placeholder="0.00"
                    onFocus={(e) => (e.target.style.borderColor = "#00FF88")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Date sold</label>
                  <input type="date" value={soldForm.date_sold}
                    onChange={(e) => setSoldForm((p) => ({ ...p, date_sold: e.target.value }))}
                    className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                    onFocus={(e) => (e.target.style.borderColor = "#00FF88")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              </div>
              {soldForm.price_sold && soldLot.price_bought != null && (
                <p className="text-xs font-semibold" style={{ color: parseFloat(soldForm.price_sold) >= soldLot.price_bought ? "#00FF88" : "#FF6B6B" }}>
                  P&L: {parseFloat(soldForm.price_sold) >= soldLot.price_bought ? "+" : ""}€{(parseFloat(soldForm.price_sold) - soldLot.price_bought).toFixed(2)}
                </p>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: "#00FF88", color: "#000" }}>Confirm Sale</button>
                <button type="button" onClick={() => setSoldLot(null)} className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
              </div>
            </form>
          )}

          {/* History lots */}
          {historyLots.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>SOLD ({historyLots.length})</h3>
              <div className="space-y-2">
                {historyLots.map((lot) => {
                  const pl = lot.price_sold != null && lot.price_bought != null ? lot.price_sold - lot.price_bought : null;
                  return (
                    <div key={lot.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <div className="text-sm flex gap-4">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Bought: {lot.price_bought != null ? `€${lot.price_bought.toFixed(2)}` : "—"}
                          {lot.date_bought && <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>{format(new Date(lot.date_bought), "dd/MM/yy")}</span>}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          Sold: {lot.price_sold != null ? `€${lot.price_sold.toFixed(2)}` : "—"}
                          {lot.date_sold && <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>{format(new Date(lot.date_sold), "dd/MM/yy")}</span>}
                        </span>
                        {pl != null && (
                          <span className="font-semibold" style={{ color: pl >= 0 ? "#00FF88" : "#FF6B6B" }}>
                            {pl >= 0 ? "+" : ""}€{pl.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteLot(lot)} disabled={loading}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: "#FF003322", color: "#FF6B6B", border: "1px solid #FF003344" }}>
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

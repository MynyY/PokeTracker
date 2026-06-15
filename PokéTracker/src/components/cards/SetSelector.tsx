"use client";

import { useState, useRef, useEffect } from "react";
import { POKEMON_SETS } from "@/lib/sets";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SetSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = search.trim()
    ? POKEMON_SETS.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.series.toLowerCase().includes(search.toLowerCase())
      )
    : POKEMON_SETS;

  const selectedSet = POKEMON_SETS.find((s) => s.code === value);

  const inputStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="w-full px-3 py-2 rounded-lg text-sm text-left flex items-center justify-between"
        style={inputStyle}
      >
        <span style={{ color: selectedSet ? "var(--text-primary)" : "var(--text-muted)" }}>
          {selectedSet ? `${selectedSet.name} (${selectedSet.code})` : "Select a set…"}
        </span>
        <span style={{ color: "var(--text-muted)" }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {/* Search */}
          <div className="p-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sets…"
              autoComplete="off"
              className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--neon)44", color: "var(--text-primary)" }}
            />
          </div>

          {/* Clear option */}
          <div className="max-h-56 overflow-y-auto">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full px-3 py-2 text-left text-sm"
                style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
              >
                — Clear selection
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center" style={{ color: "var(--text-muted)" }}>No sets found</div>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => { onChange(s.code); setOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center justify-between"
                  style={{
                    backgroundColor: s.code === value ? "var(--neon-dim)" : "transparent",
                    color: s.code === value ? "var(--neon)" : "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => { if (s.code !== value) e.currentTarget.style.backgroundColor = "var(--bg-elevated)"; }}
                  onMouseLeave={(e) => { if (s.code !== value) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span>{s.name}</span>
                  <span className="text-xs ml-2 font-mono" style={{ color: "var(--text-secondary)" }}>{s.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

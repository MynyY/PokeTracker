"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types";
import Link from "next/link";

interface Props { users: Profile[]; currentProfile: Profile | null; }

export default function UsersClientPage({ users: initialUsers, currentProfile }: Props) {
  const router = useRouter();
  const isMaster = currentProfile?.role === "master";
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", full_name: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null); setSuccess(null);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong"); }
    else { setSuccess(`User "${form.username}" created successfully.`); setForm({ email: "", password: "", username: "", full_name: "", role: "user" }); setShowAdd(false); router.refresh(); }
    setLoading(false);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{users.length} registered trainers</p>
        </div>
        {isMaster && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg" style={{ backgroundColor: "var(--neon)", color: "#000" }}>
            <span>+</span> New User
          </button>
        )}
      </div>

      {success && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#00FF8822", border: "1px solid #00FF8844", color: "#00FF88" }}>{success}</div>}

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Username</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Full Name</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  {u.username}
                  {u.id === currentProfile?.id && <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>(you)</span>}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{u.full_name || "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={u.role === "master"
                      ? { backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid #00D4FF44" }
                      : { backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/cards?userId=${u.id}`} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: "var(--neon-dim)", color: "var(--neon)", border: "1px solid #00D4FF44" }}>
                    View Cards
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
          <div className="rounded-2xl w-full max-w-md" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Create New User</h2>
              <button onClick={() => setShowAdd(false)} className="text-xl" style={{ color: "var(--text-muted)" }}>×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FF003322", border: "1px solid #FF003366", color: "#FF6B6B" }}>{error}</div>}
              {(["username", "full_name", "email", "password"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize" style={{ color: "var(--text-secondary)" }}>
                    {field.replace("_", " ")}{field !== "full_name" ? " *" : ""}
                  </label>
                  <input type={field === "password" ? "password" : field === "email" ? "email" : "text"} required={field !== "full_name"}
                    value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className={inputCls} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--neon)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Role</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={inputCls} style={inputStyle}>
                  <option value="user">User</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--neon)", color: "#000", opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

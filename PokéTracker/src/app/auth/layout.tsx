export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 16px",
            boxShadow: "0 0 32px #00E5CC55",
            background: "#111",
          }}>
            <img
              src="/logo.jpg"
              alt="PokéTracker"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>PokéTracker</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Your Pokémon card collection manager</p>
        </div>
        <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

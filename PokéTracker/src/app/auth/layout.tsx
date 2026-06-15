export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/pokeball.jpg" alt="PokéTracker" className="w-16 h-16 rounded-full" style={{ boxShadow: "0 0 20px #00D4FF55" }} />
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

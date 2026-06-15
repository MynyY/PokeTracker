export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-red-500 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/pokeball.jpg" alt="PokéTracker" className="w-16 h-16 rounded-full shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PokéTracker</h1>
          <p className="text-red-100 mt-1 text-sm">Your Pokémon card collection manager</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}

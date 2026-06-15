# ⚡ PokéTracker

Track your Pokémon card collection — bought prices, sale prices, actual value and profit — with a multi-user system hosted for free on Vercel + Supabase.

---

## 🚀 Deployment Guide (Vercel + Supabase + GitHub)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `pokemon-tracker`), set a database password, pick a region
3. Once created, go to **SQL Editor** and paste the entire contents of `supabase-schema.sql` → **Run**
4. Go to **Project Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret!**)

### Step 2 — Push to GitHub

1. Create a new GitHub repository (e.g. `pokemon-tracker`)
2. In the project folder, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pokemon-tracker.git
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |

4. Click **Deploy** — Vercel will build and host it automatically

### Step 4 — Create your first Master user

Since there's no public signup, the first user must be created directly in Supabase:

1. Go to **Supabase → Authentication → Users** → **Add user**
2. Enter email + password → **Create user**
3. Then in **SQL Editor** run:

```sql
UPDATE public.profiles
SET role = 'master'
WHERE username = 'your_username';
```

After that, the Master user can create all other users from within the app.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase values
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Features

- **Actual tab**: Cards currently in your collection
- **History tab**: Cards you've sold, with profit calculation
- **Sold button**: Marks a card as sold, asks for Price Sold + Date Sold
- **Quality grades**: MT, NM, EX, GD, LP, PL, PO (based on Cardmarket standards)
- **Multi-user**: Master can create users; all users can view each other's collections
- **Profit**: Automatically calculated as Price Sold − Price Bought

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel (free tier) |
| Source | GitHub |

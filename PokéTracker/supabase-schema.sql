-- ============================================================
-- Pokemon Card Tracker - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('master', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  card_number TEXT,
  card_id TEXT,
  set_name TEXT,
  quality TEXT NOT NULL CHECK (quality IN ('MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO')),
  price_bought NUMERIC(10,2),
  date_bought DATE,
  price_sold NUMERIC(10,2),
  date_sold DATE,
  actual_price NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'actual' CHECK (status IN ('actual', 'history')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read all profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Profiles: only masters can insert new profiles (via service role in API)
-- (signup creates profile via trigger below)

-- Cards: users can read their own cards; anyone authenticated can read others' cards (for user lookup feature)
CREATE POLICY "cards_select_own"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);

-- Cards: users can insert their own cards
CREATE POLICY "cards_insert_own"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Cards: users can update their own cards
CREATE POLICY "cards_update_own"
  ON public.cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cards: users can delete their own cards
CREATE POLICY "cards_delete_own"
  ON public.cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

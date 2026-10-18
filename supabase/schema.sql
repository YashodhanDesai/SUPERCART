-- ========================================================================
-- SuperCart Complete Database Schema for Supabase
-- Project ID: itwmjfylusrllprnvexy
-- Target URL: https://itwmjfylusrllprnvexy.supabase.co
-- SQL Editor URL: https://supabase.com/dashboard/project/itwmjfylusrllprnvexy/sql/new
-- ========================================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "deliveryAddress" TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  "discountCode" TEXT,
  "deliveryFee" NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  status TEXT DEFAULT 'Placed',
  "estimatedDeliveryTime" TEXT,
  "driverName" TEXT DEFAULT 'Carlos Ramirez',
  "driverPhone" TEXT DEFAULT '+1 (555) 234-8901',
  "driverVehicle" TEXT DEFAULT 'Eco Electric Van (Plate: SC-789)',
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure timestamp columns exist even if table was previously created
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- 2. Create Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  "originalPrice" NUMERIC,
  stock INTEGER DEFAULT 0,
  unit TEXT,
  image TEXT,
  description TEXT,
  rating NUMERIC DEFAULT 4.5,
  "reviewCount" INTEGER DEFAULT 0,
  badge TEXT,
  "isFeatured" BOOLEAN DEFAULT FALSE,
  organic BOOLEAN DEFAULT FALSE,
  season TEXT,
  origin TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  nutrition JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure timestamp columns exist even if table was previously created
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- 3. Create Users & Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  uid TEXT,
  email TEXT,
  name TEXT,
  phone TEXT,
  "phoneNumber" TEXT,
  "phoneVerified" BOOLEAN DEFAULT FALSE,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  address TEXT,
  "savedAddresses" JSONB DEFAULT '[]'::jsonb,
  avatar TEXT,
  "photoURL" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure timestamp columns exist even if table was previously created
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Grant Schema & Table Permissions to Supabase anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 6. Setup Permissive Policies for the SuperCart client
DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access products" ON public.products;
CREATE POLICY "Public access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 7. Insert Initial Seed Products so the database shows data immediately
INSERT INTO public.products (id, name, category, price, "originalPrice", stock, unit, image, description, rating, "reviewCount", badge, "isFeatured", organic)
VALUES 
  ('prod-1', 'Fresh Organic Alphonso Mangoes', 'Fruits', 349, 449, 45, '1 kg (approx 4-5 pcs)', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80', 'Naturally ripened, sweet and aromatic Ratnagiri Alphonso mangoes.', 4.9, 142, 'Seasonal Best', true, true),
  ('prod-2', 'Farm Fresh Broccoli', 'Vegetables', 79, 99, 60, '500g', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 'Crisp, nutrient-rich green broccoli sourced from local organic farms.', 4.7, 88, 'Fresh Harvest', true, true),
  ('prod-3', 'Desi Gir Cow A2 Milk', 'Dairy & Breakfast', 85, 95, 30, '1 Litre', 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80', 'Pure, unprocessed A2 cow milk delivered chilled in eco-friendly glass bottles.', 4.9, 210, 'Bestseller', true, true),
  ('prod-4', 'Artisanal Sourdough Bread', 'Bakery & Bread', 120, 150, 25, '400g Loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Naturally fermented 36-hour sourdough with golden crust and soft crumb.', 4.8, 95, 'Baker’s Special', true, false),
  ('prod-5', 'Roasted Peri-Peri Makhana', 'Snacks & Drinks', 149, 199, 80, '150g pouch', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281086?auto=format&fit=crop&w=600&q=80', 'Crunchy roasted foxnuts tossed in zesty peri-peri spices. Zero trans fat.', 4.6, 64, 'Healthy Snack', false, true)
ON CONFLICT (id) DO UPDATE 
SET price = EXCLUDED.price, 
    stock = EXCLUDED.stock,
    "updatedAt" = NOW();

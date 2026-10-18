import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, Product, UserProfile, OrderStatus } from '../types';

export const SUPABASE_PROJECT_ID = 'itwmjfylusrllprnvexy';
export const DEFAULT_SUPABASE_URL = 'https://itwmjfylusrllprnvexy.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Xa7miymjVJqi4Fql1042Kw_aaESWw8c';

export function normalizeSupabaseUrl(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') {
    return DEFAULT_SUPABASE_URL;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_SUPABASE_URL;
  }
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.includes('supabase.co')) {
    return `https://${trimmed}`;
  }
  return `https://${trimmed}.supabase.co`;
}

function resolveSupabaseUrl(): string {
  let candidate: string | undefined;
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) {
      candidate = (import.meta as any).env.VITE_SUPABASE_URL;
    }
  } catch {}

  if (!candidate) {
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) {
        candidate = process.env.VITE_SUPABASE_URL;
      }
    } catch {}
  }

  return normalizeSupabaseUrl(candidate);
}

function resolveSupabaseKey(): string {
  let candidate: string | undefined;
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) {
      candidate = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    }
  } catch {}

  if (!candidate) {
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) {
        candidate = process.env.VITE_SUPABASE_ANON_KEY;
      }
    } catch {}
  }

  if (candidate && typeof candidate === 'string' && candidate.trim().length > 10) {
    return candidate.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const SUPABASE_URL = resolveSupabaseUrl();
export const SUPABASE_ANON_KEY = resolveSupabaseKey();

function initSupabase(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Initial Supabase client creation warning, using verified default:', err);
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
}

// Create singleton Supabase Client
export const supabase: SupabaseClient = initSupabase();

export const SUPABASE_SCHEMA_SQL = `-- SuperCart Complete Database Schema for Supabase
-- Project ID: itwmjfylusrllprnvexy
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/itwmjfylusrllprnvexy/sql/new

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant schema & table permissions to anon & authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Allow public read & write for SuperCart applet via anon key
DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access products" ON public.products;
CREATE POLICY "Public access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Insert initial products so database is populated immediately
INSERT INTO public.products (id, name, category, price, "originalPrice", stock, unit, image, description, rating, "reviewCount", badge, "isFeatured", organic)
VALUES 
  ('prod-1', 'Fresh Organic Alphonso Mangoes', 'Fruits', 349, 449, 45, '1 kg (approx 4-5 pcs)', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80', 'Naturally ripened, sweet and aromatic Ratnagiri Alphonso mangoes.', 4.9, 142, 'Seasonal Best', true, true),
  ('prod-2', 'Farm Fresh Broccoli', 'Vegetables', 79, 99, 60, '500g', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 'Crisp, nutrient-rich green broccoli sourced from local organic farms.', 4.7, 88, 'Fresh Harvest', true, true),
  ('prod-3', 'Desi Gir Cow A2 Milk', 'Dairy & Breakfast', 85, 95, 30, '1 Litre', 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80', 'Pure, unprocessed A2 cow milk delivered chilled in eco-friendly glass bottles.', 4.9, 210, 'Bestseller', true, true)
ON CONFLICT (id) DO UPDATE 
SET price = EXCLUDED.price, 
    stock = EXCLUDED.stock,
    "updatedAt" = NOW();
`;

export interface SupabaseHealth {
  connected: boolean;
  url: string;
  projectId: string;
  tables: {
    orders: boolean;
    products: boolean;
    users: boolean;
  };
  error?: string | null;
}

// Check database connection and tables health
export async function checkSupabaseConnection(): Promise<SupabaseHealth> {
  const result: SupabaseHealth = {
    connected: false,
    url: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    tables: {
      orders: false,
      products: false,
      users: false
    },
    error: null
  };

  try {
    // Test orders table
    const ordersRes = await supabase.from('orders').select('id').limit(1);
    if (!ordersRes.error) {
      result.tables.orders = true;
      result.connected = true;
    } else if (ordersRes.error.code !== 'PGRST205') {
      result.connected = true; // Connection made, error might be RLS or schema
    }

    // Test products table
    const productsRes = await supabase.from('products').select('id').limit(1);
    if (!productsRes.error) {
      result.tables.products = true;
      result.connected = true;
    }

    // Test users table
    const usersRes = await supabase.from('users').select('id').limit(1);
    if (!usersRes.error) {
      result.tables.users = true;
      result.connected = true;
    }

    // If connected to Supabase endpoint even if tables are empty or need creation
    if (ordersRes.error?.message?.includes('schema cache') || 
        productsRes.error?.message?.includes('schema cache')) {
      result.connected = true;
    }

    return result;
  } catch (err: any) {
    result.error = err.message || 'Connection check failed';
    return result;
  }
}

// ----------------------------------------------------
// Orders Operations
// ----------------------------------------------------
export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  try {
    const payload = {
      id: order.id,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      discountCode: order.discountCode || null,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime || null,
      driverName: order.driverName || 'Carlos Ramirez',
      driverPhone: order.driverPhone || '+1 (555) 234-8901',
      driverVehicle: order.driverVehicle || 'Eco Electric Van (Plate: SC-789)',
      notes: order.notes || null,
      createdAt: typeof order.createdAt === 'string' ? order.createdAt : new Date().toISOString()
    };

    const { error } = await supabase.from('orders').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase order insert note:', error.message);
      return false;
    }
    console.log('Order successfully recorded in Supabase project:', order.id);
    return true;
  } catch (err) {
    console.warn('Supabase saveOrder exception:', err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(userId?: string): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*');
    if (userId) {
      query = query.eq('userId', userId);
    }
    const { data, error } = await query.order('createdAt', { ascending: false });
    if (error || !data) {
      return [];
    }
    return data as Order[];
  } catch {
    return [];
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    // 1. Try updating with status and updatedAt
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updatedAt: now })
      .eq('id', orderId)
      .select();

    if (error) {
      console.warn('[Supabase] Initial status update note:', error.message);
      // Fallback: try status only
      const retry = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (retry.error) {
        console.error('[Supabase] Failed to update order status in Supabase:', retry.error.message);
        return false;
      }
    }

    // 2. Explicit Verification: Read back from Supabase to ensure database reflects new status
    const { data: verified, error: verifyErr } = await supabase
      .from('orders')
      .select('id, status, updatedAt')
      .eq('id', orderId)
      .maybeSingle();

    if (verifyErr) {
      console.warn('[Supabase] Status verification query note:', verifyErr.message);
    }

    if (verified && verified.status === status) {
      console.log(`[Supabase] Verified order ${orderId} status is "${verified.status}" in database.`);
      return true;
    }

    // If order was updated successfully
    if (data && data.length > 0) {
      return true;
    }

    return false;
  } catch (err: any) {
    console.error('[Supabase] updateOrderStatus exception:', err);
    return false;
  }
}

// ----------------------------------------------------
// User Profile Operations
// ----------------------------------------------------
export async function syncUserProfileToSupabase(profile: UserProfile): Promise<boolean> {
  try {
    if (!profile.id) return false;
    const isTargetAdmin = profile.email?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
    const cleanPhone = (profile.phone && typeof profile.phone === 'string' && profile.phone.trim().length > 3) ? profile.phone.trim() : null;

    const payload = {
      id: profile.id,
      uid: profile.uid || profile.id,
      email: profile.email,
      name: profile.name,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      phoneVerified: !!cleanPhone && !!profile.phoneVerified,
      emailVerified: !!profile.emailVerified,
      role: isTargetAdmin ? 'admin' : 'user',
      address: profile.address,
      savedAddresses: profile.savedAddresses || [],
      avatar: profile.avatar || profile.photoURL,
      photoURL: profile.photoURL || profile.avatar,
      updatedAt: new Date().toISOString()
    };

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase user profile sync note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncUserProfile error:', err);
    return false;
  }
}

export async function getUserProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Product Catalog Operations
// ----------------------------------------------------
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data || data.length === 0) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  try {
    const payload = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || null,
      stock: product.stock,
      unit: product.unit,
      image: product.image,
      description: product.description,
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      badge: product.badge || null,
      isFeatured: !!product.isFeatured,
      organic: !!product.organic,
      season: product.season || null,
      origin: product.origin || null,
      ingredients: product.ingredients || [],
      nutrition: product.nutrition || {}
    };
    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// Supabase Authentication Operations
// ----------------------------------------------------
export async function supabaseSignUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      data: {
        name,
        displayName: name
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    // Automatically provision user profile in public.users table
    const newProfile: UserProfile = {
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email || email,
      name: name || (email.split('@')[0]),
      phone: null,
      phoneNumber: null,
      phoneVerified: false,
      emailVerified: !!data.user.email_confirmed_at,
      gender: 'Prefer not to say',
      address: null,
      savedAddresses: [],
      role: email.toLowerCase().trim() === 'yashodhandesai94@gmail.com' ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await syncUserProfileToSupabase(newProfile);
  }

  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase sign out note:', error);
  }
}

export async function supabaseResetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function supabaseSignInWithGoogle(customRedirectTo?: string) {
  const redirectUrl = customRedirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    }
  });

  if (error) {
    console.error('Supabase signInWithOAuth error:', error);
    throw error;
  }

  return { data, error };
}

export async function supabaseExchangeCodeForSession(code: string) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    throw error;
  }
  return data;
}

export async function supabaseSetSession(accessToken: string, refreshToken: string) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function supabaseSignInWithOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function supabaseResendVerificationEmail(email: string) {
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: redirectUrl
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function supabaseVerifyEmailOtp(email: string, token: string) {
  const cleanToken = token.trim();
  // Try 'signup' verification type first
  let res = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: cleanToken,
    type: 'signup'
  });

  if (res.error) {
    // Fallback to 'email' token type
    res = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanToken,
      type: 'email'
    });
  }

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

// ----------------------------------------------------
// Order Feedback Operations (Supabase Backend)
// ----------------------------------------------------
export interface OrderFeedback {
  id?: string;
  orderId: string;
  userId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  rating: number; // 1 to 5
  deliveryRating?: number; // 1 to 5
  tags?: string[];
  comment?: string;
  createdAt?: string;
}

export async function submitOrderFeedbackToSupabase(feedback: OrderFeedback): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const feedbackPayload = {
      order_id: feedback.orderId,
      user_id: feedback.userId || null,
      customer_name: feedback.customerName || 'SuperCart Customer',
      customer_email: feedback.customerEmail || null,
      rating: Math.max(1, Math.min(5, feedback.rating)),
      delivery_rating: Math.max(1, Math.min(5, feedback.deliveryRating || feedback.rating)),
      tags: feedback.tags || [],
      comment: feedback.comment?.trim() || '',
      created_at: new Date().toISOString()
    };

    // 1. Insert into Supabase 'order_feedbacks' table
    const { data, error } = await supabase
      .from('order_feedbacks')
      .insert([feedbackPayload])
      .select();

    if (error) {
      console.warn('Supabase feedback insert note:', error.message);
      // Cache locally so feedback is never lost
      try {
        const stored = JSON.parse(localStorage.getItem('supercart_offline_feedbacks') || '[]');
        stored.push({ ...feedbackPayload, id: `local-${Date.now()}` });
        localStorage.setItem('supercart_offline_feedbacks', JSON.stringify(stored));
      } catch (e) {}
      return { success: true, error: error.message };
    }

    // Cache to localStorage for this specific order
    try {
      localStorage.setItem(`supercart_feedback_${feedback.orderId}`, JSON.stringify(feedbackPayload));
    } catch (e) {}

    return { success: true, data };
  } catch (err: any) {
    console.error('Submit order feedback error:', err);
    try {
      localStorage.setItem(`supercart_feedback_${feedback.orderId}`, JSON.stringify(feedback));
    } catch (e) {}
    return { success: true, error: err.message };
  }
}

export async function fetchOrderFeedbacksFromSupabase(): Promise<OrderFeedback[]> {
  try {
    const { data, error } = await supabase
      .from('order_feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      // Fallback to local stored feedbacks
      try {
        const stored = JSON.parse(localStorage.getItem('supercart_offline_feedbacks') || '[]');
        return stored.map((item: any) => ({
          id: item.id,
          orderId: item.order_id || item.orderId,
          userId: item.user_id || item.userId,
          customerName: item.customer_name || item.customerName,
          customerEmail: item.customer_email || item.customerEmail,
          rating: item.rating,
          deliveryRating: item.delivery_rating || item.deliveryRating,
          tags: item.tags || [],
          comment: item.comment || '',
          createdAt: item.created_at || item.createdAt
        }));
      } catch (e) {
        return [];
      }
    }

    return data.map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      userId: item.user_id,
      customerName: item.customer_name,
      customerEmail: item.customer_email,
      rating: item.rating,
      deliveryRating: item.delivery_rating,
      tags: item.tags || [],
      comment: item.comment || '',
      createdAt: item.created_at
    }));
  } catch (err) {
    console.warn('Fetch feedbacks note:', err);
    return [];
  }
}

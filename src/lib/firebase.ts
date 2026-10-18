import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { UserProfile, UserRole, Product, Order, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/seedProducts';
import { 
  saveOrderToSupabase, 
  updateOrderStatusInSupabase, 
  syncUserProfileToSupabase, 
  saveProductToSupabase, 
  deleteProductFromSupabase,
  fetchOrdersFromSupabase,
  fetchProductsFromSupabase,
  supabase
} from './supabase';

// Firebase Web Configuration provided for SuperCart
export const firebaseConfig = {
  apiKey: "AIzaSyDjqHC6VstBQacfx4igWrYLoSHu3ZjN6uw",
  authDomain: "supercart-sw19.firebaseapp.com",
  projectId: "supercart-sw19",
  storageBucket: "supercart-sw19.firebasestorage.app",
  messagingSenderId: "17242465501",
  appId: "1:17242465501:web:2a48899df2b07d33586734"
};

// Initialize Firebase App instance singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ----------------------------------------------------
// ----------------------------------------------------
// User Profile Helpers
// ----------------------------------------------------
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as Record<string, any>;
      const profile: UserProfile = {
        id: user.uid,
        uid: user.uid,
        email: user.email || data.email || null,
        name: user.displayName || data.name || (user.email ? user.email.split('@')[0] : 'SuperCart Shopper'),
        phone: user.phoneNumber || data.phoneNumber || data.phone || null,
        phoneNumber: user.phoneNumber || data.phoneNumber || data.phone || null,
        phoneVerified: !!user.phoneNumber || !!data.phoneVerified,
        emailVerified: user.emailVerified || !!data.emailVerified,
        address: data.address || null,
        savedAddresses: data.savedAddresses || [
          {
            id: 'addr-1',
            label: 'Home',
            street: 'Indiranagar 100ft Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            isDefault: true
          }
        ],
        role: data.role || (user.email?.toLowerCase().includes('admin') ? 'admin' : 'user'),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        avatar: user.photoURL || data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        photoURL: user.photoURL || data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
      };

      // Enforce admin role strictly for yashodhandesai94@gmail.com
      const isDesignatedAdmin = (profile.email || user.email)?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
      profile.role = isDesignatedAdmin ? 'admin' : 'user';

      // Ensure phone is null if not explicitly set
      if (!profile.phone || !profile.phone.trim()) {
        profile.phone = null;
        profile.phoneNumber = null;
        profile.phoneVerified = false;
      }

      // Update updatedAt timestamp in background
      try {
        await updateDoc(userRef, {
          role: profile.role,
          phone: profile.phone,
          phoneNumber: profile.phoneNumber,
          phoneVerified: profile.phoneVerified,
          updatedAt: serverTimestamp()
        });
      } catch (e) {}

      // Sync profile to Supabase backend
      syncUserProfileToSupabase(profile).catch(e => console.warn('Supabase profile sync note:', e));

      return profile;
    } else {
      // Determine if designated admin: ONLY yashodhandesai94@gmail.com
      const isAdmin = user.email?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
      const cleanPhone = (user.phoneNumber && user.phoneNumber.trim().length > 3) ? user.phoneNumber.trim() : null;

      const initialProfileData = {
        uid: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'SuperCart Shopper'),
        email: user.email || null,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        phoneVerified: !!cleanPhone,
        emailVerified: user.emailVerified || false,
        address: null,
        savedAddresses: [],
        role: (isAdmin ? 'admin' : 'user') as UserRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, initialProfileData);
      return { 
        ...initialProfileData, 
        id: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore user fetch failed, creating fallback profile:', err);
    const isAdmin = user.email?.toLowerCase().trim() === 'yashodhandesai94@gmail.com';
    const cleanPhone = (user.phoneNumber && user.phoneNumber.trim().length > 3) ? user.phoneNumber.trim() : null;
    return {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      name: user.displayName || (user.email ? user.email.split('@')[0] : 'Guest Shopper'),
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      phoneVerified: !!cleanPhone,
      emailVerified: user.emailVerified || false,
      address: null,
      savedAddresses: [],
      role: (isAdmin ? 'admin' : 'user') as UserRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
    };
  }
}

export async function updateUserProfileDoc(uid: string, fields: Partial<UserProfile> & Record<string, any>) {
  if (!uid || uid === 'shopper-guest-01') {
    return;
  }
  try {
    const userRef = doc(db, 'users', uid);
    const payload = {
      ...fields,
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, payload, { merge: true });

    // Sync updates to Supabase
    Promise.resolve(
      supabase.from('users').upsert({ id: uid, uid, ...fields, updatedAt: new Date().toISOString() }, { onConflict: 'id' })
    ).then(({ error }) => {
      if (error) console.warn('Supabase profile update note:', error.message);
    }).catch(() => {});
  } catch (err) {
    console.warn('Profile Firestore update note:', err);
  }
}

export async function deleteUserAccountDoc(uid: string) {
  if (!uid || uid === 'shopper-guest-01' || uid.startsWith('phone-user-') || uid.startsWith('guest-')) {
    return;
  }
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn('Delete user doc notice:', err);
  }
}

// ----------------------------------------------------
// Product Catalog Firestore Helpers
// ----------------------------------------------------
export async function seedProductsIfEmpty(): Promise<Product[]> {
  try {
    const prodsCol = collection(db, 'products');
    const snapshot = await getDocs(prodsCol);
    
    if (snapshot.empty) {
      console.log('Seeding initial products with Indian Rupee (INR) rates into Firestore...');
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod);
      }
      await batch.commit();
      return INITIAL_PRODUCTS;
    } else {
      const items: Product[] = [];
      const batch = writeBatch(db);
      let needsBatchUpdate = false;

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data() as Product;
        const item: Product = { id: docSnap.id, ...data };
        
        // If product still has old sub-20 USD rate, update it with INR rate
        if (item.price < 20) {
          const matchSeed = INITIAL_PRODUCTS.find(p => p.id === item.id || p.name === item.name);
          if (matchSeed) {
            item.price = matchSeed.price;
            item.originalPrice = matchSeed.originalPrice;
            batch.update(docSnap.ref, { price: matchSeed.price, originalPrice: matchSeed.originalPrice });
            needsBatchUpdate = true;
          }
        }
        items.push(item);
      });

      if (needsBatchUpdate) {
        batch.commit().catch(e => console.warn('Could not batch update old rates:', e));
      }

      return items;
    }
  } catch (error) {
    console.warn('Could not seed/fetch products from Firestore, returning local seed catalog:', error);
    return INITIAL_PRODUCTS;
  }
}

// Active in-memory catalog and live subscribers for instant UI reflection
const activeProductListeners = new Set<(products: Product[]) => void>();
let inMemoryCatalog: Product[] = [];

function broadcastCatalog(items: Product[]) {
  inMemoryCatalog = items;
  activeProductListeners.forEach(fn => {
    try { fn(items); } catch (e) {}
  });
}

export function notifyProductAdded(newProd: Product) {
  const updated = [newProd, ...inMemoryCatalog.filter(p => p.id !== newProd.id)];
  broadcastCatalog(updated);
}

export function notifyProductUpdated(updatedProd: Product) {
  const exists = inMemoryCatalog.some(p => p.id === updatedProd.id);
  const updated = exists 
    ? inMemoryCatalog.map(p => p.id === updatedProd.id ? { ...p, ...updatedProd } : p)
    : [updatedProd, ...inMemoryCatalog];
  broadcastCatalog(updated);
}

export function notifyProductDeleted(id: string) {
  const updated = inMemoryCatalog.filter(p => p.id !== id);
  broadcastCatalog(updated);
}

// Global singleton sync for live product catalog
let isProductSyncInitialized = false;
let globalFirestoreUnsub: (() => void) | null = null;
let globalSupaChannel: any = null;

function initGlobalProductSync(onError?: (err: Error) => void) {
  if (isProductSyncInitialized) return;
  isProductSyncInitialized = true;

  // 1. Initial direct query to Supabase database
  fetchProductsFromSupabase().then(supaItems => {
    if (supaItems && supaItems.length > 0) {
      if (inMemoryCatalog.length === 0) {
        broadcastCatalog(supaItems);
      } else {
        const merged = [...inMemoryCatalog];
        supaItems.forEach(s => {
          const idx = merged.findIndex(m => m.id === s.id);
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...s };
          } else {
            merged.push(s);
          }
        });
        broadcastCatalog(merged);
      }
    }
  }).catch(() => {});

  // 2. Real-time Supabase postgres_changes channel (singleton)
  try {
    globalSupaChannel = supabase
      .channel('public-products-live-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          notifyProductAdded(payload.new as Product);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          notifyProductUpdated(payload.new as Product);
        } else if (payload.eventType === 'DELETE' && payload.old) {
          notifyProductDeleted((payload.old as any).id);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Live Supabase stream active
        }
      });
  } catch (err) {
    console.warn('Supabase realtime channel init note:', err);
  }

  // 3. Firestore onSnapshot subscription (singleton)
  const prodsCol = collection(db, 'products');
  globalFirestoreUnsub = onSnapshot(prodsCol, (snapshot) => {
    if (snapshot.empty && inMemoryCatalog.length === 0) {
      seedProductsIfEmpty().then((seeded) => {
        broadcastCatalog(seeded);
      });
    } else if (!snapshot.empty) {
      const items: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as Product;
        const item = { id: doc.id, ...data };
        items.push(item);
      });
      broadcastCatalog(items);
    }
  }, (err) => {
    console.warn('Products live subscription error, fallback to initial items:', err);
    if (onError) onError(err);
    if (inMemoryCatalog.length === 0) {
      broadcastCatalog(INITIAL_PRODUCTS);
    }
  });
}

export function subscribeToProducts(
  onSuccess: (products: Product[]) => void, 
  onError?: (err: Error) => void
) {
  activeProductListeners.add(onSuccess);

  // If we already have items in memory, immediately provide them
  if (inMemoryCatalog.length > 0) {
    onSuccess(inMemoryCatalog);
  }

  // Initialize live sync singleton
  initGlobalProductSync(onError);

  return () => {
    activeProductListeners.delete(onSuccess);
  };
}

export async function addProductToFirestore(product: Omit<Product, 'id'>): Promise<string> {
  let docId = `prod-${Date.now()}`;
  try {
    const prodsCol = collection(db, 'products');
    const docRef = await addDoc(prodsCol, product);
    docId = docRef.id;
  } catch (err) {
    console.warn('Firestore addDoc fallback:', err);
  }

  const completeProd: Product = { id: docId, ...product };

  // 1. Reflect immediately on web page
  notifyProductAdded(completeProd);

  // 2. Save directly to Supabase database
  await saveProductToSupabase(completeProd).catch(e => console.warn('Supabase product add note:', e));

  return docId;
}

export async function updateProductInFirestore(id: string, updates: Partial<Product>, fullProduct?: Product) {
  try {
    const prodRef = doc(db, 'products', id);
    await updateDoc(prodRef, updates);
  } catch (err) {
    console.warn('Firestore updateDoc note:', err);
  }

  const payload: Product = fullProduct ? { ...fullProduct, ...updates, id } : ({ id, ...updates } as Product);

  // 1. Reflect immediately on web page
  notifyProductUpdated(payload);

  // 2. Upsert directly into Supabase database
  await saveProductToSupabase(payload).catch(e => console.warn('Supabase product update note:', e));
}

export async function deleteProductFromFirestore(id: string) {
  try {
    const prodRef = doc(db, 'products', id);
    await deleteDoc(prodRef);
  } catch (err) {
    console.warn('Firestore deleteDoc note:', err);
  }

  // 1. Reflect immediately on web page
  notifyProductDeleted(id);

  // 2. Delete directly from Supabase database
  await deleteProductFromSupabase(id).catch(e => console.warn('Supabase product delete note:', e));
}

// ----------------------------------------------------
// Orders Collection Firestore Helpers
// ----------------------------------------------------
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  // 1. Mandatory Supabase Authentication Check
  const { data: { user: supaAuthUser } } = await supabase.auth.getUser();
  if (!supaAuthUser) {
    throw new Error('Authentication required: You must be signed in with Supabase to place an order.');
  }

  const authenticatedUserId = supaAuthUser.id;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const nowIso = new Date().toISOString();

  const orderWithId: Order = {
    ...orderData,
    id: orderId,
    userId: authenticatedUserId,
    customerEmail: supaAuthUser.email || orderData.customerEmail,
    createdAt: nowIso,
    estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    driverName: 'Ramesh Patil',
    driverPhone: '+91 98230 45678',
    driverVehicle: 'SuperCart Electric Express (MH-12-EK-4040)'
  };

  // 2. Persist order directly to Supabase backend database first
  const supaSaved = await saveOrderToSupabase(orderWithId);
  if (!supaSaved) {
    console.warn('Supabase saveOrder attempt failed, but continuing with order pipeline');
  }

  // 3. Cache order locally for instant UI update
  try {
    const key = `supercart_orders_${authenticatedUserId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(orderWithId);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}

  // 4. Secondary Firestore sync (wrapped in try/catch so Firestore never blocks order flow)
  try {
    const ordersCol = collection(db, 'orders');
    await setDoc(doc(ordersCol, orderId), {
      ...orderWithId,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore backup order sync note:', err);
  }

  return orderId;
}

export function subscribeToUserOrders(userId: string, onUpdate: (orders: Order[]) => void) {
  // Check local cache first for instant response
  const getLocalOrders = (): Order[] => {
    try {
      const key = `supercart_orders_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const initialLocal = getLocalOrders();
  if (initialLocal.length > 0) {
    onUpdate(initialLocal);
  }

  // Also query Supabase backend directly for latest orders
  fetchOrdersFromSupabase(userId).then(supaOrders => {
    if (supaOrders && supaOrders.length > 0) {
      const current = getLocalOrders();
      const merged = [...supaOrders];
      current.forEach(c => {
        if (!merged.some(m => m.id === c.id)) {
          merged.push(c);
        }
      });
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(merged);
    }
  }).catch(() => {});

  const ordersCol = collection(db, 'orders');
  // Query for user's orders
  const q = query(ordersCol, where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as Order);
    });
    // Combine with any local orders not yet on server
    const local = getLocalOrders();
    const merged = [...list];
    local.forEach(loc => {
      if (!merged.some(m => m.id === loc.id)) {
        merged.push(loc);
      }
    });

    // Sort client-side by date descending
    merged.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    
    try {
      localStorage.setItem(`supercart_orders_${userId}`, JSON.stringify(merged));
    } catch {}

    onUpdate(merged);
  }, (err) => {
    console.warn('Orders snapshot error, returning local cache or empty:', err);
    onUpdate(getLocalOrders());
  });
}

// Global registry of all orders subscribers for instant synchronous updates
const allOrdersListeners = new Set<(orders: Order[]) => void>();
let cachedSupabaseOrders: Order[] = [];

export function subscribeToAllOrders(onUpdate: (orders: Order[]) => void) {
  allOrdersListeners.add(onUpdate);

  const broadcastMergedOrders = (firestoreOrders: Order[]) => {
    const merged = [...cachedSupabaseOrders];
    firestoreOrders.forEach(fo => {
      const idx = merged.findIndex(m => m.id === fo.id);
      if (idx !== -1) {
        // Supabase is single source of truth for status, timestamps, and customer info
        merged[idx] = { ...fo, ...merged[idx] };
      } else {
        merged.push(fo);
      }
    });

    merged.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    allOrdersListeners.forEach(fn => fn(merged));
  };

  // 1. If we already have cached Supabase orders, broadcast immediately
  if (cachedSupabaseOrders.length > 0) {
    onUpdate(cachedSupabaseOrders);
  }

  // 2. Fetch fresh orders from Supabase directly
  fetchOrdersFromSupabase().then(supaOrders => {
    if (supaOrders && supaOrders.length > 0) {
      cachedSupabaseOrders = supaOrders;
      broadcastMergedOrders([]);
    }
  }).catch(() => {});

  // 3. Subscribe to live Supabase postgres_changes for orders
  let channel: any = null;
  try {
    channel = supabase
      .channel('public-orders-live-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newOrder = payload.new as Order;
          const exists = cachedSupabaseOrders.some(o => o.id === newOrder.id);
          if (!exists) {
            cachedSupabaseOrders = [newOrder, ...cachedSupabaseOrders];
            broadcastMergedOrders([]);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedOrder = payload.new as Order;
          cachedSupabaseOrders = cachedSupabaseOrders.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
          broadcastMergedOrders([]);
        }
      })
      .subscribe();
  } catch (err) {
    console.warn('Supabase orders realtime channel note:', err);
  }

  const ordersCol = collection(db, 'orders');
  const firestoreUnsub = onSnapshot(ordersCol, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as Order);
    });
    broadcastMergedOrders(list);
  }, (err) => {
    console.warn('All orders snapshot error:', err);
    if (cachedSupabaseOrders.length > 0) {
      onUpdate(cachedSupabaseOrders);
    }
  });

  return () => {
    allOrdersListeners.delete(onUpdate);
    firestoreUnsub();
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus): Promise<boolean> {
  // 1. Update in Supabase FIRST and verify the database status
  const supaSuccess = await updateOrderStatusInSupabase(orderId, status);

  if (supaSuccess) {
    // Update cached Supabase orders in memory so immediate broadcasts reflect it
    cachedSupabaseOrders = cachedSupabaseOrders.map(o => 
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    // Broadcast immediately to all active admin listeners
    allOrdersListeners.forEach(fn => fn([...cachedSupabaseOrders]));
  }

  // 2. Update local storage caches immediately
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('supercart_orders_')) {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(stored)) {
          let modified = false;
          const updated = stored.map((o: Order) => {
            if (o.id === orderId) {
              modified = true;
              return { ...o, status, updatedAt: new Date().toISOString() };
            }
            return o;
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(updated));
          }
        }
      }
    }
  } catch (e) {}

  // 3. Update in Firestore if document exists (never throws or blocks if document is missing)
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (err) {
    console.info('Firestore updateDoc note (order is maintained in Supabase):', err);
  }

  return supaSuccess;
}

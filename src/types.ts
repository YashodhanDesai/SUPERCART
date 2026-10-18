export type UserRole = 'user' | 'admin';

export interface AddressDetails {
  formattedAddress: string;
  lat: number;
  lng: number;
  houseNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Address {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  uid?: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  phoneNumber?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  photoURL?: string | null;
  avatar?: string;
  address: string | null;
  deliveryCoords?: { lat: number; lng: number } | null;
  addressDetails?: AddressDetails | null;
  savedAddresses?: Address[];
  role: UserRole;
  createdAt: any;
  updatedAt?: any;
}

export interface ProductNutrition {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  keyVitamins?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  unit: string;
  image: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isFeatured?: boolean;
  organic?: boolean;
  season?: string;
  origin?: string;
  ingredients?: string[];
  nutrition?: ProductNutrition;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCoords?: { lat: number; lng: number };
  addressDetails?: AddressDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Credit / Debit Card' | 'UPI / Net Banking' | 'SuperCart Wallet';
  status: OrderStatus;
  createdAt: any; // Firestore Timestamp or ISO string
  estimatedDeliveryTime?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  notes?: string;
}

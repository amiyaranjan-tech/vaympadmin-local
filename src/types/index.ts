export interface Seller {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  gst: string;
  businessReg: string;
  logo: string;
  cover: string;
  status: "active" | "pending" | "suspended";
  shopStatus: "open" | "closed" | "opening_soon" | "closing_soon";
  workingDays: string[];
  workingHours: string;
  bank: { accountName: string; accountNumber: string; ifsc: string };
  revenue: number;
  orders: number;
  rating: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  gender: "men" | "women" | "unisex" | "kids";
  tags: string[];
  sellingPrice: number;
  costPrice: number;
  discount: number;
  discountPrice: number;
  sizes: { size: string; quantity: number }[];
  color: string;
  material: string;
  season: string;
  occasion: string;
  pattern: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  limitedStock: boolean;
  bogo: boolean;
  images: string[];
  video?: string;
  sellerId: string;
  createdAt: string;
  stock: number;
  sold: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  items: { productId: string; productName: string; qty: number; price: number }[];
  total: number;
  commission: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  timeline: { label: string; date: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  totalSpend: number;
  totalOrders: number;
  wishlist: string[];
  createdAt: string;
  status: "active" | "blocked";
}

export interface Deal {
  id: string;
  title: string;
  type: "flat" | "percentage" | "combo" | "bogo";
  discount: number;
  category: "deal" | "flash" | "festival";
  sellerId: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  banner: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  maxDiscount: number;
  minOrder: number;
  sellerId: string;
  category: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  used: number;
  banner: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner: string;
  startDate: string;
  endDate: string;
  location: string;
  sellerId: string;
  status: "upcoming" | "live" | "ended";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target: "platform" | "sellers" | "users" | "city";
  city?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  scheduledAt?: string;
  createdAt: string;
  status: "sent" | "scheduled" | "draft";
}

export interface Refund {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  sellerName: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  timeline: { label: string; date: string }[];
}

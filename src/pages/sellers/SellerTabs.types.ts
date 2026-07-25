// src/pages/sellers/SellerTabs.types.ts

import type { Seller } from "@/types/seller";
import type { Product } from "@/types/product";

export type { Product };

/**
 * ==========================================
 * Order
 * ==========================================
 */

export interface Order {
  _id: string;

  sellerId: string;

  orderNumber: string;

  total: number;

  status: string;

  customerName?: string;

  createdAt: string;
}

/**
 * ==========================================
 * Deal
 * ==========================================
 */

export interface Deal {
  _id: string;

  sellerId: string;

  title: string;

  discount: number;

  startDate?: string;
  endDate?: string;

  status?: string;
}

/**
 * ==========================================
 * Coupon
 * ==========================================
 */

export interface Coupon {
  _id: string;

  sellerId: string;

  code: string;

  discount: number;

  expiryDate?: string;

  status?: string;
}

/**
 * ==========================================
 * Event
 * ==========================================
 */

export interface Event {
  _id: string;

  sellerId: string;

  title: string;

  startDate?: string;

  endDate?: string;

  status?: string;
}

/**
 * ==========================================
 * Overview
 * ==========================================
 */

export interface OverviewTabProps {
  seller: Seller;
  shopProducts: Product[];
}

/**
 * ==========================================
 * Products
 * ==========================================
 */

export interface ProductsTabProps {
  seller: Seller;
  shopProducts: Product[];
  onDelete: (type: string) => void;
}

/**
 * ==========================================
 * Deals
 * ==========================================
 */

export interface DealsTabProps {
  seller: Seller;
  shopDeals: Deal[];
  onDelete: (type: string) => void;
}

/**
 * ==========================================
 * Coupons
 * ==========================================
 */

export interface CouponsTabProps {
  seller: Seller;
  shopCoupons: Coupon[];
  onDelete: (type: string) => void;
}

/**
 * ==========================================
 * Events
 * ==========================================
 */

export interface EventsTabProps {
  seller: Seller;
  shopEvents: Event[];
  onDelete: (type: string) => void;
}

/**
 * ==========================================
 * Revenue
 * ==========================================
 */

export interface RevenueTabProps {
  seller: Seller;
}

/**
 * ==========================================
 * Orders
 * ==========================================
 */

export interface OrdersTabProps {
  seller: Seller;
  shopOrders: Order[];
}

/**
 * ==========================================
 * Analytics
 * ==========================================
 */

export interface AnalyticsTabProps {
  seller: Seller;
}

/**
 * ==========================================
 * Parent Tabs
 * ==========================================
 */

export interface SellerTabsProps {
  seller: Seller;

  shopProducts: Product[];
  shopOrders: Order[];
  shopDeals: Deal[];
  shopCoupons: Coupon[];
  shopEvents: Event[];

  onDelete: (type: string) => void;
}

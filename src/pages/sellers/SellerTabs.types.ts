// src/pages/sellers/SellerTabs.types.ts

import type { Seller, SellerBrand } from "@/types/seller";
import type { Product } from "@/types/product";
import type { Offer } from "@/types/offer";

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
  brands: SellerBrand[];
  onBrandClick: (brand: string) => void;
}

/**
 * ==========================================
 * Products
 * ==========================================
 */

export interface ProductsTabProps {
  seller: Seller;
  shopProducts: Product[];
  onDeleteProduct: (id: string) => void;
  brandFilter: string | null;
  onClearBrandFilter: () => void;
}

/**
 * ==========================================
 * Deals
 * ==========================================
 */

export interface DealsTabProps {
  seller: Seller;
  shopDeals: Offer[];
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
  shopDeals: Offer[];
  shopEvents: Event[];

  brands: SellerBrand[];
  onBrandClick: (brand: string) => void;

  brandFilter: string | null;
  onClearBrandFilter: () => void;

  onDelete: (type: string) => void;
  onDeleteProduct: (id: string) => void;
}

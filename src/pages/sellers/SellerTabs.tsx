// src/pages/sellers/SellerTabs.tsx

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import DealsTab from "./DealsTab";
import CouponsTab from "./CouponsTab";
import EventsTab from "./EventsTab";
import RevenueTab from "./RevenueTab";
import OrdersTab from "./OrdersTab";
import AnalyticsTab from "./AnalyticsTab";

import type { SellerTabsProps } from "./SellerTabs.types";

export default function SellerTabs({
  seller,
  shopProducts,
  shopOrders,
  shopDeals,
  shopCoupons,
  shopEvents,
  onDelete,
}: SellerTabsProps) {
  return (
    <>
      {/* ==========================================
          Tab Navigation
      ========================================== */}

      <TabsList className="rounded-xl">
        <TabsTrigger value="overview">Overview</TabsTrigger>

        <TabsTrigger value="products">Products</TabsTrigger>

        <TabsTrigger value="deals">Deals</TabsTrigger>

        <TabsTrigger value="coupons">Coupons</TabsTrigger>

        <TabsTrigger value="events">Events</TabsTrigger>

        <TabsTrigger value="revenue">Revenue</TabsTrigger>

        <TabsTrigger value="orders">Orders</TabsTrigger>

        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* ==========================================
          Tab Contents
      ========================================== */}

      <OverviewTab seller={seller} shopProducts={shopProducts} />

      <ProductsTab
        seller={seller}
        shopProducts={shopProducts}
        onDelete={onDelete}
      />

      <DealsTab seller={seller} shopDeals={shopDeals} onDelete={onDelete} />

      <CouponsTab
        seller={seller}
        shopCoupons={shopCoupons}
        onDelete={onDelete}
      />

      <EventsTab seller={seller} shopEvents={shopEvents} onDelete={onDelete} />

      <RevenueTab seller={seller} />

      <OrdersTab seller={seller} shopOrders={shopOrders} />

      <AnalyticsTab seller={seller} />
    </>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import AuthProvider from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Orders from "@/pages/orders/Orders";
import Sellers from "@/pages/sellers/Sellers";
import SellerDetails from "@/pages/sellers/SellerDetails";
import SellerForm from "@/pages/sellers/SellerForm";
import Products from "@/pages/products/Products";
import ProductForm from "@/pages/products/ProductForm";
import ProductApprovals from "@/pages/products/ProductApprovals";
import Banners from "@/pages/marketing/banners/Banners";
import BannerForm from "@/pages/marketing/banners/BannerForm";
import CategoryBanners from "@/pages/marketing/category-banners/CategoryBanners";
import Deals from "@/pages/deals/Deals";
import BogoOfferForm from "@/pages/deals/BogoOfferForm";
import SpendThresholdOfferForm from "@/pages/deals/SpendThresholdOfferForm";
import TieredDealsForm from "@/pages/deals/TieredDealsForm";
import Events from "@/pages/events/Events";
import Users from "@/pages/users/Users";
import Notifications from "@/pages/notifications/Notifications";
import ShopStatus from "@/pages/shop-status/ShopStatus";
import Analytics from "@/pages/analytics/Analytics";
import Refunds from "@/pages/refunds/Refunds";
import Settings from "@/pages/settings/Settings";
import Profile from "@/pages/profile/Profile";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/orders" element={<Orders />} />

              <Route path="/sellers" element={<Sellers />} />

              <Route path="/sellers/new" element={<SellerForm />} />

              <Route path="/sellers/:id" element={<SellerDetails />} />

              <Route path="/sellers/:id/edit" element={<SellerForm />} />

              <Route path="/products" element={<Products />} />

              <Route path="/products/approvals" element={<ProductApprovals />} />

              <Route path="/products/new" element={<ProductForm />} />

              <Route path="/products/:id/edit" element={<ProductForm />} />

              <Route path="/marketing/banners" element={<Banners />} />

              <Route path="/marketing/banners/new" element={<BannerForm />} />

              <Route path="/marketing/banners/:id/edit" element={<BannerForm />} />

              <Route path="/category-banners" element={<CategoryBanners />} />

              <Route path="/deals" element={<Deals />} />

              <Route path="/deals/bogo/new" element={<BogoOfferForm />} />

              <Route path="/deals/bogo/:id/edit" element={<BogoOfferForm />} />

              <Route path="/deals/spend-threshold/new" element={<SpendThresholdOfferForm />} />

              <Route
                path="/deals/spend-threshold/:id/edit"
                element={<SpendThresholdOfferForm />}
              />

              <Route path="/deals/tiered/:sellerId" element={<TieredDealsForm />} />

              <Route path="/events" element={<Events />} />

              <Route path="/users" element={<Users />} />

              <Route path="/notifications" element={<Notifications />} />

              <Route path="/shop-status" element={<ShopStatus />} />

              <Route path="/analytics" element={<Analytics />} />

              <Route path="/refunds" element={<Refunds />} />

              <Route path="/settings" element={<Settings />} />

              <Route path="/profile" element={<Profile />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>

          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import MenuManagement from "@/pages/admin/MenuManagement";
import OrderManagement from "@/pages/admin/OrderManagement";
import Offers from "@/pages/admin/Offers";
import RestaurantSettings from "@/pages/admin/RestaurantSettings";
import AdminRiders from "@/pages/admin/Riders";
import UserManagement from "@/pages/admin/UserManagement";
import RiderHome from "@/pages/rider/RiderHome";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          role === "admin" ? <Navigate to="/admin" /> :
          role === "rider" ? <Navigate to="/rider" /> :
          <Landing />
        } />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />

        {/* Admin routes — auth-gated */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="offers" element={<Offers />} />
          <Route path="riders" element={<AdminRiders />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<RestaurantSettings />} />
        </Route>

        {/* Rider routes — auth-gated */}
        <Route path="/rider" element={<ProtectedRoute requiredRole="rider"><RiderHome /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

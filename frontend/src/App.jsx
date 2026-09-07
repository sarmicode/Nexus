import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ListingDetail from './pages/ListingDetail';
import Catalog from './pages/Catalog';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ListingForm from './pages/farmer/ListingForm';
import FarmerAnalytics from './pages/analytics/FarmerAnalytics';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import MarketPrices from './pages/market/MarketPrices';
import OrdersPage from './pages/orders/OrdersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MandiMap from './pages/maps/MandiMap';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Public catalog & listing detail */}
        <Route path="catalog" element={<Catalog />} />
        <Route path="listings/:id" element={<ListingDetail />} />

        {/* Market intelligence (public) */}
        <Route path="market" element={<MarketPrices />} />
        <Route path="map" element={<MandiMap />} />

        {/* Farmer routes */}
        <Route
          path="farmer"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['farmer']}>
                <FarmerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/analytics"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['farmer']}>
                <FarmerAnalytics />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/listings/new"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['farmer']}>
                <ListingForm />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/listings/:id/edit"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['farmer']}>
                <ListingForm />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Buyer routes */}
        <Route
          path="buyer"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['buyer']}>
                <BuyerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Shared authenticated routes */}
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

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
import BuyerDashboard from './pages/buyer/BuyerDashboard';
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
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="catalog" element={<Catalog />} />
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

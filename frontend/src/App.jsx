import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ListingDetail from './pages/ListingDetail';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ListingForm from './pages/farmer/ListingForm';
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

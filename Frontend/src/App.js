import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout';

// Pages - Landing
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages - Customer
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerHomePage from './pages/CustomerHomePage';
import HomePage from './pages/HomePage';
import PetsListPage from './pages/PetsListPage';
import PetDetailPage from './pages/PetDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import AdoptionFormPage from './pages/AdoptionFormPage';
import NearbySheltersPage from './pages/NearbySheltersPage';

// Pages - Admin
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredToken }) => {
  const token = localStorage.getItem(requiredToken);
  return token ? children : <Navigate to="/" />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
          <Route
            path="/customer/home"
            element={
              <ProtectedRoute requiredToken="customerToken">
                <CustomerHomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/customer/profile" element={<ProtectedRoute requiredToken="customerToken"><UserProfilePage /></ProtectedRoute>} />
          <Route path="/pets" element={<Layout><PetsListPage /></Layout>} />
          <Route path="/pets/:id" element={<Layout><PetDetailPage /></Layout>} />
          <Route path="/adopt/:petId" element={<Layout><AdoptionFormPage /></Layout>} />
          <Route path="/shelters" element={<ProtectedRoute requiredToken="customerToken"><NearbySheltersPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredToken="adminToken">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy Routes */}
          <Route path="/home" element={<Layout><HomePage /></Layout>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;

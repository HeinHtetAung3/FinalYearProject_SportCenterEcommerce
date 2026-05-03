import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AdminChatPage from './pages/AdminChatPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import CustomerSupportChatPage from './pages/CustomerSupportChatPage';
import AdminRoute from './components/auth/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { UIProvider } from './context/UIContext';
import MiniCartDrawer from './components/cart/MiniCartDrawer';
import AddedToBagModal from './components/cart/AddedToBagModal';

function App() {
  const withCustomerLayout = (element) => <AppLayout>{element}</AppLayout>;
  const withAdminLayout = (element) => <AdminLayout>{element}</AdminLayout>;

  return (
    <ErrorBoundary>
      <UIProvider>
        <Routes>
          <Route path="/" element={withCustomerLayout(<HomePage />)} />
          <Route path="/products" element={withCustomerLayout(<ProductsPage />)} />
          <Route path="/products/:productId" element={withCustomerLayout(<ProductDetailPage />)} />
          <Route path="/cart" element={withCustomerLayout(<CartPage />)} />
          <Route path="/checkout" element={withCustomerLayout(<CheckoutPage />)} />
          <Route path="/orders/success/:orderId" element={withCustomerLayout(<OrderSuccessPage />)} />
          <Route path="/orders" element={withCustomerLayout(<OrdersPage />)} />
          <Route path="/orders/:orderId" element={withCustomerLayout(<OrdersPage />)} />
          <Route path="/wishlist" element={withCustomerLayout(<WishlistPage />)} />
          <Route path="/profile" element={withCustomerLayout(<Navigate to="/settings?tab=profile" replace />)} />
          <Route
            path="/settings"
            element={withCustomerLayout(
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/support/chat"
            element={withCustomerLayout(
              <ProtectedRoute>
                <CustomerSupportChatPage />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/admin"
            element={withAdminLayout(
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/chat"
            element={withAdminLayout(
              <AdminRoute>
                <AdminChatPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/settings"
            element={withAdminLayout(
              <AdminRoute>
                <AdminSettingsPage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/profile"
            element={withAdminLayout(
              <AdminRoute>
                <AdminProfilePage />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/account"
            element={withAdminLayout(
              <AdminRoute>
                <SettingsPage variant="admin" />
              </AdminRoute>
            )}
          />

          <Route path="/login" element={withCustomerLayout(<LoginPage />)} />
          <Route path="/forgot-password" element={withCustomerLayout(<ForgotPasswordPage />)} />
          <Route path="/terms" element={withCustomerLayout(<TermsPage />)} />
          <Route path="/privacy" element={withCustomerLayout(<PrivacyPage />)} />
          <Route path="/about" element={withCustomerLayout(<AboutPage />)} />
          <Route path="/contact" element={withCustomerLayout(<ContactPage />)} />
          <Route path="*" element={withCustomerLayout(<NotFoundPage />)} />
        </Routes>
        <MiniCartDrawer />
        <AddedToBagModal />
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;

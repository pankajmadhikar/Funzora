import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Box, Button, Container, Typography, useMediaQuery, useTheme, ThemeProvider } from '@mui/material';
import { theme as appTheme } from './theme/index';
import AuthProvider from './components/auth/AuthProvider';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import Cart from './components/user/Cart';
import ProductDetails from './components/user/ProductDetails';
import Profile from './components/user/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import AddProduct from './components/admin/AddProduct';
import ManageProducts from './components/admin/ManageProducts';
import Orders from './components/admin/Orders';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import Categories from './components/Categories';
import ShopPage from './components/storefront/ShopPage';
import CheckoutFlow from './components/storefront/CheckoutFlow';
import OrderSuccessPage from './components/storefront/OrderSuccessPage';
import WishlistPage from './components/storefront/WishlistPage';
import AppSidebar, { getSidebarWidthPx } from './components/layout/AppSidebar';
import AppTopBar from './components/layout/AppTopBar';
import AccountUserMenu from './components/layout/AccountUserMenu';
import SpecialOfferPopup from './components/layout/SpecialOfferPopup';
import { useSelector } from 'react-redux';

const SIDEBAR_LS_KEY = 'funzo-sidebar-expanded';

function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const [sideOpen, setSideOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_LS_KEY);
      return raw === null ? true : raw === 'true';
    } catch { return true; }
  });
  const [accountMenu, setAccountMenu] = useState(null);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_LS_KEY, String(next)); } catch {}
      return next;
    });
  };

  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const isValidUser = user && typeof user === 'object';
  const userRole = isValidUser ? user.role || 'user' : 'user';

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showChrome = isAuthenticated && isValidUser && !isAuthPage;

  return (
    <Box className="bb-root" sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)' }}>
      {showChrome && (
        <AppSidebar
          open={sideOpen}
          onClose={() => setSideOpen(false)}
          role={userRole}
          expanded={sidebarExpanded}
          onToggleExpanded={toggleSidebar}
          onAccountMenuOpen={(e) => setAccountMenu({ anchorEl: e.currentTarget, source: 'sidebar' })}
        />
      )}

      <Box
        sx={{
          ml: showChrome && isDesktop ? `${getSidebarWidthPx(sidebarExpanded)}px` : 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {showChrome && (
          <AppTopBar
            onMenuClick={() => setSideOpen(true)}
            showMenuButton={!isDesktop}
            onAccountMenuOpen={(e) => setAccountMenu({ anchorEl: e.currentTarget, source: 'header' })}
          />
        )}

        {showChrome && (
          <AccountUserMenu
            anchorState={accountMenu}
            onClose={() => setAccountMenu(null)}
            afterNavigate={() => {
              if (!isDesktop) setSideOpen(false);
            }}
          />
        )}

        {/* No flex-grow: avoids a tall empty band inside main above the footer */}
        <Box component="main" sx={{ flex: '0 1 auto', width: '100%' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute requiredRole="user" />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckoutFlow />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin">
                <Route index element={<AdminDashboard />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="manage-products" element={<ManageProducts />} />
                <Route path="orders" element={<Orders />} />
              </Route>
            </Route>

            <Route
              path="*"
              element={
                <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                  <Typography className="bb-head" sx={{ fontSize: 72, color: '#FF6B35', mb: 1 }}>
                    404
                  </Typography>
                  <Typography sx={{ mb: 3, color: '#666' }}>This page is off playing hide and seek.</Typography>
                  <Button component={Link} to="/" variant="contained" sx={{ bgcolor: '#FF6B35', textTransform: 'none', fontWeight: 800 }}>
                    Home
                  </Button>
                </Container>
              }
            />
          </Routes>
        </Box>

        {showChrome && <Footer />}

        {showChrome && userRole !== 'admin' && (
          <SpecialOfferPopup insetLeftPx={isDesktop ? getSidebarWidthPx(sidebarExpanded) : 0} />
        )}
      </Box>

      <Toaster position="top-center" />
    </Box>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <ErrorBoundary>
          <AuthProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

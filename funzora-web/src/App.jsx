import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import AuthProvider from './components/auth/AuthProvider';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <AuthProvider>
            <BrowserRouter>
              <div className="App">
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 130px)', padding: '20px' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* User-only Routes */}
                    <Route element={<ProtectedRoute requiredRole="user" />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/cart" element={<Cart />} />
                    </Route>

                    {/* Admin-only Routes */}
                    <Route element={<ProtectedRoute requiredRole="admin" />}>
                      <Route path="/admin">
                        <Route index element={<AdminDashboard />} />
                        <Route path="add-product" element={<AddProduct />} />
                        <Route path="manage-products" element={<ManageProducts />} />
                        <Route path="orders" element={<Orders />} />
                      </Route>
                    </Route>


                    {/* 404 Route */}
                    <Route path="*" element={
                      <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                      </div>
                    } />
                  </Routes>
                </main>
                <Footer />
                <Toaster position="top-right" />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
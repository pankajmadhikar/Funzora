import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { apiService } from '../../services/apiService';
import { formatPrice } from '../../utils/formatPrice';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'orders', icon: '📦', label: 'My Orders' },
  { id: 'settings', icon: '⚙', label: 'Account Settings' },
];

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserOrders();
        setOrders(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return { background: '#EAFAF1', color: 'var(--color-success)', border: '1px solid #D5F5E3' };
    if (s === 'cancelled') return { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' };
    return { background: '#FEF9EC', color: 'var(--color-warning)', border: '1px solid #FDE68A' };
  };

  const initials = `${(user?.firstname || user?.name || 'U')[0]}${(user?.lastname || '')[0] || ''}`.toUpperCase();
  const displayName = user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : (user?.name || 'User');
  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="bb-page">
      <h1 className="text-title bb-head" style={{ marginBottom: 'var(--space-xl)' }}>My Account</h1>

      <div className="profile-grid">
        {/* Left sidebar */}
        <div className="profile-sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div className="profile-avatar">{initials}</div>
            <div className="text-heading" style={{ fontSize: 'var(--font-size-md)', marginTop: 'var(--space-md)' }}>{displayName}</div>
            <div className="text-label" style={{ marginTop: 2 }}>{user?.email || ''}</div>
            {user?.phone && <div className="text-label" style={{ marginTop: 2 }}>{user.phone}</div>}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
            {/* Desktop nav */}
            <div className="profile-nav-desktop">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`profile-nav-item${activeTab === item.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button className="profile-nav-item profile-nav-item--danger" onClick={handleLogout}>
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav strip */}
        <div className="profile-nav-mobile">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`profile-nav-mobile-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="profile-content">
          {activeTab === 'orders' && (
            <div>
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>Order History</h2>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                  <CircularProgress sx={{ color: 'var(--color-primary)' }} />
                </div>
              ) : error || orders.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📦</span>
                  <span className="empty-state-title">{error ? 'Could not load orders' : 'No orders yet'}</span>
                  <span className="empty-state-sub">
                    {error ? 'Please try again later.' : 'Your placed orders will appear here'}
                  </span>
                  <button className="btn btn--primary" onClick={() => navigate('/shop')}>Start Shopping →</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <span className="text-label">ORDER ID</span>
                          <span className="text-heading" style={{ display: 'block', marginTop: 2 }}>
                            #{String(order._id).slice(-8)}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="text-label">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="order-status-badge" style={getStatusStyle(order.status)}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="order-card-items">
                        {order.items?.map((it, idx) => (
                          <span key={it._id || idx} className="text-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {it.product?.name || 'Item'}{idx < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span className="text-price" style={{ fontSize: 'var(--font-size-md)' }}>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="bb-head" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>Account Settings</h2>

              <div className="account-info-grid">
                <div className="account-info-item">
                  <div className="account-info-label">Account Type</div>
                  <div className="account-info-value">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Member Since</div>
                  <div className="account-info-value">{memberSince}</div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Email</div>
                  <div className="account-info-value">{user?.email || '—'}</div>
                </div>
                <div className="account-info-item">
                  <div className="account-info-label">Phone</div>
                  <div className="account-info-value">{user?.phone || '—'}</div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-xl)' }}>
                <button className="btn btn--outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

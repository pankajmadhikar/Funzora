import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { formatPrice } from '../../utils/formatPrice';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import { AccountLayout, AccountTabs, InfoCard, ProfileCard } from '../account';
import { ICON_STROKE } from '../../constants/appIconTokens';

const ACCOUNT_TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'info', label: 'Account info' },
  { id: 'addresses', label: 'Addresses' },
];

function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') {
    return {
      background: 'var(--color-primary-soft)',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary-light)',
    };
  }
  if (s === 'cancelled') {
    return { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' };
  }
  return {
    background: 'var(--color-ui-bg-muted)',
    color: 'var(--color-ui-body)',
    border: '1px solid var(--color-ui-border)',
  };
}

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('orders');

  const loadOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };

  const onEditField = (field) => {
    toast(`Editing ${field} is coming soon.`);
  };

  const onEditProfile = () => {
    toast('Profile editor is coming soon.');
  };

  const initials = `${(user?.firstname || user?.name || 'U')[0]}${(user?.lastname || '')[0] || ''}`.toUpperCase();
  const displayName = user?.firstname
    ? `${user.firstname} ${user.lastname || ''}`.trim()
    : (user?.name || 'User');
  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
  const accountType = user?.role === 'admin' ? 'Administrator' : 'Customer';

  return (
    <AccountLayout
      title="My Account"
      sidebar={
        <div className="flex flex-col gap-4">
          <ProfileCard
            initials={initials}
            name={displayName}
            email={user?.email || ''}
            onEditProfile={onEditProfile}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-[var(--color-ui-border)] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <AccountTabs tabs={ACCOUNT_TABS} value={tab} onChange={setTab} />

        {tab === 'orders' && (
          <section aria-labelledby="orders-heading">
            <h2 id="orders-heading" className="text-lg font-medium text-[var(--color-ui-heading)]">
              Order history
            </h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={40} strokeWidth={ICON_STROKE} className="animate-spin text-[var(--color-primary)]" aria-hidden />
                <span className="sr-only">Loading orders</span>
              </div>
            ) : error || orders.length === 0 ? (
              <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-[var(--color-ui-border)] bg-[var(--color-ui-bg-muted)] px-6 py-14 text-center transition-shadow duration-200 hover:shadow-sm">
                <Package size={48} strokeWidth={ICON_STROKE} className="text-gray-300" aria-hidden />
                <p className="mt-4 text-base font-semibold text-[var(--color-ui-heading)]">
                  {error ? 'Could not load orders' : 'No orders yet'}
                </p>
                <p className="mt-2 max-w-sm text-sm text-[var(--color-ui-body)]">
                  {error ? 'Please try again later.' : 'Your placed orders will appear here.'}
                </p>
                <button
                  type="button"
                  className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--color-primary-hover)]"
                  onClick={() => navigate('/shop')}
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <ul className="mt-6 flex flex-col gap-4">
                {orders.map((order) => (
                  <li key={order._id}>
                    <article className="order-card transition-shadow duration-200 hover:shadow-md">
                      <div className="order-card-header">
                        <div>
                          <span className="text-label">Order ID</span>
                          <span className="text-heading mt-0.5 block text-[var(--color-ui-heading)]">
                            #{String(order._id).slice(-8)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-label">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="order-status-badge mt-1 inline-block rounded-lg px-2 py-0.5 text-xs font-semibold capitalize" style={getStatusStyle(order.status)}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="order-card-items text-[var(--color-ui-body)]">
                        {order.items?.map((it, idx) => (
                          <span key={it._id || idx} className="text-sm">
                            {it.product?.name || 'Item'}
                            {idx < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span className="text-lg font-semibold text-[var(--color-primary)]">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'info' && (
          <section aria-labelledby="account-info-heading">
            <h2 id="account-info-heading" className="text-lg font-medium text-[var(--color-ui-heading)]">
              Account info
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard label="Account type" value={accountType} onEdit={() => onEditField('account type')} />
              <InfoCard label="Email" value={user?.email} onEdit={() => onEditField('email')} />
              <InfoCard label="Phone" value={user?.phone || '—'} onEdit={() => onEditField('phone')} />
              <InfoCard label="Member since" value={memberSince} />
            </div>
            <div className="mt-10 border-t border-[var(--color-ui-border)] pt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors duration-200 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </section>
        )}

        {tab === 'addresses' && (
          <section className="rounded-xl border border-dashed border-[var(--color-ui-border)] bg-[var(--color-ui-bg-muted)] px-6 py-14 text-center">
            <p className="text-base font-medium text-[var(--color-ui-heading)]">Addresses</p>
            <p className="mt-2 text-sm text-[var(--color-ui-body)]">Saved addresses will appear here soon.</p>
          </section>
        )}
      </div>
    </AccountLayout>
  );
}

export default Profile;

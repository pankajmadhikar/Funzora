import React from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';

/**
 * Admin account menu — anchored from sidebar Account (JWT admins only).
 * @param {{ anchorEl: HTMLElement, source: 'header' | 'sidebar' } | null} anchorState
 */
export default function AccountUserMenu({ anchorState, onClose, afterNavigate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isValidUser = user && typeof user === 'object';
  const userRole = isValidUser ? user.role || 'user' : 'user';

  const fromSidebar = anchorState?.source === 'sidebar';

  if (!isValidUser || userRole !== 'admin') return null;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    onClose();
    afterNavigate?.();
    navigate('/login');
  };

  const goDashboard = () => {
    navigate('/admin');
    onClose();
    afterNavigate?.();
  };

  const itemIcon = (Icon) => (
    <Icon size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="text-neutral-400 shrink-0" aria-hidden />
  );

  return (
    <Menu
      anchorEl={anchorState?.anchorEl ?? null}
      open={Boolean(anchorState?.anchorEl)}
      onClose={onClose}
      anchorOrigin={
        fromSidebar
          ? { vertical: 'top', horizontal: 'center' }
          : { vertical: 'bottom', horizontal: 'right' }
      }
      transformOrigin={
        fromSidebar
          ? { vertical: 'bottom', horizontal: 'center' }
          : { vertical: 'top', horizontal: 'right' }
      }
      slotProps={{
        paper: {
          sx: {
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 220,
            mt: fromSidebar ? 0 : 1,
            mb: fromSidebar ? 0.5 : 0,
          },
        },
      }}
      disableScrollLock
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>Admin</div>
        <div style={{ fontSize: 12, color: '#999' }}>{user.email || ''}</div>
      </div>
      <MenuItem onClick={goDashboard} sx={{ fontSize: 14, fontWeight: 600, py: 1.25, gap: 1.25, display: 'flex', alignItems: 'center' }}>
        {itemIcon(LayoutDashboard)}
        Dashboard
      </MenuItem>
      <Divider sx={{ my: 0.5 }} />
      <MenuItem onClick={handleLogout} sx={{ fontSize: 14, fontWeight: 600, py: 1.25, gap: 1.25, display: 'flex', alignItems: 'center', color: '#EF4444' }}>
        <LogOut size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="shrink-0 text-red-500" aria-hidden />
        Log out
      </MenuItem>
    </Menu>
  );
}

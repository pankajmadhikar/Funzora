import React from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import { PersonRounded, LogoutRounded, ListAltRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

/**
 * Shared account dropdown — anchored from header Account or sidebar Account.
 * @param {{ anchorEl: HTMLElement, source: 'header' | 'sidebar' } | null} anchorState
 */
export default function AccountUserMenu({ anchorState, onClose, afterNavigate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isValidUser = user && typeof user === 'object';
  const userRole = isValidUser ? user.role || 'user' : 'user';

  const fromSidebar = anchorState?.source === 'sidebar';

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    onClose();
    afterNavigate?.();
    navigate('/login');
  };

  const goProfile = () => {
    navigate('/profile');
    onClose();
    afterNavigate?.();
  };

  if (!isValidUser) return null;

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
        <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>
          {user.firstname || user.name || 'User'}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>{user.email || ''}</div>
      </div>
      <MenuItem onClick={goProfile} sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}>
        <PersonRounded sx={{ mr: 1.25, fontSize: 18, color: '#888' }} /> Profile
      </MenuItem>
      {userRole !== 'admin' && (
        <MenuItem onClick={goProfile} sx={{ fontSize: 14, fontWeight: 600, py: 1.25 }}>
          <ListAltRounded sx={{ mr: 1.25, fontSize: 18, color: '#888' }} /> My orders
        </MenuItem>
      )}
      <Divider sx={{ my: 0.5 }} />
      <MenuItem onClick={handleLogout} sx={{ fontSize: 14, fontWeight: 600, py: 1.25, color: '#EF4444' }}>
        <LogoutRounded sx={{ mr: 1.25, fontSize: 18 }} /> Logout
      </MenuItem>
    </Menu>
  );
}

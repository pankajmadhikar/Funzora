import React from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './AppSidebar.css';

export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 68;
export const SIDEBAR_WIDTH = SIDEBAR_EXPANDED;
export const SIDEBAR_COLLAPSED_W = SIDEBAR_COLLAPSED;
export const SIDEBAR_EXPANDED_W = SIDEBAR_EXPANDED;

export function getSidebarWidthPx(expanded) {
  return expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
}

const USER_NAV = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { id: 'shop', label: 'Shop by Category', icon: '📊', path: '/shop' },
  { id: 'soft', label: 'Soft Toys', icon: '🧸', path: '/shop?cat=collect' },
  { id: 'wooden', label: 'Wooden Toys', icon: '🌲', path: '/shop?cat=outdoor' },
  { id: 'edu', label: 'Educational Toys', icon: '🎓', path: '/shop?cat=learning' },
  { id: 'puzzles', label: 'Puzzles & Games', icon: '🧩', path: '/shop?cat=puzzles' },
  { id: 'new', label: 'New Arrivals', icon: '🆕', path: '/shop?sort=new' },
  { id: 'best', label: 'Best Sellers', icon: '⭐', path: '/shop?sort=hot' },
  { id: 'offers', label: 'Offers', icon: '🏷️', path: '/shop?sort=disc' },
];

const ADMIN_NAV = [
  { id: 'dash', label: 'Dashboard', icon: '📊', path: '/admin' },
  { id: 'add', label: 'Add Product', icon: '➕', path: '/admin/add-product' },
  { id: 'manage', label: 'Products', icon: '📦', path: '/admin/manage-products' },
  { id: 'orders', label: 'Orders', icon: '🧾', path: '/admin/orders' },
];

function isActive(item, pathname, search) {
  if (!item.path) return false;
  const [p, q] = item.path.split('?');
  if (p === '/' && pathname === '/') return true;
  if (p === '/' && pathname !== '/') return false;
  if (q) return pathname === p && search.includes(q);
  return pathname.startsWith(p) && p !== '/';
}

function SidebarContent({ role, onNav, pathname, search, expanded, onToggle, onAccountMenuOpen }) {
  const items = role === 'admin' ? ADMIN_NAV : USER_NAV;

  return (
    <div className={`fz-sidebar${expanded ? '' : ' collapsed'}`}>
      <div className="fz-sidebar-top">
        <button
          type="button"
          className="fz-sidebar-hamburger"
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span /><span /><span />
        </button>
      </div>

      <nav className="fz-sidebar-nav">
        {items.map((item) => {
          const active = isActive(item, pathname, search);
          return (
            <button
              type="button"
              key={item.id}
              className={`fz-sidebar-item${active ? ' active' : ''}`}
              onClick={() => onNav(item.path)}
              title={expanded ? undefined : item.label}
            >
              <span className="fz-sidebar-icon">{item.icon}</span>
              {expanded && <span className="fz-sidebar-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="fz-sidebar-bottom">
        <button
          type="button"
          className="fz-sidebar-account"
          onClick={(e) => onAccountMenuOpen?.(e)}
          aria-haspopup="menu"
          title={expanded ? undefined : 'Account'}
        >
          <span className="fz-sidebar-icon" aria-hidden="true">👤</span>
          {expanded && <span className="fz-sidebar-label">Account</span>}
        </button>
      </div>
    </div>
  );
}

export default function AppSidebar({ open, onClose, role = 'user', expanded = true, onToggleExpanded, onAccountMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleNav = (path) => {
    navigate(path);
    if (!isDesktop) onClose?.();
  };

  if (isDesktop) {
    return (
      <aside
        className={`fz-sidebar-fixed${expanded ? '' : ' fz-sidebar-fixed--collapsed'}`}
        style={{ width: expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
      >
        <SidebarContent
          role={role}
          onNav={handleNav}
          pathname={location.pathname}
          search={location.search}
          expanded={expanded}
          onToggle={onToggleExpanded}
          onAccountMenuOpen={onAccountMenuOpen}
        />
      </aside>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 280, border: 'none', boxShadow: '4px 0 32px rgba(0,0,0,0.08)' } }}
      ModalProps={{ keepMounted: true }}
    >
      <SidebarContent
        role={role}
        onNav={handleNav}
        pathname={location.pathname}
        search={location.search}
        expanded={true}
        onToggle={onClose}
        onAccountMenuOpen={onAccountMenuOpen}
      />
    </Drawer>
  );
}

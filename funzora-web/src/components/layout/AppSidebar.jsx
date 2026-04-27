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

function SidebarContent({ role, onNav, pathname, search, expanded, onToggle }) {
  const items = role === 'admin' ? ADMIN_NAV : USER_NAV;

  return (
    <div className={`fz-sidebar${expanded ? '' : ' collapsed'}`}>
      <div className="fz-sidebar-top">
        <button
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

      {role !== 'admin' && expanded && (
        <div className="fz-sidebar-promo">
          <div className="fz-sidebar-promo-icon">🎁</div>
          <h3 className="fz-sidebar-promo-title">Special Offers!</h3>
          <p className="fz-sidebar-promo-desc">Grab exciting deals on your favorite toys</p>
          <button className="fz-sidebar-promo-btn" onClick={() => onNav('/shop?sort=disc')}>
            View Offers →
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppSidebar({ open, onClose, role = 'user', expanded = true, onToggleExpanded }) {
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
      />
    </Drawer>
  );
}

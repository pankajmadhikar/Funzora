import React from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';
import {
  Home,
  LayoutGrid,
  Package,
  TreePine,
  GraduationCap,
  Puzzle,
  Sparkles,
  Star,
  Tag,
  User,
  Menu,
  LayoutDashboard,
  Plus,
  Box,
  ClipboardList,
} from 'lucide-react';

export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 72;
export const SIDEBAR_WIDTH = SIDEBAR_EXPANDED;
export const SIDEBAR_COLLAPSED_W = SIDEBAR_COLLAPSED;
export const SIDEBAR_EXPANDED_W = SIDEBAR_EXPANDED;

export function getSidebarWidthPx(expanded) {
  return expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
}

const USER_MENU_PRIMARY = [
  { id: 'home', name: 'Home', path: '/', icon: Home },
  { id: 'shop', name: 'Shop', path: '/shop', icon: LayoutGrid },
];

const USER_MENU_CATEGORIES = [
  { id: 'soft', name: 'Soft Toys', path: '/shop?cat=collect', icon: Package },
  { id: 'wooden', name: 'Wooden Toys', path: '/shop?cat=outdoor', icon: TreePine },
  { id: 'edu', name: 'Educational', path: '/shop?cat=learning', icon: GraduationCap },
  { id: 'puzzles', name: 'Puzzles', path: '/shop?cat=puzzles', icon: Puzzle },
];

const USER_MENU_SECONDARY = [
  { id: 'new', name: 'New Arrivals', path: '/shop?sort=new', icon: Sparkles },
  { id: 'best', name: 'Best Sellers', path: '/shop?sort=hot', icon: Star },
  { id: 'offers', name: 'Offers', path: '/shop?sort=disc', icon: Tag },
];

const ADMIN_MENU = [
  { id: 'dash', name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'add', name: 'Add Product', path: '/admin/add-product', icon: Plus },
  { id: 'manage', name: 'Products', path: '/admin/manage-products', icon: Box },
  { id: 'orders', name: 'Orders', path: '/admin/orders', icon: ClipboardList },
];

function isRouteActive(item, pathname, search) {
  if (!item.path) return false;
  const [p, q] = item.path.split('?');
  if (p === '/' && pathname === '/') return true;
  if (p === '/' && pathname !== '/') return false;
  if (q) return pathname === p && search.includes(q);
  return pathname.startsWith(p) && p !== '/';
}

function NavDivider({ expanded }) {
  if (!expanded) {
    return <div className="mx-auto my-2 h-px w-8 rounded-full bg-neutral-200/90" role="separator" />;
  }
  return <div className="my-3 h-px w-full bg-neutral-200/80" role="separator" />;
}

function NavItem({ item, active, expanded, onNavigate }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.path)}
      title={!expanded ? item.name : undefined}
      className={[
        'group relative flex w-full items-center rounded-xl text-left text-[13px] font-semibold transition-all duration-200',
        expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
        active
          ? 'bg-gradient-to-r from-orange-50/95 to-rose-50/95 font-bold text-orange-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-orange-500'
          : 'text-neutral-800 hover:bg-neutral-100/90 hover:text-neutral-900',
      ].join(' ')}
    >
      <Icon
        size={ICON_SIZES.md}
        strokeWidth={active ? 2.25 : ICON_STROKE}
        className={[
          'shrink-0 transition-colors',
          active ? 'text-orange-500' : 'text-neutral-400 group-hover:text-neutral-600',
        ].join(' ')}
        aria-hidden
      />
      {expanded && <span className="min-w-0 truncate">{item.name}</span>}
    </button>
  );
}

function UserNavGroups({ pathname, search, expanded, onNavigate }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        {USER_MENU_PRIMARY.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            expanded={expanded}
            onNavigate={onNavigate}
            active={isRouteActive(item, pathname, search)}
          />
        ))}
      </div>

      <NavDivider expanded={expanded} />

      <div className="flex flex-col gap-1">
        {USER_MENU_CATEGORIES.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            expanded={expanded}
            onNavigate={onNavigate}
            active={isRouteActive(item, pathname, search)}
          />
        ))}
      </div>

      <NavDivider expanded={expanded} />

      <div className="flex flex-col gap-1">
        {USER_MENU_SECONDARY.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            expanded={expanded}
            onNavigate={onNavigate}
            active={isRouteActive(item, pathname, search)}
          />
        ))}
      </div>
    </>
  );
}

function AdminNavList({ pathname, search, expanded, onNavigate }) {
  return (
    <div className="flex flex-col gap-1">
      {ADMIN_MENU.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          expanded={expanded}
          onNavigate={onNavigate}
          active={isRouteActive(item, pathname, search)}
        />
      ))}
    </div>
  );
}

function SidebarContent({ role, onNav, pathname, search, expanded, onToggle, onAccountMenuOpen }) {
  const isAdmin = role === 'admin';

  return (
    <div
      className={[
        'flex h-full min-h-0 w-full flex-col border-r border-neutral-200/80 bg-white',
        expanded ? 'px-3 pb-3 pt-3' : 'items-center px-2 pb-3 pt-3',
      ].join(' ')}
    >
      <div className={expanded ? 'mb-4 flex shrink-0' : 'mb-3 flex shrink-0 justify-center'}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a6a] to-[#f06292] text-white shadow-[0_2px_10px_rgba(240,98,146,0.32)] transition hover:brightness-[1.03] active:scale-[0.98]"
        >
          <Menu size={ICON_SIZES.lg} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {isAdmin ? (
          <AdminNavList pathname={pathname} search={search} expanded={expanded} onNavigate={onNav} />
        ) : (
          <UserNavGroups pathname={pathname} search={search} expanded={expanded} onNavigate={onNav} />
        )}
      </nav>

      <div className="mt-auto shrink-0 border-t border-neutral-200/80 pt-3">
        <button
          type="button"
          onClick={(e) => onAccountMenuOpen?.(e)}
          aria-haspopup="menu"
          title={expanded ? undefined : 'Account'}
          className={[
            'group flex w-full items-center rounded-xl border border-neutral-200/70 bg-white text-left text-[13px] font-bold text-neutral-700 transition hover:border-orange-200/80 hover:bg-white hover:text-orange-700',
            expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
          ].join(' ')}
        >
          <User size={ICON_SIZES.md} strokeWidth={ICON_STROKE} className="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden />
          {expanded && <span>Account</span>}
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
        className="fixed left-0 top-0 z-[200] h-screen overflow-hidden bg-white transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
      PaperProps={{
        className: 'border-0 shadow-[4px_0_32px_rgba(0,0,0,0.08)]',
        sx: { width: 280, maxWidth: '100vw', backgroundColor: '#ffffff' },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <SidebarContent
        role={role}
        onNav={handleNav}
        pathname={location.pathname}
        search={location.search}
        expanded
        onToggle={onClose}
        onAccountMenuOpen={onAccountMenuOpen}
      />
    </Drawer>
  );
}

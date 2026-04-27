import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeRounded,
  StorefrontRounded,
  FavoriteBorderRounded,
  ShoppingBagRounded,
  PersonRounded,
  DashboardRounded,
  AddBoxRounded,
  Inventory2Rounded,
  ReceiptLongRounded,
  LocalOfferRounded,
  MenuRounded,
  ChevronLeftRounded,
} from '@mui/icons-material';

/** Icon rail (Canva-style collapsed) */
export const SIDEBAR_COLLAPSED_W = 72;
/** Full labels */
export const SIDEBAR_EXPANDED_W = 240;

const USER_NAV_MAIN = [
  { id: 'home', label: 'Home', icon: HomeRounded, path: '/' },
  { id: 'shop', label: 'Shop', icon: StorefrontRounded, path: '/shop' },
  { id: 'wishlist', label: 'Wishlist', icon: FavoriteBorderRounded, path: '/wishlist' },
  { id: 'cart', label: 'Cart', icon: ShoppingBagRounded, path: '/cart' },
  { id: 'deals', label: 'Deals', icon: LocalOfferRounded, path: '/shop?sort=disc' },
];

const USER_NAV_ACCOUNT = [{ id: 'profile', label: 'Profile', icon: PersonRounded, path: '/profile' }];

const ADMIN_NAV = [
  { id: 'dash', label: 'Dashboard', icon: DashboardRounded, path: '/admin' },
  { id: 'add', label: 'Add product', icon: AddBoxRounded, path: '/admin/add-product' },
  { id: 'manage', label: 'Products', icon: Inventory2Rounded, path: '/admin/manage-products' },
  { id: 'orders', label: 'Orders', icon: ReceiptLongRounded, path: '/admin/orders' },
];

export function getSidebarWidthPx(expanded) {
  return expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;
}

function isActive(item, pathname, search) {
  if (!item.path) return false;
  const [p, q] = item.path.split('?');
  if (p === '/' && pathname === '/') return true;
  if (p === '/' && pathname !== '/') return false;
  if (q) return pathname === p && search.includes(q);
  return pathname.startsWith(p);
}

function NavItem({ item, active, expanded, showLabels, onClick }) {
  const Icon = item.icon;

  const inner = (
    <Box
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: showLabels ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: showLabels ? 'flex-start' : 'center',
        gap: showLabels ? 1.25 : 0.35,
        py: showLabels ? 1 : 1.1,
        px: showLabels ? 1.5 : 0.5,
        mx: showLabels ? 1 : 0.75,
        mb: showLabels ? 0.25 : 0,
        minHeight: showLabels ? 44 : 'auto',
        borderRadius: '12px',
        cursor: 'pointer',
        bgcolor: active ? 'rgba(255,107,53,0.12)' : 'transparent',
        color: active ? '#FF6B35' : '#6B7280',
        transition: 'background-color 0.18s ease, color 0.18s ease',
        '&:hover': {
          bgcolor: active ? 'rgba(255,107,53,0.16)' : '#F3F4F6',
          color: active ? '#FF6B35' : '#1A1A2E',
        },
      }}
    >
      <Icon sx={{ fontSize: showLabels ? 22 : 24, flexShrink: 0 }} />
      {showLabels && (
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: active ? 800 : 600,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.label}
        </Typography>
      )}
      {!showLabels && (
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: active ? 800 : 600,
            lineHeight: 1.15,
            textAlign: 'center',
            maxWidth: '100%',
            px: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.label}
        </Typography>
      )}
    </Box>
  );

  if (!showLabels) {
    return (
      <Tooltip title={item.label} placement="right" enterDelay={400} arrow>
        <Box component="span" sx={{ display: 'block', width: '100%' }}>
          {inner}
        </Box>
      </Tooltip>
    );
  }

  return inner;
}

function SidebarInner({
  role,
  pathname,
  search,
  onNav,
  expanded,
  onToggleExpand,
  isDrawer,
}) {
  const showLabels = isDrawer || expanded;
  const mainItems = role === 'admin' ? ADMIN_NAV : USER_NAV_MAIN;
  const accountItems = role === 'admin' ? [] : USER_NAV_ACCOUNT;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        borderRight: isDrawer ? 'none' : '1px solid #E8EAED',
        overflow: 'hidden',
      }}
    >
      {/* Top: expand/collapse (desktop) or spacer (drawer) */}
      <Box
        sx={{
          flexShrink: 0,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isDrawer ? 'flex-start' : expanded ? 'flex-end' : 'center',
          px: isDrawer ? 1 : expanded ? 1 : 0.5,
          borderBottom: '1px solid #F0F0F0',
        }}
      >
        {isDrawer ? (
          <Typography className="bb-head" sx={{ fontSize: 17, pl: 1, color: '#1A1A2E' }}>
            <Box component="span" sx={{ color: '#FF6B35' }}>Funzo</Box> menu
          </Typography>
        ) : (
          <Tooltip title={expanded ? 'Collapse sidebar' : 'Expand sidebar'} placement="bottom">
            <IconButton
              onClick={onToggleExpand}
              size="small"
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              sx={{
                color: '#6B7280',
                borderRadius: '10px',
                '&:hover': { bgcolor: '#F3F4F6' },
              }}
            >
              {expanded ? <ChevronLeftRounded /> : <MenuRounded />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          minHeight: 0,
        }}
      >
        {mainItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={isActive(item, pathname, search)}
            expanded={expanded}
            showLabels={showLabels}
            onClick={() => item.path && onNav(item.path)}
          />
        ))}

        {accountItems.length > 0 && (
          <>
            <Divider sx={{ my: 1.25, mx: showLabels ? 2 : 1.5, borderColor: '#EEF0F3' }} />
            {accountItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                active={isActive(item, pathname, search)}
                expanded={expanded}
                showLabels={showLabels}
                onClick={() => item.path && onNav(item.path)}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

export default function AppSidebar({
  open,
  onClose,
  role = 'user',
  expanded = true,
  onToggleExpanded,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleNav = (path) => {
    navigate(path);
    if (!isDesktop) onClose?.();
  };

  const widthPx = getSidebarWidthPx(expanded);

  if (isDesktop) {
    return (
      <Box
        component="aside"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: widthPx,
          height: '100vh',
          zIndex: 200,
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
        }}
      >
        <SidebarInner
          role={role}
          pathname={location.pathname}
          search={location.search}
          onNav={handleNav}
          expanded={expanded}
          onToggleExpand={onToggleExpanded}
          isDrawer={false}
        />
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: Math.min(280, '86vw'),
          border: 'none',
          boxShadow: '4px 0 32px rgba(0,0,0,0.08)',
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <SidebarInner
        role={role}
        pathname={location.pathname}
        search={location.search}
        onNav={handleNav}
        expanded
        onToggleExpand={() => {}}
        isDrawer
      />
    </Drawer>
  );
}

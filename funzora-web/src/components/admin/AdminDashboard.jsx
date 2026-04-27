import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  AddBoxRounded,
  Inventory2Rounded,
  ReceiptLongRounded,
  TrendingUpRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    title: 'Add Product',
    desc: 'Add new products to the store',
    icon: AddBoxRounded,
    path: '/admin/add-product',
    color: '#2ECC71',
    bg: '#EAFAF1',
  },
  {
    title: 'Manage Products',
    desc: 'Edit or remove existing products',
    icon: Inventory2Rounded,
    path: '/admin/manage-products',
    color: '#7B4FFF',
    bg: '#F3EFFF',
  },
  {
    title: 'Orders',
    desc: 'View and manage customer orders',
    icon: ReceiptLongRounded,
    path: '/admin/orders',
    color: '#FF6B35',
    bg: '#FFF0EB',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Box className="bb-page">
      <Box sx={{ mb: 4 }}>
        <Typography className="bb-head" sx={{ fontSize: { xs: 26, sm: 32 }, color: '#1A1A2E', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: '#9CA3AF', fontSize: 14, fontWeight: 600 }}>
          Manage your store from here
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' }, gap: 2.5 }}>
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Box
              key={item.title}
              onClick={() => navigate(item.path)}
              sx={{
                bgcolor: '#fff',
                borderRadius: '18px',
                p: 3,
                border: `1.5px solid ${item.color}20`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: `0 8px 28px ${item.color}20`, transform: 'translateY(-2px)' },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  bgcolor: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Icon sx={{ color: item.color, fontSize: 26 }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: 17, color: '#1A1A2E', mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 2, lineHeight: 1.5 }}>{item.desc}</Typography>
              <Button
                sx={{
                  bgcolor: item.color,
                  color: '#fff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  px: 2.5,
                  '&:hover': { bgcolor: item.color, opacity: 0.9 },
                }}
              >
                Open →
              </Button>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: '#F9FAFB',
          borderRadius: '18px',
          border: '1.5px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TrendingUpRounded sx={{ fontSize: 28, color: '#FF6B35' }} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1A1A2E' }}>Quick stats coming soon</Typography>
          <Typography sx={{ fontSize: 12.5, color: '#9CA3AF' }}>Revenue, orders per day, and popular products — all at a glance.</Typography>
        </Box>
      </Box>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  IconButton,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import {
  Category as CategoryIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { ProductCard } from './ProductCard';

const Categories = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract unique categories from products
  useEffect(() => {
    const uniqueCategories = ['all', ...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [products]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setProducts(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CategoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Categories</Typography>
        {isMobile && (
          <IconButton 
            sx={{ ml: 'auto' }} 
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List>
        {categories.map((category) => (
          <ListItem key={category} disablePadding>
            <ListItemButton
              selected={selectedCategory === category}
              onClick={() => handleCategorySelect(category)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              }}
            >
              <ListItemText 
                primary={category.charAt(0).toUpperCase() + category.slice(1)} 
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: selectedCategory === category ? 600 : 400,
                  },
                }}
              />
              <Chip 
                label={category === 'all' 
                  ? products.length 
                  : products.filter(p => p.category === category).length
                } 
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: selectedCategory === category 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(0,0,0,0.08)',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Paper 
          elevation={1}
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {drawer}
        </Paper>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': { width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Mobile filter button */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => setMobileOpen(true)}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
              }}
            >
              <FilterIcon />
            </IconButton>
          </Box>
        )}

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedCategory === 'all' 
              ? 'All Products' 
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredProducts.length} products found
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Categories; 
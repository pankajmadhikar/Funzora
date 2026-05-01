import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { formatPrice } from '../../utils/formatPrice';
import ManageDiscounts from './ManageDiscounts';
import { toast } from 'react-hot-toast';

const ManageProducts = () => {
  const AGE_BUCKET_OPTIONS = ['0-2', '3-5', '6-8', '9-12', '13+'];
  const PRODUCT_LAYER_OPTIONS = ['hero', 'fast', 'bundle'];
  const GIFT_OCCASION_OPTIONS = ['birthday', 'festival', 'return-gift', 'everyday'];
  const PRICE_BAND_OPTIONS = ['under-499', '500-999', '1000-1999', '2000+'];

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  console.log("editProduct", editProduct)
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditProduct({
      ...product,
      giftTagsText: Array.isArray(product.giftTags) ? product.giftTags.join(', ') : '',
      interestsText: Array.isArray(product.interests) ? product.interests.join(', ') : '',
      giftOccasions: Array.isArray(product.giftOccasions) ? product.giftOccasions : [],
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log("productToDelete", productToDelete)
    try {
      setLoading(true);
      await apiService.deleteProduct(productToDelete._id);
      await fetchProducts(); // Refresh the list
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        name: editProduct.name,
        category: editProduct.category,
        subCategory: editProduct.subCategory,
        description: editProduct.description,
        specification: editProduct.specification,
        price: Number(editProduct.price),
        mrp: Number(editProduct.mrp),
        discountPercentage: Number(editProduct.discountPercentage),
        quantity: Number(editProduct.quantity),
        ageLabel: editProduct.ageLabel || '',
        ageBucket: editProduct.ageBucket || '',
        productLayer: editProduct.productLayer || '',
        isBestForGifting: Boolean(editProduct.isBestForGifting),
        priceBand: editProduct.priceBand || '',
        giftOccasions: Array.isArray(editProduct.giftOccasions) ? editProduct.giftOccasions : [],
        giftTags: String(editProduct.giftTagsText || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: String(editProduct.interestsText || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await apiService.updateProduct(editProduct._id, updatedData);
      await fetchProducts(); // Refresh the list
      setOpenDialog(false);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDiscountUpdate = async (productId, discounts) => {
    try {
      await apiService.updateProduct(productId, { discounts });
      await fetchProducts(); // Refresh the list
      toast.success('Discounts updated successfully');
    } catch (error) {
      console.error('Failed to update discounts:', error);
      toast.error('Failed to update discounts');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Products ({products.length})
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Available Quantity</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.availableQuantity}</TableCell>
                  <TableCell>{product.discountPercentage}%</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(product)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={editProduct?.name || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Category"
                    fullWidth
                    value={editProduct?.category || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Subcategory"
                    fullWidth
                    value={editProduct?.subCategory || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, subCategory: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Age label"
                    fullWidth
                    value={editProduct?.ageLabel || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, ageLabel: e.target.value })}
                    placeholder="e.g. 2-6 years / 3+"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="age-bucket-edit">Age bucket</InputLabel>
                    <Select
                      labelId="age-bucket-edit"
                      label="Age bucket"
                      value={editProduct?.ageBucket || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, ageBucket: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>Not set</em>
                      </MenuItem>
                      {AGE_BUCKET_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="product-layer-edit">Product layer</InputLabel>
                    <Select
                      labelId="product-layer-edit"
                      label="Product layer"
                      value={editProduct?.productLayer || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, productLayer: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>Not set</em>
                      </MenuItem>
                      {PRODUCT_LAYER_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="price-band-edit">Price band</InputLabel>
                    <Select
                      labelId="price-band-edit"
                      label="Price band"
                      value={editProduct?.priceBand || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, priceBand: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>Not set</em>
                      </MenuItem>
                      {PRICE_BAND_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="gift-occasions-edit">Gift occasions</InputLabel>
                    <Select
                      labelId="gift-occasions-edit"
                      label="Gift occasions"
                      multiple
                      value={editProduct?.giftOccasions || []}
                      onChange={(e) => setEditProduct({ ...editProduct, giftOccasions: e.target.value })}
                    >
                      {GIFT_OCCASION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Gift tags (comma separated)"
                    fullWidth
                    value={editProduct?.giftTagsText || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, giftTagsText: e.target.value })}
                    placeholder="Best for gifting, Parent-trusted"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Interests (comma separated)"
                    fullWidth
                    value={editProduct?.interestsText || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, interestsText: e.target.value })}
                    placeholder="stem, sensory, art"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(editProduct?.isBestForGifting)}
                        onChange={(e) => setEditProduct({ ...editProduct, isBestForGifting: e.target.checked })}
                      />
                    }
                    label="Best for gifting"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Selling Price"
                    type="number"
                    fullWidth
                    value={editProduct?.price || ''}
                    onChange={(e) => setEditProduct({
                      ...editProduct,
                      price: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="MRP"
                    type="number"
                    fullWidth
                    value={editProduct?.mrp || ''}
                    onChange={(e) => setEditProduct({
                      ...editProduct,
                      mrp: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={editProduct?.quantity || ''}
                    onChange={(e) => setEditProduct({
                      ...editProduct,
                      quantity: Number(e.target.value)
                    })}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Discount Percentage"
                    type="number"
                    fullWidth
                    value={editProduct?.discountPercentage || ''}
                    onChange={(e) => setEditProduct({
                      ...editProduct,
                      discountPercentage: Number(e.target.value)
                    })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={editProduct?.description || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Specifications"
                    fullWidth
                    multiline
                    rows={4}
                    value={editProduct?.specification || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, specification: e.target.value })}
                    required
                    helperText="Enter product specifications"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!editProduct?.name || !editProduct?.price || !editProduct?.quantity}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the product "{productToDelete?.name}"?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {selectedProduct && (
          <ManageDiscounts
            product={selectedProduct}
            onSave={(discounts) => handleDiscountUpdate(selectedProduct._id, discounts)}
          />
        )}
      </Paper>
    </Container>
  );
};

export default ManageProducts; 
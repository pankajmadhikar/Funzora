import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Avatar,
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { CloudUpload as UploadIcon, Clear as ClearIcon, Add as AddIcon } from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { TOY_CATS } from '../../config/toyStore';

const SHOP_CATEGORY_OPTIONS = TOY_CATS.filter((c) => c.id !== 'all');

const emptyProduct = {
  name: '',
  description: '',
  specification: '',
  mrp: '',
  price: '',
  discountPercentage: '',
  category: '',
  subCategory: '',
  quantity: '',
  images: [],
  displayEmoji: '',
  ageLabel: '',
  isHot: false,
  isNew: false,
  rating: 4.5,
  reviewCount: 0,
  featuresText: '',
  shopCategoryId: '',
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedProducts = [...products];
    const product = { ...updatedProducts[index] };

    if (type === 'checkbox') {
      product[name] = checked;
    } else if (
      ['price', 'mrp', 'quantity', 'discountPercentage', 'rating', 'reviewCount'].includes(name)
    ) {
      product[name] = value === '' ? '' : Number(value);
    } else {
      product[name] = value;
    }

    if ((name === 'mrp' || name === 'price') && product.mrp !== '' && product.price !== '') {
      const mrp = Number(product.mrp);
      const price = Number(product.price);
      if (mrp > 0 && price >= 0 && price <= mrp) {
        product.discountPercentage = Math.round(((mrp - price) / mrp) * 10000) / 100;
      }
    }

    updatedProducts[index] = product;
    setProducts(updatedProducts);
  };

  const handleImageChange = async (index, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const updatedProducts = [...products];
      const product = updatedProducts[index];
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        if (uploadedUrls.length + product.images.length >= 5) {
          toast.error('Maximum 5 images allowed');
          break;
        }

        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        try {
          const imageUrl = await apiService.uploadImage(file);
          uploadedUrls.push(imageUrl);
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        updatedProducts[index] = {
          ...product,
          images: [...product.images, ...uploadedUrls],
        };
        setProducts(updatedProducts);
        toast.success('Images uploaded successfully');
      }
    } catch (err) {
      console.error('Error handling images:', err);
      toast.error('Failed to process images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (productIndex, imageIndex) => {
    setProducts((prev) => {
      const next = [...prev];
      next[productIndex] = {
        ...next[productIndex],
        images: next[productIndex].images.filter((_, i) => i !== imageIndex),
      };
      return next;
    });
  };

  const addNewProduct = () => {
    setProducts([...products, { ...emptyProduct }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const validateProducts = () => {
    for (const product of products) {
      if (
        !product.name?.trim() ||
        !product.description?.trim() ||
        !product.specification?.trim() ||
        product.price === '' ||
        product.mrp === '' ||
        !product.category?.trim() ||
        !product.subCategory?.trim() ||
        product.quantity === ''
      ) {
        throw new Error('Please fill all required fields for all products');
      }

      if (Number(product.price) <= 0) {
        throw new Error('Selling price must be greater than 0');
      }

      if (Number(product.mrp) <= 0) {
        throw new Error('MRP must be greater than 0');
      }

      if (Number(product.price) > Number(product.mrp)) {
        throw new Error('Selling price cannot be greater than MRP');
      }

      if (Number(product.quantity) <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const r = Number(product.rating);
      if (Number.isFinite(r) && (r < 0 || r > 5)) {
        throw new Error('Rating must be between 0 and 5');
      }
    }
  };

  const toApiPayload = (product) => {
    const features = String(product.featuresText || '')
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const discountPercentage = Number(product.discountPercentage) || 0;
    const price = Number(product.price);
    const actualAmount = price - price * (discountPercentage / 100);

    const payload = {
      name: product.name.trim(),
      description: product.description.trim(),
      specification: product.specification.trim(),
      category: product.category.trim(),
      subCategory: product.subCategory.trim(),
      mrp: Number(product.mrp),
      price,
      discountPercentage,
      actualAmount,
      quantity: Number(product.quantity),
      availableQuantity: Number(product.quantity),
      images: Array.isArray(product.images) ? product.images : [],
      isHot: Boolean(product.isHot),
      isNew: Boolean(product.isNew),
      rating: Number(product.rating) || 4.5,
      reviewCount: Math.max(0, Math.floor(Number(product.reviewCount) || 0)),
      features,
    };

    const emoji = String(product.displayEmoji || '').trim();
    if (emoji) payload.displayEmoji = emoji;

    const age = String(product.ageLabel || '').trim();
    if (age) payload.ageLabel = age;

    const shopId = String(product.shopCategoryId || '').trim();
    if (shopId && SHOP_CATEGORY_OPTIONS.some((c) => c.id === shopId)) {
      payload.shopCategoryId = shopId;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      validateProducts();
      const formattedProducts = products.map(toApiPayload);
      await apiService.addProducts(formattedProducts);

      toast.success('Products added successfully!');
      setTimeout(() => {
        navigate('/admin/manage-products');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add products');
      toast.error(err.message || 'Failed to add products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Add products
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Fields match the product schema (including storefront extras).
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1">
                {user?.firstname} {user?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {user?.firstname?.[0]}
              {user?.lastname?.[0]}
            </Avatar>
            <Chip label={user?.role?.toUpperCase()} color="primary" variant="outlined" />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {products.map((product, productIndex) => (
            <Box key={productIndex}>
              {productIndex > 0 && <Divider sx={{ my: 4 }} />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Product {productIndex + 1}</Typography>
                {products.length > 1 && (
                  <Button color="error" onClick={() => removeProduct(productIndex)} startIcon={<ClearIcon />}>
                    Remove
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={product.category}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    required
                    helperText="e.g. Sensory Play, Outdoor & Active"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    name="subCategory"
                    value={product.subCategory}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    required
                    helperText="e.g. Age 3+ or product line"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id={`shop-cat-${productIndex}`}>Shop category (storefront)</InputLabel>
                    <Select
                      labelId={`shop-cat-${productIndex}`}
                      label="Shop category (storefront)"
                      value={product.shopCategoryId || ''}
                      onChange={(e) =>
                        handleInputChange(productIndex, {
                          target: { name: 'shopCategoryId', value: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="">
                        <em>Auto — infer from category text</em>
                      </MenuItem>
                      {SHOP_CATEGORY_OPTIONS.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.icon} {c.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Display emoji (optional)"
                    name="displayEmoji"
                    value={product.displayEmoji}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    placeholder="🏖️"
                    inputProps={{ maxLength: 8 }}
                    helperText="Shown on cards when no image"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age label (optional)"
                    name="ageLabel"
                    value={product.ageLabel}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    placeholder="3+"
                    helperText="e.g. 2+, 3+, 6+"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rating (0–5)"
                    name="rating"
                    type="number"
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    value={product.rating}
                    onChange={(e) => handleInputChange(productIndex, e)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Review count"
                    name="reviewCount"
                    type="number"
                    inputProps={{ min: 0 }}
                    value={product.reviewCount}
                    onChange={(e) => handleInputChange(productIndex, e)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isHot"
                          checked={Boolean(product.isHot)}
                          onChange={(e) => handleInputChange(productIndex, e)}
                        />
                      }
                      label="Hot / trending"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isNew"
                          checked={Boolean(product.isNew)}
                          onChange={(e) => handleInputChange(productIndex, e)}
                        />
                      }
                      label="New arrival"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product name"
                    name="name"
                    value={product.name}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={product.description}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    multiline
                    minRows={4}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specifications"
                    name="specification"
                    value={product.specification}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    multiline
                    minRows={4}
                    required
                    helperText="One line per spec (also used as feature bullets if features list is empty)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Feature bullets (optional)"
                    name="featuresText"
                    value={product.featuresText}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    multiline
                    minRows={3}
                    helperText="One feature per line; shown on product detail. If empty, specification lines are used on the storefront."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="MRP"
                    name="mrp"
                    type="number"
                    value={product.mrp}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Selling price"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                    error={Number(product.price) > Number(product.mrp) && product.mrp !== ''}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discount %"
                    name="discountPercentage"
                    type="number"
                    value={product.discountPercentage}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    disabled
                    helperText="Calculated from MRP and selling price"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock quantity"
                    name="quantity"
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleInputChange(productIndex, e)}
                    required
                    helperText="Sets both quantity and availableQuantity"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Images (max 5)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={uploadingImages || product.images.length >= 5}
                    fullWidth
                  >
                    {uploadingImages ? 'Uploading…' : 'Upload images'}
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageChange(productIndex, e)}
                    />
                  </Button>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {product.images.map((image, imgIdx) => (
                      <Grid item xs={6} sm={4} md={3} key={`${image}-${imgIdx}`}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '100%',
                            '&:hover .remove-button': { opacity: 1 },
                          }}
                        >
                          <Box
                            component="img"
                            src={image}
                            alt={`Product ${imgIdx + 1}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                          <IconButton
                            className="remove-button"
                            type="button"
                            onClick={() => removeImage(productIndex, imgIdx)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'background.paper',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ))}

          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addNewProduct} fullWidth>
              Add another product
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
              {loading ? 'Saving…' : 'Save all products'}
            </Button>
            <Button variant="outlined" color="secondary" fullWidth size="large" onClick={() => navigate('/admin')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct;

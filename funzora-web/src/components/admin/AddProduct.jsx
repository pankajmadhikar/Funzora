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
} from '@mui/material';
import { CloudUpload as UploadIcon, Clear as ClearIcon, Add as AddIcon } from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';

const emptyProduct = {
  name: '',
  description: '',
  specification: '',
  price: '',
  discountPercentage: '',
  category: '',
  subCategory: '',
  quantity: '',
  images: [],
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([{ ...emptyProduct }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
    const product = updatedProducts[index];

    // Update the changed field
    product[name] = name.includes('price') || name.includes('mrp') || name.includes('quantity') 
      ? Number(value) 
      : value;

    // Auto-calculate discount percentage if both MRP and price are set
    if ((name === 'mrp' || name === 'price') && product.mrp && product.price) {
      const discount = ((product.mrp - product.price) / product.mrp) * 100;
      product.discountPercentage = Math.round(discount * 100) / 100; // Round to 2 decimal places
    }

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
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        try {
          const imageUrl = await apiService.uploadImage(file);
          uploadedUrls.push(imageUrl);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        updatedProducts[index] = {
          ...product,
          images: [...product.images, ...uploadedUrls]
        };
        setProducts(updatedProducts);
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Error handling images:', error);
      toast.error('Failed to process images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setProducts(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addNewProduct = () => {
    setProducts([...products, { ...emptyProduct }]);
  };

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const validateProducts = () => {
    for (const product of products) {
      if (!product.name || !product.description || !product.specification || 
          !product.price || !product.category || !product.subCategory || 
          !product.quantity) {
        throw new Error('Please fill all required fields for all products');
      }

      if (product.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      if (product.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate products
      validateProducts();

      // Format products data
      const formattedProducts = products.map(product => ({
        ...product,
        price: Number(product.price),
        discountPercentage: Number(product.discountPercentage) || 0,
        quantity: Number(product.quantity),
        availableQuantity: Number(product.quantity),
      }));

      // Submit products
      await apiService.addProducts(formattedProducts);
      
      toast.success('Products added successfully!');
      setTimeout(() => {
        navigate('/admin/manage-products');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to add products');
      toast.error(err.message || 'Failed to add products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Add New Products
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your product inventory
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1">
                {user?.firstname} {user?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 48,
                height: 48
              }}
            >
              {user?.firstname?.[0]}{user?.lastname?.[0]}
            </Avatar>
            <Chip 
              label={user?.role?.toUpperCase()} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {products.map((product, index) => (
            <Box key={index}>
              {index > 0 && <Divider sx={{ my: 4 }} />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Product {index + 1}</Typography>
                {products.length > 1 && (
                  <Button
                    color="error"
                    onClick={() => removeProduct(index)}
                    startIcon={<ClearIcon />}
                  >
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
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    name="subCategory"
                    value={product.subCategory}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Grid>

                {/* Product Fields */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={product.name}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={product.description}
                    onChange={(e) => handleInputChange(index, e)}
                    multiline
                    minRows={4}
                    maxRows={8}
                    required
                    placeholder="Enter product description (press Enter for new line)
Example:
Best product
nice
most"
                    sx={{
                      '& .MuiInputBase-root': {
                        lineHeight: 1.5,
                      },
                      '& .MuiInputBase-input': {
                        whiteSpace: 'pre-wrap',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specifications"
                    name="specification"
                    value={product.specification}
                    onChange={(e) => handleInputChange(index, e)}
                    multiline
                    minRows={4}
                    maxRows={8}
                    required
                    placeholder="Enter product specifications (press Enter for new line)
Example:
RAM: 8GB
Storage: 256GB SSD
Display: 15.6 inch FHD"
                    helperText="Enter each specification on a new line"
                    sx={{
                      '& .MuiInputBase-root': {
                        lineHeight: 1.5,
                      },
                      '& .MuiInputBase-input': {
                        whiteSpace: 'pre-wrap',
                      },
                    }}
                  />
                </Grid>

                {/* Price Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="MRP"
                    name="mrp"
                    type="number"
                    value={product.mrp}
                    onChange={(e) => handleInputChange(index, e)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                    helperText="Original Maximum Retail Price"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Selling Price"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => handleInputChange(index, e)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                    helperText="Final selling price after discount"
                    error={Number(product.price) > Number(product.mrp)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discount Percentage"
                    name="discountPercentage"
                    type="number"
                    value={product.discountPercentage}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    disabled
                    helperText="Auto-calculated from MRP and Selling Price"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    helperText="Initial stock quantity"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Product Images (Max 5)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={uploadingImages || product.images.length >= 5}
                      fullWidth
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                    </Button>
                  </Box>

                  {/* Display uploaded images */}
                  <Grid container spacing={2}>
                    {product.images.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '100%',
                            '&:hover .remove-button': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={image}
                            alt={`Product image ${index + 1}`}
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
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'background.paper',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': {
                                bgcolor: 'background.paper',
                              },
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

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addNewProduct}
              fullWidth
            >
              Add Another Product
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Save All Products
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct; 
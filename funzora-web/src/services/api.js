import { MOCK_PRODUCTS, MOCK_CART, MOCK_ORDERS } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Product APIs
export const getProducts = async (filters = {}) => {
  await delay(500); // Simulate network delay
  return { data: MOCK_PRODUCTS };
};

export const getProduct = async (id) => {
  await delay(300);
  const product = MOCK_PRODUCTS.find(p => p._id === id);
  if (!product) throw new Error('Product not found');
  return { data: product };
};

export const addProduct = async (productData) => {
  await delay(800);
  console.log('Adding product:', productData);
  return { data: { success: true, message: 'Product added successfully' } };
};

export const updateProduct = async (id, productData) => {
  await delay(500);
  console.log('Updating product:', id, productData);
  return { data: { success: true, message: 'Product updated successfully' } };
};

export const deleteProduct = async (id) => {
  await delay(500);
  console.log('Deleting product:', id);
  return { data: { success: true, message: 'Product deleted successfully' } };
};

// Cart APIs
export const getCart = async () => {
  await delay(300);
  return { data: MOCK_CART };
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    await delay(300); // Simulate network delay
    
    // Simulate successful cart addition
    console.log('Adding to cart:', { productId, quantity });
    
    // You can switch to real API implementation later
    return { 
      data: { 
        success: true, 
        message: 'Product added to cart successfully' 
      } 
    };
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Order APIs
export const getOrders = async () => {
  await delay(500);
  return { data: MOCK_ORDERS };
};

export const checkout = async (orderData) => {
  await delay(1000);
  console.log('Processing order:', orderData);
  return { data: { success: true, message: 'Order placed successfully' } };
}; 
import { authService } from "./authService";

// const BASE_URL = 'http://localhost:8080/api/v1';
export const BASE_URL = "https://api.rgswholesale.in/api/v1";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${authService.getToken()}`,
});

export const apiService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Protected endpoints
  getProducts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.message || "Failed to fetch products");
    }
  },

  getProductById: async (productId) => {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);
      console.log("Product API Response:", result); // Debug log

      // Check if the response has the correct structure
      if (!result.success) {
        throw new Error("Failed to fetch product details");
      }

      return result;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw new Error(error.message || "Failed to fetch product details");
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      const response = await fetch(`${BASE_URL}/carts/create-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to add item to cart");
      }

      return result.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw new Error(error.message || "Failed to add item to cart");
    }
  },

  // Get Cart Items
  getCartItems: async () => {
    try {
      const response = await fetch(`${BASE_URL}/carts/create-cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);
      console.log("Cart API Response:", result); // Debug log

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch cart items");
      }

      return result;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new Error(error.message || "Failed to fetch cart items");
    }
  },

  // Update Cart Item Quantity
  updateCartItem: async (productId, action) => {
    try {
      const response = await fetch(`${BASE_URL}/carts/item/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ action }),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to update cart item");
      }

      return result.data;
    } catch (error) {
      // If it's a 400 error, it means we hit the quantity limit
      if (error.message.includes("units of this product are available")) {
        throw new Error("Maximum quantity limit reached");
      }
      console.error("Error updating cart item:", error);
      throw new Error(error.message || "Failed to update cart item");
    }
  },

  // Remove Cart Item
  removeCartItem: async (cartId) => {
    console.log("cartId",cartId)
    try {
      const response = await fetch(`${BASE_URL}/carts/item/${cartId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to remove cart item");
      }

      return result.data;
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw new Error(error.message || "Failed to remove cart item");
    }
  },

  // Add Product(s)
  addProducts: async (productsData) => {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ products: productsData }),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to add products");
      }

      return result.data;
    } catch (error) {
      console.error("Error adding products:", error);
      throw new Error(error.message || "Failed to add products");
    }
  },

  // Add other API calls here
  updateProduct: async (productId, updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to update product");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error(error.message || "Failed to update product");
    }
  },

  deleteProduct: async (productId) => {
    console.log("productId",productId)
    try {
      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete product");
      }

      return result.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error(error.message || "Failed to delete product");
    }
  },

  // Get All Orders
  getAllOrders: async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }

      return result;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error(error.message || "Failed to fetch orders");
    }
  },

  // Update Order Status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/status/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to update order status");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(error.message || "Failed to update order status");
    }
  },

  checkout: async () => {
    try {
      const response = await fetch(`${BASE_URL}/carts/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Checkout failed");
      }

      return result.data;
    } catch (error) {
      console.error("Error during checkout:", error);
      throw new Error(error.message || "Checkout failed");
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/upload/file/s3upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: formData,
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to upload image");
      }

      return result.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(error.message || "Failed to upload image");
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await fetch(
        `${BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Search failed");
      }

      return result;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  getUserOrders: async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders/user`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }

      return result;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },
};

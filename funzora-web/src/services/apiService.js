import { authService } from "./authService";

export const BASE_URL = "https://api.babyto.in/api/v1";
// export const BASE_URL = "http://localhost:8080/api/v1";

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

const jsonHeaders = { "Content-Type": "application/json" };

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

  /** Guest identity — no JWT. Persists client-side as user_phone after success. */
  whatsappLogin: async (phone) => {
    const response = await fetch(`${BASE_URL}/auth/whatsapp-login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ phone }),
    });
    return handleResponse(response);
  },

  /** Saved delivery profile for phone identity (guest, no JWT). */
  getDeliveryAddress: async (phone) => {
    const clean = String(phone || "")
      .replace(/\D/g, "")
      .slice(-10);
    if (clean.length !== 10) {
      throw new Error("Phone required");
    }
    const response = await fetch(
      `${BASE_URL}/user/address/${encodeURIComponent(clean)}`,
      { method: "GET", headers: jsonHeaders },
    );
    return handleResponse(response);
  },

  saveDeliveryAddress: async (phone, address) => {
    const clean = String(phone || "")
      .replace(/\D/g, "")
      .slice(-10);
    if (clean.length !== 10) {
      throw new Error("Phone required");
    }
    const response = await fetch(`${BASE_URL}/user/address/save`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ phone: clean, address }),
    });
    return handleResponse(response);
  },

  // Protected endpoints
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          params.set(key, value);
        }
      });
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`${BASE_URL}/products${query}`, {
        method: "GET",
        headers: jsonHeaders,
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
        headers: jsonHeaders,
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

  addToCart: async (phone, productId, quantity) => {
    try {
      const response = await fetch(`${BASE_URL}/carts/create-cart`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          phone,
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
  getCartItems: async (phone) => {
    if (!phone || String(phone).replace(/\D/g, "").length < 10) {
      throw new Error("Phone number is required to load your cart");
    }
    try {
      const clean = String(phone).replace(/\D/g, "").slice(-10);
      const response = await fetch(
        `${BASE_URL}/carts/create-cart?phone=${encodeURIComponent(clean)}`,
        {
          method: "GET",
          headers: jsonHeaders,
        },
      );

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch cart items");
      }

      const payload = result.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];

      return { ...result, data: { ...payload, items } };
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new Error(error.message || "Failed to fetch cart items");
    }
  },

  // Update Cart Item Quantity
  updateCartItem: async (phone, productId, action) => {
    try {
      const clean = String(phone).replace(/\D/g, "").slice(-10);
      const response = await fetch(
        `${BASE_URL}/carts/item/${productId}?phone=${encodeURIComponent(clean)}`,
        {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify({ action, phone: clean }),
        },
      );

      const result = await handleResponse(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to update cart item");
      }

      return result.data;
    } catch (error) {
      if (error.message.includes("units of this product are available")) {
        throw new Error("Maximum quantity limit reached");
      }
      console.error("Error updating cart item:", error);
      throw new Error(error.message || "Failed to update cart item");
    }
  },

  // Remove Cart Item — productId in path
  removeCartItem: async (phone, productId) => {
    try {
      const clean = String(phone).replace(/\D/g, "").slice(-10);
      const response = await fetch(
        `${BASE_URL}/carts/item/${productId}?phone=${encodeURIComponent(clean)}`,
        {
          method: "DELETE",
          headers: jsonHeaders,
        },
      );

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
    console.log("productId", productId);
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

  checkout: async (phone) => {
    try {
      const clean = String(phone || "")
        .replace(/\D/g, "")
        .slice(-10);
      const response = await fetch(`${BASE_URL}/carts/checkout`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ phone: clean }),
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
          headers: jsonHeaders,
        },
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

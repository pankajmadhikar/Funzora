import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { apiService } from "../../services/apiService";
import { toast } from "react-hot-toast";
import { setCartItems } from "../../store/slices/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [itemErrors, setItemErrors] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);


      const cartResponse = await apiService.getCartItems();
      console.log("cartResponse", cartResponse)
      // Update Redux store with new cart data
      if (cartResponse?.data) {
        dispatch(setCartItems(cartResponse?.data));
      }
      setCartData(cartResponse);
      setError(null);
    } catch (error) {
      console.log("Error fetching cart fetchCartItems from carts:", error);
      dispatch(setCartItems({ items: [] }));
      setError(error.message || "Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, action) => {
    try {
      setUpdating(true);
      setItemErrors((prev) => ({ ...prev, [item._id]: null }));

      await apiService.updateCartItem(item.productId._id, action);
      await fetchCartItems();
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart:", error);
      // Store error for specific item
      setItemErrors((prev) => ({
        ...prev,
        [item._id]: error.message,
      }));
      toast.error(error.message || "Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      setUpdating(true);
      const response = await apiService.removeCartItem(item?.productId?._id);
      console.log("response", response)
      await fetchCartItems(); // Refresh cart items
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    console.log("handleCheckout pressed ")
    console.log("successModalOpen pressed ", successModalOpen)
    try {
      setCheckoutLoading(true);
      await apiService.checkout();
      // Refresh cart after successful checkout
      // setSuccessModalOpen(true);

      fetchCartItems();
      toast.success("Order Placed Successfully!");

    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
      setSuccessModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Get cart items from the nested structure
  const cartItems = cartData?.data?.items || [];
  console.log("Cart Items:", cartItems); // Debug log

  const total = cartItems.reduce(
    (sum, item) => sum + item?.productId?.price * item?.quantity,
    0
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart ({cartItems.length} items)
      </Typography>

      {!cartItems || cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems?.map((item) => (
                  <TableRow key={item?._id}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={item?.productId?.images[0] || "https://via.placeholder.com/50"}
                          alt={item?.productId?.name}
                          style={{
                            width: 50,
                            height: 50,
                            marginRight: 16,
                            objectFit: "cover",
                          }}
                        />
                        {item?.productId?.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item?.productId?.price?.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleUpdateQuantity(item, "decrease")
                            }
                            disabled={updating || item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography component="span" sx={{ mx: 2 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleUpdateQuantity(item, "increase")
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        {itemErrors[item._id] && (
                          <Typography
                            color="error"
                            variant="caption"
                            sx={{ display: "block", mt: 1 }}
                          >
                            {itemErrors[item._id]}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₹{(item?.productId?.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item)}
                        disabled={updating}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 4,
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography>Subtotal:</Typography>
              <Typography>₹{total.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >

            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">₹{(total).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={cartItems.length === 0 || checkoutLoading}
                onClick={handleCheckout}
              >
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </Box>
          </Box>




          <Dialog
            open={successModalOpen}
            onClose={() => setSuccessModalOpen(false)}
          >
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Thank you for your order. Our admin team will contact you
                shortly regarding your order details and delivery information.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSuccessModalOpen(false)}
                variant="contained"
                color="primary"
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>


        </>
      )}

      {/* Success Modal */}

    </Container>
  );
};

export default Cart;

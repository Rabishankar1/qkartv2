import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import { unstable_useEnhancedEffect } from "@mui/material";
import { generateCartItemsFrom, getTotalCartValue } from "./Cart";
import Cart from "./Cart";
/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
  const [data, updateData] = useState([]);
  const [loading, updateLoading] = useState(false);
  const [timerId, updatetimerId] = useState(500);
  const [cartItems, updateCartItems] = useState([]);
  const [items, updateItems] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    let token = localStorage.getItem("token");
    performAPICall();
    fetchCart(token);
  }, []);

  useEffect(() => {
    let filt = generateCartItemsFrom(cartItems, data);
    updateItems(filt);
  }, [data, cartItems]);

  const performAPICall = async () => {
    try {
      updateLoading(true);
      let response = await axios.get(config.endpoint + "/products");
      updateData(response.data);
    } catch (err) {
      updateLoading(false);
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details",
        { variant: "error" }
      );
    }
    updateLoading(false);
  };

  const performSearch = async (text) => {
    updateLoading(true);
    try {
      const response = await axios(
        config.endpoint + `/products/search?value=${text}`
      );
      updateData(response.data);
    } catch (err) {
      if (err.response.status === 404) {
        updateData([]);
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
    updateLoading(false);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let response = await axios.get(config.endpoint + "/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      updateCartItems(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(debounceTimeout);
    let timer = setTimeout(() => performSearch(event.target.value), 500);
    updatetimerId(timer);
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let match = false;
    items.forEach((i) => {
      if (i._id === productId) {
        match = true;
      }
    });
    return match;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "error",
      });
    } else if (isItemInCart(items, productId) && options.preventDuplicate) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        {
          variant: "warning",
        }
      );
    } else {
      let response = await axios.post(
        config.endpoint + "/cart",
        JSON.stringify({
          productId: productId,
          qty: qty,
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
        }
      );
      updateCartItems(response.data);
    }
  };

  let token = localStorage.getItem("token");

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          sx={{ width: 300 }}
          fullWidth
          onChange={(e) => {
            debounceSearch(e, timerId);
          }}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, timerId);
        }}
      />

      <Grid container pb={2}>
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item md={9} xs={12}>
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 310 }}
            >
              <CircularProgress />
              <Box>Loading Products...</Box>
            </Box>
          ) : data.length ? (
            <Grid container spacing={2} p={2}>
              {data.map((i) => {
                return (
                  <Grid className="product-grid" item xs={6} md={3} key={i._id}>
                    <ProductCard
                      product={i}
                      handleAddToCart={() =>
                        addToCart(token, items, data, i._id, 1, {
                          preventDuplicate: true,
                        })
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 310 }}
            >
              <SentimentDissatisfied />
              <Box>No products found</Box>
            </Box>
          )}
        </Grid>
        <Grid className="cart-wrapper" item md={3} xs={12}>
          <Cart
            products={data}
            items={items}
            handleQuantity={(qty, productId) =>
              addToCart(token, items, data, productId, qty)
            }
          />
        </Grid>
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;


// src/features/products/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productAPI from "../../axios/productAPI";
import { toast } from "react-toastify";

// Fetch all products
export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const res = await productAPI.getAll();
  return res.data;
});

// Add product
export const addProduct = createAsyncThunk(
  "products/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await productAPI.create(data);
      toast.success("Product added ✅");
      // keep server id, return merged object for state
      return { id: res.data.id, ...data };
    } catch (error) {
      toast.error("Failed to add product ❌");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await productAPI.update(id, data);
      toast.success("Product updated ✅");
      return { id, ...data };
    } catch (error) {
      toast.error("Failed to update product ❌");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await productAPI.remove(id);
      toast.success("Product deleted 🗑️");
      return id;
    } catch (error) {
      toast.error("Failed to delete product ❌");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Map backend fields to frontend + calculate missing values
        state.list = action.payload.map((p) => {
          const purchase = Number(p.purchase_rate || p.purchase_rate) || 0;
          const transport = Number(p.transport_charge) || 10;
          const local = Number(p.local_transport) || 5;
          const packaging = Number(p.packaging_cost) || 1.5;
          const value = Number(p.value) || purchase + transport + local + packaging;
          const discount_30 = Number(p.discount_30) || (purchase * 30) / 100;
          const discount_25 = Number(p.discount_25) || (purchase * 25) / 100;
          const discount_50 = Number(p.discount_50) || (purchase * 50) / 100;
          const gstPercent = Number(p.gst) || 0;
          const salesRate = value * 1.5;
          const gstAmount = (salesRate * gstPercent) / 100;
          const total = Number(p.total) || salesRate + gstAmount;

          return {
            ...p,
            purchase_rate: purchase,
            size: p.size,              // FIXED: use p.size
            value,
            discount_30,
            discount_25,
            discount_50,
            total,
            gstAmount,
          };
        });
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        const data = action.payload;
        const purchase = Number(data.purchase_rate || data.purchase_rate) || 0;
        const transport = Number(data.transport_charge) || 10;
        const local = Number(data.local_transport) || 5;
        const packaging = Number(data.packaging_cost) || 1.5;
        const value = purchase + transport + local + packaging;
        const discount_30 = (purchase * 30) / 100;
        const discount_25 = (purchase * 25) / 100;
        const discount_50 = (purchase * 50) / 100;
        const salesRate = value * 1.5;
        const gstPercent = Number(data.gst) || 0;
        const gstAmount = (salesRate * gstPercent) / 100;
        const total = salesRate + gstAmount;

        state.list.push({
          ...data,
          purchase_rate: purchase,
          size: data.size,           // FIXED: use data.size
          value,
          discount_30,
          discount_25,
          discount_50,
          total,
          gstAmount,
        });
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          const data = action.payload;
          const purchase = Number(data.purchase_rate || data.purchase_rate) || 0;
          const transport = Number(data.transport_charge) || 10;
          const local = Number(data.local_transport) || 5;
          const packaging = Number(data.packaging_cost) || 1.5;
          const value = purchase + transport + local + packaging;
          const discount_30 = (purchase * 30) / 100;
          const discount_25 = (purchase * 25) / 100;
          const discount_50 = (purchase * 50) / 100;
          const salesRate = value * 1.5;
          const gstPercent = Number(data.gst) || 0;
          const gstAmount = (salesRate * gstPercent) / 100;
          const total = salesRate + gstAmount;

          state.list[index] = {
            ...data,
            purchase_rate: purchase,
            size: data.size,          // FIXED: use data.size
            value,
            discount_30,
            discount_25,
            discount_50,
            total,
            gstAmount,
          };
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export default productSlice.reducer;

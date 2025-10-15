import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PurchaseAPI from "../../axios/purchaseApi";

// ✅ Thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await PurchaseAPI.getAll();
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Error while fetching purchases";
      return rejectWithValue(message);
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  "purchases/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await PurchaseAPI.getById(id);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Error while fetching purchase details";
      return rejectWithValue(message);
    }
  }
);

export const addPurchase = createAsyncThunk(
  "purchases/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await PurchaseAPI.create(data);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Error while adding purchase";
      return rejectWithValue(message);
    }
  }
);

// ✅ Slice
const purchasesSlice = createSlice({
  name: "purchases",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch by ID
    builder.addCase(fetchPurchaseById.fulfilled, (state, action) => {
      state.selected = action.payload;
    });

    // Add Purchase
    builder
      .addCase(addPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPurchase.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.list)) {
          state.list.unshift(action.payload);
        } else {
          state.list = [action.payload];
        }
      })
      .addCase(addPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelected, clearError } = purchasesSlice.actions;
export default purchasesSlice.reducer;

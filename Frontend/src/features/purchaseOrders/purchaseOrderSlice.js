import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PurchaseOrderAPI from "../../axios/PurchaseOrderAPI";

// Async Thunks
export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchAll",
  async () => {
    const res = await PurchaseOrderAPI.getAll();
    return res.data; // expect array or {data: []} adjust if needed
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  "purchaseOrders/fetchById",
  async (id) => {
    const res = await PurchaseOrderAPI.getById(id);
    return res.data; // single PO object
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/create",
  async (data) => {
    const res = await PurchaseOrderAPI.create(data);
    return res.data; // could be {purchase_order} or PO
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/update",
  async ({ id, data }) => {
    const res = await PurchaseOrderAPI.update(id, data);
    return res.data; // could be {purchase_order} or PO
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/delete",
  async (id) => {
    await PurchaseOrderAPI.delete(id);
    return id; // return deleted id for reducer
  }
);

// Helpers
const uidOf = (po) => String(po?.id || po?._id || "");
const normalizePayloadPO = (payload) => payload?.purchase_order || payload;

// Slice
const purchaseOrderSlice = createSlice({
  name: "purchaseOrders",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentPO: (state) => {
      state.current = null;
    },
    // Optional: for optimistic UI in list
    setList: (state, action) => {
      state.list = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        // If API returns shape {data: []}, adjust: state.list = action.payload.data;
        state.list = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load Purchase Orders";
      })

      // Fetch By ID
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.current = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload || null;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load PO";
      })

      // Create
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const po = normalizePayloadPO(action.payload);
        const uid = uidOf(po);
        if (uid) {
          const idx = state.list.findIndex((x) => uidOf(x) === uid);
          if (idx === -1) state.list.push(po);
          else state.list[idx] = po; // replace if server echoes existing
        } else {
          state.error = "Invalid PO returned from server";
        }
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to create PO";
      })

      // Update
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPO = normalizePayloadPO(action.payload);
        const uid = uidOf(updatedPO);
        if (uid) {
          const index = state.list.findIndex((po) => uidOf(po) === uid);
          if (index !== -1) state.list[index] = updatedPO;
          else state.list.push(updatedPO); // edge: not in list, append
        } else {
          state.error = "Invalid updated PO from server";
        }
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to update PO";
      })

      // Delete
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        const delId = String(action.payload);
        state.list = state.list.filter((po) => uidOf(po) !== delId);
      });
  },
});

export const { clearCurrentPO, setList } = purchaseOrderSlice.actions; // setList is optional but handy for optimistic UI
export default purchaseOrderSlice.reducer;

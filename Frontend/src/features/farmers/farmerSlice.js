
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import farmerAPI from "../../axios/farmerAPI";
import { toast } from "react-toastify";

// ✅ Thunks
export const fetchFarmers = createAsyncThunk("farmers/fetchFarmers", async () => {
  const res = await farmerAPI.getAll();
  return res.data;
});

// addFarmer
export const addFarmer = createAsyncThunk("farmers/addFarmer", async (data, { rejectWithValue }) => {
  try {
    const res = await farmerAPI.create({
      ...data,
      balance: data.balance ?? undefined,
      min_balance: data.min_balance ?? undefined,
    });
    toast.success("Farmer successfully registered! 🎉");
    return res.data;
  } catch (error) {
    toast.error("Failed to register farmer. Please try again.");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// updateFarmer
export const updateFarmer = createAsyncThunk(
  "farmers/updateFarmer",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await farmerAPI.update(id, {
        ...data,
        // numbers already handled in your code
        balance: data.balance ?? undefined,
        min_balance: data.min_balance ?? undefined,
      });
      // Optional console check
      // console.log("updateFarmer OK", res.status, res.data);
      toast.success("Farmer details updated successfully! ✅");
      return res.data;
    } catch (error) {
      // console.error("updateFarmer ERR", error.response?.status, error.response?.data);
      toast.error("Failed to update farmer details. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const deleteFarmer = createAsyncThunk("farmers/deleteFarmer", async (id, { rejectWithValue }) => {
  try {
    await farmerAPI.remove(id);
    toast.success("Farmer deleted successfully! 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete farmer. Please try again.");
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateFarmerStatus = createAsyncThunk(
  "farmers/updateFarmerStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await farmerAPI.updateStatus(id, status);
      toast.success(`Farmer ${status === 'active' ? 'activated' : 'deactivated'} successfully! ✅`);
      return { id, status };
    } catch (error) {
      toast.error("Failed to update farmer status. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Slice
const farmerSlice = createSlice({
  name: "farmers",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmers.pending, (state) => {
        state.loading = true;
      })
.addCase(fetchFarmers.fulfilled, (state, action) => {
  state.loading = false;
  state.list = (action.payload || []).map(f => ({
    ...f,
    balance: Number(f.balance ?? 0),
    min_balance: Number(f.min_balance ?? 5000),
  }));
})
      .addCase(fetchFarmers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
.addCase(addFarmer.fulfilled, (state, action) => {
  const f = action.payload?.farmer || action.payload || {};
  const normalized = {
    ...f,
    balance: Number(f.balance ?? 0),
    min_balance: Number(f.min_balance ?? 5000),
  };
  state.list.push(normalized);
})
.addCase(updateFarmer.fulfilled, (state, action) => {
  const incoming = action.payload?.farmer || action.payload || {};
  const idx = state.list.findIndex((f) => f.id === incoming.id);
  if (idx !== -1) {
    state.list[idx] = {
      ...state.list[idx],
      ...incoming,
      balance: Number(incoming.balance ?? state.list[idx].balance ?? 0),
      min_balance: Number(incoming.min_balance ?? state.list[idx].min_balance ?? 5000),
    };
  }
})
      .addCase(deleteFarmer.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f.id !== action.payload);
      })
      .addCase(updateFarmerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFarmerStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.list[index].status = action.payload.status;
        }
      })
      .addCase(updateFarmerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || "Status update failed");
      });
  },
});

export default farmerSlice.reducer;

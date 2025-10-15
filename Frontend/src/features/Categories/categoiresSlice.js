import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryAPI from "../../axios/categoryAPI";
import { toast } from "react-toastify";

// 🔹 Fetch all
export const fetchCategories = createAsyncThunk("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await categoryAPI.getAll();
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// 🔹 Add
export const addCategory = createAsyncThunk("categories/add", async (data, { rejectWithValue }) => {
  try {
    const res = await categoryAPI.create(data);
    toast.success("Category added ✅");
    return { id: res.data.id, name: data.name, status: res.data.status || "Active" };
  } catch (error) {
    toast.error("Failed to add category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// 🔹 Update (name or both)
export const updateCategory = createAsyncThunk("categories/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    await categoryAPI.update(id, data);
    toast.success("Category updated ✅");
    return { id, ...data };
  } catch (error) {
    toast.error("Failed to update category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// 🔹 Delete
export const deleteCategory = createAsyncThunk("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await categoryAPI.remove(id);
    toast.success("Category deleted 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete category ❌");
    return rejectWithValue(error.response?.data || error.message);
  }
});

// 🔹 Update only status
export const updateCategoryStatus = createAsyncThunk(
  "categories/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await categoryAPI.updateStatus(id, status);
      toast.success(`Status changed to ${status} ⚡`);
      return { id, status };
    } catch (error) {
      toast.error("Failed to update status ❌");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Slice
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })

      // Status update
      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index].status = action.payload.status;
        }
      });
  },
});

export default categorySlice.reducer;

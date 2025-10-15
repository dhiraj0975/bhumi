// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast } from "react-toastify";
// import vendorAPI from "../../axios/vendorsAPI";

// // ✅ Thunks
// export const fetchVendors = createAsyncThunk("vendor/fetchVendors", async () => {
//   const res = await vendorAPI.getAll();
//   console.log("Fetched Vendors:", res.data); // Debug log
//   return res.data;
// });

// // In vendorSlice addVendor thunk
// export const addVendor = createAsyncThunk("vendor/addVendor", async (vendor, { rejectWithValue }) => {
//   try {
//     const res = await vendorAPI.create(vendor);
//     console.log("Vendor created successfully:", res.data); // Debug log
//     toast.success("Vendor successfully registered! 🎉");
//     return res.data;
//   } catch (error) {
//     console.error("Error creating vendor:", error); // Debug log
//     toast.error("Failed to register vendor. Please try again.");
//     return rejectWithValue(error.response?.data || error.message);
//   }
// });

// export const updateVendor = createAsyncThunk(
//   "vendor/updateVendor",
//   async ({ id, vendor }, { rejectWithValue }) => {
//     try {
//       const res = await vendorAPI.update(id, vendor);
//       toast.success("Vendor details updated successfully! ✅");
//       // Backend may return only a message; optimistically update using submitted data
//       return { id, data: vendor };
//     } catch (error) {
//       toast.error("Failed to update vendor details. Please try again.");
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const deleteVendor = createAsyncThunk("vendor/deleteVendor", async (id, { rejectWithValue }) => {
//   try {
//     await vendorAPI.remove(id);
//     toast.success("Vendor deleted successfully! 🗑️");
//     return id;
//   } catch (error) {
//     toast.error("Failed to delete vendor. Please try again.");
//     return rejectWithValue(error.response?.data || error.message);
//   }
// });

// export const updateVendorStatus = createAsyncThunk(
//   "vendor/updateVendorStatus",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       await vendorAPI.updateStatus(id, status);
//       toast.success(`Vendor ${status === 'active' ? 'activated' : 'deactivated'} successfully! ✅`);
//       return { id, status };
//     } catch (error) {
//       toast.error("Failed to update vendor status. Please try again.");
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // ✅ Slice
// const vendorSlice = createSlice({
//   name: "vendor",
//   initialState: {
//     vendors: [],
//     loading: false,
//     error: null,
//     editingVendor: null,
//   },
//   reducers: {
//     setEditingVendor: (state, action) => {
//       console.log("setEditingVendor Payload:", action.payload); // Debug log
//       const payload = JSON.parse(JSON.stringify(action.payload)); // Deep clone
//       state.editingVendor = {
//         ...payload,
//         bank: {
//           pan_number: payload.bank?.pan_number || "",
//           account_holder_name: payload.bank?.account_holder_name || "",
//           bank_name: payload.bank?.bank_name || "",
//           account_number: payload.bank?.account_number || "",
//           ifsc_code: payload.bank?.ifsc_code || "",
//           branch_name: payload.bank?.branch_name || "",
//         }, // Ensure all bank fields are initialized
//       };
//     },
//     clearEditingVendor: (state) => {
//       state.editingVendor = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchVendors.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchVendors.fulfilled, (state, action) => {
//         state.loading = false;
//         state.vendors = action.payload;
//       })
//       .addCase(fetchVendors.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//         toast.error(action.error.message || "Failed to load vendors");
//       })

//       // Add
//       .addCase(addVendor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//   .addCase(addVendor.fulfilled, (state, action) => {
//   state.loading = false;
//   // Check if the response has vendor property, otherwise use the entire payload
//   const vendorData = action.payload.vendor || action.payload;
//   state.vendors.push(vendorData);
//   toast.success("Vendor created");
// })
//       .addCase(addVendor.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//         toast.error(action.error.message || "Create failed");
//       })

//       // Update
//       .addCase(updateVendor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateVendor.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.vendors.findIndex((v) => v.id === action.payload.id);
//         if (index !== -1) {
//           // Update the vendor object, including the nested bank object
//           state.vendors[index] = {
//             ...state.vendors[index],
//             ...action.payload.data,
//             bank: {
//               ...state.vendors[index].bank,
//               ...action.payload.data.bank,
//             },
//           };
//         }
//         state.editingVendor = null;
//         toast.success("Vendor updated");
//       })
//       .addCase(updateVendor.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//         toast.error(action.error.message || "Update failed");
//       })

//       // Delete
//       .addCase(deleteVendor.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteVendor.fulfilled, (state, action) => {
//         state.loading = false;
//         state.vendors = state.vendors.filter((v) => v.id !== action.payload);
      
//       })
//       .addCase(deleteVendor.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//         toast.error(action.error.message || "Delete failed");
//       })

//       // Update Status
//       .addCase(updateVendorStatus.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateVendorStatus.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.vendors.findIndex((v) => v.id === action.payload.id);
//         if (index !== -1) {
//           state.vendors[index].status = action.payload.status;
//         }
//       })
//       .addCase(updateVendorStatus.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//         toast.error(action.error.message || "Status update failed");
//       });
//   },
// });

// export const { setEditingVendor, clearEditingVendor } = vendorSlice.actions;
// export default vendorSlice.reducer;







import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
} from "./vendorThunks";

const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
    editingVendor: null,
  },
  reducers: {
 setEditingVendor: (state, action) => {
  const payload = JSON.parse(JSON.stringify(action.payload));
  state.editingVendor = {
    ...payload,
    bank: {
      pan_number: payload.bank?.pan_number || payload.pan_number || "",
      account_holder_name: payload.bank?.account_holder_name || payload.account_holder_name || "",
      bank_name: payload.bank?.bank_name || payload.bank_name || "",
      account_number: payload.bank?.account_number || payload.account_number || "",
      ifsc_code: payload.bank?.ifsc_code || payload.ifsc_code || "",
      branch_name: payload.bank?.branch_name || payload.branch_name || "",
    },
  };
},
    clearEditingVendor: (state) => {
      state.editingVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add
      .addCase(addVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        state.loading = false;
        const v = action.payload?.vendor || action.payload || {};
        // Normalize to flat row shape expected by list/grid
        const normalized = {
          id: v.id ?? v.vendor_id ?? v._id,
          vendor_name: v.vendor_name,
          firm_name: v.firm_name,
          gst_no: v.gst_no,
          address: v.address,
          contact_number: v.contact_number,
          status: (v.status || "").toString(),
          // Flatten possible nested bank object or accept flat fields
          pan_number: v.bank?.pan_number ?? v.pan_number ?? "",
          account_holder_name: v.bank?.account_holder_name ?? v.account_holder_name ?? "",
          bank_name: v.bank?.bank_name ?? v.bank_name ?? "",
          account_number: v.bank?.account_number ?? v.account_number ?? "",
          ifsc_code: v.bank?.ifsc_code ?? v.ifsc_code ?? "",
          branch_name: v.bank?.branch_name ?? v.branch_name ?? "",
        };
        // Only push if we have a valid id; otherwise let fetchVendors refresh the list
        if (normalized.id !== undefined && normalized.id !== null && normalized.id !== "") {
          // Deduplicate by id if it already exists
          const existsIndex = state.vendors.findIndex((row) => (row.id ?? row._id ?? row.vendor_id) === normalized.id);
          if (existsIndex >= 0) {
            state.vendors[existsIndex] = { ...state.vendors[existsIndex], ...normalized };
          } else {
            state.vendors.push(normalized);
          }
        }
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
.addCase(updateVendor.fulfilled, (state, action) => {
  state.loading = false;
  const updated = action.payload;
  const index = state.vendors.findIndex(v => v.id === updated.id);
  if (index !== -1) {
    state.vendors[index] = {
      ...state.vendors[index],
      ...updated,
      bank: {
        ...state.vendors[index].bank,
        ...updated.bank,
      },
    };
  }
  state.editingVendor = null;
})




      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter((v) => v.id !== action.payload);
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Status
      .addCase(updateVendorStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index].status = action.payload.status;
        }
      })
      .addCase(updateVendorStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setEditingVendor, clearEditingVendor } = vendorSlice.actions;
export default vendorSlice.reducer;

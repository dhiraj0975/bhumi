import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import vendorAPI from "../../axios/vendorsAPI.js";

export const fetchVendors = createAsyncThunk("vendor/fetchVendors", async () => {
  const res = await vendorAPI.getAll();
  return res.data;
});

export const addVendor = createAsyncThunk(
  "vendor/addVendor",
  async (vendor, { rejectWithValue }) => {
    try {
      const res = await vendorAPI.create({
        vendor_name: vendor.vendor_name,
        firm_name: vendor.firm_name,
        gst_no: vendor.gst_no,
        address: vendor.address,
        contact_number: vendor.contact_number,
        status: vendor.status || "active",
        balance: vendor.balance ?? undefined,
        min_balance: vendor.min_balance ?? undefined,
        bank: vendor.bank || {}
      });
      toast.success("Vendor successfully registered! 🎉");
      return res.data;
    } catch (error) {
      toast.error("Failed to register vendor. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendor/updateVendor",
  async ({ id, vendor }, { rejectWithValue }) => {
    try {
      const res = await vendorAPI.update(id, {
        ...vendor,
        balance: vendor.balance ?? undefined,
        min_balance: vendor.min_balance ?? undefined,
        bank: vendor.bank
      });
      toast.success("Vendor details updated successfully! ✅");
      return res.data.vendor || res.data;
    } catch (error) {
      toast.error("Failed to update vendor details. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVendor = createAsyncThunk("vendor/deleteVendor", async (id, { rejectWithValue }) => {
  try {
    await vendorAPI.remove(id);
    toast.success("Vendor deleted successfully! 🗑️");
    return id;
  } catch (error) {
    toast.error("Failed to delete vendor. Please try again.");
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateVendorStatus = createAsyncThunk(
  "vendor/updateVendorStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await vendorAPI.updateStatus(id, status);
      toast.success(`Vendor ${status === "active" ? "activated" : "deactivated"} successfully! ✅`);
      return { id, status };
    } catch (error) {
      toast.error("Failed to update vendor status. Please try again.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

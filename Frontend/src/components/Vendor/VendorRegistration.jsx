import React, { useEffect, useState } from "react";
import {
  Building2, FileText, MapPin, Phone, CreditCard, Landmark, FileSignature
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingVendor } from "../../features/vendor/vendorSlice";
import { addVendor, fetchVendors, updateVendor } from "../../features/vendor/vendorThunks";
import { toast } from "react-toastify";

const VendorRegistration = ({ onAddVendor }) => {
  const dispatch = useDispatch();
  const { editingVendor } = useSelector((state) => state.vendors);

  const [form, setForm] = useState({
    vendor_name: "",
    firm_name: "",
    gst_no: "",
    address: "",
    contact_number: "",
    balance: "",         // ADDED
    min_balance: "5000", // ADDED
    pan_number: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
  });

  useEffect(() => {
    if (editingVendor) {
      setForm({
        vendor_name: editingVendor.vendor_name || "",
        firm_name: editingVendor.firm_name || "",
        gst_no: editingVendor.gst_no || "",
        address: editingVendor.address || "",
        contact_number: editingVendor.contact_number || "",
        balance: editingVendor.balance ?? "",              // ADDED
        min_balance: editingVendor.min_balance ?? "5000",  // ADDED
        pan_number: editingVendor.bank?.pan_number || "",
        account_holder_name: editingVendor.bank?.account_holder_name || "",
        bank_name: editingVendor.bank?.bank_name || "",
        account_number: editingVendor.bank?.account_number || "",
        ifsc_code: editingVendor.bank?.ifsc_code || "",
        branch_name: editingVendor.bank?.branch_name || "",
      });
    } else {
      setForm({
        vendor_name: "",
        firm_name: "",
        gst_no: "",
        address: "",
        contact_number: "",
        balance: "",         // ADDED
        min_balance: "5000", // ADDED
        pan_number: "",
        account_holder_name: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
      });
    }
  }, [editingVendor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      const payload = {
        vendor_name: form.vendor_name,
        firm_name: form.firm_name,
        gst_no: form.gst_no,
        address: form.address,
        contact_number: form.contact_number,
        status: editingVendor?.status || "active",
        balance: form.balance === "" ? undefined : Number(form.balance),             // ADDED
        min_balance: form.min_balance === "" ? undefined : Number(form.min_balance), // ADDED
        bank: {
          pan_number: form.pan_number,
          account_holder_name: form.account_holder_name,
          bank_name: form.bank_name,
          account_number: form.account_number,
          ifsc_code: form.ifsc_code,
          branch_name: form.branch_name,
        },
      };

      if (editingVendor) {
        result = await dispatch(updateVendor({ id: editingVendor.id, vendor: payload }));
        dispatch(clearEditingVendor());
      } else {
        result = await dispatch(addVendor(payload));
      }

      if (result.meta.requestStatus === "rejected") {
        throw new Error(result.payload?.error || "Submission failed");
      }

      setForm({
        vendor_name: "",
        firm_name: "",
        gst_no: "",
        address: "",
        contact_number: "",
        balance: "",         // ADDED
        min_balance: "5000", // ADDED
        pan_number: "",
        account_holder_name: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
      });

      dispatch(fetchVendors());
      onAddVendor?.();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-8 rounded-2xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        {editingVendor ? "Update Vendor" : "Vendor Registration"}
      </h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Building2 className="text-blue-600" size={18} /> Vendor Name
          </label>
          <input
            type="text"
            name="vendor_name"
            value={form.vendor_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter vendor name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Building2 className="text-blue-600" size={18} /> Firm Name
          </label>
          <input
            type="text"
            name="firm_name"
            value={form.firm_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter firm name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <FileText className="text-blue-600" size={18} /> GST Number
          </label>
          <input
            type="text"
            name="gst_no"
            value={form.gst_no}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter GST number"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1 flex items-center gap-2">
            <MapPin className="text-blue-600" size={18} /> Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter complete address"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Phone className="text-blue-600" size={18} /> Contact Number
          </label>
          <input
            type="text"
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter contact number"
            required
          />
        </div>

        {/* ADDED: Balance */}
        <div>
          <label className="block font-medium mb-1">Balance</label>
          <input
            type="number"
            name="balance"
            min={0}
            step="0.01"
            value={form.balance}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        {/* ADDED: Minimum Balance */}
        <div>
          <label className="block font-medium mb-1">Minimum Balance</label>
          <input
            type="number"
            name="min_balance"
            min={0}
            step="0.01"
            value={form.min_balance}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="5000.00"
            required
          />
        </div>
      </div>

      {/* Bank Details */}
      <h3 className="text-xl font-semibold text-gray-700 border-b pb-1">Bank Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* existing bank inputs unchanged */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <FileSignature className="text-blue-600" size={18} /> PAN Number
          </label>
          <input
            type="text"
            name="pan_number"
            value={form.pan_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter PAN number"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> Account Holder Name
          </label>
          <input
            type="text"
            name="account_holder_name"
            value={form.account_holder_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account holder name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} /> Bank Name
          </label>
          <input
            type="text"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter bank name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> Account Number
          </label>
          <input
            type="text"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter account number"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={18} /> IFSC Code
          </label>
          <input
            type="text"
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter IFSC code"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            <Landmark className="text-blue-600" size={18} /> Branch Name
          </label>
          <input
            type="text"
            name="branch_name"
            value={form.branch_name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter branch name"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full curser-pointer bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
        >
          {editingVendor ? "Update Vendor" : "Register Vendor"}
        </button>
      </div>
    </form>
  );
};

export default VendorRegistration;

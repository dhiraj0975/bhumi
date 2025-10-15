import { configureStore } from "@reduxjs/toolkit";
import vendorReducer from "../features/vendor/vendorSlice";
import farmerReducer from './../features/farmers/farmerSlice'; // 👈 naya slice import
import categoryReducer from './../features/Categories/categoiresSlice'; // 👈 naya slice import
import productReducer from "../features/products/productsSlice";
import purchasesReducer from "../features/purchase/purchaseSlice";
import purchaseOrdersReducer from "../features/purchaseOrders/purchaseOrderSlice";

const store = configureStore({
  reducer: {
    vendors: vendorReducer,
    farmers: farmerReducer,
    categories: categoryReducer,
    products: productReducer, // ✅ Add products
    purchases: purchasesReducer,
    purchaseOrders: purchaseOrdersReducer, 
   
  },
});


export default store;

"use client";
import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import { useAuth } from "./contexts/AuthContext";
import { useCompany } from "./contexts/CompanyContext";

// Pages
import Dashboard from "./Pages/Dashboard";
import VendorManagement from "./Pages/VendorManagement.jsx";
import FarmerRegistrationPage from "./Pages/FarmerRegistrationPage";
import ProformaInvoice from "./Pages/ProformaInvoice";
import Categories from "./components/categories/Categories";
import Products from "./Pages/products/Products";

import Purchases from "./components/purchase/Purchases.jsx";
import PurchaseEdit from "./Pages/purchase/PurchaseEdit.jsx";
import PurchaseView from "./Pages/purchase/PurchaseView.jsx";

import CustomersPage from "./components/customers/CustomersPage.jsx";
import SalesPage from "./components/Sales/SalesPage";

import PurchaseOrders from "./components/PurchaseOrder/PurchaseOrders.jsx";
import Invoice from "./components/PurchaseOrder/Invoice.jsx";

import SalesOrders from "./components/salesOrders/SalesOrders.jsx";
import SalesInvoice from "./components/salesOrders/SalesOrderInvoice.jsx";

import CompaniesPage from "./components/Company/CompaniesPage.jsx";
import PurchaseForm from "./components/purchase/PurchaseForm.jsx";
import LoginPage from './Pages/LoginPage';

// Protected shell: Sidebar + Navbar + keyed Outlet
function AppShell() {
  const { company } = useCompany();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const toggleCollapse = () => setCollapsed((v) => !v);

  // Child routes re-mount on company change → auto refetch without per-page code
  const outletKey = useMemo(() => company?.code || "no-company", [company]);

  return (
    <div className="flex min-h-screen bg-[var(--secondary-bg)]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        toggleCollapse={toggleCollapse}
      />

      {/* Main */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-64"} ml-0`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-2 overflow-y-auto">
          <Outlet key={outletKey} />
        </main>
      </div>
    </div>
  );
}

// Public shell: dedicated login route only
function PublicShell() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default function App() {
  const { token } = useAuth();

  if (!token) return <PublicShell />;

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Masters */}
          <Route path="/vendor" element={<VendorManagement />} />
          <Route path="/farmer" element={<FarmerRegistrationPage />} />
          <Route path="/category" element={<Categories />} />
          <Route path="/product" element={<Products />} />
          <Route path="/customers" element={<CustomersPage />} />

          {/* Purchases */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/edit/:poId" element={<PurchaseEdit />} />
          <Route path="/purchases/view/:poId" element={<PurchaseView />} />
          <Route path="/purchases/create" element={<PurchaseForm />} />

          {/* Sales */}
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales-orders" element={<SalesOrders />} />
          <Route path="/sales-invoice/:id" element={<SalesInvoice />} />

          {/* Purchase Orders */}
          <Route path="/po-order" element={<PurchaseOrders />} />
          <Route path="/invoice/:id" element={<Invoice />} />

          {/* Companies */}
          <Route path="/company/new" element={<CompaniesPage />} />
        </Route>

        {/* Unknown to dashboard (logged-in users) */}
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Single toast container at app root for logged-in shell */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

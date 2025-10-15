"use client";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, collapsed, toggleSidebar, toggleCollapse }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
      location.pathname === path
        ? "bg-[var(--accent)] text-white"
        : "hover:bg-[var(--secondary-bg)] text-[var(--text-color)]"
    }`;

  // Small helper for emoji stickers
  const Sticker = ({ label, symbol, className = "", decorative = false }) => (
    <span
      className={`text-xl leading-none select-none ${className}`}
      {...(decorative
        ? { "aria-hidden": "true" }
        : { role: "img", "aria-label": label })}
    >
      {symbol}
    </span>
  );

  // Chevron for dropdown indicator
  const Chevron = ({ open }) => (
    <span
      className={`inline-block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      ▼
    </span>
  );

  // Left chevron for collapse toggle
  const ChevronLeft = ({ rotated }) => (
    <span
      className={`inline-block transition-transform duration-300 ${rotated ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      ◀
    </span>
  );

  // Hamburger for mobile close
  const Bars = () => (
    <span aria-hidden="true">☰</span>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[var(--bg)] shadow-lg transition-all duration-300 z-50
      ${collapsed ? "w-20" : "w-64"}
      ${isOpen ? "translate-x-0" : "-translate-x-64"}
      md:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-[var(--accent)]">
            Billing System
          </Link>
        )}
        <div className="flex gap-2">
          {/* Collapse button (desktop) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--secondary-bg)]"
            aria-label="Toggle collapse"
          >
            <ChevronLeft rotated={collapsed} />
          </button>

          {/* Close button (mobile) */}
          <button className="md:hidden w-8 h-8 grid place-items-center" onClick={toggleSidebar} aria-label="Close sidebar">
            <Bars />
          </button>
        </div>
      </div>

      {/* Sidebar Links */}
      <nav className="p-4 space-y-2 font-medium">
        {/* Dashboard */}
        <Link to="/" className={linkClass("/")}>
          <Sticker label="Dashboard" symbol="🏠" decorative={collapsed ? false : true} />
          {!collapsed && "Dashboard"}
        </Link>

        {/* Masters Dropdown */}
        <div>
          <button
            onClick={() => toggleDropdown("masters")}
            className="flex items-center justify-between w-full px-4 py-2 rounded-md hover:bg-[var(--secondary-bg)] text-[var(--text-color)]"
            aria-expanded={openMenu === "masters"}
            aria-controls="menu-masters"
          >
            <span className="flex items-center gap-3">
              <Sticker label="Masters" symbol="📁" decorative={collapsed ? false : true} />
              {!collapsed && "Masters"}
            </span>
            {!collapsed && <Chevron open={openMenu === "masters"} />}
          </button>

          {openMenu === "masters" && !collapsed && (
            <div id="menu-masters" className="ml-6 mt-1 space-y-1">
              <Link to="/proforma" className={linkClass("/proforma")}>
                <Sticker label="Proforma Invoice" symbol="🧾" decorative={collapsed ? false : true} />
                {!collapsed && "Proforma Invoice"}
              </Link>

              <Link to="/gst" className={linkClass("/gst")}>
                <Sticker label="GST Details" symbol="📊" decorative={collapsed ? false : true} />
                {!collapsed && "GST Details"}
              </Link>
            </div>
          )}
        </div>

        {/* Extra Links */}
        <Link to="/vendor" className={linkClass("/vendor")}>
          <Sticker label="Vendor" symbol="🧑‍💼" decorative={collapsed ? false : true} />
          {!collapsed && "Vendor"}
        </Link>

        <Link to="/farmer" className={linkClass("/farmer")}>
          <Sticker label="Farmer" symbol="🚜" decorative={collapsed ? false : true} />
          {!collapsed && "Farmer"}
        </Link>



                <Link to="/customers" className={linkClass("/customers")}>
          <Sticker label="Customers" symbol="👥" decorative={collapsed ? false : true} />
          {!collapsed && "Customers"}
        </Link>

        <Link to="/category" className={linkClass("/category")}>
          <Sticker label="Category" symbol="🏷️" decorative={collapsed ? false : true} />
          {!collapsed && "Category"}
        </Link>



        <Link to="/product" className={linkClass("/product")}>
          <Sticker label="Products" symbol="📦" decorative={collapsed ? false : true} />
          {!collapsed && "Products"}
        </Link>

         <Link to="/po-order" className={linkClass("/po-order")}>
        <Sticker label="PO Order" symbol="🛍️" decorative={collapsed ? false : true} />
        {!collapsed && "PO Order"}
      </Link>

              <Link to="/purchases" className={linkClass("/purchases")}>
          <Sticker label="Purchases" symbol="🛒" decorative={collapsed ? false : true} />
          {!collapsed && "Purchases"}
        </Link>


      <Link to="/sales-orders" className={linkClass("/sales-orders")}>
  <Sticker label="Sales Orders" symbol="➕" decorative={collapsed ? false : true} />
  {!collapsed && "Sales Orders"}
     </Link>


        <Link to="/sales" className={linkClass("/sales")}>
          <Sticker label="Sales" symbol="💹" decorative={collapsed ? false : true} />
          {!collapsed && "Sales"}
        </Link>


        <Link to="/company/new" className={linkClass("/company/new")}>
          <Sticker label="Company" symbol="🏢" decorative={collapsed ? false : true} />
          {!collapsed && "Company"}
        </Link>


      </nav>
    </aside>
  );
}

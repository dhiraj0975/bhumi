import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import companyAPI from "../../axios/companyAPI";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company: currentCompany, setActiveCompany } = useCompany();

  const [openProfile, setOpenProfile] = useState(false);
  const [showChange, setShowChange] = useState(false);

  // Companies dropdown state
  const [companies, setCompanies] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load companies list once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await companyAPI.getAll();
        if (mounted) setCompanies(res?.data || []);
      } catch (e) {
        console.error("Companies load failed", e);
        if (mounted) setCompanies([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Close popovers on outside click
  const profileRef = useRef(null);
  const companyRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
      if (companyRef.current && !companyRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const companyLabel = useMemo(
    () => currentCompany?.name || currentCompany?.code || "Select Company",
    [currentCompany]
  );

  const selectCompany = (c) => {
    setActiveCompany(c);                 // Context + localStorage + broadcast
    // Optional: axios tenant header
    // companyAPI.setTenant(c.code);
    setMenuOpen(false);                  // Close dropdown immediately
  };

  return (
    <header className="flex items-center justify-between bg-[var(--bg)] shadow px-6 py-3 sticky top-0 z-40">
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-[var(--text-color)] text-xl leading-none"
        aria-label="Open sidebar menu"
        title="Menu"
      >
        <span role="img" aria-label="menu">☰</span>
      </button>

      <h1 className="text-lg font-bold text-[var(--accent)]">Bhumisha Organics</h1>

      <div className="flex items-center gap-3">
        {/* Company colored pill + simple names dropdown */}
        <div className="relative" ref={companyRef}>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-sm transition inline-flex items-center gap-2
              ${currentCompany
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"}`}
            title="Select Company"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {currentCompany && <span className="inline-block w-2 h-2 rounded-full bg-white/70" />}
            <span className="truncate max-w-[220px]">{companyLabel}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-90">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-lg border z-50">
              <div className="px-3 py-2 border-b text-xs text-gray-500">Choose company</div>
              <ul className="max-h-72 overflow-auto py-1">
                {companies.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">No companies</li>
                ) : (
                  companies.map((c) => {
                    const active = currentCompany && String(currentCompany.code) === String(c.code);
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); selectCompany(c); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between
                            ${active ? "bg-green-50 text-green-700" : "text-gray-800"}`}
                        >
                          <span className="truncate">{c.name || c.code}</span>
                          {active && <span className="inline-block w-2 h-2 rounded-full bg-green-500" />}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          {!user ? (
            <div className="text-sm text-gray-600">Not logged in</div>
          ) : (
            <>
              <button
                className="flex items-center gap-2"
                onClick={() => setOpenProfile((s) => !s)}
                title="Profile"
                aria-haspopup="menu"
                aria-expanded={openProfile}
              >
                <span className="text-sm">{user?.full_name || user?.username}</span>
                <span className="text-2xl">👤</span>
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-2 bg-white rounded shadow p-2 w-44">
                  <button
                    onClick={() => { setShowChange(true); setOpenProfile(false); }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Change password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}

              {showChange && <ChangePasswordModal onClose={() => setShowChange(false)} />}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const CompanyCtx = createContext(null);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(() => {
    try { return JSON.parse(localStorage.getItem("currentCompany") || "null"); } catch { return null; }
  });

  useEffect(() => {
    // Bootstrap legacy key so axios interceptor gets the code at first render
    try {
      if (company?.code) {
        localStorage.setItem("company_code", String(company.code).toLowerCase());
      }
    } catch {}
  }, []); // run once at mount

  const setActiveCompany = (c) => {
    setCompany(c);
    try {
      localStorage.setItem("currentCompany", JSON.stringify(c));
      // Keep legacy key in sync so interceptor always has latest code
      localStorage.setItem("company_code", String(c?.code || "").toLowerCase());
    } catch {}
    window.dispatchEvent(new CustomEvent("company:changed", { detail: c }));
  };

  const value = useMemo(() => ({ company, setActiveCompany }), [company]);
  return <CompanyCtx.Provider value={value}>{children}</CompanyCtx.Provider>;
};

export const useCompany = () => useContext(CompanyCtx);

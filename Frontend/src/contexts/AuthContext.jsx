import React, { createContext, useContext, useEffect, useState } from 'react';
import authUtil from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authUtil.getAuthToken());
  const [user, setUser] = useState(authUtil.getAuthUser());

  useEffect(() => {
    // keep token in sync if changed externally
    const handleStorage = () => {
      setToken(authUtil.getAuthToken());
      setUser(authUtil.getAuthUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (token, user) => {
    authUtil.saveAuth(token, user);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    authUtil.clearAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

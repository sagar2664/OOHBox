import React from "react";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    //console.log('Stored auth:', stored); // Debug stored auth
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        //console.log('Parsed auth:', { user, token }); // Debug parsed auth
        setUserState(user);
        setToken(token);
      } catch (error) {
        //console.error('Error parsing stored auth:', error);
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const setUser = (user, token) => {
    //console.log('Setting user:', { user, token }); // Debug setting user
    setUserState(user);
    setToken(token);
    localStorage.setItem("auth", JSON.stringify({ user, token }));
  };

  const logout = () => {
    //console.log('Logging out'); // Debug logout
    setUserState(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 
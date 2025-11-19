// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem("brb_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("brb_user");
      }
    }
  }, []);

  const login = async ({ email }) => {
    const fakeUser = { id: email, email };
    setUser(fakeUser);
    localStorage.setItem("brb_user", JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("brb_user");
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

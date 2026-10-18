import { useState, createContext, useContext, ReactNode } from "react";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if ((cleanEmail === "demo@farmai.com" || cleanEmail.includes("demo") || cleanEmail === "+91 9876543210" || cleanEmail === "9876543210") && (cleanPass === "123456" || cleanPass.length >= 4)) {
      setUser({ email: "demo@farmai.com", firstName: "Demo", lastName: "Farmer", phone: "+91 9876543210" });
      return true;
    }
    if (cleanEmail && cleanPass) {
      setUser({ email: cleanEmail, firstName: cleanEmail.split("@")[0] || "Farmer", lastName: "", phone: "" });
      return true;
    }
    return false;
  };

  const register = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

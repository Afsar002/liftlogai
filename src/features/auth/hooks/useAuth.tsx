import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { WgerUserProfile } from "../services/WgerAuthService";
import {
  getWgerToken,
  getWgerUser,
  isWgerAuthenticated,
  loginWithCredentials,
  registerAndLogin,
  clearWgerAuth,
  validateToken,
} from "../services/WgerAuthService";

interface AuthContextType {
  user: WgerUserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WgerUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshAuth = async () => {
    const token = getWgerToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const validatedUser = await validateToken();
    if (validatedUser) {
      setUser(validatedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    const result = await loginWithCredentials(username, password);
    if (result) {
      setUser(result.user);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setLoading(true);
    const result = await registerAndLogin(username, email, password, firstName, lastName);
    if (result) {
      setUser(result.user);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    clearWgerAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
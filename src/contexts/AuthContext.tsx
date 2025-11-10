import React, { createContext, useContext, useEffect, useState } from "react";

/* -------------------- Tipado del contexto -------------------- */
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/* -------------------- Creación del contexto -------------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------- Proveedor principal -------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular persistencia local (hasta crear backend real)
  useEffect(() => {
    const savedUser = localStorage.getItem("vp_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const signIn = async (email: string, _password: string) => {
    // Evita TS6133 (parámetro no usado) mientras no haya backend:
    void _password;

    setLoading(true);
    try {
      // Aquí luego conectaremos con tu backend real (POST /login)
      const mockUser = { id: "1", email };
      setUser(mockUser);
      localStorage.setItem("vp_user", JSON.stringify(mockUser));
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      throw new Error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, _password: string) => {
    // Evita TS6133 (parámetro no usado) mientras no haya backend:
    void _password;

    setLoading(true);
    try {
      // Aquí luego conectaremos con tu backend real (POST /register)
      const mockUser = { id: "1", email };
      setUser(mockUser);
      localStorage.setItem("vp_user", JSON.stringify(mockUser));
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      throw new Error("Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("vp_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------- Hook personalizado -------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

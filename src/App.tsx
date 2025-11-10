// src/App.tsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";

// ⛳️ Lazy (para módulos con named exports)
const Layout = lazy(() =>
  import("./components/Layout").then((m) => ({ default: m.Layout }))
);
const AuthForm = lazy(() =>
  import("./components/AuthForm").then((m) => ({ default: m.AuthForm }))
);
const Dashboard = lazy(() =>
  import("./components/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const AutoWhatsAppAlerts = lazy(() =>
  import("./components/AutoWhatsAppAlerts").then((m) => ({
    default: m.AutoWhatsAppAlerts,
  }))
);
const LoadingScreen = lazy(() =>
  import("./components/LoadingScreen").then((m) => ({
    default: m.LoadingScreen,
  }))
);

// Fallback mínimo para Suspense (no bloquea la animación de fondo)
function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#225BE4] text-white/80">
      Cargando…
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowLoading(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || showLoading) {
    return (
      <Suspense fallback={<Fallback />}>
        <LoadingScreen onComplete={() => setShowLoading(false)} />
      </Suspense>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<Fallback />}>
        <AuthForm />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Fallback />}>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dashboard />
                </motion.div>
              }
            />
            <Route
              path="/alerts"
              element={
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <AutoWhatsAppAlerts />
                </motion.div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="min-h-screen bg-[#225BE4]" // 🔵 fondo unificado
            >
              <AppContent />
            </motion.div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

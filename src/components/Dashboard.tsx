// src/components/Dashboard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, ScanLine, PlusCircle, X } from "lucide-react";

import BarcodeScanner from "./BarcodeScanner";
import { ScannerSimulator } from "./ScannerSimulator";
import { BottomNav } from "./BottomNav";
import { InventoryView } from "./InventoryView";
import { ReportsPanel } from "./ReportsPanel";
import { Home as HomeView } from "../pages/home";

/* -------------------- Paleta -------------------- */
const COLORS = {
  blueMain: "#225BE4",
  blueDeep: "#1C4FD9",
  blueAccent: "#2A63E4",
  white: "#FFFFFF",
};

/* -------------------- Animaciones -------------------- */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const;
const modalFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;
const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
} as const;

/* -------------------- Dashboard -------------------- */
export function Dashboard() {
  const [activeView, setActiveView] = useState<
    "home" | "inventory" | "scanner" | "add" | "reports"
  >("home");

  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  /* === Escáner === */
  const handleScannerOpen = () => setShowCameraScanner(true);
  const handleScannerClose = () => setShowCameraScanner(false);

  /* === Simulador === */
  const handleSimulatorOpen = () => setShowSimulator(true);
  const handleSimulatorClose = () => setShowSimulator(false);

  return (
    <div
      className="relative min-h-screen text-white font-[Inter] overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${COLORS.blueMain} 0%, ${COLORS.blueDeep} 100%)`,
      }}
    >
      {/* Decor minimal (sin marcos ni glass) */}
      <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen">
        <div className="absolute -inset-[35%] blur-[120px] bg-[radial-gradient(55%_55%_at_25%_10%,rgba(255,255,255,0.28)_0%,transparent_60%)]" />
        <div className="absolute -inset-[40%] blur-[130px] bg-[radial-gradient(50%_50%_at_80%_30%,rgba(255,255,255,0.18)_0%,transparent_62%)]" />
      </div>

      {/* Contenido sin header ni marcos */}
      <main className="mx-auto w-full max-w-[980px] px-4 pt-4 sm:pt-6 pb-24 sm:pb-28">
        <AnimatePresence mode="wait">
          {/* 🏠 HOME */}
          {activeView === "home" && (
            <motion.div key="home" {...fadeUp} transition={{ duration: 0.24 }}>
              <HomeView />
            </motion.div>
          )}

          {/* 📦 INVENTARIO */}
          {activeView === "inventory" && (
            <motion.div key="inventory" {...fadeUp} transition={{ duration: 0.24 }}>
              <InventoryView />
            </motion.div>
          )}

          {/* 📊 REPORTES */}
          {activeView === "reports" && (
            <motion.div key="reports" {...fadeUp} transition={{ duration: 0.24 }}>
              <ReportsPanel />
            </motion.div>
          )}

          {/* ➕ AGREGAR PRODUCTO (plano, sin card) */}
          {activeView === "add" && (
            <motion.div key="add" {...fadeUp} transition={{ duration: 0.28 }}>
              <section className="pt-1 sm:pt-2">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 sm:mb-5 flex items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_12px_30px_rgba(34,91,228,0.35)]"
                      style={{
                        background: `linear-gradient(180deg, ${COLORS.blueMain} 0%, ${COLORS.blueAccent} 100%)`,
                      }}
                    >
                      <PlusCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-2">
                    Registrar nuevo producto
                  </h2>
                  <p className="text-[13px] text-white/85 mb-6 max-w-[40ch]">
                    Elige cómo deseas ingresar los datos del producto.
                  </p>

                  <div className="w-full max-w-md grid grid-cols-1 gap-3">
                    {/* Escanear */}
                    <motion.button
                      onClick={handleScannerOpen}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-[0_14px_30px_rgba(34,91,228,0.35)] border border-white/20"
                      style={{
                        background: `linear-gradient(180deg, ${COLORS.blueMain} 0%, ${COLORS.blueAccent} 100%)`,
                      }}
                    >
                      <ScanLine className="w-5 h-5" />
                      Escanear
                    </motion.button>

                    {/* Simulador */}
                    <motion.button
                      onClick={handleSimulatorOpen}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 transition"
                      style={{
                        background: "transparent",
                      }}
                    >
                      <Keyboard className="w-5 h-5" />
                      Simulador
                    </motion.button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 📷 ESCÁNER REAL - Overlay modal (sin marco, sólo contenedor limpio) */}
      <AnimatePresence>
        {activeView === "add" && showCameraScanner && (
          <motion.div
            key="camera"
            {...modalFade}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <motion.div
                {...scaleIn}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-[720px] rounded-2xl overflow-hidden bg-black/40"
                style={{ border: "1px solid rgba(255,255,255,0.22)" }}
              >
                <button
                  onClick={handleScannerClose}
                  className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold bg-white/20 hover:bg-white/30 transition"
                >
                  <X className="w-4 h-4" />
                  Cerrar
                </button>
                <div className="p-3">
                  <BarcodeScanner onSuccess={() => handleScannerClose()} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧠 SIMULADOR - Sheet lateral simple (sin marco decorativo) */}
      <AnimatePresence>
        {activeView === "add" && showSimulator && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[85] flex"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={handleSimulatorClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="relative ml-auto h-full w-full sm:w-[560px] bg-[#0b1840]/60 text-white"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.22)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
                <h3 className="text-sm font-bold tracking-tight">Simulador de Scanner</h3>
                <button
                  onClick={handleSimulatorClose}
                  className="rounded-xl px-2 py-1 text-[12px] font-semibold bg-white/20 hover:bg-white/30 transition"
                >
                  Cerrar
                </button>
              </div>
              <div className="p-3 sm:p-4">
                <ScannerSimulator onClose={handleSimulatorClose} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 NAVBAR */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default Dashboard;

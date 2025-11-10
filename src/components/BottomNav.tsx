// src/components/BottomNav.tsx
import { memo, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Package,
  ScanLine,
  PlusCircle,
  BarChart3,
  X,
} from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";

/* 🎨 Paleta alineada */
const palette = {
  blueMain: "#225BE4",
  blueDeep: "#1C4FD9",
  blueAccent: "#2A63E4",
  white: "#FFFFFF",
};

interface BottomNavProps {
  activeView: string;
  setActiveView: (
    view: "home" | "inventory" | "scanner" | "add" | "reports"
  ) => void;
}

/* -------------------- COMPONENTE -------------------- */
export const BottomNav = memo(function BottomNav({
  activeView,
  setActiveView,
}: BottomNavProps) {
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const handleClick = useCallback(
    (view: "home" | "inventory" | "scanner" | "add" | "reports") => {
      requestAnimationFrame(() => setActiveView(view));
    },
    [setActiveView]
  );

  const isActive = (v: string) => activeView === v;

  /* === Abrir / Cerrar Escáner Real === */
  const handleScannerToggle = () => setShowCameraScanner((prev) => !prev);
  const handleScannerClose = () => setShowCameraScanner(false);

  /* -------------------- CSS de animaciones (inyectado 1 sola vez) -------------------- */
  useEffect(() => {
    const id = "bottomnav-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
@keyframes bn-pulse-soft {
  0%,100% { opacity:.7; transform: scale(1) }
  50% { opacity:1; transform: scale(1.06) }
}
@keyframes bn-shine-overlay {
  0% { transform: translateX(-140%) }
  50% { transform: translateX(0%) }
  100% { transform: translateX(140%) }
}
@keyframes bn-shine-vertical {
  0% { background-position: 0 0% }
  100% { background-position: 0 200% }
}
.bn-animate-pulse-soft { animation: bn-pulse-soft 3.6s ease-in-out infinite }
.bn-animate-shine-overlay {
  background: linear-gradient(120deg, transparent 25%, rgba(255,255,255,.23) 50%, transparent 75%);
  mix-blend-mode: overlay;
  animation: bn-shine-overlay 8s ease-in-out infinite
}
.bn-animate-shine-vertical {
  background: linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.9) 50%, rgba(255,255,255,.08) 100%);
  background-size: 100% 200%;
  animation: bn-shine-vertical 2.6s ease-in-out infinite
}
@media (prefers-reduced-motion: reduce) {
  .bn-animate-pulse-soft,
  .bn-animate-shine-overlay,
  .bn-animate-shine-vertical { animation: none !important }
}
`;
    document.head.appendChild(style);
  }, []);

  /* === Botón reusado === */
  const NavItem = ({
    label,
    icon,
    view,
  }: {
    label: string;
    icon: JSX.Element;
    view: "home" | "inventory" | "add" | "reports";
  }) => (
    <motion.button
      onPointerDown={() => handleClick(view)}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      className={`group flex flex-col items-center justify-center flex-1 py-2 text-[12.5px] font-semibold touch-manipulation active:scale-95 select-none ${
        isActive(view) ? "text-white" : "text-white/80 hover:text-white"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-current={isActive(view) ? "page" : undefined}
      aria-label={label}
      title={label}
    >
      <div
        className={`w-[44px] h-[44px] grid place-items-center rounded-xl border transition-all ${
          isActive(view)
            ? "bg-white/15 border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,.35),0_6px_18px_rgba(34,91,228,.45)]"
            : "bg-white/8 border-white/15 hover:bg-white/14 shadow-[inset_0_1px_2px_rgba(255,255,255,.15),0_2px_8px_rgba(0,0,0,.18)]"
        }`}
      >
        {icon}
      </div>
      <span className="mt-1">{label}</span>
    </motion.button>
  );

  /* -------------------- Render principal -------------------- */
  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        aria-label="Navegación inferior"
        style={{
          ["--blue-main" as any]: palette.blueMain,
          ["--blue-deep" as any]: palette.blueDeep,
          ["--blue-accent" as any]: palette.blueAccent,
        }}
      >
        {/* Fondo / contenedor (sin curvas pesadas, look glass pro) */}
        <div
          className="relative mx-auto max-w-3xl rounded-t-[28px] border-t border-white/12 backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.08) 70%, rgba(255,255,255,0) 100%)",
            boxShadow:
              "0 -22px 42px rgba(0,0,0,.28), inset 0 1px 2px rgba(255,255,255,.25)",
          }}
        >
          {/* Capa brillo diagonal sutil */}
          <div className="absolute inset-0 bn-animate-shine-overlay pointer-events-none rounded-t-[28px]" />

          {/* Halo inferior azul muy suave */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-80 rounded-full blur-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(closest-side, rgba(34,91,228,.35), rgba(34,91,228,0))",
            }}
          />

          {/* Items */}
          <div
            className="relative grid grid-cols-5 items-end px-3"
            style={{
              paddingBottom:
                "max(10px, env(safe-area-inset-bottom, 10px))",
              paddingTop: "10px",
            }}
          >
            {/* 🏠 Inicio */}
            <NavItem
              label="Inicio"
              view="home"
              icon={
                <Home
                  className={`w-5 h-5 ${
                    isActive("home") ? "text-white" : "text-white/85"
                  }`}
                />
              }
            />

            {/* 📦 Inventario */}
            <NavItem
              label="Inventario"
              view="inventory"
              icon={
                <Package
                  className={`w-5 h-5 ${
                    isActive("inventory") ? "text-white" : "text-white/85"
                  }`}
                />
              }
            />

            {/* 🔷 Escáner (flotante centrado) */}
            <div className="relative flex items-center justify-center">
              {/* Halo respirando */}
              <div className="absolute top-[-4px] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(34,91,228,.7)_0%,transparent_70%)] blur-[18px] bn-animate-pulse-soft" />
              <motion.button
                onClick={handleScannerToggle}
                whileTap={{ scale: 1 }}
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                aria-pressed={showCameraScanner}
                aria-label={showCameraScanner ? "Cerrar escáner" : "Abrir escáner"}
                className={`relative -translate-y-8 h-[68px] w-[68px] rounded-full overflow-hidden flex items-center justify-center text-white border-[3px] border-white/25 shadow-[inset_0_1px_3px_rgba(255,255,255,.25),0_18px_38px_rgba(34,91,228,.6)] select-none touch-manipulation ${
                  showCameraScanner ? "ring-4 ring-blue-300/40" : ""
                }`}
                style={{
                  background: `linear-gradient(180deg, ${palette.blueAccent} 0%, ${palette.blueMain} 100%)`,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Shine vertical */}
                <div className="absolute inset-0 bn-animate-shine-vertical opacity-70 mix-blend-screen" />
                {showCameraScanner ? (
                  <X className="w-7 h-7 relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,.9)]" />
                ) : (
                  <ScanLine className="w-7 h-7 relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,.9)]" />
                )}
              </motion.button>
            </div>

            {/* ➕ Agregar */}
            <NavItem
              label="Agregar"
              view="add"
              icon={
                <PlusCircle
                  className={`w-5 h-5 ${
                    isActive("add") ? "text-white" : "text-white/85"
                  }`}
                />
              }
            />

            {/* 📊 Reportes */}
            <NavItem
              label="Reportes"
              view="reports"
              icon={
                <BarChart3
                  className={`w-5 h-5 ${
                    isActive("reports") ? "text-white" : "text-white/85"
                  }`}
                />
              }
            />
          </div>
        </div>
      </nav>

      {/* 📸 Escáner flotante (overlay limpio) */}
      {showCameraScanner && (
        <div
          className="fixed inset-0 z-[99] bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-label="Escáner de códigos"
        >
          <BarcodeScanner onSuccess={() => handleScannerClose()} />
        </div>
      )}
    </>
  );
});

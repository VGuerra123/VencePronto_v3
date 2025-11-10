import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

/* -------------------- Paleta Global -------------------- */
const PALETTE = {
  blueMain: "#225BE4",
  blueLight: "#A9C1FF",
  red: "#E30613",
  gold: "#FACC15",
  white: "#FFFFFF",
  green: "#22C55E",
};

/* -------------------- Tipos -------------------- */
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

/* -------------------- Contexto -------------------- */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

/* -------------------- Provider -------------------- */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /* Íconos */
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  /* Estilos dinámicos por tipo */
  const variants = {
    success: {
      bg: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.25))",
      border: "rgba(34,197,94,0.4)",
      glow: "0 0 12px rgba(34,197,94,0.4)",
      color: "text-green-100",
      icon: "text-green-400",
    },
    error: {
      bg: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.25))",
      border: "rgba(239,68,68,0.4)",
      glow: "0 0 12px rgba(239,68,68,0.4)",
      color: "text-red-100",
      icon: "text-red-400",
    },
    warning: {
      bg: "linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.25))",
      border: "rgba(250,204,21,0.4)",
      glow: "0 0 12px rgba(250,204,21,0.4)",
      color: "text-yellow-100",
      icon: "text-yellow-300",
    },
    info: {
      bg: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(59,130,246,0.25))",
      border: "rgba(59,130,246,0.4)",
      glow: "0 0 12px rgba(59,130,246,0.4)",
      color: "text-blue-100",
      icon: "text-blue-300",
    },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 📦 Contenedor general (top-right responsive) */}
      <div className="fixed top-5 right-4 z-[999] w-[calc(100%-2rem)] sm:max-w-sm space-y-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            const v = variants[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -25, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`relative overflow-hidden ${v.color} flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-2xl shadow-lg`}
                style={{
                  background: v.bg,
                  borderColor: v.border,
                  boxShadow: `${v.glow}, inset 0 1px 2px rgba(255,255,255,0.25)`,
                }}
              >
                {/* ✨ Pulso de vida */}
                <motion.span
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />

                {/* Icono */}
                <motion.div
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                >
                  <Icon className={`w-6 h-6 mt-0.5 ${v.icon}`} />
                </motion.div>

                {/* Texto */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-sm leading-tight">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-xs mt-1 opacity-85 leading-snug">
                      {toast.message}
                    </p>
                  )}
                </div>

                {/* Botón cerrar */}
                <motion.button
                  onClick={() => removeToast(toast.id)}
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 text-white/80 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* 🔵 Glow animado fondo */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 30%, ${v.border}15, transparent 70%)`,
                  }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

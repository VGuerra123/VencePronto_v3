import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  glow?: boolean; // ✨ Efecto lumínico opcional
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  glow = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscurecido con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
            onClick={onClose}
          />

          {/* Contenedor central */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`
                w-full ${sizeClasses[size]}
                rounded-2xl border border-white/20 backdrop-blur-2xl overflow-hidden relative
                bg-gradient-to-b from-[#1E40AF]/95 via-[#1F4BC4]/95 to-[#2563EB]/95
                shadow-[0_0_35px_rgba(34,91,228,0.4)]
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✨ Halo de brillo exterior */}
              {glow && (
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl blur-2xl bg-gradient-to-r from-[#1F4BC4]/40 to-[#2563EB]/30"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              )}

              {/* 🧭 Encabezado */}
              {title && (
                <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-white/10 backdrop-blur-md">
                  <h2 className="text-lg font-semibold text-white tracking-tight">
                    {title}
                  </h2>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/70" />
                    </button>
                  )}
                </div>
              )}

              {/* 🌟 Contenido */}
              <div className="relative z-10 p-6 text-white">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

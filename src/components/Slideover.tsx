import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface SlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
}

/* 🎨 Slideover con glassmorphism y animaciones premium */
export function Slideover({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
}: SlideoverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🔲 Fondo con blur y fade suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* 🪟 Panel lateral */}
          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 220,
              mass: 0.9,
            }}
            className={`fixed top-0 ${
              side === "right" ? "right-0" : "left-0"
            } h-full w-full max-w-md sm:max-w-[420px] md:max-w-[480px] z-50 flex flex-col 
            bg-white/80 dark:bg-slate-900/70 
            border-l border-white/20 backdrop-blur-2xl 
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🧭 Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {title}
              </h2>

              {/* ✖ Cierre */}
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-white/20 focus:outline-none transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* ✨ Luz superior */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* 📜 Contenido con animación de entrada */}
            <motion.div
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

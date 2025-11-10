import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/* -------------------- Tipado -------------------- */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

/* -------------------- Componente -------------------- */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-14 px-6"
    >
      {/* Ícono dentro de halo luminoso */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-red-500/20 rounded-2xl blur-2xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <Icon className="w-10 h-10 text-slate-500" strokeWidth={1.6} />
        </div>
      </div>

      {/* Texto principal */}
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>

      {/* Acción */}
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1F4BC4] to-[#2563EB] text-white font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] transition-all"
        >
          {action.label}
        </motion.button>
      )}

      {/* Contenido adicional opcional */}
      {children && <div className="mt-5">{children}</div>}
    </motion.div>
  );
}

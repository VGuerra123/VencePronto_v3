import { motion } from "framer-motion";
import { ReactNode, HTMLAttributes } from "react";

/**
 * 🧊 GlassCard universal — sistema visual base de VencePronto
 * Admite onClick, id, style y otros atributos nativos
 */
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  ...rest // ✅ permite onClick, id, style, etc.
}: GlassCardProps) {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.02,
              boxShadow:
                "0 12px 32px rgba(34,91,228,0.25), 0 0 8px rgba(255,255,255,0.15)",
            }
          : undefined
      }
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={`relative rounded-2xl overflow-hidden border border-white/25
        bg-white/15 backdrop-blur-xl
        shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.15)]
        text-slate-800 ${className}`}
    >
      {/* ✨ Capa de luz y gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

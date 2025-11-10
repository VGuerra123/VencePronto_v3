// src/components/Layout.tsx
import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LogOut, Bell, CalendarDays, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  userEmail?: string;
  onSignOut?: () => void;
}

const COLORS = {
  blueMain: "#225BE4",
  blueDeep: "#1C4FD9",
  blueAccent: "#2A63E4",
  white: "#FFFFFF",
  silver: "#BFD2FA",
};

export function Layout({ children, userEmail, onSignOut }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const auth = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const email = userEmail ?? auth?.user?.email ?? "admin@vencepronto.cl";
  const userName = email.split("@")[0] || "admin";

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [currentTime]
  );

  const shimmerX = prefersReduced ? {} : { x: ["-120%", "140%"] };

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      if (onSignOut) onSignOut();
      else if (auth?.signOut) await auth.signOut();
      else navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  // Copiar email
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Accesibilidad: teclado en menú
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setMenuOpen(false);
    }
    if (e.key === "Tab") {
      // foco cíclico simple
      const focusables = menuRef.current?.querySelectorAll<HTMLElement>(
        'button,[href],[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full font-[Inter] text-white overflow-hidden relative antialiased"
      style={{
        background: `radial-gradient(1200px 600px at 18% -10%, rgba(255,255,255,0.12) 0%, transparent 55%), linear-gradient(180deg, ${COLORS.blueMain} 0%, ${COLORS.blueDeep} 100%)`,
      }}
    >
      {/* Fondo técnico sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 28px 28px",
          maskImage:
            "radial-gradient(60% 60% at 50% 35%, black 60%, transparent 100%)",
        }}
      />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[80]">
        <div
          className="relative w-full h-[56px] backdrop-blur-2xl border-b border-white/15"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.22), inset 0 1px 2px rgba(255,255,255,0.35)",
          }}
        >
          <div className="w-full mx-auto max-w-[1200px] h-full px-4 flex items-center justify-between">
            {/* Logo + saludo */}
            <div className="flex items-center gap-3 select-none">
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_10px_rgba(16,24,40,0.25)]"
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                aria-label="Ir al inicio"
              >
                <img
                  src="/logo.png"
                  alt="VencePronto"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                {!prefersReduced && (
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.7) 45%, transparent 60%)",
                      mixBlendMode: "screen",
                      transform: "skewX(-12deg)",
                    }}
                    animate={shimmerX}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1.4,
                    }}
                  />
                )}
              </motion.button>

              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2">
                  <h1 className="text-[15px] sm:text-[16px] font-semibold tracking-tight">
                    Hola, <span className="text-white">{userName}</span>
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/85">
                  <CalendarDays className="w-[15px] h-[15px] text-white/90" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Botón usuario */}
            <div className="relative">
              <motion.button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative w-10 h-10 rounded-full font-semibold text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{
                  background: `linear-gradient(145deg, ${COLORS.silver} 0%, ${COLORS.blueAccent} 90%)`,
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.35), 0 6px 14px rgba(0,0,0,0.25)",
                }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Abrir menú de usuario"
                title={email}
              >
                <span className="absolute top-[3px] left-[3px] right-[3px] h-[36%] rounded-full bg-white/25" />
                <span className="relative z-10">{userName.charAt(0).toUpperCase()}</span>
              </motion.button>

              {/* MENÚ DESPLEGABLE refinado */}
              <AnimatePresence>
                {menuOpen && (
                  <>
                    {/* Overlay */}
                    <motion.button
                      type="button"
                      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMenuOpen(false)}
                      aria-label="Cerrar menú"
                    />
                    {/* Dropdown */}
                    <motion.div
                      ref={menuRef}
                      role="menu"
                      aria-label="Menú de usuario"
                      tabIndex={-1}
                      onKeyDown={onMenuKeyDown}
                      className="absolute right-0 mt-3 z-[200] w-[92vw] sm:w-80 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.45)] border border-white/20 backdrop-blur-2xl focus:outline-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(18,36,82,0.96) 0%, rgba(34,91,228,0.92) 100%)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 25px rgba(0,0,0,0.35)",
                      }}
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                    >
                      {/* Flecha/caret */}
                      <div
                        className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-t border-l border-white/20"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(18,36,82,0.96) 0%, rgba(34,91,228,0.92) 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                        }}
                        aria-hidden
                      />

                      {/* Cabecera de usuario */}
                      <div className="px-4 pt-4 pb-3 text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full grid place-items-center border border-white/25 bg-white/10">
                            <span className="font-semibold">
                              {userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] uppercase tracking-[0.12em] text-white/70">
                              VencePronto
                            </p>
                            <p className="text-[15px] font-semibold leading-tight truncate">
                              {userName}
                            </p>
                          </div>
                        </div>

                        {/* Email + copiar */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 truncate text-[14px] font-medium">
                            {email}
                          </div>
                          <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 text-[12px] hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
                            aria-label="Copiar email"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copiar
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/15 mx-3" />

                      {/* Items */}
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/alerts");
                        }}
                        className="w-full text-left px-4 py-4 text-[14.5px] text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center gap-3 transition-colors"
                      >
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="font-medium">Configurar alertas</span>
                      </button>

                      <div className="h-px bg-white/12 mx-3" />

                      <button
                        role="menuitem"
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-4 text-[14.5px] font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-300/50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-[18px] h-[18px]" />
                        Cerrar sesión
                      </button>

                      {/* Footer opcional */}
                      <div className="px-4 py-2 text-[11px] text-white/70">
                        Ambiente: <span className="font-medium">Producción</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main
        className="w-full min-h-screen px-4"
        style={{
          paddingTop:
            "max(64px, calc(56px + env(safe-area-inset-top, 0px)))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="w-full h-full max-w-[1200px] mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

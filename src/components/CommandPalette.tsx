import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Plus,
  BarChart3,
  Settings,
  Star,
  Tag,
  Bell,
  LogOut,
} from "lucide-react";

/* -------------------- Tipos -------------------- */
interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

/* -------------------- Componente -------------------- */
export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  const commands: Command[] = [
    {
      id: "dashboard",
      label: "Ir al Dashboard",
      icon: Package,
      action: () => onNavigate("dashboard"),
      category: "Navegación",
    },
    {
      id: "scanner",
      label: "Registrar Producto",
      icon: Plus,
      action: () => onNavigate("scanner"),
      category: "Acciones",
    },
    {
      id: "inventory",
      label: "Ver Inventario",
      icon: Search,
      action: () => onNavigate("inventory"),
      category: "Navegación",
    },
    {
      id: "alerts",
      label: "Configurar Alertas",
      icon: Bell,
      action: () => onNavigate("alerts"),
      category: "Acciones",
    },
    {
      id: "reports",
      label: "Ver Reportes",
      icon: BarChart3,
      action: () => onNavigate("reports"),
      category: "Navegación",
    },
    {
      id: "categories",
      label: "Gestionar Categorías",
      icon: Tag,
      action: () => onNavigate("categories"),
      category: "Configuración",
    },
    {
      id: "favorites",
      label: "Ver Favoritos",
      icon: Star,
      action: () => onNavigate("favorites"),
      category: "Navegación",
    },
    {
      id: "settings",
      label: "Configuración General",
      icon: Settings,
      action: () => onNavigate("settings"),
      category: "Configuración",
    },
    {
      id: "logout",
      label: "Cerrar Sesión",
      icon: LogOut,
      action: () => onNavigate("logout"),
      category: "Cuenta",
    },
  ];

  /* -------------------- Filtrado + Agrupado -------------------- */
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  /* -------------------- Atajos de teclado -------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /* -------------------- Selección -------------------- */
  const handleSelect = (command: Command) => {
    command.action();
    onClose();
    setSearch("");
  };

  /* -------------------- Render -------------------- */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🔲 Fondo con blur y profundidad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* 🧭 Panel principal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] border border-red-100 overflow-hidden backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🔍 Barra de búsqueda */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-red-100 bg-gradient-to-r from-white to-red-50/40">
                <Search className="w-5 h-5 text-red-500" />
                <input
                  type="text"
                  placeholder="Buscar comando o sección..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm focus:outline-none bg-transparent placeholder-slate-400 text-slate-700"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-md border border-gray-200 text-gray-600">
                  ESC
                </kbd>
              </div>

              {/* 📋 Resultados */}
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <Fragment key={category}>
                    <div className="px-5 py-2 text-xs font-semibold uppercase text-slate-500/80 bg-slate-50 tracking-wide border-b border-gray-100">
                      {category}
                    </div>
                    {cmds.map((cmd) => (
                      <motion.button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-red-50 focus:bg-red-100 transition-colors"
                      >
                        <div className="p-2 rounded-md bg-red-100/70 text-red-600">
                          <cmd.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{cmd.label}</span>
                      </motion.button>
                    ))}
                  </Fragment>
                ))}

                {/* ❌ Sin resultados */}
                {filteredCommands.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-gray-500">
                    No se encontraron resultados para “{search}”
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------- Hook global Ctrl+K / Cmd+K -------------------- */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return { isOpen, setIsOpen };
}

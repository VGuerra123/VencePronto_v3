import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  onApply: (filters: any) => void;
  categories?: FilterOption[];
  statuses?: FilterOption[];
}

/* 🎨 Paleta base */
const COLORS = {
  blueMain: "#225BE4",
  blueAccent: "#2563EB",
  white: "#FFFFFF",
};

export function FilterPanel({
  onApply,
  categories = [],
  statuses = [],
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    priceMin: "",
    priceMax: "",
  });

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const reset = {
      category: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      priceMin: "",
      priceMax: "",
    };
    setFilters(reset);
    onApply(reset);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="relative">
      {/* Botón de apertura */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm shadow-sm ${
          hasActiveFilters
            ? "bg-gradient-to-r from-[#1F4BC4] to-[#2563EB] text-white border-transparent"
            : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
        )}
      </motion.button>

      {/* Panel desplegable */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] p-6 z-40"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 text-lg">Filtros</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Campos */}
              <div className="space-y-5 text-sm">
                {/* Categoría */}
                {categories.length > 0 && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Todas</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Estado */}
                {statuses.length > 0 && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1.5">
                      Estado
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Todos</option>
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rango de fechas */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1.5">
                    Rango de fechas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>

                {/* Rango de precio */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1.5">
                    Rango de precio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMin: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMax: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center space-x-3 mt-7">
                <motion.button
                  onClick={handleApply}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1F4BC4] to-[#2563EB] text-white font-semibold shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all"
                >
                  Aplicar
                </motion.button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-all"
                >
                  Limpiar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

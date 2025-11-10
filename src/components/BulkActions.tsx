import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, Tag, X } from "lucide-react";

/* -------------------- Tipos -------------------- */
interface BulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onExport?: () => void;
  onTag?: () => void;
}

/* -------------------- Componente -------------------- */
export function BulkActions({
  selectedCount,
  onClear,
  onDelete,
  onExport,
  onTag,
}: BulkActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
        >
          <motion.div
            layout
            role="toolbar"
            aria-label="Acciones masivas de inventario"
            className="bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center space-x-4 border border-white/10"
          >
            {/* Contador */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
                {selectedCount}
              </div>
              <span className="text-sm font-medium tracking-tight">
                {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="h-6 w-px bg-white/15" />

            {/* Botones principales */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {onTag && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTag}
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Tag className="w-4 h-4" />
                  <span>Etiquetar</span>
                </motion.button>
              )}

              {onExport && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExport}
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgba(239,68,68,0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm text-red-300 hover:text-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </motion.button>
            </div>

            <div className="h-6 w-px bg-white/15" />

            {/* Botón limpiar */}
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClear}
              aria-label="Limpiar selección"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

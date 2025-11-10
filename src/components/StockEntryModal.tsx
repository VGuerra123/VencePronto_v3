import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  Package,
  Hash,
  AlertTriangle,
} from "lucide-react";

/* -------------------- Props -------------------- */
export interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: string;
  onConfirm?: (payload: {
    productCode: string;
    lotNumber: string;
    elaboration?: string | null;
    expiration?: string | null;
  }) => void;
}

/* -------------------- Paleta -------------------- */
const COLORS = {
  blueMain: "#1F4BC4",
  blueAccent: "#2563EB",
  blueDeep: "#1E40AF",
  white: "#FFFFFF",
  red: "#E30613",
};

/* -------------------- Modal -------------------- */
export function StockEntryModal({
  isOpen,
  onClose,
  productCode,
  onConfirm,
}: StockEntryModalProps) {
  const [lotNumber, setLotNumber] = useState<string>("");
  const [expiration, setExpiration] = useState<string>("");
  const [elaboration, setElaboration] = useState<string>("");
  const [noExp, setNoExp] = useState<boolean>(false);
  const [noElab, setNoElab] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLotNumber("");
      setExpiration("");
      setElaboration("");
      setNoExp(false);
      setNoElab(false);
      setValidating(false);
      setAlertMsg(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!lotNumber.trim()) {
      alert("⚠️ El número de lote es obligatorio.");
      return;
    }

    setValidating(true);
    setAlertMsg(null);

    // simulamos validación de stock y métricas internas
    await new Promise((r) => setTimeout(r, 2200));

    setValidating(false);

    // caso especial: doritos
    if (productCode === "7622300961924") {
      setAlertMsg(
        "⚠️ Sobrestock detectado en Doritos. Se agregará igualmente al inventario."
      );
    } else {
      setAlertMsg("✅ Validación exitosa. Producto agregado correctamente al inventario.");
    }

    // simular confirmación y cierre tras unos segundos
    setTimeout(() => {
      const payload = {
        productCode,
        lotNumber,
        elaboration: noElab ? null : elaboration || null,
        expiration: noExp ? null : expiration || null,
      };
      onConfirm?.(payload);
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center font-[Inter]"
        >
          {/* Fondo translúcido */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={!validating ? onClose : undefined}
          />

          {/* Contenedor principal */}
          <motion.div
            key="dialog"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
            className="relative w-full max-w-[440px] min-h-[70vh] bg-gradient-to-b from-[#0d1b4d]/95 to-[#0b163d]/95 
                       border-t border-white/20 rounded-t-[36px] px-6 pt-5 pb-8 shadow-[0_-8px_50px_rgba(0,0,0,0.45)] 
                       sm:rounded-3xl sm:border sm:shadow-[0_0_50px_rgba(0,0,0,0.55)] overflow-y-auto"
          >
            {/* Barra superior */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/25" />

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                  <Package className="w-6 h-6 text-white/90" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Producto</p>
                  <p className="font-mono text-sm text-[#C6D6FF] break-all">{productCode}</p>
                </div>
              </div>
              <button
                onClick={!validating ? onClose : undefined}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido principal */}
            {validating ? (
              <div className="flex flex-col items-center justify-center text-center mt-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
                  className="w-12 h-12 border-4 border-white/30 border-t-blue-400 rounded-full mb-6"
                />
                <p className="text-white/80 font-medium">Validando datos del lote...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campo: Número de lote */}
                <div>
                  <label className="block text-sm text-white/90 mb-2">Número de lote *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
                    <input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/25 text-white placeholder-white/60 
                                 outline-none focus:ring-2 focus:ring-blue-400/60 transition"
                      placeholder="Ej: L-2025A"
                    />
                  </div>
                </div>

                {/* Campo: Fecha de elaboración */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/90">Fecha de elaboración</label>
                    <label className="text-xs text-white/70 flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={noElab}
                        onChange={() => setNoElab(!noElab)}
                        className="accent-blue-500"
                      />
                      No aplica
                    </label>
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
                    <input
                      type="date"
                      value={elaboration}
                      onChange={(e) => setElaboration(e.target.value)}
                      disabled={noElab}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/25 text-white outline-none 
                                 [color-scheme:dark] focus:ring-2 focus:ring-blue-400/60 transition disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Campo: Fecha de vencimiento */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/90">Fecha de vencimiento</label>
                    <label className="text-xs text-white/70 flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={noExp}
                        onChange={() => setNoExp(!noExp)}
                        className="accent-blue-500"
                      />
                      No aplica
                    </label>
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
                    <input
                      type="date"
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                      disabled={noExp}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/25 text-white outline-none 
                                 [color-scheme:dark] focus:ring-2 focus:ring-blue-400/60 transition disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de alerta */}
            {alertMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 flex items-center gap-2 text-sm ${
                  alertMsg.includes("Sobrestock") ? "text-yellow-300" : "text-emerald-300"
                }`}
              >
                {alertMsg.includes("Sobrestock") ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span>{alertMsg}</span>
              </motion.div>
            )}

            {/* Botones inferiores */}
            {!validating && (
              <div className="grid grid-cols-2 gap-3 mt-10">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="rounded-2xl py-3 bg-white/10 border border-white/25 text-white font-semibold hover:bg-white/20 transition"
                >
                  Cancelar
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirm}
                  className="rounded-2xl py-3 font-semibold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.blueMain}, ${COLORS.blueAccent})`,
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar
                  </span>
                  {/* efecto brillo */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-white/25 opacity-0"
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StockEntryModal;

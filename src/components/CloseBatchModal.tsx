import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Package,
  CheckCircle2,
  Camera,
  Store,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react";

interface CloseBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  // 👇 nuevo: para mostrar el número de lote
  lotId?: string;
  onConfirm: (data: {
    reason: string;
    photo?: File | null;
    destination?: string;
  }) => void;
}

const COLORS = {
  blueMain: "#1F4BC4",
  blueAccent: "#2563EB",
  blueDeep: "#1E40AF",
};

export function CloseBatchModal({
  isOpen,
  onClose,
  productName,
  lotId,
  onConfirm,
}: CloseBatchModalProps) {
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [destination, setDestination] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const reasons = [
    { id: "vendido", label: "Vendido" },
    { id: "merma", label: "Merma" },
    { id: "consumo_interno", label: "Consumo interno" },
    { id: "traspaso", label: "Traspaso de local" },
  ];

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setPhoto(null);
      setDestination("");
      setDropdownOpen(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reason) return alert("Selecciona un motivo para cerrar el lote.");
    if (reason === "merma" && !photo)
      return alert("Debes tomar una foto obligatoriamente.");
    onConfirm({ reason, photo, destination });
    onClose();
  };

  const handleTakePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center font-[Inter]"
        >
          {/* Fondo borroso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Cuerpo principal */}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative w-full max-w-[440px] min-h-[60vh] bg-gradient-to-b from-[#1F4BC4]/95 to-[#1E40AF]/95 
                       border-t border-white/20 rounded-t-[36px] px-6 pt-6 pb-8 shadow-[0_-8px_60px_rgba(0,0,0,0.5)] 
                       sm:rounded-3xl sm:border sm:shadow-[0_0_50px_rgba(0,0,0,0.55)] overflow-y-auto"
          >
            {/* Indicador superior */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/25" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white/90" />
                </div>
                <div>
                  {lotId ? (
                    <p className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 mb-1">
                      <Hash className="w-3 h-3" />
                      Lote #{lotId}
                    </p>
                  ) : null}
                  <p className="text-xs text-white/70">Producto</p>
                  <p className="font-semibold text-[#C6D6FF] truncate max-w-[220px]">
                    {productName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-5">
              {/* Motivo */}
              <div className="relative">
                <label className="block text-sm text-white/90 mb-2">
                  Motivo del cierre
                </label>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex justify-between items-center rounded-2xl px-4 py-3 bg-white/10 border border-white/25 
                             text-white text-left outline-none focus:ring-2 focus:ring-blue-400/60 transition hover:bg-white/15"
                >
                  <span>
                    {reason
                      ? reasons.find((r) => r.id === reason)?.label
                      : "Selecciona..."}
                  </span>
                  {dropdownOpen ? (
                    <ChevronUp className="w-5 h-5 text-white/70" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/70" />
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute mt-2 w-full bg-[#2040D0]/90 border border-white/25 backdrop-blur-lg 
                                 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.4)] overflow-hidden z-50"
                    >
                      {reasons.map((r) => (
                        <li
                          key={r.id}
                          onClick={() => {
                            setReason(r.id);
                            setDropdownOpen(false);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer text-white hover:bg-white/20 transition ${
                            reason === r.id ? "bg-white/15" : ""
                          }`}
                        >
                          {r.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Campos condicionales */}
              {reason === "merma" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-sm text-white/90 mb-1 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Tomar foto (obligatorio)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleTakePhoto}
                    required
                    className="block w-full text-sm text-white cursor-pointer 
                               rounded-2xl bg-white/10 border border-white/25 py-3 px-4 text-center hover:bg-white/20 transition"
                  />
                  <p className="text-xs text-white/60 text-center">
                    (Se abrirá la cámara del dispositivo)
                  </p>
                  {photo && (
                    <p className="text-xs text-green-400 text-center mt-1">
                      ✅ Foto capturada correctamente
                    </p>
                  )}
                </motion.div>
              )}

              {reason === "traspaso" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm text-white/90 mb-2 flex items-center gap-2">
                    <Store className="w-4 h-4" /> Local destino
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ej: Local Curacaví"
                    className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/25 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-400/60 transition"
                  />
                </motion.div>
              )}
            </div>

            {/* Botones */}
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
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CloseBatchModal;

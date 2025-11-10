import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Barcode, Check, AlertCircle } from "lucide-react";
import StockEntryModal from "./StockEntryModal";
import { mockDB } from "../data/mockDB";
import { mockProducts } from "../data/mockProducts";

const COLORS = {
  blueMain: "#1F4BC4",
  blueAccent: "#2563EB",
  blueDeep: "#1E40AF",
  white: "#FFFFFF",
  red: "#E30613",
};

export function ScannerSimulator({ onClose }: { onClose: () => void }) {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleValidate = () => {
    setError("");
    if (!barcode) return setError("Ingresa un código válido.");
    const product = mockProducts.find((p) => p.barcode === barcode);
    if (!product) return setError("Código no reconocido. Intenta con uno del catálogo.");
    setShowModal(true);
  };

  const handleConfirm = ({ productCode, quantity, expiration }: any) => {
    const product = mockProducts.find((p) => p.barcode === productCode);
    if (!product) return alert("❌ Producto no encontrado en catálogo.");

    mockDB.add({
      quantity,
      expiration_date: expiration,
      location: "Bodega Central",
      product,
      category: product.category,
    });

    alert(`✅ ${product.name} agregado al inventario.`);
    setShowModal(false);
    setBarcode("");
    window.dispatchEvent(new Event("storage")); // 🔄 Fuerza sincronización global
  };

  return (
    <AnimatePresence>
      <motion.div
        key="scanner"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-start p-5 pt-10 bg-gradient-to-b from-[#1F4BC4] to-[#1E40AF] text-white overflow-y-auto font-[Inter]"
      >
        <div className="w-full max-w-[420px] rounded-[28px] border border-white/20 backdrop-blur-2xl bg-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)] p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="flex items-center gap-1 text-white/90 font-medium hover:text-white transition">
              <ChevronLeft className="w-5 h-5" /> Volver
            </button>
            <Barcode className="w-6 h-6 text-white/80" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">Simulador de Código</h2>

          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.trim())}
            placeholder="Ej: 7622300813559"
            className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/25 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400/60"
          />

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleValidate}
            className="mt-5 w-full rounded-2xl py-3 bg-gradient-to-r from-[#1F4BC4] to-[#2563EB] font-semibold shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          >
            Validar Código
          </motion.button>

          <div className="mt-8 text-white/80 text-sm">
            <p className="font-semibold mb-2">Productos del catálogo:</p>
            <ul className="space-y-1">
              {mockProducts.map((p) => (
                <li key={p.barcode} className="flex justify-between border border-white/10 rounded-xl px-3 py-2 bg-white/5">
                  <span className="text-[#A9C1FF] font-mono">{p.barcode}</span>
                  <span>{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <StockEntryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          productCode={barcode}
          onConfirm={handleConfirm}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default ScannerSimulator;

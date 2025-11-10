import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Loader2, CheckCircle, XCircle } from "lucide-react";

/* -------------------- Tipos -------------------- */
interface FakeProduct {
  product_name: string;
  quantity: number;
  expiration_date: string;
}

/* -------------------- Componente -------------------- */
export function ScannerPanel() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // 🧠 Base simulada de productos (mock)
  const fakeDB: Record<string, FakeProduct> = {
    "7802320000013": {
      product_name: "Leche Entera Soprole 1L",
      quantity: 24,
      expiration_date: "2025-11-01",
    },
    "7801234567890": {
      product_name: "Yoghurt Natural 200ml",
      quantity: 50,
      expiration_date: "2025-12-15",
    },
    "7809876543211": {
      product_name: "Queso Laminado 250g",
      quantity: 12,
      expiration_date: "2025-11-10",
    },
  };

  const handleValidation = (inputCode: string) => {
    setStatus("loading");
    setMessage("");

    setTimeout(() => {
      const data = fakeDB[inputCode];
      if (!data) {
        setStatus("error");
        setMessage("⚠️ No se encontró ningún producto con ese código.");
      } else {
        setStatus("success");
        setMessage(
          `✅ ${data.product_name} — ${data.quantity} uds. | Vence: ${data.expiration_date}`
        );
      }
    }, 1200);
  };

  const handleManualSubmit = () => {
    if (!code.trim()) return;
    handleValidation(code.trim());
  };

  const reset = () => {
    setCode("");
    setStatus("idle");
    setMessage("");
  };

  /* -------------------- Render -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative p-6 bg-gradient-to-b from-[#E30613] to-[#B70510] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-white overflow-hidden"
    >
      {/* ✨ Halo animado de fondo */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* 🧾 Encabezado */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <motion.div
          className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner"
          whileHover={{ scale: 1.05 }}
        >
          <ScanLine className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="font-extrabold text-lg tracking-tight">Escanear Producto</h2>
          <p className="text-sm text-white/90">Ingresa el código de barras o SKU</p>
        </div>
      </div>

      {/* 🧩 Campo de ingreso */}
      <motion.div
        className={`bg-white rounded-2xl p-4 text-slate-800 shadow-inner border transition-all ${
          status === "error"
            ? "border-red-400/60"
            : status === "success"
            ? "border-green-400/60"
            : "border-slate-200"
        }`}
        animate={{
          boxShadow:
            status === "success"
              ? "0 0 12px rgba(0,255,128,0.5)"
              : status === "error"
              ? "0 0 12px rgba(255,64,64,0.5)"
              : "inset 0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Código de Barras / SKU
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: 7802320000013"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#E30613] text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
          />
          <motion.button
            onClick={handleManualSubmit}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gradient-to-br from-[#E30613] to-[#B70510] text-white rounded-xl shadow-md hover:shadow-red-500/30 transition-all"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ScanLine className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* 💬 Resultado */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className={`mt-5 text-sm text-center font-medium ${
              status === "success"
                ? "text-green-300"
                : status === "error"
                ? "text-red-300"
                : "text-slate-200"
            }`}
          >
            {status === "loading" && (
              <div className="flex justify-center items-center gap-2 text-white/90">
                <Loader2 className="w-4 h-4 animate-spin" /> Validando...
              </div>
            )}
            {status === "success" && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span>{message}</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center gap-2">
                <XCircle className="w-6 h-6 text-red-400" />
                <span>{message}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔁 Botón de reinicio */}
      {status !== "idle" && (
        <motion.button
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          className="mt-6 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition"
        >
          Escanear otro producto
        </motion.button>
      )}
    </motion.div>
  );
}

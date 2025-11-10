import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  ChevronLeft,
  Camera,
  ScanLine,
  AlertCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StockEntryModal from "./StockEntryModal";
import { mockDB } from "../data/mockDB";
import { mockProducts } from "../data/mockProducts";

/* -------------------- Paleta -------------------- */
const COLORS = {
  blueMain: "#1F4BC4",
  blueDeep: "#1E40AF",
  blueAccent: "#2563EB",
  white: "#FFFFFF",
  red: "#E30613",
};

/* -------------------- Props -------------------- */
interface BarcodeScannerProps {
  onSuccess?: (code: string) => void;
}

/* -------------------- Componente -------------------- */
export function BarcodeScanner({ onSuccess }: BarcodeScannerProps) {
  const navigate = useNavigate();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  /* -------------------- Inicializar cámara -------------------- */
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length)
          throw new Error("No se detectó ninguna cámara disponible.");

        await reader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current!,
          (res, err) => {
            if (res) {
              const code = res.getText();
              setResult(code);
              (readerRef.current as any)?.reset?.();
              setShowModal(true);
              onSuccess?.(code);
            }
            if (err && err.name !== "NotFoundException") {
              console.warn("Error de decodificación:", err);
            }
          }
        );
      } catch (e: any) {
        console.error("Error al iniciar cámara:", e);
        setError("No se pudo acceder a la cámara.");
      }
    };

    start();
    return () => {
      (readerRef.current as any)?.reset?.();
      readerRef.current = null;
    };
  }, [onSuccess]);

  /* -------------------- Reintentar -------------------- */
  const retry = () => {
    setError(null);
    setResult(null);
    setShowModal(false);
    const reader = readerRef.current;
    if (reader && videoRef.current) {
      reader.decodeFromVideoDevice(undefined, videoRef.current, (res, err) => {
        if (res) {
          const code = res.getText();
          setResult(code);
          (readerRef.current as any)?.reset?.();
          setShowModal(true);
          onSuccess?.(code);
        }
        if (err && err.name !== "NotFoundException") {
          console.error("Error en reintento:", err);
        }
      });
    }
  };

  /* -------------------- Confirmar producto -------------------- */
  const handleConfirm = ({
    productCode,
    quantity,
    expiration,
  }: {
    productCode: string;
    quantity: number;
    expiration: string;
  }) => {
    const product = mockProducts.find((p) => p.barcode === productCode);
    if (!product) {
      alert("❌ Producto no encontrado en catálogo.");
      return;
    }

    mockDB.add({
      quantity,
      expiration_date: expiration,
      location: "Bodega Central",
      product,
      category: product.category,
    });

    window.dispatchEvent(new Event("storage"));
    alert(`✅ ${product.name} agregado al inventario.`);
    setShowModal(false);
    setResult(null);
  };

  /* -------------------- Render principal -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-screen flex flex-col items-center px-5 pt-10 pb-24 text-white"
      style={{
        background: `linear-gradient(180deg, ${COLORS.blueMain} 0%, ${COLORS.blueDeep} 100%)`,
      }}
    >
      {/* 🔹 Header */}
      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <button
          onClick={() => navigate("/dashboard?view=add")}
          className="flex items-center gap-1 text-white/90 hover:text-white transition font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <motion.div
          className="p-[2px] rounded-full bg-gradient-to-r from-[#E30613] to-[#B70510]"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="bg-white p-2 rounded-full shadow-inner">
            <Camera className="w-6 h-6 text-[#E30613]" />
          </div>
        </motion.div>
      </div>

      {/* 🔹 Vista de cámara */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.28)] overflow-hidden"
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {/* Efecto láser */}
          <motion.div
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-x-0 top-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#E30613] to-transparent blur-[2px]"
          />
          <div className="absolute inset-0 border-[2px] border-white/25 rounded-2xl pointer-events-none" />
        </div>

        <div className="p-5">
          <h2 className="text-lg font-bold">Escanear producto</h2>
          <p className="text-sm text-white/80 mb-4">
            Enfoca el código de barras dentro del área para escanearlo.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-sm text-red-100">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {result && (
            <div className="flex flex-col items-center gap-2 text-sm text-white/90 mt-3">
              <Check className="w-5 h-5 text-green-400" />
              <p className="text-white/90 font-semibold">Código detectado</p>
              <p className="font-mono text-[#A9C1FF] text-lg">{result}</p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retry}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1F4BC4] to-[#2563EB] text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/30"
            >
              <ScanLine className="w-5 h-5" /> Reintentar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 🔹 Modal de ingreso de producto */}
      <StockEntryModal
        isOpen={!!(result && showModal)}
        onClose={() => {
          setShowModal(false);
          setResult(null);
        }}
        productCode={result || ""}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}

export default BarcodeScanner;

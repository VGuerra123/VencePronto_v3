import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Quagga from "@ericblade/quagga2";
import API from "../lib/api";

interface Props {
  onClose: () => void;
}

export default function ScannerSimulator({ onClose }: Props) {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // INIT SCANNER
  useEffect(() => {
    startScanner();

    return () => {
      Quagga.stop();
    };
  }, []);

  const startScanner = () => {
    setError("");

    if (!videoRef.current) {
      setError("No se pudo acceder a la cámara.");
      return;
    }

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: { ideal: "environment" }, // 🔥 cámara trasera garantizada
          },
        },
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Error al iniciar Quagga:", err);
          setError("No se pudo iniciar la cámara.");
          return;
        }

        Quagga.start();
      }
    );

    Quagga.onDetected(async (result: any) => {
      const code = result?.codeResult?.code;
      if (!code) return;

      Quagga.pause();
      setLoading(true);

      try {
        const product = await API.scanBarcode(code);
        alert(`Producto encontrado: ${product.name}`);
      } catch (e) {
        setError("Código no encontrado en la base de datos.");
      }

      setLoading(false);

      setTimeout(() => {
        Quagga.start();
      }, 1200);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-black text-white p-5"
    >
      <button onClick={onClose} className="flex items-center gap-1 mb-4">
        <ChevronLeft /> Volver
      </button>

      <h2 className="text-xl font-bold mb-4">Escanear código</h2>

      <div
        ref={videoRef}
        className="w-full h-[360px] bg-black rounded-xl border border-white/20 overflow-hidden"
      />

      {loading && <p className="text-blue-400 mt-4">Validando código...</p>}
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </motion.div>
  );
}

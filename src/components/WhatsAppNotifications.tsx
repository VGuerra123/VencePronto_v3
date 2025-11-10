import { useState, useEffect } from "react";
import {
  MessageCircle,
  Bell,
  X,
  Check,
  Loader2,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";

/* -------------------- Tipos -------------------- */
interface ExpiringProduct {
  id: string;
  product_name: string;
  product_brand: string;
  quantity: number;
  expiration_date: string;
  days_until_expiration: number;
}

interface WhatsAppNotificationsProps {
  onClose: () => void;
}

/* -------------------- Componente -------------------- */
export function WhatsAppNotifications({ onClose }: WhatsAppNotificationsProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  /* 🧠 Simulación de datos locales (sin supabase) */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockProducts: ExpiringProduct[] = [
        {
          id: "1",
          product_name: "Leche Entera Soprole 1L",
          product_brand: "Soprole",
          quantity: 24,
          expiration_date: new Date(Date.now() + 86400000).toISOString(), // Mañana
          days_until_expiration: 1,
        },
        {
          id: "2",
          product_name: "Yoghurt Natural 200ml",
          product_brand: "Colún",
          quantity: 10,
          expiration_date: new Date().toISOString(), // Hoy
          days_until_expiration: 0,
        },
        {
          id: "3",
          product_name: "Mantequilla 250g",
          product_brand: "Soprole",
          quantity: 6,
          expiration_date: new Date(Date.now() - 86400000).toISOString(), // Vencido
          days_until_expiration: -1,
        },
      ];
      setExpiringProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  /* -------------------- Lógica WhatsApp -------------------- */
  const generateWhatsAppMessage = () => {
    if (expiringProducts.length === 0)
      return "No hay productos próximos a vencer en los próximos 3 días.";

    let message = "*⚠️ ALERTA: Productos por vencer*\n\n";
    expiringProducts.forEach((p) => {
      const status =
        p.days_until_expiration < 0
          ? "🔴 VENCIDO"
          : p.days_until_expiration === 0
          ? "🟠 HOY"
          : p.days_until_expiration === 1
          ? "🟡 MAÑANA"
          : `🟢 ${p.days_until_expiration} días`;

      message += `${status}\n`;
      message += `• ${p.product_name} (${p.product_brand})\n`;
      message += `  Cantidad: ${p.quantity}\n`;
      message += `  Vence: ${new Date(
        p.expiration_date
      ).toLocaleDateString("es-CL")}\n\n`;
    });

    return `${message}_Enviado desde *VencePronto*_`;
  };

  const sendWhatsAppMessage = () => {
    const clean = phoneNumber.replace(/\D/g, "");
    if (!clean) return alert("Ingresa un número válido");
    const msg = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* -------------------- UI -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#0B1C14] via-[#0C2816] to-[#0A1411]"
    >
      <div className="min-h-screen p-4 pb-20 relative font-[Inter]">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Alertas por WhatsApp
              </h2>
              <p className="text-sm text-white/70">
                Mantente al tanto de tus productos por vencer
              </p>
            </div>
          </motion.div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Panel principal */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Bell className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">
                Notificaciones automáticas
              </h3>
              <p className="text-sm text-white/70">
                Recibe alertas 3 días antes del vencimiento de tus productos.
              </p>
            </div>
          </div>

          {/* Número de teléfono */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Número de WhatsApp
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-white/10 border border-white/20 rounded-xl text-white/80">
                  <Smartphone className="w-4 h-4 mr-1" />
                  +56
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9 1234 5678"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400/60 outline-none transition"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={sendWhatsAppMessage}
              disabled={!phoneNumber || expiringProducts.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white 
                         bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                         shadow-[0_0_20px_rgba(34,197,94,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Reporte
            </motion.button>
          </div>
        </GlassCard>

        {/* Lista de productos */}
        <h3 className="text-lg font-semibold text-white mb-3">
          Productos próximos a vencer (3 días)
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto" />
          </div>
        ) : expiringProducts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">
              ¡Todo en orden!
            </h4>
            <p className="text-white/70">
              No hay productos próximos a vencer en los próximos 3 días.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {expiringProducts.map((product, i) => {
                const status =
                  product.days_until_expiration < 0
                    ? { color: "red", text: "VENCIDO" }
                    : product.days_until_expiration === 0
                    ? { color: "orange", text: "HOY" }
                    : product.days_until_expiration === 1
                    ? { color: "yellow", text: "MAÑANA" }
                    : {
                        color: "green",
                        text: `${product.days_until_expiration} días`,
                      };

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 border rounded-2xl backdrop-blur-xl bg-${status.color}-500/10 border-${status.color}-500/30`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {product.product_name}
                        </h4>
                        <p className="text-sm text-white/70">
                          {product.product_brand}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-${status.color}-500`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>Cantidad: {product.quantity}</span>
                      <span>{formatDate(product.expiration_date)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

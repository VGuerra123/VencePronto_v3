import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

/* -------------------- Componente principal -------------------- */
export function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getDayPeriod = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "☀️ Buenos días";
    if (hour >= 12 && hour < 19) return "🌤️ Buenas tardes";
    return "🌙 Buenas noches";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-white/40 p-5 mb-4"
    >
      {/* Decoración de brillo sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        {/* Columna izquierda: saludo y fecha */}
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium mb-1">
            {getDayPeriod(currentTime)}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-slate-700 capitalize">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>

        {/* Columna derecha: hora actual */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Clock className="w-4 h-4 text-red-500" />
            <p className="text-xs text-slate-500">Hora actual</p>
          </div>
          <motion.p
            key={Math.floor(currentTime.getSeconds() / 2)} // evita parpadeo por segundo
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight"
          >
            {formatTime(currentTime)}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

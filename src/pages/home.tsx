// src/pages/home.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Package,
  AlertTriangle,
  Flame,
  Gauge,
  BarChart,
  CalendarDays,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockDB, MockInventoryItem } from "../data/mockDB";

/* -------------------- Paleta -------------------- */
const PALETTE = {
  blueMain: "#225BE4",
  blueDeep: "#1C4FD9",
  blueLight: "#A9C1FF",
  white: "#FFFFFF",
  red: "#E30613",
  gold: "#FACC15",
  orange: "#F97316",
};

/* -------------------- Utilidades -------------------- */
const startOf = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const daysBetween = (a: Date, b: Date) =>
  Math.floor((startOf(a).getTime() - startOf(b).getTime()) / 86400000);

/* -------------------- Fondos decorativos (modernos, ligeros) -------------------- */
function ParticlesBG() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      c.width = c.clientWidth * DPR;
      c.height = c.clientHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const N = 36;
    const pts = Array.from({ length: N }).map(() => ({
      x: Math.random() * c.clientWidth,
      y: Math.random() * c.clientHeight,
      r: 1 + Math.random() * 2.8,
      a: 0.18 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = c.clientWidth + 10;
        if (p.x > c.clientWidth + 10) p.x = -10;
        if (p.y < -10) p.y = c.clientHeight + 10;
        if (p.y > c.clientHeight + 10) p.y = -10;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(255,255,255,${p.a})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-20"
      style={{ width: "100%", height: "100%", filter: "blur(0.6px)", opacity: 0.85 }}
    />
  );
}

function SoftGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-30 opacity-[0.18]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px, 28px 28px",
        maskImage:
          "radial-gradient(60% 60% at 50% 35%, black 60%, transparent 100%)",
      }}
    />
  );
}

function Noise() {
  // Ruido ultra sutil para textura
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 opacity=%220.45%22/></svg>')",
      }}
    />
  );
}

/* -------------------- KPI (toques modernos) -------------------- */
function KPI({
  icon,
  label,
  value,
  accent = "rgba(34,91,228,0.22)",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative flex flex-col items-center justify-center p-3 rounded-2xl text-white select-none overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(34,91,228,0.18))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: `0 12px 28px ${accent}`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Shine diagonal sutil */}
      <motion.div
        className="pointer-events-none absolute -left-1 top-0 h-full w-8"
        style={{
          background:
            "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
          mixBlendMode: "overlay",
        }}
        animate={{ x: ["-120%", "150%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <div className="mb-1">{icon}</div>
      <div className="text-lg font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] text-white/85">{label}</div>
    </motion.div>
  );
}

/* -------------------- HOME -------------------- */
export function Home() {
  const [rows, setRows] = useState<MockInventoryItem[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = () => setRows(mockDB.getAll());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeText = now.toLocaleTimeString("es-CL", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const today = startOf(now);
  const metrics = useMemo(() => {
    let total = 0,
      soon3 = 0,
      soon7 = 0,
      expired = 0;

    rows.forEach((r) => {
      const q = r.quantity ?? 0;
      total += q;
      if (!r.expiration_date) return;
      const exp = new Date(r.expiration_date);
      const diff = daysBetween(exp, today);
      if (diff < 0) expired += q;
      else if (diff <= 3) soon3 += q;
      else if (diff <= 7) soon7 += q;
    });

    const healthy = Math.max(0, total - (soon3 + soon7 + expired));
    const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;
    return { total, soon3, soon7, expired, healthy, healthyPct };
  }, [rows, now]);

  const pieData = [
    { name: "Sano", value: metrics.healthy, color: PALETTE.blueLight },
    { name: "≤7 días", value: metrics.soon7, color: PALETTE.orange },
    { name: "≤3 días", value: metrics.soon3, color: PALETTE.gold },
    { name: "Vencido", value: metrics.expired, color: PALETTE.red },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div
      className="relative min-h-[calc(100vh-130px)] w-full overflow-y-auto text-white pb-[70px]"
      style={{
        background: `radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.15) 0%, transparent 50%), linear-gradient(180deg, ${PALETTE.blueMain} 0%, ${PALETTE.blueDeep} 100%)`,
      }}
    >
      <SoftGrid />
      <ParticlesBG />
      <Noise />

      <div className="flex-1 max-w-[520px] mx-auto px-4 pt-4 flex flex-col">
        {/* Encabezado minimal con subrayado animado */}
        <div className="w-full mb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3C6EF7] to-[#2049C7] grid place-items-center shadow-[0_0_14px_rgba(34,91,228,0.65)]"
              animate={{ scale: [0.98, 1.04, 0.98] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Gauge className="w-5 h-5 text-white" />
            </motion.div>
            <h1
              className="text-[16px] sm:text-[18px] font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #ffffff 0%, #D7E3FF 50%, #ffffff 100%)",
              }}
            >
              Dashboard Principal
            </h1>
            <BarChart className="w-5 h-5 text-white/95" />
          </div>

          <div className="relative mx-auto mt-2 h-[3px] w-36 rounded-full bg-white/20 overflow-hidden">
            <motion.span
              className="absolute left-0 top-0 h-full w-16 rounded-full bg-white/70"
              animate={{ x: ["0%", "125%", "0%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="flex justify-center items-center gap-2 text-sm text-white/85 mt-2">
            <Clock className="w-4 h-4 text-white/90" /> {timeText}
          </div>
        </div>

        {/* KPIs con brillo leve */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPI
            icon={<Package className="w-5 h-5 text-white" />}
            label="Total"
            value={metrics.total}
          />
          <KPI
            icon={<CalendarDays className="w-5 h-5 text-orange-300" />}
            label="≤7 días"
            value={metrics.soon7}
            accent="rgba(249,115,22,0.35)"
          />
          <KPI
            icon={<AlertTriangle className="w-5 h-5 text-yellow-300" />}
            label="≤3 días"
            value={metrics.soon3}
            accent="rgba(250,204,21,0.35)"
          />
          <KPI
            icon={<Flame className="w-5 h-5 text-red-300" />}
            label="Vencidos"
            value={metrics.expired}
            accent="rgba(227,6,19,0.3)"
          />
        </div>

        {/* Pie chart con halo y leyenda mejorada */}
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-white/25 grid place-items-center text-white text-[12px]">
              ✓
            </span>
            <span className="font-semibold text-white text-[14px]">
              Estado del Inventario
            </span>
          </div>

          <div className="relative" style={{ height: 210 }}>
            {/* Halo difuso detrás del gráfico */}
            <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[220px] w-[220px] rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.22), rgba(255,255,255,0.02) 70%, transparent 100%)",
                filter: "blur(8px)",
              }}
            />

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  cornerRadius={10}
                  stroke={PALETTE.white}
                  strokeWidth={2}
                >
                  {pieData.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                  {metrics.healthyPct}%
                </div>
                <div className="text-[11px] text-white/75 -mt-1">Stock sano</div>
              </div>
            </div>
          </div>

          {/* Leyenda con microinteracciones */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-white/90 flex-wrap">
            {pieData.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full ring-1 ring-white/40"
                  style={{ background: s.color }}
                />
                <span>{s.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ticker de riesgo (moderno, sin cards) */}
        <section className="mt-6 mb-2">
          <div className="flex items-center justify-center gap-2 text-[12px]">
            <span className="opacity-80">Riesgo:</span>
            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-100 border border-orange-300/30">
              ≤7d: {metrics.soon7}
            </span>
            <span className="px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-100 border border-yellow-300/30">
              ≤3d: {metrics.soon3}
            </span>
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-100 border border-red-300/30">
              vencidos: {metrics.expired}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;

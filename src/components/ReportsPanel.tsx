// src/components/ReportsPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardList,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { mockDB } from "../data/mockDB";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* 🎨 Paleta */
const PALETTE = { blueMain: "#225BE4", blueDeep: "#1C4FD9" };

/* Tipos */
type CategoryStats = { categoryName: string; count: number; color: string };
type Monthly = { date: string; count: number };
type InventoryItem = {
  product: { name: string };
  category: { name: string; color?: string };
  quantity: number;
  expiration_date: string;
  registered_at: string;
};

/* Utils */
const TZ = "America/Santiago";
const fmtCL = (d: string | Date) =>
  new Date(d).toLocaleDateString("es-CL", { timeZone: TZ });
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/* Cargar imagen en base64 desde /public */
async function loadImageDataURL(path: string): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = path;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png", 0.95);
  } catch {
    return null;
  }
}

/* Card base */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[20px] p-4 sm:p-5 backdrop-blur-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow:
          "inset 0 1px 2px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <h3 className="text-[14px] font-semibold mb-3 text-white/90">{title}</h3>
      {children}
    </div>
  );
}

/* Botón de pestaña accesible */
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "relative w-full sm:w-auto whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        active
          ? "bg-white text-[#1C4FD9]"
          : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
      ].join(" ")}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[10px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-white/90" />
      )}
    </button>
  );
}

type TabKey = "general" | "daily";

const ReportsPanel: React.FC = () => {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Monthly[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoHeader, setLogoHeader] = useState<string | null>(null);
  const [logoFooter, setLogoFooter] = useState<string | null>(null);

  /* ====== Carga datos + logos (Generales) ====== */
  useEffect(() => {
    const load = () => {
      setLoading(true);
      try {
        const inv = (mockDB.getAll?.() ?? []) as InventoryItem[];
        setInventory(inv);

        // Totales por categoría
        const map = new Map<string, { count: number; color: string }>();
        inv.forEach((it) => {
          const name = it.category?.name ?? "Otros";
          const color = it.category?.color ?? "#7A9CEE";
          const prev = map.get(name) || { count: 0, color };
          map.set(name, { count: prev.count + (it.quantity ?? 0), color });
        });
        setCategoryStats(
          Array.from(map, ([categoryName, v]) => ({
            categoryName,
            count: v.count,
            color: v.color,
          })).sort((a, b) => b.count - a.count)
        );

        // Actividad últimos 30 días (por día calendario)
        const since = addDays(new Date(), -30);
        const monthly: Record<string, number> = {};
        inv.forEach((it) => {
          const d = new Date(it.registered_at);
          if (d >= since) {
            const k = d.toLocaleDateString("es-CL", { timeZone: TZ });
            monthly[k] = (monthly[k] || 0) + (it.quantity ?? 0);
          }
        });
        const toMs = (s: string) => {
          const [dd, mm, yy] = s.split("/");
          return new Date(+yy, +mm - 1, +dd).getTime();
        };
        setMonthlyStats(
          Object.entries(monthly)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => toMs(b.date) - toMs(a.date))
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    loadImageDataURL("/logo.png").then(setLogoHeader);
    loadImageDataURL("/logopronto.webp").then(setLogoFooter);
  }, []);

  /* ====== Derivados (Diarios) ====== */
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const today = useMemo(() => new Date(), []);
  const ingresosHoy = useMemo(() => {
    let total = 0;
    inventory.forEach((it) => {
      const r = new Date(it.registered_at);
      if (isSameDay(r, today)) total += it.quantity ?? 0;
    });
    return total;
  }, [inventory, today]);

  const proximos7 = useMemo(() => {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const limite = addDays(start, 7);
    return inventory
      .filter((it) => {
        const e = new Date(it.expiration_date);
        return e >= start && e <= limite;
      })
      .sort(
        (a, b) =>
          new Date(a.expiration_date).getTime() -
          new Date(b.expiration_date).getTime()
      );
  }, [inventory, today]);

  const vencidosHoy = useMemo(
    () =>
      inventory.filter((it) => isSameDay(new Date(it.expiration_date), today)),
    [inventory, today]
  );

  const stockCritico = useMemo(
    () => inventory.filter((it) => (it.quantity ?? 0) <= 5),
    [inventory]
  );
  const quiebres = useMemo(
    () => inventory.filter((it) => (it.quantity ?? 0) <= 2),
    [inventory]
  );

  /* ====== Export: Generales (PDF/XLSX) ====== */
  const exportGeneralesPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Encabezado azul
    doc.setFillColor(34, 91, 228);
    doc.rect(0, 0, pageWidth, 22, "F");

    // Logo superior manteniendo proporción
    const logo = logoHeader ?? (await loadImageDataURL("/logo.png"));
    if (logo) {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => (img.onload = resolve));
      const maxW = 25;
      const aspectRatio = img.naturalWidth / img.naturalHeight || 2;
      const w = aspectRatio >= 1 ? maxW : maxW * aspectRatio;
      const h = w / aspectRatio;
      const yPos = (22 - h) / 2;
      doc.addImage(logo, "PNG", 10, yPos, w, h);
    }

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("VencePronto – Informe General de Inventario", 36, 14);
    doc.setFontSize(10);
    doc.text(
      `Fecha: ${new Date().toLocaleString("es-CL", { timeZone: TZ })}`,
      pageWidth - 68,
      14
    );

    let y = 30;

    /* Inventario detallado */
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text("Inventario Detallado", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Producto", "Categoría", "Cantidad", "Vence", "Registrado"]],
      body: inventory.map((i) => [
        i.product?.name ?? "-",
        i.category?.name ?? "-",
        String(i.quantity ?? 0),
        i.expiration_date ? fmtCL(i.expiration_date) : "-",
        i.registered_at ? fmtCL(i.registered_at) : "-",
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
      didDrawPage: () => {
        const page = doc.internal.getNumberOfPages();
        const footerY = pageHeight - 12;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Generado automáticamente por VencePronto · Página ${page}`,
          14,
          footerY
        );

        // Logo footer manteniendo proporción
        const lf = logoFooter;
        if (lf) {
          const imgFoot = new Image();
          imgFoot.src = lf;
          const ar =
            imgFoot.naturalWidth && imgFoot.naturalHeight
              ? imgFoot.naturalWidth / imgFoot.naturalHeight
              : 2;
          const maxW = 20;
          const w2 = ar >= 1 ? maxW : maxW * ar;
          const h2 = w2 / ar;
          const xPos = pageWidth - w2 - 12;
          const yPos = pageHeight - h2 - 6;
          doc.addImage(lf, "PNG", xPos, yPos, w2, h2);
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    /* Totales por Categoría */
    doc.setFontSize(13);
    doc.text("Totales por Categoría", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Categoría", "Total de Unidades"]],
      body: categoryStats.map((c) => [c.categoryName, String(c.count)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    /* Actividad reciente */
    doc.setFontSize(13);
    doc.text("Actividad Reciente (últimos 30 días)", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Productos Registrados"]],
      body: monthlyStats.map((m) => [m.date, String(m.count)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
    });

    doc.save(`Reporte_General_VencePronto_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportGeneralesXLSX = () => {
    const invSheet = [
      ["Producto", "Categoría", "Cantidad", "Vence", "Registrado"],
      ...inventory.map((i) => [
        i.product?.name ?? "",
        i.category?.name ?? "",
        i.quantity ?? 0,
        i.expiration_date ? fmtCL(i.expiration_date) : "",
        i.registered_at ? fmtCL(i.registered_at) : "",
      ]),
    ];
    const catSheet = [
      ["Categoría", "Total de Unidades"],
      ...categoryStats.map((c) => [c.categoryName, c.count]),
    ];
    const monthSheet = [
      ["Fecha", "Productos Registrados"],
      ...monthlyStats.map((m) => [m.date, m.count]),
    ];

    const wb = XLSX.utils.book_new();
    const wsInv = XLSX.utils.aoa_to_sheet(invSheet);
    const wsCat = XLSX.utils.aoa_to_sheet(catSheet);
    const wsMon = XLSX.utils.aoa_to_sheet(monthSheet);

    const fit = (ws: XLSX.WorkSheet) => {
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      const cols: any[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        let max = 10;
        for (let r = range.s.r; r <= range.e.r; r++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          const val = cell?.v ? String(cell.v) : "";
          max = Math.max(max, val.length + 2);
        }
        cols.push({ wch: Math.min(max, 40) });
      }
      (ws as any)["!cols"] = cols;
    };
    [wsInv, wsCat, wsMon].forEach(fit);

    XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");
    XLSX.utils.book_append_sheet(wb, wsCat, "Totales_Categoria");
    XLSX.utils.book_append_sheet(wb, wsMon, "Actividad_30d");
    XLSX.writeFile(
      wb,
      `Reporte_General_VencePronto_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /* ====== Export: Diarios (PDF/XLSX) ====== */
  const exportDiarioPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(34, 91, 228);
    doc.rect(0, 0, pageWidth, 22, "F");

    const logo = logoHeader ?? (await loadImageDataURL("/logo.png"));
    if (logo) {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => (img.onload = resolve));
      const maxW = 25;
      const ar = img.naturalWidth / img.naturalHeight || 2;
      const w = ar >= 1 ? maxW : maxW * ar;
      const h = w / ar;
      const yPos = (22 - h) / 2;
      doc.addImage(logo, "PNG", 10, yPos, w, h);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("VencePronto – Reporte Diario (Retail Pronto/Copec)", 36, 14);
    doc.setFontSize(10);
    doc.text(
      `Fecha: ${new Date().toLocaleString("es-CL", { timeZone: TZ })}`,
      pageWidth - 68,
      14
    );

    let y = 30;

    // KPIs del día
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text("KPIs del Día", 14, y);
    y += 6;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const kpisBody = [
      ["Ingresos de inventario hoy", String(ingresosHoy)],
      ["Productos que vencen ≤7 días", String(proximos7.length)],
      ["Vencidos hoy", String(vencidosHoy.length)],
      ["SKUs en stock crítico (≤5)", String(stockCritico.length)],
      ["Quiebres detectados (≤2)", String(quiebres.length)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Métrica", "Valor"]],
      body: kpisBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Acta de Quiebres y Stock Crítico
    doc.setFontSize(13);
    doc.text("Acta de Quiebres y Stock Crítico", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Producto", "Categoría", "Cantidad", "Tipo de alerta"]],
      body: [...quiebres, ...stockCritico]
        .map((i) => ({
          name: i.product?.name ?? "-",
          cat: i.category?.name ?? "-",
          qty: i.quantity ?? 0,
          tipo: (i.quantity ?? 0) <= 2 ? "Quiebre" : "Stock crítico",
        }))
        .filter(
          (row, idx, arr) =>
            arr.findIndex((x) => x.name === row.name && x.tipo === row.tipo) === idx
        )
        .map((r) => [r.name, r.cat, String(r.qty), r.tipo]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Próximos a Vencer ≤7 días
    doc.setFontSize(13);
    doc.text("Lista de Próximos a Vencer (≤7 días)", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Producto", "Categoría", "Cantidad", "Fecha de vencimiento"]],
      body: proximos7.map((i) => [
        i.product?.name ?? "-",
        i.category?.name ?? "-",
        String(i.quantity ?? 0),
        fmtCL(i.expiration_date),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Vencidos hoy
    doc.setFontSize(13);
    doc.text("Productos Vencidos Hoy", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Producto", "Categoría", "Cantidad", "Vencimiento"]],
      body: vencidosHoy.map((i) => [
        i.product?.name ?? "-",
        i.category?.name ?? "-",
        String(i.quantity ?? 0),
        fmtCL(i.expiration_date),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 91, 228], textColor: 255 },
      didDrawPage: () => {
        const page = doc.internal.getNumberOfPages();
        const footerY = pageHeight - 12;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Generado automáticamente por VencePronto · Página ${page}`,
          14,
          footerY
        );
        if (logoFooter) {
          const imgFoot = new Image();
          imgFoot.src = logoFooter;
          const ar =
            imgFoot.naturalWidth && imgFoot.naturalHeight
              ? imgFoot.naturalWidth / imgFoot.naturalHeight
              : 2;
          const maxW = 20;
          const w2 = ar >= 1 ? maxW : maxW * ar;
          const h2 = w2 / ar;
          const xPos = pageWidth - w2 - 12;
          const yPos = pageHeight - h2 - 6;
          doc.addImage(logoFooter, "PNG", xPos, yPos, w2, h2);
        }
      },
    });

    doc.save(`Reporte_Diario_VencePronto_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportDiarioXLSX = () => {
    const kpisSheet = [
      ["Métrica", "Valor"],
      ["Ingresos de inventario hoy", ingresosHoy],
      ["Productos que vencen ≤7 días", proximos7.length],
      ["Vencidos hoy", vencidosHoy.length],
      ["SKUs en stock crítico (≤5)", stockCritico.length],
      ["Quiebres detectados (≤2)", quiebres.length],
    ];
    const quiebresSheet = [
      ["Producto", "Categoría", "Cantidad", "Tipo de alerta"],
      ...[...quiebres, ...stockCritico]
        .map((i) => ({
          name: i.product?.name ?? "",
          cat: i.category?.name ?? "",
          qty: i.quantity ?? 0,
          tipo: (i.quantity ?? 0) <= 2 ? "Quiebre" : "Stock crítico",
        }))
        .filter(
          (row, idx, arr) =>
            arr.findIndex((x) => x.name === row.name && x.tipo === row.tipo) === idx
        )
        .map((r) => [r.name, r.cat, r.qty, r.tipo]),
    ];
    const proximosSheet = [
      ["Producto", "Categoría", "Cantidad", "Fecha de vencimiento"],
      ...proximos7.map((i) => [
        i.product?.name ?? "",
        i.category?.name ?? "",
        i.quantity ?? 0,
        fmtCL(i.expiration_date),
      ]),
    ];
    const vencidosSheet = [
      ["Producto", "Categoría", "Cantidad", "Vencimiento"],
      ...vencidosHoy.map((i) => [
        i.product?.name ?? "",
        i.category?.name ?? "",
        i.quantity ?? 0,
        fmtCL(i.expiration_date),
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const wsKPI = XLSX.utils.aoa_to_sheet(kpisSheet);
    const wsQ = XLSX.utils.aoa_to_sheet(quiebresSheet);
    const wsP = XLSX.utils.aoa_to_sheet(proximosSheet);
    const wsV = XLSX.utils.aoa_to_sheet(vencidosSheet);

    const fit = (ws: XLSX.WorkSheet) => {
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      const cols: any[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        let max = 10;
        for (let r = range.s.r; r <= range.e.r; r++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          const val = cell?.v ? String(cell.v) : "";
          max = Math.max(max, val.length + 2);
        }
        cols.push({ wch: Math.min(max, 40) });
      }
      (ws as any)["!cols"] = cols;
    };
    [wsKPI, wsQ, wsP, wsV].forEach(fit);

    XLSX.utils.book_append_sheet(wb, wsKPI, "KPIs_Dia");
    XLSX.utils.book_append_sheet(wb, wsQ, "Quiebres_y_Criticos");
    XLSX.utils.book_append_sheet(wb, wsP, "Proximos_7d");
    XLSX.utils.book_append_sheet(wb, wsV, "Vencidos_Hoy");

    XLSX.writeFile(
      wb,
      `Reporte_Diario_VencePronto_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /* ====== KPIs Generales ====== */
  const totalUnidades = categoryStats.reduce((s, c) => s + c.count, 0);
  const promedioCategoria = categoryStats.length
    ? Math.round(totalUnidades / categoryStats.length)
    : 0;

  /* ====== Views por pestaña ====== */
  const GeneralView = (
    <>
      {/* Acciones */}
      <motion.div
        className="relative mx-auto w-full rounded-2xl py-4 px-4 sm:px-6 mb-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)",
          border: "1px solid rgba(255,255,255,0.28)",
          boxShadow:
            "0 10px 28px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.30)",
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-[16px] sm:text-[18px] font-extrabold tracking-tight text-center">
          Reportes y Métricas — Generales
        </h2>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            onClick={exportGeneralesPDF}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/18 border border-white/25 backdrop-blur-lg text-sm font-semibold text-white shadow-lg hover:bg-white/26 transition"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </motion.button>

          <motion.button
            onClick={exportGeneralesXLSX}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/18 border border-white/25 backdrop-blur-lg text-sm font-semibold text-white shadow-lg hover:bg-white/26 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar XLSX
          </motion.button>
        </div>
      </motion.div>

      {/* KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unidades", value: totalUnidades, icon: <Package className="w-5 h-5" /> },
          { label: "Categorías", value: categoryStats.length, icon: <TrendingUp className="w-5 h-5" /> },
          { label: "Registros (30d)", value: monthlyStats.length, icon: <Calendar className="w-5 h-5" /> },
          { label: "Prom/Categoría", value: promedioCategoria, icon: <DollarSign className="w-5 h-5" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative rounded-2xl p-4 text-left"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)",
              border: "1px solid rgba(255,255,255,0.22)",
              boxShadow:
                "inset 0 1px 2px rgba(255,255,255,0.35), 0 8px 18px rgba(0,0,0,0.22)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] text-white/85 leading-none">{kpi.label}</p>
              <div className="p-2 rounded-xl bg-white/14">{kpi.icon}</div>
            </div>
            <div className="text-3xl font-extrabold relative z-10">{kpi.value}</div>
          </motion.div>
        ))}
      </section>

      {/* Distribución */}
      <motion.section
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card title="Distribución por Categoría">
          <div className="space-y-3">
            {!loading &&
              categoryStats.map((c) => {
                const total = categoryStats.reduce((s, x) => s + x.count, 0);
                const pct = total ? (c.count / total) * 100 : 0;
                return (
                  <motion.div key={c.categoryName} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px]">{c.categoryName}</span>
                      <span className="text-[13px] font-semibold">
                        {c.count} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.14)" }}>
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: c.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </Card>
      </motion.section>

      {/* Actividad */}
      <motion.section
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Card title="Actividad Reciente (30d)">
          <div className="relative pl-5">
            <span className="absolute left-2 top-1 bottom-1 w-[2px] bg-white/20 rounded-full" />
            <div className="space-y-3">
              <AnimatePresence>
                {monthlyStats.slice(0, 10).map((m, i) => (
                  <motion.div
                    key={`${m.date}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex items-center gap-3"
                  >
                    <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-white" />
                    <div className="flex-1 bg-white/12 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px]">{m.date}</span>
                        <span className="text-[13px] font-semibold flex items-center gap-1">
                          {m.count} productos <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.section>
    </>
  );

  const DailyView = (
    <>
      {/* Acciones */}
      <motion.div
        className="relative mx-auto w-full rounded-2xl py-4 px-4 sm:px-6 mb-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)",
          border: "1px solid rgba(255,255,255,0.28)",
          boxShadow:
            "0 10px 28px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.30)",
        }}
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-[16px] sm:text-[18px] font-extrabold tracking-tight text-center">
          Reportes y Métricas — Diarias (Retail Pronto/Copec)
        </h2>
        <p className="text-center text-white/80 text-[12px] mt-1">
          Cierre operativo del día y control de frescura/stock por turno.
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            onClick={exportDiarioPDF}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/18 border border-white/25 backdrop-blur-lg text-sm font-semibold text-white shadow-lg hover:bg-white/26 transition"
          >
            <FileDown className="w-4 h-4" />
            PDF del Día
          </motion.button>

        <motion.button
            onClick={exportDiarioXLSX}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/18 border border-white/25 backdrop-blur-lg text-sm font-semibold text-white shadow-lg hover:bg-white/26 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            XLSX del Día
          </motion.button>
        </div>
      </motion.div>

      {/* KPIs del día */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Ingresos hoy", value: ingresosHoy, icon: <ClipboardList className="w-5 h-5" /> },
          { label: "≤7 días", value: proximos7.length, icon: <Timer className="w-5 h-5" /> },
          { label: "Vencidos hoy", value: vencidosHoy.length, icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: "Stock ≤5", value: stockCritico.length, icon: <AlertTriangle className="w-5 h-5" /> },
          { label: "Quiebres ≤2", value: quiebres.length, icon: <AlertTriangle className="w-5 h-5" /> },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative rounded-2xl p-4 text-left"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)",
              border: "1px solid rgba(255,255,255,0.22)",
              boxShadow:
                "inset 0 1px 2px rgba(255,255,255,0.35), 0 8px 18px rgba(0,0,0,0.22)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] text-white/85 leading-none">{kpi.label}</p>
              <div className="p-2 rounded-xl bg-white/14">{kpi.icon}</div>
            </div>
            <div className="text-3xl font-extrabold relative z-10">{kpi.value}</div>
          </motion.div>
        ))}
      </section>

      {/* Acta de quiebres/stock crítico */}
      <motion.section
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Card title="Acta de Quiebres y Stock Crítico (día)">
          <div className="space-y-3">
            {[...quiebres, ...stockCritico]
              .map((i) => ({
                name: i.product?.name ?? "-",
                cat: i.category?.name ?? "-",
                qty: i.quantity ?? 0,
                tipo: (i.quantity ?? 0) <= 2 ? "Quiebre" : "Stock crítico",
              }))
              .filter(
                (row, idx, arr) =>
                  arr.findIndex(
                    (x) => x.name === row.name && x.tipo === row.tipo
                  ) === idx
              )
              .map((row, idx) => (
                <motion.div
                  key={`${row.name}-${row.tipo}-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-white/12 rounded-xl px-3 py-2"
                >
                  <div className="text-[13px]">
                    <span className="font-semibold">{row.name}</span>{" "}
                    <span className="opacity-80">({row.cat})</span>
                  </div>
                  <div className="text-[13px] font-semibold">
                    {row.qty} — {row.tipo}
                  </div>
                </motion.div>
              ))}
            {quiebres.length + stockCritico.length === 0 && (
              <p className="text-[13px] text-white/80">Sin alertas hoy 🎉</p>
            )}
          </div>
        </Card>
      </motion.section>

      {/* Próximos a vencer */}
      <motion.section
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Card title="Próximos a Vencer (≤ 7 días)">
          <div className="space-y-3">
            {proximos7.map((i, idx) => (
              <motion.div
                key={`${i.product?.name}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white/12 rounded-xl px-3 py-2"
              >
                <div className="text-[13px]">
                  <span className="font-semibold">{i.product?.name}</span>{" "}
                  <span className="opacity-80">({i.category?.name ?? "-"})</span>
                </div>
                <div className="text-[13px] font-semibold">
                  {i.quantity ?? 0} — {fmtCL(i.expiration_date)}
                </div>
              </motion.div>
            ))}
            {proximos7.length === 0 && (
              <p className="text-[13px] text-white/80">Nada por vencer en 7 días ✅</p>
            )}
          </div>
        </Card>
      </motion.section>

      {/* Vencidos hoy */}
      <motion.section
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Card title="Vencidos Hoy">
          <div className="space-y-3">
            {vencidosHoy.map((i, idx) => (
              <motion.div
                key={`${i.product?.name}-v-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white/12 rounded-xl px-3 py-2"
              >
                <div className="text-[13px]">
                  <span className="font-semibold">{i.product?.name}</span>{" "}
                  <span className="opacity-80">({i.category?.name ?? "-"})</span>
                </div>
                <div className="text-[13px] font-semibold">
                  {i.quantity ?? 0} — {fmtCL(i.expiration_date)}
                </div>
              </motion.div>
            ))}
            {vencidosHoy.length === 0 && (
              <p className="text-[13px] text-white/80">No hay vencidos hoy 🙌</p>
            )}
          </div>
        </Card>
      </motion.section>
    </>
  );

  return (
    <div
      className="relative w-full mx-auto max-w-[520px] px-4 pb-20 pt-3 text-white overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${PALETTE.blueMain} 0%, ${PALETTE.blueDeep} 100%)`,
      }}
    >
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Selector de reportes"
        className="sticky top-0 z-10 -mx-2 px-2 pb-3 pt-2 bg-gradient-to-b from-[#225BE4] to-[#1C4FD9]/80 backdrop-blur-lg"
      >
        <div className="flex gap-2 sm:gap-3">
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            label="Generales"
          />
          <TabButton
            active={activeTab === "daily"}
            onClick={() => setActiveTab("daily")}
            label="Diarias (Pronto/Copec)"
          />
        </div>
      </div>

      {/* Contenido por pestaña */}
      <AnimatePresence mode="wait">
        {activeTab === "general" ? (
          <motion.div
            key="tab-general"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mt-4"
          >
            {GeneralView}
          </motion.div>
        ) : (
          <motion.div
            key="tab-daily"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mt-4"
          >
            {DailyView}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPanel;
export { ReportsPanel };

// src/components/InventoryView.tsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Filter,
  XCircle,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import {
  mockDB,
  defaultCategories,
  MockInventoryItem,
} from "../data/mockDB";
import { CloseBatchModal } from "../components/CloseBatchModal";

type ClosedBatch = {
  id: string | number | undefined;
  product: string;
  quantity: number;
  reason: string;
  destination: string | null;
  photo: string | null;
  date: string; // ISO
  category?: { id: string; name: string; color: string; icon?: string };
  brand?: string;
};

const FALLBACK_CAT =
  defaultCategories.find((c) => c.id === "c8") ||
  defaultCategories[defaultCategories.length - 1];

export function InventoryView() {
  const [categories] = useState(defaultCategories);

  // Activos
  const [inventory, setInventory] = useState<MockInventoryItem[]>([]);
  const [selectedCategoryActive, setSelectedCategoryActive] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState("");
  const [loading, setLoading] = useState(true);

  // Cerrados
  const [closedBatches, setClosedBatches] = useState<ClosedBatch[]>([]);
  const [selectedCategoryClosed, setSelectedCategoryClosed] = useState<string | null>(null);
  const [searchClosed, setSearchClosed] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"activos" | "cerrados">("activos");

  // Modal
  const [selectedItem, setSelectedItem] = useState<MockInventoryItem | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  /* -------------------- Helpers -------------------- */
  const getDays = (exp: string) => {
    const d = new Date(exp);
    const t = new Date();
    return Math.ceil((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  };
  const getColor = (d: number) =>
    d < 0
      ? "bg-red-500/15 text-red-200 border-red-400/30"
      : d <= 3
      ? "bg-yellow-400/15 text-yellow-100 border-yellow-300/30"
      : d <= 7
      ? "bg-blue-500/15 text-blue-100 border-blue-300/30"
      : "bg-green-500/15 text-green-100 border-green-400/30";
  const getLabel = (d: number) =>
    d < 0 ? "VENCIDO" : d === 0 ? "HOY" : d === 1 ? "MAÑANA" : `${d} días`;

  const openModal = (item: MockInventoryItem) => {
    setSelectedItem(item);
    setCloseModalOpen(true);
  };

  /* -------------------- Carga & migración -------------------- */
  const loadData = () => {
    setLoading(true);
    const data = mockDB.getAll();
    setInventory(data);
    setLoading(false);
  };

  const migrateClosed = (arr: ClosedBatch[]): ClosedBatch[] => {
    const invIndex = new Map<string, MockInventoryItem>();
    mockDB.getAll().forEach((it) => invIndex.set(String(it.id), it));

    const fixed = arr.map((b) => {
      if (b.category && b.brand !== undefined) return b;

      const key = String(b.id ?? "");
      const inv = invIndex.get(key);
      const cat = b.category ?? (inv ? inv.category : FALLBACK_CAT);
      const brand = b.brand ?? (inv ? inv.product.brand : "");

      return {
        ...b,
        category: { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon },
        brand,
      };
    });

    try {
      localStorage.setItem("closedBatches", JSON.stringify(fixed));
    } catch {}
    return fixed;
  };

  const loadClosed = () => {
    const raw = localStorage.getItem("closedBatches");
    try {
      const arr: ClosedBatch[] = raw ? JSON.parse(raw) : [];
      const migrated = migrateClosed(arr);
      migrated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClosedBatches(migrated);
    } catch {
      setClosedBatches([]);
    }
  };

  useEffect(() => {
    loadData();
    loadClosed();
  }, []);

  useEffect(() => {
    const sync = () => {
      loadData();
      loadClosed();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (activeTab === "activos") setSelectedCategoryClosed(null);
    else setSelectedCategoryActive(null);
  }, [activeTab]);

  /* -------------------- Filtros & agrupación (Activos) -------------------- */
  const filteredInventory = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return inventory.filter((item) => {
      const byCat = !selectedCategoryActive || item.category.id === selectedCategoryActive;
      const bySearch =
        !q ||
        item.product.name.toLowerCase().includes(q) ||
        item.product.brand.toLowerCase().includes(q);
      return byCat && bySearch;
    });
  }, [inventory, selectedCategoryActive, searchActive]);

  const groupedActiveByCategory = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        items: filteredInventory.filter((i) => i.category.id === c.id),
      })),
    [categories, filteredInventory]
  );

  /* -------------------- Filtros & agrupación (Cerrados) -------------------- */
  const filteredClosed = useMemo(() => {
    const q = searchClosed.trim().toLowerCase();
    return closedBatches.filter((b) => {
      const byCat = !selectedCategoryClosed || b.category?.id === selectedCategoryClosed;
      const bySearch =
        !q ||
        b.product.toLowerCase().includes(q) ||
        (b.brand ?? "").toLowerCase().includes(q) ||
        b.reason.toLowerCase().includes(q) ||
        (b.destination ?? "").toLowerCase().includes(q);
      return byCat && bySearch;
    });
  }, [closedBatches, selectedCategoryClosed, searchClosed]);

  const groupedClosedByCategory = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        items: filteredClosed.filter((i) => i.category?.id === c.id),
      })),
    [categories, filteredClosed]
  );

  /* -------------------- UI -------------------- */
  return (
    <div className="w-full max-w-[460px] md:max-w-3xl mx-auto px-4 pt-2 pb-28 font-[Inter] text-white">
      {/* Título minimal + resumen */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 opacity-90" />
          <h2 className="text-[15px] sm:text-base font-extrabold tracking-tight">Inventario</h2>
        </div>
        <p className="text-[12px] sm:text-[13px] text-white/80 mt-1">
          {filteredInventory.length} activos · {closedBatches.length} cerrados
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-full gap-2 mb-3">
        <button
          onClick={() => setActiveTab("activos")}
          className={[
            "flex-1 sm:flex-none sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition",
            activeTab === "activos"
              ? "bg-white text-[#1C4FD9]"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
          ].join(" ")}
        >
          <div className="flex items-center justify-center gap-2">
            <FolderOpen className="w-4 h-4" /> Lotes activos
          </div>
        </button>
        <button
          onClick={() => setActiveTab("cerrados")}
          className={[
            "flex-1 sm:flex-none sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition",
            activeTab === "cerrados"
              ? "bg-white text-[#0B7A5C]"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
          ].join(" ")}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Lotes cerrados
          </div>
        </button>
      </div>

      {/* Buscador + chips */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          {activeTab === "activos" ? (
            <input
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
              placeholder="Buscar en activos..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400/60 transition"
            />
          ) : (
            <input
              value={searchClosed}
              onChange={(e) => setSearchClosed(e.target.value)}
              placeholder="Buscar en cerrados (producto, motivo, destino)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-emerald-400/60 transition"
            />
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() =>
              activeTab === "activos"
                ? setSelectedCategoryActive(null)
                : setSelectedCategoryClosed(null)
            }
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition",
              (activeTab === "activos" && !selectedCategoryActive) ||
              (activeTab === "cerrados" && !selectedCategoryClosed)
                ? "bg-white text-[#1C4FD9]"
                : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20",
            ].join(" ")}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const isActive =
              activeTab === "activos"
                ? selectedCategoryActive === cat.id
                : selectedCategoryClosed === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  activeTab === "activos"
                    ? setSelectedCategoryActive(cat.id)
                    : setSelectedCategoryClosed(cat.id)
                }
                className={[
                  "px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap",
                  isActive
                    ? "bg-white text-[#1C4FD9]"
                    : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20",
                ].join(" ")}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO POR PESTAÑA */}
      {activeTab === "activos" ? (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
              />
            </div>
          ) : groupedActiveByCategory.every((g) => g.items.length === 0) ? (
            <div className="text-center py-10">
              <Package className="w-12 h-12 text-white/40 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white/90">No hay productos activos</h3>
              <p className="text-white/70 text-sm">Escanea productos para agregarlos al sistema.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedActiveByCategory
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <section key={group.id}>
                    <header className="mb-2">
                      <h3
                        className="text-[13px] font-bold tracking-wide uppercase opacity-95"
                        style={{ color: group.color || "#CFE0FF" }}
                      >
                        {group.name}
                      </h3>
                      <p className="text-[12px] text-white/70">
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "producto" : "productos"}
                      </p>
                    </header>

                    <div className="divide-y divide-white/10">
                      {group.items.map((item, index) => {
                        const days = getDays(item.expiration_date);
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => openModal(item)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="w-full text-left py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white/90">
                                  {item.product.name}
                                </h4>
                                <p className="text-sm text-white/70 mb-1">
                                  {item.product.brand}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/80 bg-white/10 border border-white/20">
                                    <Hash className="w-3 h-3" /> {item.quantity} uds
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/80 bg-white/10 border border-white/20">
                                    <Calendar className="w-3 h-3" />{" "}
                                    {new Date(item.expiration_date).toLocaleDateString("es-CL")}
                                  </span>
                                  {item.location && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/80 bg-white/10 border border-white/20">
                                      📍 {item.location}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold text-center h-fit">
                                <span
                                  className={`${getColor(
                                    days
                                  )} px-2 py-1 rounded-md border inline-block`}
                                >
                                  {days < 0 && (
                                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                                  )}
                                  {getLabel(days)}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </>
      ) : (
        // CERRADOS
        <div className="space-y-8">
          {groupedClosedByCategory.every((g) => g.items.length === 0) ? (
            <div className="text-center py-10">
              <XCircle className="w-12 h-12 text-white/40 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white/90">No hay lotes cerrados</h3>
              <p className="text-white/70 text-sm">Cierra un lote desde la pestaña de activos.</p>
            </div>
          ) : (
            groupedClosedByCategory
              .filter((g) => g.items.length > 0)
              .map((group) => (
                <section key={`closed-${group.id}`}>
                  <header className="mb-2">
                    <h3
                      className="text-[13px] font-bold tracking-wide uppercase opacity-95"
                      style={{ color: group.color || "#CFE0FF" }}
                    >
                      {group.name}
                    </h3>
                    <p className="text-[12px] text-white/70">
                      {group.items.length} {group.items.length === 1 ? "lote" : "lotes"}
                    </p>
                  </header>

                  <div className="divide-y divide-white/10">
                    {group.items.map((b, idx) => (
                      <motion.div
                        key={`${b.id}-${b.date}-${idx}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white/90">{b.product}</h4>
                            {b.brand && <p className="text-sm text-white/70 mb-1">{b.brand}</p>}
                            <div className="mt-0.5 flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/80">
                                <Hash className="w-3 h-3" /> {b.quantity} uds
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/80">
                                <Filter className="w-3 h-3" /> Motivo: {b.reason}
                              </span>
                              {b.destination && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/80">
                                  📦 Destino: {b.destination}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/80">
                                <Calendar className="w-3 h-3" />
                                {new Date(b.date).toLocaleString("es-CL")}
                              </span>
                              {b.photo && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white/80">
                                  <ImageIcon className="w-3 h-3" />
                                  foto adjunta
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold text-emerald-100 bg-emerald-500/15 border-emerald-400/30">
                            CERRADO
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))
          )}
        </div>
      )}

      {/* Modal de cierre */}
      <CloseBatchModal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        productName={selectedItem?.product.name || ""}
        // 👉 ahora le pasamos el número/id del lote para mostrarlo destacado
        lotId={selectedItem?.id ? String(selectedItem.id) : ""}
        onConfirm={(data) => {
          if (!selectedItem) return;

          // ya no viene cantidad desde el modal → cerramos todo lo que tenga el lote
          const currentQty = selectedItem.quantity ?? 0;
          const qtyToClose = currentQty > 0 ? currentQty : 0;
          if (qtyToClose <= 0) {
            alert("⚠️ No hay cantidad disponible para cerrar.");
            return;
          }

          const closed = JSON.parse(localStorage.getItem("closedBatches") || "[]");
          const newEntry: ClosedBatch = {
            id: selectedItem.id,
            product: selectedItem.product.name || "",
            brand: selectedItem.product.brand || "",
            quantity: qtyToClose,
            reason: data.reason,
            destination: data.destination || null,
            photo: data.photo ? data.photo.name : null,
            date: new Date().toISOString(),
            category: {
              id: selectedItem.category.id,
              name: selectedItem.category.name,
              color: selectedItem.category.color,
              icon: selectedItem.category.icon,
            },
          };
          closed.push(newEntry);
          localStorage.setItem("closedBatches", JSON.stringify(closed));

          // descontar del mockDB
          mockDB.decreaseQuantity(String(selectedItem.id), qtyToClose);

          setCloseModalOpen(false);
          loadData();
          loadClosed();

          alert("✅ Lote cerrado y actualizado en inventario.");
          setActiveTab("cerrados");
        }}
      />
    </div>
  );
}

export default InventoryView;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Trash2, Calendar, MapPin } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Modal } from "./Modal";
import { mockDB, MockInventoryItem } from "../data/mockDB";

export function InventoryList() {
  const [inventory, setInventory] = useState<MockInventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MockInventoryItem | null>(
    null
  );
  const [closeModal, setCloseModal] = useState(false);
  const [closeData, setCloseData] = useState({
    quantity: 0,
    reason: "",
    destination: "",
    photo: null as File | null,
  });

  // 🔄 Cargar datos desde localStorage
  useEffect(() => {
    const load = () => setInventory(mockDB.getAll());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este producto del inventario?")) {
      mockDB.remove(id);
      setInventory(mockDB.getAll());
    }
  };

  const handleCloseBatch = (item: MockInventoryItem) => {
    setSelectedItem(item);
    setCloseData({
      quantity: item.quantity,
      reason: "",
      destination: "",
      photo: null,
    });
    setCloseModal(true);
  };

  const handleConfirmClose = () => {
    if (!selectedItem) return;
    if (!closeData.reason) return alert("Selecciona un motivo.");

    // Simular cierre guardando en otro localStorage
    const closed = JSON.parse(localStorage.getItem("closedBatches") || "[]");
    closed.push({
      id: selectedItem.id,
      product: selectedItem.product.name,
      brand: selectedItem.product.brand,
      quantity: closeData.quantity,
      reason: closeData.reason,
      destination: closeData.destination || null,
      photo: closeData.photo ? closeData.photo.name : null,
      date: new Date().toISOString(),
    });
    localStorage.setItem("closedBatches", JSON.stringify(closed));

    // Actualizar el inventario (quitar o reducir cantidad)
    const all = mockDB.getAll();
    const updated = all.map((p) =>
      p.id === selectedItem.id
        ? { ...p, quantity: Math.max(p.quantity - closeData.quantity, 0) }
        : p
    );
    localStorage.setItem("vencepronto_inventory", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    alert("✅ Lote cerrado correctamente.");
    setCloseModal(false);
  };

  const getDaysUntilExpiration = (date: string) => {
    const today = new Date();
    const exp = new Date(date);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getColor = (d: number) =>
    d < 0
      ? "text-red-600"
      : d <= 3
      ? "text-orange-600"
      : d <= 7
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="space-y-4 font-[Inter]">
      {inventory.length === 0 ? (
        <GlassCard className="p-6 text-center text-gray-500">
          No hay productos en el inventario
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const days = getDaysUntilExpiration(item.expiration_date);
            return (
              <GlassCard key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: item.category.color + "20" }}
                  >
                    <Package
                      className="w-5 h-5"
                      style={{ color: item.category.color }}
                    />
                  </div>
                  <motion.button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-700">{item.product.brand}</p>

                <div className="mt-2 space-y-1 text-sm">
                  <p className={getColor(days)}>
                    {days < 0
                      ? `Vencido`
                      : `Vence en ${days} día${days !== 1 ? "s" : ""}`}
                  </p>
                  <p>Cantidad: {item.quantity}</p>
                  {item.location && (
                    <p className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar className="w-3 h-3" />{" "}
                    {new Date(item.expiration_date).toLocaleDateString("es-CL")}
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <motion.button
                    onClick={() => handleCloseBatch(item)}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-semibold"
                    whileTap={{ scale: 0.95 }}
                  >
                    Cerrar lote
                  </motion.button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal para cerrar lote */}
      <Modal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        title={
          selectedItem
            ? `Cerrar lote: ${selectedItem.product.name}`
            : "Cerrar lote"
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cantidad a cerrar
            </label>
            <input
              type="number"
              value={closeData.quantity}
              onChange={(e) =>
                setCloseData({ ...closeData, quantity: +e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Motivo</label>
            <select
              value={closeData.reason}
              onChange={(e) =>
                setCloseData({ ...closeData, reason: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecciona...</option>
              <option value="vendido">Vendido</option>
              <option value="merma">Merma</option>
              <option value="consumo_interno">Consumo interno</option>
              <option value="traspaso">Traspaso de local</option>
            </select>
          </div>

          {closeData.reason === "merma" && (
            <div>
              <label className="block text-sm font-medium mb-1">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCloseData({
                    ...closeData,
                    photo: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          )}

          {closeData.reason === "traspaso" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Local destino
              </label>
              <input
                type="text"
                value={closeData.destination}
                onChange={(e) =>
                  setCloseData({ ...closeData, destination: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Ej: Local Curacaví"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setCloseModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Confirmar cierre
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

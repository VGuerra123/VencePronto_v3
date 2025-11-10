import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Search, Plus, Check, Loader2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

/* -------------------- Tipos -------------------- */
interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string | null;
  default_shelf_life_days: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ProductScannerProps {
  onSuccess: () => void;
}

/* -------------------- Componente principal -------------------- */
export function ProductScanner({ onSuccess }: ProductScannerProps) {
  const { user } = useAuth();
  const [scanMode, setScanMode] = useState<"barcode" | "search">("barcode");
  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* -------------------- Cargar categorías -------------------- */
  useEffect(() => {
    loadCategories();
  }, []);

  /* -------------------- Buscar productos dinámicamente -------------------- */
  useEffect(() => {
    if (searchTerm.length >= 2) searchProducts();
    else setProducts([]);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      const data = await api.getProducts();
      const uniqueCategories = Array.from(
        new Map(
          data
            .filter((p: any) => p.category)
            .map((p: any) => [p.category.id, p.category])
        ).values()
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const searchProducts = async () => {
    try {
      const all = await api.getProducts();
      const filtered = all.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered.slice(0, 10));
    } catch (error) {
      console.error("Error buscando productos:", error);
    }
  };

  const handleBarcodeScan = async () => {
    if (!barcode) return;
    setLoading(true);
    try {
      const all = await api.getProducts();
      const match = all.find((p) => p.barcode === barcode);
      if (match) {
        setSelectedProduct(match);
        const suggestedDate = new Date();
        suggestedDate.setDate(
          suggestedDate.getDate() + match.default_shelf_life_days
        );
        setExpirationDate(suggestedDate.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error en escaneo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedProduct || !expirationDate) return;
    setLoading(true);
    try {
      await api.addInventory({
        product_id: selectedProduct.id,
        user_id: user?.id ?? "mock-user",
        expiration_date: expirationDate,
        quantity,
        location: location || null,
        status: "active",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedProduct(null);
        setBarcode("");
        setSearchTerm("");
        setExpirationDate("");
        setQuantity(1);
        setLocation("");
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Error al registrar producto:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-6">
      {/* Modo de entrada */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => setScanMode("barcode")}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
            scanMode === "barcode"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
              : "bg-white/90 text-gray-700"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Scan className="w-5 h-5" />
          <span>Código de Barras</span>
        </motion.button>

        <motion.button
          onClick={() => setScanMode("search")}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
            scanMode === "search"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
              : "bg-white/90 text-gray-700"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-5 h-5" />
          <span>Buscar Producto</span>
        </motion.button>
      </div>

      {/* Alternancia de vistas */}
      <AnimatePresence mode="wait">
        {scanMode === "barcode" ? (
          <motion.div
            key="barcode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Barras
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleBarcodeScan()
                      }
                      placeholder="Escanea o ingresa el código"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                    <motion.button
                      onClick={handleBarcodeScan}
                      disabled={!barcode || loading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Scan className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Producto
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o marca del producto"
                    className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {products.map((product) => (
                    <motion.button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        const suggestedDate = new Date();
                        suggestedDate.setDate(
                          suggestedDate.getDate() +
                            product.default_shelf_life_days
                        );
                        setExpirationDate(
                          suggestedDate.toISOString().split("T")[0]
                        );
                      }}
                      className="w-full p-4 rounded-xl bg-white/80 hover:bg-white/90 transition-all text-left"
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-700">{product.brand}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario de registro */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6" hover={false}>
              {success ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Producto Registrado
                  </h3>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.brand}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación (Opcional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej: Estante A3"
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-300/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <motion.button
                    onClick={handleRegister}
                    disabled={loading || !expirationDate}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Registrar Producto</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

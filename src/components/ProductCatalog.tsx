import { useState, useEffect } from "react";
import { Search, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { api } from "../lib/api";

/* -------------------- Tipos -------------------- */
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category_id: string;
  default_shelf_life_days: number;
}

interface ProductCatalogProps {
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

/* -------------------- Componente -------------------- */
export function ProductCatalog({ onSelectProduct, onClose }: ProductCatalogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* -------------------- Cargar datos -------------------- */
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory || searchQuery) loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();

      // 🔹 Extraer categorías únicas desde los productos
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
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await api.getProducts();

      const filtered = allProducts.filter((p: Product) => {
        const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
        const matchSearch = searchQuery
          ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchCategory && matchSearch;
      });

      setProducts(filtered);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Iconos dinámicos -------------------- */
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      package: Package,
    };
    return icons[iconName] || Package;
  };

  /* -------------------- Render principal -------------------- */
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="min-h-screen p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Catálogo de Productos</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* 🔍 Buscador */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* 🏷️ Categorías */}
          {!searchQuery && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Categorías</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  return (
                    <motion.button
                      key={category.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )
                      }
                      className={`p-4 rounded-2xl backdrop-blur-xl border transition-all ${
                        selectedCategory === category.id
                          ? "bg-white/20 border-white/40"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        className="w-6 h-6 mx-auto mb-2"
                        style={{ color: category.color }}
                      />
                      <p className="text-xs font-medium text-white text-center">
                        {category.name}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📦 Listado de productos */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : products.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-300">
                  {searchQuery || selectedCategory
                    ? "No se encontraron productos"
                    : "Selecciona una categoría o busca un producto"}
                </p>
              </GlassCard>
            ) : (
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard
                      className="p-4 cursor-pointer hover:bg-white/15 transition-all active:scale-[0.98]"
                      onClick={() => onSelectProduct(product)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-slate-300">{product.brand}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {product.barcode}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

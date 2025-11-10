// src/data/mockDB.ts
export interface MockCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category_id: string;
  category: MockCategory;
  default_shelf_life_days: number;
}

export interface MockInventoryItem {
  id: string;
  quantity: number;
  expiration_date: string;   // ISO (YYYY-MM-DD o ISO completo)
  registered_at: string;     // ISO
  location?: string;
  product: MockProduct;
  category: MockCategory;
}

/* ==================== Storage ==================== */
const STORAGE_KEY = "vencepronto_inventory";

function load(): MockInventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    const arr = JSON.parse(raw) as MockInventoryItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(data: MockInventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function saveAndBroadcast(data: MockInventoryItem[]) {
  save(data);
  // 🔄 Notifica a todas las pestañas/componentes que escuchen "storage"
  window.dispatchEvent(new Event("storage"));
}

/* ==================== API Simulada ==================== */
export const mockDB = {
  /* ---- Lectura ---- */
  getAll: (): MockInventoryItem[] => load(),

  getById: (id: string): MockInventoryItem | undefined => {
    return load().find((x) => x.id === id);
  },

  /* ---- Escritura unitaria ---- */
  add: (item: Omit<MockInventoryItem, "id" | "registered_at">) => {
    const all = load();
    const newItem: MockInventoryItem = {
      ...item,
      id: Date.now().toString(),
      registered_at: new Date().toISOString(),
    };
    all.push(newItem);
    saveAndBroadcast(all);
    return newItem;
  },

  remove: (id: string) => {
    const all = load();
    const next = all.filter((p) => p.id !== id);
    if (next.length !== all.length) {
      saveAndBroadcast(next);
    }
  },

  updateQuantity: (id: string, quantity: number) => {
    const all = load();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) return;

    if (quantity <= 0) {
      // si la cantidad nueva es 0 o negativa, eliminar el lote
      const next = all.filter((x) => x.id !== id);
      saveAndBroadcast(next);
      return;
    }

    const next = [...all];
    next[idx] = { ...next[idx], quantity };
    saveAndBroadcast(next);
  },

  decreaseQuantity: (id: string, qty: number) => {
    if (qty <= 0) return;
    const all = load();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const current = all[idx];
    const left = (current.quantity ?? 0) - qty;

    if (left <= 0) {
      // eliminar lote si no queda stock
      const next = all.filter((x) => x.id !== id);
      saveAndBroadcast(next);
    } else {
      const next = [...all];
      next[idx] = { ...current, quantity: left };
      saveAndBroadcast(next);
    }
  },

  /* ---- Escritura masiva ---- */
  setAll: (data: MockInventoryItem[]) => {
    saveAndBroadcast(data);
  },

  saveAll: (data: MockInventoryItem[]) => {
    // alias semántico
    saveAndBroadcast(data);
  },

  replaceAll: (data: MockInventoryItem[]) => {
    // alias semántico
    saveAndBroadcast(data);
  },

  clear: () => {
    saveAndBroadcast([]);
  },
};

/* ==================== Categorías base ==================== */
export const defaultCategories: MockCategory[] = [
  { id: "c1", name: "Snacks",              color: "#4F46E5", icon: "🍪" },
  { id: "c2", name: "Lácteos",             color: "#2563EB", icon: "🥛" },
  { id: "c3", name: "Bebidas",             color: "#F59E0B", icon: "🥤" },
  { id: "c4", name: "Bollería",            color: "#8B5CF6", icon: "🥐" },
  { id: "c5", name: "Impulsivo",           color: "#EC4899", icon: "🍬" },
  { id: "c6", name: "Helados",             color: "#22D3EE", icon: "🍨" },
  { id: "c7", name: "Sándwich envasados",  color: "#10B981", icon: "🥪" },
  { id: "c8", name: "Otros",               color: "#9CA3AF", icon: "📦" },
];

/* ==================== Productos mock ==================== */
// import { MockCategory, MockProduct } from "./mockDB";
export const mockProducts: MockProduct[] = [
  // Snacks
  {
    id: "p1",
    name: "Galletas Oreo 118g",
    brand: "Mondelez",
    barcode: "7622300813559",
    category_id: "c1",
    default_shelf_life_days: 180,
    category: { id: "c1", name: "Snacks", icon: "🍪", color: "#4F46E5" },
  },
  {
    id: "p5",
    name: "Snack Doritos 170g",
    brand: "Doritos",
    barcode: "7622300961924",
    category_id: "c1",
    default_shelf_life_days: 180,
    category: { id: "c1", name: "Snacks", icon: "🍪", color: "#4F46E5" },
  },

  // Lácteos
  {
    id: "p4",
    name: "Yogurt Batido Frutilla 125g Colún",
    brand: "Colún",
    barcode: "7802900004216",
    category_id: "c2",
    default_shelf_life_days: 30,
    category: { id: "c2", name: "Lácteos", icon: "🥛", color: "#2563EB" },
  },

  // Bebidas
  {
    id: "p3",
    name: "Coca-Cola Original 1.5L",
    brand: "Coca-Cola",
    barcode: "7801610001622",
    category_id: "c3",
    default_shelf_life_days: 365,
    category: { id: "c3", name: "Bebidas", icon: "🥤", color: "#F59E0B" },
  },
  {
    id: "p6",
    name: "Agua Mineral Cachantún 500 ml",
    brand: "Cachantún",
    barcode: "7802900010021",
    category_id: "c3",
    default_shelf_life_days: 730,
    category: { id: "c3", name: "Bebidas", icon: "🥤", color: "#F59E0B" },
  },

  // Bollería
  {
    id: "p11",
    name: "Croissant",
    brand: "La Boulangerie",
    barcode: "7804300000121",
    category_id: "c4",
    default_shelf_life_days: 7,
    category: { id: "c4", name: "Bollería", icon: "🥐", color: "#8B5CF6" },
  },
  {
    id: "p12",
    name: "medialuna dulce",
    brand: "Qfield",
    barcode: "7802100003456",
    category_id: "c4",
    default_shelf_life_days: 3,
    category: { id: "c4", name: "Bollería", icon: "🥐", color: "#8B5CF6" },
  },

  // Impulsivo
  {
    id: "p13",
    name: "Chicles Trident Menta 20u",
    brand: "Trident",
    barcode: "7501057812345",
    category_id: "c5",
    default_shelf_life_days: 365,
    category: { id: "c5", name: "Impulsivo", icon: "🍬", color: "#EC4899" },
  },

  // Helados
  {
    id: "p7",
    name: "Helado Chomp Sahne Nuss 225 ml",
    brand: "Chomp",
    barcode: "7802000074501",
    category_id: "c6",
    default_shelf_life_days: 180,
    category: { id: "c6", name: "Helados", icon: "🍨", color: "#22D3EE" },
  },

  // Sándwich envasados
  {
    id: "p15",
    name: "Sándwich miga Ave Pimentón 175g",
    brand: "Daily Fresh",
    barcode: "780462509210",
    category_id: "c7",
    default_shelf_life_days: 5,
    category: { id: "c7", name: "Sándwich envasados", icon: "🥪", color: "#10B981" },
  },
];

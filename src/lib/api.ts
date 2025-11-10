// 🌐 Punto único de llamadas HTTP (mock/local; luego conectaremos tu backend)
import { mockProducts } from "../data/mockProducts";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
const USE_MOCK = !import.meta.env.VITE_API_BASE; // Si no hay backend definido, usamos mock local

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * 🔹 Helper universal para peticiones HTTP
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  // Si no hay body (204), devolvemos undefined como tipo T
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

/* ------------------------------------------------------------
   🌍 Endpoints disponibles — capa de API modular y extensible
------------------------------------------------------------ */
export const api = {
  /* -------------------- 🔐 AUTH -------------------- */
  login: async (email: string, password: string) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { id: "mock-user", email };
    }
    return request<{ id: string; email: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { id: "mock-user", email };
    }
    return request<{ id: string; email: string }>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    if (USE_MOCK) return;
    return request<void>("/logout", { method: "POST" });
  },

  /* -------------------- 📦 INVENTARIO -------------------- */
  getProducts: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 350));
      return mockProducts;
    }
    return request<any[]>("/products");
  },

  getInventory: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockProducts.map((p) => ({
        id: `inv-${p.id}`,
        quantity: Math.floor(Math.random() * 20) + 1,
        expiration_date: new Date(
          Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 60
        ).toISOString(),
        batch_code: null,
        location: ["Depósito A", "Depósito B", "Cámara Fría"][
          Math.floor(Math.random() * 3)
        ],
        registered_at: new Date().toISOString(),
        product: {
          name: p.name,
          brand: p.brand,
          barcode: p.barcode,
          category_id: p.category_id,
        },
      }));
    }
    return request<any[]>("/inventory");
  },

  addInventory: async (payload: any) => {
    if (USE_MOCK) {
      console.log("🧩 Mock addInventory:", payload);
      return { success: true, id: `mock-${Date.now()}` };
    }
    return request("/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteInventoryItem: async (id: string) => {
    if (USE_MOCK) {
      console.log("🗑️ Mock deleteInventoryItem:", id);
      return { success: true };
    }
    return request(`/inventory/${id}`, { method: "DELETE" });
  },

  updateInventoryItem: async (id: string, payload: any) => {
    if (USE_MOCK) {
      console.log("🧩 Mock updateInventoryItem:", id, payload);
      return { success: true };
    }
    return request(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /* -------------------- 🧠 REPORTES -------------------- */
  getReports: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [
        { id: 1, title: "Productos próximos a vencer", total: 12 },
        { id: 2, title: "Inventario total", total: 186 },
        { id: 3, title: "Promedio de rotación", total: "7.5 días" },
      ];
    }
    return request<any[]>("/reports");
  },

  /* -------------------- 📲 CONTACTOS WHATSAPP -------------------- */
  getContacts: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [
        { id: "c1", name: "Operador Bodega", phone: "+56988887777" },
        { id: "c2", name: "Supervisor Logístico", phone: "+56977776666" },
      ];
    }
    return request<any[]>("/contacts");
  },

  addContact: async (contact: any) => {
    if (USE_MOCK) {
      console.log("🧩 Mock addContact:", contact);
      return { success: true };
    }
    return request("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
  },

  deleteContact: async (id: string) => {
    if (USE_MOCK) {
      console.log("🧩 Mock deleteContact:", id);
      return { success: true };
    }
    return request(`/contacts/${id}`, { method: "DELETE" });
  },

  /* -------------------- 🚨 ALERTAS -------------------- */
  getAlerts: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [
        {
          id: "a1",
          message: "Producto con fecha próxima de vencimiento",
          severity: "warning",
          product: "Leche Soprole 1L",
        },
        {
          id: "a2",
          message: "Inventario bajo en stock",
          severity: "critical",
          product: "Galletas Oreo 118g",
        },
      ];
    }
    return request<any[]>("/alerts");
  },

  acknowledgeAlert: async (id: string) => {
    if (USE_MOCK) {
      console.log("🔕 Mock acknowledgeAlert:", id);
      return { success: true };
    }
    return request(`/alerts/${id}/acknowledge`, { method: "POST" });
  },
};

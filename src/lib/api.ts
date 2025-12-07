// ================================
// API CONFIG
// ================================
const API_BASE = "https://jkfgr27343.execute-api.us-east-1.amazonaws.com/"; 
// tu API Gateway real

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ------------------------
// Tipos de respuesta
// ------------------------
export interface ScannedProduct {
  code: string;
  name: string;
  category?: string;
}

export interface AddProductPayload {
  code: string;
  name?: string;
  category?: string;
}

// ------------------------
// Petición universal
// ------------------------
async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text);
  }

  return res.json();
}

// ================================
// ENDPOINTS
// ================================

// Escanear producto
export function scanBarcode(code: string): Promise<ScannedProduct> {
  return request("/inventory/scan", "POST", { code });
}

// Agregar producto manualmente
export function addProduct(payload: AddProductPayload) {
  return request("/inventory/add", "POST", payload);
}

// Obtener productos
export function getProducts() {
  return request("/products", "GET");
}

// Obtener alertas
export function getAlerts() {
  return request("/alerts", "GET");
}

export default {
  scanBarcode,
  addProduct,
  getProducts,
  getAlerts,
};

// Tipos comunes (iremos ampliando a medida que actualicemos archivos)
export type User = {
  id: string;
  email: string;
};

export type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  barcode?: string;
  default_shelf_life_days?: number;
  image_url?: string | null;
};

export type InventoryRow = {
  id: string;
  product_id: string;
  user_id?: string; // cuando tengamos auth real
  expiration_date: string; // ISO yyyy-mm-dd
  quantity: number;
  batch_code?: string | null;
  location?: string | null;
  status?: "active" | "expired" | "removed";
  registered_at?: string;
};

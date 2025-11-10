import { MockCategory, MockProduct } from "./mockDB";

export const mockProducts: MockProduct[] = [
  // Snacks
  {
    id: "p1",
    name: "Galletas Oreo 118g",
    brand: "Mondelez",
    barcode: "7622300813559",
    category_id: "c1",
    default_shelf_life_days: 180,
    category: { id:"c1", name:"Snacks", icon:"🍪", color:"#4F46E5" },
  },
  {
    id: "p5",
    name: "Snack Doritos 170g",
    brand: "Doritos",
    barcode: "7622300961924",
    category_id: "c1",
    default_shelf_life_days: 180,
    category: { id:"c1", name:"Snacks", icon:"🍪", color:"#4F46E5" },
  },
  // Lácteos

  {
    id: "p4",
    name: "Yogurt Batido Frutilla 125g Colún",
    brand: "Colún",
    barcode: "7802900004216",
    category_id: "c2",
    default_shelf_life_days: 30,
    category: { id:"c2", name:"Lácteos", icon:"🥛", color:"#2563EB" },
  },
  // Bebidas
  {
    id: "p3",
    name: "Coca-Cola Original 1.5L",
    brand: "Coca-Cola",
    barcode: "7801610001622",
    category_id: "c3",
    default_shelf_life_days: 365,
    category: { id:"c3", name:"Bebidas", icon:"🥤", color:"#F59E0B" },
  },
  {
    id: "p6",
    name: "Agua Mineral Cachantún 500 ml",
    brand: "Cachantún",
    barcode: "7802900010021",
    category_id: "c3",
    default_shelf_life_days: 730,
    category: { id:"c3", name:"Bebidas", icon:"🥤", color:"#F59E0B" },
  },
  // Bollería
  {
    id: "p11",
    name: "Croissant",
    brand: "La Boulangerie",
    barcode: "7804300000121",
    category_id: "c4",
    default_shelf_life_days: 7,
    category: { id:"c4", name:"Bollería", icon:"🥐", color:"#8B5CF6" },
  },
  {
    id: "p12",
    name: "medialuna dulce",
    brand: "Qfield",
    barcode: "7802100003456",
    category_id: "c4",
    default_shelf_life_days: 3,
    category: { id:"c4", name:"Bollería", icon:"🥐", color:"#8B5CF6" },
  },
  // Impulsivo

  {
    id: "p13",
    name: "Chicles Trident Menta 20u",
    brand: "Trident",
    barcode: "7501057812345",
    category_id: "c5",
    default_shelf_life_days: 365,
    category: { id:"c5", name:"Impulsivo", icon:"🍬", color:"#EC4899" },
  },
  // Helados
  {
    id: "p7",
    name: "Helado Chomp Sahne Nuss 225 ml",
    brand: "Chomp",
    barcode: "7802000074501",
    category_id: "c6",
    default_shelf_life_days: 180,
    category: { id:"c6", name:"Helados", icon:"🍨", color:"#22D3EE" },
  },

  // Sándwich envasados
  {
    id: "p15",
    name: "Sándwich miga Ave Pimentón 175g",
    brand: "Daily Fresh",
    barcode: "780462509210",
    category_id: "c7",
    default_shelf_life_days: 5,
    category: { id:"c7", name:"Sándwich envasados", icon:"🥪", color:"#10B981" },
  },

];
# 📦 VencePronto - Sistema de Gestión de Inventario

Sistema profesional de gestión de inventario con alertas automáticas de vencimiento, diseñado con estética premium inspirada en grandes marcas como Copec.

## 🎨 Características Principales

### ✨ Diseño Elite Mobile-First
- Gradientes premium en azules, blancos y celestes
- Interfaz intuitiva optimizada para dispositivos móviles
- Escalable perfectamente a desktop
- Animaciones suaves y profesionales con Framer Motion
- Glassmorphism y sombras elegantes

### 🔍 Escáner de Códigos de Barras
- **Entrada Principal:** Escaner como punto de entrada al sistema
- Validación automática contra base de datos de productos
- Soporte para códigos de barras y SKU manual
- Compatible con lectores USB para agilizar procesos
- Simulación realista de escaneo con feedback visual

### 📊 Gestión de Inventario
- Vista organizada por categorías de productos
- 9 categorías: Aguas, Bollería, Energéticas, Gaseosas, Impulsivos, Isotónicas, Jugos, Snacks Dulces, Snacks Salados
- Más de 100 productos chilenos precargados
- Estados visuales según días de vencimiento
- Búsqueda y filtrado en tiempo real

### 📱 Alertas WhatsApp Automáticas
- Sistema de notificaciones automáticas 3 días antes del vencimiento
- Gestión de lista de contactos
- Mensajes formateados profesionalmente
- **Botón Demo:** Envía alerta de prueba a +56 9 7452 3617
- Mensajes incluyen: producto, marca, cantidad, estado y fecha

### 📈 Reportes y Estadísticas
- Total de productos en inventario
- Productos próximos a vencer (7 días)
- Productos vencidos
- Visualización con gráficos y colores

## 🗄️ Estructura de Base de Datos

### Supabase PostgreSQL

#### Tabla: `categories`
Categorías de productos para organización
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text DEFAULT 'package',
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);
```

**Categorías incluidas:**
- 🔋 Energéticas (rojo: #ef4444)
- 💧 Gaseosas (azul: #3b82f6)
- 🏃 Isotónicas (verde: #10b981)
- 💎 Aguas (cyan: #06b6d4)
- 🧃 Jugos (naranja: #f59e0b)
- 🍪 Snacks Dulces (rosa: #ec4899)
- 🥨 Snacks Salados (naranja: #f97316)
- 🥐 Bollería (morado: #a855f7)
- 🛒 Impulsivos (amarillo: #eab308)

---

#### Tabla: `products`
Catálogo maestro de productos
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  brand text NOT NULL,
  barcode text UNIQUE,
  default_shelf_life_days integer DEFAULT 30,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Productos de ejemplo incluidos:**
- **Gaseosas:** Coca-Cola, Fanta, Sprite, Kem Extreme, Bilz, Pap, Pepsi
- **Energéticas:** Red Bull (Original, Sugar Free), Monster (Energy, White, Mango Loco), Score, Volt
- **Isotónicas:** Gatorade (Naranja, Azul, Rojo), Powerade (Mora, Azul, Lima), Electrolit, Suerox
- **Aguas:** Cachantun (Sin/Con Gas, Sabor Limón), Vital (Sin/Con Gas), Benedictino
- **Jugos:** Watts (Durazno, Frutilla, Piña), Ades (Durazno, Frutilla), Andina del Valle
- **Snacks Dulces:** Tritón, Frac, Tuareg, Obsesión, Oreo, Chips Ahoy, Guillón Duo, Crackelet
- **Snacks Salados:** Lay's, Doritos, Takis, Tostitos, Pringles, Ramitas, Papas Tika/Roots/Nativas
- **Bollería:** Alfajores (Milka, Jorgito, Cachafaz), Donuts, Muffins, Brownies, Rolls
- **Impulsivos:** Snickers, Kit Kat, Twix, M&M, Skittles, Bon o Bon, chicles, barras de cereal

**Códigos de barras de ejemplo para pruebas:**
- `7802320000013` - Score Energy
- `7802800000010` - Coca-Cola 500ml
- `7622300000200` - Oreo Original
- `7802320000224` - Lay's Clásicas
- `9002490100018` - Red Bull Original

---

#### Tabla: `inventory`
Registros de inventario con fechas de vencimiento
```sql
CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  expiration_date date NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  batch_code text,
  location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  registered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos importantes:**
- `expiration_date`: Fecha de vencimiento del lote
- `quantity`: Cantidad de unidades registradas
- `batch_code`: Código de lote (opcional)
- `location`: Ubicación física en tienda (opcional, ej: "Estante A3")
- `status`: Estado del registro
  - `active` - Producto activo en inventario
  - `expired` - Producto vencido
  - `removed` - Producto retirado/vendido

---

#### Tabla: `alerts`
Alertas de vencimiento generadas automáticamente
```sql
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES inventory(id),
  alert_type text NOT NULL CHECK (alert_type IN ('warning', 'urgent', 'expired')),
  days_until_expiration integer NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Tipos de alertas:**
- `warning`: 7 días antes (🟡 amarillo)
- `urgent`: 3 días antes (🟠 naranja)
- `expired`: Producto vencido (🔴 rojo)

---

#### Tabla: `whatsapp_contacts`
Contactos para alertas automáticas de WhatsApp
```sql
CREATE TABLE whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  phone_number text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Funcionalidad:**
- Almacena números de WhatsApp con formato internacional (+56 9 XXXX XXXX)
- Activa/desactiva contactos individualmente
- Envío automático de alertas a toda la lista
- Demo configurado para: +56 9 7452 3617

---

### 🔒 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas estrictas:

```sql
-- Usuarios solo ven/editan sus propios registros
CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Productos y categorías son de lectura pública
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Contactos WhatsApp privados por usuario
CREATE POLICY "Users can view own contacts"
  ON whatsapp_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

### 📋 Índices para Rendimiento

```sql
-- Productos
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);

-- Inventario
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_expiration ON inventory(expiration_date);
CREATE INDEX idx_inventory_status ON inventory(status);

-- Alertas
CREATE INDEX idx_alerts_inventory ON alerts(inventory_id);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- Contactos WhatsApp
CREATE INDEX idx_whatsapp_contacts_user ON whatsapp_contacts(user_id);
CREATE INDEX idx_whatsapp_contacts_active ON whatsapp_contacts(is_active);
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta Supabase (gratuita en supabase.com)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd vencepronto
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. **Aplicar migraciones a la base de datos**

En el SQL Editor de Supabase, ejecuta los archivos en este orden:

a) **Esquema principal:**
```bash
supabase/migrations/20250101000000_create_vencepronto_schema.sql
```

b) **Contactos WhatsApp:**
```bash
supabase/migrations/20250101000002_add_whatsapp_contacts.sql
```

c) **Productos adicionales (opcional):**
```bash
seed-products.sql
```

5. **Iniciar la aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🎯 Guía de Uso

### 1. Registro e Inicio de Sesión

1. Abre la aplicación
2. Crea una cuenta con email y contraseña
3. Inicia sesión

### 2. Escanear e Ingresar Producto

**Vista principal de la aplicación:**

1. **Click en "Escanear"** (botón azul-cyan)
2. **Ingresar código de barras:**
   - Opción 1: Escribir manualmente (ej: `7802320000013`)
   - Opción 2: Usar lector de códigos USB (recomendado para producción)
3. **Click "Validar"**
   - ✅ Si existe: Muestra tarjeta con información del producto
   - ❌ Si no existe: Muestra error "Producto no encontrado"
4. **Completar formulario:**
   - **Cantidad Recibida:** Número de unidades
   - **Fecha de Vencimiento:** Se sugiere automáticamente según vida útil del producto
5. **Click "Registrar Ingreso"**
6. ✅ Confirmación visual y producto agregado al inventario

**Ejemplo de flujo:**
```
Escanear → "7802800000010" → Validar →
Coca-Cola 500ml aparece →
Cantidad: 24 → Fecha: 2025-12-31 →
Registrar → ✅ Éxito
```

---

### 3. Gestionar Inventario

1. **Click en "Inventario"**
2. **Explorar productos:**
   - Todos los productos o filtrar por categoría
   - Usar barra de búsqueda
3. **Visualización por categoría:**
   - Cada producto muestra:
     - Nombre y marca
     - Cantidad en stock
     - Fecha de vencimiento
     - **Estado con código de color:**
       - 🟢 Verde: Más de 7 días
       - 🟡 Amarillo: 4-7 días
       - 🟠 Naranja: 1-3 días
       - 🔴 Rojo: VENCIDO
     - Ubicación (si se registró)

---

### 4. Configurar Alertas WhatsApp

**Configuración inicial:**

1. **Click en "Alertas"** (botón verde)
2. **Agregar contactos:**
   - Nombre: "Gerente Tienda"
   - Teléfono: "+56 9 1234 5678"
   - Click "Agregar Contacto"
3. **Repetir para cada contacto** que debe recibir alertas

**Enviar alertas:**

**Opción A - Demo (Prueba):**
1. Click "Enviar Alerta Demo (+56 9 7452 3617)"
2. Se abre WhatsApp con mensaje formateado
3. Mensaje incluye todos los productos que vencen en 3 días

**Opción B - A todos los contactos:**
1. Click "Enviar a Todos los Contactos"
2. Abre WhatsApp para cada contacto (uno por uno)
3. Mensaje personalizado con productos por vencer

**Ejemplo de mensaje automático:**
```
⚠️ ALERTA AUTOMÁTICA - VencePronto

Se detectaron 3 productos próximos a vencer:

*1. Coca-Cola 500ml*
   Marca: Coca-Cola
   Cantidad: 24 unidades
   Estado: 🟡 2 días
   Vence: 25/10/2025

*2. Red Bull Original*
   Marca: Red Bull
   Cantidad: 12 unidades
   Estado: 🟠 VENCE MAÑANA
   Vence: 24/10/2025

*3. Doritos Queso*
   Marca: PepsiCo
   Cantidad: 18 unidades
   Estado: 🟢 3 días
   Vence: 26/10/2025

---
_Alerta automática generada por VencePronto_
📱 Sistema de gestión de inventario inteligente
```

---

### 5. Ver Reportes

1. **Click en "Reportes"** (botón morado-rosa)
2. **Visualizar métricas:**
   - **Total Productos:** Suma de todos los productos activos
   - **Próximos a Vencer:** Productos que vencen en 7 días
   - **Vencidos:** Productos con fecha pasada

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra rápido
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones fluidas

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

### Libraries
- **Lucide React** - Iconos modernos
- **html5-qrcode** - Escaneo de códigos de barras

---

## 📱 Diseño Responsive

### Mobile (< 640px)
- Navegación con botones grandes táctiles
- Formularios optimizados para móvil
- Vista de una columna
- Tipografía escalada para legibilidad

### Tablet (640px - 1024px)
- Grid de 2 columnas
- Botones con íconos y texto
- Espaciado aumentado

### Desktop (> 1024px)
- Grid de hasta 4 columnas
- Hover effects elegantes
- Máximo 1400px de ancho centrado
- Todas las funciones visibles simultáneamente

---

## 🎨 Paleta de Colores

```css
/* Gradientes principales */
--primary-gradient: from-blue-600 to-cyan-500;
--success-gradient: from-green-500 to-emerald-600;
--warning-gradient: from-amber-500 to-orange-500;
--danger-gradient: from-red-500 to-pink-500;

/* Colores de fondo */
--bg-gradient: from-blue-50 via-white to-cyan-50;
--card-bg: white;
--border-color: #e0f2fe (blue-100);

/* Estados de productos */
--status-safe: #10b981 (green)
--status-warning: #f59e0b (yellow)
--status-urgent: #f97316 (orange)
--status-expired: #ef4444 (red)
```

---

## 🔐 Seguridad

### Autenticación
- Email/Password vía Supabase Auth
- Sessions manejadas con JWT
- Auto-refresh de tokens
- Logout seguro

### Autorización
- Row Level Security en todas las tablas
- Políticas restrictivas por defecto
- Usuarios aislados entre sí
- Validación en cliente y servidor

### Protección de Datos
- Sin acceso cross-user
- Sanitización de inputs
- Prepared statements (prevención SQL injection)
- HTTPS obligatorio en producción

---

## 📊 Queries SQL Útiles

### Productos próximos a vencer
```sql
SELECT
  p.name,
  p.brand,
  i.expiration_date,
  i.quantity,
  (i.expiration_date - CURRENT_DATE) as days_remaining
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.user_id = auth.uid()
  AND i.status = 'active'
  AND i.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
ORDER BY i.expiration_date;
```

### Estadísticas por categoría
```sql
SELECT
  c.name,
  c.color,
  COUNT(i.id) as total_items,
  SUM(i.quantity) as total_units
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN inventory i ON p.id = i.product_id
  AND i.user_id = auth.uid()
  AND i.status = 'active'
GROUP BY c.id
ORDER BY total_units DESC NULLS LAST;
```

### Buscar producto por código
```sql
SELECT p.*, c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.barcode = '7802320000013';
```

---

## 🐛 Solución de Problemas

### "Producto no encontrado"
**Causa:** El código de barras no existe en la tabla `products`
**Solución:**
```sql
-- Ejecutar seed-products.sql o agregar manualmente:
INSERT INTO products (category_id, name, brand, barcode, default_shelf_life_days)
VALUES (
  (SELECT id FROM categories WHERE name = 'Gaseosas'),
  'Coca-Cola 500ml',
  'Coca-Cola',
  '7802800000010',
  180
);
```

### Error de conexión Supabase
**Verificar:**
1. Variables `.env` correctas
2. URL y Key válidas
3. Migraciones aplicadas
4. Internet conectado

### WhatsApp no abre
**Causas comunes:**
- Formato de número incorrecto (usar +56 9 XXXX XXXX)
- WhatsApp no instalado
- Bloqueador de pop-ups activo

---

## 📝 Scripts NPM

```bash
# Desarrollo local
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Type checking
npm run typecheck
```

---

## 🚀 Deploy a Producción

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en dashboard
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Netlify

```bash
npm run build
# Subir carpeta dist/ en netlify.com
# Configurar env vars en settings
```

---

## 📄 Licencia

MIT License - Uso libre con atribución

---

## 👥 Contacto y Soporte

- 📧 Email: soporte@vencepronto.cl
- 📱 WhatsApp Demo: +56 9 7452 3617
- 🌐 Documentación completa en `/docs`

---

## 🎯 Roadmap Futuro

- [ ] Exportar reportes a Excel/PDF
- [ ] Gráficos avanzados con Chart.js
- [ ] Alertas por Email
- [ ] Escaneo con cámara web (no solo USB)
- [ ] Multi-tienda / Multi-usuario
- [ ] App móvil React Native
- [ ] Integración sistemas POS
- [ ] OCR para lectura de fechas de empaque

---

**💙 Desarrollado con pasión para optimizar la gestión de inventario retail en Chile**

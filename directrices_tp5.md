# TP5 — Directrices de Desarrollo
## App de Tienda Tech con React Native + Strapi (Headless CMS)

**Materia:** Arq. Programación Móvil — Licenciatura en Sistemas de Información — 2025

---

## 1. Resumen del Proyecto

Desarrollar una aplicación mobile de **e-commerce de tecnología** que consuma una API provista por **Strapi v4** (Headless CMS). La app se construye con **Expo + TypeScript** e incluye funcionalidades de catálogo, carrito, autenticación y favoritos. El backoffice se gestiona desde el panel de administración de Strapi.

---

## 2. Requisitos Previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Node.js | 18+ | Runtime obligatorio |
| Yarn o NPM | Última estable | Gestor de paquetes |
| Git | Última estable | Control de versiones |
| Expo CLI | Última estable | `npx expo` o instalación global |
| Strapi | v4.x | Headless CMS |
| Base de datos | SQLite (default) | Opcionalmente PostgreSQL con Docker |

---

## 3. Arquitectura General

```
┌─────────────────────┐         ┌─────────────────────────┐
│   App Mobile        │         │   Strapi v4 (Backend)   │
│   (Expo + TS)       │◄───────►│   REST / GraphQL API    │
│                     │  HTTP   │                         │
│  • Catálogo         │         │  • Content Types        │
│  • Carrito          │         │  • Roles & Permisos     │
│  • Auth             │         │  • Validaciones         │
│  • Favoritos        │         │  • Panel Admin          │
└─────────────────────┘         └────────────┬────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   SQLite /       │
                                    │   PostgreSQL     │
                                    └─────────────────┘
```

---

## 4. Modelo de Dominio

### 4.1 Entidades principales

Se requiere diseñar un **modelo de dominio simple** para e-commerce de tecnología con las siguientes entidades:

#### Producto (`Product`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Integer (auto) | Identificador único |
| `name` | String | Nombre del producto |
| `description` | Text | Descripción detallada |
| `price` | Decimal | Precio unitario |
| `discount` | Decimal / Null | Porcentaje de descuento (opcional) |
| `stock` | Integer | Cantidad disponible |
| `images` | Media (multiple) | Galería de imágenes |
| `specs` | JSON / Component | Especificaciones técnicas |
| `isActive` | Boolean | Soft delete (true = activo) |
| `category` | Relation → Category | Categoría asociada |
| `brand` | Relation → Brand | Marca asociada |

#### Categoría (`Category`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Integer (auto) | Identificador único |
| `name` | String | Nombre de la categoría |
| `slug` | String (unique) | URL amigable |
| `icon` | Media | Ícono representativo |

#### Marca (`Brand`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Integer (auto) | Identificador único |
| `name` | String | Nombre de la marca |
| `logo` | Media | Logotipo |

#### Orden (`Order`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Integer (auto) | Identificador único |
| `user` | Relation → User | Usuario que realizó la orden |
| `items` | Component (repeatable) | Productos con cantidad y precio |
| `total` | Decimal | Total calculado |
| `status` | Enum | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `createdAt` | DateTime | Fecha de creación |

#### Favorito (`Favorite`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Integer (auto) | Identificador único |
| `user` | Relation → User | Usuario |
| `product` | Relation → Product | Producto marcado como favorito |

### 4.2 Diagrama de relaciones

```
Category  1 ──── N  Product  N ──── 1  Brand
                       │
                       │ N
                       │
                  OrderItem (component)
                       │ N
                       │
                     Order  N ──── 1  User
                                    │
                                    │ 1
                                    │
                                 Favorite  N ──── 1  Product
```

---

## 5. Backend — Configuración de Strapi

### 5.1 Inicialización

```bash
npx create-strapi-app@latest tp5-backend --quickstart
# SQLite por defecto; para PostgreSQL usar --dbclient=postgres
```

### 5.2 Content Types a crear

1. **Product** — Collection Type
2. **Category** — Collection Type
3. **Brand** — Collection Type
4. **Order** — Collection Type
5. **Favorite** — Collection Type

### 5.3 Roles y Permisos

| Rol | Permisos |
|---|---|
| **Public** | `find` y `findOne` en Product, Category, Brand (solo lectura) |
| **Authenticated** | Todo lo de Public + CRUD en Order, Favorite. Crear órdenes propias. |
| **Admin** | Acceso total desde el panel de Strapi |

### 5.4 Endpoints API requeridos

#### REST (base: `/api`)

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| GET | `/products` | Listar productos con filtros, orden y paginación | No |
| GET | `/products/:id` | Detalle de producto con imágenes, specs, precio | No |
| GET | `/categories` | Listar categorías | No |
| GET | `/brands` | Listar marcas | No |
| POST | `/auth/local/register` | Registro de usuario | No |
| POST | `/auth/local` | Login (email/contraseña) | No |
| GET | `/favorites` | Listar favoritos del usuario | Sí (JWT) |
| POST | `/favorites` | Agregar favorito | Sí (JWT) |
| DELETE | `/favorites/:id` | Eliminar favorito | Sí (JWT) |
| POST | `/orders` | Crear orden (checkout) | Sí (JWT) |
| GET | `/orders` | Historial de órdenes del usuario | Sí (JWT) |

#### Parámetros de consulta (filtros y paginación)

```
GET /api/products?filters[category][slug][$eq]=notebooks
                 &filters[brand][name][$eq]=Apple
                 &filters[price][$lte]=500000
                 &sort=price:asc
                 &pagination[page]=1
                 &pagination[pageSize]=10
                 &populate=images,category,brand
```

### 5.5 Validaciones del lado del servidor

- `price` > 0
- `stock` >= 0
- `name` obligatorio y no vacío
- `discount` entre 0 y 100 (si aplica)
- Al crear una orden, verificar que hay stock suficiente y decrementar automáticamente

---

## 6. Frontend — App Mobile (Expo + TypeScript)

### 6.1 Inicialización

```bash
npx create-expo-app@latest tp5-app --template blank-typescript
cd tp5-app
```

### 6.2 Estructura de carpetas sugerida

```
tp5-app/
├── app/                      # Rutas (Expo Router) o screens
│   ├── (tabs)/               # Navegación por tabs
│   │   ├── index.tsx         # Home / Catálogo
│   │   ├── categories.tsx    # Categorías
│   │   ├── cart.tsx          # Carrito
│   │   ├── favorites.tsx     # Favoritos
│   │   └── profile.tsx       # Perfil / Login
│   ├── product/[id].tsx      # Detalle de producto
│   ├── login.tsx             # Pantalla de login
│   └── register.tsx          # Pantalla de registro
├── components/               # Componentes reutilizables
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   ├── CategoryChip.tsx
│   ├── SearchBar.tsx
│   └── ...
├── services/                 # Capa de comunicación con API
│   ├── api.ts                # Configuración base (axios/fetch)
│   ├── productService.ts
│   ├── authService.ts
│   ├── orderService.ts
│   └── favoriteService.ts
├── context/                  # Context API / Estado global
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── FavoritesContext.tsx
├── hooks/                    # Custom hooks
│   ├── useProducts.ts
│   ├── useAuth.ts
│   └── useCart.ts
├── types/                    # Tipos TypeScript
│   ├── product.ts
│   ├── order.ts
│   └── user.ts
├── utils/                    # Utilidades
│   ├── formatPrice.ts
│   └── calculateDiscount.ts
└── constants/                # Constantes
    ├── colors.ts
    └── config.ts             # API_URL, etc.
```

### 6.3 Librerías recomendadas

| Librería | Propósito |
|---|---|
| `expo-router` | Navegación basada en archivos |
| `@react-navigation/bottom-tabs` | Barra de tabs inferior |
| `axios` | Cliente HTTP |
| `@react-native-async-storage/async-storage` | Persistencia local (token JWT, carrito) |
| `expo-image` | Carga optimizada de imágenes |
| `expo-secure-store` | Almacenamiento seguro del token |
| `react-hook-form` + `zod` | Validación de formularios |

---

## 7. Alcance Funcional (MVP)

### 7.1 Pantallas y funcionalidades

#### 🏠 Home / Catálogo
- [ ] Listado de productos con imagen, nombre, precio y descuento
- [ ] Filtros por categoría y marca
- [ ] Ordenamiento (precio ascendente/descendente, nombre, más recientes)
- [ ] Paginación (infinite scroll o botón "cargar más")
- [ ] Barra de búsqueda

#### 📦 Detalle de Producto
- [ ] Galería de imágenes (swipeable)
- [ ] Nombre, descripción, especificaciones técnicas
- [ ] Precio original y precio con descuento
- [ ] Indicador de stock disponible
- [ ] Botón "Agregar al carrito"
- [ ] Botón "Agregar a favoritos" (♥)

#### 🛒 Carrito
- [ ] Lista de productos agregados
- [ ] Controles para modificar cantidad (+/-)
- [ ] Eliminar producto del carrito
- [ ] Subtotal por producto y total general
- [ ] Botón "Checkout" → crea orden simulada

#### ❤️ Favoritos
- [ ] Lista de productos marcados como favoritos
- [ ] Opción para eliminar de favoritos
- [ ] Navegación al detalle del producto

#### 🔐 Autenticación
- [ ] Pantalla de Login (email + contraseña)
- [ ] Pantalla de Registro
- [ ] Persistencia de sesión (JWT en SecureStore)
- [ ] Protección de rutas (carrito/favoritos/checkout requieren auth)

#### 👤 Perfil
- [ ] Datos del usuario logueado
- [ ] Historial de órdenes
- [ ] Botón de cerrar sesión

---

## 8. Reglas de Negocio

### 8.1 Stock
- No permitir agregar al carrito un producto sin stock
- Al confirmar una orden, **decrementar el stock** de cada producto
- Mostrar etiqueta "Sin stock" cuando `stock === 0`

### 8.2 Descuentos
- Si un producto tiene `discount`, mostrar precio original tachado y precio final
- Precio final = `price * (1 - discount / 100)`

### 8.3 Soft Delete
- Los productos eliminados no se borran de la base de datos
- Se marca `isActive = false`
- La API solo retorna productos donde `isActive === true`
- Filtrar en Strapi con: `filters[isActive][$eq]=true`

### 8.4 Órdenes
- Solo usuarios autenticados pueden crear órdenes
- Una orden guarda snapshot de los productos (nombre, precio al momento de compra, cantidad)
- Estados posibles: `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`

---

## 9. Gestión de Estado

### 9.1 Carrito (CartContext)

```typescript
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
```

- Persistir carrito en `AsyncStorage` para mantenerlo entre sesiones
- Validar stock antes de agregar o incrementar cantidad

### 9.2 Autenticación (AuthContext)

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

- Guardar JWT en `expo-secure-store`
- Incluir token en header `Authorization: Bearer <token>` en cada request autenticado

---

## 10. Backoffice (Strapi Admin Panel)

Desde el panel de administración de Strapi (`http://localhost:1337/admin`):

- [ ] Crear, editar y eliminar (soft delete) **productos**
- [ ] Gestionar **categorías** y **marcas**
- [ ] Administrar **stock** de productos
- [ ] Visualizar y cambiar estado de **órdenes**
- [ ] Gestionar **usuarios** y sus roles

---

## 11. Plan de Desarrollo (Fases sugeridas)

### Fase 1 — Backend con Strapi
1. Instalar y configurar Strapi v4
2. Crear los Content Types (Product, Category, Brand, Order, Favorite)
3. Configurar relaciones entre entidades
4. Configurar roles y permisos (Public / Authenticated)
5. Cargar datos de prueba (seed)
6. Verificar endpoints con Postman o Insomnia

### Fase 2 — Estructura del Frontend
1. Crear proyecto Expo con TypeScript
2. Configurar navegación (tabs + stack)
3. Configurar servicio API (axios + interceptors para JWT)
4. Crear tipos TypeScript para las entidades
5. Implementar contextos (Auth, Cart, Favorites)

### Fase 3 — Pantallas principales
1. Home con listado de productos y búsqueda
2. Filtros por categoría y marca
3. Paginación
4. Detalle de producto
5. Pantalla de categorías

### Fase 4 — Autenticación y features de usuario
1. Login y Registro
2. Persistencia de sesión
3. Favoritos (agregar/eliminar/listar)
4. Protección de rutas

### Fase 5 — Carrito y Checkout
1. Agregar/quitar productos del carrito
2. Actualizar cantidades
3. Cálculo de totales con descuentos
4. Checkout simulado (crear orden)
5. Historial de órdenes

### Fase 6 — Pulido y reglas de negocio
1. Validación de stock
2. Soft delete
3. Manejo de errores y estados de carga
4. UX/UI refinado
5. Testing

---

## 12. Criterios de calidad

- ✅ **TypeScript** estricto en todo el proyecto
- ✅ **Código limpio** y bien organizado en capas (services, context, components)
- ✅ **Manejo de errores** con feedback visual al usuario (toasts, alerts)
- ✅ **Estados de carga** (skeletons o spinners) en cada pantalla
- ✅ **Responsividad** en diferentes tamaños de pantalla
- ✅ **Separación de responsabilidades** (no lógica de negocio en componentes UI)
- ✅ **Persistencia** del carrito y sesión entre reinicios de la app

---

## 13. Entregables

1. **Código fuente** del backend (Strapi) y frontend (Expo) en repositorio Git
2. **README.md** con instrucciones de instalación y ejecución
3. **Datos de prueba** precargados o script de seed
4. **Documentación** de la API (endpoints, parámetros, respuestas)
5. **Demostración funcional** de la app corriendo contra el backend

---

> **Nota:** Este documento fue generado a partir del análisis del enunciado del TP5 de la materia Arq. Programación Móvil 2025. Las decisiones de diseño y arquitectura detalladas aquí son sugerencias basadas en las mejores prácticas para el stack indicado (React Native + Expo + TypeScript + Strapi v4).

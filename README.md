# TP5 — E-commerce tecnológico

Proyecto académico de e-commerce tecnológico compuesto por:

- **Backend:** Strapi v4, SQLite, Users & Permissions y API REST.
- **Frontend:** Expo SDK 54, React Native, Expo Router y TypeScript estricto.

La aplicación permite navegar un catálogo, filtrar productos, autenticarse,
guardar favoritos, gestionar carrito, crear órdenes simuladas y consultar el
historial de compras.

## Estado del proyecto

Las fases principales del trabajo están implementadas:

| Fase | Estado | Alcance |
|---|---:|---|
| Fase 1 | ✅ | Backend Strapi, content types, relaciones, permisos y seed |
| Fase 2 | ✅ | Frontend Expo, navegación, servicios, tipos y contextos |
| Fase 3 | ✅ | Catálogo, búsqueda, filtros, paginación, categorías y detalle |
| Fase 4 | ✅ | Login, registro, sesión persistida, favoritos y rutas protegidas |
| Fase 5 | ✅ | Carrito, cantidades, descuentos, checkout e historial de órdenes |
| Fase 6 | ✅ | Soft delete, validaciones, estados de carga/error y UI monocromática |

## Requisitos

- Node.js 20 LTS recomendado.
- npm 8 o superior.
- Expo Go, emulador Android/iOS o navegador web para probar el frontend.

> Strapi v4 no soporta Node 22 para este proyecto. Usar Node 20.

## Puesta en marcha

Instalar dependencias del backend:

```bash
cd backend
npm install
```

Crear el archivo de entorno del backend desde el ejemplo, si todavía no existe:

```bash
cp .env.example .env
```

Iniciar Strapi:

```bash
npm run develop
```

En el primer inicio:

1. Abrir `http://localhost:1337/admin`.
2. Crear el usuario administrador.
3. El bootstrap configura permisos básicos de `Public` y `Authenticated`.
4. El seed carga categorías, marcas y productos si la base está vacía.

La API queda disponible en:

```text
http://localhost:1337/api
```

Instalar dependencias del frontend:

```bash
cd ../frontend
npm install
```

Crear el archivo de entorno del frontend:

```bash
cp .env.example .env
```

Configurar `EXPO_PUBLIC_API_URL` según el entorno:

| Entorno | URL sugerida |
|---|---|
| Web o iOS Simulator | `http://localhost:1337/api` |
| Emulador Android | `http://10.0.2.2:1337/api` |
| Teléfono físico | `http://IP_LOCAL_DE_TU_PC:1337/api` |

Iniciar Expo:

```bash
npm start
```

Desde Expo:

- `a`: abrir Android.
- `i`: abrir iOS Simulator en macOS.
- `w`: abrir web.
- QR: abrir desde Expo Go en un teléfono físico.

## Funcionalidades

### Catálogo

- Listado de productos activos.
- Búsqueda por nombre.
- Filtros por categoría y marca.
- Orden por recientes, precio ascendente, precio descendente y nombre.
- Paginación.
- Pantalla de categorías.
- Detalle con galería, precio, descuento, stock y especificaciones.

### Autenticación

- Registro con usuario, email y contraseña.
- Login contra Strapi Users & Permissions.
- Persistencia de JWT con SecureStore.
- Restauración automática de sesión.
- Logout desde Perfil.

### Favoritos

- Agregar/quitar favoritos desde el detalle del producto.
- Listado de favoritos por usuario.
- Protección de rutas: requiere sesión autenticada.
- El backend evita duplicados y limita cada usuario a sus propios favoritos.

### Carrito y checkout

- Agregar productos al carrito desde el detalle.
- Persistencia local con AsyncStorage.
- Actualizar cantidades.
- Quitar productos.
- Validación contra stock local.
- Subtotal, descuentos y total.
- Checkout simulado con creación de orden en Strapi.
- El backend recalcula precios, aplica descuentos, descuenta stock y guarda un
  snapshot de los items.
- Historial de órdenes por usuario autenticado.

### Reglas de negocio

- Productos con `isActive = false` no aparecen en el catálogo.
- `DELETE /products/:id` implementa soft delete marcando `isActive = false`.
- Las órdenes no aceptan totales enviados por el cliente.
- El stock se valida en backend durante la creación de órdenes.
- Favoritos y órdenes pertenecen al usuario autenticado.

### Estilo visual

- UI mobile con estética monocromática.
- Paleta basada en blanco, negro y escalas de gris.
- Estados de carga, vacío, error y éxito en las pantallas principales.

## Backend

Content types principales:

- `Product`
- `Category`
- `Brand`
- `Favorite`
- `Order`

Componente:

- `order.item`

Endpoints principales:

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/products` | Público | Lista productos activos |
| `GET` | `/products/:id` | Público | Detalle de producto activo |
| `GET` | `/categories` | Público | Lista categorías |
| `GET` | `/brands` | Público | Lista marcas |
| `POST` | `/auth/local/register` | Público | Registro |
| `POST` | `/auth/local` | Público | Login |
| `GET` | `/favorites` | Auth | Favoritos del usuario |
| `POST` | `/favorites` | Auth | Agrega favorito |
| `DELETE` | `/favorites/:id` | Auth | Elimina favorito propio |
| `GET` | `/orders` | Auth | Historial del usuario |
| `POST` | `/orders` | Auth | Crea orden y descuenta stock |

Más detalle en [`backend/API.md`](backend/API.md) y pruebas en
[`backend/GUIA_POSTMAN.md`](backend/GUIA_POSTMAN.md).

## Imágenes de productos

Para este proyecto se recomienda usar la **Media Library de Strapi**:

1. Subir imágenes desde `http://localhost:1337/admin`.
2. Asociarlas al campo `images` de cada producto.
3. Strapi guarda los archivos localmente en `backend/public/uploads/`.
4. El frontend las consume mediante `populate=images,category,brand`.

También existen campos de media para iconos de categorías y logos de marcas.

## Frontend

Rutas principales:

```text
frontend/app/
├── (tabs)/
│   ├── index.tsx          # Catálogo
│   ├── categories.tsx     # Categorías
│   ├── cart.tsx           # Carrito y checkout
│   ├── favorites.tsx      # Favoritos
│   └── profile.tsx        # Perfil
├── product/[id].tsx       # Detalle de producto
├── login.tsx              # Login
├── register.tsx           # Registro
└── orders.tsx             # Historial de órdenes
```

Capas del frontend:

- `components/`: componentes reutilizables.
- `constants/`: configuración y paleta.
- `context/`: Auth, Cart y Favorites.
- `hooks/`: acceso a contextos y productos.
- `services/`: cliente API y servicios tipados.
- `storage/`: persistencia local.
- `types/`: modelos de dominio y respuestas Strapi.
- `utils/`: formato de precios y descuentos.

## Variables importantes

Backend:

- `HOST=0.0.0.0`
- `PORT=1337`
- `DATABASE_FILENAME=.tmp/data.db`
- `SEED_DATABASE=true`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`

Frontend:

- `EXPO_PUBLIC_API_URL=http://localhost:1337/api`

Los secretos del backend deben reemplazarse antes de cualquier despliegue real.

## Validaciones

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npx expo-doctor
```

Backend:

```bash
cd backend
npm run build
```

Chequeo sintáctico puntual:

```bash
node --check src/api/product/controllers/product.js
```

## Estructura general

```text
.
├── backend/
│   ├── config/
│   ├── src/
│   │   ├── api/
│   │   │   ├── brand/
│   │   │   ├── category/
│   │   │   ├── favorite/
│   │   │   ├── order/
│   │   │   └── product/
│   │   ├── components/order/
│   │   └── index.js
│   ├── API.md
│   └── GUIA_POSTMAN.md
├── frontend/
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── storage/
│   ├── types/
│   └── utils/
├── directrices_tp5.md
└── README.md
```

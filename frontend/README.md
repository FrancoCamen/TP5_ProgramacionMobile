# TP5 — Frontend Expo

Base de la aplicación mobile del e-commerce tecnológico, creada con Expo SDK
54, React Native, TypeScript estricto y Expo Router.

## Requisitos

- Node.js 20 LTS recomendado
- Backend Strapi ejecutándose
- Expo Go en un teléfono o un emulador Android/iOS

## Configuración de la API

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Configurar `EXPO_PUBLIC_API_URL` según el dispositivo:

| Entorno | URL |
|---|---|
| Web o iOS Simulator | `http://localhost:1337/api` |
| Emulador Android | `http://10.0.2.2:1337/api` |
| Teléfono físico | `http://IP_LOCAL_DE_TU_PC:1337/api` |

En un teléfono físico, la computadora y el teléfono deben estar en la misma
red Wi-Fi. El backend debe escuchar en `0.0.0.0`.

## Ejecución

Primero iniciar Strapi desde otra terminal:

```bash
cd ../backend
nvm use 20
npm run develop
```

Después iniciar Expo:

```bash
cd ../frontend
nvm use 20
npm install
npm start
```

Desde la terminal de Expo:

- `a`: abrir Android.
- `i`: abrir iOS Simulator en macOS.
- `w`: abrir la versión web.
- Escanear el QR con Expo Go para usar un teléfono físico.

## Estructura

```text
frontend/
├── app/                 # Rutas de Expo Router
│   ├── (tabs)/          # Catálogo, categorías, carrito, favoritos y perfil
│   ├── product/[id].tsx
│   ├── login.tsx
│   └── register.tsx
├── components/          # UI reutilizable
├── constants/           # Colores y configuración
├── context/             # Auth, Cart y Favorites
├── hooks/               # Acceso a contextos y productos
├── services/            # Axios y servicios de Strapi
├── storage/             # SecureStore y AsyncStorage
├── types/               # Tipos del dominio y respuestas Strapi
└── utils/               # Precio y descuentos
```

## Arquitectura implementada

- Navegación con tabs y stack mediante Expo Router.
- Cliente Axios con base URL configurable.
- Interceptor que agrega `Authorization: Bearer <jwt>`.
- JWT persistido con SecureStore en Android/iOS.
- Carrito persistido con AsyncStorage y validación de stock.
- Contextos globales de autenticación, carrito y favoritos.
- Servicios tipados para productos, autenticación, favoritos y órdenes.
- Rutas base preparadas para las pantallas de las fases siguientes.

## Validaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

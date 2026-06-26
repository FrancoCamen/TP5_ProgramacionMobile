# TP5 — E-commerce tecnológico

Proyecto compuesto por un backend Strapi v4 y una aplicación mobile Expo con
TypeScript.

## Requisitos

- Node.js 20 LTS (Strapi v4 no soporta Node 22)
- npm 8 o superior

## Puesta en marcha

```bash
cd backend
cp .env.example .env
npm install
npm run develop
```

En el primer inicio:

1. Abrir `http://localhost:1337/admin` y crear el usuario administrador.
2. El seed crea categorías, marcas y cuatro productos automáticamente.
3. Los permisos Public y Authenticated requeridos quedan configurados en el
   arranque.

La API queda disponible en `http://localhost:1337/api`. Consultar
[`backend/API.md`](backend/API.md) para ver endpoints y ejemplos.
Para realizar una prueba completa con Postman, consultar
[`backend/GUIA_POSTMAN.md`](backend/GUIA_POSTMAN.md).

## Frontend

La estructura de la Fase 2 está en [`frontend/`](frontend/). Incluye Expo
Router, servicios Axios, tipos y contextos globales. Las instrucciones de
configuración y ejecución están en
[`frontend/README.md`](frontend/README.md).

## Variables importantes

- `SEED_DATABASE=true`: carga el catálogo inicial si no existen productos.
- `DATABASE_FILENAME=.tmp/data.db`: ubicación de SQLite relativa a `backend/`.
- Los secretos de `.env.example` deben reemplazarse antes de desplegar.

## Estructura

```text
backend/
├── config/
├── src/
│   ├── api/
│   │   ├── brand/
│   │   ├── category/
│   │   ├── favorite/
│   │   ├── order/
│   │   └── product/
│   ├── components/order/
│   └── index.js
└── API.md
frontend/
├── app/
├── context/
├── services/
├── storage/
└── types/
```

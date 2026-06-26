# API del backend TP5

Base local: `http://localhost:1337/api`

## Catálogo público

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products` | Productos activos; admite filtros, orden y paginación de Strapi |
| GET | `/products/:id` | Detalle de un producto activo |
| GET | `/categories` | Categorías |
| GET | `/brands` | Marcas |

Ejemplo:

```text
GET /api/products?filters[category][slug][$eq]=notebooks&sort=price:asc&pagination[page]=1&pagination[pageSize]=10&populate=images,category,brand
```

## Autenticación

| Método | Ruta |
|---|---|
| POST | `/auth/local/register` |
| POST | `/auth/local` |

Las rutas privadas requieren `Authorization: Bearer <jwt>`.

## Favoritos

| Método | Ruta | Body |
|---|---|---|
| GET | `/favorites` | — |
| POST | `/favorites` | `{ "data": { "product": 1 } }` |
| DELETE | `/favorites/:id` | — |

Cada usuario solo puede listar y eliminar sus propios favoritos.

## Órdenes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/orders` | Historial del usuario autenticado |
| POST | `/orders` | Crea una orden y descuenta stock |

Body de ejemplo:

```json
{
  "data": {
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 4, "quantity": 1 }
    ]
  }
}
```

El servidor obtiene nombres y precios desde la base de datos, aplica descuentos,
calcula el total y guarda el snapshot. No acepta totales enviados por el cliente.

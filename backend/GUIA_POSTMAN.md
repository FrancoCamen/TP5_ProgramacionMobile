# Guía para probar el backend Strapi con Postman

Esta guía permite comprobar el catálogo público, autenticación, favoritos,
órdenes, permisos y reglas de stock del backend del TP5.

## 1. Iniciar el backend

Desde una terminal:

```bash
cd backend
nvm use 20
npm install
npm run develop
```

El servidor debe quedar disponible en:

- Panel administrativo: `http://localhost:1337/admin`
- API REST: `http://localhost:1337/api`

Antes de continuar, abrir el panel administrativo y crear el primer
administrador si Strapi lo solicita.

## 2. Crear el entorno de Postman

En Postman:

1. Ir a **Environments**.
2. Crear un entorno llamado `TP5 Strapi Local`.
3. Agregar las siguientes variables:

| Variable | Valor inicial |
|---|---|
| `baseUrl` | `http://localhost:1337/api` |
| `jwt` | Dejar vacío |
| `productId` | `1` |
| `favoriteId` | Dejar vacío |
| `orderId` | Dejar vacío |

4. Guardar el entorno.
5. Seleccionarlo en el selector de entornos de Postman.

Todas las solicitudes de esta guía utilizan `{{baseUrl}}`.

## 3. Crear una colección

Crear una colección llamada `TP5 - Backend Strapi` y agregar estas carpetas:

```text
TP5 - Backend Strapi
├── 01 - Catálogo
├── 02 - Autenticación
├── 03 - Favoritos
├── 04 - Órdenes
└── 05 - Casos de error
```

## 4. Probar el catálogo público

Estas solicitudes no requieren autenticación.

### 4.1 Listar productos

```http
GET {{baseUrl}}/products
```

Resultado esperado:

- Estado `200 OK`.
- La propiedad `data` contiene los productos activos.
- La respuesta incluye `meta.pagination`.

En la pestaña **Scripts > Post-response**, se puede agregar:

```javascript
pm.test("Responde 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Devuelve una lista de productos", () => {
  const response = pm.response.json();
  pm.expect(response.data).to.be.an("array");
  pm.expect(response.data.length).to.be.above(0);
});

pm.test("Incluye paginación", () => {
  const response = pm.response.json();
  pm.expect(response.meta.pagination).to.exist;
});
```

### 4.2 Listar productos con relaciones

```http
GET {{baseUrl}}/products?populate=images,category,brand
```

Comprobar que cada producto pueda incluir su categoría, marca e imágenes.

### 4.3 Obtener un producto

```http
GET {{baseUrl}}/products/{{productId}}?populate=images,category,brand
```

Resultado esperado:

- Estado `200 OK`.
- El ID coincide con `{{productId}}`.
- Incluye nombre, descripción, precio, descuento, stock y especificaciones.

Script opcional:

```javascript
pm.test("Devuelve el producto solicitado", () => {
  const response = pm.response.json();
  pm.expect(response.data.id).to.eql(
    Number(pm.environment.get("productId"))
  );
});
```

### 4.4 Listar categorías

```http
GET {{baseUrl}}/categories
```

Resultado esperado: `200 OK` y una lista que incluya categorías como
`Notebooks`, `Smartphones` y `Accesorios`.

### 4.5 Listar marcas

```http
GET {{baseUrl}}/brands
```

Resultado esperado: `200 OK` y marcas como Apple, Lenovo, Samsung y Logitech.

## 5. Probar filtros, ordenamiento y paginación

Los parámetros también pueden cargarse individualmente desde la pestaña
**Params** de Postman.

### Filtrar por categoría

```http
GET {{baseUrl}}/products?filters[category][slug][$eq]=notebooks
```

Todos los productos devueltos deben pertenecer a la categoría `notebooks`.

### Filtrar por marca

```http
GET {{baseUrl}}/products?filters[brand][name][$eq]=Apple
```

### Filtrar por precio máximo

```http
GET {{baseUrl}}/products?filters[price][$lte]=1200000
```

### Ordenar por precio

```http
GET {{baseUrl}}/products?sort=price:asc
```

Cambiar `asc` por `desc` para probar el orden inverso.

### Paginar

```http
GET {{baseUrl}}/products?pagination[page]=1&pagination[pageSize]=2
```

Comprobar:

- `data` contiene como máximo dos productos.
- `meta.pagination.page` vale `1`.
- `meta.pagination.pageSize` vale `2`.

## 6. Registrar un usuario

Crear una solicitud:

```http
POST {{baseUrl}}/auth/local/register
```

En **Body > raw > JSON**:

```json
{
  "username": "usuario-postman",
  "email": "usuario-postman@example.com",
  "password": "Prueba1234!"
}
```

Cada email solo puede registrarse una vez. Si ya existe, cambiar el username y
el email.

Resultado esperado:

- Estado `200 OK`.
- La respuesta contiene `jwt`.
- La respuesta contiene los datos del usuario.

Para guardar automáticamente el token, agregar en **Scripts > Post-response**:

```javascript
pm.test("Registro exitoso", () => {
  pm.response.to.have.status(200);
});

const response = pm.response.json();

if (response.jwt) {
  pm.environment.set("jwt", response.jwt);
}
```

## 7. Iniciar sesión

```http
POST {{baseUrl}}/auth/local
```

Body:

```json
{
  "identifier": "usuario-postman@example.com",
  "password": "Prueba1234!"
}
```

Agregar el mismo script para guardar el JWT:

```javascript
pm.test("Login exitoso", () => {
  pm.response.to.have.status(200);
});

const response = pm.response.json();

if (response.jwt) {
  pm.environment.set("jwt", response.jwt);
}
```

Después de ejecutar la solicitud, comprobar que la variable `jwt` tenga valor.

## 8. Configurar autenticación en solicitudes privadas

Para las carpetas `03 - Favoritos` y `04 - Órdenes`:

1. Abrir la pestaña **Authorization**.
2. Seleccionar `Bearer Token`.
3. Escribir:

```text
{{jwt}}
```

Las solicitudes de esas carpetas heredarán el JWT.

## 9. Probar favoritos

### 9.1 Agregar un favorito

```http
POST {{baseUrl}}/favorites
```

Body:

```json
{
  "data": {
    "product": 1
  }
}
```

Resultado esperado: `200 OK`.

Guardar el ID del favorito:

```javascript
pm.test("Favorito creado", () => {
  pm.response.to.have.status(200);
});

const response = pm.response.json();

if (response.data?.id) {
  pm.environment.set("favoriteId", response.data.id);
}
```

El `favoriteId` no es el ID del producto: es el ID del registro Favorite.

### 9.2 Listar favoritos

```http
GET {{baseUrl}}/favorites
```

Resultado esperado:

- Estado `200 OK`.
- Solo aparecen los favoritos del usuario autenticado.
- Cada favorito incluye su producto relacionado.

### 9.3 Evitar favoritos duplicados

Ejecutar nuevamente la solicitud para agregar el mismo producto.

Resultado esperado:

- Estado `409 Conflict`.
- Mensaje: `El producto ya está en favoritos`.

### 9.4 Eliminar un favorito

```http
DELETE {{baseUrl}}/favorites/{{favoriteId}}
```

Resultado esperado: `200 OK`.

Ejecutar nuevamente `GET /favorites` y comprobar que ya no aparezca.

## 10. Probar órdenes y checkout

### 10.1 Consultar el stock antes de comprar

```http
GET {{baseUrl}}/products/4
```

Anotar el valor de `data.attributes.stock`.

También puede guardarse automáticamente:

```javascript
const response = pm.response.json();

if (response.data?.attributes?.stock !== undefined) {
  pm.environment.set("stockBefore", response.data.attributes.stock);
}
```

### 10.2 Crear una orden

```http
POST {{baseUrl}}/orders
```

Body:

```json
{
  "data": {
    "items": [
      {
        "productId": 4,
        "quantity": 2
      }
    ]
  }
}
```

Resultado esperado:

- Estado `200 OK`.
- Estado de la orden: `pending`.
- El servidor calcula el total.
- Los items contienen el snapshot del nombre, precio, cantidad y subtotal.
- El servidor ignora precios o totales enviados por el cliente.

Guardar el ID:

```javascript
pm.test("Orden creada", () => {
  pm.response.to.have.status(200);
});

const response = pm.response.json();

if (response.data?.id) {
  pm.environment.set("orderId", response.data.id);
}

pm.test("La orden queda pendiente", () => {
  pm.expect(response.data.attributes.status).to.eql("pending");
});
```

### 10.3 Confirmar el descuento de stock

Volver a ejecutar:

```http
GET {{baseUrl}}/products/4
```

Si antes había 25 unidades y se compraron 2, ahora debe haber 23.

Script opcional:

```javascript
const response = pm.response.json();
const stockBefore = Number(pm.environment.get("stockBefore"));
const stockAfter = response.data.attributes.stock;

pm.test("El stock disminuyó en dos unidades", () => {
  pm.expect(stockAfter).to.eql(stockBefore - 2);
});
```

### 10.4 Consultar el historial

```http
GET {{baseUrl}}/orders
```

Resultado esperado:

- Estado `200 OK`.
- Aparece la orden creada.
- Solo se muestran órdenes del usuario autenticado.
- Los resultados están ordenados desde el más reciente.

## 11. Probar casos de error

### Ruta privada sin JWT

Quitar temporalmente la autorización y ejecutar:

```http
GET {{baseUrl}}/orders
```

Resultado esperado: `403 Forbidden`.

### Login incorrecto

```http
POST {{baseUrl}}/auth/local
```

```json
{
  "identifier": "usuario-postman@example.com",
  "password": "incorrecta"
}
```

Resultado esperado: `400 Bad Request`.

### Producto inexistente

```http
GET {{baseUrl}}/products/999999
```

Resultado esperado: `404 Not Found`.

### Orden sin items

```http
POST {{baseUrl}}/orders
```

```json
{
  "data": {
    "items": []
  }
}
```

Resultado esperado: `400 Bad Request`.

### Cantidad inválida

```http
POST {{baseUrl}}/orders
```

```json
{
  "data": {
    "items": [
      {
        "productId": 1,
        "quantity": 0
      }
    ]
  }
}
```

Resultado esperado: `400 Bad Request`.

### Stock insuficiente

```http
POST {{baseUrl}}/orders
```

```json
{
  "data": {
    "items": [
      {
        "productId": 1,
        "quantity": 9999
      }
    ]
  }
}
```

Resultado esperado:

- Estado `400 Bad Request`.
- Mensaje de stock insuficiente.
- No se crea ninguna orden.
- El stock del producto no cambia.

## 12. Probar validaciones desde el panel de Strapi

Desde `http://localhost:1337/admin`, intentar crear o editar productos con:

- Nombre vacío.
- Precio igual a cero o negativo.
- Stock negativo.
- Descuento menor que 0.
- Descuento mayor que 100.

Strapi debe rechazar esos valores.

Para comprobar el soft delete:

1. Editar un producto.
2. Cambiar `isActive` a `false`.
3. Guardar.
4. Ejecutar `GET {{baseUrl}}/products`.
5. Confirmar que el producto inactivo no aparece.

Volver a dejarlo activo si se necesita para otras pruebas.

## 13. Orden recomendado para ejecutar la colección

1. Listar productos.
2. Probar filtros y paginación.
3. Registrar usuario o iniciar sesión.
4. Guardar el JWT.
5. Agregar y listar favoritos.
6. Consultar el stock inicial.
7. Crear una orden.
8. Confirmar el nuevo stock.
9. Consultar el historial.
10. Ejecutar los casos de error.
11. Probar validaciones y soft delete desde el panel.

Si todas estas comprobaciones pasan, las funcionalidades previstas para la
Fase 1 del backend están operativas.

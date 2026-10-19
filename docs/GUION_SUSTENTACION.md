# Guion de sustentación (mínimo 10 minutos)

Antes de empezar: `npm run reset-db`, `npm start` (en PowerShell: `npm.cmd …`, o Ejecutar y depurar en VS Code), abrir `http://localhost:3000`, abrir F12 → Red, tener el editor con el proyecto y el repositorio en el navegador. Verificar que `git log -1` coincide con el commit entregado.

## 1. Problema y OOHDM (2 min) — `docs/OOHDM.md`

- Tienda de papelería: consultar productos, armar carrito, registrar pedido simulado (sin cobro).
- **Conceptual:** Producto, Pedido, DetallePedido. Pedido 1 — 1..* DetallePedido (composición); Producto 1 — 0..* DetallePedido. El comprador va dentro del pedido porque no hay cuentas. `precio_unitario` conserva el precio de la compra.
- **Navegacional:** tres nodos + confirmación; menú como índice. Del catálogo al carrito solo viajan `producto_id` y `cantidad` en localStorage; los precios se vuelven a consultar; la confirmación muestra lo que devuelve el servidor.
- **Interfaz abstracta:** mostrar los bocetos y señalar botones y respuesta esperada.

## 2. Demostración (4 min)

1. Catálogo: en Red, `GET /api/productos` → 200 JSON.
2. Agregar 2 cuadernos y 1 bolígrafo; en el carrito cambiar una cantidad y retirar un producto.
3. Intentar registrar sin nombre → mensaje de error.
4. Registrar pedido válido → en Red, `POST /api/pedidos` → 201; confirmación con id y total 26.500; contador del carrito en 0.
5. **Rechazo desde la API** (en la consola del navegador):
   ```js
   await (await fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ nombre: 'Ana', correo: 'a@b.co', total: 1,
       items: [{ producto_id: 1, cantidad: 1 }, { producto_id: 999, cantidad: 1 }] }) })).json()
   ```
   → 400 «El producto con id 999 no existe»; Pedidos no cambia.
6. Pedidos: detener servidor (`Ctrl + C`), `npm start`, recargar → el pedido sigue ahí.

## 3. Código (3 min) — `docs/ARQUITECTURA.md`

- **GET:** `server_rutas.js` → `routes/index.js` (tabla de rutas) → `pedidosController.listar` → `pedidoModel.listarPedidos` → `pedidosRepository.listar` (JOIN + agrupación) → `enviarJSON(res, 200, …)`.
- **POST:** `pedidosController.crear` → `leerCuerpoJSON` (415/400) → `pedidoModel.registrarPedido` (validar, agrupar, precios de SQLite, total) → `pedidosRepository.crear` con `enTransaccion` → 201 o 400.
- Tablas: `data/schema.sql` — FKs, `CHECK`, `UNIQUE (pedido_id, producto_id)`, `PRAGMA foreign_keys = ON` en `db.js`.

## 4. Repositorio (1 min)

README, `docs/` (OOHDM, arquitectura, API, pruebas, aportes), `npm run probar` en vivo (18/18; en PowerShell: `npm.cmd run probar`), historial de commits.

## Preguntas probables y respuesta corta

| Pregunta | Respuesta |
|---|---|
| ¿Por qué el servidor calcula el total? | El navegador se puede manipular (caso 8). El modelo ignora `total`/`precio` y usa `productosRepository.buscarPorIds`. |
| ¿Qué pasa si falla un detalle a mitad de guardado? | `enTransaccion` hace `ROLLBACK`: no queda pedido sin detalles. |
| ¿Por qué consultas parametrizadas? | Los `?` separan datos de SQL y evitan inyección SQL. |
| ¿Dónde está la diferencia entre 400 y 404? | 400: datos enviados inválidos (`ErrorValidacion` en el modelo). 404: el recurso pedido por la URL no existe (`productosController.obtener`). |
| ¿Por qué `"2"` (texto) se rechaza? | La regla exige número entero: `Number.isInteger("2")` es `false`. |
| ¿Qué hacen con productos repetidos? | Se agrupan sumando cantidades (`agruparRepetidos`), y la tabla tiene `UNIQUE (pedido_id, producto_id)`. |
| ¿Por qué no hay clase Comprador? | No hay cuentas ni autenticación; nombre y correo son datos del pedido. |
| ¿Por qué REST y no SOAP o GraphQL? | Ver README, sección «Por qué una API HTTP orientada a recursos». |
| Ajuste pequeño: «agrega un producto» | Añadir una fila en `data/seed.sql` y `npm run reset-db`, o un `INSERT` directo en la base. |
| Ajuste pequeño: «limita la cantidad a 20» | Cambiar `CANTIDAD_MAXIMA` en `models/pedidoModel.js` (y en `public/js/carrito.js`). |

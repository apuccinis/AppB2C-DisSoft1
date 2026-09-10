# CryptoFX — Backend

API REST en Node.js + Express con persistencia en SQLite (`better-sqlite3`),
autenticación JWT y simulación de precios en memoria.

Consulta el [README principal](../README.md) para la guía completa del proyecto.

## Puesta en marcha

```bash
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run seed            # crea la base de datos y el usuario demo
npm run dev             # http://localhost:5000/api
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor con recarga automática (`node --watch`) |
| `npm start` | Servidor en modo normal |
| `npm run seed` | Crea/reinicia el usuario demo y sus balances |

## Variables de entorno

Ver `.env.example`. Las más relevantes:

- `JWT_SECRET` — clave de firma de los tokens. En `NODE_ENV=production` el servidor
  **no arranca** si no está definida.
- `TRADING_FEE_RATE` — comisión por operación (`0.005` = 0.5 %). Es la única fuente de
  verdad de la comisión: no está fijada en ningún controlador.
- `DATABASE_PATH` — ruta del archivo SQLite (se crea solo si no existe).

## Arquitectura

```
src/
├── config/      env.js (configuración) · assets.js (catálogo y resolución de pares)
├── database/    db.js (conexión + esquema) · seed.js (datos de demostración)
├── models/      acceso a datos: users, wallets, orders
├── services/    lógica de negocio: authService, walletService, tradeService, priceService
├── controllers/ validación de entrada + respuesta HTTP
├── routes/      definición de la API
├── middleware/  auth.js (JWT) · errorHandler.js (errores centralizados)
├── utils/       ApiError, response, validation, numbers, asyncHandler
├── app.js       creación de la app Express (CORS, JSON, rutas, errores)
└── index.js     arranque: base de datos + simulación de precios + listen
```

El flujo es siempre el mismo: **ruta → middleware → controlador → servicio → modelo**.
Los controladores validan la entrada y no contienen reglas de negocio; los servicios no
conocen `req`/`res`.

## Esquema de la base de datos

```sql
users   (id, name, email UNIQUE, password_hash, created_at)
wallets (id, user_id → users, asset, balance CHECK (balance >= 0), UNIQUE (user_id, asset))
orders  (id, user_id → users, type CHECK (BUY|SELL), base_asset, quote_asset,
         amount, price, fee, total, status, created_at)
```

## Notas de seguridad

- Contraseñas hasheadas con bcrypt (`bcryptjs`, implementación en JavaScript puro del
  mismo algoritmo, elegida para evitar una dependencia nativa adicional).
- `password_hash` nunca sale en las respuestas: todo pasa por `toPublicUser()`.
- El `user_id` se obtiene siempre del JWT; pedir una orden ajena devuelve `404`.
- El saldo se comprueba dentro de una transacción de SQLite y la columna `balance` tiene
  un `CHECK (balance >= 0)`, así que un saldo negativo es imposible incluso ante un fallo
  de la capa de servicio.
- Errores uniformes: `{ "success": false, "message": "…" }` con el código HTTP adecuado
  (`400` validación, `401` sesión, `404` no encontrado, `409` conflicto, `422` saldo
  insuficiente o importe demasiado pequeño).

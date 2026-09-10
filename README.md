# CryptoFX — Prototipo full-stack de compra y venta de criptomonedas y divisas

Prototipo B2C de una plataforma de trading: autenticación simulada con JWT, wallets
multi-activo, operaciones de compra/venta con comisión, simulación de precios en tiempo
real y un dashboard financiero en dark mode.

> **Proyecto académico.** No hay dinero real, ni blockchain, ni pasarelas de pago, ni
> integraciones con mercados reales. Todos los precios están generados localmente.

---

## 1. Qué hace el proyecto

- Registro e inicio de sesión de usuarios (contraseñas con bcrypt, sesión con JWT).
- Una wallet por usuario y activo: **USD, EUR, BTC, ETH**.
- Simulación de mercado en el backend: los precios fluctúan solos cada pocos segundos.
- Compra y venta entre cualquier par de activos, con comisión configurable por entorno.
- Validación completa en el servidor: activos válidos, cantidad > 0, saldo suficiente y
  prohibición de saldos negativos.
- Dashboard con balance consolidado en USD, tarjetas por wallet y gráfico de precios.
- Historial de órdenes con filtros por tipo (BUY/SELL) y por activo.

---

## 2. Tecnologías utilizadas

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 18 (componentes funcionales + Hooks), Vite 5, Tailwind CSS 3, Recharts, React Router 6, Axios |
| Backend | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, CORS, `dotenv` |
| Persistencia | SQLite mediante `better-sqlite3` (sin ORM) |
| Lenguaje | JavaScript / JSX (sin TypeScript) |

---

## 3. Estructura de carpetas

```
Diseño1_ActEnClase10-09/
│
├── backend/
│   ├── src/
│   │   ├── config/        # env.js (variables de entorno) y assets.js (catálogo de activos)
│   │   ├── controllers/   # auth, prices, wallets, orders
│   │   ├── middleware/    # auth JWT + manejo centralizado de errores
│   │   ├── models/        # acceso a SQLite: users, wallets, orders
│   │   ├── routes/        # definición de la API REST
│   │   ├── services/      # lógica de negocio: auth, wallets, trading, precios
│   │   ├── utils/         # ApiError, respuestas, validación, redondeos
│   │   ├── database/      # conexión, esquema y seed
│   │   ├── app.js         # creación de la app Express
│   │   └── index.js       # arranque del servidor
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, PriceChart, WalletCard, Alert, EmptyState…
│   │   ├── pages/         # Login, Register, Dashboard, Trade, Orders, NotFound
│   │   ├── services/      # cliente Axios y llamadas a la API
│   │   ├── hooks/         # contextos de auth, mercado y portfolio
│   │   ├── utils/         # formateo y cálculo de la previsualización de trades
│   │   ├── App.jsx        # rutas
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── CLAUDE.md              # especificación original del proyecto
└── README.md              # este archivo
```

---

## 4. Requisitos previos

- **Node.js 18 o superior** (probado con Node 24).
- **npm 9 o superior**.
- No hace falta instalar nada más: SQLite viene embebido en `better-sqlite3`.

> `better-sqlite3` es un módulo nativo y descarga su binario precompilado durante
> `npm install`. Si tu configuración de npm bloquea los *install scripts*, permítelos
> para ese paquete o ejecuta `npm rebuild better-sqlite3`.

---

## 5. Instalación

```bash
# 1. Backend
cd backend
npm install

# 2. Frontend (en otra terminal, o después)
cd ../frontend
npm install
```

---

## 6. Configuración de `.env`

Los archivos `.env` **no se suben al repositorio**. Cópialos desde los ejemplos:

```bash
# Backend
cd backend
cp .env.example .env      # en Windows/PowerShell: copy .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

> **No hay que editar nada.** Los valores de ejemplo ya están listos para ejecutar el
> proyecto en local: no existe ninguna clave de API que registrar ni credencial de base
> de datos que rellenar. Las tablas siguientes son solo de referencia, por si quieres
> ajustar el puerto, la comisión o la velocidad de la simulación.

**`backend/.env`**

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `PORT` | `5000` | Puerto de la API |
| `JWT_SECRET` | `change_this_secret` | Clave de firma de los JWT. El valor de ejemplo sirve para desarrollo local; solo hay que sustituirlo si se despliega la aplicación |
| `JWT_EXPIRES_IN` | `7d` | Duración de la sesión |
| `TRADING_FEE_RATE` | `0.005` | Comisión aplicada a cada operación (0.5 %) |
| `DATABASE_PATH` | `./data/trading.db` | Ruta del archivo SQLite |
| `CORS_ORIGIN` | `http://localhost:5173` | Orígenes permitidos, separados por comas |
| `PRICE_TICK_INTERVAL_MS` | `3000` | Cada cuánto se recalculan los precios |
| `PRICE_VOLATILITY` | `0.0035` | Volatilidad por tick (≈ ±0.35 %) |

**`frontend/.env`**

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | URL base de la API |
| `VITE_PRICE_REFRESH_MS` | `4000` | Cada cuánto el frontend consulta los precios |

---

## 7. Cómo iniciar el backend

```bash
cd backend
npm run seed     # crea la base de datos y el usuario demo (solo la primera vez)
npm run dev      # modo desarrollo con recarga automática
# o bien
npm start        # modo normal
```

La API queda disponible en <http://localhost:5000/api>.
Comprobación rápida: <http://localhost:5000/api/health>.

---

## 8. Cómo iniciar el frontend

```bash
cd frontend
npm run dev
```

La aplicación queda disponible en <http://localhost:5173>.

---

## 9. Usuario demo

| Campo | Valor |
|-------|-------|
| Email | `demo@example.com` |
| Password | `demo123` |

Balances iniciales tras `npm run seed`:

| Activo | Saldo |
|--------|-------|
| USD | 10 000 |
| EUR | 5 000 |
| BTC | 0.25 |
| ETH | 2 |

En la pantalla de login hay un botón **«Usar cuenta demo»** que rellena y envía el
formulario automáticamente. El historial de órdenes empieza vacío a propósito, para
poder ver el *empty state* y crear las primeras operaciones desde la app.

Las credenciales son **exclusivamente para desarrollo local**. Puedes cambiarlas
definiendo `DEMO_EMAIL` y `DEMO_PASSWORD` en `backend/.env` antes de ejecutar el seed.
Volver a lanzar `npm run seed` reinicia los balances del usuario demo sin borrar sus órdenes.

---

## 10. Endpoints principales

Todas las respuestas siguen el mismo formato:

```jsonc
// Éxito
{ "success": true, "data": { } }

// Error
{ "success": false, "message": "Insufficient balance" }
```

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Estado del servicio y comisión vigente |
| `POST` | `/api/auth/register` | — | Crea una cuenta y devuelve el JWT |
| `POST` | `/api/auth/login` | — | Inicia sesión y devuelve el JWT |
| `GET` | `/api/auth/me` | ✅ | Usuario de la sesión actual |
| `GET` | `/api/assets` | — | Catálogo de activos con precio y variación |
| `GET` | `/api/prices` | — | Precios actuales de todos los activos |
| `GET` | `/api/prices/:asset` | — | Precio de un activo |
| `GET` | `/api/prices/:asset/history?range=1H\|24H\|7D` | — | Serie histórica simulada |
| `GET` | `/api/wallets` | ✅ | Wallets del usuario + balance consolidado |
| `GET` | `/api/wallets/:asset` | ✅ | Una wallet concreta |
| `POST` | `/api/orders` | ✅ | Ejecuta una compra/venta |
| `POST` | `/api/orders/preview` | ✅ | Calcula una operación sin ejecutarla |
| `GET` | `/api/orders?type=BUY&asset=BTC` | ✅ | Historial de órdenes con filtros |
| `GET` | `/api/orders/:id` | ✅ | Detalle de una orden propia |

Autenticación: cabecera `Authorization: Bearer <token>`.

Ejemplo de operación:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fromAsset":"USD","toAsset":"BTC","amount":1000}'
```

Un usuario solo puede leer y modificar **sus propias** wallets y órdenes: el `user_id`
sale siempre del JWT, nunca del cuerpo de la petición.

---

## 11. Cómo funciona la simulación de precios

Todo ocurre en `backend/src/services/priceService.js`; **no se usa ninguna API externa**.

1. **Precios de referencia** (`src/config/assets.js`): `BTC/USD = 100 000`,
   `ETH/USD = 4 000`, `EUR/USD = 1.17`. USD es la moneda de referencia y siempre vale 1.
2. **Histórico inicial**: al arrancar el servidor se genera para cada activo una serie de
   7 días con un punto por minuto mediante un paseo aleatorio, de modo que el gráfico
   tiene datos desde el primer segundo.
3. **Fluctuación**: cada `PRICE_TICK_INTERVAL_MS` (3 s por defecto) se recalcula cada
   precio con ruido gaussiano de amplitud `PRICE_VOLATILITY` más una ligera reversión a la
   media. El precio queda acotado a ±25 % de su valor de referencia, así que fluctúa de
   forma visible pero nunca se dispara ni se vuelve negativo.
4. **Consulta desde el frontend**: `useMarket` consulta `/api/prices` cada
   `VITE_PRICE_REFRESH_MS` y reparte los precios a toda la app; el balance consolidado y
   las tarjetas se recalculan en cada refresco.
5. **Rangos del gráfico**: `1H` (1 punto/min), `24H` (1 punto/10 min) y `7D`
   (1 punto/hora) se obtienen submuestreando la misma serie.

### Cómo se calcula una operación

Para cada par se decide cuál es el activo **base** y cuál el **quote** (prioridad
USD → EUR → ETH → BTC). El precio es el de 1 base expresado en quote y **la comisión se
cobra siempre en el activo quote**:

- **BUY** (gastas quote para recibir base): la comisión se descuenta del importe indicado.
  `fee = importe × TRADING_FEE_RATE`, `subtotal = importe − fee`, `recibes = subtotal / precio`.
  Ejemplo: 1 000 USD → BTC a 100 000 → comisión 5 USD → subtotal 995 → **0.00995 BTC**.
- **SELL** (vendes base para recibir quote): `subtotal = cantidad × precio`,
  `fee = subtotal × TRADING_FEE_RATE`, `recibes = subtotal − fee`.

En la tabla de órdenes, **Total** es el importe en el activo de cotización que entra o
sale de tu wallet: en una compra incluye la comisión, en una venta ya la tiene descontada.

El frontend muestra una estimación con el precio vigente, pero **el backend recalcula
precio, comisión y saldo antes de ejecutar**: nunca se confía en el cliente.

---

## 12. Limitaciones conocidas

- Los precios son **simulados**; no reflejan mercados reales.
- Ejecución instantánea al precio actual: no hay libro de órdenes, ni órdenes límite, ni
  deslizamiento, ni estados `PENDING`/`CANCELLED` (toda orden nace `COMPLETED`).
- Los balances se guardan como `REAL` (coma flotante) redondeados a 8 decimales. Es
  suficiente para un prototipo, pero un sistema real usaría enteros o decimales exactos.
- El JWT se guarda en `localStorage` y no hay refresh token ni revocación.
- El histórico de precios vive en memoria: al reiniciar el backend se regenera (las
  wallets y las órdenes sí persisten en SQLite).
- Sin recuperación de contraseña, verificación por email ni 2FA.
- Sin tests automatizados: la verificación se hizo manualmente sobre la API y la interfaz.

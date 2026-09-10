# CryptoFX — Frontend

SPA en React + Vite con Tailwind CSS (dark mode), Recharts y React Router.

Consulta el [README principal](../README.md) para la guía completa del proyecto.

## Puesta en marcha

El backend debe estar corriendo en <http://localhost:5000>.

```bash
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev             # http://localhost:5173
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |

## Variables de entorno

- `VITE_API_URL` — URL base de la API (por defecto `http://localhost:5000/api`).
- `VITE_PRICE_REFRESH_MS` — intervalo de refresco de precios (por defecto `4000`).

## Estructura

```
src/
├── components/   AppLayout, AuthLayout, ProtectedRoute, PriceChart, WalletCard,
│                 AssetBadge, ChangeBadge, Alert, EmptyState, Spinner, Logo
├── pages/        Login, Register, Dashboard, Trade, Orders, NotFound
├── hooks/        useAuth · useMarket · usePortfolio (contextos de React)
├── services/     api.js (cliente Axios) + auth/market/wallet/order
├── utils/        format.js (formateo) · trade.js (previsualización de operaciones)
├── App.jsx       rutas y composición de providers
└── main.jsx
```

### Estado global

Tres contextos anidados, en este orden:

1. **`AuthProvider`** — usuario, token y restauración de sesión contra `/auth/me`.
   Guarda el JWT en `localStorage` y escucha el evento `cryptofx:unauthorized` que emite
   el interceptor de Axios cuando la API responde `401`, para cerrar sesión sin recargar.
2. **`MarketProvider`** — precios (polling) y comisión vigente leída de `/health`.
3. **`PortfolioProvider`** — wallets del usuario. Revalora los saldos con los precios en
   vivo, de modo que el balance consolidado se actualiza en cada tick sin volver a pedir
   `/wallets`.

### Rutas

| Ruta | Acceso |
|------|--------|
| `/login`, `/register` | Público (redirigen al dashboard si ya hay sesión) |
| `/dashboard`, `/trade`, `/orders` | Protegido por `<ProtectedRoute>` |

### Estados de interfaz cubiertos

Loading (skeletons y spinners), error con reintento, *empty state*, operación
completada, operación fallida, saldo insuficiente (validación en vivo en el formulario)
y usuario no autenticado (redirección conservando el destino).

## Diseño

Tailwind con una paleta propia definida en `tailwind.config.js` (`base-*` para los
fondos, `accent` para la marca, `bull`/`bear` para verde y rojo) y unas pocas clases de
componente en `src/index.css` (`.card`, `.input`, `.btn-primary`, `.chip`…). No se usa
ninguna librería de componentes.

El layout es responsive: sidebar fijo a partir de `lg`, menú deslizante por debajo,
rejillas que pasan de 4 a 2 columnas y tablas con scroll horizontal propio.

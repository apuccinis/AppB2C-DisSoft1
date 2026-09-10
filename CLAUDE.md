Necesito que construyas un **prototipo funcional full-stack B2C de compra y venta de criptomonedas y divisas**, pensado como una aplicación de trading sencilla pero visualmente profesional.

El objetivo principal es obtener una aplicación funcional que pueda ejecutarse localmente, con frontend y backend separados, autenticación simulada, wallets, operaciones de compra/venta, simulación de precios y un dashboard financiero.

**IMPORTANTE:** Este es un proyecto académico/prototipo. Prioriza claridad, funcionalidad y una arquitectura limpia sobre complejidad innecesaria. **No implementes microservicios, Docker, Kubernetes, Redis, Kafka, blockchain real, procesamiento de pagos reales ni integraciones financieras reales.**

---

# 1. STACK TECNOLÓGICO OBLIGATORIO

## Frontend

- React con componentes funcionales y Hooks.
- Vite.
- Tailwind CSS.
- Recharts para gráficos.
- Axios o Fetch para consumir la API del backend.
- React Router para navegación.
- JavaScript/JSX, no TypeScript.
- Diseño responsive.
- Dark Mode como diseño principal.
- Interfaz inspirada en plataformas financieras modernas.

## Backend

- Node.js.
- Express.
- JavaScript.
- Arquitectura modular.
- CORS.
- dotenv para variables de entorno.
- JWT para autenticación simulada.
- bcrypt para hash de contraseñas.
- Persistencia local sencilla.

Para la persistencia puedes utilizar **SQLite** con una solución sencilla como `better-sqlite3`, evitando introducir un ORM innecesariamente complejo.

---

# 2. ESTRUCTURA GENERAL DEL PROYECTO

La aplicación debe quedar aproximadamente así:

mi-proyecto-fullstack/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database/
│   │   └── index.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md

Puedes agregar archivos o carpetas adicionales si son realmente necesarios, pero mantén la arquitectura sencilla y fácil de entender.

---

# 3. FUNCIONALIDADES PRINCIPALES

## 3.1 Autenticación

Implementa un sistema de autenticación simulado mediante JWT.

Debe existir:

- Registro.
- Login.
- Logout en frontend.
- Middleware de autenticación JWT.
- Contraseñas almacenadas utilizando bcrypt.
- Rutas protegidas.

El usuario autenticado debe poder acceder únicamente a sus propias wallets y órdenes.

No es necesario implementar recuperación de contraseña, verificación por correo ni autenticación de dos factores.

---

# 4. MODELO DE DATOS

Implementa al menos los siguientes modelos/tablas:

## User

Campos sugeridos:

- id
- name
- email
- password_hash
- created_at

El email debe ser único.

## Wallet

Representa el saldo de un usuario para un activo.

Campos sugeridos:

- id
- user_id
- asset
- balance

Ejemplos:

- USD
- EUR
- BTC
- ETH

Un usuario puede tener múltiples wallets, pero solamente una wallet por combinación usuario + activo.

## Order

Representa una operación de compra o venta.

Campos:

- id
- user_id
- type: BUY / SELL
- base_asset
- quote_asset
- amount
- price
- fee
- total
- status
- created_at

El estado inicial de una operación ejecutada será:

`COMPLETED`

---

# 5. DATOS INICIALES

Para que el prototipo sea inmediatamente demostrable, crea datos iniciales/mock mediante un seed.

Por ejemplo, un usuario demo:

Email:
demo@example.com

Password:
demo123

Con balances iniciales como:

USD: 10,000
EUR: 5,000
BTC: 0.25
ETH: 2

No expongas contraseñas reales ni secretos en el código. El usuario demo es únicamente para desarrollo local.

---

# 6. SIMULACIÓN DE PRECIOS

Implementa un servicio backend encargado de simular precios.

Activos mínimos:

- BTC
- ETH
- EUR

Ejemplo de precios iniciales:

BTC/USD = 100000
ETH/USD = 4000
EUR/USD = 1.17

El precio debe fluctuar ligeramente de forma periódica para simular un mercado en tiempo real.

Por ejemplo:

- actualizar precios cada 2-5 segundos;
- aplicar una pequeña variación aleatoria;
- evitar fluctuaciones absurdas;
- mantener los precios siempre positivos.

El frontend debe poder consultar los precios actuales.

**No es necesario utilizar una API externa.**

Si decides implementar una API externa opcional, debe existir igualmente un modo de simulación local para que la aplicación funcione sin depender de servicios externos.

---

# 7. MULTI-WALLET DASHBOARD

Crear una página principal `/dashboard`.

Debe mostrar:

### Balance total

Mostrar el valor consolidado de todas las wallets en USD.

Por ejemplo:

Total balance
$18,450.32

### Wallets

Mostrar tarjetas individuales:

- USD
- EUR
- BTC
- ETH

Cada tarjeta debe mostrar:

- símbolo/nombre del activo;
- cantidad disponible;
- precio actual aproximado;
- valor equivalente en USD;
- variación de precio.

El balance consolidado debe calcularse dinámicamente utilizando los precios actuales.

---

# 8. MÓDULO DE SWAP / TRADE

Crear una página `/trade`.

Debe existir un formulario interactivo para realizar operaciones.

Ejemplo:

SELL
USD

TO

BTC

Amount:
1000 USD

Price:
100000 USD/BTC

Fee:
0.5%

You receive:
0.00995 BTC

La comisión debe estar definida mediante variable de entorno del backend:

`TRADING_FEE_RATE=0.005`

No hardcodear la comisión en los controladores.

---

# 9. REGLAS DE NEGOCIO DEL TRADE

Antes de ejecutar una operación:

1. Verificar que el usuario esté autenticado.
2. Verificar que los activos sean válidos.
3. Obtener el precio actual.
4. Calcular el monto de la operación.
5. Calcular la comisión.
6. Verificar que el usuario tenga saldo suficiente.
7. Actualizar las wallets correspondientes.
8. Crear la orden.
9. Devolver al frontend el resultado de la operación.

Ejemplo:

Usuario quiere comprar BTC utilizando USD.

USD disponible:
10,000

Cantidad a gastar:
1,000 USD

Precio BTC:
100,000 USD

Comisión:
0.5%

Costo de comisión:
5 USD

Total descontado:
1,005 USD

BTC recibido:
0.01 BTC

El backend debe realizar las validaciones nuevamente aunque el frontend ya las haya realizado.

**Nunca confiar exclusivamente en las validaciones del frontend.**

Si el usuario no tiene fondos suficientes, devolver un error HTTP apropiado y un mensaje claro.

---

# 10. TIPOS DE OPERACIÓN

Soportar:

### BUY

Ejemplo:

USD → BTC

### SELL

Ejemplo:

BTC → USD

La lógica debe actualizar correctamente ambas wallets.

No permitir balances negativos.

---

# 11. GRÁFICO DE PRECIOS

Crear un componente reutilizable de gráfico utilizando Recharts.

Debe permitir seleccionar:

- BTC
- ETH
- EUR

Y mostrar:

- precio;
- tiempo;
- tendencia histórica simulada.

El gráfico puede utilizar datos generados por el backend.

Agregar botones para cambiar el activo.

Opcionalmente permitir diferentes rangos:

- 1H
- 24H
- 7D

Si implementar estos rangos complica innecesariamente el prototipo, prioriza 1H y 24H.

---

# 12. HISTORIAL DE ÓRDENES

Crear una página `/orders`.

Mostrar una tabla con:

- fecha;
- tipo;
- activo vendido;
- activo comprado;
- cantidad;
- precio de ejecución;
- comisión;
- total;
- estado.

Ejemplo:

| Date | Type | Pair | Amount | Price | Fee | Status |
|------|------|------|--------|-------|-----|--------|
| 10/09/2026 | BUY | BTC/USD | 0.01 BTC | $100,000 | $5 | Completed |

Agregar filtros simples por:

- BUY / SELL;
- activo.

---

# 13. API DEL BACKEND

Implementa una API REST clara.

Endpoints mínimos:

### Authentication

POST `/api/auth/register`

POST `/api/auth/login`

GET `/api/auth/me`

### Assets / Prices

GET `/api/assets`

GET `/api/prices`

GET `/api/prices/:asset`

### Wallets

GET `/api/wallets`

GET `/api/wallets/:asset`

### Trading

POST `/api/orders`

GET `/api/orders`

GET `/api/orders/:id`

### Health

GET `/api/health`

El endpoint de trading debe ser protegido mediante JWT.

---

# 14. FRONTEND

Crear como mínimo:

### Login

`/login`

### Register

`/register`

### Dashboard

`/dashboard`

### Trade

`/trade`

### Orders

`/orders`

Agregar un layout principal con:

- Sidebar o navbar.
- Nombre/logo de la aplicación.
- Balance total.
- Navegación.
- Botón de logout.

---

# 15. DISEÑO VISUAL

La aplicación debe tener una apariencia de plataforma financiera moderna.

Características:

- Dark Mode.
- Tarjetas con información financiera.
- Tipografía limpia.
- Buena jerarquía visual.
- Espaciado consistente.
- Estados visuales para BUY y SELL.
- Gráficos integrados.
- Tablas modernas.
- Botones claros.
- Formularios profesionales.
- Responsive para desktop y tablet.

No es necesario utilizar una librería de componentes adicional.

Utiliza Tailwind CSS directamente.

---

# 16. ESTADOS DEL FRONTEND

No limitarse únicamente al estado exitoso.

Implementar estados para:

- Loading.
- Error.
- Empty state.
- Operación exitosa.
- Operación fallida.
- Saldo insuficiente.
- Usuario no autenticado.

Después de ejecutar una operación correctamente:

- actualizar balances;
- actualizar precios si corresponde;
- mostrar confirmación;
- actualizar historial de órdenes.

---

# 17. VARIABLES DE ENTORNO

Backend `.env.example`:

PORT=5000
JWT_SECRET=change_this_secret
TRADING_FEE_RATE=0.005
DATABASE_PATH=./data/trading.db

Frontend `.env.example`:

VITE_API_URL=http://localhost:5000/api

Nunca incluir `.env` real en Git.

Agregar `.env` y archivos de base de datos locales al `.gitignore`.

---

# 18. SEGURIDAD BÁSICA

Aunque sea un prototipo, implementar:

- bcrypt para contraseñas;
- JWT;
- middleware de autenticación;
- validación de inputs;
- variables sensibles mediante `.env`;
- CORS configurado;
- evitar devolver password_hash en respuestas;
- verificar ownership de wallets y órdenes;
- impedir balances negativos;
- validar cantidades mayores que cero.

No necesito seguridad de nivel producción.

---

# 19. MANEJO DE ERRORES

Crear una estrategia centralizada para errores del backend.

Las respuestas deben seguir una estructura consistente, por ejemplo:

{
  "success": false,
  "message": "Insufficient balance"
}

Para respuestas exitosas:

{
  "success": true,
  "data": {}
}

Utilizar códigos HTTP apropiados.

---

# 20. README

Crear un README principal que explique:

1. Qué hace el proyecto.
2. Tecnologías utilizadas.
3. Estructura de carpetas.
4. Requisitos previos.
5. Instalación.
6. Configuración de `.env`.
7. Cómo iniciar backend.
8. Cómo iniciar frontend.
9. Usuario demo.
10. Endpoints principales.
11. Cómo funciona la simulación de precios.

Debe ser posible ejecutar el proyecto siguiendo únicamente el README.

---

# 21. SCRIPTS

Configurar scripts sencillos.

Backend:

`npm run dev`

`npm start`

`npm run seed`

Frontend:

`npm run dev`

---

# 22. CRITERIOS DE ACEPTACIÓN

Considera el proyecto terminado únicamente cuando se cumpla lo siguiente:

- [ ] Backend inicia correctamente.
- [ ] Frontend inicia correctamente.
- [ ] El usuario puede registrarse.
- [ ] El usuario puede iniciar sesión.
- [ ] JWT protege las rutas privadas.
- [ ] El dashboard muestra las wallets.
- [ ] Se calcula el balance consolidado.
- [ ] Los precios fluctúan automáticamente.
- [ ] El gráfico muestra los precios.
- [ ] Se puede seleccionar BTC, ETH y EUR.
- [ ] Se puede comprar y vender.
- [ ] La comisión del 0.5% se calcula correctamente.
- [ ] La comisión proviene de una variable de entorno.
- [ ] Se valida saldo suficiente.
- [ ] No se permiten balances negativos.
- [ ] Las wallets se actualizan después de una operación.
- [ ] Las órdenes quedan registradas.
- [ ] El historial muestra las operaciones.
- [ ] El logout funciona.
- [ ] No existen secretos hardcodeados.
- [ ] El proyecto tiene README funcional.
- [ ] No hay errores de compilación/lint importantes.

---

# 23. FORMA DE TRABAJO

Quiero que trabajes directamente sobre el proyecto actual.

Antes de comenzar:

1. Inspecciona los archivos existentes.
2. Determina si ya existe algún proyecto o estructura.
3. Reutiliza lo que sea útil.
4. No elimines archivos existentes sin una razón clara.

Después:

1. Crea o adapta la estructura.
2. Configura backend.
3. Configura base de datos.
4. Implementa modelos.
5. Implementa servicios.
6. Implementa controladores y rutas.
7. Implementa autenticación.
8. Implementa simulación de precios.
9. Implementa frontend.
10. Integra frontend y backend.
11. Ejecuta pruebas/builds para detectar errores.
12. Corrige los errores encontrados.
13. Verifica los criterios de aceptación.

No te limites a generar archivos de ejemplo o pseudocódigo: **quiero código funcional que pueda ejecutarse localmente.**

Cuando exista más de una alternativa técnica razonable, elige la opción más sencilla y mantenible para este prototipo y continúa sin detenerte a pedir confirmación.

Al finalizar, proporciona un resumen de:

- estructura creada;
- tecnologías utilizadas;
- funcionalidades implementadas;
- comandos para ejecutar el proyecto;
- credenciales del usuario demo;
- variables `.env` necesarias;
- cualquier limitación conocida del prototipo.
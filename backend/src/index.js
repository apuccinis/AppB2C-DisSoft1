import config from './config/env.js';
import { createApp } from './app.js';
import { initDatabase } from './database/db.js';
import { startPriceSimulation } from './services/priceService.js';
import { countUsers } from './models/userModel.js';

initDatabase();
startPriceSimulation();

const app = createApp();

app.listen(config.port, () => {
  console.log(`\n  CryptoFX API escuchando en http://localhost:${config.port}/api`);
  console.log(`  Entorno:        ${config.env}`);
  console.log(`  Base de datos:  ${config.databasePath}`);
  console.log(`  Comision:       ${(config.tradingFeeRate * 100).toFixed(2)}%`);
  console.log(`  Precios:        simulados cada ${config.priceTickIntervalMs} ms`);
  if (countUsers() === 0) {
    console.log('\n  No hay usuarios todavia. Ejecuta "npm run seed" para crear el usuario demo.\n');
  } else {
    console.log('');
  }
});

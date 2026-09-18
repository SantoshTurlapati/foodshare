import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { getDatabase, checkAndExpireDonations } from './config/database.js';

const app = createApp();

getDatabase();

checkAndExpireDonations();
setInterval(() => {
  checkAndExpireDonations();
}, 60 * 1000);

app.listen(ENV.PORT, () => {
  console.log('=========================================');
  console.log(` 🌱 FoodShare Backend Server Running`);
  console.log(` 🌐 URL: http://localhost:${ENV.PORT}`);
  console.log(` 📦 Mode: ${ENV.NODE_ENV}`);
  console.log('=========================================');
});

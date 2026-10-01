const path = require('path');

const root = path.resolve(__dirname, '../../..');
require('dotenv').config({ path: path.join(root, '.env') });

const daRaiz = (p) => (path.isAbsolute(p) ? p : path.resolve(root, p));

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Crie o arquivo .env a partir de .env.example.');
}

module.exports = {
  root,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dbPath: daRaiz(process.env.DB_PATH || './database/portal.db'),
};
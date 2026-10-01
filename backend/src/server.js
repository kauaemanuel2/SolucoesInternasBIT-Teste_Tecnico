require('dotenv').config();
const { port } = require('./config/env');
const app = require('./app');

app.listen(port, () => {
  console.log(`Servidor em http://localhost:${port}`);
});
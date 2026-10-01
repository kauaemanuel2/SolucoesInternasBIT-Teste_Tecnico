const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { root, dbPath } = require('../config/env');
const db = require('../config/database');

const ler = (arquivo) => fs.readFileSync(path.join(root, 'database', arquivo), 'utf8');

const seed = ler('seed.sql').replace(/@@HASH:([^@]+)@@/g, (_, senha) => bcrypt.hashSync(senha, 10));

db.exec(ler('schema.sql'));
db.exec(seed);
db.close();

console.log(`Banco inicializado em ${dbPath}`);
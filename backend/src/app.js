const path = require('path');
const express = require('express');
const { root } = require('./config/env');
const routes = require('./routes');
const { naoEncontrado, tratarErros } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(root, 'public')));

app.use('/api', routes);
app.use('/api', naoEncontrado);
app.use(tratarErros);

module.exports = app;
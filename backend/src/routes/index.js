const { Router } = require('express');
const autenticar = require('../middlewares/auth');
const authRoutes = require('./authRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const solicitacaoRoutes = require('./solicitacaoRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use(autenticar);
router.use('/categorias', categoriaRoutes);
router.use('/solicitacoes', solicitacaoRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
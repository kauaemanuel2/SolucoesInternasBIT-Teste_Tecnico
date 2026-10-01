const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/categoriaController');

const router = Router();

router.get('/', asyncHandler(controller.listar));

module.exports = router;
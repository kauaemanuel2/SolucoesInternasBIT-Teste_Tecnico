const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/dashboardController');

const router = Router();

router.get('/', asyncHandler(controller.resumo));

module.exports = router;
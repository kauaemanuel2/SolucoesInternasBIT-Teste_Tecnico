const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const autenticar = require('../middlewares/auth');
const controller = require('../controllers/authController');

const router = Router();

router.post('/login', asyncHandler(controller.login));
router.get('/me', autenticar, asyncHandler(controller.me));

module.exports = router;
const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/solicitacaoController');

const router = Router();

router.post('/', asyncHandler(controller.criar));
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obter));
router.put('/:id', asyncHandler(controller.atualizar));
router.delete('/:id', asyncHandler(controller.remover));
router.patch('/:id/status', asyncHandler(controller.alterarStatus));

module.exports = router;
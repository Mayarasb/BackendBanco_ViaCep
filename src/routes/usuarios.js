// src/routes/usuarios.js
const express    = require('express');
const controller = require('../controllers/usuarioController');

const router = express.Router();

// ── Usuários CRUD ─────────────────────────────────────────────────────────────
router.post  ('/',    controller.criar);
router.get   ('/',    controller.listar);
router.get   ('/:id', controller.buscarPorId);
router.put   ('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

module.exports = router;

// src/routes/cep.js
const express    = require('express');
const controller = require('../controllers/usuarioController');

const router = express.Router();

// GET /cep/:cep  →  consulta ViaCEP sem persistir
router.get('/:cep', controller.consultarCep);

module.exports = router;

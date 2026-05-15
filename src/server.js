// src/server.js
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');

const usuariosRoutes = require('./routes/usuarios');
const cepRoutes      = require('./routes/cep');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Middleware: loga banco escolhido ──────────────────────────────────────────
app.use((req, _res, next) => {
  const db = (req.headers['x-db'] || req.query.db || 'sqlite').toLowerCase();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}  db=${db}`);
  next();
});

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/usuarios', usuariosRoutes);
app.use('/cep',      cepRoutes);

// Health-check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Inicia servidor ───────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('   Banco padrão: SQLite');
  console.log('   Use o header  X-DB: mongo | sqlite | both  para escolher o banco');
  console.log('   ou query string ?db=mongo | sqlite | both');
});

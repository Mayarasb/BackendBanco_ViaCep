// src/repositories/index.js
/**
 * Resolve qual(is) repositório(s) usar com base no header/query "db".
 *
 * Valores aceitos (case-insensitive):
 *   "sqlite"  → somente SQLite
 *   "mongo"   → somente MongoDB
 *   "both"    → SQLite + MongoDB
 *
 * Padrão: "sqlite" (se header ausente)
 */

const sqlite = require('./sqliteRepository');
const mongo  = require('./mongoRepository');

function getRepos(req) {
  
  const raw = (req.headers['x-db'] || req.query.db || 'sqlite').toLowerCase();

  if (raw === 'both')   return [sqlite, mongo];
  if (raw === 'mongo')  return [mongo];
  return [sqlite];
}

module.exports = { getRepos };

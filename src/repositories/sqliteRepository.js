// src/repositories/sqliteRepository.js  –  driver: sqlite3 (async/callback)
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.join(__dirname, '../../database.sqlite');

let _db = null;

function getDb() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    _db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      _db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          nome        TEXT NOT NULL,
          cep         TEXT NOT NULL,
          logradouro  TEXT,
          numero      TEXT,
          complemento TEXT,
          bairro      TEXT,
          cidade      TEXT,
          estado      TEXT,
          created_at  TEXT DEFAULT (datetime('now')),
          updated_at  TEXT DEFAULT (datetime('now'))
        )
      `, (err2) => {
        if (err2) return reject(err2);
        // Migração: adiciona colunas se tabela já existia sem elas
        _db.run(`ALTER TABLE usuarios ADD COLUMN numero TEXT`, () => {});
        _db.run(`ALTER TABLE usuarios ADD COLUMN complemento TEXT`, () => {});
        resolve(_db);
      });
    });
  });
}

function rowToObj(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    nome:        row.nome,
    cep:         row.cep,
    logradouro:  row.logradouro,
    numero:      row.numero,
    complemento: row.complemento,
    bairro:      row.bairro,
    cidade:      row.cidade,
    estado:      row.estado,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

const run = (db, sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function (err) { err ? rej(err) : res(this); }));
const get = (db, sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const all = (db, sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

async function criar({ nome, cep, logradouro, numero, complemento, bairro, cidade, estado }) {
  const db   = await getDb();
  const info = await run(db,
    `INSERT INTO usuarios (nome, cep, logradouro, numero, complemento, bairro, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, cep, logradouro, numero || '', complemento || '', bairro, cidade, estado]
  );
  return buscarPorId(info.lastID);
}

async function listar() {
  const db   = await getDb();
  const rows = await all(db, 'SELECT * FROM usuarios ORDER BY id DESC');
  return rows.map(rowToObj);
}

async function buscarPorId(id) {
  const db  = await getDb();
  const row = await get(db, 'SELECT * FROM usuarios WHERE id = ?', [id]);
  return rowToObj(row);
}

async function atualizar(id, { nome, cep, logradouro, numero, complemento, bairro, cidade, estado }) {
  const db   = await getDb();
  const info = await run(db,
    `UPDATE usuarios
        SET nome=?, cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?,
            updated_at=datetime('now')
      WHERE id=?`,
    [nome, cep, logradouro, numero || '', complemento || '', bairro, cidade, estado, id]
  );
  if (info.changes === 0) return null;
  return buscarPorId(id);
}

async function deletar(id) {
  const db      = await getDb();
  const usuario = await buscarPorId(id);
  if (!usuario) return null;
  await run(db, 'DELETE FROM usuarios WHERE id = ?', [id]);
  return usuario;
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };

// src/repositories/mongoRepository.js
const mongoose = require('mongoose');

// ── Schema ────────────────────────────────────────────────────────────────────
const usuarioSchema = new mongoose.Schema(
  {
    nome:        { type: String, required: true },
    cep:         { type: String, required: true },
    logradouro:  String,
    numero:      String,
    complemento: String,
    bairro:      String,
    cidade:      String,
    estado:      String,
  },
  { timestamps: true }
);

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

// ── Connection helper ─────────────────────────────────────────────────────────
let connected = false;

async function connect() {
  if (connected) return;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cep_crud';
  await mongoose.connect(uri);
  connected = true;
  console.log('✅ MongoDB conectado');
}

// ── helpers ───────────────────────────────────────────────────────────────────
function docToObj(doc) {
  if (!doc) return null;
  const obj = doc.toObject({ virtuals: false });
  obj._id = obj._id.toString();
  return obj;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
async function criar(dados) {
  await connect();
  const doc = await Usuario.create(dados);
  return docToObj(doc);
}

async function listar() {
  await connect();
  const docs = await Usuario.find().sort({ createdAt: -1 });
  return docs.map(docToObj);
}

async function buscarPorId(id) {
  await connect();
  try {
    const doc = await Usuario.findById(id);
    return docToObj(doc);
  } catch {
    return null; // id inválido p/ Mongo
  }
}

async function atualizar(id, dados) {
  await connect();
  try {
    const doc = await Usuario.findByIdAndUpdate(id, dados, { new: true });
    return docToObj(doc);
  } catch {
    return null;
  }
}

async function deletar(id) {
  await connect();
  try {
    const doc = await Usuario.findByIdAndDelete(id);
    return docToObj(doc);
  } catch {
    return null;
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };

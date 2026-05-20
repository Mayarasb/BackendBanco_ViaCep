// src/controllers/usuarioController.js
const { getRepos }  = require('../repositories');
const { buscarCep } = require('../services/viaCepService');

async function criar(req, res) {
  try {
    const { nome, cep, numero, complemento } = req.body;

    if (!nome?.trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
    if (!cep || cep.replace(/\D/g,'').length !== 8)
      return res.status(400).json({ erro: 'CEP deve ter 8 dígitos' });

    let endereco;
    try { endereco = await buscarCep(cep); }
    catch (e) { return res.status(422).json({ erro: e.message }); }

    const dados = {
      nome: nome.trim(),
      cep: cep.replace(/\D/g,''),
      numero: numero?.trim() || '',
      complemento: complemento?.trim() || '',
      ...endereco,
    };

    const repos      = getRepos(req);
    const resultados = await Promise.all(repos.map(r => r.criar(dados)));
    if (repos.length === 1) return res.status(201).json(resultados[0]);
    return res.status(201).json(formatarBoth(repos, resultados));
  } catch (err) { console.error(err); res.status(500).json({ erro: 'Erro interno' }); }
}

async function listar(req, res) {
  try {
    const repos      = getRepos(req);
    const resultados = await Promise.all(repos.map(r => r.listar()));
    if (repos.length === 1) return res.json(resultados[0]);
    return res.json(formatarBoth(repos, resultados));
  } catch (err) { console.error(err); res.status(500).json({ erro: 'Erro interno' }); }
}

async function buscarPorId(req, res) {
  try {
    const { id }     = req.params;
    const repos      = getRepos(req);
    const resultados = await Promise.all(repos.map(r => r.buscarPorId(id)));
    if (repos.length === 1) {
      if (!resultados[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
      return res.json(resultados[0]);
    }
    const obj = formatarBoth(repos, resultados);
    if (!obj.sqlite && !obj.mongo) return res.status(404).json({ erro: 'Usuário não encontrado em nenhum banco' });
    return res.json(obj);
  } catch (err) { console.error(err); res.status(500).json({ erro: 'Erro interno' }); }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, cep, numero, complemento, logradouro, bairro, cidade, estado } = req.body;

    if (!nome?.trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
    if (!cep || cep.replace(/\D/g,'').length !== 8)
      return res.status(400).json({ erro: 'CEP deve ter 8 dígitos' });

    // Se veio logradouro no body, usa direto (edição manual)
    // Senão busca no ViaCEP
    let endereco;
    if (logradouro) {
      endereco = { logradouro, bairro: bairro || '', cidade: cidade || '', estado: estado || '' };
    } else {
      try { endereco = await buscarCep(cep); }
      catch (e) { return res.status(422).json({ erro: e.message }); }
    }

    const dados = {
      nome: nome.trim(),
      cep: cep.replace(/\D/g,''),
      numero: numero?.trim() || '',
      complemento: complemento?.trim() || '',
      ...endereco,
    };

    const repos      = getRepos(req);
    const resultados = await Promise.all(repos.map(r => r.atualizar(id, dados)));
    if (repos.length === 1) {
      if (!resultados[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
      return res.json(resultados[0]);
    }
    const obj = formatarBoth(repos, resultados);
    if (!obj.sqlite && !obj.mongo) return res.status(404).json({ erro: 'Usuário não encontrado em nenhum banco' });
    return res.json(obj);
  } catch (err) { console.error(err); res.status(500).json({ erro: 'Erro interno' }); }
}

async function deletar(req, res) {
  try {
    const { id }     = req.params;
    const repos      = getRepos(req);
    const resultados = await Promise.all(repos.map(r => r.deletar(id)));
    if (repos.length === 1) {
      if (!resultados[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
      return res.json({ mensagem: 'Usuário deletado', usuario: resultados[0] });
    }
    const obj = formatarBoth(repos, resultados);
    if (!obj.sqlite && !obj.mongo) return res.status(404).json({ erro: 'Usuário não encontrado em nenhum banco' });
    return res.json({ mensagem: 'Usuário deletado', ...obj });
  } catch (err) { console.error(err); res.status(500).json({ erro: 'Erro interno' }); }
}

async function consultarCep(req, res) {
  try {
    const dados = await buscarCep(req.params.cep);
    res.json(dados);
  } catch (e) { res.status(422).json({ erro: e.message }); }
}

function formatarBoth(repos, resultados) {
  const obj = {};
  repos.forEach((r, i) => {
    const nome = r === require('../repositories/sqliteRepository') ? 'sqlite' : 'mongo';
    obj[nome] = resultados[i];
  });
  return obj;
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar, consultarCep };

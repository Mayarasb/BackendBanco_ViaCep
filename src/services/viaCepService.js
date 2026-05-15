// src/services/viaCepService.js
const axios = require('axios');

/**
 * Busca endereço na API ViaCEP.
 * @param {string} cep  somente dígitos, 8 caracteres
 * @returns {{ logradouro, bairro, cidade, estado }} ou lança erro
 */
async function buscarCep(cep) {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) throw new Error('CEP deve ter 8 dígitos');

  const { data } = await axios.get(`https://viacep.com.br/ws/${limpo}/json/`);

  if (data.erro) throw new Error('CEP não encontrado');

  return {
    logradouro: data.logradouro || '',
    bairro:     data.bairro     || '',
    cidade:     data.localidade || '',
    estado:     data.uf         || '',
  };
}

module.exports = { buscarCep };

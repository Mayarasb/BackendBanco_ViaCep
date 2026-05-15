# CEP CRUD Backend

API REST em **Node.js + Express** que persiste dados de usuários (nome + CEP) em **SQLite**, **MongoDB** ou **ambos simultaneamente**. O endereço é enriquecido automaticamente pela API pública [ViaCEP](https://viacep.com.br).

---

## Estrutura do Projeto

```
backend/
├── src/
│   ├── server.js                    # Entry-point Express
│   ├── routes/
│   │   ├── usuarios.js              # Rotas CRUD /usuarios
│   │   └── cep.js                   # Rota consulta /cep/:cep
│   ├── controllers/
│   │   └── usuarioController.js     # Lógica de cada rota
│   ├── repositories/
│   │   ├── index.js                 # Resolver de banco (sqlite/mongo/both)
│   │   ├── sqliteRepository.js      # CRUD SQLite (better-sqlite3)
│   │   └── mongoRepository.js       # CRUD MongoDB (mongoose)
│   └── services/
│       └── viaCepService.js         # Integração ViaCEP
├── database.sqlite                  # Criado automaticamente
├── .env.example
└── package.json
```

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 18+           |
| npm        | 9+            |
| MongoDB    | 6+ (local ou Atlas) — *opcional se usar só SQLite* |

---

## Instalação e Configuração

```bash
# 1. Clone / copie a pasta backend
cd backend

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env e preencha MONGO_URI caso queira usar MongoDB
```

### Variáveis de ambiente (`.env`)

| Variável     | Padrão                                  | Descrição                          |
|--------------|-----------------------------------------|------------------------------------|
| `PORT`       | `3000`                                  | Porta HTTP                         |
| `MONGO_URI`  | `mongodb://localhost:27017/cep_crud`    | URI de conexão MongoDB             |
| `SQLITE_PATH`| `./database.sqlite`                     | Caminho do arquivo SQLite          |

---

## Executar

```bash
# Produção
npm start

# Desenvolvimento (auto-reload)
npm run dev
```

Servidor disponível em `http://localhost:3000`.

---

## Escolha do Banco de Dados

O cliente define **qual banco usar em cada requisição** via:

- **Header HTTP:** `X-DB: sqlite | mongo | both`
- **Query string:** `?db=sqlite | mongo | both`

| Valor    | Comportamento                             |
|----------|-------------------------------------------|
| `sqlite` | Persiste/lê somente no SQLite (padrão)    |
| `mongo`  | Persiste/lê somente no MongoDB            |
| `both`   | Persiste/lê em ambos simultaneamente      |

Quando `both` é usado, a resposta retorna um objeto com chaves `sqlite` e `mongo`.

---

## Endpoints

### Health-check
```
GET /health
```

### Consultar CEP (sem persistir)
```
GET /cep/:cep
```
Exemplo: `GET /cep/01001000`

---

### CRUD Usuários

> Todos os endpoints aceitam o header `X-DB` ou query `?db=`.

#### Criar usuário
```
POST /usuarios
Content-Type: application/json
X-DB: sqlite          ← ou mongo / both

{
  "nome": "João Silva",
  "cep":  "01001000"
}
```
Resposta `201`:
```json
{
  "_id": 1,
  "nome": "João Silva",
  "cep": "01001000",
  "logradouro": "Praça da Sé",
  "bairro": "Sé",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

#### Listar usuários
```
GET /usuarios
X-DB: mongo
```

#### Buscar por ID
```
GET /usuarios/:id
X-DB: sqlite
```

#### Atualizar usuário
```
PUT /usuarios/:id
Content-Type: application/json
X-DB: both

{
  "nome": "João Atualizado",
  "cep":  "20040020"
}
```

#### Deletar usuário
```
DELETE /usuarios/:id
X-DB: sqlite
```

---

## Exemplo com `curl`

```bash
# Criar em ambos os bancos
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -H "X-DB: both" \
  -d '{"nome":"Maria","cep":"01310100"}'

# Listar do MongoDB
curl http://localhost:3000/usuarios -H "X-DB: mongo"

# Buscar CEP sem salvar
curl http://localhost:3000/cep/04538132
```

---

## Integração com o Frontend React Native

No arquivo `App.js` do app, adicione o header nas chamadas à API:

```js
// Exemplo de criação
await fetch('http://SEU_IP:3000/usuarios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-DB': bancoSelecionado,   // 'sqlite' | 'mongo' | 'both'
  },
  body: JSON.stringify({ nome, cep }),
});
```

O campo `bancoSelecionado` pode vir de um `Picker` ou `Switch` na UI do app.

---

## Validações

| Campo | Regra                                  |
|-------|----------------------------------------|
| nome  | Obrigatório, mínimo 2 caracteres       |
| cep   | 8 dígitos numéricos, válido no ViaCEP  |

Erros retornam JSON `{ "erro": "mensagem" }` com status HTTP adequado (400, 404, 422, 500).

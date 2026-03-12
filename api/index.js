require('dotenv').config(); // Carrega variáveis de ambiente do .env

const express = require('express');
const cors = require('cors');
const eventoService = require('./SERVICES/eventoService');
const awardsService = require('./SERVICES/awardsService');
const financasService = require('./SERVICES/financasService');
const usuarioService = require('./SERVICES/usuarioService');
const { connectDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÕES ---
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido!" });
  }

  try {
    const payload = usuarioService.verificarToken(token);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido!" });
  }
}

function verificarAdmin(req, res, next) {
  if (!req.usuario?.isAdmin) {
    return res.status(403).json({ erro: "Acesso negado! Privilégios de administrador necessários." });
  }
  next();
}

// --- INICIALIZAR SERVIDOR ---
async function iniciar() {
  await connectDB(); // Aguarda conexão com MongoDB ANTES de aceitar requisições
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

// --- ROTAS DA API ---

// Rota inicial de teste
app.get('/', (req, res) => {
  res.send('API do App de Amigos-do-Roots Rodando! 🟢');
});

// --- AUTENTICAÇÃO ---
// ✅ CRIAR PRIMEIRO ADMIN (sem autenticação)
app.post("/auth/first-admin", async (req, res) => {
  try {
    const usuariosExistentes = await usuarioService.listar();
    if (usuariosExistentes.length > 0) {
      return res.status(403).json({ erro: "Já existem usuários cadastrados!" });
    }

    const { nome, login, senha } = req.body;
    const novoUsuario = await usuarioService.criar(nome, login, senha, "", true);

    res.status(201).json({ mensagem: "Admin criado com sucesso!", usuario: novoUsuario });
  } catch (err) {
    console.error("ERRO POST /auth/first-admin:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ STATUS DO SISTEMA (público): precisa criar primeiro admin?
app.get("/auth/bootstrap", async (req, res) => {
  try {
    const usuariosExistentes = await usuarioService.listar();
    res.json({ needsFirstAdmin: usuariosExistentes.length === 0 });
  } catch (err) {
    console.error("ERRO GET /auth/bootstrap:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ erro: "Login e senha são obrigatórios!" });
    }

    const usuario = await usuarioService.autenticar(login, senha);
    const token = usuarioService.gerarToken(usuario);

    res.json({
      mensagem: "Login realizado com sucesso!",
      usuario,
      token,
    });
  } catch (err) {
    console.error("ERRO POST /auth/login:", err);
    res.status(401).json({ erro: err.message });
  }
});

// ✅ CRIAR USUÁRIO (APENAS ADMIN)
app.post("/auth/registrar", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nome, login, senha, email, isAdmin } = req.body;

    const novoUsuario = await usuarioService.criar(nome, login, senha, email, isAdmin);
    res.status(201).json({ mensagem: "Usuário criado com sucesso!", usuario: novoUsuario });
  } catch (err) {
    console.error("ERRO POST /auth/registrar:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ LISTAR USUÁRIOS (APENAS ADMIN)
app.get("/auth/usuarios", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const usuarios = await usuarioService.listar();
    res.json(usuarios);
  } catch (err) {
    console.error("ERRO GET /auth/usuarios:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ OBTER USUÁRIO POR ID (APENAS ADMIN)
app.get("/auth/usuarios/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const usuario = await usuarioService.obterPorId(req.params.id);
    res.json(usuario);
  } catch (err) {
    console.error("ERRO GET /auth/usuarios/:id:", err);
    res.status(404).json({ erro: err.message });
  }
});

// ✅ ATUALIZAR USUÁRIO (APENAS ADMIN)
app.put("/auth/usuarios/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const usuario = await usuarioService.atualizar(req.params.id, req.body);
    res.json({ mensagem: "Usuário atualizado com sucesso!", usuario });
  } catch (err) {
    console.error("ERRO PUT /auth/usuarios/:id:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ DELETAR USUÁRIO (APENAS ADMIN)
app.delete("/auth/usuarios/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const resultado = await usuarioService.deletar(req.params.id);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO DELETE /auth/usuarios/:id:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ ALTERAR SENHA
app.post("/auth/alterar-senha", verificarToken, async (req, res) => {
  try {
    const { senhaNova } = req.body;
    const resultado = await usuarioService.alterarSenha(req.usuario.id, senhaNova);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO POST /auth/alterar-senha:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ LISTAR eventos
app.get("/eventos", async (req, res) => {
  try {
    const eventos = await eventoService.listarEventos();
    res.json(eventos);
  } catch (err) {
    console.error("ERRO GET /eventos:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ CRIAR evento
app.post("/eventos", async (req, res) => {
  try {
    const eventoCriado = await eventoService.criarEvento(req.body);
    res.status(201).json(eventoCriado);
  } catch (err) {
    console.error("ERRO POST /eventos:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ EDITAR evento
app.put("/eventos/:id", async (req, res) => {
  try {
    const ok = await eventoService.atualizarEvento(req.params.id, req.body);
    if (!ok) return res.status(404).json({ mensagem: "Não encontrado" });
    res.json({ mensagem: "Atualizado!" });
  } catch (err) {
    console.error("ERRO PUT /eventos:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ DELETAR evento
app.delete("/eventos/:id", async (req, res) => {
  try {
    const ok = await eventoService.deletarEvento(req.params.id);
    if (!ok) return res.status(404).json({ mensagem: "Não encontrado" });
    res.json({ mensagem: "Excluído!" });
  } catch (err) {
    console.error("ERRO DELETE /eventos:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});



// --- ROOTS AWARDS  ---
// --- ROOTS AWARDS ---
app.get("/awards", async (req, res) => {
  try {
    const lista = await awardsService.listar();
    res.json(lista);
  } catch (err) {
    console.error("ERRO GET /awards:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

app.post("/awards", async (req, res) => {
  try {
    const { titulo } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ erro: "Título é obrigatório" });
    }

    const novo = await awardsService.criar(titulo);
    res.status(201).json(novo);
  } catch (err) {
    console.error("ERRO POST /awards:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

app.post("/awards/:id/votar", async (req, res) => {
  try {
    const atualizado = await awardsService.votar(req.params.id);

    if (!atualizado) {
      return res.status(404).json({ erro: "Award não encontrado" });
    }

    res.json(atualizado);
  } catch (err) {
    console.error("ERRO POST /awards/:id/votar:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// --- FINANÇAS PESSOAIS ---
// ✅ OBTER finanças do usuário
app.get("/financas/:usuario", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const financas = await financasService.listarFinancas(usuario);
    res.json(financas);
  } catch (err) {
    console.error("ERRO GET /financas:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// ✅ ADICIONAR renda
app.post("/financas/:usuario/rendas", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const { descricao, valor } = req.body;

    const resultado = await financasService.adicionarRenda(usuario, descricao, valor);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("ERRO POST /financas/rendas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ ATUALIZAR renda
app.put("/financas/:usuario/rendas/:indice", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const indice = parseInt(req.params.indice);
    const { descricao, valor } = req.body;

    const resultado = await financasService.atualizarRenda(usuario, indice, descricao, valor);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO PUT /financas/rendas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ ATIVAR/DESATIVAR renda
app.patch("/financas/:usuario/rendas/:indice/status", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const indice = parseInt(req.params.indice);
    const { ativo } = req.body;

    const resultado = await financasService.atualizarStatusRenda(usuario, indice, ativo);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO PATCH /financas/rendas/status:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ DELETAR renda
app.delete("/financas/:usuario/rendas/:indice", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const indice = parseInt(req.params.indice);

    const resultado = await financasService.deletarRenda(usuario, indice);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO DELETE /financas/rendas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ ADICIONAR despesa
app.post("/financas/:usuario/despesas", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const { descricao, valor, categoria, parcelada, parcelas, parcelaAtual } = req.body;

    const resultado = await financasService.adicionarDespesa(
      usuario,
      descricao,
      valor,
      categoria,
      parcelada,
      parcelas,
      parcelaAtual
    );
    res.status(201).json(resultado);
  } catch (err) {
    console.error("ERRO POST /financas/despesas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ ATUALIZAR despesa
app.put("/financas/:usuario/despesas/:indice", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const indice = parseInt(req.params.indice);
    const { descricao, valor, categoria, parcelada, parcelas, parcelaAtual } = req.body;

    const resultado = await financasService.atualizarDespesa(
      usuario,
      indice,
      descricao,
      valor,
      categoria,
      parcelada,
      parcelas,
      parcelaAtual
    );
    res.json(resultado);
  } catch (err) {
    console.error("ERRO PUT /financas/despesas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ DELETAR despesa
app.delete("/financas/:usuario/despesas/:indice", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const indice = parseInt(req.params.indice);

    const resultado = await financasService.deletarDespesa(usuario, indice);
    res.json(resultado);
  } catch (err) {
    console.error("ERRO DELETE /financas/despesas:", err);
    res.status(400).json({ erro: err.message });
  }
});

// ✅ OBTER despesas do mês
app.get("/financas/:usuario/despesas/mes/:mes/:ano", async (req, res) => {
  try {
    const usuario = req.params.usuario;
    const mes = parseInt(req.params.mes);
    const ano = parseInt(req.params.ano);

    const despesas = await financasService.obterDespesasMes(usuario, mes, ano);
    res.json(despesas);
  } catch (err) {
    console.error("ERRO GET /financas/despesas/mes:", err);
    res.status(500).json({ erro: "Internal Server Error", detalhe: err.message });
  }
});

// Chama a função para iniciar o servidor
iniciar().catch(err => {
  console.error("❌ Erro ao iniciar servidor:", err);
  process.exit(1);
});


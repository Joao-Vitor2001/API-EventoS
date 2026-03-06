require('dotenv').config(); // Carrega variáveis de ambiente do .env

const express = require('express');
const cors = require('cors'); // Certifique-se de que rodou: npm install cors
const eventoService = require('./SERVICES/eventoService');
const awardsService = require('./SERVICES/awardsService');
const { connectDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// --- INICIALIZAR SERVIDOR ---
async function iniciar() {
  await connectDB(); // Aguarda conexão com MongoDB ANTES de aceitar requisições
  
  // --- CONFIGURAÇÕES ---
  app.use(cors()); // Importante para o navegador não bloquear o site
  app.use(express.json());

// --- ROTAS DA API ---

// Rota inicial de teste
app.get('/', (req, res) => {
  res.send('API do App de Amigos-do-Roots Rodando! 🟢');
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

// Chama a função para iniciar o servidor
iniciar().catch(err => {
  console.error("❌ Erro ao iniciar servidor:", err);
  process.exit(1);
});
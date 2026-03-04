const express = require('express');
const cors = require('cors'); // Certifique-se de que rodou: npm install cors
const eventoService = require('./SERVICES/eventoService');
const awardsService = require('./SERVICES/awardsService');


const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÕES ---
app.use(cors()); // Importante para o navegador não bloquear o site
app.use(express.json());

// --- ROTAS DA API ---

// Rota inicial de teste
app.get('/', (req, res) => {
    res.send('API do App de Amigos Rodando! 🟢');
});

// ✅ LISTAR eventos
app.get('/eventos', (req, res) => {
    const eventos = eventoService.listarEventos();
    res.json(eventos);
});

// ✅ CRIAR evento
app.post('/eventos', (req, res) => {
    const novoEvento = req.body;
    const eventoCriado = eventoService.criarEvento(novoEvento);
    res.status(201).json(eventoCriado);
});

// ✅ EDITAR evento (Usado pelo botão ✏️)
app.put('/eventos/:id', (req, res) => {
    const { id } = req.params;
    const dadosNovos = req.body;
    const sucesso = eventoService.atualizarEvento(id, dadosNovos);
    
    if (sucesso) {
        res.json({ mensagem: "Atualizado!" });
    } else {
        res.status(404).json({ mensagem: "Não encontrado" });
    }
});

// ✅ DELETAR evento (Usado pelo botão 🗑️)
app.delete('/eventos/:id', (req, res) => {
    const { id } = req.params;
    const sucesso = eventoService.deletarEvento(id);
    
    if (sucesso) {
        res.json({ mensagem: "Excluído!" });
    } else {
        res.status(404).json({ mensagem: "Não encontrado" });
    }
});
// --- ROOTS AWARDS  ---
app.get("/awards", (req, res) => {
  res.json(awardsService.listar());
});

app.post("/awards", (req, res) => {
  const { titulo } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ erro: "Título é obrigatório" });
  }

  const novo = awardsService.criar(titulo);
  res.status(201).json(novo);
});

app.post("/awards/:id/votar", (req, res) => {
  const { id } = req.params;
  const atualizado = awardsService.votar(id);

  if (!atualizado) {
    return res.status(404).json({ erro: "Award não encontrado" });
  }

  res.json(atualizado);
});

app.listen(PORT, () => {
    console.log(`🚀 Rodando na porta ${PORT}`);
});
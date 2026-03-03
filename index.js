const express = require('express');
const cors = require('cors'); // Certifique-se de que rodou: npm install cors
const eventoService = require('./SERVICES/eventoService');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

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

// --- LIGAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

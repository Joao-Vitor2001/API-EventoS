const fs = require('fs');
const path = require('path');

// Localiza o arquivo eventos.json dentro da pasta DATA
const caminhoArquivo = path.join(__dirname, '..', 'DATA', 'eventos.json');

// Função para ler os dados do arquivo
function lerArquivo() {
    try {
        const dados = fs.readFileSync(caminhoArquivo, 'utf-8');
        return JSON.parse(dados || "[]");
    } catch (erro) {
        return []; // Se o arquivo não existir, retorna um array vazio
    }
}

// Função para gravar os dados no arquivo
function salvarArquivo(eventos) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify(eventos, null, 2));
}

function listarEventos() {
    return lerArquivo();
}

function criarEvento(novoEvento) {
    const eventos = lerArquivo();
    // Adiciona um ID único para que possamos editar/deletar depois
    const eventoComId = { id: Date.now().toString(), ...novoEvento };
    eventos.push(eventoComId);
    salvarArquivo(eventos);
    return eventoComId;
}

// ✅ Atualiza um evento existente pelo ID
function atualizarEvento(id, dadosNovos) {
    const eventos = lerArquivo();
    const index = eventos.findIndex(e => e.id === id);

    if (index !== -1) {
        eventos[index] = { ...eventos[index], ...dadosNovos, id }; 
        salvarArquivo(eventos);
        return true;
    }
    return false;
}

// ✅ Remove um evento da lista pelo ID
function deletarEvento(id) {
    const eventos = lerArquivo();
    const novaLista = eventos.filter(e => e.id !== id);

    if (eventos.length !== novaLista.length) {
        salvarArquivo(novaLista);
        return true;
    }
    return false;
}

// Exporta as funções para serem usadas no index.js
module.exports = {
    listarEventos,
    criarEvento,
    atualizarEvento,
    deletarEvento,
};

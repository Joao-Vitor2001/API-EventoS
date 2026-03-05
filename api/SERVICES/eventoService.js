const fs = require("fs");
const path = require("path");

const caminhoArquivo = path.join(__dirname, '..', 'DATA', 'eventos.json');

function garantirArquivo() {
    const pasta = path.dirname(caminhoArquivo);
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    if (!fs.existsSync(caminhoArquivo)) fs.writeFileSync(caminhoArquivo, "[]", "utf-8");
}

function lerArquivo() {
    garantirArquivo();
    const dados = fs.readFileSync(caminhoArquivo, "utf-8");
    if (!dados.trim()) return [];              // arquivo vazio -> []
    const parsed = JSON.parse(dados);          // se estiver inválido, vai cair no catch lá embaixo
    return Array.isArray(parsed) ? parsed : []; // se não for array, vira []
}

function salvarArquivo(eventos) {
    garantirArquivo();
    fs.writeFileSync(caminhoArquivo, JSON.stringify(eventos, null, 2), "utf-8");
}

function listarEventos() {
    try {
        return lerArquivo();
    } catch (err) {
        console.error("ERRO lerArquivo(eventos):", err);
        return [];
    }
}

function criarEvento(novoEvento) {
    const eventos = lerArquivo();
    const eventoComId = { id: Date.now().toString(), ...novoEvento };
    eventos.push(eventoComId);
    salvarArquivo(eventos);
    return eventoComId;
}

function atualizarEvento(id, dadosNovos) {
    const eventos = lerArquivo();
    const index = eventos.findIndex((e) => e.id === id);

    if (index !== -1) {
        eventos[index] = { ...eventos[index], ...dadosNovos, id };
        salvarArquivo(eventos);
        return true;
    }
    return false;
}

function deletarEvento(id) {
    const eventos = lerArquivo();
    const novaLista = eventos.filter((e) => e.id !== id);

    if (eventos.length !== novaLista.length) {
        salvarArquivo(novaLista);
        return true;
    }
    return false;
}

module.exports = { listarEventos, criarEvento, atualizarEvento, deletarEvento };
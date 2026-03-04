const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/awards.json');

function lerArquivo() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
}

function salvarArquivo(dados) {
    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
}

function listar() {
    return lerArquivo();
}

function criar(novoAward) {
    const awards = lerArquivo();
    awards.push(novoAward);
    salvarArquivo(awards);
    return novoAward;
}

module.exports = {
    listar,
    criar
};
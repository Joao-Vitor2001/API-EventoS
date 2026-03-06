const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

async function listarEventos() {
  const db = getDB();
  return db.collection("eventos").find({}).sort({ createdAt: -1 }).toArray();
}

async function criarEvento(novoEvento) {
  const db = getDB();

  const doc = {
    ...novoEvento,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("eventos").insertOne(doc);
  return { _id: String(result.insertedId), ...doc };
}

async function atualizarEvento(id, dadosNovos) {
  const db = getDB(); 

  const result = await db.collection("eventos").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...dadosNovos, updatedAt: new Date() } }
  );

  return result.matchedCount > 0;
}

async function deletarEvento(id) {
  const db = getDB();

  const result = await db.collection("eventos").deleteOne({
    _id: new ObjectId(id),
  });

  return result.deletedCount > 0;
}

module.exports = { listarEventos, criarEvento, atualizarEvento, deletarEvento };
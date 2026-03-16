const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

async function listar() {
  const db = getDB();
  return db.collection("awards").find({}).sort({ votos: -1, createdAt: -1 }).toArray();
}

async function criar(titulo) {
  const db = getDB();

  const doc = {
    titulo: String(titulo).trim(),
    votos: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("awards").insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function votar(id) {
  const db = getDB();

  const result = await db.collection("awards").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $inc: { votos: 1 },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: "after" }
  );

  return result;
}

async function excluir(id) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    throw new Error("ID inválido");
  }

  return db.collection("awards").deleteOne({
    _id: new ObjectId(id)
  });
}

module.exports = { listar, criar, votar, excluir };
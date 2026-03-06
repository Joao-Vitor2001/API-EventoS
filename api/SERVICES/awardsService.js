// api/SERVICES/awardsService.js  ✅ (MongoDB)
const { ObjectId } = require("mongodb");
const { getDB } = require("../db");

async function getCol() {
  const db = getDB();
  return db.collection("awards");
}

// ✅ converte _id -> id pro seu frontend continuar usando "id"
function normalizar(doc) {
  return {
    id: String(doc._id),
    titulo: doc.titulo,
    votos: doc.votos || 0,
  };
}

// ✅ GET /awards
async function listar() {
  const col = await getCol();
  const docs = await col.find().sort({ votos: -1, _id: -1 }).toArray();
  return docs.map(normalizar);
}

// ✅ POST /awards  (recebe o título e cria no banco com votos=0)
async function criar(titulo) {
  const col = await getCol();

  const award = {
    titulo: String(titulo).trim(),
    votos: 0,
  };

  const result = await col.insertOne(award);
  return { id: String(result.insertedId), ...award };
}

// ✅ POST /awards/:id/votar  (incrementa votos)
async function votar(id) {
  const col = await getCol();

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { votos: 1 } },
    { returnDocument: "after" }
  );

  if (!result.value) return null;
  return normalizar(result.value);
}

module.exports = { listar, criar, votar };
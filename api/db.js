const { MongoClient } = require("mongodb");

console.log("✨ db.js está sendo carregado...");

const uri = process.env.MONGO_URI;
console.log("🔑 MONGO_URI:", uri ? "definida" : "NÃO DEFINIDA");

const client = new MongoClient(uri, { tls: true });

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db("roots");
  console.log("🟢 MongoDB conectado");
  return db;
}

function getDB() {
  if (!db) throw new Error("DB não conectado ainda");
  return db;
}

console.log("📤 Exportando: connectDB, getDB");
module.exports = { connectDB, getDB };
console.log("✅ db.js carregado com sucesso");
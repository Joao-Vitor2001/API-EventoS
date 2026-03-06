const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
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

module.exports = { connectDB, getDB };
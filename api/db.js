const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

let db;

async function connectDB() {
  if (db) return db;
  
  try {
    await mongoose.connect(uri);
    console.log("🟢 MongoDB conectado com Mongoose");
    db = mongoose.connection;
    return db;
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
    throw error;
  }
}

function getDB() {
  if (!db) throw new Error("DB não conectado ainda");
  return db;
}

module.exports = { connectDB, getDB };
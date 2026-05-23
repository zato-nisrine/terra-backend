// src/config/db.js
// Connexion PostgreSQL avec pool de connexions (pg)

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL ou DIRECT_URL non défini dans .env');
  process.exit(1);
}

const poolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

if (connectionString.includes('supabase.com')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

const replacePlaceholders = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

const normalizeResult = (result) => ({
  ...result,
  insertId: result.rows?.[0]?.id ?? null,
  affectedRows: result.rowCount ?? 0,
});

pool.execute = async (sql, params = []) => {
  const pgSql = replacePlaceholders(sql);
  const result = await pool.query(pgSql, params);
  const meta = normalizeResult(result);
  // Compatibilité mysql2 : insertId / affectedRows sur le tableau rows
  const rows = result.rows;
  rows.insertId = meta.insertId;
  rows.affectedRows = meta.affectedRows;
  return [rows, meta];
};

// Test de connexion au démarrage du serveur
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    console.log('✅ PostgreSQL connecté');
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL :', error.message);
    process.exit(1);
  }
};

// Migrations légères au démarrage (colonnes manquantes en prod)
const runMigrations = async () => {
  try {
    await pool.query(
      'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS date_fin DATE'
    );
    console.log('✅ Migration reservations.date_fin OK');
  } catch (error) {
    console.error('⚠️ Migration reservations.date_fin :', error.message);
  }
};

module.exports = { pool, testConnection, runMigrations };
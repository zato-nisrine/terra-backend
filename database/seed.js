const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL ou DIRECT_URL non défini dans .env');
  process.exit(1);
}

const poolConfig = {
  connectionString,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

if (connectionString.includes('supabase.com')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);
const seedPath = path.join(__dirname, 'seeds.sql');
const sql = fs.readFileSync(seedPath, 'utf8');

const run = async () => {
  if (!sql.trim()) {
    console.log('⚠️  seeds.sql est vide. Aucun seed exécuté.');
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    console.log('🚀 Seed PostgreSQL en cours...');
    await client.query(sql);
    console.log('✅ Seeds terminés.');
  } catch (error) {
    console.error('❌ Échec du seed :', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();

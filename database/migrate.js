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
const schemaPath = path.join(__dirname, 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

const run = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Migration PostgreSQL en cours...');
    await client.query(sql);
    console.log('✅ Migration terminée.');
  } catch (error) {
    console.error('❌ Échec de la migration :', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();

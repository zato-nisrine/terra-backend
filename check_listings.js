const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
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

const checkListings = async () => {
  const client = await pool.connect();
  try {
    console.log('Vérification des listings dans la base de données...');
    const result = await client.query('SELECT id, titre, type_logement, prix, type_prix, est_publie, created_at FROM listings ORDER BY created_at DESC');
    console.log('Total listings:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.table(result.rows);
    } else {
      console.log('Aucun listing trouvé dans la base de données.');
      console.log('Cela peut être dû à:');
      console.log('1. Le seed a été ré-exécuté et a supprimé les données');
      console.log('2. Les listings ont été supprimés manuellement');
      console.log('3. La base de données a été réinitialisée');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

checkListings();

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.split('=');
    if (!key || !value) return;
    const normalizedKey = key.replace(/^--?/, '');
    args[normalizedKey] = value;
  });
  return args;
};

const { email, password, role = 'admin' } = parseArgs();
const validRoles = ['client', 'admin'];

if (!email) {
  console.error('Usage: node scripts/update-user-account.js --email=EMAIL [--password=NEW_PASSWORD] [--role=admin]');
  process.exit(1);
}

if (!validRoles.includes(role)) {
  console.error(`Role invalide : ${role}. Utilisez ${validRoles.join(' ou ')}.`);
  process.exit(1);
}

const updateUser = async () => {
  try {
    const params = [role];
    let sql = 'UPDATE users SET role = $1';

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      params.push(hash);
      sql += ', mot_de_passe = $2';
    }

    params.push(email);
    sql += ' WHERE email = $' + params.length + ' AND est_actif = 1';

    const result = await pool.query(sql, params);

    if (result.rowCount === 0) {
      console.error('Aucun utilisateur actif trouvé avec cet email.');
      process.exit(1);
    }

    console.log(`Utilisateur ${email} mis à jour avec succès.`);
    console.log(`Role = ${role}` + (password ? ', mot de passe mis à jour.' : ''));
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

updateUser();

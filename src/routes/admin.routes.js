// src/routes/admin.routes.js
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Admin routes — à implémenter' });
});

module.exports = router;
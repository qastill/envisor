const express = require('express');
const router = express.Router();
const { estimasiPlts, daftarHarga } = require('../controllers/solarController');

// POST /api/solar/estimate — ukuran sistem, penghematan, dan balik modal
router.post('/estimate', estimasiPlts);

// GET  /api/solar/harga    — harga indikatif per ukuran sistem
router.get('/harga', daftarHarga);

module.exports = router;

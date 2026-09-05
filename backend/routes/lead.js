const express = require('express');
const router = express.Router();
const { terimaLead } = require('../controllers/leadController');

// POST /api/lead — permintaan penawaran dari halaman marketing
router.post('/', terimaLead);

module.exports = router;

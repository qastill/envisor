const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');

// POST /api/report/generate — generate plain-text email report
router.post('/generate', generateReport);

module.exports = router;

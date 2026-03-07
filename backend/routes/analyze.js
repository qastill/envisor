const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeDevice, analyzeBill, buildSummary } = require('../controllers/analyzeController');

// POST /api/analyze/device  — scan a single appliance image
router.post('/device', upload.single('image'), analyzeDevice);

// POST /api/analyze/bill    — extract amount from a PLN bill image
router.post('/bill', upload.single('image'), analyzeBill);

// POST /api/analyze/summary — compute full analysis from all rooms data
router.post('/summary', buildSummary);

module.exports = router;

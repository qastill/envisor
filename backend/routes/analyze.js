const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {analyzeDevice, analyzeRoom, analyzeBill, buildSummary, analyzeNameplate, analyzeMeterCondition} = require('../controllers/analyzeController');

// POST /api/analyze/device  — scan a single appliance image (multipart)
router.post('/device', upload.single('image'), analyzeDevice);

// POST /api/analyze/room    — scan appliance from base64 JSON body (called by frontend)
router.post('/room', express.json({ limit: '10mb' }), analyzeRoom);

// POST /api/analyze/bill    — extract amount from a PLN bill image
router.post('/bill', upload.single('image'), analyzeBill);

// POST /api/analyze/summary — compute full analysis from all rooms data
router.post('/summary', buildSummary);

// POST /api/analyze/nameplate — read nameplate/label sticker for exact specs
router.post('/nameplate', express.json({ limit: '10mb' }), analyzeNameplate);

// Analyze KWH meter condition
router.post('/meter-condition', express.json({ limit: '10mb' }), analyzeMeterCondition);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auditTagihanHandler } = require('../controllers/billAuditController');

// POST /api/audit/tagihan — periksa kewajaran tagihan PLN
router.post('/tagihan', auditTagihanHandler);

module.exports = router;

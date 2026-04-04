require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── Static Frontend (from project root) ──────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRoutes);
app.use('/api/report', reportRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Catch-all: serve root index.html ─────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ── Start (local only) ───────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ EnVisor AI running at http://localhost:${PORT}`);
  });
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/report');
const leadRoutes = require('./routes/lead');
const solarRoutes = require('./routes/solar');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(express.static(path.join(__dirname, '..')));

app.use('/api/analyze', analyzeRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/lead', leadRoutes);
app.use('/api/solar', solarRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EnVisor AI running at http://localhost:${PORT}`);
  });
}

module.exports = app;

# ⚡ EnVisor AI — Electricity Audit App

AI-powered household electricity audit tool. Users scan their appliances via photo,
and the app estimates monthly electricity costs with full analysis.

---

## 📁 Project Structure

```
envisor-ai/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── routes/
│   │   ├── analyze.js             # POST /api/analyze/device|bill|summary
│   │   └── report.js              # POST /api/report/generate
│   ├── controllers/
│   │   ├── analyzeController.js   # Image AI analysis + summary logic
│   │   └── reportController.js    # Email report builder
│   ├── services/
│   │   └── aiService.js           # Anthropic Claude Vision API calls
│   ├── middleware/
│   │   └── upload.js              # Multer file upload config
│   └── config/
│       └── electricity.js         # PLN tariff rates & kWh calculations
├── frontend/
│   └── public/
│       ├── index.html             # Main app HTML
│       ├── css/
│       │   └── style.css          # All styles
│       └── js/
│           └── app.js             # Frontend logic (state, UI, API calls)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run in production
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze/device` | Analyze appliance photo → returns name, watts, cost |
| `POST` | `/api/analyze/bill` | Extract amount from PLN bill photo |
| `POST` | `/api/analyze/summary` | Full analysis from all rooms data |
| `POST` | `/api/report/generate` | Generate plain-text email report |
| `GET`  | `/api/health` | Health check |

### POST /api/analyze/device
- Body: `multipart/form-data` with `image` (file) and `va` (number, optional)
- Response: `{ success, device: { name, watts, dailyHours, emoji, kwh, costPerMonth, costFormatted } }`

### POST /api/analyze/summary
- Body: `application/json`
```json
{
  "rooms": [{ "id": "r1", "n": "Ruang Tamu", "i": "🛋️", "devs": [{ "n": "AC", "w": 900, "h": 8 }] }],
  "plnVa": 1300,
  "jumlahOrang": 3,
  "actualBill": 450000
}
```

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **AI**: Anthropic Claude Vision API (claude-opus-4-5)
- **File uploads**: Multer (memory storage)
- **Frontend**: Vanilla JS + CSS (no framework)

---

## 📝 Notes

- Photos are processed in-memory and **never saved to disk**
- Without `ANTHROPIC_API_KEY`, the frontend falls back to mock device data
- The frontend `app.js` has an `API_URL` constant — leave it empty (`''`) to use
  the same-origin Express server, or set it to your deployed URL (e.g. Railway)

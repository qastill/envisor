# ⚡ EnVisor AI — Electricity Audit App

AI-powered household electricity audit tool. Users scan their appliances via photo,
and the app estimates monthly electricity costs with full analysis.

---

## 📁 Project Structure

```
envisor-ai/
├── backend/
│   ├── server.js                   # Express entry point
│   ├── routes/
│   │   ├── analyze.js              # POST /api/analyze/*
│   │   ├── report.js               # POST /api/report/generate
│   │   ├── lead.js                 # POST /api/lead
│   │   ├── solar.js                # POST /api/solar/estimate, GET /api/solar/harga
│   │   └── audit.js                # POST /api/audit/tagihan
│   ├── controllers/
│   │   ├── analyzeController.js    # Image AI analysis + summary logic
│   │   ├── reportController.js     # Email report builder
│   │   ├── leadController.js       # Quote-request capture
│   │   ├── solarController.js      # Server-side PLTS sizing
│   │   └── billAuditController.js  # PLN bill audit rules engine
│   ├── services/aiService.js       # Vision API calls
│   ├── middleware/upload.js        # Multer file upload config
│   └── config/
│       ├── electricity.js          # PLN tariffs & kWh calculations
│       └── solar.js                # Bridge to the shared data module
├── data/
│   ├── site-data.js                # Single source of truth (UMD: browser + Node)
│   └── content.js                  # Panduan & blog copy
├── scripts/build.js                # Generates static pages + sitemap
├── css/
│   ├── style.css                   # Audit wizard (index.html) only
│   └── site.css                    # Marketing design system
├── js/
│   ├── app.js                      # Wizard logic
│   └── site.js                     # Nav/footer injection, lead forms
├── index.html                      # AI audit wizard
├── surya.html                      # PLTS Atap + calculator
├── harga.html                      # Pricing + financing simulator
├── audit-tagihan.html              # PLN bill audit tool
├── monitoring.html hems.html rec.html banding.html
├── bisnis.html slo.html kuesioner.html privacy.html
├── panduan.html blog.html lokasi.html          # generated hubs
├── panduan/ blog/ lokasi/                      # generated detail pages
└── sitemap.xml robots.txt                      # generated
```

Anything under `panduan/`, `blog/`, `lokasi/`, the three hub pages, `sitemap.xml`
and `robots.txt` is **generated** — edit `data/content.js` or `data/site-data.js`
and re-run `npm run build`, never the generated HTML directly.

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

### 4. Build the generated pages
```bash
npm run build
```
Regenerates `panduan/`, `blog/`, `lokasi/`, the hub pages, `sitemap.xml` and
`robots.txt`. Run this after editing `data/content.js` or `data/site-data.js`.

### 5. Run in production
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
| `POST` | `/api/lead` | Capture a quote request from the marketing pages |
| `POST` | `/api/solar/estimate` | PLTS sizing, savings and payback |
| `GET`  | `/api/solar/harga` | Indicative installed price per system size |
| `POST` | `/api/audit/tagihan` | Rule-based PLN bill audit |
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

## ☀️ Solar economics model

All PLTS numbers come from one place — `data/site-data.js` — which the browser,
the build script and the API each load, so a page, a quote and an API response
can never disagree.

Three modelling choices matter, and they are the reason EnVisor's figures come
out **lower** than a typical vendor brochure:

1. **Self-consumption is a saturating curve, not a flat percentage.**
   Since Permen ESDM 2/2024 exported surplus is no longer credited, so only
   energy consumed at the moment it is produced has value. Energy actually used
   is modelled as `daytimeLoad × (1 − e^(−production / daytimeLoad))`: with a
   small array almost every kWh is absorbed, and as the array grows past the
   daytime load an increasing share is simply wasted.

2. **CAPEX has a fixed component.** Permits, SLO, protection and mobilisation
   do not shrink with array size, so cost is `fixed + perKwp × kWp`. This is why
   installed cost falls from ~Rp 16 M/kWp at 2 kWp to under Rp 9 M/kWp at 20 kWp,
   and why very small systems rarely pay back.

3. **Size is chosen by maximising NPV**, not by hitting an offset target.
   Because wasted output rises with array size while cost does not fall, there is
   a single best size; going past it lowers the return. `ukuranOptimal()` searches
   for it, and `hitungPlts()` reports `layak: false` when no size has a positive
   NPV — the calculator says so plainly instead of recommending a bad investment.

## 🧾 Bill audit engine

`backend/controllers/billAuditController.js` is deliberately **rule-based, not
AI**. Every finding cites a traceable tariff rule, so a customer can take it to
PLN and it can be checked or disputed. It covers minimum billing (40 jam nyala),
effective tariff vs. official rate, the 10% PBJT ceiling, sudden spikes against
the median, flat repeated bills (estimated readings), load factor, and tariff
class mismatches.

One-off findings are max-ed rather than summed, since several rules can describe
the same rupiah on the same bill; recurring findings are summed separately.

## 📝 Notes

- Photos are processed in-memory and **never saved to disk**
- Without `ANTHROPIC_API_KEY`, the frontend falls back to mock device data
- The frontend `app.js` has an `API_URL` constant — leave it empty (`''`) to use
  the same-origin Express server, or set it to your deployed URL (e.g. Railway)
- Leads are written to structured logs; set `LEAD_WEBHOOK_URL` to also forward
  them to a CRM, Google Sheet or automation endpoint
- `css/style.css` styles the audit wizard and `css/site.css` styles the
  marketing pages. They are kept apart on purpose — the older pages carry inline
  styles that would clash with the design system, so those pages use a
  self-contained footer with `evf-` prefixed classes instead

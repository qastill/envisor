#!/usr/bin/env python3
"""Generate the EnVisor Innovation Gateway 2026 proposal (PLN BusDev template).

Output: EnVisor-Proposal-IG-2026.pptx (16:9), branded, 6-section structure.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# ---- palette ----
DARK   = RGBColor(0x0F, 0x17, 0x2A)
SLATE  = RGBColor(0x1E, 0x29, 0x3B)
AMBER  = RGBColor(0xF5, 0x9E, 0x0B)
RED    = RGBColor(0xEF, 0x44, 0x44)
CYAN   = RGBColor(0x06, 0xB6, 0xD4)
GREEN  = RGBColor(0x10, 0xB9, 0x81)
MID    = RGBColor(0x64, 0x74, 0x8B)
LIGHT  = RGBColor(0xE2, 0xE8, 0xF0)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
PAPER  = RGBColor(0xF7, 0xF8, 0xFC)
INK    = RGBColor(0x1F, 0x2A, 0x37)

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height
BLANK = prs.slide_layouts[6]

def slide(bg=WHITE):
    s = prs.slides.add_slide(BLANK)
    r = s.shapes.add_shape(1, 0, 0, SW, SH)
    r.fill.solid(); r.fill.fore_color.rgb = bg
    r.line.fill.background()
    r.shadow.inherit = False
    return s

def box(s, l, t, w, h, fill=None, line=None, line_w=1.0, radius=False):
    shp = s.shapes.add_shape(5 if radius else 1, l, t, w, h)
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line; shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp

def text(s, l, t, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         space=4, line_spacing=1.0):
    """runs: list of paragraphs; each paragraph is list of (txt,size,color,bold)."""
    tb = s.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame; tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Pt(2)
    tf.margin_top = tf.margin_bottom = Pt(2)
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space)
        p.line_spacing = line_spacing
        for (txt, size, color, bold) in para:
            r = p.add_run(); r.text = txt
            r.font.size = Pt(size); r.font.bold = bold
            r.font.color.rgb = color
            r.font.name = 'Calibri'
    return tb

def header(s, section, title, idx, dark=False):
    accent = AMBER
    box(s, 0, 0, SW, Inches(1.18), fill=DARK if dark else WHITE)
    box(s, 0, 0, Inches(0.16), Inches(1.18), fill=accent)
    text(s, Inches(0.55), Inches(0.16), Inches(11), Inches(0.32),
         [[(section, 11.5, accent, True)]])
    text(s, Inches(0.55), Inches(0.45), Inches(11.5), Inches(0.62),
         [[(title, 25, WHITE if dark else INK, True)]])
    # page chip
    text(s, Inches(12.0), Inches(0.42), Inches(1.0), Inches(0.4),
         [[(idx, 12, MID, True)]], align=PP_ALIGN.RIGHT)
    # footer
    text(s, Inches(0.55), Inches(7.05), Inches(4), Inches(0.3),
         [[("EnVisor.AI  ·  Innovation Gateway 2026", 9, MID, False)]])

def bullets(s, l, t, w, items, size=13.5, color=INK, gap=7, marker="—", mcolor=AMBER):
    runs = []
    for it in items:
        runs.append([(marker + "  ", size, mcolor, True), (it, size, color, False)])
    text(s, l, t, w, Inches(4.5), runs, space=gap, line_spacing=1.04)

def chip(s, l, t, label, fill, tcolor=WHITE, w=Inches(2.0)):
    b = box(s, l, t, w, Inches(0.42), fill=fill, radius=True)
    tf = b.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label; r.font.size = Pt(11); r.font.bold = True
    r.font.color.rgb = tcolor; r.font.name = 'Calibri'
    return b

def card(s, l, t, w, h, title, lines, fill=PAPER, tcolor=INK, accent=AMBER,
         tsize=15, lsize=12.5):
    box(s, l, t, w, h, fill=fill, line=LIGHT, radius=True)
    box(s, l, t, Inches(0.07), h, fill=accent)
    runs = [[(title, tsize, accent, True)]]
    for ln in lines:
        runs.append([(ln, lsize, tcolor, False)])
    text(s, l + Inches(0.22), t + Inches(0.16), w - Inches(0.4), h - Inches(0.3),
         runs, space=5, line_spacing=1.05)

# ============================================================ SLIDE 1 — COVER
s = slide(DARK)
box(s, 0, 0, SW, SH, fill=DARK)
box(s, 0, Inches(6.9), SW, Inches(0.6), fill=SLATE)
box(s, Inches(0.7), Inches(0.7), Inches(4.2), Inches(0.46), fill=None, line=AMBER, line_w=1.25, radius=True)
text(s, Inches(0.7), Inches(0.74), Inches(4.2), Inches(0.4),
     [[("⚡ INNOVATION GATEWAY 2026", 12, AMBER, True)]], align=PP_ALIGN.CENTER)
text(s, Inches(0.7), Inches(1.7), Inches(12), Inches(0.4),
     [[("Kategori: Next-Gen Business Development  |  Proposal", 13, MID, True)]])
text(s, Inches(0.7), Inches(2.25), Inches(12), Inches(1.6),
     [[("EnVisor", 64, WHITE, True)],
      [("AI Energy & Asset Intelligence", 30, AMBER, True)]], line_spacing=1.0)
text(s, Inches(0.72), Inches(4.4), Inches(11.5), Inches(0.9),
     [[("Dari audit listrik rumah tangga berbasis foto, ke inspeksi aset", 16, LIGHT, False)],
      [("kelistrikan & efisiensi energi industri bertenaga AI 3D vision.", 16, LIGHT, False)]],
     line_spacing=1.1)
text(s, Inches(0.72), Inches(5.7), Inches(12), Inches(0.9),
     [[("PT PLN (Persero) — Subholding / Anak Perusahaan", 13, WHITE, True)],
      [("Tim Inovator: <Nama 1> | <Nama 2> | <Nama 3>      ·      <Tanggal>", 12, MID, False)]],
     space=4)
text(s, Inches(11.0), Inches(7.0), Inches(2.1), Inches(0.4),
     [[("www.pln.co.id", 11, MID, False)]], align=PP_ALIGN.RIGHT)

# ============================================================ SLIDE 2 — EXEC SUMMARY
s = slide(PAPER)
header(s, "EXECUTIVE SUMMARY", "Ringkasan Eksekutif", "2 / 18")
cw, ch = Inches(3.95), Inches(1.62)
gx, gy = Inches(0.55), Inches(1.45)
card(s, gx, gy, cw, ch, "PROBLEM / OPPORTUNITY",
     ["Rumah tangga & industri kehilangan uang dari listrik tak terukur",
      "dan aset kelistrikan yang rusak tanpa terdeteksi dini."], accent=RED)
card(s, gx+cw+Inches(0.2), gy, cw, ch, "SOLUTION",
     ["Platform AI vision dua-lini: EnVisor Home (audit foto) +",
      "EnVisor Industri (inspeksi aset & efisiensi energi)."] , accent=AMBER)
card(s, gx+2*(cw+Inches(0.2)), gy, cw, ch, "TARGET CUSTOMER",
     ["84 jt+ rumah tangga; unit operasional PLN;",
      "pelanggan industri besar & kawasan industri."], accent=CYAN)
gy2 = gy + ch + Inches(0.22)
card(s, gx, gy2, cw, ch, "BUSINESS VALUE",
     ["TAM Rp 11,4 T · SAM Rp 3,4 T · SOM Rp 225 M (5 thn)",
      "Revenue Y5 ~Rp 220 M · IRR >28% · payback ~3,8 thn."], accent=GREEN)
card(s, gx+cw+Inches(0.2), gy2, cw, ch, "TRACTION & TIMELINE",
     ["EnVisor Home sudah live (PWA + AI vision).",
      "GTM 3 fase: Validasi → Ekspansi → Scale-Up."], accent=AMBER)
card(s, gx+2*(cw+Inches(0.2)), gy2, cw, ch, "WHY NOW",
     ["AI vision matang & cost-competitive; agenda NZE 2060",
      "& digitalisasi PLN; tekanan efisiensi energi industri."], accent=RED)
box(s, gx, Inches(6.05), Inches(12.25), Inches(0.62), fill=DARK, radius=True)
text(s, gx+Inches(0.25), Inches(6.12), Inches(12), Inches(0.5),
     [[("Elevator pitch:  ", 13, AMBER, True),
       ("Satu mesin AI vision — dari foto kulkas di dapur hingga hotspot di gardu induk — mencegah biaya & gangguan sebelum terjadi.", 13, WHITE, False)]],
     anchor=MSO_ANCHOR.MIDDLE)

# ============================================================ SLIDE 3 — PROBLEM
s = slide()
header(s, "SECTION A · PROBLEM & OPPORTUNITY", "Problem / Opportunity Statement", "3 / 18")
text(s, Inches(0.55), Inches(1.4), Inches(12), Inches(0.4),
     [[("Evidence → Pain → Consequence → Opportunity", 13, AMBER, True)]])
card(s, Inches(0.55), Inches(1.95), Inches(6.0), Inches(2.0), "1 · EVIDENCE (data)",
     ["89,1 jt pelanggan PLN (2023, +4,1% YoY).",
      "Segmen industri = 30,7% konsumsi (88.588 GWh).",
      "558.994 trafo distribusi; ribuan gardu & km jaringan.",
      "Pasar global machine vision ~USD 16 M (2025)."])
card(s, Inches(6.75), Inches(1.95), Inches(6.05), Inches(2.0), "2 · PAIN (pelanggan)",
     ["RT tak tahu perangkat penyebab tagihan mahal.",
      "Audit energi profesional mahal → tak terjangkau massal.",
      "Inspeksi aset masih manual & terjadwal.",
      "Hotspot / degradasi isolasi sering terlewat."], accent=RED)
card(s, Inches(0.55), Inches(4.15), Inches(6.0), Inches(2.0), "3 · CONSEQUENCE",
     ["Susut energi & tagihan anomali tak terjelaskan.",
      "Gangguan tak terduga → SAIDI/SAIFI naik.",
      "Downtime & biaya maintenance reaktif tinggi.",
      "Peluang efisiensi energi industri tak tergarap."], accent=RED)
card(s, Inches(6.75), Inches(4.15), Inches(6.05), Inches(2.0), "4 · OPPORTUNITY (PLN)",
     ["Layanan energy-advisory massal berbasis AI.",
      "Predictive maintenance untuk aset PLN sendiri.",
      "Lini bisnis baru: Inspection & Audit-as-a-Service.",
      "Posisi PLN sebagai pionir AI energy intelligence."], accent=GREEN)

# ============================================================ SLIDE 4 — STRATEGIC ALIGNMENT
s = slide(PAPER)
header(s, "SECTION A · PROBLEM & OPPORTUNITY", "Strategic Alignment dengan PLN & IG 2026", "4 / 18")
items = [
    ("Transformasi PLN 2.0 — Digitalisasi", "AI vision & data sebagai tulang punggung operasi & layanan pelanggan."),
    ("NZE 2060 & Transisi Energi", "Efisiensi energi industri & rumah tangga menurunkan emisi; mendukung dedieselisasi."),
    ("RUPTL & Keandalan Sistem", "Predictive maintenance menekan susut & meningkatkan keandalan (SAIDI/SAIFI)."),
    ("Agenda Danantara & Nilai Korporasi", "Lini bisnis digital baru bernilai tinggi & scalable bagi PLN Group."),
    ("Tema IG 2026 — Next-Gen BusDev", "Model bisnis baru (SaaS + as-a-Service) di luar core penjualan kWh."),
]
y = Inches(1.5)
for title, desc in items:
    box(s, Inches(0.55), y, Inches(12.25), Inches(0.92), fill=WHITE, line=LIGHT, radius=True)
    box(s, Inches(0.55), y, Inches(0.07), Inches(0.92), fill=AMBER)
    text(s, Inches(0.8), y+Inches(0.1), Inches(4.3), Inches(0.75),
         [[(title, 14, INK, True)]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, Inches(5.2), y+Inches(0.1), Inches(7.4), Inches(0.75),
         [[(desc, 12.5, MID, False)]], anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(1.04)

# ============================================================ SLIDE 5 — WHY NOW
s = slide()
header(s, "SECTION A · PROBLEM & OPPORTUNITY", "Why Now — Timing & Urgensi", "5 / 18")
text(s, Inches(0.55), Inches(1.4), Inches(12), Inches(0.4),
     [[("Trend → Trigger → Window → Cost of Delay", 13, AMBER, True)]])
cols = [
    ("TREND", "AI deep-learning vision matang & makin murah; drone & kamera termal terjangkau.", CYAN),
    ("TRIGGER", "Mandat digitalisasi PLN, target NZE 2060, & tekanan efisiensi biaya operasi.", AMBER),
    ("WINDOW", "2–4 tahun first-mover sebelum vendor global & startup masuk pasar Indonesia.", GREEN),
    ("COST OF DELAY", "Susut & gangguan terus berjalan; pesaing menguasai data & standar lebih dulu.", RED),
]
cw = Inches(2.95)
x = Inches(0.55)
for label, desc, c in cols:
    box(s, x, Inches(2.0), cw, Inches(3.4), fill=PAPER, line=LIGHT, radius=True)
    box(s, x, Inches(2.0), cw, Inches(0.62), fill=c, radius=True)
    text(s, x, Inches(2.08), cw, Inches(0.5), [[(label, 13, WHITE, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.2), Inches(2.85), cw-Inches(0.4), Inches(2.4),
         [[(desc, 13, INK, False)]], line_spacing=1.15)
    x += cw + Inches(0.2)

# ============================================================ SLIDE 6 — SOLUTION
s = slide(DARK)
header(s, "SECTION B · SOLUTION", "Proposed Solution & Value Proposition", "6 / 18", dark=True)
# left: home
box(s, Inches(0.55), Inches(1.5), Inches(6.0), Inches(4.7), fill=SLATE, line=AMBER, radius=True)
chip(s, Inches(0.8), Inches(1.75), "LIVE · B2C", AMBER, DARK, w=Inches(1.9))
text(s, Inches(0.8), Inches(2.35), Inches(5.5), Inches(0.6), [[("EnVisor Home", 24, WHITE, True)]])
text(s, Inches(0.8), Inches(2.95), Inches(5.5), Inches(0.4), [[("Audit Listrik Rumah Berbasis Foto", 13, AMBER, True)]])
bullets(s, Inches(0.8), Inches(3.5), Inches(5.4),
        ["Foto elektronik → AI deteksi watt & estimasi biaya",
         "Bandingkan dengan tagihan PLN → deteksi anomali",
         "Diagnosa & rekomendasi hemat energi otomatis",
         "Laporan premium Rp 99rb + lead layanan PLN"],
        size=13, color=LIGHT, mcolor=AMBER, gap=9)
# right: industri
box(s, Inches(6.78), Inches(1.5), Inches(6.0), Inches(4.7), fill=SLATE, line=CYAN, radius=True)
chip(s, Inches(7.03), Inches(1.75), "NEW · B2B/B2G", CYAN, DARK, w=Inches(2.2))
text(s, Inches(7.03), Inches(2.35), Inches(5.5), Inches(0.6), [[("EnVisor Industri", 24, WHITE, True)]])
text(s, Inches(7.03), Inches(2.95), Inches(5.5), Inches(0.4), [[("AI Vision Energy & Asset Intelligence", 13, CYAN, True)]])
bullets(s, Inches(7.03), Inches(3.5), Inches(5.5),
        ["Inspeksi termal+RGB aset dengan AI defect detection",
         "Patroli gardu & jaringan via drone / robot 3D vision",
         "Audit efisiensi energi pabrik (ISO 50001) AI+IoT",
         "Predictive maintenance & digital twin aset"],
        size=13, color=LIGHT, mcolor=CYAN, gap=9)
text(s, Inches(0.55), Inches(6.35), Inches(12), Inches(0.5),
     [[("UVP:  ", 13, AMBER, True),
       ("satu model AI vision lintas skala (rumah → industri) + aset & akses regulasi PLN = unfair advantage yang sulit ditiru.", 13, LIGHT, False)]])

# ============================================================ SLIDE 7 — SOLOMON MAP / NOVELTY
s = slide(PAPER)
header(s, "SECTION B · SOLUTION", "Unsur Kebaruan — Adaptasi Solomon 3D", "7 / 18")
text(s, Inches(0.55), Inches(1.35), Inches(12.2), Inches(0.45),
     [[("Mengadaptasi 4 pilar teknologi Solomon 3D (solomon-3d.com) dari quality-control manufaktur ke asset & energy intelligence PLN.", 12.5, MID, False)]])
rows = [
    ("SolVision", "Deteksi cacat permukaan AI", "ThermoVision AI", "Hotspot, koneksi longgar, korona, degradasi isolasi", RED),
    ("SolMotion + SolScan", "Robot dipandu 3D vision", "AssetScan 3D / Drone Patrol", "Patroli gardu & jaringan: vegetasi, retak isolator, korosi", CYAN),
    ("3D Camera / AccuPick", "Capture geometri 3D", "Digital Twin Aset", "Model 3D gardu untuk monitoring & simulasi", GREEN),
    ("META-aivi", "AR + AI frontline worker", "AR FieldAssist", "Panduan AR untuk teknisi PLN di lapangan", AMBER),
]
# table header
hy = Inches(1.95)
cols_x = [Inches(0.55), Inches(3.35), Inches(6.0), Inches(9.2)]
cols_w = [Inches(2.7), Inches(2.5), Inches(3.1), Inches(3.6)]
heads = ["Teknologi Solomon 3D", "Domain asli", "Modul EnVisor", "Fungsi (energi)"]
box(s, Inches(0.55), hy, Inches(12.25), Inches(0.5), fill=DARK, radius=True)
for x, w, h in zip(cols_x, cols_w, heads):
    text(s, x+Inches(0.1), hy+Inches(0.06), w, Inches(0.4), [[(h, 12, WHITE, True)]], anchor=MSO_ANCHOR.MIDDLE)
y = hy + Inches(0.6)
for sol, dom, mod, fn, c in rows:
    box(s, Inches(0.55), y, Inches(12.25), Inches(0.95), fill=WHITE, line=LIGHT, radius=True)
    text(s, cols_x[0]+Inches(0.1), y, cols_w[0], Inches(0.95), [[(sol, 13, c, True)]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, cols_x[1]+Inches(0.1), y, cols_w[1], Inches(0.95), [[(dom, 11.5, MID, False)]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, cols_x[2]+Inches(0.1), y, cols_w[2], Inches(0.95), [[(mod, 13, INK, True)]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, cols_x[3]+Inches(0.1), y, cols_w[3], Inches(0.95), [[(fn, 11.5, MID, False)]], anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(1.02)

# ============================================================ SLIDE 8 — HOW IT WORKS
s = slide()
header(s, "SECTION B · SOLUTION", "How It Works — Mechanism & Customer Journey", "8 / 18")
steps = [
    ("CAPTURE", "Kamera termal/RGB, drone, atau HP teknisi mengambil citra aset secara periodik / on-demand."),
    ("AI ANALYZE", "Model deep-learning EnVisor deteksi anomali, ukur severity, klasifikasi jenis cacat/pemborosan."),
    ("PREDICT", "Engine prediktif hitung sisa umur aset & probabilitas gangguan; data ke digital twin."),
    ("ACT", "Dashboard + alert prioritas & panduan AR → maintenance sebelum gangguan terjadi."),
]
cw = Inches(2.95); x = Inches(0.55)
for i, (label, desc) in enumerate(steps):
    box(s, x, Inches(2.2), cw, Inches(2.9), fill=PAPER, line=LIGHT, radius=True)
    c = box(s, x+Inches(0.2), Inches(1.95), Inches(0.62), Inches(0.62), fill=AMBER, radius=True)
    text(s, x+Inches(0.2), Inches(2.0), Inches(0.62), Inches(0.5), [[(str(i+1), 20, WHITE, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.2), Inches(2.75), cw-Inches(0.4), Inches(0.4), [[(label, 14, INK, True)]])
    text(s, x+Inches(0.2), Inches(3.2), cw-Inches(0.4), Inches(1.8), [[(desc, 12.5, MID, False)]], line_spacing=1.12)
    if i < 3:
        text(s, x+cw-Inches(0.05), Inches(3.2), Inches(0.4), Inches(0.5), [[("→", 22, AMBER, True)]])
    x += cw + Inches(0.2)
text(s, Inches(0.55), Inches(5.5), Inches(12), Inches(0.5),
     [[("Touchpoint kunci: onboarding cepat (foto / pasang kamera), hasil dalam menit, dan integrasi ke sistem maintenance existing PLN.", 12.5, MID, False)]])

# ============================================================ SLIDE 9 — VALIDATION
s = slide(PAPER)
header(s, "SECTION B · SOLUTION", "Customer Validation & Traction", "9 / 18")
card(s, Inches(0.55), Inches(1.5), Inches(6.0), Inches(2.1), "HIPOTESIS → METODE",
     ["H1: RT mau audit listrik mandiri jika gratis & mudah.",
      "H2: Unit PLN butuh deteksi dini hotspot aset.",
      "Metode: peluncuran EnVisor Home + wawancara unit",
      "operasional & calon pelanggan industri."], accent=CYAN)
card(s, Inches(6.75), Inches(1.5), Inches(6.05), Inches(2.1), "HASIL (awal)",
     ["EnVisor Home live sebagai PWA dengan AI vision.",
      "Funnel berbayar Rp 99rb tervalidasi (gate pembayaran).",
      "Minat kuat dari sisi inspeksi aset & efisiensi industri.",
      "<isi angka pilot: jumlah user, konversi, NPS>"], accent=GREEN)
box(s, Inches(0.55), Inches(3.85), Inches(12.25), Inches(2.2), fill=WHITE, line=LIGHT, radius=True)
text(s, Inches(0.8), Inches(4.0), Inches(11.5), Inches(0.4), [[("Traction metrics (lengkapi dengan data pilot riil)", 14, AMBER, True)]])
metrics = [("Pengguna Home", "<n>"), ("Konversi premium", "<%>"), ("Pilot industri", "<n>"), ("LOI / MoU", "<n>")]
mx = Inches(0.9)
for label, val in metrics:
    box(s, mx, Inches(4.55), Inches(2.7), Inches(1.25), fill=DARK, radius=True)
    text(s, mx, Inches(4.75), Inches(2.7), Inches(0.6), [[(val, 26, AMBER, True)]], align=PP_ALIGN.CENTER)
    text(s, mx, Inches(5.35), Inches(2.7), Inches(0.4), [[(label, 12, LIGHT, False)]], align=PP_ALIGN.CENTER)
    mx += Inches(2.95)
text(s, Inches(0.55), Inches(6.25), Inches(12), Inches(0.4),
     [[("Catatan: sajikan sample size & hasil apa adanya (termasuk negatif) pada sesi panel.", 11.5, MID, False)]])

# ============================================================ SLIDE 10 — TARGET MARKET
s = slide()
header(s, "SECTION C · MARKET & COMPETITION", "Target Market & Segmentasi", "10 / 18")
segs = [
    ("Rumah Tangga (beachhead B2C)", "RT ≥1300 VA, urban, melek digital. Pain: tagihan mahal tak terjelaskan. Fit: audit foto gratis + laporan premium.", AMBER),
    ("Unit Operasional PLN (B2G)", "Unit distribusi & transmisi pengelola gardu/jaringan. Pain: inspeksi manual & gangguan tak terduga. Fit: predictive maintenance.", CYAN),
    ("Pelanggan Industri Besar (B2B)", "Pabrik & kawasan industri, konsumsi listrik tinggi. Pain: biaya energi & downtime. Fit: audit efisiensi shared-savings.", GREEN),
]
y = Inches(1.55)
for title, desc, c in segs:
    box(s, Inches(0.55), y, Inches(12.25), Inches(1.45), fill=PAPER, line=LIGHT, radius=True)
    box(s, Inches(0.55), y, Inches(0.09), Inches(1.45), fill=c)
    text(s, Inches(0.85), y+Inches(0.18), Inches(11.6), Inches(0.4), [[(title, 16, INK, True)]])
    text(s, Inches(0.85), y+Inches(0.68), Inches(11.6), Inches(0.7), [[(desc, 13, MID, False)]], line_spacing=1.1)
    y += Inches(1.6)
text(s, Inches(0.55), Inches(6.55), Inches(12), Inches(0.4),
     [[("Prioritas: ", 13, AMBER, True),
       ("Home dulu (volume & brand) → Unit PLN (pilot internal) → Industri (skala nilai).", 13, INK, False)]])

# ============================================================ SLIDE 11 — TAM SAM SOM
s = slide(PAPER)
header(s, "SECTION C · MARKET & COMPETITION", "Market Size — TAM / SAM / SOM", "11 / 18")
# funnel left
fy = Inches(1.6)
funnel = [("TAM  ·  Rp 11,4 T", "Total pasar energy & asset intelligence Indonesia / thn", RGBColor(0x4F,0x46,0xE5), Inches(4.3)),
          ("SAM  ·  Rp 3,4 T", "Dapat dilayani model bisnis EnVisor", RGBColor(0x0E,0x74,0x90), Inches(3.6)),
          ("SOM  ·  Rp 225 M", "Realistis tertangkap dalam 5 tahun", AMBER, Inches(2.9))]
for label, desc, c, w in funnel:
    box(s, Inches(0.55), fy, w, Inches(1.0), fill=c, radius=True)
    text(s, Inches(0.55), fy+Inches(0.12), w, Inches(0.45), [[(label, 18, WHITE, True)]], align=PP_ALIGN.CENTER)
    text(s, Inches(0.55), fy+Inches(0.6), w, Inches(0.35), [[(desc, 9.5, WHITE, False)]], align=PP_ALIGN.CENTER)
    fy += Inches(1.16)
# table right
tx = Inches(5.1)
box(s, tx, Inches(1.6), Inches(7.7), Inches(0.5), fill=DARK, radius=True)
th = ["Segmen", "TAM", "SAM", "SOM(5y)"]
txw = [Inches(3.1), Inches(1.5), Inches(1.5), Inches(1.6)]
xx = tx
for h, w in zip(th, txw):
    text(s, xx+Inches(0.08), Inches(1.66), w, Inches(0.4), [[(h, 11.5, WHITE, True)]], anchor=MSO_ANCHOR.MIDDLE)
    xx += w
data = [
    ("EnVisor Home (B2C)", "2,5 T", "1,0 T", "45 M"),
    ("Inspeksi Aset PLN", "4,8 T", "1,5 T", "120 M"),
    ("Audit Energi Industri", "4,1 T", "0,9 T", "60 M"),
    ("TOTAL", "11,4 T", "3,4 T", "225 M"),
]
yy = Inches(2.18)
for i, row in enumerate(data):
    last = (i == len(data)-1)
    box(s, tx, yy, Inches(7.7), Inches(0.62), fill=(RGBColor(0xFE,0xF3,0xC7) if last else WHITE), line=LIGHT, radius=True)
    xx = tx
    for j, (val, w) in enumerate(zip(row, txw)):
        bold = last or j == 0
        col = INK if j == 0 else (RED if last else MID)
        prefix = "Rp " if j > 0 else ""
        text(s, xx+Inches(0.08), yy, w, Inches(0.62), [[(prefix+val, 11.5, INK if last else col, bold)]], anchor=MSO_ANCHOR.MIDDLE)
        xx += w
    yy += Inches(0.66)
box(s, tx, Inches(5.15), Inches(7.7), Inches(1.1), fill=RGBColor(0xFF,0xFB,0xEB), line=RGBColor(0xFD,0xE6,0x8A), radius=True)
text(s, tx+Inches(0.2), Inches(5.25), Inches(7.3), Inches(0.95),
     [[("Asumsi: ", 11, RGBColor(0x85,0x4D,0x0E), True),
       ("TAM industri di-anchor pasar global machine vision (USD 11,3 M, 2024) + predictive maintenance, porsi ID ~1–1,5%. SOM = penetrasi 3% SAM konsumen + subset unit PLN & 50–100 pilot industri.", 11, RGBColor(0x85,0x4D,0x0E), False)]],
     line_spacing=1.12)
text(s, Inches(0.55), Inches(6.5), Inches(12), Inches(0.3),
     [[("Sumber: Statistik PLN 2023 · Grand View Research · MarketsandMarkets · IEA. Angka indikatif, divalidasi saat pilot.", 10.5, MID, False)]])

# ============================================================ SLIDE 12 — COMPETITION
s = slide()
header(s, "SECTION C · MARKET & COMPETITION", "Competitor Analysis & Unfair Advantage", "12 / 18")
comp = [
    ("Audit energi manual / konsultan", "Akurat tapi mahal, lambat, tak scalable", RED),
    ("Vendor machine vision global", "Kuat teknis, tapi mahal & fokus manufaktur", AMBER),
    ("Startup energy-app", "UX bagus, tapi tanpa data & akses aset PLN", CYAN),
    ("\"Do nothing\" (status quo)", "Murah jangka pendek, mahal jangka panjang", MID),
]
y = Inches(1.55)
for name, note, c in comp:
    box(s, Inches(0.55), y, Inches(6.0), Inches(1.0), fill=PAPER, line=LIGHT, radius=True)
    box(s, Inches(0.55), y, Inches(0.08), Inches(1.0), fill=c)
    text(s, Inches(0.78), y+Inches(0.1), Inches(5.6), Inches(0.45), [[(name, 13.5, INK, True)]])
    text(s, Inches(0.78), y+Inches(0.52), Inches(5.6), Inches(0.4), [[(note, 11.5, MID, False)]])
    y += Inches(1.1)
box(s, Inches(6.78), Inches(1.55), Inches(6.05), Inches(4.55), fill=DARK, radius=True)
text(s, Inches(7.03), Inches(1.75), Inches(5.6), Inches(0.5), [[("Unfair Advantage PLN", 18, AMBER, True)]])
bullets(s, Inches(7.03), Inches(2.4), Inches(5.55),
        ["Akses & kepemilikan aset kelistrikan nasional (data unik)",
         "Basis pelanggan captive: 89 jt RT + industri besar",
         "Brand & kepercayaan + posisi regulasi/standar energi",
         "Sinergi PLN Group (ICON+, AP) untuk distribusi & scale",
         "Satu model AI lintas skala rumah→industri (network effect data)"],
        size=13, color=LIGHT, mcolor=AMBER, gap=11)

# ============================================================ SLIDE 13 — BUSINESS MODEL
s = slide(PAPER)
header(s, "SECTION D · BUSINESS & EXECUTION", "Business Model & Revenue Streams", "13 / 18")
streams = [
    ("B2C · EnVisor Home", "Freemium + Lead-Gen", "Gratis → Rp 99rb / laporan; komisi referral & lead layanan PLN.", AMBER),
    ("B2B/B2G · EnVisor Industri", "SaaS + Inspection-as-a-Service", "Langganan per aset/site/kamera; fee per gardu / per km; bundle hardware.", CYAN),
    ("B2B · Energy Performance", "Shared-Savings Audit", "% dari penghematan energi terverifikasi; lisensi platform ke unit PLN.", GREEN),
]
x = Inches(0.55)
for seg, model, desc, c in streams:
    box(s, x, Inches(1.5), Inches(3.95), Inches(2.7), fill=WHITE, line=LIGHT, radius=True)
    box(s, x, Inches(1.5), Inches(3.95), Inches(0.55), fill=c, radius=True)
    text(s, x, Inches(1.56), Inches(3.95), Inches(0.45), [[(seg, 12, WHITE, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.22), Inches(2.25), Inches(3.55), Inches(0.6), [[(model, 16, INK, True)]])
    text(s, x+Inches(0.22), Inches(3.0), Inches(3.55), Inches(1.1), [[(desc, 12.5, MID, False)]], line_spacing=1.15)
    x += Inches(4.1)
# unit economics strip
box(s, Inches(0.55), Inches(4.45), Inches(12.25), Inches(1.7), fill=DARK, radius=True)
text(s, Inches(0.8), Inches(4.6), Inches(11.7), Inches(0.4), [[("Unit economics & pricing logic", 14, AMBER, True)]])
ue = ["Home: margin tinggi (digital), CAC rendah via organik/PLN channel.",
      "Industri SaaS: ARPU besar per kontrak, retensi tinggi (mission-critical).",
      "Shared-savings: selaras insentif — bayar dari penghematan nyata, risiko rendah bagi pelanggan."]
bullets(s, Inches(0.8), Inches(5.05), Inches(11.7), ue, size=12.5, color=LIGHT, mcolor=AMBER, gap=6)

# ============================================================ SLIDE 14 — GTM
s = slide()
header(s, "SECTION D · BUSINESS & EXECUTION", "Go-to-Market Strategy", "14 / 18")
phases = [
    ("FASE 1 · Tahun 1", "Market Validation", ["Scale-up EnVisor Home (app store)", "Pilot ThermoVision di 1–2 unit PLN", "10 early-adopter industri", "LOI/MoU + validasi unit economics"], AMBER),
    ("FASE 2 · Tahun 2–3", "Expansion", ["Roll-out drone patrol & AR FieldAssist", "Cross-sell PLN Group & kawasan industri", "Kemitraan vendor 3D vision", "Platform predictive maintenance multi-tenant"], CYAN),
    ("FASE 3 · Tahun 4–5", "Scale-Up", ["Penetrasi nasional aset prioritas", "Produk data/benchmarking energi", "Ekspansi regional ASEAN", "Spin-off unit bisnis PLN"], GREEN),
]
x = Inches(0.55)
for tag, title, items, c in phases:
    box(s, x, Inches(1.55), Inches(3.95), Inches(4.6), fill=PAPER, line=LIGHT, radius=True)
    box(s, x, Inches(1.55), Inches(3.95), Inches(0.95), fill=c, radius=True)
    text(s, x+Inches(0.2), Inches(1.66), Inches(3.6), Inches(0.35), [[(tag, 11, WHITE, True)]])
    text(s, x+Inches(0.2), Inches(2.0), Inches(3.6), Inches(0.45), [[(title, 18, WHITE, True)]])
    bullets(s, x+Inches(0.2), Inches(2.75), Inches(3.55), items, size=12.5, color=INK, mcolor=c, gap=10)
    x += Inches(4.1)

# ============================================================ SLIDE 15 — ROADMAP
s = slide(PAPER)
header(s, "SECTION D · BUSINESS & EXECUTION", "Implementation Roadmap & Resources", "15 / 18")
box(s, Inches(0.55), Inches(1.5), Inches(12.25), Inches(0.5), fill=DARK, radius=True)
rh = ["Fase", "Periode", "Aktivitas Utama", "Output", "Resource"]
rw = [Inches(1.4), Inches(1.5), Inches(4.3), Inches(2.9), Inches(2.1)]
xx = Inches(0.55)
for h, w in zip(rh, rw):
    text(s, xx+Inches(0.08), Inches(1.56), w, Inches(0.4), [[(h, 11.5, WHITE, True)]], anchor=MSO_ANCHOR.MIDDLE)
    xx += w
rmrows = [
    ("F1", "Q1–Q2 Y1", "MVP industri + pilot ThermoVision 1 gardu", "Model v1, hasil pilot, LOI", "AI eng, 1 unit PLN"),
    ("F2", "Q3–Q4 Y1", "Validasi & iterasi, akuisisi 10 pelanggan", "Unit economics, playbook", "Sales, cloud, hardware"),
    ("F3", "Y2", "Roll-out drone + AR, platform multi-tenant", "Platform GA, 50+ aset", "Tim produk, mitra vision"),
    ("F4", "Y3–Y5", "Skala nasional + ekspansi produk data", "Penetrasi, spin-off", "Unit bisnis, CAPEX skala"),
]
y = Inches(2.08)
for fase, per, akt, out, res in rmrows:
    box(s, Inches(0.55), y, Inches(12.25), Inches(0.92), fill=WHITE, line=LIGHT, radius=True)
    vals = [fase, per, akt, out, res]
    xx = Inches(0.55)
    for j, (val, w) in enumerate(zip(vals, rw)):
        text(s, xx+Inches(0.1), y, w, Inches(0.92),
             [[(val, 11.5 if j>1 else 12.5, INK if j==0 else MID, j==0)]], anchor=MSO_ANCHOR.MIDDLE)
        xx += w
    y += Inches(0.98)
text(s, Inches(0.55), Inches(6.15), Inches(12.2), Inches(0.5),
     [[("Critical path: ", 12.5, AMBER, True),
       ("akurasi model pilot (go/no-go F2) · kesiapan data aset PLN · perizinan drone. Investasi awal ~Rp 30 M (seed).", 12.5, INK, False)]])

# ============================================================ SLIDE 16 — FINANCIALS + RISK
s = slide()
header(s, "SECTION E · VALUE & RISK", "Financial Projections & Risk", "16 / 18")
# financial table
box(s, Inches(0.55), Inches(1.5), Inches(7.0), Inches(0.5), fill=DARK, radius=True)
fh = ["Rp Miliar", "Y1", "Y2", "Y3", "Y4", "Y5"]
fw = [Inches(2.0)] + [Inches(1.0)]*5
xx = Inches(0.55)
for h, w in zip(fh, fw):
    text(s, xx+Inches(0.05), Inches(1.56), w, Inches(0.4), [[(h, 11.5, WHITE, True)]], anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.LEFT if h=="Rp Miliar" else PP_ALIGN.CENTER)
    xx += w
frows = [("Revenue", ["4","18","55","120","220"], INK),
         ("Cost", ["9","22","48","92","150"], MID),
         ("EBITDA", ["(5)","(4)","7","28","70"], GREEN)]
y = Inches(2.08)
for label, vals, c in frows:
    box(s, Inches(0.55), y, Inches(7.0), Inches(0.6), fill=PAPER, line=LIGHT, radius=True)
    text(s, Inches(0.65), y, Inches(2.0), Inches(0.6), [[(label, 12.5, INK, True)]], anchor=MSO_ANCHOR.MIDDLE)
    xx = Inches(0.55)+fw[0]
    for v in vals:
        col = RED if v.startswith("(") else (GREEN if label=="EBITDA" else INK)
        text(s, xx, y, Inches(1.0), Inches(0.6), [[(v, 12.5, col, True)]], anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
        xx += Inches(1.0)
    y += Inches(0.66)
# KPIs
kpis = [("Th-3", "Break-even"), ("~3,8 thn", "Payback"), (">28%", "IRR"), ("Rp 30 M", "Seed")]
kx = Inches(0.55)
for n, l in kpis:
    box(s, kx, Inches(4.35), Inches(1.65), Inches(1.1), fill=DARK, radius=True)
    text(s, kx, Inches(4.5), Inches(1.65), Inches(0.5), [[(n, 17, AMBER, True)]], align=PP_ALIGN.CENTER)
    text(s, kx, Inches(5.02), Inches(1.65), Inches(0.4), [[(l, 11, LIGHT, False)]], align=PP_ALIGN.CENTER)
    kx += Inches(1.75)
# risk panel
box(s, Inches(7.9), Inches(1.5), Inches(4.9), Inches(4.65), fill=PAPER, line=LIGHT, radius=True)
text(s, Inches(8.12), Inches(1.62), Inches(4.5), Inches(0.4), [[("Risk & Mitigation", 15, RED, True)]])
risks = [
    ("Akurasi AI (H impact)", "Pilot bertahap, human-in-the-loop, continuous training."),
    ("Adopsi (M)", "AR sebagai alat bantu, bukti ROI dari pilot."),
    ("Regulasi drone/K3 (M)", "Kepatuhan AirNav & K3, sertifikasi, KBLI, SMAP ISO 37001."),
    ("Keamanan data (M)", "Enkripsi, edge inference, UU PDP; foto konsumen tak disimpan."),
]
ry = Inches(2.15)
for t, m in risks:
    text(s, Inches(8.12), ry, Inches(4.55), Inches(0.35), [[(t, 12, INK, True)]])
    text(s, Inches(8.12), ry+Inches(0.3), Inches(4.55), Inches(0.6), [[(m, 11, MID, False)]], line_spacing=1.05)
    ry += Inches(0.98)
text(s, Inches(0.55), Inches(5.7), Inches(7.0), Inches(0.5),
     [[("Strategic impact: ", 12, AMBER, True),
       ("PLN pionir AI energy intelligence; reduksi emisi & susut; capability & IP baru.", 11.5, INK, False)]], line_spacing=1.05)

# ============================================================ SLIDE 17 — TEAM
s = slide(PAPER)
header(s, "SECTION F · TEAM & CLOSING", "Tim Inovasi", "17 / 18")
roles = [
    ("Business Lead", "<Nama>", "Strategi bisnis, GTM, kemitraan PLN Group.", AMBER),
    ("Tech / AI Lead", "<Nama>", "Arsitektur AI vision, model, & platform.", CYAN),
    ("Market / Ops Lead", "<Nama>", "Riset pasar, pilot, operasional lapangan.", GREEN),
]
x = Inches(0.55)
for role, name, desc, c in roles:
    box(s, x, Inches(1.6), Inches(3.95), Inches(3.6), fill=WHITE, line=LIGHT, radius=True)
    circ = box(s, x+Inches(1.42), Inches(1.95), Inches(1.1), Inches(1.1), fill=c, radius=True)
    text(s, x+Inches(1.42), Inches(2.15), Inches(1.1), Inches(0.6), [[(role[0], 30, WHITE, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.2), Inches(3.2), Inches(3.55), Inches(0.4), [[(role, 16, INK, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.2), Inches(3.6), Inches(3.55), Inches(0.35), [[(name, 12.5, c, True)]], align=PP_ALIGN.CENTER)
    text(s, x+Inches(0.2), Inches(4.0), Inches(3.55), Inches(1.0), [[(desc, 12, MID, False)]], align=PP_ALIGN.CENTER, line_spacing=1.1)
    x += Inches(4.1)
text(s, Inches(0.55), Inches(5.6), Inches(12), Inches(0.5),
     [[("Kekuatan tim: ", 13, AMBER, True),
       ("kombinasi komplementer Bisnis × Teknis × Pasar — siap eksekusi dari pilot hingga scale-up.", 13, INK, False)]])

# ============================================================ SLIDE 18 — CLOSING
s = slide(DARK)
box(s, 0, 0, SW, SH, fill=DARK)
box(s, 0, 0, Inches(0.18), SH, fill=AMBER)
text(s, Inches(0.8), Inches(0.8), Inches(11), Inches(0.4), [[("CLOSING / CALL TO ACTION", 12, AMBER, True)]])
text(s, Inches(0.8), Inches(1.4), Inches(11.7), Inches(1.4),
     [[("Satu mesin AI vision —", 38, WHITE, True)],
      [("dari rumah ke gardu induk.", 38, AMBER, True)]], line_spacing=1.02)
recap = [
    ("PROBLEM", "Listrik tak terukur & aset rusak tanpa deteksi dini."),
    ("SOLUTION", "AI vision dua-lini: EnVisor Home + EnVisor Industri."),
    ("VALUE", "TAM Rp 11,4 T · SOM Rp 225 M · IRR >28%."),
]
x = Inches(0.8)
for t, d in recap:
    box(s, x, Inches(3.2), Inches(3.85), Inches(1.5), fill=SLATE, line=AMBER, radius=True)
    text(s, x+Inches(0.22), Inches(3.4), Inches(3.5), Inches(0.4), [[(t, 13, AMBER, True)]])
    text(s, x+Inches(0.22), Inches(3.82), Inches(3.5), Inches(0.85), [[(d, 12.5, LIGHT, False)]], line_spacing=1.1)
    x += Inches(4.0)
text(s, Inches(0.8), Inches(5.1), Inches(11.7), Inches(0.9),
     [[("Why Now: ", 14, AMBER, True), ("AI vision matang & murah, momentum NZE 2060.   ", 14, WHITE, False),
       ("Why Us: ", 14, AMBER, True), ("aset & data PLN + produk live yang sudah berjalan.", 14, WHITE, False)]],
     line_spacing=1.2)
box(s, Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.7), fill=AMBER, radius=True)
text(s, Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.5),
     [[("ASK: dukungan panel untuk lanjut ke bootcamp & pendanaan pilot.   ·   envisor.ai", 14, DARK, True)]],
     align=PP_ALIGN.CENTER)

prs.save("/home/user/envisor/downloads/EnVisor-Proposal-IG-2026.pptx")
print("Saved PPTX with", len(prs.slides.__iter__.__self__._sldIdLst), "slides")

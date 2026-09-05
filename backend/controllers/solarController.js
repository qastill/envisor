/**
 * Estimasi PLTS Atap versi server.
 *
 * Memakai model yang sama dengan kalkulator di browser sehingga angka pada
 * halaman, pada penawaran, dan pada integrasi pihak ketiga selalu identik.
 */

const { hitungPlts, KOTA, TARIFF, capexPlts } = require('../config/solar');

/** POST /api/solar/estimate */
function estimasiPlts(req, res) {
  try {
    const b = req.body || {};
    const tagihan = Number(b.tagihan);
    if (!Number.isFinite(tagihan) || tagihan < 50000) {
      return res.status(400).json({
        success: false,
        error: 'Tagihan bulanan wajib diisi dan minimal Rp 50.000.',
      });
    }

    const kota = KOTA.find((k) => k.slug === b.kota);
    const golongan = TARIFF[b.golongan] ? b.golongan : 'R-1/2200';

    const hasil = hitungPlts({
      tagihan,
      tarif: TARIFF[golongan].rate,
      psh: kota ? kota.psh : Number(b.psh) || 4.7,
      profil: ['rumah', 'bisnis', 'industri'].includes(b.profil) ? b.profil : 'rumah',
      baterai: !!b.baterai,
      porsiSiang: b.porsiSiang != null ? Number(b.porsiSiang) : undefined,
      kwpManual: b.kwp ? Number(b.kwp) : undefined,
      kwpMaks: b.kwpMaks ? Number(b.kwpMaks) : undefined,
    });

    return res.json({
      success: true,
      konteks: {
        kota: kota ? kota.nama : null,
        psh: kota ? kota.psh : Number(b.psh) || 4.7,
        golongan: TARIFF[golongan].label,
        tarifPerKwh: TARIFF[golongan].rate,
      },
      hasil,
    });
  } catch (err) {
    console.error('[estimasiPlts]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/** GET /api/solar/harga — daftar harga indikatif per ukuran sistem. */
function daftarHarga(req, res) {
  const ukuran = [2, 3, 5, 7.5, 10, 15, 20, 30, 50, 100, 200, 500];
  return res.json({
    success: true,
    catatan: 'Harga indikatif terpasang, belum termasuk baterai dan perbaikan struktur atap.',
    daftar: ukuran.map((kwp) => ({
      kwp,
      capex: capexPlts(kwp),
      perKwp: Math.round(capexPlts(kwp) / kwp),
    })),
  });
}

module.exports = { estimasiPlts, daftarHarga };

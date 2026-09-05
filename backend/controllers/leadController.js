/**
 * Penampung lead dari form penawaran di halaman marketing.
 *
 * Lingkungan serverless tidak punya disk permanen, jadi lead ditulis ke log
 * terstruktur dan — bila LEAD_WEBHOOK_URL diisi — diteruskan ke webhook
 * (Google Sheets, CRM, Zapier, dan sejenisnya).
 */

const MAX_LEN = 2000;

/** Buang karakter kontrol dan potong panjangnya supaya log tetap aman dibaca. */
function bersihkan(nilai) {
  if (nilai == null) return '';
  return String(nilai).replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, MAX_LEN);
}

/** Kontak dianggap sah bila berbentuk email atau nomor telepon Indonesia. */
function kontakValid(kontak) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const telepon = /^(\+?62|0)8[1-9][0-9]{6,11}$/;
  const rapat = kontak.replace(/[\s\-().]/g, '');
  return email.test(rapat) || telepon.test(rapat);
}

/**
 * POST /api/lead
 * Body: { nama, kontak, lokasi?, catatan?, sumber?, estimasi? }
 */
async function terimaLead(req, res) {
  try {
    const nama    = bersihkan(req.body.nama);
    const kontak  = bersihkan(req.body.kontak);
    const lokasi  = bersihkan(req.body.lokasi);
    const catatan = bersihkan(req.body.catatan);
    const sumber  = bersihkan(req.body.sumber) || 'tidak diketahui';

    if (nama.length < 2) {
      return res.status(400).json({ success: false, error: 'Nama belum diisi.' });
    }
    if (!kontakValid(kontak)) {
      return res.status(400).json({
        success: false,
        error: 'Nomor WhatsApp atau email belum valid.',
      });
    }

    const lead = {
      waktu: new Date().toISOString(),
      nama, kontak, lokasi, catatan, sumber,
      estimasi: req.body.estimasi || null,
    };

    console.log('[lead]', JSON.stringify(lead));

    if (process.env.LEAD_WEBHOOK_URL) {
      try {
        await fetch(process.env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch (err) {
        // Lead sudah tercatat di log, jadi kegagalan webhook tidak boleh
        // membuat pengguna melihat error.
        console.error('[lead] webhook gagal:', err.message);
      }
    }

    return res.json({
      success: true,
      message: 'Terima kasih! Permintaanmu sudah masuk. Tim kami menghubungi dalam 1x24 jam kerja.',
    });
  } catch (err) {
    console.error('[terimaLead]', err.message);
    return res.status(500).json({ success: false, error: 'Gagal memproses permintaan.' });
  }
}

module.exports = { terimaLead, kontakValid, bersihkan };

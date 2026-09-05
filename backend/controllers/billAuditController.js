/**
 * Mesin aturan audit tagihan listrik PLN.
 *
 * Tidak memakai AI: seluruh temuan berasal dari aturan tarif yang bisa
 * ditelusuri, sehingga hasilnya dapat dibantah dan diperiksa ulang oleh
 * pelanggan maupun petugas PLN.
 */

const { TARIFF } = require('../config/solar');

/** Tahapan daya tersambung PLN (VA). */
const TANGGA_DAYA = [
  450, 900, 1300, 2200, 3500, 4400, 5500, 6600, 7700, 10600, 11000, 13200,
  16500, 23000, 33000, 41500, 53000, 66000, 82500, 105000, 131000, 147000, 197000,
];

/** Jam nyala minimum yang ditagihkan PLN untuk pelanggan pascabayar. */
const JAM_NYALA_MINIMUM = 40;

/** Batas atas PBJT tenaga listrik menurut UU 1/2022 tentang HKPD. */
const BATAS_PBJT = 10;

/** Bea meterai baru berlaku untuk dokumen di atas nilai ini. */
const AMBANG_METERAI = 5000000;
const NILAI_METERAI = 10000;

/** Daya satu tingkat di bawah daya sekarang, atau null bila sudah paling bawah. */
function dayaLebihRendah(va) {
  const idx = TANGGA_DAYA.indexOf(va);
  if (idx > 0) return TANGGA_DAYA[idx - 1];
  const bawah = TANGGA_DAYA.filter((d) => d < va);
  return bawah.length ? bawah[bawah.length - 1] : null;
}

/** Rekening minimum pascabayar: 40 jam nyala x daya tersambung x tarif. */
function rekeningMinimum(va, tarif) {
  return JAM_NYALA_MINIMUM * (va / 1000) * tarif;
}

/** Median sebuah deret angka, dipakai supaya satu bulan ekstrem tidak menyetir. */
function median(deret) {
  const urut = [...deret].filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (!urut.length) return 0;
  const t = Math.floor(urut.length / 2);
  return urut.length % 2 ? urut[t] : (urut[t - 1] + urut[t]) / 2;
}

/**
 * Jalankan seluruh aturan audit.
 *
 * @param {object} input
 * @param {string}  input.golongan     kunci pada TARIFF, mis. 'R-1/1300'
 * @param {number}  input.dayaVa       daya tersambung (VA)
 * @param {number}  input.tagihan      total tagihan bulan ini (Rp)
 * @param {number}  [input.kwh]        kWh terpakai bulan ini
 * @param {number[]}[input.riwayat]    tagihan beberapa bulan sebelumnya (Rp)
 * @param {number}  [input.ppjtPersen] tarif PBJT daerah (%)
 * @param {boolean} [input.prabayar]   pelanggan token
 * @param {boolean} [input.komersial]  bangunan dipakai untuk usaha
 * @returns {{temuan: Array, ringkasan: object}}
 */
function auditTagihan(input) {
  const golongan = TARIFF[input.golongan] ? input.golongan : 'R-1/1300';
  const tarif = TARIFF[golongan].rate;
  const dayaVa = Number(input.dayaVa) || 1300;
  const tagihan = Number(input.tagihan) || 0;
  const kwh = Number(input.kwh) || 0;
  const riwayat = Array.isArray(input.riwayat) ? input.riwayat.map(Number) : [];
  const ppjt = input.ppjtPersen == null ? 5 : Number(input.ppjtPersen);
  const temuan = [];

  const tambah = (t) => temuan.push(t);

  /* --- 1. Membayar daya yang tidak terpakai --- */
  if (!input.prabayar && kwh > 0) {
    const kwhMinimum = JAM_NYALA_MINIMUM * (dayaVa / 1000);
    if (kwh < kwhMinimum) {
      const turun = dayaLebihRendah(dayaVa);
      const selisih = turun
        ? Math.round(rekeningMinimum(dayaVa, tarif) - rekeningMinimum(turun, tarif))
        : 0;
      tambah({
        kode: 'RM-01',
        tingkat: 'tinggi',
        jenis: 'bulanan',
        judul: 'Membayar daya yang tidak pernah terpakai',
        temuan:
          'Pemakaian ' + kwh + ' kWh masih di bawah rekening minimum ' +
          Math.round(kwhMinimum) + ' kWh untuk daya ' + dayaVa.toLocaleString('id-ID') + ' VA. ' +
          'PLN tetap menagih 40 jam nyala meskipun listriknya tidak dipakai.',
        aksi: turun
          ? 'Ajukan penurunan daya ke ' + turun.toLocaleString('id-ID') + ' VA lewat PLN Mobile. ' +
            'Biaya turun daya dibayar sekali, penghematannya berulang tiap bulan.'
          : 'Daya sudah berada di tingkat terendah. Fokuskan perbaikan pada pola pemakaian.',
        potensiRp: selisih > 0 ? selisih : null,
      });
    }
  }

  /* --- 2. Tarif per kWh di luar kewajaran --- */
  if (kwh > 0 && tagihan > 0) {
    const meterai = tagihan > AMBANG_METERAI ? NILAI_METERAI : 0;
    const wajar = tarif * (1 + ppjt / 100) + meterai / kwh;
    const nyata = tagihan / kwh;
    const selisihPersen = ((nyata - wajar) / wajar) * 100;

    if (selisihPersen > 15) {
      tambah({
        kode: 'TR-01',
        tingkat: 'tinggi',
        jenis: 'sekali',
        judul: 'Tarif efektif per kWh lebih tinggi dari seharusnya',
        temuan:
          'Tagihan dibagi pemakaian menghasilkan Rp ' + Math.round(nyata).toLocaleString('id-ID') +
          '/kWh, sedangkan tarif ' + TARIFF[golongan].label + ' ditambah PBJT ' + ppjt +
          '% seharusnya sekitar Rp ' + Math.round(wajar).toLocaleString('id-ID') + '/kWh. ' +
          'Selisihnya ' + Math.round(selisihPersen) + '%.',
        aksi:
          'Minta rincian rekening ke PLN dan cocokkan angka stand meter awal dan akhir. ' +
          'Selisih sebesar ini biasanya berasal dari salah baca meter, faktor kali yang keliru, ' +
          'atau tunggakan bulan lalu yang ikut ditagihkan.',
        potensiRp: Math.round(tagihan - wajar * kwh),
      });
    } else if (selisihPersen < -15) {
      tambah({
        kode: 'TR-02',
        tingkat: 'info',
        jenis: 'sekali',
        judul: 'Tarif efektif lebih rendah dari perkiraan',
        temuan:
          'Tarif efektif Rp ' + Math.round(nyata).toLocaleString('id-ID') + '/kWh berada di bawah ' +
          'perhitungan normal. Kemungkinan golongan tarif yang dipilih di formulir belum tepat, ' +
          'atau ada koreksi tagihan bulan sebelumnya.',
        aksi: 'Periksa kembali golongan tarif yang tertera pada struk atau PLN Mobile.',
        potensiRp: null,
      });
    }
  }

  /* --- 3. PBJT melebihi batas undang-undang --- */
  if (ppjt > BATAS_PBJT) {
    tambah({
      kode: 'PJ-01',
      tingkat: 'sedang',
      jenis: 'bulanan',
      judul: 'PBJT tenaga listrik di atas batas maksimum',
      temuan:
        'PBJT yang tercatat ' + ppjt + '%, sedangkan UU 1/2022 tentang HKPD membatasi ' +
        'tarifnya paling tinggi ' + BATAS_PBJT + '%.',
      aksi: 'Cek Perda pajak daerah setempat dan ajukan klarifikasi ke Bapenda bila memang melebihi batas.',
      potensiRp: kwh > 0 ? Math.round(kwh * tarif * ((ppjt - BATAS_PBJT) / 100)) : null,
    });
  }

  /* --- 4. Lonjakan mendadak dibanding bulan-bulan sebelumnya --- */
  if (riwayat.length >= 2 && tagihan > 0) {
    const acuan = median(riwayat);
    if (acuan > 0) {
      const naik = ((tagihan - acuan) / acuan) * 100;
      if (naik > 40) {
        tambah({
          kode: 'LJ-01',
          tingkat: 'tinggi',
          jenis: 'sekali',
          judul: 'Lonjakan tagihan yang belum ada penjelasannya',
          temuan:
            'Tagihan bulan ini Rp ' + Math.round(tagihan).toLocaleString('id-ID') +
            ', naik ' + Math.round(naik) + '% dari kebiasaan Rp ' +
            Math.round(acuan).toLocaleString('id-ID') + '.',
          aksi:
            'Lonjakan tanpa perubahan perangkat biasanya berasal dari pencatatan taksiran yang ' +
            'kemudian dikoreksi, kebocoran arus, atau perangkat baru yang menyala terus. ' +
            'Foto stand meter hari ini sebagai bukti, lalu ajukan keluhan lewat PLN Mobile.',
          potensiRp: Math.round(tagihan - acuan),
        });
      }
    }
  }

  /* --- 5. Tagihan identik berturut-turut menandakan taksiran --- */
  if (riwayat.length >= 3) {
    const tiga = riwayat.slice(0, 3);
    if (tiga.every((n) => n > 0 && Math.abs(n - tiga[0]) < 1000)) {
      tambah({
        kode: 'TK-01',
        tingkat: 'sedang',
        jenis: 'sekali',
        judul: 'Tagihan nyaris sama persis beberapa bulan berturut-turut',
        temuan:
          'Tiga tagihan terakhir hampir identik. Pola ini lazim muncul saat meter tidak dibaca ' +
          'langsung dan pemakaian ditaksir dari rata-rata.',
        aksi:
          'Kirim swafoto stand meter tiap bulan lewat PLN Mobile agar penagihan memakai angka nyata. ' +
          'Selisih taksiran biasanya ditagihkan sekaligus di kemudian hari.',
        potensiRp: null,
      });
    }
  }

  /* --- 6. Faktor beban sangat rendah --- */
  if (kwh > 0) {
    const faktorBeban = (kwh / ((dayaVa / 1000) * 720)) * 100;
    if (faktorBeban < 5 && dayaVa > 900) {
      tambah({
        kode: 'FB-01',
        tingkat: 'sedang',
        jenis: 'bulanan',
        judul: 'Daya tersambung jauh melebihi kebutuhan nyata',
        temuan:
          'Faktor beban hanya ' + faktorBeban.toFixed(1) + '%, artinya kapasitas yang ' +
          'dilanggan hampir tidak pernah terpakai.',
        aksi:
          'Pertimbangkan turun daya. Periksa lebih dulu daya nyala serentak perangkat terbesar ' +
          '(AC, pompa, water heater) agar MCB tidak sering anjlok setelah diturunkan.',
        potensiRp: null,
      });
    }
  }

  /* --- 7. Golongan tarif tidak sesuai peruntukan --- */
  const golonganRumah = golongan.startsWith('R-');
  if (input.komersial && golonganRumah) {
    tambah({
      kode: 'GL-01',
      tingkat: 'tinggi',
      jenis: 'bulanan',
      judul: 'Bangunan usaha memakai golongan rumah tangga',
      temuan:
        'Bangunan dipakai untuk kegiatan usaha namun terdaftar pada golongan ' +
        TARIFF[golongan].label + '.',
      aksi:
        'Segera ajukan perubahan golongan ke B-2 atau B-3. Pemakaian di luar peruntukan berisiko ' +
        'terkena penertiban pemakaian tenaga listrik dengan tagihan susulan yang besar. ' +
        'Pada daya di atas 200 kVA, tarif bisnis justru lebih murah per kWh-nya.',
      potensiRp: null,
    });
  }
  if (!input.komersial && !golonganRumah && golongan.startsWith('B-')) {
    tambah({
      kode: 'GL-02',
      tingkat: 'sedang',
      jenis: 'bulanan',
      judul: 'Rumah tinggal memakai golongan bisnis',
      temuan: 'Golongan ' + TARIFF[golongan].label + ' dipakai untuk bangunan non-usaha.',
      aksi: 'Ajukan perubahan golongan ke R agar struktur biaya bebannya sesuai peruntukan.',
      potensiRp: null,
    });
  }

  /* --- 8. Daya besar tetapi masih golongan kecil --- */
  if (golongan === 'R-1/1300' && dayaVa > 2200) {
    tambah({
      kode: 'GL-03',
      tingkat: 'info',
      jenis: 'sekali',
      judul: 'Golongan dan daya tersambung tidak cocok',
      temuan:
        'Daya ' + dayaVa.toLocaleString('id-ID') + ' VA tidak lagi masuk golongan R-1/1.300 VA.',
      aksi: 'Periksa golongan sebenarnya di PLN Mobile, lalu jalankan ulang audit ini.',
      potensiRp: null,
    });
  }

  const urutan = { tinggi: 0, sedang: 1, info: 2 };
  temuan.sort((a, b) => urutan[a.tingkat] - urutan[b.tingkat]);

  // Temuan sekali-jalan (TR-01, LJ-01) sering menjelaskan rupiah yang sama pada
  // tagihan yang sama, jadi diambil yang terbesar — bukan dijumlahkan — supaya
  // angka potensi tidak menggelembung. Temuan berulang baru boleh dijumlahkan.
  const nilai = (t) => (t.potensiRp > 0 ? t.potensiRp : 0);
  const potensiSekali = temuan
    .filter((t) => t.jenis === 'sekali')
    .reduce((a, t) => Math.max(a, nilai(t)), 0);
  const potensiBulanan = temuan
    .filter((t) => t.jenis === 'bulanan')
    .reduce((a, t) => a + nilai(t), 0);

  return {
    temuan,
    ringkasan: {
      golongan: TARIFF[golongan].label,
      tarifPerKwh: tarif,
      dayaVa,
      tagihan,
      kwh: kwh || null,
      tarifEfektif: kwh > 0 ? Math.round(tagihan / kwh) : null,
      jumlahTemuan: temuan.length,
      temuanTinggi: temuan.filter((t) => t.tingkat === 'tinggi').length,
      potensiSekali: Math.round(potensiSekali),
      potensiBulanan: Math.round(potensiBulanan),
      potensiSetahun: Math.round(potensiSekali + potensiBulanan * 12),
      status: temuan.some((t) => t.tingkat === 'tinggi')
        ? 'perlu-ditindaklanjuti'
        : temuan.length
        ? 'perlu-dicek'
        : 'wajar',
    },
  };
}

/** POST /api/audit/tagihan */
function auditTagihanHandler(req, res) {
  try {
    const hasil = auditTagihan(req.body || {});
    return res.json({ success: true, ...hasil });
  } catch (err) {
    console.error('[auditTagihan]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  auditTagihan,
  auditTagihanHandler,
  dayaLebihRendah,
  rekeningMinimum,
  TANGGA_DAYA,
};

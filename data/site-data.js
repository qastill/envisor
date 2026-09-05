/* ============================================================
   EnVisor — sumber data tunggal untuk halaman marketing.
   Dipakai di browser (<script src>) dan di Node (build script),
   karena itu memakai pola UMD sederhana.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EnVisorData = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  /* ---------- BRAND ---------- */
  const SITE = {
    name: 'EnVisor',
    // Domain yang benar-benar melayani situs ini. Tag canonical dan sitemap
    // wajib menunjuk ke sini: mengarahkannya ke domain yang belum aktif
    // membuat mesin pencari menganggap halaman aslinya ada di tempat lain.
    // Ganti ke domain khusus begitu domainnya sudah aktif, lalu jalankan
    // `npm run build:pages` supaya seluruh halaman ikut diperbarui.
    domain: 'https://envisor.vercel.app',
    tagline: 'Platform audit energi & PLTS Atap berbasis AI untuk Indonesia',
    email: 'halo@envisor.id',
    wa: '6281234567890',
  };

  /* ---------- TARIF PLN ----------
     Sumber acuan: tarif adjustment PLN untuk pelanggan non-subsidi.
     Angka dipakai sebagai basis estimasi, bukan tagihan resmi. */
  const TARIFF = {
    'R-1/900-RTM':  { label: 'R-1 / 900 VA (non-subsidi)', rate: 1352.00,  golongan: 'Rumah tangga' },
    'R-1/1300':     { label: 'R-1 / 1.300 VA',             rate: 1444.70,  golongan: 'Rumah tangga' },
    'R-1/2200':     { label: 'R-1 / 2.200 VA',             rate: 1444.70,  golongan: 'Rumah tangga' },
    'R-1M/3500':    { label: 'R-1 / 3.500–5.500 VA',       rate: 1699.53,  golongan: 'Rumah tangga' },
    'R-2/6600':     { label: 'R-2 / 6.600–200 kVA',        rate: 1699.53,  golongan: 'Rumah tangga besar' },
    'R-3/200k':     { label: 'R-3 / di atas 200 kVA',      rate: 1699.53,  golongan: 'Rumah tangga besar' },
    'B-2/6600':     { label: 'B-2 / 6.600 VA–200 kVA',     rate: 1444.70,  golongan: 'Bisnis' },
    'B-3/200k':     { label: 'B-3 / di atas 200 kVA',      rate: 1114.74,  golongan: 'Bisnis besar' },
    'I-3/200k':     { label: 'I-3 / di atas 200 kVA',      rate: 1114.74,  golongan: 'Industri' },
    'I-4/30M':      { label: 'I-4 / 30.000 kVA ke atas',   rate: 996.74,   golongan: 'Industri besar' },
    'P-1/6600':     { label: 'P-1 / 6.600 VA–200 kVA',     rate: 1699.53,  golongan: 'Kantor pemerintah' },
  };

  /* ---------- KONSTANTA PLTS ---------- */
  const SOLAR = {
    performanceRatio: 0.78,      // rugi inverter, kabel, suhu, kotoran
    degradasiTahunan: 0.0055,    // 0,55%/tahun (garansi lini modul tier-1)
    umurSistem: 25,              // tahun
    // Sejak Permen ESDM 2/2024 ekspor kelebihan daya tidak lagi dikreditkan,
    // sehingga yang bernilai ekonomi hanya listrik yang dipakai sendiri.
    // Porsi konsumsi yang jatuh di jam matahari (07.00–17.00) menentukan
    // batas atas penghematan; baterai menggeser sebagian beban malam ke siang.
    porsiSiang: { rumah: 0.45, bisnis: 0.75, industri: 0.85 },
    tambahanBaterai: 0.35,   // kenaikan porsi siang efektif jika pakai baterai
    porsiSiangMaks: 0.92,    // tetap ada beban dini hari yang tak tertutup
    diskonto: 0.08,          // biaya modal riil untuk perhitungan NPV
    biayaOM: 0.01,               // 1% CAPEX/tahun untuk pembersihan & monitoring
    emisiGrid: 0.79,             // kg CO2e per kWh (rata-rata sistem Jawa–Bali)
    hargaBaterai: 7500000,       // Rp per kWh kapasitas terpakai (LFP)
    luasPerKwp: 5.2,             // m2 atap per kWp modul 580–620 Wp
    // CAPEX = biaya tetap + biaya per kWp.
    // Izin PLN, SLO, proteksi, mobilisasi dan monitoring tidak ikut mengecil
    // saat sistemnya kecil — itulah sebabnya PLTS mungil jarang ekonomis.
    biayaTetap: 9000000,
    capexTier: [
      { maxKwp: 5,        perKwp: 11500000 },
      { maxKwp: 10,       perKwp: 10000000 },
      { maxKwp: 20,       perKwp: 9000000 },
      { maxKwp: 100,      perKwp: 8000000 },
      { maxKwp: Infinity, perKwp: 7000000 },
    ],
    kwpMinimum: 2,     // di bawah ini instalasi tidak praktis dipasang
    kwpMaksimum: 100000, // pagar atas; PLTS atap tidak pernah sebesar ini
    // Iradiasi di luar rentang ini tidak ada di Indonesia. Membatasinya juga
    // menjaga pencarian ukuran optimal tetap terbatas, karena psh yang sangat
    // kecil membuat batas atas pencarian meledak.
    pshMinimum: 2,
    pshMaksimum: 7,
    langkahPencarian: 500 // jumlah maksimum ukuran yang dicoba
  };

  /* ---------- PAKET ---------- */
  const PAKET = [
    {
      id: 'hemat', nama: 'Hemat', kwp: 3, populer: false,
      tagihan: 'Rp 500rb – 900rb', modul: '5 modul 620 Wp',
      inverter: 'Inverter string 3 kW', atap: '± 16 m²',
      fitur: ['Survei atap gratis', 'Pengurusan izin PLN', 'Monitoring aplikasi', 'Garansi performa 25 tahun', 'Garansi instalasi 5 tahun'],
    },
    {
      id: 'populer', nama: 'Populer', kwp: 5, populer: true,
      tagihan: 'Rp 900rb – 1,5 jt', modul: '8 modul 620 Wp',
      inverter: 'Inverter string 5 kW', atap: '± 26 m²',
      fitur: ['Survei atap gratis', 'Pengurusan izin PLN', 'Monitoring aplikasi', 'Garansi performa 25 tahun', 'Garansi instalasi 5 tahun', 'Opsi baterai siap pasang'],
    },
    {
      id: 'maxi', nama: 'Maxi', kwp: 10, populer: false,
      tagihan: 'Rp 1,5 jt – 3 jt', modul: '16 modul 620 Wp',
      inverter: 'Inverter hybrid 10 kW', atap: '± 52 m²',
      fitur: ['Survei atap gratis', 'Pengurusan izin PLN', 'Monitoring aplikasi', 'Garansi performa 25 tahun', 'Garansi instalasi 5 tahun', 'Siap integrasi baterai & EV charger'],
    },
  ];

  /* ---------- KOTA (halaman lokasi) ----------
     psh  = peak sun hour rata-rata tahunan (kWh/m²/hari)
     ppjt = indikasi PBJT tenaga listrik (dulu PPJ) — wajib cek Perda terbaru */
  const KOTA = [
    { slug:'jakarta',    nama:'Jakarta',    prov:'DKI Jakarta',        psh:4.6, ppjt:2.4, uid:'UID Jakarta Raya',   tagihan:850000,  ciri:'Rumah tapak & townhouse dengan atap terbatas, beban AC dominan siang hari.' },
    { slug:'bekasi',     nama:'Bekasi',     prov:'Jawa Barat',         psh:4.7, ppjt:8,   uid:'UID Jawa Barat',     tagihan:780000,  ciri:'Perumahan padat dan kawasan industri Cikarang dengan beban campuran.' },
    { slug:'tangerang',  nama:'Tangerang',  prov:'Banten',             psh:4.6, ppjt:8,   uid:'UID Banten',         tagihan:800000,  ciri:'Cluster baru dengan orientasi atap seragam — ideal untuk PLTS modular.' },
    { slug:'bandung',    nama:'Bandung',    prov:'Jawa Barat',         psh:4.5, ppjt:8,   uid:'UID Jawa Barat',     tagihan:650000,  ciri:'Suhu modul lebih rendah sehingga efisiensi panel relatif lebih baik.' },
    { slug:'semarang',   nama:'Semarang',   prov:'Jawa Tengah',        psh:4.8, ppjt:8,   uid:'UID Jawa Tengah & DIY', tagihan:620000, ciri:'Iradiasi tinggi di dataran pesisir, banyak gudang dengan atap lebar.' },
    { slug:'yogyakarta', nama:'Yogyakarta', prov:'DI Yogyakarta',      psh:4.8, ppjt:9,   uid:'UID Jawa Tengah & DIY', tagihan:520000, ciri:'Banyak guest house & UMKM dengan beban siang hari yang stabil.' },
    { slug:'surabaya',   nama:'Surabaya',   prov:'Jawa Timur',         psh:5.0, ppjt:8,   uid:'UID Jawa Timur',     tagihan:900000,  ciri:'Iradiasi tinggi plus beban pendingin besar — payback tercepat di Jawa.' },
    { slug:'denpasar',   nama:'Denpasar',   prov:'Bali',               psh:5.3, ppjt:9,   uid:'UID Bali',           tagihan:1100000, ciri:'Vila dan hotel dengan konsumsi siang tinggi dan tuntutan sertifikasi hijau.' },
    { slug:'medan',      nama:'Medan',      prov:'Sumatera Utara',     psh:4.4, ppjt:9,   uid:'UID Sumatera Utara', tagihan:700000,  ciri:'Curah hujan tinggi, butuh perhitungan derating dan jadwal pembersihan.' },
    { slug:'makassar',   nama:'Makassar',   prov:'Sulawesi Selatan',   psh:5.2, ppjt:10,  uid:'UID Sulselrabar',    tagihan:680000,  ciri:'Iradiasi terbaik di antara kota besar, cocok untuk sistem hybrid.' },
    { slug:'palembang',  nama:'Palembang',  prov:'Sumatera Selatan',   psh:4.5, ppjt:8,   uid:'UID Sumatera Selatan', tagihan:640000, ciri:'Beban puncak sore, kombinasi PLTS dan baterai memberi hasil terbaik.' },
    { slug:'balikpapan', nama:'Balikpapan', prov:'Kalimantan Timur',   psh:4.6, ppjt:8,   uid:'UID Kalimantan Timur', tagihan:920000, ciri:'Banyak fasilitas penunjang migas dengan target dekarbonisasi korporat.' },
  ];

  /* ---------- NAVIGASI ---------- */
  const NAV = [
    { label: 'Audit AI', href: '/index.html' },
    {
      label: 'Solusi', menu: [
        { href:'/surya.html',        label:'PLTS Atap',            desc:'Pasang panel surya rumah & bisnis' },
        { href:'/hems.html',         label:'Smart Energy & HEMS',  desc:'Otomasi beban, baterai, EV charger' },
        { href:'/monitoring.html',   label:'EPMS Monitoring',      desc:'Pantau kWh per circuit real-time' },
        { href:'/audit-tagihan.html',label:'Audit Tagihan PLN',    desc:'Temukan kelebihan tagihan & klaim' },
        { href:'/rec.html',          label:'REC & Net Zero',       desc:'Sertifikat energi terbarukan' },
        { href:'/bisnis.html',       label:'EnVisor Industri',     desc:'Vision AI untuk aset industri' },
        { href:'/slo.html',          label:'SLO & Kepatuhan',      desc:'Kesiapan Sertifikat Laik Operasi' },
      ],
    },
    { label: 'Harga', href: '/harga.html' },
    {
      label: 'Sumber Daya', menu: [
        { href:'/panduan.html', label:'Panduan',      desc:'Materi lengkap PLTS & efisiensi energi' },
        { href:'/blog.html',    label:'Blog',         desc:'Analisis & kabar regulasi energi' },
        { href:'/lokasi.html',  label:'Area Layanan', desc:'Estimasi per kota di Indonesia' },
        { href:'/banding.html', label:'Perbandingan', desc:'EnVisor vs opsi lain' },
      ],
    },
  ];

  const NAV_CTA = { href: '/surya.html#kalkulator', label: 'Hitung Hemat' };

  /* ---------- FOOTER ---------- */
  const FOOTER = [
    { title: 'Solusi', links: [
      { href:'/surya.html', label:'PLTS Atap' },
      { href:'/hems.html', label:'Smart Energy & HEMS' },
      { href:'/monitoring.html', label:'EPMS Monitoring' },
      { href:'/audit-tagihan.html', label:'Audit Tagihan PLN' },
      { href:'/rec.html', label:'REC & Net Zero' },
    ]},
    { title: 'Perusahaan', links: [
      { href:'/bisnis.html', label:'EnVisor Industri' },
      { href:'/slo.html', label:'SLO & Kepatuhan' },
      { href:'/harga.html', label:'Harga' },
      { href:'/banding.html', label:'Perbandingan' },
      { href:'/kuesioner.html', label:'Kuesioner Riset' },
    ]},
    { title: 'Sumber Daya', links: [
      { href:'/panduan.html', label:'Panduan' },
      { href:'/blog.html', label:'Blog' },
      { href:'/lokasi.html', label:'Area Layanan' },
      { href:'/index.html', label:'Audit AI Gratis' },
      { href:'/privacy.html', label:'Kebijakan Privasi' },
    ]},
  ];

  /* ============================================================
     PERHITUNGAN
     ============================================================ */

  /**
   * Angka yang aman dipakai berhitung.
   *
   * Nilai non-numerik menghasilkan NaN, dan setiap perbandingan dengan NaN
   * bernilai false — sehingga pemeriksaan diam-diam terlewat dan hasilnya
   * terlihat wajar padahal tidak pernah dihitung. Karena itu nilai yang tidak
   * terhingga dikembalikan ke bawaan, lalu dijepit ke rentang yang masuk akal.
   *
   * @param {*} nilai
   * @param {number} bawaan dipakai bila nilai tidak terhingga
   * @param {number} [min]
   * @param {number} [max]
   * @returns {number}
   */
  function angkaAman(nilai, bawaan, min = -Infinity, max = Infinity) {
    const n = Number(nilai);
    if (!Number.isFinite(n)) return bawaan;
    return Math.min(max, Math.max(min, n));
  }

  /** CAPEX terpasang (Rp) untuk ukuran sistem tertentu. */
  function capexPlts(kwp) {
    const tier = SOLAR.capexTier.find(t => kwp <= t.maxKwp) || SOLAR.capexTier[SOLAR.capexTier.length - 1];
    return Math.round(SOLAR.biayaTetap + kwp * tier.perKwp);
  }

  /** Produksi kWh per bulan dari sistem kwp di lokasi dengan peak sun hour psh. */
  function produksiBulanan(kwp, psh) {
    return kwp * psh * SOLAR.performanceRatio * 30;
  }

  /**
   * Porsi konsumsi yang jatuh di jam matahari, sesudah efek baterai.
   * @param {'rumah'|'bisnis'|'industri'} profil
   * @param {boolean} baterai
   * @returns {number} 0–1
   */
  function porsiSiangEfektif(profil, baterai) {
    const dasar = SOLAR.porsiSiang[profil] ?? SOLAR.porsiSiang.rumah;
    return Math.min(SOLAR.porsiSiangMaks, dasar + (baterai ? SOLAR.tambahanBaterai : 0));
  }

  /**
   * Energi surya yang benar-benar terpakai sendiri.
   *
   * Model jenuh: selama produksi masih jauh di bawah beban siang, hampir semua
   * kWh terserap; begitu produksi melewati beban siang, tambahan kWh makin
   * banyak yang terbuang karena ekspor tidak dikreditkan.
   *   terpakai = bebanSiang x (1 - e^(-produksi / bebanSiang))
   *
   * @param {number} produksi   kWh/bulan dari panel
   * @param {number} bebanSiang kWh/bulan konsumsi di jam matahari
   */
  function energiTerpakai(produksi, bebanSiang) {
    if (bebanSiang <= 0) return 0;
    return bebanSiang * (1 - Math.exp(-produksi / bebanSiang));
  }

  /**
   * Nilai kini bersih sebuah sistem selama umur pakainya.
   * @param {number} capex        biaya terpasang (Rp)
   * @param {number} hematTahunan penghematan tahun pertama (Rp)
   * @returns {number} NPV dalam Rupiah
   */
  function npvSistem(capex, hematTahunan) {
    const om = capex * SOLAR.biayaOM;
    let npv = -capex;
    for (let t = 1; t <= SOLAR.umurSistem; t++) {
      const arus = hematTahunan * Math.pow(1 - SOLAR.degradasiTahunan, t - 1) - om;
      npv += arus / Math.pow(1 + SOLAR.diskonto, t);
    }
    return npv;
  }

  /**
   * Ukuran sistem yang memberi NPV tertinggi.
   *
   * Karena kelebihan produksi tidak dikreditkan, kWh tambahan makin lama makin
   * sedikit yang terpakai sementara biayanya tetap. Jadi ada satu ukuran yang
   * optimal — menambah panel di atas itu justru menurunkan nilai investasi.
   */
  function ukuranOptimal(o) {
    const psh = angkaAman(o.psh, 4.7, SOLAR.pshMinimum, SOLAR.pshMaksimum);
    const perBulanPerKwp = psh * SOLAR.performanceRatio * 30;
    const minimum = angkaAman(o.kwpMin, SOLAR.kwpMinimum, 0.5, SOLAR.kwpMaksimum);

    // Di atas 2x beban siang, tambahan kWh hampir seluruhnya terbuang.
    const batas = Math.min(
      angkaAman(o.kwpMaks, SOLAR.kwpMaksimum, minimum, SOLAR.kwpMaksimum),
      Math.max(minimum, (o.bebanSiang * 2) / perBulanPerKwp)
    );

    // Langkah dibuat menyesuaikan rentang supaya jumlah percobaan tetap
    // terbatas — tanpa ini, rentang yang lebar membuat perulangan ini
    // berjalan sangat lama dan menggantung permintaan yang memanggilnya.
    const langkah = Math.max(0.5, Math.ceil(((batas - minimum) / SOLAR.langkahPencarian) * 2) / 2);

    let terbaik = minimum, npvTerbaik = -Infinity;
    for (let kwp = minimum; kwp <= batas + 0.001; kwp += langkah) {
      const produksi = kwp * perBulanPerKwp;
      const terpakai = energiTerpakai(produksi, o.bebanSiang);
      let capex = capexPlts(kwp);
      if (o.baterai) capex += Math.max(5, Math.round((produksi / 30) * 0.35)) * SOLAR.hargaBaterai;
      const npv = npvSistem(capex, terpakai * o.tarif * 12);
      if (npv > npvTerbaik) { npvTerbaik = npv; terbaik = kwp; }
    }
    return terbaik;
  }

  /**
   * Model ekonomi PLTS Atap.
   * @param {object} o
   * @param {number}  o.tagihan       tagihan listrik bulanan (Rp)
   * @param {number}  [o.psh]         peak sun hour lokasi
   * @param {number}  [o.tarif]       tarif PLN Rp/kWh
   * @param {boolean} [o.baterai]     sertakan baterai
   * @param {string}  [o.profil]      'rumah' | 'bisnis' | 'industri'
   * @param {number}  [o.porsiSiang]  override porsi konsumsi di jam matahari
   * @param {number}  [o.kwpManual]   paksa ukuran sistem tertentu
   * @param {number}  [o.targetSiang] porsi beban siang yang ingin ditutup (0–1)
   */
  function hitungPlts(o) {
    const tarif   = angkaAman(o.tarif, TARIFF['R-1/1300'].rate, 1, 100000);
    const psh     = angkaAman(o.psh, 4.7, SOLAR.pshMinimum, SOLAR.pshMaksimum);
    const tagihan = angkaAman(o.tagihan, 0, 0);
    const profil  = SOLAR.porsiSiang[o.profil] != null ? o.profil : 'rumah';
    const konsumsiKwh = tagihan / tarif;

    const porsi = o.porsiSiang != null
      ? Math.min(SOLAR.porsiSiangMaks,
                 angkaAman(o.porsiSiang, SOLAR.porsiSiang[profil], 0.05, 1) +
                 (o.baterai ? SOLAR.tambahanBaterai : 0))
      : porsiSiangEfektif(profil, o.baterai);
    const bebanSiang = konsumsiKwh * porsi;

    const kwp = o.kwpManual
      ? angkaAman(o.kwpManual, SOLAR.kwpMinimum, 0.5, SOLAR.kwpMaksimum)
      : ukuranOptimal({ bebanSiang, psh, tarif, baterai: !!o.baterai,
                        kwpMaks: o.kwpMaks, kwpMin: o.kwpMin });

    const produksi = produksiBulanan(kwp, psh);
    const terpakai = energiTerpakai(produksi, bebanSiang);
    const terbuang = Math.max(0, produksi - terpakai);
    const hematBulanan = Math.round(terpakai * tarif);
    const hematPersen = tagihan > 0
      ? Math.min(99, Math.round((hematBulanan / tagihan) * 100))
      : 0;

    let capex = capexPlts(kwp);
    let kapasitasBaterai = 0;
    if (o.baterai) {
      // Baterai disiapkan untuk menyimpan sekitar sepertiga produksi harian.
      kapasitasBaterai = Math.max(5, Math.round((produksi / 30) * 0.35));
      capex += kapasitasBaterai * SOLAR.hargaBaterai;
    }

    const omTahunan = capex * SOLAR.biayaOM;
    const hematTahunanBersih = hematBulanan * 12 - omTahunan;
    const payback = hematTahunanBersih > 0 ? capex / hematTahunanBersih : Infinity;

    // Nilai bersih sepanjang umur sistem, memperhitungkan degradasi modul.
    let total = 0;
    for (let th = 0; th < SOLAR.umurSistem; th++) {
      total += hematBulanan * 12 * Math.pow(1 - SOLAR.degradasiTahunan, th) - omTahunan;
    }
    const npv = npvSistem(capex, hematBulanan * 12);

    // Batas atas penghematan pada lokasi & profil ini, berapa pun panelnya.
    const batasHematPersen = Math.round(porsi * 100);

    return {
      kwp,
      luasAtap: Math.round(kwp * SOLAR.luasPerKwp),
      jumlahModul: Math.ceil((kwp * 1000) / 620),
      produksiBulanan: Math.round(produksi),
      konsumsiBulanan: Math.round(konsumsiKwh),
      bebanSiang: Math.round(bebanSiang),
      kwhTerpakai: Math.round(terpakai),
      kwhTerbuang: Math.round(terbuang),
      rasioTerpakai: Math.round((terpakai / produksi) * 100),
      batasHematPersen,
      hematBulanan,
      hematPersen,
      hematTahunan: hematBulanan * 12,
      tagihanBaru: Math.max(0, Math.round(tagihan - hematBulanan)),
      capex,
      kapasitasBaterai,
      paybackTahun: isFinite(payback) ? Math.round(payback * 10) / 10 : null,
      nilai25Tahun: Math.round(total),
      npv: Math.round(npv),
      layak: npv > 0,
      co2Tahunan: Math.round(terpakai * 12 * SOLAR.emisiGrid),
      pohonSetara: Math.round((terpakai * 12 * SOLAR.emisiGrid) / 21),
    };
  }

  /* ---------- FORMAT ---------- */
  function rupiah(n) {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }
  function rupiahSingkat(n) {
    if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1).replace('.', ',') + ' M';
    if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',') + ' jt';
    if (n >= 1e3) return 'Rp ' + Math.round(n / 1e3) + 'rb';
    return 'Rp ' + Math.round(n);
  }

  return { SITE, TARIFF, SOLAR, PAKET, KOTA, NAV, NAV_CTA, FOOTER,
           angkaAman, capexPlts, produksiBulanan, porsiSiangEfektif, energiTerpakai,
           npvSistem, ukuranOptimal,
           hitungPlts, rupiah, rupiahSingkat };
});

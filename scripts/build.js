#!/usr/bin/env node
/**
 * Pembangun halaman statis EnVisor.
 *
 * Menghasilkan halaman panduan, blog, dan lokasi dari data bersama, lalu
 * menulis sitemap.xml dan robots.txt. Dijalankan dengan `npm run build`.
 *
 * Halaman lokasi sengaja dibuat statis satu berkas per kota — bukan satu
 * halaman dengan parameter — supaya tiap kota punya URL sendiri yang bisa
 * diindeks mesin pencari.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { SITE, KOTA, TARIFF, hitungPlts, rupiah, rupiahSingkat, capexPlts } =
  require(path.join(ROOT, 'data/site-data.js'));
const { PANDUAN, BLOG } = require(path.join(ROOT, 'data/content.js'));

/* ---------- util ---------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tanggalID = (iso) => new Date(iso).toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric',
});

function tulis(relPath, isi) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, isi);
  return relPath;
}

/**
 * Kerangka HTML bersama untuk seluruh halaman yang dihasilkan.
 * @param {{judul:string, deskripsi:string, url:string, body:string, jsonLd?:object}} o
 */
function halaman(o) {
  const jsonLd = o.jsonLd
    ? '<script type="application/ld+json">' + JSON.stringify(o.jsonLd) + '</script>'
    : '';
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.judul)}</title>
<meta name="description" content="${esc(o.deskripsi)}">
<link rel="canonical" href="${SITE.domain}${o.url}">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:title" content="${esc(o.judul)}">
<meta property="og:description" content="${esc(o.deskripsi)}">
<meta property="og:url" content="${SITE.domain}${o.url}">
<link rel="icon" href="/icons/icon-192x192.png">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
${jsonLd}
</head>
<body>
<nav data-nav></nav>
${o.body}
<footer data-footer></footer>
<script src="/data/site-data.js"></script>
<script src="/js/site.js"></script>
${o.script || ''}
</body>
</html>
`;
}

/** Remah roti yang sama bentuknya di seluruh halaman turunan. */
function crumb(jalur) {
  return '<div class="crumb">' + jalur.map((j, i) =>
    (i ? '<span>/</span>' : '') + (j.href ? `<a href="${j.href}">${esc(j.label)}</a>` : esc(j.label))
  ).join('') + '</div>';
}

const halamanDibuat = [];

/* ---------- 1. PANDUAN ---------- */

PANDUAN.forEach((p) => {
  const lain = PANDUAN.filter((x) => x.slug !== p.slug).slice(0, 3);
  const body = `
<article>
  <header class="hero-light" style="text-align:left">
    <div class="article">
      ${crumb([{ label: 'Beranda', href: '/index.html' }, { label: 'Panduan', href: '/panduan.html' }, { label: p.judul }])}
      <span class="badge badge-amber">${esc(p.kategori)}</span>
      <h1 style="margin:12px 0 10px">${esc(p.judul)}</h1>
      <p class="lead">${esc(p.ringkas)}</p>
      <div class="article-meta" style="margin-top:18px"><span>⏱ ${p.menit} menit baca</span></div>
    </div>
  </header>
  <section class="tight"><div class="article"><div class="prose">${p.body}</div></div></section>
</article>

<section class="tight"><div class="container">
  <div class="sec-head left"><h2>Panduan lainnya</h2></div>
  <div class="grid g3">
    ${lain.map((x) => `<a class="post-card" href="/panduan/${x.slug}.html">
      <span class="badge badge-slate">${esc(x.kategori)}</span>
      <h3>${esc(x.judul)}</h3><p>${esc(x.ringkas)}</p>
      <span class="meta">${x.menit} menit baca →</span></a>`).join('')}
  </div>
</div></section>

<section><div class="container-narrow"><div class="cta-band">
  <h2 style="color:#fff">Cek dulu angkanya untuk kasusmu</h2>
  <p>Kalkulator PLTS dan audit tagihan memakai model yang sama dengan panduan ini.</p>
  <div class="btn-row center">
    <a class="btn btn-primary" href="/surya.html#kalkulator">Hitung PLTS</a>
    <a class="btn btn-ghost" href="/audit-tagihan.html">Audit tagihan</a>
  </div>
</div></div></section>`;

  halamanDibuat.push(tulis(`panduan/${p.slug}.html`, halaman({
    judul: `${p.judul} | Panduan EnVisor`,
    deskripsi: p.ringkas,
    url: `/panduan/${p.slug}.html`,
    ogType: 'article',
    body,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'TechArticle',
      headline: p.judul, description: p.ringkas,
      author: { '@type': 'Organization', name: SITE.name },
      publisher: { '@type': 'Organization', name: SITE.name },
      mainEntityOfPage: `${SITE.domain}/panduan/${p.slug}.html`,
    },
  })));
});

/* ---------- 2. BLOG ---------- */

BLOG.forEach((p) => {
  const lain = BLOG.filter((x) => x.slug !== p.slug).slice(0, 3);
  const body = `
<article>
  <header class="hero-light" style="text-align:left">
    <div class="article">
      ${crumb([{ label: 'Beranda', href: '/index.html' }, { label: 'Blog', href: '/blog.html' }, { label: p.judul }])}
      <span class="badge badge-amber">${esc(p.kategori)}</span>
      <h1 style="margin:12px 0 10px">${esc(p.judul)}</h1>
      <p class="lead">${esc(p.ringkas)}</p>
      <div class="article-meta" style="margin-top:18px">
        <span>${tanggalID(p.tanggal)}</span><span>·</span><span>⏱ ${p.menit} menit baca</span>
      </div>
    </div>
  </header>
  <section class="tight"><div class="article"><div class="prose">${p.body}</div></div></section>
</article>

<section class="tight"><div class="container">
  <div class="sec-head left"><h2>Tulisan lainnya</h2></div>
  <div class="grid g3">
    ${lain.map((x) => `<a class="post-card" href="/blog/${x.slug}.html">
      <span class="badge badge-slate">${esc(x.kategori)}</span>
      <h3>${esc(x.judul)}</h3><p>${esc(x.ringkas)}</p>
      <span class="meta">${tanggalID(x.tanggal)} →</span></a>`).join('')}
  </div>
</div></section>`;

  halamanDibuat.push(tulis(`blog/${p.slug}.html`, halaman({
    judul: `${p.judul} | Blog EnVisor`,
    deskripsi: p.ringkas,
    url: `/blog/${p.slug}.html`,
    ogType: 'article',
    body,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.judul, description: p.ringkas, datePublished: p.tanggal,
      author: { '@type': 'Organization', name: SITE.name },
      publisher: { '@type': 'Organization', name: SITE.name },
      mainEntityOfPage: `${SITE.domain}/blog/${p.slug}.html`,
    },
  })));
});

/* ---------- 3. LOKASI ---------- */

/** Golongan tarif yang wajar dipakai sebagai contoh untuk tagihan tertentu. */
function golonganContoh(tagihan) {
  if (tagihan >= 900000) return 'R-1M/3500';
  if (tagihan >= 600000) return 'R-1/2200';
  return 'R-1/1300';
}

KOTA.forEach((k) => {
  const gol = golonganContoh(k.tagihan);
  const tarif = TARIFF[gol].rate;

  // Tiga contoh perhitungan supaya pengunjung bisa memilih yang paling dekat.
  const contoh = [
    { label: 'Rumah tangga', tagihan: k.tagihan, profil: 'rumah' },
    { label: 'Rumah besar / kos', tagihan: k.tagihan * 2.5, profil: 'rumah' },
    { label: 'Toko atau kantor kecil', tagihan: k.tagihan * 6, profil: 'bisnis' },
  ].map((c) => ({
    ...c,
    hasil: hitungPlts({
      tagihan: c.tagihan, psh: k.psh, profil: c.profil,
      tarif: c.profil === 'bisnis' ? TARIFF['B-2/6600'].rate : tarif,
    }),
  }));

  const tetangga = KOTA.filter((x) => x.slug !== k.slug).slice(0, 6);
  const produksiPerKwp = Math.round(k.psh * 0.78 * 30);

  const body = `
<header class="hero-light" style="text-align:left">
  <div class="container">
    ${crumb([{ label: 'Beranda', href: '/index.html' }, { label: 'Area Layanan', href: '/lokasi.html' }, { label: k.nama }])}
    <h1>PLTS Atap ${esc(k.nama)} — <em>Estimasi Hemat &amp; Balik Modal</em></h1>
    <p class="lead" style="max-width:62ch">${esc(k.ciri)} Halaman ini memakai iradiasi
      ${String(k.psh).replace('.', ',')} jam puncak matahari per hari untuk ${esc(k.nama)}, ${esc(k.prov)}.</p>
    <div class="hero-stats" style="margin-top:24px">
      <div><strong style="color:var(--acc)">${String(k.psh).replace('.', ',')}</strong><span>jam puncak matahari</span></div>
      <div><strong style="color:var(--acc)">${produksiPerKwp}</strong><span>kWh/bulan per kWp</span></div>
      <div><strong style="color:var(--acc)">${String(k.ppjt).replace('.', ',')}%</strong><span>PBJT indikatif</span></div>
    </div>
  </div>
</header>

<section>
  <div class="container">
    <div class="sec-head left">
      <div class="eyebrow">Estimasi ${esc(k.nama)}</div>
      <h2>Tiga contoh perhitungan</h2>
      <p class="lead">Ukuran sistem dipilih berdasarkan nilai investasi tertinggi, bukan target penghematan tertentu.</p>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Profil</th><th>Tagihan</th><th>Sistem</th><th>Hemat/bulan</th><th>Biaya</th><th>Balik modal</th></tr></thead>
      <tbody>
        ${contoh.map((c) => `<tr>
          <td><strong>${c.label}</strong></td>
          <td>${rupiahSingkat(c.tagihan)}</td>
          <td>${c.hasil.kwp} kWp</td>
          <td class="t-good">${rupiahSingkat(c.hasil.hematBulanan)}</td>
          <td>${rupiahSingkat(c.hasil.capex)}</td>
          <td>${c.hasil.layak ? c.hasil.paybackTahun + ' tahun' : '<span class="t-bad">belum layak</span>'}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <div class="note" style="margin-top:20px">
      Angka dihitung dari iradiasi ${esc(k.nama)} dan tarif PLN yang berlaku, dengan asumsi kelebihan
      produksi tidak dikreditkan. Baris yang ditandai <strong>belum layak</strong> berarti biaya sistem
      tidak tertutup penghematannya — dalam kasus itu efisiensi lebih dulu memberi hasil lebih baik.
    </div>
    <div class="btn-row" style="margin-top:24px">
      <a class="btn btn-primary" href="/surya.html#kalkulator">Hitung untuk tagihanmu sendiri</a>
      <a class="btn btn-ghost" href="/audit-tagihan.html">Periksa tagihan dulu</a>
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="container">
    <div class="grid g2" style="gap:40px;align-items:start">
      <div>
        <h2>Yang perlu diperhatikan di ${esc(k.nama)}</h2>
        <ul class="checklist" style="margin-top:18px">
          <li>Iradiasi ${String(k.psh).replace('.', ',')} jam puncak per hari — setiap 1 kWp menghasilkan sekitar ${produksiPerKwp} kWh per bulan.</li>
          <li>Permohonan PLTS Atap diajukan melalui ${esc(k.uid)} dan mengikuti kuota wilayah setempat.</li>
          <li>PBJT tenaga listrik di ${esc(k.prov)} berkisar ${String(k.ppjt).replace('.', ',')}% — perlu dicek pada Perda terbaru.</li>
          <li>${esc(k.ciri)}</li>
        </ul>
      </div>
      <div class="card-flat">
        <h3>Acuan biaya terpasang</h3>
        <p style="font-size:14px;color:var(--mid);margin:8px 0 16px">Berlaku umum, belum termasuk baterai dan perbaikan struktur atap.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Ukuran</th><th>Biaya</th><th>Per kWp</th></tr></thead>
          <tbody>${[3, 5, 10, 20].map((kwp) => `<tr>
            <td>${kwp} kWp</td><td>${rupiahSingkat(capexPlts(kwp))}</td>
            <td>${rupiahSingkat(capexPlts(kwp) / kwp)}</td></tr>`).join('')}</tbody>
        </table></div>
        <a class="btn btn-dark btn-block" href="/harga.html" style="margin-top:16px">Daftar harga lengkap</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="sec-head left"><h2>Kota lain</h2></div>
    <div class="link-grid">
      ${tetangga.map((x) => `<a href="/lokasi/${x.slug}.html">PLTS Atap ${esc(x.nama)}</a>`).join('')}
      <a href="/lokasi.html">Lihat semua kota →</a>
    </div>
  </div>
</section>`;

  halamanDibuat.push(tulis(`lokasi/${k.slug}.html`, halaman({
    judul: `PLTS Atap ${k.nama} 2026 — Biaya, Hemat & Balik Modal | EnVisor`,
    deskripsi: `Estimasi PLTS Atap untuk ${k.nama}, ${k.prov}: ukuran sistem optimal, biaya terpasang, penghematan bulanan, dan tahun balik modal berbasis iradiasi ${k.psh} jam puncak per hari.`,
    url: `/lokasi/${k.slug}.html`,
    body,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Service',
      serviceType: 'Pemasangan PLTS Atap',
      provider: { '@type': 'Organization', name: SITE.name },
      areaServed: { '@type': 'City', name: k.nama, containedInPlace: { '@type': 'AdministrativeArea', name: k.prov } },
    },
  })));
});

/* ---------- 4. HALAMAN INDUK ---------- */

// Panduan
halamanDibuat.push(tulis('panduan.html', halaman({
  judul: 'Panduan Energi & PLTS Atap Indonesia | EnVisor',
  deskripsi: 'Kumpulan panduan lengkap soal PLTS Atap, tagihan PLN, golongan tarif, baterai, regulasi, audit energi industri, dan jejak karbon.',
  url: '/panduan.html',
  body: `
<header class="hero-light">
  <div class="container">
    <div class="eyebrow">Sumber Daya</div>
    <h1>Panduan Energi &amp; <em>PLTS Atap</em></h1>
    <p class="lead">Materi teknis yang ditulis apa adanya — termasuk bagian yang jarang dibahas brosur:
      kapan sesuatu <em>tidak</em> masuk akal untuk dipasang.</p>
  </div>
</header>

<section>
  <div class="container">
    <div class="grid g3">
      ${PANDUAN.map((p) => `<a class="post-card" href="/panduan/${p.slug}.html">
        <span class="badge badge-amber">${esc(p.kategori)}</span>
        <h3>${esc(p.judul)}</h3><p>${esc(p.ringkas)}</p>
        <span class="meta">${p.menit} menit baca →</span></a>`).join('')}
    </div>
  </div>
</section>

<section class="tight"><div class="container-narrow"><div class="cta-band">
  <h2 style="color:#fff">Dari teori ke angkamu sendiri</h2>
  <p>Semua panduan di atas memakai model perhitungan yang sama dengan alat di bawah ini.</p>
  <div class="btn-row center">
    <a class="btn btn-primary" href="/surya.html#kalkulator">Kalkulator PLTS</a>
    <a class="btn btn-ghost" href="/audit-tagihan.html">Audit tagihan PLN</a>
  </div>
</div></div></section>`,
})));

// Blog
const blogUrut = [...BLOG].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
halamanDibuat.push(tulis('blog.html', halaman({
  judul: 'Blog Energi Indonesia — Tagihan, PLTS & Keberlanjutan | EnVisor',
  deskripsi: 'Analisis soal tagihan listrik PLN, kelayakan PLTS Atap, dan penyusunan program net zero untuk perusahaan Indonesia.',
  url: '/blog.html',
  body: `
<header class="hero-light">
  <div class="container">
    <div class="eyebrow">Blog</div>
    <h1>Tulisan tentang <em>listrik dan biayanya</em></h1>
    <p class="lead">Analisis berbasis angka, bukan pemasaran.</p>
  </div>
</header>

<section>
  <div class="container">
    <div class="grid g3">
      ${blogUrut.map((p) => `<a class="post-card" href="/blog/${p.slug}.html">
        <span class="badge badge-amber">${esc(p.kategori)}</span>
        <h3>${esc(p.judul)}</h3><p>${esc(p.ringkas)}</p>
        <span class="meta">${tanggalID(p.tanggal)} · ${p.menit} menit →</span></a>`).join('')}
    </div>
  </div>
</section>`,
})));

// Lokasi
halamanDibuat.push(tulis('lokasi.html', halaman({
  judul: 'Area Layanan PLTS Atap Indonesia — Estimasi per Kota | EnVisor',
  deskripsi: 'Estimasi PLTS Atap untuk 12 kota besar Indonesia, lengkap dengan iradiasi lokal, biaya terpasang, dan perkiraan balik modal.',
  url: '/lokasi.html',
  body: `
<header class="hero-light">
  <div class="container">
    <div class="eyebrow">Area Layanan</div>
    <h1>Estimasi PLTS Atap <em>per kota</em></h1>
    <p class="lead">Iradiasi matahari berbeda antar kota, dan selisihnya sampai 20%.
      Pilih kotamu untuk melihat perhitungan yang memakai angka setempat.</p>
  </div>
</header>

<section>
  <div class="container">
    <div class="table-wrap"><table>
      <thead><tr><th>Kota</th><th>Provinsi</th><th>Jam puncak matahari</th><th>kWh/bulan per kWp</th><th></th></tr></thead>
      <tbody>
        ${[...KOTA].sort((a, b) => b.psh - a.psh).map((k) => `<tr>
          <td><strong>${esc(k.nama)}</strong></td>
          <td>${esc(k.prov)}</td>
          <td>${String(k.psh).replace('.', ',')} jam</td>
          <td class="t-good">${Math.round(k.psh * 0.78 * 30)} kWh</td>
          <td><a href="/lokasi/${k.slug}.html" style="font-weight:800;color:var(--acc)">Lihat →</a></td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <div class="note" style="margin-top:20px">
      Kotamu belum ada di daftar? Kalkulator di halaman
      <a href="/surya.html#kalkulator" style="color:#92400e;font-weight:800">PLTS Atap</a>
      menerima input iradiasi mana pun, dan kami melayani seluruh wilayah Jawa, Bali, Sumatera, dan Kalimantan.
    </div>
  </div>
</section>`,
})));

/* ---------- 4. SITEMAP & ROBOTS ---------- */

const halamanUtama = [
  { url: '/index.html', prioritas: '1.0' },
  { url: '/surya.html', prioritas: '0.9' },
  { url: '/harga.html', prioritas: '0.9' },
  { url: '/audit-tagihan.html', prioritas: '0.9' },
  { url: '/monitoring.html', prioritas: '0.8' },
  { url: '/hems.html', prioritas: '0.8' },
  { url: '/rec.html', prioritas: '0.8' },
  { url: '/bisnis.html', prioritas: '0.8' },
  { url: '/slo.html', prioritas: '0.8' },
  { url: '/banding.html', prioritas: '0.7' },
  { url: '/panduan.html', prioritas: '0.7' },
  { url: '/blog.html', prioritas: '0.7' },
  { url: '/lokasi.html', prioritas: '0.7' },
  { url: '/kuesioner.html', prioritas: '0.4' },
  { url: '/privacy.html', prioritas: '0.3' },
];

const semua = [
  ...halamanUtama,
  ...PANDUAN.map((p) => ({ url: `/panduan/${p.slug}.html`, prioritas: '0.6' })),
  ...BLOG.map((p) => ({ url: `/blog/${p.slug}.html`, prioritas: '0.6' })),
  ...KOTA.map((k) => ({ url: `/lokasi/${k.slug}.html`, prioritas: '0.6' })),
];

const hariIni = new Date().toISOString().slice(0, 10);
tulis('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  semua.map((h) => `  <url><loc>${SITE.domain}${h.url}</loc><lastmod>${hariIni}</lastmod><priority>${h.prioritas}</priority></url>`).join('\n') +
  '\n</urlset>\n');

tulis('robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

console.log(`Selesai. ${halamanDibuat.length} halaman dibuat, sitemap berisi ${semua.length} URL.`);
console.log('  panduan : ' + PANDUAN.length);
console.log('  blog    : ' + BLOG.length);
console.log('  lokasi  : ' + KOTA.length);

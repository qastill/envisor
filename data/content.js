/* ============================================================
   EnVisor — isi Panduan & Blog.
   Dipisah dari site-data.js supaya file data inti tetap ringan.
   Dipakai oleh scripts/build.js untuk menghasilkan halaman statis.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EnVisorContent = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  /* ---------------- PANDUAN ---------------- */
  const PANDUAN = [
    {
      slug: 'plts-atap-indonesia',
      judul: 'Panduan PLTS Atap Indonesia 2026',
      ringkas: 'Cara kerja, komponen, biaya, perizinan, dan cara menilai apakah PLTS masuk akal untuk bangunanmu.',
      kategori: 'PLTS',
      menit: 9,
      body: `
<p>PLTS Atap adalah pembangkit listrik tenaga surya yang dipasang di atap bangunan dan tersambung ke instalasi listrik yang sudah ada. Tujuannya sederhana: menghasilkan listrik sendiri di siang hari sehingga listrik yang ditarik dari PLN berkurang.</p>

<h2>Komponen sistem</h2>
<ul>
  <li><strong>Modul surya</strong> — mengubah cahaya menjadi listrik searah. Modul kelas atas saat ini berkapasitas 580–620 Wp per keping.</li>
  <li><strong>Inverter</strong> — mengubah listrik searah menjadi bolak-balik 220 V agar bisa dipakai perangkat rumah. Ini komponen yang paling mungkin perlu diganti di tengah umur sistem.</li>
  <li><strong>Mounting</strong> — rangka penyangga yang harus cocok dengan jenis atap dan tahan korosi di iklim lembap.</li>
  <li><strong>Proteksi</strong> — pengaman arus searah dan bolak-balik, penyalur petir, dan pembumian.</li>
  <li><strong>Monitoring</strong> — pemantauan produksi agar penurunan performa terdeteksi sebelum menjadi kerugian.</li>
</ul>

<h2>Berapa listrik yang dihasilkan</h2>
<p>Produksi bergantung pada iradiasi lokal, yang biasa dinyatakan sebagai <em>peak sun hour</em> — jumlah jam setara penyinaran penuh per hari. Di Indonesia angkanya berkisar 4,4 sampai 5,3 jam. Setelah dikurangi rugi-rugi inverter, kabel, suhu, dan kotoran, sekitar 22% energi hilang.</p>
<blockquote>Produksi bulanan ≈ kapasitas (kWp) × peak sun hour × 0,78 × 30 hari</blockquote>
<p>Sistem 5 kWp di kota dengan peak sun hour 4,8 menghasilkan sekitar 5 × 4,8 × 0,78 × 30 = 562 kWh per bulan.</p>

<h2>Bagian yang paling sering disalahpahami</h2>
<p>Angka produksi di atas <strong>bukan</strong> angka penghematan. Sejak berlakunya aturan PLTS Atap terbaru, kelebihan listrik yang diekspor ke jaringan PLN tidak lagi dikreditkan sebagai pengurang tagihan. Yang bernilai ekonomi hanya listrik yang benar-benar dipakai pada saat diproduksi.</p>
<p>Konsekuensinya: profil pemakaian menjadi faktor penentu. Pabrik yang bekerja pukul 08.00–17.00 bisa menyerap hampir seluruh produksi. Rumah tangga yang penghuninya bekerja di luar dan puncak pemakaiannya malam hari mungkin hanya menyerap 40–45%.</p>

<h2>Menghitung ukuran yang tepat</h2>
<p>Menambah panel terus-menerus tidak selalu menguntungkan. Setelah produksi melampaui beban siang hari, setiap kWp tambahan makin banyak terbuang sementara biayanya tetap penuh. Ada satu titik di mana nilai investasi paling tinggi, dan melewatinya justru menurunkan imbal hasil.</p>
<p><a href="/surya.html#kalkulator">Kalkulator PLTS EnVisor</a> mencari titik tersebut dengan membandingkan nilai kini bersih di setiap ukuran sistem, bukan dengan mengejar target penghematan tertentu.</p>

<h2>Biaya dan perizinan</h2>
<p>Biaya terpasang terdiri dari komponen tetap — perizinan, sertifikat laik operasi, proteksi, dan mobilisasi tim — ditambah komponen yang sebanding dengan kapasitas. Karena ada komponen tetap, harga per kWp turun tajam seiring membesarnya sistem: sekitar Rp 14–16 juta per kWp untuk 2–3 kWp, namun bisa di bawah Rp 9 juta per kWp untuk sistem di atas 20 kWp.</p>
<p>Pemasangan yang tersambung jaringan wajib melalui permohonan ke PLN dan memerlukan Sertifikat Laik Operasi. Instalasi tanpa izin berisiko dibongkar dan menghilangkan perlindungan asuransi bila terjadi kebakaran.</p>

<h2>Kapan PLTS belum masuk akal</h2>
<ul>
  <li>Tagihan bulanan masih di bawah sekitar Rp 1,5 juta dan pemakaian siang hari rendah.</li>
  <li>Atap ternaungi bangunan atau pohon selama lebih dari dua jam pada jam produktif.</li>
  <li>Struktur atap sudah tua dan perlu diperbaiki lebih dulu.</li>
  <li>Bangunan akan dijual atau direnovasi besar dalam waktu dekat.</li>
</ul>
<p>Dalam kondisi tersebut, memperbaiki efisiensi biasanya memberi pengembalian jauh lebih cepat. <a href="/index.html">Audit AI EnVisor</a> gratis dan bisa menunjukkan perangkat mana yang paling banyak menyedot biaya.</p>`,
    },

    {
      slug: 'hitung-tagihan-listrik',
      judul: 'Cara Membaca dan Menghitung Tagihan Listrik PLN',
      ringkas: 'Anatomi lengkap rekening listrik: tarif, rekening minimum, PBJT, dan cara memeriksa apakah tagihanmu wajar.',
      kategori: 'Tagihan',
      menit: 7,
      body: `
<p>Banyak orang membayar tagihan listrik tanpa pernah tahu angkanya disusun dari apa. Padahal begitu strukturnya dipahami, memeriksa kewajaran tagihan hanya butuh dua menit.</p>

<h2>Rumus dasar</h2>
<blockquote>Tagihan = (kWh terpakai × tarif per kWh) + PBJT + bea meterai bila berlaku</blockquote>
<p>kWh terpakai adalah selisih angka stand meter akhir dan awal bulan. Tarif per kWh ditentukan golongan tarif, bukan oleh besarnya pemakaian.</p>

<h2>Golongan tarif menentukan harga</h2>
<div class="table-wrap"><table>
<thead><tr><th>Golongan</th><th>Peruntukan</th><th>Tarif (Rp/kWh)</th></tr></thead>
<tbody>
<tr><td>R-1 / 900 VA non-subsidi</td><td>Rumah tangga</td><td>1.352</td></tr>
<tr><td>R-1 / 1.300–2.200 VA</td><td>Rumah tangga</td><td>1.444,70</td></tr>
<tr><td>R-1 / 3.500–5.500 VA</td><td>Rumah tangga</td><td>1.699,53</td></tr>
<tr><td>B-2 / 6.600 VA–200 kVA</td><td>Bisnis</td><td>1.444,70</td></tr>
<tr><td>I-3 / di atas 200 kVA</td><td>Industri</td><td>1.114,74</td></tr>
</tbody></table></div>
<p>Perhatikan hal yang sering mengejutkan: rumah tangga besar justru membayar per kWh lebih mahal daripada industri. Struktur ini disengaja, karena tarif industri diarahkan menjaga daya saing produksi.</p>

<h2>Rekening minimum: biaya yang tetap muncul</h2>
<p>Pelanggan pascabayar dikenakan rekening minimum setara 40 jam nyala:</p>
<blockquote>Rekening minimum = 40 × daya tersambung (kVA) × tarif per kWh</blockquote>
<p>Untuk daya 3.500 VA pada tarif Rp 1.699,53, angkanya 40 × 3,5 × 1.699,53 = Rp 237.934. Artinya, meskipun rumah ditinggal kosong sebulan penuh, tagihannya tetap sekitar angka itu. Inilah alasan daya yang kebesaran menjadi pemborosan tersembunyi.</p>

<h2>PBJT tenaga listrik</h2>
<p>Dulu dikenal sebagai Pajak Penerangan Jalan, kini menjadi Pajak Barang dan Jasa Tertentu berdasarkan UU 1/2022 tentang Hubungan Keuangan Pusat dan Daerah. Besarannya diatur Perda masing-masing daerah dan <strong>paling tinggi 10%</strong>. Nilainya berbeda antar kota, sehingga tagihan dengan pemakaian sama bisa berbeda antar daerah.</p>

<h2>Memeriksa kewajaran dalam dua menit</h2>
<ol>
  <li>Bagi total tagihan dengan kWh terpakai untuk mendapat tarif efektif.</li>
  <li>Bandingkan dengan tarif golonganmu ditambah PBJT daerah.</li>
  <li>Selisih di atas 15% adalah tanda perlu diperiksa lebih lanjut.</li>
</ol>
<p>Penyebab tersering selisih besar: pencatatan taksiran yang kemudian dikoreksi sekaligus, kesalahan baca stand meter, faktor kali meter yang salah, atau tunggakan bulan sebelumnya yang ikut ditagihkan.</p>
<p><a href="/audit-tagihan.html">Alat audit tagihan EnVisor</a> menjalankan seluruh pemeriksaan ini otomatis dan menjelaskan langkah klaim yang bisa kamu tempuh.</p>

<h2>Prabayar dan pascabayar</h2>
<p>Pelanggan token tidak dikenakan rekening minimum, tetapi PBJT dan biaya administrasi sudah dipotong di muka saat pembelian. Karena itu kWh yang masuk selalu lebih kecil daripada nominal token dibagi tarif — dan itu normal, bukan kecurangan.</p>`,
    },

    {
      slug: 'golongan-tarif-pln',
      judul: 'Memilih Golongan Tarif dan Daya PLN yang Tepat',
      ringkas: 'Kapan turun daya menghemat, kapan justru merepotkan, dan bagaimana golongan yang salah membuat tagihan membengkak.',
      kategori: 'Tagihan',
      menit: 6,
      body: `
<p>Daya tersambung dan golongan tarif adalah dua keputusan yang jarang ditinjau ulang setelah rumah dibangun, padahal keduanya berpengaruh langsung pada tagihan setiap bulan.</p>

<h2>Daya tersambung bukan sekadar angka</h2>
<p>Daya menentukan berapa banyak perangkat yang boleh menyala bersamaan sebelum MCB anjlok. Tetapi pada pelanggan pascabayar, daya juga menentukan rekening minimum — jumlah yang tetap ditagih meskipun listrik nyaris tidak dipakai.</p>
<p>Ini menciptakan pemborosan yang tidak terlihat: rumah dengan daya 5.500 VA yang sebenarnya hanya butuh 2.200 VA membayar biaya kapasitas menganggur setiap bulan, seumur langganan.</p>

<h2>Cara menilai apakah dayamu kebesaran</h2>
<p>Hitung faktor beban:</p>
<blockquote>Faktor beban = kWh sebulan ÷ (daya kVA × 720 jam) × 100%</blockquote>
<p>Rumah tangga sehat biasanya berada di kisaran 10–20%. Angka di bawah 5% menandakan kapasitas yang dilanggan jauh melampaui kebutuhan nyata.</p>

<h2>Sebelum turun daya, periksa beban serentak</h2>
<p>Jumlahkan daya perangkat yang realistis menyala bersamaan pada jam tersibuk — biasanya sore hari: AC, pompa air, rice cooker, water heater, setrika, dan penerangan. Tambahkan margin 20% untuk arus start motor kompresor AC dan pompa, yang sesaat bisa beberapa kali daya nominalnya.</p>
<p>Kalau totalnya masih nyaman di bawah daya tujuan, penurunan aman dilakukan. Kalau mepet, penghematan rekening minimum akan tertukar dengan MCB yang anjlok tiap sore — pertukaran yang jarang sepadan.</p>

<h2>Golongan yang salah peruntukan</h2>
<p>Menjalankan usaha pada golongan rumah tangga adalah pelanggaran peruntukan. Bila ditemukan saat Penertiban Pemakaian Tenaga Listrik, konsekuensinya tagihan susulan yang jumlahnya bisa jauh melampaui selisih tarif yang pernah dihemat.</p>
<p>Sebaliknya, ada kasus di mana pindah ke golongan bisnis justru <em>menghemat</em>. Pada daya di atas 200 kVA, tarif B-3 dan I-3 berada di sekitar Rp 1.114 per kWh — jauh di bawah tarif rumah tangga besar sebesar Rp 1.699. Untuk bangunan yang memang dipakai usaha, memperbaiki golongan bisa menurunkan biaya sekaligus menghilangkan risiko hukum.</p>

<h2>Langkah mengubah daya atau golongan</h2>
<ol>
  <li>Cek golongan dan daya saat ini di aplikasi PLN Mobile atau pada struk terakhir.</li>
  <li>Hitung faktor beban dan beban serentak seperti di atas.</li>
  <li>Ajukan perubahan lewat PLN Mobile atau call center 123.</li>
  <li>Siapkan biaya administrasi sekali bayar; penghematannya berulang tiap bulan.</li>
</ol>
<p>Perlu diingat, menaikkan daya kembali di kemudian hari dikenakan biaya penyambungan yang jauh lebih besar daripada biaya menurunkannya. Jadi jangan menurunkan daya secara agresif hanya demi angka di atas kertas.</p>`,
    },

    {
      slug: 'baterai-rumah',
      judul: 'Baterai Penyimpanan Rumah: Kapan Masuk Akal',
      ringkas: 'Analisis jujur soal biaya baterai, siklus hidup, dan mengapa alasan membelinya biasanya keandalan, bukan penghematan.',
      kategori: 'PLTS',
      menit: 6,
      body: `
<p>Baterai sering ditawarkan sebagai pelengkap wajib PLTS Atap. Padahal di Indonesia, secara ekonomi murni, baterai jarang membayar dirinya sendiri. Alasan memilikinya biasanya lain — dan itu tidak apa-apa, asal disadari sejak awal.</p>

<h2>Kenapa hitungannya berat</h2>
<p>Baterai memberi nilai dengan menyimpan listrik surya berlebih di siang hari untuk dipakai malam hari. Nilai tiap kWh yang digeser setara tarif PLN, sekitar Rp 1.444–1.700.</p>
<p>Baterai litium besi fosfat berkualitas berharga sekitar Rp 7,5 juta per kWh kapasitas terpakai, dengan umur sekitar 6.000 siklus penuh. Kalau dipakai satu siklus per hari:</p>
<blockquote>Biaya per kWh tergeser = Rp 7.500.000 ÷ 6.000 siklus = Rp 1.250 per kWh</blockquote>
<p>Angka itu sudah nyaris menyamai tarif listriknya sendiri — sebelum memperhitungkan rugi konversi sekitar 10%, biaya inverter hybrid, dan nilai waktu atas uang. Karena itu selisihnya tipis atau bahkan negatif.</p>

<h2>Yang membuat hitungan berbeda di negara lain</h2>
<p>Di negara dengan tarif berbasis waktu, listrik malam bisa berkali lipat lebih mahal daripada siang, sehingga menggeser satu kWh bernilai jauh lebih besar. Tarif rumah tangga di Indonesia belum menerapkan skema itu, jadi selisih yang menjadi sumber keuntungan baterai belum tersedia.</p>

<h2>Alasan yang benar untuk membeli baterai</h2>
<ul>
  <li><strong>Keandalan.</strong> Di daerah yang sering padam, baterai menggantikan genset tanpa bising, tanpa bahan bakar, dan tanpa perawatan mesin.</li>
  <li><strong>Beban kritis.</strong> Klinik, laboratorium, server, kamar bayi, dan rantai dingin punya biaya kegagalan yang jauh melampaui harga baterai.</li>
  <li><strong>Menaikkan serapan surya.</strong> Kalau produksi PLTS banyak terbuang karena rumah kosong siang hari, baterai mengubah kWh terbuang menjadi kWh terpakai.</li>
  <li><strong>Persiapan tarif masa depan.</strong> Bila skema tarif berbasis waktu diberlakukan, nilai baterai akan naik.</li>
</ul>

<h2>Menentukan ukuran</h2>
<p>Ukuran yang berlebihan adalah kesalahan paling mahal. Pendekatan yang wajar adalah menutup beban malam yang benar-benar penting, bukan seluruh konsumsi rumah. Untuk sebagian besar rumah, 5–10 kWh sudah cukup menyalakan penerangan, kulkas, dan beberapa titik stopkontak sepanjang malam.</p>

<h2>Yang perlu ditanyakan ke pemasang</h2>
<ol>
  <li>Berapa kapasitas <em>terpakai</em>, bukan kapasitas nominal.</li>
  <li>Berapa siklus bergaransi dan pada kedalaman pengosongan berapa.</li>
  <li>Apakah garansi menjamin kapasitas tersisa di akhir masa garansi.</li>
  <li>Apakah inverter hybrid mendukung penambahan kapasitas di kemudian hari.</li>
</ol>
<p>Kalkulator di halaman <a href="/surya.html#kalkulator">PLTS Atap</a> menyediakan opsi baterai, dan akan menunjukkan terus terang bila penambahannya membuat nilai investasi menjadi negatif.</p>`,
    },

    {
      slug: 'plts-ev-charger',
      judul: 'PLTS Atap dan Kendaraan Listrik',
      ringkas: 'Menggabungkan panel surya dengan pengisian mobil listrik — kombinasi yang justru memperbaiki ekonomi keduanya.',
      kategori: 'PLTS',
      menit: 5,
      body: `
<p>Kendaraan listrik dan PLTS Atap sering dibahas terpisah, padahal keduanya saling memperbaiki. Alasannya berkaitan langsung dengan masalah utama PLTS di Indonesia: listrik siang hari yang terbuang.</p>

<h2>Masalah yang saling menyelesaikan</h2>
<p>Kelemahan terbesar PLTS rumah tangga adalah rendahnya serapan — banyak produksi siang hari tidak terpakai karena penghuni sedang tidak di rumah. Sementara itu, mobil listrik adalah beban besar yang jadwal pengisiannya fleksibel.</p>
<p>Mengisi mobil pada jam matahari mengubah kWh yang tadinya terbuang menjadi kWh yang menggantikan bensin. Nilainya bukan lagi sebatas tarif listrik, melainkan harga bahan bakar yang tidak jadi dibeli.</p>

<h2>Hitungan kasarnya</h2>
<p>Mobil listrik menempuh sekitar 6 km per kWh. Mobil bensin sekelasnya menempuh sekitar 12 km per liter. Untuk 1.000 km per bulan:</p>
<div class="table-wrap"><table>
<thead><tr><th></th><th>Kebutuhan</th><th>Biaya bulanan</th></tr></thead>
<tbody>
<tr><td>Bensin</td><td>83 liter</td><td>± Rp 1.080.000</td></tr>
<tr><td>Listrik PLN</td><td>167 kWh</td><td>± Rp 284.000</td></tr>
<tr><td>Listrik dari PLTS</td><td>167 kWh</td><td>± Rp 0 biaya marjinal</td></tr>
</tbody></table></div>
<p>Angka bensin memakai asumsi Rp 13.000 per liter. Yang membuat kombinasi ini menarik bukan selisih listrik PLN terhadap PLTS, melainkan bahwa kWh surya yang sebelumnya terbuang kini bernilai setara harga bensin.</p>

<h2>Hal teknis yang perlu diperhatikan</h2>
<ul>
  <li><strong>Daya tersambung.</strong> Pengisi daya rumah umumnya 3,5–7 kW. Pada daya PLN yang pas-pasan, pengisian bersamaan dengan AC akan menjatuhkan MCB.</li>
  <li><strong>Pengisian terjadwal.</strong> Sebagian besar mobil dan pengisi daya bisa dijadwalkan. Menjadwalkan pengisian pukul 10.00–15.00 adalah kunci agar energinya berasal dari matahari.</li>
  <li><strong>Proteksi khusus.</strong> Sirkuit pengisi daya membutuhkan pengaman arus sisa tipe khusus karena arus searah dapat membutakan pengaman biasa.</li>
  <li><strong>Kabel tersendiri.</strong> Jalur khusus dari panel utama, tidak menumpang stopkontak yang sudah ada.</li>
</ul>

<h2>Urutan pemasangan yang disarankan</h2>
<p>Kalau keduanya direncanakan, pasang PLTS lebih dulu dengan kapasitas yang sudah memperhitungkan beban kendaraan, dan gunakan inverter hybrid agar penambahan baterai di masa depan tidak memerlukan penggantian perangkat. Menambah panel setelah instalasi selesai selalu lebih mahal daripada memasangnya sekaligus, karena biaya mobilisasi dan perizinan terulang.</p>
<p>Pada kalkulator <a href="/surya.html#kalkulator">PLTS Atap</a>, naikkan porsi pemakaian siang hari untuk melihat pengaruh pengisian kendaraan terhadap ukuran sistem optimal dan tahun balik modal.</p>`,
    },

    {
      slug: 'regulasi-plts-atap',
      judul: 'Regulasi dan Perizinan PLTS Atap',
      ringkas: 'Apa yang berubah setelah aturan terbaru, dokumen yang dibutuhkan, dan risiko memasang tanpa izin.',
      kategori: 'Regulasi',
      menit: 6,
      body: `
<p>Memasang PLTS yang tersambung ke jaringan PLN bukan sekadar urusan teknis. Ada kerangka perizinan yang harus dilalui, dan mengabaikannya menimbulkan risiko yang lebih besar daripada biaya mengurusnya.</p>

<h2>Perubahan paling penting</h2>
<p>Kerangka PLTS Atap terbaru menghapus mekanisme ekspor-impor yang dulu memungkinkan kelebihan produksi dikreditkan sebagai pengurang tagihan bulan berikutnya. Sebagai gantinya, pemasangan dikelola melalui sistem kuota per wilayah usaha.</p>
<p>Dampaknya pada perhitungan investasi sangat besar, dan inilah sebabnya banyak brosur lama menampilkan angka penghematan yang tidak lagi tercapai. Setiap proposal yang masih menyebut "ekspor dihitung sebagai tabungan listrik" perlu diperiksa ulang tanggal penyusunannya.</p>

<h2>Alur perizinan</h2>
<ol>
  <li><strong>Permohonan ke PLN</strong> dengan data kapasitas rencana, spesifikasi inverter, dan diagram satu garis.</li>
  <li><strong>Persetujuan kapasitas</strong> mengikuti ketersediaan kuota pada wilayah usaha setempat.</li>
  <li><strong>Pemasangan</strong> oleh badan usaha yang memiliki sertifikat kompetensi.</li>
  <li><strong>Sertifikat Laik Operasi</strong> diterbitkan lembaga inspeksi teknik terakreditasi.</li>
  <li><strong>Penggantian meter</strong> bila diperlukan, lalu sistem dinyatakan boleh beroperasi.</li>
</ol>

<h2>Sertifikat Laik Operasi</h2>
<p>SLO bukan formalitas administratif. Dokumen ini menyatakan instalasi memenuhi standar keselamatan ketenagalistrikan. Tanpa SLO, dua hal terjadi: PLN berhak menolak penyambungan, dan klaim asuransi kebakaran berpotensi ditolak karena instalasi dianggap tidak laik.</p>
<p>EnVisor menyediakan <a href="/slo.html">pemeriksaan kesiapan SLO</a> untuk menilai kelengkapan sebelum inspeksi resmi dilakukan, sehingga kegagalan pada inspeksi pertama bisa dihindari.</p>

<h2>Risiko memasang tanpa izin</h2>
<ul>
  <li>Pembongkaran instalasi atas permintaan PLN.</li>
  <li>Penolakan klaim asuransi bila terjadi kebakaran yang berkaitan dengan instalasi listrik.</li>
  <li>Bahaya nyata bagi petugas: inverter tanpa proteksi anti-islanding dapat tetap mengalirkan listrik ke jaringan saat perbaikan sedang berlangsung.</li>
  <li>Kesulitan menjual bangunan karena instalasi tidak berdokumen.</li>
</ul>

<h2>Untuk bangunan komersial dan industri</h2>
<p>Selain perizinan PLTS, fasilitas dengan konsumsi energi besar memiliki kewajiban tersendiri di bidang konservasi energi — antara lain penunjukan manajer energi, pelaksanaan audit energi berkala, dan pelaporan tahunan. Perencanaan PLTS sebaiknya disatukan dengan pemenuhan kewajiban tersebut agar dokumentasinya sekali kerja.</p>
<p>Lihat <a href="/panduan/audit-energi-industri.html">panduan audit energi industri</a> untuk rinciannya.</p>`,
    },

    {
      slug: 'audit-energi-industri',
      judul: 'Audit Energi Industri dan Manajemen Energi',
      ringkas: 'Kewajiban konservasi energi, cara kerja audit, dan mengapa 20% titik ukur biasanya menjelaskan 60% konsumsi.',
      kategori: 'Industri',
      menit: 7,
      body: `
<p>Audit energi adalah pemeriksaan sistematis atas bagaimana energi masuk, mengalir, dan terbuang di sebuah fasilitas. Hasilnya bukan sekadar laporan, melainkan daftar tindakan yang diurutkan berdasarkan pengembalian investasi.</p>

<h2>Kewajiban yang mendasarinya</h2>
<p>Kerangka konservasi energi nasional mewajibkan pengguna energi besar untuk menunjuk manajer energi, menyusun program konservasi, melaksanakan audit energi berkala, dan melaporkan pelaksanaannya. Ambang kewajiban ditetapkan berdasarkan konsumsi tahunan setara ton minyak.</p>
<p>Bagi fasilitas yang berada di sekitar ambang tersebut, langkah pertama yang masuk akal adalah memastikan angka konsumsinya benar — dan itu memerlukan pengukuran, bukan tagihan bulanan.</p>

<h2>Kenapa tagihan bulanan tidak cukup</h2>
<p>Rekening PLN memberi satu angka untuk seluruh fasilitas, sebulan sekali. Dari sana tidak mungkin diketahui lini produksi mana yang boros, kapan puncak beban terjadi, atau berapa banyak energi terpakai saat pabrik sedang tidak berproduksi.</p>
<p>Sistem pemantauan per rangkaian mengubah satu angka bulanan menjadi ribuan titik data harian. Pola yang paling sering muncul: sekitar 20% titik ukur menjelaskan sekitar 60% konsumsi. Begitu 20% itu teridentifikasi, prioritas perbaikan menjadi jelas.</p>

<h2>Tahapan audit</h2>
<ol>
  <li><strong>Pengumpulan data.</strong> Rekening 12–24 bulan, jadwal produksi, daftar aset utama, dan diagram satu garis.</li>
  <li><strong>Pengukuran.</strong> Pemasangan pencatat data pada rangkaian utama selama beberapa minggu untuk menangkap variasi antar-shift.</li>
  <li><strong>Analisis kesenjangan.</strong> Membandingkan konsumsi nyata terhadap acuan teoretis tiap peralatan.</li>
  <li><strong>Daftar tindakan.</strong> Setiap peluang disertai perkiraan penghematan, biaya, dan waktu balik modal.</li>
  <li><strong>Verifikasi.</strong> Pengukuran ulang setelah perbaikan untuk membuktikan penghematannya nyata.</li>
</ol>

<h2>Temuan yang paling sering berulang</h2>
<ul>
  <li><strong>Kebocoran udara bertekanan.</strong> Sering menjadi pemborosan terbesar sekaligus yang paling murah diperbaiki. Satu lubang 3 mm pada tekanan 7 bar bisa bernilai puluhan juta rupiah per tahun.</li>
  <li><strong>Beban dasar di luar jam produksi.</strong> Konsumsi saat pabrik berhenti yang tidak pernah diperiksa.</li>
  <li><strong>Motor tanpa pengatur kecepatan.</strong> Kipas dan pompa yang berjalan penuh padahal kebutuhannya berubah-ubah.</li>
  <li><strong>Faktor daya rendah.</strong> Menimbulkan denda kVArh yang sepenuhnya bisa dihindari dengan pemasangan kapasitor.</li>
  <li><strong>Denda kelebihan beban puncak.</strong> Muncul dari beberapa menit lonjakan yang sebenarnya bisa dijadwalkan ulang.</li>
</ul>

<h2>Peran pemantauan berkelanjutan</h2>
<p>Audit satu kali menghasilkan foto sesaat. Tanpa pemantauan lanjutan, penghematan biasanya luntur dalam 12–18 bulan seiring berubahnya kebiasaan operasional. Sistem pemantauan menjaga hasilnya tetap ada sekaligus menyediakan bukti pelaporan tahunan tanpa pembacaan meter manual.</p>
<p>Pelajari <a href="/monitoring.html">EnVisor EPMS</a> untuk pemantauan per rangkaian, dan <a href="/bisnis.html">EnVisor Industri</a> untuk pemeriksaan aset berbasis penglihatan komputer.</p>`,
    },

    {
      slug: 'rec-jejak-karbon',
      judul: 'REC dan Jejak Karbon Perusahaan',
      ringkas: 'Cara kerja sertifikat energi terbarukan, kaitannya dengan Scope 2, dan kapan REC lebih masuk akal daripada memasang panel.',
      kategori: 'Keberlanjutan',
      menit: 6,
      body: `
<p>Renewable Energy Certificate adalah bukti bahwa satu megawatt-jam listrik telah dibangkitkan dari sumber terbarukan dan dimasukkan ke jaringan. Satu sertifikat mewakili 1 MWh, dan hanya boleh diklaim satu kali oleh satu pihak.</p>

<h2>Mengapa perusahaan membutuhkannya</h2>
<p>Dalam pelaporan emisi, listrik yang dibeli dari jaringan masuk kategori Scope 2. Karena bauran energi jaringan masih didominasi batu bara, angka Scope 2 perusahaan di Indonesia umumnya besar.</p>
<p>Ada dua cara menurunkannya: membangkitkan listrik terbarukan sendiri, atau membeli sertifikat yang membuktikan konsumsi setara telah dipasok dari sumber terbarukan pada jaringan yang sama.</p>

<h2>Perbedaan REC dan karbon offset</h2>
<p>Keduanya sering tertukar, padahal berbeda mendasar. REC menyatakan asal listrik yang kamu konsumsi dan bekerja pada Scope 2. Karbon offset menyatakan pengurangan emisi di tempat lain — misalnya penanaman hutan — dan tidak mengubah asal listrikmu. Sebagian besar kerangka pelaporan tidak menerima offset sebagai pengganti REC untuk Scope 2.</p>

<h2>Kapan REC lebih masuk akal daripada memasang panel</h2>
<ul>
  <li>Bangunan disewa dan atapnya bukan milik perusahaan.</li>
  <li>Luas atap tidak cukup untuk menutup porsi konsumsi yang berarti.</li>
  <li>Target pelaporan harus tercapai tahun ini, sementara pembangunan PLTS butuh waktu berbulan-bulan.</li>
  <li>Operasi tersebar di banyak lokasi kecil sehingga instalasi menjadi tidak efisien.</li>
</ul>
<p>Sebaliknya, PLTS milik sendiri menurunkan tagihan listrik sekaligus emisi, sedangkan REC hanya menangani emisi dan justru menambah biaya. Untuk fasilitas dengan atap luas dan beban siang hari besar, memasang panel hampir selalu lebih baik secara finansial.</p>

<h2>Strategi yang lazim dipakai</h2>
<ol>
  <li><strong>Kurangi dulu.</strong> Efisiensi adalah kWh termurah — yang tidak dipakai tidak perlu dibeli maupun disertifikasi.</li>
  <li><strong>Bangkitkan sendiri</strong> sebesar yang layak secara ekonomi di atap yang tersedia.</li>
  <li><strong>Tutup sisanya dengan REC</strong> untuk konsumsi yang tidak dapat dipenuhi sendiri.</li>
</ol>
<p>Urutan ini penting. Membeli REC untuk menutupi pemborosan yang sebenarnya bisa dihilangkan adalah pengeluaran berulang untuk masalah yang punya solusi sekali bayar.</p>

<h2>Menjaga klaim tetap dapat diaudit</h2>
<p>Klaim yang kredibel memerlukan penelusuran: nomor seri sertifikat, tahun pembangkitan, wilayah jaringan, dan bukti pembatalan atas nama perusahaan. Tanpa itu, klaim berisiko dipertanyakan pada audit keberlanjutan. Data konsumsi dari <a href="/monitoring.html">sistem pemantauan</a> memberi sisi permintaan yang cocok dengan sisi pasokan sertifikat.</p>
<p>Lihat <a href="/rec.html">layanan REC dan Net Zero EnVisor</a> untuk penyusunan strateginya.</p>`,
    },
  ];

  /* ---------------- BLOG ---------------- */
  const BLOG = [
    {
      slug: 'kenapa-tagihan-listrik-naik',
      judul: 'Tagihan Listrik Naik Padahal Pemakaian Terasa Sama — Ini Penyebabnya',
      ringkas: 'Tujuh penyebab paling sering, diurutkan dari yang paling mudah diperiksa sendiri.',
      kategori: 'Tagihan', tanggal: '2026-08-18', menit: 6,
      body: `
<p>Keluhan yang paling sering muncul bukan "tagihan saya mahal", melainkan "tagihan saya naik padahal tidak ada yang berubah". Keduanya butuh penanganan berbeda. Yang kedua hampir selalu punya penyebab tunggal yang bisa ditemukan.</p>

<h2>1. Pencatatan taksiran yang dikoreksi</h2>
<p>Ketika petugas tidak dapat membaca meter, pemakaian ditaksir dari rata-rata. Selisih terhadap angka sebenarnya menumpuk, lalu ditagihkan sekaligus saat pembacaan nyata akhirnya dilakukan. Cirinya khas: beberapa bulan tagihan hampir identik, lalu satu bulan melonjak tajam.</p>
<p>Cara memastikan: bandingkan tiga tagihan terakhir. Kalau nominalnya nyaris sama persis, kemungkinan besar itu taksiran.</p>

<h2>2. AC yang mulai kehilangan efisiensi</h2>
<p>AC dengan filter kotor atau freon berkurang tetap terasa dingin, tetapi kompresornya bekerja lebih lama untuk mencapai suhu yang sama. Konsumsi bisa naik 20–30% tanpa perubahan yang terasa oleh penghuni. Ini penyebab paling sering pada rumah dengan tagihan di atas Rp 700 ribu.</p>

<h2>3. Perangkat baru yang menyala terus</h2>
<p>Dispenser air panas, kulkas kedua, pemanas air, atau akuarium mudah terlupakan karena tidak pernah "dinyalakan" secara sadar. Perangkat 100 watt yang menyala 24 jam menghabiskan 72 kWh sebulan — sekitar Rp 104 ribu pada tarif 1.444.</p>

<h2>4. Perubahan kebiasaan yang tidak disadari</h2>
<p>Anggota keluarga yang mulai bekerja dari rumah menambah beban siang hari secara signifikan. Begitu juga musim kemarau panjang yang membuat AC menyala lebih lama setiap hari.</p>

<h2>5. Arus bocor</h2>
<p>Instalasi lembap atau kabel yang terkelupas dapat mengalirkan arus ke tanah secara terus-menerus. Cara memeriksanya sederhana: matikan seluruh MCB cabang, lalu amati apakah piringan atau angka meter masih bergerak. Kalau masih berjalan, ada kebocoran yang perlu ditangani teknisi.</p>

<h2>6. Rekening minimum pada daya yang kebesaran</h2>
<p>Pelanggan pascabayar tetap ditagih setara 40 jam nyala meskipun pemakaian jauh di bawahnya. Rumah yang sering ditinggal atau baru ditempati sebagian sering membayar kapasitas yang tidak pernah dipakai.</p>

<h2>7. Perubahan tarif atau PBJT daerah</h2>
<p>Penyesuaian tarif triwulanan dan perubahan Perda pajak daerah mengubah tagihan tanpa perubahan pemakaian apa pun. Ini yang paling mudah diperiksa: bagi tagihan dengan kWh terpakai, lalu bandingkan angkanya dengan bulan sebelumnya.</p>

<h2>Urutan pemeriksaan yang disarankan</h2>
<p>Mulai dari yang tidak memerlukan alat: bandingkan tarif efektif antar bulan, periksa pola tagihan identik, lalu telusuri perangkat baru. Uji kebocoran dilakukan terakhir karena paling merepotkan.</p>
<p><a href="/audit-tagihan.html">Alat audit tagihan EnVisor</a> menjalankan lima pemeriksaan pertama secara otomatis dari data yang tertera di struk, dan menyebutkan langkah klaim yang tersedia bila ditemukan kejanggalan.</p>`,
    },

    {
      slug: 'plts-atap-vs-genset',
      judul: 'PLTS Atap atau Genset? Perbandingan Biaya Sebenarnya',
      ringkas: 'Keduanya sering dibandingkan padahal menyelesaikan masalah berbeda. Ini cara memilih yang tepat.',
      kategori: 'PLTS', tanggal: '2026-07-29', menit: 5,
      body: `
<p>Pertanyaan ini sering muncul dari pemilik usaha: mana yang lebih baik, memasang panel surya atau membeli genset? Jawabannya bergantung pada masalah yang ingin diselesaikan, karena keduanya sebenarnya tidak bersaing.</p>

<h2>Masalah yang berbeda</h2>
<p>Genset menyelesaikan masalah <em>keandalan</em> — listrik tetap ada saat jaringan padam. Genset tidak menghemat apa pun; biaya per kWh-nya justru jauh lebih mahal daripada listrik PLN.</p>
<p>PLTS menyelesaikan masalah <em>biaya</em> — menurunkan jumlah kWh yang perlu dibeli. Tetapi PLTS tanpa baterai tidak memberi listrik saat padam, karena inverter wajib memutus keluaran demi keselamatan petugas jaringan.</p>

<h2>Biaya per kWh</h2>
<div class="table-wrap"><table>
<thead><tr><th>Sumber</th><th>Biaya per kWh</th><th>Catatan</th></tr></thead>
<tbody>
<tr><td>PLN industri</td><td>± Rp 1.115</td><td>Acuan pembanding</td></tr>
<tr><td>PLN bisnis</td><td>± Rp 1.445</td><td></td></tr>
<tr><td>Genset diesel</td><td>± Rp 3.500–4.500</td><td>Solar industri, belum termasuk perawatan</td></tr>
<tr><td>PLTS Atap</td><td>± Rp 700–1.000</td><td>Biaya rata selama 25 tahun</td></tr>
</tbody></table></div>
<p>Biaya genset dihitung dari konsumsi solar sekitar 0,3 liter per kWh. Angka itu belum memasukkan penggantian oli berkala, perawatan mesin, dan waktu henti operasional.</p>

<h2>Kesalahan yang mahal</h2>
<p>Menjalankan genset sebagai pengurang tagihan — bukan sekadar cadangan — adalah kesalahan yang cukup sering ditemui pada fasilitas dengan denda beban puncak. Logikanya terlihat masuk akal: nyalakan genset saat jam puncak untuk menghindari denda. Padahal biaya solar per kWh biasanya lebih besar daripada denda yang dihindari, sehingga total pengeluarannya justru naik.</p>

<h2>Kombinasi yang paling masuk akal</h2>
<p>Untuk fasilitas yang butuh keduanya, susunan yang lazim adalah PLTS untuk menurunkan biaya harian, genset tetap disiagakan untuk pemadaman panjang, dan baterai berkapasitas kecil untuk menjembatani beberapa detik peralihan agar peralatan sensitif tidak ikut mati.</p>
<p>Susunan ini memberi biaya operasional terendah tanpa mengorbankan keandalan, dan biaya baterainya jauh lebih rendah dibandingkan menyimpan seluruh kebutuhan malam.</p>

<h2>Cara memutuskan</h2>
<ol>
  <li>Berapa kali listrik padam per tahun, dan berapa kerugian per jam pemadaman? Itu menentukan kebutuhan genset.</li>
  <li>Berapa persen konsumsi terjadi pada jam matahari? Itu menentukan kelayakan PLTS.</li>
  <li>Adakah beban yang tidak boleh mati meski hanya sedetik? Itu menentukan kebutuhan baterai.</li>
</ol>
<p>Ketiganya pertanyaan terpisah, dan menjawabnya terpisah menghasilkan sistem yang lebih murah daripada memaksakan satu solusi untuk semuanya.</p>`,
    },

    {
      slug: 'roi-plts-atap-2026',
      judul: 'Berapa Lama PLTS Atap Balik Modal di Indonesia?',
      ringkas: 'Angka jujur untuk rumah, bisnis, dan industri — beserta alasan hasilnya sangat berbeda.',
      kategori: 'PLTS', tanggal: '2026-07-11', menit: 6,
      body: `
<p>Pertanyaan ini punya satu jawaban yang tidak memuaskan tapi benar: tergantung kapan kamu memakai listriknya. Perbedaan antara rumah tangga dan pabrik bisa mencapai dua kali lipat waktu balik modal, meskipun harga panel per kWp-nya sama.</p>

<h2>Kenapa profil pemakaian menentukan segalanya</h2>
<p>Panel menghasilkan listrik antara pukul 07.00 dan 17.00. Karena kelebihan produksi tidak lagi dikreditkan, kWh yang tidak terpakai pada saat diproduksi tidak bernilai apa-apa.</p>
<p>Pabrik yang bekerja siang hari menyerap hampir seluruh produksi. Rumah tangga yang penghuninya bekerja di luar mungkin hanya menyerap 40–45%. Dengan biaya sistem yang sama, penghematannya bisa berbeda dua kali lipat.</p>

<h2>Perbandingan tiga profil</h2>
<div class="table-wrap"><table>
<thead><tr><th>Profil</th><th>Beban siang</th><th>Balik modal</th></tr></thead>
<tbody>
<tr><td>Rumah, penghuni bekerja di luar</td><td>± 35%</td><td>12–16 tahun</td></tr>
<tr><td>Rumah, ada penghuni siang hari</td><td>± 50%</td><td>9–12 tahun</td></tr>
<tr><td>Toko, kantor, restoran</td><td>± 75%</td><td>7–9 tahun</td></tr>
<tr><td>Pabrik satu shift siang</td><td>± 85%</td><td>6–8 tahun</td></tr>
</tbody></table></div>
<p>Rentang di dalam tiap baris berasal dari perbedaan iradiasi antar kota dan golongan tarif. Denpasar dan Makassar berada di ujung yang lebih cepat; Medan dan Bandung di ujung yang lebih lambat.</p>

<h2>Faktor yang paling berpengaruh, berurutan</h2>
<ol>
  <li><strong>Porsi pemakaian siang hari.</strong> Pengaruhnya jauh melampaui faktor lain.</li>
  <li><strong>Golongan tarif.</strong> Makin mahal tarif per kWh, makin cepat balik modal — di sinilah rumah tangga besar justru diuntungkan.</li>
  <li><strong>Ukuran sistem.</strong> Biaya tetap membuat sistem kecil mahal per kWp-nya.</li>
  <li><strong>Iradiasi lokal.</strong> Selisih Denpasar dan Medan sekitar 20% produksi.</li>
  <li><strong>Bayangan.</strong> Satu modul ternaungi dapat menurunkan keluaran seluruh rangkaian bila tidak dipasang pengoptimal.</li>
</ol>

<h2>Cara memperbaiki angkanya tanpa menambah panel</h2>
<p>Menggeser beban ke siang hari adalah tuas paling murah yang tersedia. Menjadwalkan mesin cuci, pompa kolam, pemanas air, pengisian kendaraan listrik, dan pendinginan awal ruangan pada jam produksi surya dapat menaikkan serapan 10–15 poin persen tanpa belanja modal apa pun.</p>
<p>Untuk fasilitas komersial, memindahkan satu shift produksi ke siang hari sering memberi pengaruh lebih besar daripada menambah 20% kapasitas panel.</p>

<h2>Menghitung untuk kasusmu sendiri</h2>
<p><a href="/surya.html#kalkulator">Kalkulator PLTS EnVisor</a> memakai model yang sama dengan artikel ini, termasuk kurva serapan yang menurun dan biaya tetap instalasi. Kalkulator akan menyatakan terus terang bila hasilnya menunjukkan PLTS belum layak — karena angka yang jujur lebih berguna daripada angka yang menyenangkan.</p>`,
    },

    {
      slug: 'turun-daya-pln',
      judul: 'Turun Daya PLN: Hemat Nyata atau Sekadar Angka?',
      ringkas: 'Cara menghitung apakah penurunan daya menguntungkan, dan kapan justru menimbulkan masalah.',
      kategori: 'Tagihan', tanggal: '2026-06-24', menit: 5,
      body: `
<p>Saran "turunkan saja dayanya" sering beredar sebagai cara instan memangkas tagihan. Kadang benar, kadang menimbulkan masalah baru yang lebih mahal. Pembedanya bisa dihitung.</p>

<h2>Dari mana penghematannya berasal</h2>
<p>Bagi pelanggan pascabayar, penghematan berasal dari rekening minimum yang ikut turun:</p>
<blockquote>Rekening minimum = 40 jam × daya (kVA) × tarif per kWh</blockquote>
<p>Turun dari 3.500 VA ke 2.200 VA pada tarif Rp 1.699,53 menghemat 40 × (3,5 − 2,2) × 1.699,53 = Rp 88.376 per bulan, atau sekitar Rp 1,06 juta setahun.</p>
<p>Penting dicatat: penghematan ini hanya terasa bila pemakaianmu memang di bawah ambang rekening minimum. Kalau pemakaian sudah jauh melampauinya, menurunkan daya <strong>tidak menghemat sama sekali</strong> — kamu membayar kWh yang sama dengan tarif yang sama.</p>

<h2>Perubahan tarif saat melewati batas golongan</h2>
<p>Turun dari 3.500 VA ke 2.200 VA memindahkan golongan dari R-1/3.500 ke R-1/2.200, sekaligus menurunkan tarif dari Rp 1.699,53 menjadi Rp 1.444,70 per kWh — turun sekitar 15%. Untuk rumah dengan pemakaian 400 kWh per bulan, ini bernilai sekitar Rp 102 ribu per bulan, lebih besar daripada penghematan rekening minimumnya.</p>
<p>Inilah kasus di mana turun daya benar-benar layak: bukan karena rekening minimumnya, melainkan karena pindah ke golongan yang tarifnya lebih murah.</p>

<h2>Risikonya</h2>
<ul>
  <li><strong>MCB anjlok berulang.</strong> Terjadi bila beban serentak melebihi daya baru. Paling sering muncul sore hari saat AC, pompa, dan rice cooker menyala bersamaan.</li>
  <li><strong>Arus start motor.</strong> Kompresor AC dan pompa menarik arus beberapa kali lipat daya nominalnya selama satu hingga dua detik saat menyala.</li>
  <li><strong>Biaya naik daya jauh lebih mahal.</strong> Bila ternyata tidak cukup, mengembalikan daya ke semula dikenakan biaya penyambungan yang besar.</li>
</ul>

<h2>Cara memeriksa sebelum mengajukan</h2>
<ol>
  <li>Jumlahkan daya perangkat yang biasa menyala bersamaan pada jam tersibuk.</li>
  <li>Tambahkan margin 20% untuk arus start.</li>
  <li>Bandingkan dengan daya tujuan. Kalau selisihnya kurang dari 15%, jangan diturunkan.</li>
  <li>Uji lebih dulu: matikan MCB satu fase selama beberapa hari untuk mensimulasikan keterbatasan daya.</li>
</ol>

<h2>Kesimpulan praktis</h2>
<p>Turun daya layak dipertimbangkan bila faktor bebanmu di bawah 5%, atau bila penurunannya memindahkanmu ke golongan tarif yang lebih murah. Di luar dua kondisi itu, penghematannya kecil sementara risikonya nyata.</p>
<p><a href="/audit-tagihan.html">Audit tagihan EnVisor</a> menghitung faktor beban dan rekening minimum dari data strukmu, lalu menyatakan apakah penurunan daya memang menghasilkan penghematan.</p>`,
    },

    {
      slug: 'net-zero-perusahaan-indonesia',
      judul: 'Menyusun Peta Jalan Net Zero untuk Perusahaan di Indonesia',
      ringkas: 'Urutan langkah yang berhasil, kesalahan yang mahal, dan cara menjaga klaim tetap dapat diaudit.',
      kategori: 'Keberlanjutan', tanggal: '2026-06-02', menit: 7,
      body: `
<p>Banyak perusahaan memulai program net zero dari langkah yang paling terlihat — membeli sertifikat atau memasang panel — padahal urutan yang benar dimulai dari sesuatu yang jauh lebih membosankan: mengukur.</p>

<h2>Langkah 1: Ukur sebelum menargetkan</h2>
<p>Target yang ditetapkan sebelum data tersedia hampir selalu meleset, dan mengoreksinya di tengah jalan merusak kredibilitas. Basis pengukuran minimal mencakup konsumsi listrik per fasilitas, bahan bakar untuk proses dan transportasi, serta pembelian yang berkaitan dengan emisi rantai pasok.</p>
<p>Untuk sebagian besar perusahaan di Indonesia, listrik jaringan mendominasi Scope 2 dan menjadi tempat pengurangan paling cepat menghasilkan.</p>

<h2>Langkah 2: Kurangi apa yang bisa dikurangi</h2>
<p>Efisiensi adalah kWh termurah. Yang tidak dipakai tidak perlu dibeli, tidak perlu dibangkitkan, dan tidak perlu disertifikasi. Temuan audit energi yang berulang — kebocoran udara bertekanan, beban dasar di luar jam kerja, motor tanpa pengatur kecepatan — biasanya balik modal di bawah dua tahun.</p>
<p>Melewatkan tahap ini berarti membayar sertifikat untuk energi yang sebenarnya tidak perlu dikonsumsi. Itu pengeluaran berulang untuk masalah yang punya solusi sekali bayar.</p>

<h2>Langkah 3: Bangkitkan sendiri sebatas yang layak</h2>
<p>PLTS Atap menurunkan tagihan sekaligus Scope 2, sesuatu yang tidak dilakukan sertifikat. Batasnya adalah luas atap dan profil beban siang hari. Untuk gudang dan pabrik, keduanya biasanya menguntungkan.</p>

<h2>Langkah 4: Tutup sisanya dengan sertifikat</h2>
<p>Sisa konsumsi yang tidak dapat dipenuhi sendiri ditutup dengan REC pada wilayah jaringan yang sama. Perhatikan penelusurannya: nomor seri, tahun pembangkitan, wilayah, dan bukti pembatalan atas nama perusahaan. Tanpa itu, klaim rawan dipertanyakan saat audit.</p>

<h2>Kesalahan yang paling mahal</h2>
<ul>
  <li><strong>Menargetkan sebelum mengukur.</strong> Menghasilkan revisi target yang merusak kepercayaan.</li>
  <li><strong>Mencampur offset dan REC.</strong> Keduanya menangani hal berbeda; offset umumnya tidak diterima untuk Scope 2.</li>
  <li><strong>Mengabaikan Scope 3.</strong> Pada perusahaan manufaktur dan ritel, rantai pasok sering jauh melampaui emisi operasional sendiri.</li>
  <li><strong>Pengukuran berhenti setelah tahun pertama.</strong> Tanpa pemantauan berkelanjutan, penghematan luntur dalam 12–18 bulan.</li>
</ul>

<h2>Menjaga hasilnya bertahan</h2>
<p>Program yang bertahan memiliki tiga hal: data yang diperbarui otomatis, satu orang yang bertanggung jawab atas angkanya, dan tinjauan berkala yang membandingkan realisasi terhadap lintasan target.</p>
<p><a href="/monitoring.html">EPMS EnVisor</a> menyediakan data konsumsi yang dapat diaudit, dan <a href="/rec.html">layanan REC</a> menangani sisi sertifikatnya.</p>`,
    },
  ];

  return { PANDUAN, BLOG };
});

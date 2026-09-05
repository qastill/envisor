/* ============================================================
   EnVisor — kerangka halaman marketing.
   Menyuntik nav & footer, menangani menu, form lead, dan
   menyediakan util format yang dipakai kalkulator tiap halaman.
   ============================================================ */
(function () {
  const D = window.EnVisorData;
  if (!D) return;

  const here = location.pathname.replace(/\/$/, '') || '/index.html';
  const isActive = (href) => here === href || (href !== '/index.html' && here.startsWith(href.replace('.html', '')));

  /* ---------- NAV ---------- */
  function buildNav() {
    const mount = document.querySelector('[data-nav]');
    if (!mount) return;

    const items = D.NAV.map((it) => {
      if (it.menu) {
        const links = it.menu.map((m) =>
          `<a href="${m.href}">${m.label}<span>${m.desc}</span></a>`).join('');
        return `<div class="nav-group">
            <button type="button" aria-expanded="false">${it.label} <span aria-hidden="true">▾</span></button>
            <div class="nav-menu">${links}</div>
          </div>`;
      }
      return `<a href="${it.href}"${isActive(it.href) ? ' class="active"' : ''}>${it.label}</a>`;
    }).join('');

    mount.className = 'site-nav';
    mount.innerHTML = `<div class="inner">
        <a class="logo" href="/index.html">⚡ EnVisor<em>.AI</em></a>
        <button class="nav-toggle" type="button" aria-label="Buka menu">☰</button>
        <div class="nav-links">
          ${items}
          <a class="cta" href="${D.NAV_CTA.href}">${D.NAV_CTA.label}</a>
        </div>
      </div>`;

    mount.querySelector('.nav-toggle').addEventListener('click', () => mount.classList.toggle('open'));
    mount.querySelectorAll('.nav-group > button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const grp = btn.parentElement;
        const wasOpen = grp.classList.contains('open');
        mount.querySelectorAll('.nav-group').forEach((g) => {
          g.classList.remove('open');
          g.querySelector('button').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) { grp.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', () => {
      mount.querySelectorAll('.nav-group').forEach((g) => {
        g.classList.remove('open');
        g.querySelector('button').setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- FOOTER ---------- */
  function buildFooter() {
    const mount = document.querySelector('[data-footer]');
    if (!mount) return;
    const cols = D.FOOTER.map((c) =>
      `<div><h4>${c.title}</h4><ul>${c.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul></div>`
    ).join('');

    mount.className = 'site-footer';
    mount.innerHTML = `<div class="container">
        <div class="cols">
          <div>
            <div class="brand">⚡ EnVisor<em>.AI</em></div>
            <p>${D.SITE.tagline}. Estimasi berbasis data tarif PLN dan iradiasi lokal — transparan, bisa ditelusuri, tanpa janji berlebihan.</p>
          </div>
          ${cols}
        </div>
        <div class="bottom">
          <span>© ${new Date().getFullYear()} EnVisor. Seluruh angka bersifat estimasi.</span>
          <span>Bukan audit energi resmi · margin error 5–20%</span>
        </div>
      </div>`;
  }

  /* ---------- FORM LEAD ---------- */
  function bindLeadForms() {
    document.querySelectorAll('form[data-lead]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = form.querySelector('.form-msg');
        const btn = form.querySelector('button[type=submit]');
        const label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Mengirim…'; }

        const payload = Object.fromEntries(new FormData(form).entries());
        payload.sumber = form.dataset.lead || location.pathname;
        if (window.__envisorHitung) payload.estimasi = window.__envisorHitung();

        try {
          const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Gagal mengirim');
          if (msg) { msg.className = 'form-msg ok'; msg.textContent = data.message; }
          form.reset();
        } catch (err) {
          if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Maaf, pengiriman gagal: ' + err.message + '. Coba lagi atau hubungi ' + D.SITE.email + '.'; }
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        }
      });
    });
  }

  /* ---------- UTIL ---------- */
  window.EnVisorUI = {
    rupiah: D.rupiah,
    rupiahSingkat: D.rupiahSingkat,
    /** Pasang grup chip pilihan tunggal; memanggil onPick(value). */
    chips(root, onPick) {
      const box = typeof root === 'string' ? document.querySelector(root) : root;
      if (!box) return;
      box.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        box.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
        chip.classList.add('on');
        onPick(chip.dataset.val, chip);
      });
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildFooter();
    bindLeadForms();
  });
})();

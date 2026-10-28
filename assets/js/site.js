/* حقيبة التاجر الإلكتروني — واجهة الموقع */
(function () {
  const { icon, LOGO } = window.ECT;
  const DRAFT_KEY = 'ect:draft';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arNum = (n) => Number(n).toLocaleString('ar-SA');

  let DATA = null;
  let CATS = [];
  const state = { route: null };

  /* ---------- تحميل البيانات ---------- */
  async function load() {
    const params = new URLSearchParams(location.search);
    if (params.has('preview')) {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          const bar = $('#preview-bar');
          bar.innerHTML = 'وضع المعاينة: تعرض هذه الصفحة المسودة المحفوظة في لوحة التحكم ولم تُنشر بعد. <a href="./">عرض النسخة المنشورة</a>';
          bar.hidden = false;
          return draft.data || draft;
        }
      } catch (e) { /* تجاهل المسودة التالفة */ }
    }
    const res = await fetch('data/site.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('تعذّر تحميل البيانات');
    return res.json();
  }

  const visibleCats = () => DATA.categories.filter((c) => !c.hidden);
  const countItems = (c) => c.groups.reduce((n, g) => n + (g.items ? g.items.length : 0), 0);
  const countAll = (c) => c.groups.reduce((n, g) => n + (g.items ? g.items.length : 0) + (g.images ? g.images.length : 0), 0);
  const findCat = (id) => CATS.find((c) => c.id === id);
  const href = (u) => esc(u || '#');
  const initials = (name) => (name || '').replace(/^(منصة|موقع|شركة|مركز|بنك)\s+/, '').trim().charAt(0) || '•';

  /* ---------- الإطار العام ---------- */
  function frame() {
    const s = DATA.site;
    document.title = s.name + ' — ' + s.tagline.replace(/\.$/, '');
    $('#brand-name').innerHTML = wordmark(s.name);
    $$('.brand-mark').forEach((el) => (el.innerHTML = LOGO));
    $$('[data-icon]').forEach((el) => (el.outerHTML = icon(el.dataset.icon)));
    $('#suggest-top').href = s.suggest.url;

    $('#mega-grid').innerHTML = CATS.map((c) => `
      <a class="mega-link" href="#/c/${esc(c.id)}">
        <span class="cat-ic">${icon(c.icon)}</span>
        <span><strong>${esc(c.title)}</strong><small>${countItems(c) ? arNum(countItems(c)) + ' عنصر' : 'قريباً'}</small></span>
      </a>`).join('');

    $('#drawer-nav').innerHTML = `
      <a href="#/"><span class="cat-ic">${icon('home')}</span>الرئيسية</a>
      <a href="#/about"><span class="cat-ic">${icon('info')}</span>عن الحقيبة</a>
      <div class="sep"></div>` +
      CATS.map((c) => `<a href="#/c/${esc(c.id)}" data-cat="${esc(c.id)}"><span class="cat-ic">${icon(c.icon)}</span>${esc(c.title)}</a>`).join('') +
      `<div class="sep"></div><a href="${href(s.suggest.url)}" target="_blank" rel="noopener"><span class="cat-ic">${icon('plus')}</span>${esc(s.suggest.label)}</a>`;

    $('#footer').innerHTML = `
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-about">
            <a class="brand" href="#/"><span class="brand-mark">${LOGO}</span><span class="brand-text"><strong>${wordmark(s.name)}</strong><small>E‑Commerce Toolkit</small></span></a>
            <p>${esc(s.intro[0] || '')}</p>
            <div class="socials" style="margin-top:18px">${socials(s.author.socials)}</div>
          </div>
          <nav class="foot-links" aria-label="الأقسام">
            ${CATS.map((c) => `<a href="#/c/${esc(c.id)}">${esc(c.title)}</a>`).join('')}
          </nav>
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} ${esc(s.name)} — ${esc(s.author.role)}: ${esc(s.author.name)}</span>
          <span><a href="${href(s.suggest.url)}" target="_blank" rel="noopener">${esc(s.suggest.label)}</a> · <a href="${href(s.readiness.url)}" target="_blank" rel="noopener">${esc(s.readiness.label)}</a></span>
        </div>
      </div>`;
  }

  // تلوين الكلمة الأخيرة من اسم الموقع
  function wordmark(name) {
    const parts = String(name).trim().split(/\s+/);
    if (parts.length < 2) return esc(name);
    const last = parts.pop();
    return esc(parts.join(' ')) + ' <span>' + esc(last) + '</span>';
  }

  function socials(list) {
    return (list || []).filter((x) => x.url).map((x) => {
      const label = (window.ECT.SOCIAL_TYPES[x.type] || x.type);
      const url = x.type === 'email' && !/^mailto:/.test(x.url) ? 'mailto:' + x.url : x.url;
      return `<a href="${href(url)}" target="_blank" rel="noopener" aria-label="${esc(label)}" title="${esc(label)}">${icon(x.type)}</a>`;
    }).join('');
  }

  /* ---------- الصفحة الرئيسية ---------- */
  function allLogos() {
    const out = [];
    CATS.forEach((c) => c.groups.forEach((g) => (g.items || []).forEach((it) => {
      if (it.logo) out.push({ src: it.logo, name: it.name, cat: c.id, id: it.id });
    })));
    return out;
  }

  function viewHome() {
    const s = DATA.site;
    const tools = CATS.reduce((n, c) => n + countItems(c), 0);
    const reports = findCat('reports');
    const reportsN = reports ? countAll(reports) : 0;
    // جدار الشعارات: توزيع ثابت على ثلاثة أعمدة
    const logos = allLogos().filter((l) => l.cat !== 'reports');
    const seen = new Set();
    const uniq = logos.filter((l) => (seen.has(l.name) ? false : seen.add(l.name)));
    const pick = uniq.filter((_, i) => i % 2 === 0).concat(uniq.filter((_, i) => i % 2 === 1)).slice(0, 30);
    const cols = [[], [], []];
    pick.forEach((l, i) => cols[i % 3].push(l));
    const tile = (l) => `<a class="lw-tile" href="#/c/${esc(l.cat)}/${esc(l.id)}" title="${esc(l.name)}"><img src="${esc(l.src)}" alt="${esc(l.name)}" loading="lazy"></a>`;
    const popular = ['e-commerce-platforms', 'e-payment', 'marketplaces', 'finance', 'AI'].map(findCat).filter(Boolean);
    const tagline = esc(s.tagline).replace('في موقع واحد', '<em>في موقع واحد</em>');

    return `
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="reveal">
            <span class="eyebrow"><b>مجاني</b> دليل متجدد باستمرار للتاجر الإلكتروني</span>
            <h1>${tagline}</h1>
            <div class="hero-intro">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
            <div class="hero-search" role="button" tabindex="0" id="hero-search" aria-label="ابحث في الحقيبة">
              ${icon('search')}<span class="ph">ابحث عن منصة أو أداة… مثل: بوابة دفع، سلة، تمويل</span>
              <span class="btn btn-primary btn-sm">بحث</span>
            </div>
            <div class="hero-chips">
              ${popular.map((c) => `<a class="chip" href="#/c/${esc(c.id)}">${icon(c.icon)}${esc(c.title)}</a>`).join('')}
            </div>
            <div class="stats">
              <div class="stat"><strong>${arNum(CATS.length)}</strong><span>قسماً متخصصاً</span></div>
              <div class="stat"><strong>+${arNum(tools - (reports ? countItems(reports) : 0))}</strong><span>منصة وأداة وجهة</span></div>
              <div class="stat"><strong>+${arNum(reportsN)}</strong><span>تقريراً وإحصائية</span></div>
            </div>
          </div>
          <div class="logo-wall" aria-label="من المنصات الموجودة في الحقيبة">
            ${cols.map((col) => `<div class="lw-col"><div class="lw-track">${col.map(tile).join('')}${col.map(tile).join('')}</div></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section" id="sections">
        <div class="wrap">
          <div class="section-head">
            <div><span class="kicker">تصفح الأقسام</span><h2>كل ما تحتاجه لبناء متجرك وتشغيله وتسويقه</h2></div>
            <a class="btn btn-ghost btn-sm" href="${href(s.suggest.url)}" target="_blank" rel="noopener">${icon('plus')}${esc(s.suggest.label)}</a>
          </div>
          <div class="cat-grid">${CATS.map(catCard).join('')}</div>
        </div>
      </section>

      <section class="section" style="padding-top:8px">
        <div class="wrap">
          <div class="band">
            <div>
              <h2>${esc(s.readiness.text)}</h2>
              <p>اختبار قصير يساعدك على معرفة مدى جاهزيتك، وما الذي تحتاجه قبل الانطلاق.</p>
            </div>
            <div class="band-actions">
              <a class="btn btn-accent" href="${href(s.readiness.url)}" target="_blank" rel="noopener">${esc(s.readiness.label)}${icon('arrow')}</a>
              <a class="btn btn-light" href="${href(s.suggest.url)}" target="_blank" rel="noopener">${esc(s.suggest.label)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:8px">
        <div class="wrap">${authorCard()}</div>
      </section>`;
  }

  function catCard(c) {
    const n = countItems(c);
    const faces = [];
    c.groups.forEach((g) => (g.items || []).forEach((it) => { if (it.logo && faces.length < 4) faces.push(it); }));
    const foot = c.id === 'reports'
      ? `<span>${arNum(countAll(c))} تقرير ومادة</span>`
      : n ? `<span class="cat-faces">${faces.map((f) => `<img src="${esc(f.logo)}" alt="" loading="lazy">`).join('')}</span><span>${arNum(n)} ${n > 10 ? 'عنصراً' : 'عناصر'}</span>` : '<span class="soon">قريباً</span>';
    return `
      <a class="cat-card" href="#/c/${esc(c.id)}">
        <span class="cat-ic">${icon(c.icon)}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.summary)}</p>
        <div class="cat-foot"><span style="display:flex;align-items:center;gap:10px">${foot}</span><span class="go">${icon('arrow')}</span></div>
      </a>`;
  }

  function authorCard() {
    const a = DATA.site.author;
    return `
      <div class="author">
        <div class="monogram">${esc(initials(a.name))}</div>
        <div>
          <small>${esc(a.role)}</small>
          <h3>${esc(a.name)}</h3>
          <p>${esc(a.bio)}</p>
        </div>
        <div class="socials">${socials(a.socials)}</div>
      </div>`;
  }

  /* ---------- صفحة القسم ---------- */
  function viewCategory(id) {
    const c = findCat(id);
    if (!c) return viewNotFound();
    const s = DATA.site;
    const i = CATS.indexOf(c);
    const prev = CATS[i - 1], next = CATS[i + 1];
    const groups = c.groups.filter((g) => (g.items && g.items.length) || (g.images && g.images.length));
    const n = c.id === 'reports' ? countAll(c) : countItems(c);
    const named = groups.filter((g) => g.title);

    const body = groups.length ? groups.map((g) => group(c, g)).join('') : `
      <div class="empty">
        <span class="cat-ic">${icon(c.icon)}</span>
        <h3>نعمل على تجهيز هذا القسم</h3>
        <p>سيتم إضافة منصات ${esc(c.title)} قريباً. هل تعرف منصة مناسبة؟ شاركنا بها.</p>
        <a class="btn btn-primary" href="${href(s.suggest.url)}" target="_blank" rel="noopener">${esc(s.suggest.label)}</a>
      </div>`;

    return `
      <section class="page-hero">
        <div class="wrap">
          <nav class="crumbs" aria-label="مسار التنقل"><a href="#/">الرئيسية</a>${icon('chevron')}<a href="#/#sections">الأقسام</a>${icon('chevron')}<span>${esc(c.title)}</span></nav>
          <div class="page-title reveal">
            <span class="cat-ic">${icon(c.icon)}</span>
            <div><h1>${esc(c.title)}</h1><p>${esc(c.summary)}</p></div>
          </div>
          ${c.intro ? `<p class="page-intro">${esc(c.intro)}</p>` : ''}
          <div class="page-meta">
            ${n ? `<span class="chip count">${arNum(n)} ${c.id === 'reports' ? 'مادة' : 'عنصر'}</span>` : ''}
            ${named.length > 1 ? named.map((g) => `<a class="chip" href="#/c/${esc(c.id)}/${esc(g.id)}">${esc(g.title)}</a>`).join('') : ''}
          </div>
        </div>
      </section>
      <div class="wrap layout">
        <aside class="side" aria-label="الأقسام">
          <h4>الأقسام</h4>
          ${CATS.map((x) => `<a href="#/c/${esc(x.id)}" class="${x.id === c.id ? 'active' : ''}">${icon(x.icon)}<span>${esc(x.title)}</span><span class="n">${countItems(x) ? arNum(x.id === 'reports' ? countAll(x) : countItems(x)) : ''}</span></a>`).join('')}
        </aside>
        <div>
          ${body}
          <div class="suggest">
            <strong>${esc(s.suggest.text)}</strong>
            <a class="btn btn-primary" href="${href(s.suggest.url)}" target="_blank" rel="noopener">${esc(s.suggest.label)}</a>
          </div>
          <nav class="pager" aria-label="التنقل بين الأقسام">
            ${prev ? `<a href="#/c/${esc(prev.id)}"><small>${icon('arrowNext')}القسم السابق</small><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
            ${next ? `<a class="next" href="#/c/${esc(next.id)}"><small>القسم التالي${icon('arrow')}</small><strong>${esc(next.title)}</strong></a>` : ''}
          </nav>
        </div>
      </div>`;
  }

  function group(c, g) {
    let inner = '';
    if (g.layout === 'gallery') {
      inner = `<div class="gallery" data-gallery="${esc(g.id)}">${(g.images || []).map((im, k) => `<button data-k="${k}" aria-label="تكبير الصورة"><img src="${esc(im.src)}" alt="${esc(im.caption || g.title)}" loading="lazy"></button>`).join('')}</div>`;
    } else if (g.layout === 'list') {
      inner = `<div class="rows">${g.items.map(row).join('')}</div>`;
    } else {
      inner = `<div class="tool-grid">${g.items.map(card).join('')}</div>`;
    }
    const head = g.title ? `<div class="group-head"><h2>${esc(g.title)}</h2>${g.subtitle ? `<span class="sub">${esc(g.subtitle)}</span>` : ''}</div>` : '';
    return `<section class="group" id="${esc(g.id)}">${head}${g.note ? `<div class="group-note">${esc(g.note)}</div>` : ''}${inner}</section>`;
  }

  function linkBtns(links, first = 'btn-primary') {
    return (links || []).filter((l) => l.url).map((l, k) => `<a class="btn btn-sm ${k === 0 ? first : 'btn-ghost'}" href="${href(l.url)}" target="_blank" rel="noopener">${esc(l.label || 'زيارة الموقع')}${icon('external')}</a>`).join('');
  }

  function card(it) {
    const desc = (it.desc || []).filter(Boolean);
    const long = desc.join(' ').length > 190;
    return `
      <article class="tool" id="${esc(it.id)}">
        ${it.logo ? `<div class="tool-logo"><img src="${esc(it.logo)}" alt="شعار ${esc(it.name)}" loading="lazy"></div>` : `<div class="tool-logo noimg">${esc(initials(it.name))}</div>`}
        <div class="tool-body">
          <h3>${esc(it.name)}</h3>
          ${it.subtitle ? `<span class="sub">${esc(it.subtitle)}</span>` : ''}
          ${desc.length ? `<div class="tool-desc${long ? ' clamp' : ''}">${desc.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
          ${long ? '<button class="more" data-more>اقرأ المزيد</button>' : ''}
          ${it.source ? `<small style="color:var(--muted)">${esc(it.source)}</small>` : ''}
          <div class="tool-links">${linkBtns(it.links)}</div>
        </div>
      </article>`;
  }

  function row(it) {
    const tag = it.kicker ? `<span class="row-tag${/صحفي/.test(it.kicker) ? ' press' : ''}">${esc(it.kicker)}</span>` : '';
    return `
      <article class="row" id="${esc(it.id)}">
        <div>
          ${tag}
          <h3>${esc(it.name)}</h3>
          ${(it.desc || []).filter(Boolean).map((p) => `<p class="desc">${esc(p)}</p>`).join('')}
          ${it.subtitle ? `<p class="desc">${esc(it.subtitle)}</p>` : ''}
          ${it.source ? `<p class="src">${icon('book')}${esc(it.source)}</p>` : ''}
        </div>
        <div class="row-links">${linkBtns(it.links, 'btn-primary')}</div>
      </article>`;
  }

  /* ---------- عن الحقيبة ---------- */
  function viewAbout() {
    const s = DATA.site;
    return `
      <section class="page-hero">
        <div class="wrap">
          <nav class="crumbs"><a href="#/">الرئيسية</a>${icon('chevron')}<span>عن الحقيبة</span></nav>
          <div class="page-title reveal"><span class="cat-ic">${icon('info')}</span><div><h1>عن ${esc(s.name)}</h1><p>${esc(s.tagline)}</p></div></div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="prose">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          <div class="values">
            <div class="value"><span class="cat-ic">${icon('grid')}</span><strong>مرجع واحد</strong><span>أدوات ومنصات رحلة التجارة الإلكترونية مجمّعة ومصنّفة في مكان واحد.</span></div>
            <div class="value"><span class="cat-ic">${icon('star')}</span><strong>مجاني بالكامل</strong><span>خدمة مجانية لجميع التجار الإلكترونيين، بلا تسجيل ولا اشتراك.</span></div>
            <div class="value"><span class="cat-ic">${icon('cloud')}</span><strong>متجدد باستمرار</strong><span>يتم تحديث المحتوى وإضافة المنصات الجديدة بشكل دوري.</span></div>
          </div>
          <div style="margin-top:40px">${authorCard()}</div>
          <div class="suggest">
            <strong>${esc(s.suggest.text)}</strong>
            <a class="btn btn-primary" href="${href(s.suggest.url)}" target="_blank" rel="noopener">${esc(s.suggest.label)}</a>
          </div>
        </div>
      </section>`;
  }

  function viewNotFound() {
    return `<section class="section"><div class="wrap"><div class="empty"><span class="cat-ic">${icon('alert')}</span><h3>الصفحة غير موجودة</h3><p>ربما تم نقل هذا القسم أو حذفه.</p><a class="btn btn-primary" href="#/">العودة للرئيسية</a></div></div></section>`;
  }

  /* ---------- التوجيه ---------- */
  function route() {
    const h = location.hash.replace(/^#/, '') || '/';
    const parts = h.split('/').filter(Boolean);
    const main = $('#main');
    let html, nav = '';
    if (!parts.length || (parts[0] === '' )) { html = viewHome(); nav = 'home'; }
    else if (parts[0] === 'c') { html = viewCategory(decodeURIComponent(parts[1] || '')); nav = parts[1] === 'reports' ? 'reports' : 'cat'; }
    else if (parts[0] === 'about') { html = viewAbout(); nav = 'about'; }
    else if (parts[0] === '#sections' || h === '/#sections') { html = viewHome(); nav = 'home'; }
    else html = viewNotFound();

    const key = parts.slice(0, 2).join('/');
    if (state.route !== key) {
      main.innerHTML = html;
      state.route = key;
      wire(main);
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === nav));
    $$('#drawer-nav a').forEach((a) => a.classList.toggle('active', a.dataset.cat === parts[1]));
    closeMenus();

    // تمرير إلى عنصر/مجموعة داخل القسم أو إلى قسم في الرئيسية
    const target = parts[0] === 'c' ? parts[2] : (h.includes('#sections') ? 'sections' : null);
    if (target) {
      requestAnimationFrame(() => {
        const el = document.getElementById(decodeURIComponent(target));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (el.classList.contains('tool') || el.classList.contains('row')) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
        }
      });
    }
  }

  function wire(root) {
    $$('[data-more]', root).forEach((b) => b.addEventListener('click', () => {
      const d = b.previousElementSibling;
      const open = d.classList.toggle('clamp');
      b.textContent = open ? 'اقرأ المزيد' : 'عرض أقل';
    }));
    const hs = $('#hero-search', root);
    if (hs) { hs.addEventListener('click', openPalette); hs.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPalette(); } }); }
    $$('[data-gallery]', root).forEach((gal) => {
      const imgs = $$('img', gal).map((i) => i.getAttribute('src'));
      $$('button', gal).forEach((b) => b.addEventListener('click', () => openLightbox(imgs, +b.dataset.k)));
    });
  }

  /* ---------- القوائم ---------- */
  function closeMenus() {
    $('#mega').hidden = true; $('#cats-toggle').setAttribute('aria-expanded', 'false');
    $('#drawer').hidden = true; document.body.style.overflow = '';
  }

  /* ---------- البحث ---------- */
  let INDEX = [];
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  function buildIndex() {
    INDEX = [];
    CATS.forEach((c) => {
      INDEX.push({ type: 'cat', cat: c, title: c.title, text: norm(c.title + ' ' + c.summary), url: '#/c/' + c.id });
      c.groups.forEach((g) => (g.items || []).forEach((it) => {
        INDEX.push({ type: 'item', cat: c, item: it, title: it.name, nameN: norm(it.name),
          text: norm([it.name, it.subtitle, it.kicker, it.source, (it.desc || []).join(' '), g.title, (it.links || []).map((l) => l.label + ' ' + l.url).join(' ')].join(' ')),
          url: '#/c/' + c.id + '/' + it.id });
      }));
    });
  }
  let sel = 0, results = [];
  function search(q) {
    const nq = norm(q).trim();
    if (!nq) {
      results = INDEX.filter((r) => r.type === 'cat');
    } else {
      const terms = nq.split(/\s+/);
      results = INDEX.map((r) => {
        if (!terms.every((t) => r.text.includes(t))) return null;
        let score = r.type === 'cat' ? 3 : 0;
        terms.forEach((t) => { if ((r.nameN || norm(r.title)).includes(t)) score += 5; });
        return { r, score };
      }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 40).map((x) => x.r);
    }
    sel = 0; renderResults(q);
  }
  function hl(text, q) {
    const t = esc(text);
    const terms = q.trim().split(/\s+/).filter((x) => x.length > 1);
    if (!terms.length) return t;
    try { return t.replace(new RegExp('(' + terms.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi'), '<mark>$1</mark>'); } catch (e) { return t; }
  }
  function renderResults(q) {
    const box = $('#palette-results');
    if (!results.length) { box.innerHTML = `<div class="pr-empty">لا توجد نتائج لـ «${esc(q)}». جرّب كلمة أخرى، أو <a href="${href(DATA.site.suggest.url)}" target="_blank" rel="noopener" style="color:var(--brand-600);font-weight:600">اقترح إضافتها</a>.</div>`; return; }
    let last = '';
    box.innerHTML = results.map((r, k) => {
      const head = r.type === 'cat' ? 'الأقسام' : r.cat.title;
      const h = head !== last ? `<div class="pr-group">${esc(head)}</div>` : '';
      last = head;
      const logo = r.type === 'cat' ? icon(r.cat.icon) : r.item.logo ? `<img src="${esc(r.item.logo)}" alt="">` : icon(r.cat.icon);
      const sub = r.type === 'cat' ? r.cat.summary : (r.item.desc && r.item.desc[0]) || r.item.source || r.item.subtitle || '';
      return `${h}<a class="pr${k === sel ? ' on' : ''}" href="${r.url}" data-k="${k}"><span class="pr-logo">${logo}</span><span><strong>${hl(r.title, q)}</strong><small>${esc(sub)}</small></span></a>`;
    }).join('');
  }
  function openPalette() {
    closeMenus();
    $('#palette').hidden = false; document.body.style.overflow = 'hidden';
    const inp = $('#palette-q'); inp.value = ''; search(''); inp.focus();
  }
  function closePalette() { $('#palette').hidden = true; document.body.style.overflow = ''; }

  /* ---------- عارض الصور ---------- */
  let lb = { list: [], k: 0 };
  function openLightbox(list, k) { lb = { list, k }; showLb(); $('#lightbox').hidden = false; document.body.style.overflow = 'hidden'; }
  function showLb() { $('#lightbox img').src = lb.list[lb.k]; }
  function closeLb() { $('#lightbox').hidden = true; document.body.style.overflow = ''; }

  /* ---------- الأحداث العامة ---------- */
  function events() {
    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', window.scrollY > 8), { passive: true });
    $('#cats-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const m = $('#mega'); m.hidden = !m.hidden; e.currentTarget.setAttribute('aria-expanded', String(!m.hidden));
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#mega') && !e.target.closest('#cats-toggle')) { $('#mega').hidden = true; $('#cats-toggle').setAttribute('aria-expanded', 'false'); } });
    $('#menu-open').addEventListener('click', () => { $('#drawer').hidden = false; document.body.style.overflow = 'hidden'; });
    $('#menu-close').addEventListener('click', closeMenus);
    $('#drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') closeMenus(); });
    $('#search-open').addEventListener('click', openPalette);
    $('#palette-close').addEventListener('click', closePalette);
    $('#palette').addEventListener('click', (e) => { if (e.target.id === 'palette') closePalette(); if (e.target.closest('.pr')) closePalette(); });
    $('#palette-q').addEventListener('input', (e) => search(e.target.value));
    $('#palette-q').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        $$('.pr').forEach((a) => a.classList.toggle('on', +a.dataset.k === sel));
        const on = $('.pr.on'); if (on) on.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && results[sel]) { location.hash = results[sel].url; closePalette(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePalette(); closeLb(); closeMenus(); }
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if (!typing && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); openPalette(); }
      if (!$('#lightbox').hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        lb.k = (lb.k + (e.key === 'ArrowLeft' ? 1 : -1) + lb.list.length) % lb.list.length; showLb();
      }
    });
    $('#lightbox').addEventListener('click', (e) => {
      if (e.target.closest('.lb-close') || e.target.id === 'lightbox') return closeLb();
      if (e.target.closest('.lb-next')) { lb.k = (lb.k + 1) % lb.list.length; showLb(); }
      if (e.target.closest('.lb-prev')) { lb.k = (lb.k - 1 + lb.list.length) % lb.list.length; showLb(); }
    });
  }

  /* ---------- التشغيل ---------- */
  (async function init() {
    $('#main').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      DATA = await load();
      CATS = visibleCats();
      frame(); buildIndex(); events(); route();
    } catch (err) {
      $('#main').innerHTML = `<section class="section"><div class="wrap"><div class="empty"><h3>تعذّر تحميل المحتوى</h3><p>${esc(err.message)}. إن كنت تفتح الملف مباشرة من جهازك، شغّله عبر خادم محلي (راجع ملف README).</p></div></div></section>`;
    }
  })();
})();

/* حقيبة التاجر الإلكتروني — لوحة التحكم
   - التعديلات تُحفظ تلقائياً كمسودة في متصفح هذا الجهاز.
   - النشر يرفع الصور الجديدة وملف data/site.json إلى مستودع GitHub عبر واجهة GitHub البرمجية،
     فيتحدّث الموقع تلقائياً على GitHub Pages خلال دقيقة تقريباً. */
(function () {
  const { icon, LOGO, CATEGORY_ICONS, SOCIAL_TYPES } = window.ECT;
  const DRAFT_KEY = 'ect:draft';
  const GH_KEY = 'ect:gh';
  const DATA_PATH = 'data/site.json';
  const UPLOAD_DIR = 'assets/uploads';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arNum = (n) => Number(n).toLocaleString('ar-SA');
  const uid = (p) => p + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const src = (p) => (!p ? '' : /^(data:|https?:|blob:)/.test(p) ? p : '../' + p);

  const S = { data: null, base: null, gh: null, local: false };

  /* ================= التخزين ================= */
  function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: S.data, base: S.base, savedAt: Date.now() }));
    } catch (e) {
      toast('مساحة التخزين في المتصفح ممتلئة. انشر التغييرات أو صدّر نسخة احتياطية.', true);
    }
    status();
  }
  const dirty = () => JSON.stringify(S.data) !== S.base;
  function commit(msg) { saveDraft(); if (msg) toast(msg); render(); }

  /* ================= GitHub ================= */
  async function gh(path, opts = {}) {
    const res = await fetch('https://api.github.com' + path, {
      ...opts,
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + S.gh.token, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
    });
    if (res.status === 404) return null;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || ('خطأ ' + res.status));
    return body;
  }
  const repoPath = (p) => `/repos/${encodeURIComponent(S.gh.owner)}/${encodeURIComponent(S.gh.repo)}${p}`;
  async function testRepo(cfg) {
    const prev = S.gh; S.gh = cfg;
    try {
      const r = await gh(repoPath(''));
      if (!r) throw new Error('المستودع غير موجود أو أن الرمز لا يملك صلاحية الوصول إليه');
      if (r.permissions && !r.permissions.push) throw new Error('الرمز لا يملك صلاحية الكتابة على المستودع');
      return r;
    } finally { S.gh = prev; }
  }
  function b64utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  async function getSha(path) {
    const r = await gh(repoPath('/contents/' + path + '?ref=' + encodeURIComponent(S.gh.branch)));
    return r && r.sha;
  }
  async function putFile(path, b64, message, sha) {
    return gh(repoPath('/contents/' + path), { method: 'PUT', body: JSON.stringify({ message, content: b64, branch: S.gh.branch, ...(sha ? { sha } : {}) }) });
  }

  async function publish() {
    if (!S.gh) { location.hash = '#/publish'; toast('اربط مستودع GitHub أولاً من صفحة «النشر والربط»', true); return; }
    if (!dirty()) { toast('لا توجد تغييرات جديدة للنشر'); return; }
    const msgIn = $('#commit-msg');
    const message = (msgIn && msgIn.value.trim()) || 'تحديث محتوى الحقيبة من لوحة التحكم';
    const out = clone(S.data);
    // جمع الصور المضمّنة (data:) لرفعها كملفات
    const pending = [];
    out.categories.forEach((c) => c.groups.forEach((g) => {
      (g.items || []).forEach((it) => { if (it.logo && it.logo.startsWith('data:')) pending.push({ obj: it, key: 'logo', name: c.id }); });
      (g.images || []).forEach((im) => { if (im.src && im.src.startsWith('data:')) pending.push({ obj: im, key: 'src', name: c.id + '-img' }); });
    }));
    const total = pending.length + 1;
    const ui = openProgress();
    try {
      let done = 0;
      for (const p of pending) {
        const m = p.obj[p.key].match(/^data:image\/([a-z0-9+.-]+);base64,(.*)$/i);
        if (!m) continue;
        const ext = m[1].replace('svg+xml', 'svg').replace('jpeg', 'jpg');
        const path = `${UPLOAD_DIR}/${p.name.replace(/[^a-z0-9-]/gi, '') || 'img'}-${uid('')}.${ext}`;
        ui.step(`رفع صورة ${arNum(done + 1)} من ${arNum(pending.length)}…`, done / total);
        await putFile(path, m[2], 'رفع صورة: ' + path);
        p.obj[p.key] = path;
        done++;
      }
      out.meta = { ...(out.meta || {}), version: ((out.meta && out.meta.version) || 0) + 1, updated: new Date().toISOString().slice(0, 10) };
      ui.step('نشر ملف المحتوى…', done / total);
      const sha = await getSha(DATA_PATH);
      const json = JSON.stringify(out, null, 1);
      await putFile(DATA_PATH, b64utf8(json + '\n'), message, sha);
      S.data = out; S.base = JSON.stringify(out);
      saveDraft();
      ui.done('تم النشر بنجاح. سيظهر التحديث على الموقع خلال دقيقة تقريباً.');
      render();
    } catch (e) {
      // حفظ ما رُفع من صور حتى لا يُعاد رفعها
      saveDraft();
      ui.fail('تعذّر النشر: ' + e.message);
    }
  }

  function openProgress() {
    modal('نشر التغييرات', `<p>جارٍ رفع التغييرات إلى المستودع <code>${esc(S.gh.owner + '/' + S.gh.repo)}</code></p><div class="progress"><div id="pg"></div></div><p class="log" id="pg-log"></p>`, '');
    $('#modal').dataset.lock = '1';
    return {
      step(t, f) { $('#pg-log').textContent = t; $('#pg').style.width = Math.round(f * 100) + '%'; },
      done(t) { $('#pg').style.width = '100%'; $('#pg-log').textContent = t; delete $('#modal').dataset.lock; foot(`<button class="btn btn-primary" data-close>تم</button><a class="btn btn-ghost" href="../" target="_blank" rel="noopener">فتح الموقع</a>`); },
      fail(t) { $('#pg-log').innerHTML = `<span style="color:#B4352B">${esc(t)}</span>`; delete $('#modal').dataset.lock; foot('<button class="btn btn-ghost" data-close>إغلاق</button>'); },
    };
  }

  /* ================= تحميل البيانات ================= */
  async function fetchLive() {
    const res = await fetch('../' + DATA_PATH, { cache: 'no-cache' });
    if (!res.ok) throw new Error('تعذّر تحميل ملف المحتوى');
    return res.json();
  }
  async function loadData() {
    const draft = readJSON(DRAFT_KEY);
    let live = null;
    try { live = await fetchLive(); } catch (e) { if (!draft) throw e; }
    if (draft && draft.data) {
      S.data = draft.data; S.base = draft.base || (live ? JSON.stringify(live) : '');
      if (live && draft.base && JSON.stringify(live) !== draft.base && dirty()) {
        showBanner('تم تحديث النسخة المنشورة منذ بدء هذه المسودة (ربما من جهاز آخر). عند النشر ستستبدل مسودتك النسخة الحالية.', 'استخدام النسخة المنشورة', () => { S.data = live; S.base = JSON.stringify(live); hideBanner(); commit('تم تحميل النسخة المنشورة'); });
      } else if (live && !dirty() && JSON.stringify(live) !== S.base) {
        S.data = live; S.base = JSON.stringify(live);
      }
    } else {
      S.data = live; S.base = JSON.stringify(live);
    }
    saveDraft();
  }

  /* ================= واجهات مساعدة ================= */
  function toast(t, err) {
    const el = document.createElement('div');
    el.className = 'toast' + (err ? ' err' : '');
    el.innerHTML = icon(err ? 'alert' : 'check') + '<span>' + esc(t) + '</span>';
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), err ? 5200 : 2600);
  }
  function showBanner(text, action, fn) {
    const b = $('#banner'); b.hidden = false;
    b.innerHTML = icon('info') + `<span>${esc(text)}</span>` + (action ? `<button class="btn btn-ghost btn-sm" style="margin-inline-start:auto">${esc(action)}</button>` : '');
    if (fn) $('button', b).addEventListener('click', fn);
  }
  function hideBanner() { $('#banner').hidden = true; }
  function status() {
    const el = $('#status'); if (!el) return;
    const d = dirty();
    el.className = 'status' + (d ? ' dirty' : '');
    el.textContent = d ? 'تغييرات غير منشورة' : 'متطابق مع المنشور';
    const conn = $('#conn');
    if (conn) conn.innerHTML = S.gh ? `<span class="dot on"></span><span>متصل بـ <b>${esc(S.gh.owner + '/' + S.gh.repo)}</b></span>` : `<span class="dot"></span><span>وضع المسودة المحلية</span>`;
  }

  let modalSave = null;
  function modal(title, body, footHtml, onSave) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = body;
    foot(footHtml === undefined ? `<button class="btn btn-primary" data-save>حفظ</button><button class="btn btn-ghost" data-close>إلغاء</button>` : footHtml);
    modalSave = onSave || null;
    $('#modal').hidden = false; document.body.style.overflow = 'hidden';
    const f = $('#modal-body input, #modal-body textarea'); if (f) setTimeout(() => f.focus(), 30);
  }
  function foot(html) { $('#modal-foot').innerHTML = html; }
  function closeModal() { if ($('#modal').dataset.lock) return; $('#modal').hidden = true; document.body.style.overflow = ''; modalSave = null; }

  // تحويل الصور وضغطها داخل المتصفح
  function readImage(file, max) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) return reject(new Error('الملف ليس صورة'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('تعذّرت قراءة الملف'));
      fr.onload = () => {
        if (file.type === 'image/svg+xml') return resolve(fr.result);
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          let out = c.toDataURL('image/webp', 0.86);
          if (!out.startsWith('data:image/webp')) out = c.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.88);
          resolve(out);
        };
        img.onerror = () => reject(new Error('صيغة الصورة غير مدعومة'));
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function pickFiles(multiple) {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = !!multiple;
      inp.onchange = () => resolve(Array.from(inp.files || []));
      inp.click();
    });
  }
  function move(arr, i, d) { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  const cat = (id) => S.data.categories.find((c) => c.id === id);
  const countItems = (c) => c.groups.reduce((n, g) => n + (g.items || []).length + (g.images || []).length, 0);
  const lines = (t) => String(t || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);

  /* ================= العرض والتوجيه ================= */
  function nav() {
    const h = location.hash;
    const items = [
      ['#/', 'dashboard', 'لوحة المعلومات'],
      ['#/categories', 'grid', 'الأقسام والمحتوى', S.data.categories.length],
      ['#/settings', 'settings', 'إعدادات الموقع'],
      ['#/publish', 'cloud', 'النشر والربط'],
    ];
    $('#side-nav').innerHTML = items.map(([u, ic, t, n]) => {
      const on = u === '#/' ? (h === '' || h === '#/' || h === '#') : h.startsWith(u) || (u === '#/categories' && h.startsWith('#/category'));
      return `<a href="${u}" class="${on ? 'active' : ''}">${icon(ic)}<span>${t}</span>${n ? `<span class="count">${arNum(n)}</span>` : ''}</a>`;
    }).join('') + `<div style="height:1px;background:var(--line);margin:10px 4px"></div>` +
      S.data.categories.map((c) => `<a href="#/category/${esc(c.id)}" class="${h === '#/category/' + c.id ? 'active' : ''}" style="font-size:.88rem;padding:7px 12px">${icon(c.icon)}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.title)}</span></a>`).join('');
  }

  function crumbs(parts) {
    $('#bar-title').innerHTML = parts.map((p, i) => (i < parts.length - 1 ? `<a href="${p[1]}">${esc(p[0])}</a>${icon('chevron')}` : `<span class="t">${esc(p[0])}</span>`)).join('');
  }

  function render() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [, page, arg] = h.split('/');
    nav(); status();
    $('#sidebar').classList.remove('open');
    const v = $('#view');
    if (!page) v.innerHTML = vDashboard();
    else if (page === 'categories') v.innerHTML = vCategories();
    else if (page === 'category') v.innerHTML = vCategory(decodeURIComponent(arg || ''));
    else if (page === 'settings') v.innerHTML = vSettings();
    else if (page === 'publish') v.innerHTML = vPublish();
    else v.innerHTML = vDashboard();
    bindView(page, arg && decodeURIComponent(arg));
  }

  /* ---------- لوحة المعلومات ---------- */
  function issues() {
    const out = [];
    S.data.categories.forEach((c) => {
      if (!countItems(c)) out.push({ t: `القسم «${c.title}» فارغ`, c: c.id });
      if (c.hidden) out.push({ t: `القسم «${c.title}» مخفي عن الزوار`, c: c.id });
      c.groups.forEach((g) => (g.items || []).forEach((it) => {
        if (!(it.links || []).some((l) => l.url)) out.push({ t: `«${it.name}» بدون رابط`, c: c.id, i: it.id });
        if (g.layout === 'cards' && !it.logo) out.push({ t: `«${it.name}» بدون شعار`, c: c.id, i: it.id });
        if (!it.name) out.push({ t: `عنصر بدون اسم في «${c.title}»`, c: c.id, i: it.id });
      }));
    });
    return out;
  }
  function vDashboard() {
    crumbs([['لوحة المعلومات']]);
    const cats = S.data.categories;
    let items = 0, imgs = 0, logos = 0;
    cats.forEach((c) => c.groups.forEach((g) => { items += (g.items || []).length; imgs += (g.images || []).length; (g.items || []).forEach((i) => { if (i.logo) logos++; }); }));
    const iss = issues();
    return `
      <div class="page-h"><div><h1>أهلاً بك</h1><p>أدِر محتوى ${esc(S.data.site.name)} من هنا، ثم انشر التغييرات بضغطة واحدة.</p></div>
        <div class="actions"><a class="btn btn-primary btn-sm" href="#/categories">${icon('grid')}إدارة الأقسام</a></div></div>
      <div class="kpis">
        <div class="kpi"><span class="cat-ic">${icon('grid')}</span><div><strong>${arNum(cats.length)}</strong><span>قسم</span></div></div>
        <div class="kpi"><span class="cat-ic">${icon('store')}</span><div><strong>${arNum(items)}</strong><span>منصة وأداة وتقرير</span></div></div>
        <div class="kpi"><span class="cat-ic">${icon('image')}</span><div><strong>${arNum(logos)}</strong><span>شعار</span></div></div>
        <div class="kpi"><span class="cat-ic">${icon('chart')}</span><div><strong>${arNum(imgs)}</strong><span>صورة تقارير</span></div></div>
      </div>
      <div class="two">
        <div class="panel">
          <div class="panel-head"><h2>بحث سريع في المحتوى</h2></div>
          <input class="inp" id="dash-q" type="search" placeholder="اكتب اسم منصة أو أداة…">
          <div class="list" id="dash-res" style="margin-top:12px"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>ملاحظات على المحتوى</h2><p>${iss.length ? arNum(iss.length) + ' ملاحظة' : ''}</p></div>
          <div class="alerts">${iss.length ? iss.slice(0, 12).map((x) => `<div class="alert">${icon('alert')}<span>${esc(x.t)}</span><a href="#/category/${esc(x.c)}"${x.i ? ` data-open-item="${esc(x.i)}"` : ''}>معالجة</a></div>`).join('') + (iss.length > 12 ? `<div class="alert">${icon('info')}<span>و${arNum(iss.length - 12)} ملاحظات أخرى</span></div>` : '') : `<div class="alert ok">${icon('check')}<span>المحتوى مكتمل ولا توجد ملاحظات.</span></div>`}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><h2>حالة النشر</h2><div class="actions"><a class="btn btn-ghost btn-sm" href="#/publish">${icon('settings')}الإعدادات</a></div></div>
        <p style="color:var(--ink-2)">${dirty() ? 'لديك تغييرات محفوظة كمسودة على هذا الجهاز ولم تُنشر بعد. يمكنك معاينتها قبل النشر.' : 'المسودة متطابقة مع النسخة المنشورة.'}
        ${S.gh ? '' : ' <b>لم يتم ربط مستودع GitHub بعد</b>، لذا لن تظهر التغييرات للزوار حتى تربطه وتنشر.'}</p>
        <p style="color:var(--muted);font-size:.85rem;margin-top:6px">آخر تحديث منشور: ${esc((S.data.meta && S.data.meta.updated) || '—')}</p>
      </div>`;
  }
  function dashSearch(q) {
    const nq = q.trim().toLowerCase();
    const box = $('#dash-res'); if (!box) return;
    if (!nq) { box.innerHTML = ''; return; }
    const res = [];
    S.data.categories.forEach((c) => c.groups.forEach((g) => (g.items || []).forEach((it) => {
      if ((it.name + ' ' + (it.desc || []).join(' ') + ' ' + (it.source || '')).toLowerCase().includes(nq)) res.push({ c, it });
    })));
    box.innerHTML = res.slice(0, 12).map(({ c, it }) => `
      <div class="li"><div class="thumb">${it.logo ? `<img src="${esc(src(it.logo))}" alt="">` : esc((it.name || '?').charAt(0))}</div>
      <div class="grow"><strong>${esc(it.name)}</strong><small>${esc(c.title)}</small></div>
      <div class="tools"><a class="tbtn" href="#/category/${esc(c.id)}" data-open-item="${esc(it.id)}" title="تعديل">${icon('edit')}</a></div></div>`).join('') || '<p style="color:var(--muted)">لا توجد نتائج</p>';
  }

  /* ---------- الأقسام ---------- */
  function vCategories() {
    crumbs([['الأقسام والمحتوى']]);
    const cats = S.data.categories;
    return `
      <div class="page-h"><div><h1>الأقسام والمحتوى</h1><p>رتّب الأقسام، وأخفِ أو أظهِر ما تشاء، وادخل لأي قسم لتعديل منصاته.</p></div>
        <div class="actions"><button class="btn btn-primary btn-sm" data-act="add-cat">${icon('plus')}قسم جديد</button></div></div>
      <div class="list">
        ${cats.map((c, i) => `
          <div class="li${c.hidden ? ' muted' : ''}">
            <span class="cat-ic">${icon(c.icon)}</span>
            <div class="grow"><strong>${esc(c.title)}${c.hidden ? '<span class="pill">مخفي</span>' : ''}${!countItems(c) ? '<span class="pill warn">فارغ</span>' : ''}</strong><small>${arNum(countItems(c))} عنصر · ${esc(c.summary)}</small></div>
            <div class="tools">
              <button class="tbtn" data-act="cat-up" data-i="${i}" ${i === 0 ? 'disabled' : ''} title="تحريك لأعلى">${icon('up')}</button>
              <button class="tbtn" data-act="cat-down" data-i="${i}" ${i === cats.length - 1 ? 'disabled' : ''} title="تحريك لأسفل">${icon('down')}</button>
              <button class="tbtn" data-act="cat-vis" data-i="${i}" title="${c.hidden ? 'إظهار' : 'إخفاء'}">${icon(c.hidden ? 'eyeOff' : 'eye')}</button>
              <a class="tbtn" href="#/category/${esc(c.id)}" title="تعديل">${icon('edit')}</a>
              <button class="tbtn danger" data-act="cat-del" data-i="${i}" title="حذف">${icon('trash')}</button>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function catForm(c) {
    return `
      <div class="form">
        <div class="grid-2">
          <label class="field"><span>اسم القسم</span><input name="title" value="${esc(c.title)}" required></label>
          <label class="field"><span>المعرّف في الرابط <small>(حروف إنجليزية وأرقام وشرطات)</small></span><input name="id" value="${esc(c.id)}" dir="ltr" pattern="[A-Za-z0-9-]+" required></label>
        </div>
        <label class="field"><span>وصف مختصر <small>(يظهر في بطاقة القسم)</small></span><input name="summary" value="${esc(c.summary)}"></label>
        <label class="field"><span>مقدمة الصفحة <small>(اختياري)</small></span><textarea name="intro" rows="3">${esc(c.intro || '')}</textarea></label>
        <div class="field"><span>الأيقونة</span><div class="icon-pick">${CATEGORY_ICONS.map((n) => `<button type="button" data-ic="${n}" class="${n === c.icon ? 'on' : ''}" title="${n}">${icon(n)}</button>`).join('')}</div><input type="hidden" name="icon" value="${esc(c.icon)}"></div>
        <label class="switch"><input type="checkbox" name="hidden" ${c.hidden ? 'checked' : ''}>إخفاء القسم عن الزوار</label>
      </div>`;
  }
  function readCatForm(root, c, isNew) {
    const f = (n) => $(`[name="${n}"]`, root);
    const id = f('id').value.trim();
    if (!f('title').value.trim()) throw new Error('اسم القسم مطلوب');
    if (!/^[A-Za-z0-9-]+$/.test(id)) throw new Error('المعرّف يجب أن يحتوي على حروف إنجليزية وأرقام وشرطات فقط');
    if (S.data.categories.some((x) => x.id === id && x !== c)) throw new Error('هذا المعرّف مستخدم لقسم آخر');
    c.title = f('title').value.trim(); c.id = id; c.summary = f('summary').value.trim(); c.intro = f('intro').value.trim();
    c.icon = f('icon').value; c.hidden = f('hidden').checked;
    if (isNew) S.data.categories.push(c);
    return c;
  }

  /* ---------- تعديل قسم ---------- */
  function vCategory(id) {
    const c = cat(id);
    if (!c) { crumbs([['الأقسام', '#/categories'], ['غير موجود']]); return '<div class="panel">القسم غير موجود.</div>'; }
    crumbs([['الأقسام', '#/categories'], [c.title]]);
    return `
      <div class="page-h">
        <span class="cat-ic" style="width:56px;height:56px;border-radius:16px;background:var(--brand-700);color:#fff;border-color:var(--brand-700)">${icon(c.icon)}</span>
        <div><h1>${esc(c.title)}${c.hidden ? '<span class="pill">مخفي</span>' : ''}</h1><p>${esc(c.summary)}</p></div>
        <div class="actions">
          <a class="btn btn-ghost btn-sm" href="../?preview=1#/c/${esc(c.id)}" target="_blank" rel="noopener">${icon('eye')}معاينة</a>
          <button class="btn btn-ghost btn-sm" data-act="cat-edit">${icon('edit')}بيانات القسم</button>
        </div>
      </div>
      ${c.groups.map((g, gi) => group(c, g, gi)).join('')}
      <div class="add-row" style="margin-top:14px">
        <button class="dashed" data-act="grp-add">${icon('plus')}إضافة مجموعة جديدة</button>
      </div>`;
  }
  const LAYOUTS = { cards: 'بطاقات بشعار', list: 'قائمة روابط/تقارير', gallery: 'معرض صور' };
  function group(c, g, gi) {
    const n = c.groups.length;
    let body;
    if (g.layout === 'gallery') {
      body = `<div class="imgs">${(g.images || []).map((im, k) => `
        <div class="img-cell"><img src="${esc(src(im.src))}" alt="" loading="lazy">
          <div class="tools">
            <button class="tbtn" data-act="img-up" data-g="${gi}" data-k="${k}" ${k === 0 ? 'disabled' : ''}>${icon('arrowNext')}</button>
            <button class="tbtn danger" data-act="img-del" data-g="${gi}" data-k="${k}">${icon('trash')}</button>
            <button class="tbtn" data-act="img-down" data-g="${gi}" data-k="${k}" ${k === g.images.length - 1 ? 'disabled' : ''}>${icon('arrow')}</button>
          </div></div>`).join('')}</div>
        <button class="dashed" data-act="img-add" data-g="${gi}">${icon('upload')}رفع صور</button>`;
    } else {
      body = (g.items || []).map((it, k) => `
        <div class="li">
          <div class="thumb">${it.logo ? `<img src="${esc(src(it.logo))}" alt="" loading="lazy">` : (g.layout === 'list' ? icon('link') : esc((it.name || '?').charAt(0)))}</div>
          <div class="grow"><strong>${it.kicker ? `<span class="pill">${esc(it.kicker)}</span> ` : ''}${esc(it.name || 'بدون اسم')}</strong><small>${esc(it.subtitle || it.source || (it.desc || [])[0] || '')}</small></div>
          <div class="tools">
            <button class="tbtn" data-act="it-up" data-g="${gi}" data-k="${k}" ${k === 0 ? 'disabled' : ''} title="لأعلى">${icon('up')}</button>
            <button class="tbtn" data-act="it-down" data-g="${gi}" data-k="${k}" ${k === g.items.length - 1 ? 'disabled' : ''} title="لأسفل">${icon('down')}</button>
            <button class="tbtn" data-act="it-edit" data-g="${gi}" data-k="${k}" title="تعديل">${icon('edit')}</button>
            <button class="tbtn" data-act="it-dup" data-g="${gi}" data-k="${k}" title="نسخ">${icon('copy')}</button>
            <button class="tbtn danger" data-act="it-del" data-g="${gi}" data-k="${k}" title="حذف">${icon('trash')}</button>
          </div>
        </div>`).join('') + `<button class="dashed" data-act="it-add" data-g="${gi}">${icon('plus')}إضافة ${g.layout === 'list' ? 'رابط أو تقرير' : 'منصة أو أداة'}</button>`;
    }
    return `
      <section class="grp">
        <div class="grp-head">
          <h3>${esc(g.title || 'بدون عنوان')} <em>· ${LAYOUTS[g.layout] || ''}</em></h3>
          <div class="tools">
            <button class="tbtn" data-act="grp-up" data-g="${gi}" ${gi === 0 ? 'disabled' : ''} title="لأعلى">${icon('up')}</button>
            <button class="tbtn" data-act="grp-down" data-g="${gi}" ${gi === n - 1 ? 'disabled' : ''} title="لأسفل">${icon('down')}</button>
            <button class="tbtn" data-act="grp-edit" data-g="${gi}" title="تعديل المجموعة">${icon('settings')}</button>
            <button class="tbtn danger" data-act="grp-del" data-g="${gi}" title="حذف المجموعة">${icon('trash')}</button>
          </div>
        </div>
        <div class="grp-body">${body}</div>
      </section>`;
  }

  function groupModal(c, g, isNew) {
    modal(isNew ? 'مجموعة جديدة' : 'تعديل المجموعة', `
      <div class="form">
        <label class="field"><span>عنوان المجموعة <small>(اتركه فارغاً إن كانت المجموعة الوحيدة)</small></span><input name="title" value="${esc(g.title || '')}"></label>
        <label class="field"><span>عنوان فرعي <small>(اختياري)</small></span><input name="subtitle" value="${esc(g.subtitle || '')}"></label>
        <label class="field"><span>ملاحظة تظهر أعلى المجموعة <small>(اختياري)</small></span><textarea name="note" rows="2">${esc(g.note || '')}</textarea></label>
        <label class="field"><span>طريقة العرض</span><select name="layout">${Object.entries(LAYOUTS).map(([k, v]) => `<option value="${k}" ${g.layout === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <small class="hint">البطاقات للمنصات ذات الشعارات، والقائمة للتقارير والروابط، والمعرض لصور الإنفوجرافيك.</small></label>
      </div>`, undefined, (root) => {
      const f = (n) => $(`[name="${n}"]`, root).value.trim();
      g.title = f('title'); g.subtitle = f('subtitle'); g.note = f('note'); g.layout = f('layout');
      if (!g.subtitle) delete g.subtitle; if (!g.note) delete g.note;
      g.items = g.items || []; if (g.layout === 'gallery') g.images = g.images || [];
      if (isNew) c.groups.push(g);
      return isNew ? 'تمت إضافة المجموعة' : 'تم حفظ المجموعة';
    });
  }

  function itemModal(c, gi, k) {
    const isNew = k == null;
    const g = c.groups[gi];
    const it = isNew ? { id: uid('t'), name: '', desc: [], links: [{ label: 'زيارة الموقع', url: '' }] } : clone(g.items[k]);
    const list = g.layout === 'list';
    const groupsOpts = S.data.categories.map((cc) => cc.groups.map((gg, j) => gg.layout === 'gallery' ? '' : `<option value="${esc(cc.id)}|${j}" ${cc === c && j === gi ? 'selected' : ''}>${esc(cc.title)}${gg.title ? ' ← ' + esc(gg.title) : ''}</option>`).join('')).join('');
    const linkRow = (l) => `<div class="link-row"><input class="inp" data-l="label" placeholder="نص الزر" value="${esc(l.label)}"><input class="inp" data-l="url" placeholder="https://" dir="ltr" value="${esc(l.url)}"><button type="button" class="tbtn danger" data-rm title="حذف">${icon('trash')}</button></div>`;
    modal(isNew ? 'إضافة عنصر' : 'تعديل: ' + it.name, `
      <div class="form" id="it-form">
        <div class="grid-2">
          <label class="field"><span>الاسم</span><input name="name" value="${esc(it.name)}" required></label>
          <label class="field"><span>${list ? 'التصنيف' : 'عنوان فرعي'} <small>(اختياري)</small></span><input name="${list ? 'kicker' : 'subtitle'}" value="${esc(list ? it.kicker || '' : it.subtitle || '')}" ${list ? 'list="kickers"' : ''}></label>
          <datalist id="kickers"><option value="تقرير"><option value="تقرير صحفي"></datalist>
        </div>
        <label class="field"><span>الوصف <small>(كل سطر فقرة مستقلة)</small></span><textarea name="desc" rows="5">${esc((it.desc || []).join('\n'))}</textarea></label>
        <label class="field"><span>المصدر أو جهة الإصدار <small>(اختياري)</small></span><input name="source" value="${esc(it.source || '')}" placeholder="مثال: من إصدار: منصة سلة"></label>
        ${!list || it.logo ? `<div class="field"><span>الشعار</span>
          <div class="logo-edit">
            <div class="logo-prev" id="logo-prev">${it.logo ? `<img src="${esc(src(it.logo))}" alt="">` : 'لا يوجد شعار'}</div>
            <div class="stack">
              <div class="add-row"><button type="button" class="btn btn-ghost btn-sm" id="logo-up">${icon('upload')}رفع صورة</button><button type="button" class="btn btn-ghost btn-sm" id="logo-rm">${icon('trash')}إزالة</button></div>
              <input class="inp" id="logo-url" dir="ltr" placeholder="أو ألصق رابط صورة https://" value="${esc(it.logo && !it.logo.startsWith('data:') ? it.logo : '')}">
              <small class="hint">يُفضّل شعار بخلفية بيضاء أو شفافة. تُضغط الصورة تلقائياً.</small>
            </div>
          </div></div>` : ''}
        <div class="field"><span>الروابط والأزرار</span><div class="links-ed" id="links">${(it.links || []).map(linkRow).join('')}</div>
          <button type="button" class="btn btn-ghost btn-sm" id="link-add" style="justify-self:start">${icon('plus')}إضافة رابط</button></div>
        <label class="field"><span>المكان</span><select name="where">${groupsOpts}</select></label>
      </div>`, undefined, (root) => {
      const f = (n) => { const el = $(`[name="${n}"]`, root); return el ? el.value.trim() : ''; };
      it.name = f('name');
      if (!it.name) throw new Error('الاسم مطلوب');
      if (list) { it.kicker = f('kicker'); if (!it.kicker) delete it.kicker; } else { it.subtitle = f('subtitle'); if (!it.subtitle) delete it.subtitle; }
      it.desc = lines(f('desc'));
      it.source = f('source'); if (!it.source) delete it.source;
      const lu = $('#logo-url', root);
      if (lu && lu.value.trim() && !(it.logo || '').startsWith('data:')) it.logo = lu.value.trim();
      if (!it.logo) delete it.logo;
      it.links = $$('.link-row', root).map((r) => ({ label: $('[data-l="label"]', r).value.trim() || 'زيارة الموقع', url: $('[data-l="url"]', r).value.trim() })).filter((l) => l.url);
      const [cid, gj] = f('where').split('|');
      const target = cat(cid).groups[+gj];
      if (!isNew) g.items.splice(k, 1);
      if (!isNew && target === g) g.items.splice(k, 0, it); else target.items.push(it);
      return isNew ? 'تمت إضافة العنصر' : (target === g ? 'تم حفظ التعديلات' : 'تم نقل العنصر وحفظه');
    });
    const root = $('#modal-body');
    $('#link-add', root).onclick = () => { $('#links', root).insertAdjacentHTML('beforeend', linkRow({ label: 'زيارة الموقع', url: '' })); };
    $('#links', root).addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) b.closest('.link-row').remove(); });
    const prev = $('#logo-prev', root);
    if (prev) {
      $('#logo-up', root).onclick = async () => {
        const [file] = await pickFiles(false); if (!file) return;
        try { it.logo = await readImage(file, 600); prev.innerHTML = `<img src="${esc(it.logo)}" alt="">`; $('#logo-url', root).value = ''; } catch (e) { toast(e.message, true); }
      };
      $('#logo-rm', root).onclick = () => { delete it.logo; prev.textContent = 'لا يوجد شعار'; $('#logo-url', root).value = ''; };
      $('#logo-url', root).addEventListener('change', (e) => { const v = e.target.value.trim(); if (v) { it.logo = v; prev.innerHTML = `<img src="${esc(src(v))}" alt="">`; } });
    }
  }

  /* ---------- الإعدادات ---------- */
  function vSettings() {
    crumbs([['إعدادات الموقع']]);
    const s = S.data.site;
    const soc = (x) => `<div class="social-row"><select class="inp" data-s="type">${Object.entries(SOCIAL_TYPES).map(([k, v]) => `<option value="${k}" ${x.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select><input class="inp" data-s="url" dir="ltr" value="${esc(x.url)}" placeholder="https://"><button type="button" class="tbtn danger" data-rm>${icon('trash')}</button></div>`;
    return `
      <form id="settings" class="form">
        <div class="page-h"><div><h1>إعدادات الموقع</h1><p>النصوص العامة، أزرار الدعوة، وبيانات صاحب الفكرة.</p></div>
          <div class="actions"><button class="btn btn-primary btn-sm" type="submit">${icon('check')}حفظ الإعدادات</button></div></div>
        <div class="panel">
          <div class="panel-head"><h2>الهوية والتعريف</h2></div>
          <div class="form">
            <div class="grid-2">
              <label class="field"><span>اسم الموقع</span><input name="name" value="${esc(s.name)}"></label>
              <label class="field"><span>الشعار النصي (العنوان الرئيسي)</span><input name="tagline" value="${esc(s.tagline)}"></label>
            </div>
            <label class="field"><span>نبذة الصفحة الرئيسية <small>(كل سطر فقرة)</small></span><textarea name="intro" rows="4">${esc(s.intro.join('\n'))}</textarea></label>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>أزرار الدعوة</h2><p>روابط النماذج الخارجية (مثل Google Forms).</p></div>
          <div class="form">
            <div class="grid-3">
              <label class="field"><span>سؤال تقييم الجاهزية</span><input name="r_text" value="${esc(s.readiness.text)}"></label>
              <label class="field"><span>نص الزر</span><input name="r_label" value="${esc(s.readiness.label)}"></label>
              <label class="field"><span>الرابط</span><input name="r_url" dir="ltr" value="${esc(s.readiness.url)}"></label>
            </div>
            <div class="grid-3">
              <label class="field"><span>نص اقتراح موقع</span><input name="s_text" value="${esc(s.suggest.text)}"></label>
              <label class="field"><span>نص الزر</span><input name="s_label" value="${esc(s.suggest.label)}"></label>
              <label class="field"><span>الرابط</span><input name="s_url" dir="ltr" value="${esc(s.suggest.url)}"></label>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>صاحب الفكرة</h2></div>
          <div class="form">
            <div class="grid-2">
              <label class="field"><span>الاسم</span><input name="a_name" value="${esc(s.author.name)}"></label>
              <label class="field"><span>الصفة</span><input name="a_role" value="${esc(s.author.role)}"></label>
            </div>
            <label class="field"><span>النبذة</span><textarea name="a_bio" rows="3">${esc(s.author.bio)}</textarea></label>
            <div class="field"><span>حسابات التواصل</span><div class="links-ed" id="socials">${s.author.socials.map(soc).join('')}</div>
              <button type="button" class="btn btn-ghost btn-sm" id="soc-add" style="justify-self:start">${icon('plus')}إضافة حساب</button></div>
          </div>
        </div>
      </form>
      <template id="soc-tpl">${soc({ type: 'instagram', url: '' })}</template>`;
  }

  /* ---------- النشر والربط ---------- */
  function vPublish() {
    crumbs([['النشر والربط']]);
    const g = S.gh || { owner: guessRepo().owner, repo: guessRepo().repo, branch: 'main', token: '' };
    return `
      <div class="page-h"><div><h1>النشر والربط</h1><p>اربط لوحة التحكم بمستودع GitHub لنشر التغييرات مباشرة إلى الموقع.</p></div></div>
      <div class="two">
        <div class="panel">
          <div class="panel-head"><h2>نشر التغييرات</h2></div>
          <p style="color:var(--ink-2)">${dirty() ? 'لديك تغييرات غير منشورة.' : 'لا توجد تغييرات جديدة.'} ${S.gh ? '' : 'اربط المستودع أولاً.'}</p>
          <label class="field" style="margin-top:12px"><span>وصف التحديث <small>(يظهر في سجل GitHub)</small></span><input id="commit-msg" class="inp" placeholder="تحديث محتوى الحقيبة من لوحة التحكم"></label>
          <div class="add-row" style="margin-top:14px">
            <button class="btn btn-accent" data-act="publish" ${S.gh && dirty() ? '' : 'disabled style="opacity:.5"'}>${icon('cloud')}نشر الآن</button>
            <a class="btn btn-ghost" href="../?preview=1" target="_blank" rel="noopener">${icon('eye')}معاينة المسودة</a>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>ربط GitHub</h2><span class="pill ${S.gh ? '' : 'warn'}">${S.gh ? 'متصل' : 'غير متصل'}</span></div>
          <form class="form" id="gh-form">
            <div class="grid-2">
              <label class="field"><span>اسم المالك</span><input name="owner" dir="ltr" value="${esc(g.owner)}" required></label>
              <label class="field"><span>المستودع</span><input name="repo" dir="ltr" value="${esc(g.repo)}" required></label>
            </div>
            <div class="grid-2">
              <label class="field"><span>الفرع</span><input name="branch" dir="ltr" value="${esc(g.branch)}" required></label>
              <label class="field"><span>رمز الوصول</span><input name="token" type="password" dir="ltr" placeholder="${S.gh ? '•••••• (محفوظ)' : 'github_pat_…'}" autocomplete="off"></label>
            </div>
            <div class="add-row"><button class="btn btn-primary btn-sm" type="submit">${icon('link')}حفظ واختبار الاتصال</button>
              ${S.gh ? `<button class="btn btn-ghost btn-sm" type="button" data-act="gh-out">${icon('logout')}فصل الربط</button>` : ''}</div>
          </form>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><h2>النسخ الاحتياطي</h2><p>صدّر المحتوى كملف، أو استورد ملفاً سابقاً، أو تراجع عن المسودة.</p></div>
        <div class="add-row">
          <button class="btn btn-ghost btn-sm" data-act="export">${icon('download')}تصدير ملف المحتوى</button>
          <button class="btn btn-ghost btn-sm" data-act="import">${icon('upload')}استيراد ملف محتوى</button>
          <button class="btn btn-ghost btn-sm" data-act="reset" style="color:#B4352B">${icon('trash')}تجاهل المسودة واستعادة المنشور</button>
        </div>
        <p class="hint" style="color:var(--muted);font-size:.85rem;margin-top:10px">بدون ربط GitHub: صدّر الملف وارفعه يدوياً إلى المستودع في المسار <code>data/site.json</code>. الصور المرفوعة تكون مضمّنة داخل الملف في هذه الحالة.</p>
      </div>`;
  }
  function guessRepo() {
    const m = location.hostname.match(/^([^.]+)\.github\.io$/);
    const seg = location.pathname.split('/').filter(Boolean);
    return { owner: m ? m[1] : '', repo: m ? (seg[0] && seg[0] !== 'admin' ? seg[0] : m[1] + '.github.io') : 'e-commerce-toolkit' };
  }

  /* ================= ربط الأحداث ================= */
  function bindView(page, arg) {
    const v = $('#view');
    if (!page) {
      const q = $('#dash-q'); if (q) q.addEventListener('input', (e) => dashSearch(e.target.value));
    }
    if (page === 'settings') {
      const form = $('#settings');
      $('#soc-add').onclick = () => $('#socials').insertAdjacentHTML('beforeend', $('#soc-tpl').innerHTML);
      $('#socials').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) b.closest('.social-row').remove(); });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = (n) => form.elements[n].value.trim();
        const s = S.data.site;
        s.name = f('name'); s.tagline = f('tagline'); s.intro = lines(f('intro'));
        s.readiness = { text: f('r_text'), label: f('r_label'), url: f('r_url') };
        s.suggest = { text: f('s_text'), label: f('s_label'), url: f('s_url') };
        s.author = { ...s.author, name: f('a_name'), role: f('a_role'), bio: f('a_bio'),
          socials: $$('.social-row', form).map((r) => ({ type: $('[data-s="type"]', r).value, url: $('[data-s="url"]', r).value.trim() })).filter((x) => x.url) };
        commit('تم حفظ الإعدادات');
      });
    }
    if (page === 'publish') {
      $('#gh-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const cfg = { owner: fd.get('owner').trim(), repo: fd.get('repo').trim(), branch: fd.get('branch').trim() || 'main', token: fd.get('token').trim() || (S.gh && S.gh.token) || '' };
        if (!cfg.token) return toast('أدخل رمز الوصول', true);
        try { await testRepo(cfg); S.gh = cfg; localStorage.setItem(GH_KEY, JSON.stringify(cfg)); toast('تم الاتصال بالمستودع بنجاح'); render(); }
        catch (err) { toast('فشل الاتصال: ' + err.message, true); }
      });
    }
    if (page === 'category') {
      const c = cat(arg);
      const pend = sessionStorage.getItem('ect:open');
      if (c && pend) {
        sessionStorage.removeItem('ect:open');
        c.groups.forEach((g, gi) => (g.items || []).forEach((it, k) => { if (it.id === pend) itemModal(c, gi, k); }));
      }
    }
    v.onclick = (e) => {
      const opener = e.target.closest('[data-open-item]');
      if (opener) sessionStorage.setItem('ect:open', opener.dataset.openItem);
      const b = e.target.closest('[data-act]');
      if (!b) return;
      act(b.dataset.act, b.dataset, page === 'category' ? cat(arg) : null);
    };
  }

  async function act(a, d, c) {
    const cats = S.data.categories;
    const i = +d.i, gi = +d.g, k = +d.k;
    switch (a) {
      case 'cat-up': move(cats, i, -1); return commit();
      case 'cat-down': move(cats, i, 1); return commit();
      case 'cat-vis': cats[i].hidden = !cats[i].hidden; return commit(cats[i].hidden ? 'تم إخفاء القسم' : 'أصبح القسم ظاهراً');
      case 'cat-del':
        if (!confirm(`حذف القسم «${cats[i].title}» وكل محتواه؟`)) return;
        cats.splice(i, 1); return commit('تم حذف القسم');
      case 'add-cat': {
        const nc = { id: 'section-' + (cats.length + 1), title: '', summary: '', icon: 'box', intro: '', hidden: false, groups: [{ id: uid('g'), title: '', layout: 'cards', items: [] }] };
        modal('قسم جديد', catForm(nc), undefined, (root) => { readCatForm(root, nc, true); setTimeout(() => (location.hash = '#/category/' + nc.id)); return 'تمت إضافة القسم'; });
        return;
      }
      case 'cat-edit': {
        const oldId = c.id;
        modal('بيانات القسم', catForm(c), undefined, (root) => { readCatForm(root, c, false); if (c.id !== oldId) setTimeout(() => (location.hash = '#/category/' + c.id)); return 'تم حفظ بيانات القسم'; });
        return;
      }
      case 'grp-add': return groupModal(c, { id: uid('g'), title: '', layout: 'cards', items: [] }, true);
      case 'grp-edit': return groupModal(c, c.groups[gi], false);
      case 'grp-up': move(c.groups, gi, -1); return commit();
      case 'grp-down': move(c.groups, gi, 1); return commit();
      case 'grp-del':
        if (!confirm(`حذف المجموعة «${c.groups[gi].title || 'بدون عنوان'}» بكل عناصرها؟`)) return;
        c.groups.splice(gi, 1); return commit('تم حذف المجموعة');
      case 'it-add': return itemModal(c, gi, null);
      case 'it-edit': return itemModal(c, gi, k);
      case 'it-up': move(c.groups[gi].items, k, -1); return commit();
      case 'it-down': move(c.groups[gi].items, k, 1); return commit();
      case 'it-dup': { const cp = clone(c.groups[gi].items[k]); cp.id = uid('t'); cp.name += ' (نسخة)'; c.groups[gi].items.splice(k + 1, 0, cp); return commit('تم نسخ العنصر'); }
      case 'it-del':
        if (!confirm(`حذف «${c.groups[gi].items[k].name}»؟`)) return;
        c.groups[gi].items.splice(k, 1); return commit('تم الحذف');
      case 'img-add': {
        const files = await pickFiles(true);
        if (!files.length) return;
        const g = c.groups[gi]; g.images = g.images || [];
        for (const f of files) { try { g.images.push({ src: await readImage(f, 1600), caption: '' }); } catch (e) { toast(e.message, true); } }
        return commit(`تمت إضافة ${arNum(files.length)} صورة`);
      }
      case 'img-del': if (!confirm('حذف الصورة؟')) return; c.groups[gi].images.splice(k, 1); return commit('تم حذف الصورة');
      case 'img-up': move(c.groups[gi].images, k, -1); return commit();
      case 'img-down': move(c.groups[gi].images, k, 1); return commit();
      case 'publish': return publish();
      case 'gh-out':
        if (!confirm('فصل الربط وحذف رمز الوصول من هذا الجهاز؟')) return;
        localStorage.removeItem(GH_KEY); S.gh = null; return commit('تم فصل الربط');
      case 'export': {
        const blob = new Blob([JSON.stringify(S.data, null, 1)], { type: 'application/json' });
        const a2 = document.createElement('a'); a2.href = URL.createObjectURL(blob); a2.download = 'site.json'; a2.click();
        setTimeout(() => URL.revokeObjectURL(a2.href), 2000); return;
      }
      case 'import': {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
        inp.onchange = async () => {
          try {
            const j = JSON.parse(await inp.files[0].text());
            if (!j.site || !Array.isArray(j.categories)) throw new Error('الملف لا يطابق بنية المحتوى');
            S.data = j; commit('تم استيراد الملف كمسودة');
          } catch (e) { toast('تعذّر الاستيراد: ' + e.message, true); }
        };
        inp.click(); return;
      }
      case 'reset':
        if (!confirm('سيتم حذف كل التعديلات غير المنشورة على هذا الجهاز. متابعة؟')) return;
        try { const live = await fetchLive(); S.data = live; S.base = JSON.stringify(live); hideBanner(); commit('تمت استعادة النسخة المنشورة'); }
        catch (e) { toast(e.message, true); }
        return;
    }
  }

  /* ================= التشغيل ================= */
  function globalEvents() {
    window.addEventListener('hashchange', render);
    $('#publish-btn').addEventListener('click', publish);
    $('#side-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    $('#modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal' || e.target.closest('[data-close]')) return closeModal();
      const ic = e.target.closest('.icon-pick button');
      if (ic) { $$('.icon-pick button').forEach((x) => x.classList.toggle('on', x === ic)); $('[name="icon"]', $('#modal')).value = ic.dataset.ic; }
      if (e.target.closest('[data-save]') && modalSave) {
        try { const msg = modalSave($('#modal-body')); closeModal(); commit(msg); }
        catch (err) { toast(err.message, true); }
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  }

  async function start() {
    $('#gate').hidden = true;
    $('#app').hidden = false;
    $('#view').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try { await loadData(); } catch (e) { $('#view').innerHTML = `<div class="panel">${esc(e.message)}. شغّل الموقع عبر خادم (راجع README).</div>`; return; }
    globalEvents();
    render();
  }

  function gate() {
    const g = guessRepo();
    const form = $('#gate-form');
    form.owner.value = g.owner; form.repo.value = g.repo;
    $('#gate').hidden = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cfg = { token: form.token.value.trim(), owner: form.owner.value.trim(), repo: form.repo.value.trim(), branch: form.branch.value.trim() || 'main' };
      const err = $('#gate-err'); err.hidden = true;
      if (!cfg.token || !cfg.owner || !cfg.repo) { err.textContent = 'أكمل جميع الحقول'; err.hidden = false; return; }
      const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'جارٍ التحقق…';
      try { await testRepo(cfg); S.gh = cfg; localStorage.setItem(GH_KEY, JSON.stringify(cfg)); start(); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = 'الدخول وربط المستودع'; }
    });
    $('#gate-local').addEventListener('click', () => { sessionStorage.setItem('ect:local', '1'); start(); });
  }

  // تهيئة الأيقونات الثابتة
  $$('[data-logo]').forEach((el) => (el.innerHTML = LOGO));
  $$('[data-icon]').forEach((el) => (el.outerHTML = icon(el.dataset.icon)));
  S.gh = readJSON(GH_KEY);
  if (S.gh || sessionStorage.getItem('ect:local') || readJSON(DRAFT_KEY)) start(); else gate();
})();

/* أيقونات خطية موحّدة (SVG) — تُستخدم في الموقع ولوحة التحكم */
(function () {
  const P = {
    // أيقونات الأقسام
    store: '<path d="M4 9.5 5.4 4.8A1.2 1.2 0 0 1 6.55 4h10.9a1.2 1.2 0 0 1 1.15.8L20 9.5"/><path d="M4 9.5a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0 2.67 2.67 0 0 0 5.33 0"/><path d="M5.5 12.2V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6.8"/><path d="M10 20v-4.5a2 2 0 0 1 4 0V20"/>',
    market: '<path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.47 1.2h8.06a1.5 1.5 0 0 0 1.46-1.15L20 7.5H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/><path d="M10.5 11h6"/>',
    channels: '<circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="5.5" r="1.8"/><circle cx="19" cy="5.5" r="1.8"/><circle cx="5" cy="18.5" r="1.8"/><circle cx="19" cy="18.5" r="1.8"/><path d="m6.4 6.8 3.7 3.4M17.6 6.8l-3.7 3.4M6.4 17.2l3.7-3.4M17.6 17.2l-3.7-3.4"/>',
    dropship: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/><path d="m8 5 8 4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 10h18M7 15h3.5"/>',
    spark: '<path d="M12 3.5c.5 3.9 2.6 6 6.5 6.5-3.9.5-6 2.6-6.5 6.5-.5-3.9-2.6-6-6.5-6.5 3.9-.5 6-2.6 6.5-6.5Z"/><path d="M18.5 15.5c.2 1.6 1 2.4 2.5 2.5-1.5.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.1 2.3-.9 2.5-2.5Z"/>',
    invoice: '<path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 18.9z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    social: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    design: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7h2a4.1 4.1 0 0 0 4.1-4.1C20.5 6.9 16.7 3.5 12 3.5Z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10.5" cy="7.2" r="1.1"/><circle cx="15" cy="7.6" r="1.1"/>',
    truck: '<path d="M2.5 6h11v10h-11z"/><path d="M13.5 9.5h4l3 3.3V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    percent: '<path d="m18.5 5.5-13 13"/><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="17" r="2.3"/>',
    coins: '<ellipse cx="9" cy="6.5" rx="5.5" ry="2.5"/><path d="M3.5 6.5v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V6.5"/><path d="M9.5 16.9c.9.4 2.1.6 3.5.6 3 0 5.5-1.1 5.5-2.5v-4.5c0-1.3-2.1-2.3-4.8-2.5"/><path d="M3.5 11v4.5C3.5 16.9 6 18 9 18"/>',
    tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0L3.8 13.3a1 1 0 0 1-.3-.7Z"/><circle cx="8.2" cy="8.2" r="1.4"/>',
    chart: '<path d="M3.5 20.5h17"/><rect x="5" y="12" width="3" height="6" rx=".6"/><rect x="10.5" y="7.5" width="3" height="10.5" rx=".6"/><rect x="16" y="3.5" width="3" height="14.5" rx=".6"/>',
    gov: '<path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5 20h14M5.5 17.5h13"/><path d="M6.5 11v6.5M10 11v6.5M14 11v6.5M17.5 11v6.5"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16"/>',
    // أيقونات الواجهة
    arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowNext: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    chevron: '<path d="m14.5 6-6 6 6 6"/>',
    chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.2 17v3"/><path d="m14.5 7.5 3 3"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V7"/><path d="M6.5 7l.8 12.1a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9L17.5 7"/><path d="M10 11v5.5M14 11v5.5"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M10.6 6.1c.5-.1.9-.1 1.4-.1 6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.1M6.6 7.6C4 9.300 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.4-1.1"/><path d="M9.9 9.9a2.8 2.8 0 0 0 4.2 4.2"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.5" r="1.6"/><path d="m20.5 16-4.8-4.8L6 19.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    dashboard: '<rect x="3.5" y="3.5" width="7.5" height="9" rx="1.5"/><rect x="13" y="3.5" width="7.5" height="5" rx="1.5"/><rect x="13" y="10.5" width="7.5" height="10" rx="1.5"/><rect x="3.5" y="14.5" width="7.5" height="6" rx="1.5"/>',
    folder: '<path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v8.8A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5z"/><path d="M12 15.5v-5M9.8 12.5 12 10.3l2.2 2.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
    move: '<path d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
    book: '<path d="M4.5 5.5A1.5 1.5 0 0 1 6 4h13.5v14H6a1.5 1.5 0 0 0-1.5 1.5z"/><path d="M4.5 19.5A1.5 1.5 0 0 0 6 21h13.5v-3"/>',
    // شبكات التواصل
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/>',
    x: '<path d="M4.5 4h4.2L19.5 20h-4.2z"/><path d="M19.2 4 13.4 10.6M10.6 13.4 4.8 20"/>',
    linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5V16M8 7.5h.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.3-2.5S16 11.3 16 13v3"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10.2 9.3 4.6 2.7-4.6 2.7z"/>',
    tiktok: '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.4 2.4 2 4 4.5 4.2"/>',
    snapchat: '<path d="M12 4c2.8 0 4.5 2 4.5 4.6v2.2l1.7-.4c.6 0 .8.7.3 1l-1.8 1c.6 1.6 1.8 2.7 3.3 3.1-.4.7-1.4 1-2.6 1.1l-.4 1.3c-1.2-.2-2.3 0-3.2.6-.6.4-1.1.6-1.8.6s-1.2-.2-1.8-.6c-.9-.6-2-.8-3.2-.6l-.4-1.3c-1.2-.1-2.2-.4-2.6-1.1 1.5-.4 2.7-1.5 3.3-3.1l-1.8-1c-.5-.3-.3-1 .3-1l1.7.4V8.6C7.5 6 9.2 4 12 4Z"/>',
    whatsapp: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.4 18.6z"/><path d="M9.3 8.6c.2 2.7 2.3 4.9 5 5.2l.9-1.3-1.7-.8-.7.6c-.9-.4-1.6-1.1-2-2l.6-.7-.8-1.7z"/>',
    telegram: '<path d="M20.5 4.5 3.5 11l5.5 2 2 6 3-3.8 4.5 3.3z"/><path d="m9 13 8.5-6"/>',
    website: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5Z"/>',
    email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    github: '<path d="M9 19.5c-4 1.2-4-2-5.5-2.5M14.5 21.5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6 3.1 5 3.4 5 3.4a4.3 4.3 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.2c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3v3.4"/>'
  };

  // الشعار: حقيبة بمقبض وبداخلها شبكة أدوات
  const LOGO = '<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">' +
    '<path d="M17 13.5v-2.2A4.3 4.3 0 0 1 21.3 7h5.4a4.3 4.3 0 0 1 4.3 4.3v2.2" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>' +
    '<rect x="5" y="13" width="38" height="29" rx="9" fill="currentColor"/>' +
    '<rect x="14.5" y="20.5" width="8" height="8" rx="2.2" fill="var(--logo-accent, #F2A541)"/>' +
    '<rect x="25.5" y="20.5" width="8" height="8" rx="2.2" fill="var(--logo-ink, #fff)" opacity=".92"/>' +
    '<rect x="14.5" y="30.5" width="8" height="5" rx="2" fill="var(--logo-ink, #fff)" opacity=".92"/>' +
    '<rect x="25.5" y="30.5" width="8" height="5" rx="2" fill="var(--logo-ink, #fff)" opacity=".55"/>' +
    '</svg>';

  function icon(name, cls) {
    const body = P[name] || P.box;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  const CATEGORY_ICONS = ['store', 'market', 'channels', 'dropship', 'search', 'card', 'spark', 'invoice', 'social', 'design', 'truck', 'percent', 'coins', 'tag', 'chart', 'gov', 'box', 'book', 'star', 'folder', 'link', 'image'];
  const SOCIAL_TYPES = { instagram: 'إنستغرام', x: 'إكس (تويتر)', linkedin: 'لينكدإن', youtube: 'يوتيوب', tiktok: 'تيك توك', snapchat: 'سناب شات', telegram: 'تيليجرام', whatsapp: 'واتساب', website: 'الموقع الشخصي', email: 'البريد الإلكتروني' };

  window.ECT = Object.assign(window.ECT || {}, { icon, LOGO, CATEGORY_ICONS, SOCIAL_TYPES, ICON_NAMES: Object.keys(P) });
})();

// Language system: ES / CA
const LANG_KEY = 'laura_lang';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'es';
}
function setLang(l) {
  localStorage.setItem(LANG_KEY, l);
  applyLang(l);
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
}
function applyLang(l) {
  document.querySelectorAll('[data-es]').forEach(el => {
    el.textContent = el.dataset[l] || el.dataset.es;
  });
  document.querySelectorAll('[data-es-html]').forEach(el => {
    el.innerHTML = el.dataset[l + 'Html'] || el.dataset.esHtml;
  });
}

// Ajoute automatiquement le lien "Historia" dans les barres de navigation,
// sur toutes les pages, sans avoir à modifier chaque fichier HTML.
function injectHistoireNav() {
  var inPages = /\/pages\//.test(location.pathname);
  var href = inPages ? 'histoire.html' : 'pages/histoire.html';
  var isActive = /histoire\.html$/.test(location.pathname);

  // Barre du bas (mobile)
  var navMobile = document.querySelector('.nav-mobile');
  if (navMobile && !navMobile.querySelector('a[href$="histoire.html"]')) {
    var a = document.createElement('a');
    a.href = href;
    if (isActive) a.className = 'active';
    a.innerHTML = '<span class="icon">\uD83E\uDEB6</span>' +
      '<span data-es="Historia" data-ca="Hist\u00f2ria">Historia</span>';
    navMobile.appendChild(a);
  }

  // Barre du haut (bureau)
  var topbar = document.querySelector('.topbar-nav');
  if (topbar && !topbar.querySelector('a[href$="histoire.html"]')) {
    var t = document.createElement('a');
    t.href = href;
    if (isActive) t.className = 'active';
    t.setAttribute('data-es', 'Historia');
    t.setAttribute('data-ca', 'Hist\u00f2ria');
    t.textContent = 'Historia';
    topbar.appendChild(t);
  }
}

function initLang() {
  injectHistoireNav();
  const l = getLang();
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  applyLang(l);
}
document.addEventListener('DOMContentLoaded', initLang);


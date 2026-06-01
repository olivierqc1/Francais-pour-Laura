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
function initLang() {
  const l = getLang();
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  applyLang(l);
}
document.addEventListener('DOMContentLoaded', initLang);

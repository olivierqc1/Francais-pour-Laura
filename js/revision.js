/* Révision — garde en mémoire (sur l'appareil) les mots/règles ratés
   pour pouvoir les rejouer plus tard. Utilise localStorage (local au navigateur de Laura). */
window.Revision = (function () {
  const KEY = 'laura_errors';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function keyOf(it) {
    return it.type + '|' + (it.fr || it.phrase || '');
  }

  return {
    // Ajoute un item raté (sans doublon)
    add(item) {
      const arr = load();
      const k = keyOf(item);
      if (!arr.some(x => keyOf(x) === k)) {
        item.ts = Date.now();
        arr.push(item);
        save(arr);
      }
    },
    // Retire un item (quand elle le réussit)
    remove(item) {
      const k = keyOf(item);
      save(load().filter(x => keyOf(x) !== k));
    },
    all() { return load(); },
    count() { return load().length; },
    clear() { save([]); }
  };
})();

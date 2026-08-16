/* service-worker.js — permet à Français pour Laura de fonctionner hors ligne.
   Stratégie : les fichiers essentiels sont mis en cache dès la première visite
   (precache). Toute autre page visitée ensuite est aussi ajoutée au cache
   automatiquement (runtime caching), donc le site devient utilisable hors
   ligne au fur et à mesure qu'on le parcourt.
*/

const CACHE_NAME = 'fpl-cache-v1';

// Fichiers indispensables, mis en cache dès l'installation.
// Les fichiers de contenu (histoireN.json, anarchisme*.json, permaculture*.json,
// etc.) ne sont pas listés ici un par un : ils se mettent en cache automatiquement
// dès qu'on visite la page qui les charge (voir le gestionnaire "fetch" plus bas).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/srs.js',
  '/pages/vocabulaire.html',
  '/pages/conjugaison.html',
  '/pages/grammaire.html',
  '/pages/prononciation.html',
  '/pages/prononciation-oreille.html',
  '/pages/poemes.html',
  '/pages/videos.html',
  '/pages/revision.html',
  '/pages/dialogues.html',
  '/pages/lectures.html',
  '/pages/compte.html',
  '/pages/histoire.html',
  '/pages/feminisme.html',
  '/pages/anarchisme.html',
  '/pages/permaculture.html',
  '/pages/wordle.html',
  '/pages/srs.html',
  '/pages/production.html',
  '/data/wordle.json',
  '/data/vocabulaire.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        // Si un des fichiers n'existe pas encore (nouvelle page pas déployée),
        // on ne bloque pas toute l'installation pour autant.
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            PRECACHE_URLS.map(url => cache.add(url).catch(()=>{}))
          );
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // On ne gère que les requêtes GET, sur notre propre domaine.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // pas de réseau : on retombe sur le cache

      // Si on a déjà une version en cache, on la sert tout de suite (rapide),
      // et on met à jour le cache en tâche de fond pour la prochaine fois.
      return cached || networkFetch;
    })
  );
});

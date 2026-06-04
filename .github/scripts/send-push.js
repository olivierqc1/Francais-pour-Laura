// Envoie le "mot du jour" à Laura via OneSignal.
// Choisit un message différent chaque jour dans messages.json (rotation).
const fs = require('fs');

const APP_ID = process.env.ONESIGNAL_APP_ID;
const REST_KEY = process.env.ONESIGNAL_REST_KEY;
if (!APP_ID || !REST_KEY) {
  console.error('❌ Secrets ONESIGNAL_APP_ID / ONESIGNAL_REST_KEY manquants.');
  process.exit(1);
}

// Lit la banque de messages (à la racine du repo)
const data = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
const messages = data.messages;

// Message du jour = rotation par jour de l'année
const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - start) / 86400000);
const msg = messages[dayOfYear % messages.length];

const body = {
  app_id: APP_ID,
  target_channel: 'push',
  included_segments: ['Subscribed Users'],
  headings: { en: msg.titre, fr: msg.titre, es: msg.titre, ca: msg.titre },
  contents: { en: msg.corps, fr: msg.corps, es: msg.corps, ca: msg.corps },
  url: 'https://francaispourlaura.xyz'
};

fetch('https://api.onesignal.com/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + REST_KEY },
  body: JSON.stringify(body)
})
  .then(r => r.json().then(j => ({ status: r.status, j })))
  .then(({ status, j }) => {
    console.log('Statut HTTP:', status);
    console.log('Réponse:', JSON.stringify(j));
    if (j.id) console.log('✅ Envoyé — «', msg.titre, '»');
    else console.log('⚠️ Rien envoyé (personne abonné encore? Laura doit accepter les notifs sur le site).');
  })
  .catch(e => { console.error('Erreur réseau:', e); process.exit(1); });

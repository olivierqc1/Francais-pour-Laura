/* SRS.js — moteur de répétition espacée partagé (style Leitner)
   Utilisé par wordle.html, srs.html, et potentiellement d'autres pages plus tard.
   Stocke un état par mot dans localStorage sous la clé "srs_state".
*/
(function(window){
  const STORAGE_KEY = 'srs_state';
  const NEW_TODAY_KEY = 'srs_new_today';
  const NEW_CARDS_PER_DAY = 15;

  // Intervalles en jours pour chaque "boîte" Leitner (index = numéro de boîte)
  const INTERVALS = [0, 1, 2, 4, 8, 16, 30, 60];
  const MAX_BOX = INTERVALS.length - 1;

  function loadAll(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
  }

  function saveAll(all){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch(e){}
  }

  function todayStr(){
    const d = new Date();
    return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
  }

  function addDays(date, days){
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function getState(id){
    const all = loadAll();
    if (all[id]) return all[id];
    return { box: 0, due: null, reps: 0, lapses: 0, seen: false };
  }

  function setState(id, state){
    const all = loadAll();
    all[id] = state;
    saveAll(all);
  }

  // Retourne true si la carte doit être révisée aujourd'hui (nouvelle carte incluse)
  function isDue(id){
    const st = getState(id);
    if (!st.seen) return true; // nouvelle carte, jamais vue
    if (!st.due) return true;
    return new Date(st.due) <= new Date();
  }

  function isNew(id){
    return !getState(id).seen;
  }

  // Combien de nouvelles cartes ont déjà été introduites aujourd'hui
  function newCardsIntroducedToday(){
    try {
      const raw = localStorage.getItem(NEW_TODAY_KEY);
      if (!raw) return 0;
      const obj = JSON.parse(raw);
      if (obj.date !== todayStr()) return 0;
      return obj.count;
    } catch(e){ return 0; }
  }

  function incrementNewCardsToday(){
    const count = newCardsIntroducedToday() + 1;
    try { localStorage.setItem(NEW_TODAY_KEY, JSON.stringify({date: todayStr(), count})); } catch(e){}
  }

  // Construit la file de révision du jour à partir d'une liste d'ids,
  // en respectant la limite de nouvelles cartes par jour.
  function buildQueue(ids){
    const due = [];
    const neu = [];
    ids.forEach(id=>{
      if (isNew(id)) neu.push(id);
      else if (isDue(id)) due.push(id);
    });
    const newAllowed = Math.max(0, NEW_CARDS_PER_DAY - newCardsIntroducedToday());
    const queue = due.concat(neu.slice(0, newAllowed));
    // mélange
    for (let i=queue.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [queue[i],queue[j]] = [queue[j],queue[i]];
    }
    return queue;
  }

  // grade: 'again' | 'hard' | 'good' | 'easy'
  function record(id, grade){
    const st = getState(id);
    const wasNew = !st.seen;
    st.reps = (st.reps||0) + 1;
    let box = st.box || 0;

    if (grade === 'again'){
      st.lapses = (st.lapses||0) + 1;
      box = 0;
      st.due = new Date().toISOString();
    } else if (grade === 'hard'){
      box = Math.max(0, box - 1);
      const days = Math.max(1, Math.round(INTERVALS[Math.max(1,box)] * 0.5));
      st.due = addDays(new Date(), days).toISOString();
    } else if (grade === 'good'){
      box = Math.min(MAX_BOX, box + 1);
      st.due = addDays(new Date(), INTERVALS[box] || 1).toISOString();
    } else if (grade === 'easy'){
      box = Math.min(MAX_BOX, box + 2);
      st.due = addDays(new Date(), INTERVALS[box] || 2).toISOString();
    }
    st.box = box;
    st.seen = true;
    setState(id, st);
    if (wasNew) incrementNewCardsToday();
    return st;
  }

  // Stats sur un ensemble d'ids
  function stats(ids){
    let due = 0, neu = 0, learning = 0, young = 0, mature = 0;
    ids.forEach(id=>{
      const st = getState(id);
      if (!st.seen){ neu++; return; }
      if (st.box <= 1) learning++;
      else if (st.box <= 3) young++;
      else mature++;
      if (isDue(id)) due++;
    });
    return { total: ids.length, due, new: neu, learning, young, mature };
  }

  window.SRS = { getState, setState, isDue, isNew, buildQueue, record, stats, NEW_CARDS_PER_DAY };
})(window);

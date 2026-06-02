// ════════════════════════════════════════════════════════
//  progress.js — logique de progression partagée
//  Chargé sur toutes les pages APRÈS supabase-config.js
//  et APRÈS le script CDN de supabase-js.
//  Marche aussi SANS connexion : si pas connecté, ne sauvegarde rien
//  (le site reste 100% utilisable).
// ════════════════════════════════════════════════════════

(function () {
  let client = null;

  function ready() {
    return window.supabase && window.SUPABASE_URL &&
           window.SUPABASE_URL !== "VOTRE_URL_ICI";
  }

  function getClient() {
    if (!ready()) return null;
    if (!client) {
      client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return client;
  }

  // --- Auth ---
  async function currentUser() {
    const c = getClient(); if (!c) return null;
    const { data } = await c.auth.getUser();
    return data ? data.user : null;
  }

  async function signUp(email, password) {
    const c = getClient(); if (!c) throw new Error("config");
    const { data, error } = await c.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const c = getClient(); if (!c) throw new Error("config");
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const c = getClient(); if (!c) return;
    await c.auth.signOut();
  }

  // --- Enregistrer un exercice (appelle la fonction serveur record_exercise) ---
  //     section: 'conjugaison'|'grammaire'|'vocabulaire'|'prononciation'
  //     sousSection: ex 'present', 'articles'...
  //     correct: true/false
  //     Renvoie les stats à jour, ou null si pas connecté.
  async function recordExercise(section, sousSection, correct) {
    const c = getClient(); if (!c) return null;
    const user = await currentUser(); if (!user) return null;
    const { data, error } = await c.rpc("record_exercise", {
      p_section: section,
      p_sous_section: sousSection || null,
      p_correct: !!correct
    });
    if (error) { console.warn("record_exercise:", error.message); return null; }
    if (data && data.today_count >= data.daily_goal) {
      try { window.dispatchEvent(new CustomEvent("goal-reached", { detail: data })); } catch (e) {}
    }
    return data;
  }

  // --- Lire les stats ---
  async function getStats() {
    const c = getClient(); if (!c) return null;
    const user = await currentUser(); if (!user) return null;
    const { data } = await c.from("user_stats").select("*").eq("user_id", user.id).maybeSingle();
    return data;
  }

  // --- Compter par section (pour les barres de progression) ---
  async function getSectionCounts() {
    const c = getClient(); if (!c) return {};
    const user = await currentUser(); if (!user) return {};
    const { data } = await c.from("progress_events")
      .select("section, correct").eq("user_id", user.id);
    if (!data) return {};
    const out = {};
    data.forEach(r => {
      if (!out[r.section]) out[r.section] = { total: 0, correct: 0 };
      out[r.section].total++;
      if (r.correct) out[r.section].correct++;
    });
    return out;
  }

  // --- Petit toast de félicitations (visuel, optionnel) ---
  function toast(msg) {
    let t = document.getElementById("progress-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "progress-toast";
      t.style.cssText = "position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:var(--gold,#c9993a);color:#1a1a1a;padding:0.7rem 1.2rem;border-radius:10px;font-family:Outfit,sans-serif;font-weight:600;font-size:0.9rem;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,0.4);opacity:0;transition:opacity 0.3s;max-width:90%;text-align:center;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = "0"; }, 2600);
  }

  // Expose l'API
  window.Progress = {
    ready, getClient, currentUser, signUp, signIn, signOut,
    recordExercise, getStats, getSectionCounts, toast
  };

  // Toast auto quand l'objectif du jour est atteint
  window.addEventListener("goal-reached", (e) => {
    const lang = localStorage.getItem("laura_lang") || "es";
    toast(lang === "es" ? "🎯 ¡Objetivo del día cumplido, Laura!" : "🎯 Objectiu del dia assolit, Laura!");
  });
})();

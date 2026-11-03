(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // localStorage puede fallar (modo privado, etc.): nunca rompemos la app por eso.
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("vda:" + key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("vda:" + key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
    }
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => { s.hidden = s.id !== id; });
  }

  // ================= INICIO =================
  const played = store.get("played", false);
  $("btn-skip").hidden = !played;
  $("btn-start").addEventListener("click", startQuiz);
  $("btn-skip").addEventListener("click", openMain);
  $("btn-replay").addEventListener("click", () => { show("s-start"); });

  // ================= PREGUNTAS =================
  const quiz = { i: 0, score: 0, order: [] };

  function startQuiz() {
    quiz.i = 0;
    quiz.score = 0;
    show("s-quiz");
    renderQuestion();
  }

  function renderQuestion() {
    const item = QUIZ[quiz.i];
    $("quiz-count").textContent = `${quiz.i + 1} / ${QUIZ.length}`;
    $("quiz-score").textContent = `⭐ ${quiz.score}`;
    $("quiz-progress").style.width = `${(quiz.i / QUIZ.length) * 100}%`;
    $("quiz-q").textContent = item.q;
    $("quiz-fact").hidden = true;
    $("quiz-next").hidden = true;

    const box = $("quiz-options");
    box.innerHTML = "";
    shuffle(item.a.map((text, idx) => ({ text, idx }))).forEach((opt) => {
      const b = document.createElement("button");
      b.textContent = opt.text;
      b.dataset.idx = opt.idx;
      b.addEventListener("click", () => answer(opt.idx));
      box.appendChild(b);
    });
  }

  function answer(idx) {
    const item = QUIZ[quiz.i];
    const right = idx === item.ok;
    if (right) quiz.score++;
    $("quiz-options").querySelectorAll("button").forEach((b) => {
      b.disabled = true;
      const n = Number(b.dataset.idx);
      if (n === item.ok) b.classList.add("ok");
      else if (n === idx) b.classList.add("bad");
    });
    const fact = $("quiz-fact");
    fact.textContent = (right ? "✅ ¡Bien! " : "❌ ¡Casi! ") + (item.dato || "");
    fact.hidden = false;
    $("quiz-score").textContent = `⭐ ${quiz.score}`;
    $("quiz-progress").style.width = `${((quiz.i + 1) / QUIZ.length) * 100}%`;
    const next = $("quiz-next");
    next.textContent = quiz.i === QUIZ.length - 1 ? "Continuar →" : "Siguiente →";
    next.hidden = false;
    next.focus();
  }

  $("quiz-next").addEventListener("click", () => {
    quiz.i++;
    if (quiz.i < QUIZ.length) renderQuestion();
    else show("s-flash");
  });

  // ================= MINIJUEGOS =================
  // Cada objeto de la arena tiene posición (x, y), tamaño (w, h) y una forma de moverse.
  // Tipos: "virgin" (la buena), "decoy" (la Virgen de Abajo, del revés) y "thing" (fruta y demás).
  const game = { level: 0, items: [], start: 0, penalty: 0, fails: 0, raf: 0, timer: 0, playing: false, total: 0, times: [], t0: 0 };
  const arena = $("arena");
  const lamp = $("lamp");

  $("btn-go").addEventListener("click", () => {
    game.level = 0;
    game.total = 0;
    game.fails = 0;
    game.times = [];
    show("s-game");
    startLevel();
  });

  function startLevel() {
    const lvl = LEVELS[game.level];
    $("game-level").textContent = `${game.level + 1}/${LEVELS.length}`;
    $("game-instr").textContent = lvl.short || lvl.text;
    $("game-time").textContent = `${game.total.toFixed(1)} s`;
    arena.innerHTML = "";
    arena.classList.toggle("dark", !!lvl.dark);
    lamp.hidden = true;
    $("overlay-emoji").textContent = lvl.emoji || "🙏";
    $("overlay-step").textContent = `Prueba ${game.level + 1} de ${LEVELS.length}`;
    $("overlay-name").textContent = lvl.name;
    $("overlay-text").textContent = lvl.text;
    $("game-overlay").hidden = false;
  }

  $("overlay-go").addEventListener("click", () => {
    $("game-overlay").hidden = true;
    const lvl = LEVELS[game.level];
    buildLevel(lvl);
    if (lvl.dark) {
      lamp.hidden = false;
      moveLamp(arena.clientWidth / 2, arena.clientHeight / 2);
      toast("Arrastra el dedo para alumbrar 🔦");
    }
    game.penalty = 0;
    game.start = performance.now();
    game.t0 = game.start;
    game.playing = true;
    last = 0;
    tick();
  });

  const overlaps = (a, b, pad) =>
    a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

  function buildLevel(lvl) {
    const W = arena.clientWidth;
    const H = arena.clientHeight;
    const vw = lvl.size === "big" ? Math.min(84, W * 0.22) : lvl.size === "small" ? Math.min(46, Math.max(36, W * 0.1)) : Math.min(56, Math.max(42, W * 0.12));
    const vh = vw * 1.5;
    const figures = [];
    const total = lvl.virgins + (lvl.decoys || 0);
    let tries = 0;
    while (figures.length < total && tries < 4000) {
      tries++;
      const f = { x: rand(4, W - vw - 4), y: rand(4, H - vh - 4), w: vw, h: vh };
      if (lvl.bob === "swap") f.y = H / 2 - vh / 2; // suben y bajan alrededor del centro
      const minGap = lvl.bob === "swap" ? 0 : vh * 0.3;
      const ok = figures.every((o) => !overlaps(f, o, 8) && (lvl.bob === "swap" || Math.abs(o.y - f.y) > minGap));
      if (ok) figures.push(f);
    }

    const things = lvl.extras ? FRUITS.concat(EXTRAS) : FRUITS;
    const fs = lvl.thingSize || 36;
    const stuff = [];
    for (let n = 0; n < lvl.fruits; n++) {
      for (let t = 0; t < 40; t++) {
        const f = { x: rand(0, W - fs), y: lvl.rain ? rand(-H, H - fs) : rand(0, H - fs), w: fs, h: fs };
        if (lvl.move || lvl.rain || lvl.bob || figures.every((v) => !overlaps(f, v, 4))) { stuff.push(f); break; }
      }
    }

    game.items = [];
    const addThing = (f) => {
      const el = document.createElement("div");
      el.className = "item thing";
      el.style.fontSize = `${fs - 4}px`;
      el.style.width = el.style.height = `${fs}px`;
      el.textContent = pick(things);
      const it = addItem(el, f, "thing", rand(-25, 25));
      if (lvl.rain) { it.vy = rand(70, 150); it.vx = rand(-15, 15); it.spin = rand(-90, 90); }
      else if (lvl.move) { const a = rand(0, Math.PI * 2), s = rand(35, 80); it.vx = Math.cos(a) * s; it.vy = Math.sin(a) * s; }
    };
    // En la lluvia la fruta va POR ENCIMA de las Vírgenes, para que tape.
    if (!lvl.rain) stuff.forEach(addThing);
    figures.forEach((v, i) => {
      const kind = i < lvl.virgins ? "virgin" : "decoy";
      const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttribute("viewBox", "0 0 60 90");
      el.setAttribute("class", "item figure " + kind);
      el.setAttribute("width", v.w);
      el.setAttribute("height", v.h);
      el.innerHTML = kind === "decoy" ? '<use href="#virgen" transform="rotate(180 30 45)"/>' : '<use href="#virgen"/>';
      const it = addItem(el, v, kind, 0);
      if (lvl.bob) {
        it.baseY = v.y;
        it.amp = lvl.bob === "swap" ? H * 0.32 : rand(H * 0.08, H * 0.18);
        it.period = lvl.bob === "swap" ? 2.6 : rand(2.2, 3.8);
        it.phase = lvl.bob === "swap" ? (i === 0 ? 0 : Math.PI) : rand(0, Math.PI * 2);
      }
      if (lvl.move || lvl.drift) { const a = rand(0, Math.PI * 2), s = rand(20, 45); it.vx = Math.cos(a) * s; it.vy = lvl.bob ? 0 : Math.sin(a) * s * 0.5; }
    });
    if (lvl.rain) stuff.forEach(addThing);
  }

  function addItem(el, box, kind, rot) {
    const item = { el, kind, ...box, vx: 0, vy: 0, rot, spin: 0 };
    place(item);
    el.dataset.idx = game.items.length;
    arena.appendChild(el);
    game.items.push(item);
    return item;
  }
  function place(it) {
    it.el.style.transform = `translate(${it.x}px, ${it.y}px)` + (it.rot ? ` rotate(${it.rot}deg)` : "");
  }

  // Un toque = apretar y soltar sin arrastrar (así en la prueba a oscuras se puede alumbrar arrastrando).
  let press = null;
  arena.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".item");
    press = { x: e.clientX, y: e.clientY, t: performance.now(), item: el ? game.items[el.dataset.idx] : null };
    if (LEVELS[game.level].dark) lampFromEvent(e);
  });
  arena.addEventListener("pointermove", (e) => {
    if (LEVELS[game.level] && LEVELS[game.level].dark) lampFromEvent(e);
  });
  arena.addEventListener("pointerup", (e) => {
    if (!press) return;
    const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (moved < 14 && press.item) onHit(press.item, e);
    press = null;
  });

  function lampFromEvent(e) {
    const r = arena.getBoundingClientRect();
    moveLamp(e.clientX - r.left, e.clientY - r.top);
  }
  function moveLamp(x, y) {
    lamp.style.setProperty("--lx", `${x}px`);
    lamp.style.setProperty("--ly", `${y}px`);
  }

  let last = 0;
  function tick(now = performance.now()) {
    if (!game.playing) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const lvl = LEVELS[game.level];
    const W = arena.clientWidth, H = arena.clientHeight;
    const t = (now - game.t0) / 1000;
    game.items.forEach((it) => {
      let changed = false;
      if (it.vx || it.vy) {
        it.x += it.vx * dt; it.y += it.vy * dt; changed = true;
        if (lvl.rain && it.kind === "thing") {
          if (it.y > H) { it.y = -it.h - rand(0, 60); it.x = rand(0, W - it.w); }
        } else {
          if (it.x < 0) { it.x = 0; it.vx = Math.abs(it.vx); }
          if (it.x > W - it.w) { it.x = W - it.w; it.vx = -Math.abs(it.vx); }
          if (it.baseY === undefined) {
            if (it.y < 0) { it.y = 0; it.vy = Math.abs(it.vy); }
            if (it.y > H - it.h) { it.y = H - it.h; it.vy = -Math.abs(it.vy); }
          }
        }
      }
      if (it.baseY !== undefined) {
        it.y = Math.max(0, Math.min(H - it.h, it.baseY + it.amp * Math.sin((t * 2 * Math.PI) / it.period + it.phase)));
        changed = true;
      }
      if (it.spin) { it.rot += it.spin * dt; changed = true; }
      if (changed) place(it);
    });
    const elapsed = (now - game.start) / 1000 + game.penalty;
    $("game-time").textContent = `${(game.total + elapsed).toFixed(1)} s`;
    game.raf = requestAnimationFrame(tick);
  }

  const WRONG_VIRGIN = ["¡Esa es la de abajo! +2 s", "¡Más arriba! +2 s", "¡Hereje! Esa no es +2 s", "La de ARRIBA 🙄 +2 s"];
  const WRONG_DECOY = ["¡Es la Virgen de Abajo! +3 s", "¡Está del revés! +3 s", "¡Impostora! +3 s"];
  const WRONG_THING = ["¡Eso es fruta! +1 s", "Eso es un melón… +1 s", "¡Que no es la Virgen! +1 s", "¿Rezándole a un plátano? +1 s"];

  function onHit(item, e) {
    if (!game.playing) return;
    if (item.kind === "thing") return fail(item, pick(WRONG_THING), 1);
    if (item.kind === "decoy") return fail(item, pick(WRONG_DECOY), 3);
    const top = Math.min(...game.items.filter((i) => i.kind === "virgin").map((v) => v.y));
    if (item.y <= top + 6) win(item, e);
    else fail(item, pick(WRONG_VIRGIN), 2);
  }

  function fail(item, msg, secs) {
    game.penalty += secs;
    game.fails++;
    item.el.classList.remove("wrong");
    arena.classList.remove("shake");
    void item.el.getBoundingClientRect();
    item.el.classList.add("wrong");
    arena.classList.add("shake");
    toast(msg);
    if (navigator.vibrate) navigator.vibrate(80);
  }

  function win(item, e) {
    game.playing = false;
    cancelAnimationFrame(game.raf);
    last = 0;
    const secs = (performance.now() - game.start) / 1000 + game.penalty;
    game.times.push(secs);
    game.total += secs;
    $("game-time").textContent = `${game.total.toFixed(1)} s`;
    lamp.hidden = true;
    arena.classList.remove("dark");
    item.el.classList.add("win");
    confetti(item.x + item.w / 2, item.y + item.h / 2);
    toast(pick(["¡Amén! 🙏", "¡Esa es! ✨", "¡Viva la Virgen de Arriba!", "¡Bien visto!"]), true);
    setTimeout(() => {
      game.level++;
      if (game.level < LEVELS.length) startLevel();
      else showResult();
    }, 1100);
  }

  function confetti(x, y) {
    const bits = ["✨", "🎉", "⭐", "🙏", "💛", "🍇"];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = pick(bits);
      const a = rand(0, Math.PI * 2), d = rand(60, 150);
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
      s.style.setProperty("--dy", `${Math.sin(a) * d - 40}px`);
      arena.appendChild(s);
    }
  }

  function toast(msg, good) {
    const t = $("toast");
    t.textContent = msg;
    t.className = "toast" + (good ? " good" : "");
    t.hidden = false;
    clearTimeout(game.timer);
    game.timer = setTimeout(() => { t.hidden = true; }, 1200);
  }

  // ================= RESULTADO =================
  function showResult() {
    $("toast").hidden = true;
    const t = game.total;
    let rank;
    if (t < 30 && game.fails <= 2 && quiz.score >= 6) rank = "¡Hoyalense de pura cepa! 🍇";
    else if (t < 45) rank = "Devoto/a de la Virgen de Arriba 🙏";
    else if (t < 75) rank = "Peregrino/a en prácticas 🚶";
    else rank = "Te ha despistado la fruta 🍌";
    $("result-rank").textContent = rank;
    $("result-quiz").textContent = `${quiz.score}/${QUIZ.length}`;
    $("result-time").textContent = `${t.toFixed(1)} s`;
    $("result-fails").textContent = game.fails;
    $("result-levels").innerHTML = LEVELS.map((l, i) =>
      `<li><span>${l.emoji} ${l.name}</span><b>${(game.times[i] || 0).toFixed(1)} s</b></li>`).join("");
    store.set("played", true);
    $("btn-skip").hidden = false;
    show("s-result");
  }
  $("btn-enter").addEventListener("click", openMain);

  // ================= APP PRINCIPAL =================
  function openMain() {
    show("s-main");
  }

  // Pestañas
  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("tabs").querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".view").forEach((v) => { v.hidden = v.id !== "v-" + b.dataset.view; });
    store.set("tab", b.dataset.view);
  });
  const savedTab = store.get("tab", "mapa");
  const tabBtn = $("tabs").querySelector(`[data-view="${savedTab}"]`);
  if (tabBtn) tabBtn.click();

  // Mapa
  $("map-wrap").innerHTML = MAP_SVG;
  $("map-wrap").addEventListener("click", (e) => {
    const spot = e.target.closest(".spot");
    if (spot) openPlace(spot);
  });
  $("map-wrap").addEventListener("keydown", (e) => {
    const spot = e.target.closest(".spot");
    if (spot && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openPlace(spot); }
  });

  function openPlace(spot) {
    openPlaceById(spot.dataset.place);
  }
  function openPlaceById(id) {
    const p = PLACES[id];
    if (!p) return;
    document.querySelectorAll(".spot").forEach((s) => s.classList.toggle("active", s.dataset.place === id));
    $("sheet-emoji").textContent = p.emoji;
    $("sheet-title").textContent = p.name;
    $("sheet-what").textContent = p.what;
    $("sheet-desc").textContent = p.desc;
    $("sheet").hidden = false;
    $("sheet-backdrop").hidden = false;
    $("sheet-close").focus();
  }
  function closeSheet() {
    $("sheet").hidden = true;
    $("sheet-backdrop").hidden = true;
    document.querySelectorAll(".spot").forEach((s) => s.classList.remove("active"));
  }
  $("sheet-close").addEventListener("click", closeSheet);
  $("sheet-backdrop").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // Planning
  (function renderPlanning() {
    const box = $("planning-list");
    const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    let html = "";
    if (typeof COMPRA !== "undefined" && COMPRA) {
      html += `
        <div class="compra">
          <div class="compra-head"><span>🛒</span><div><p class="compra-kicker">Antes de salir</p><h3>${esc(COMPRA.titulo)}</h3></div></div>
          <p>${esc(COMPRA.texto)}</p>
          <p class="compra-preview" id="compra-preview"></p>
          <button type="button" class="btn compra-cta" id="compra-open">Ver la lista y apuntar cosas →</button>
        </div>`;
    }
    if (!PLANNING.length) {
      box.innerHTML = html + '<div class="empty"><b>📅</b>El planning del finde está en camino.<br>Lo rellenamos enseguida.</div>';
      return;
    }
    html += PLANNING.map((d) => `
      <section class="day">
        <h3><span>${esc(d.dia)}</span>${d.lema ? `<small>${esc(d.lema)}</small>` : ""}</h3>
        <ol class="timeline">
          ${d.items.map((it) => {
            let where = "";
            if (it.donde && PLACES[it.donde]) {
              where = `<button type="button" class="place-chip" data-place="${it.donde}">📍 ${esc(PLACES[it.donde].name)}</button>`;
            } else if (it.lugar) {
              where = it.mapa
                ? `<a class="place-chip" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.mapa)}" target="_blank" rel="noopener">📍 ${esc(it.lugar)} ↗</a>`
                : `<span class="place-chip">📍 ${esc(it.lugar)}</span>`;
            }
            return `
            <li class="ev">
              <span class="ev-hora">${esc(it.hora || "")}</span>
              <span class="ev-dot">${it.emoji || "•"}</span>
              <div class="ev-body">
                <span class="que">${esc(it.que)}</span>${it.porConfirmar ? ' <span class="tag">por confirmar</span>' : ""}
                ${it.nota ? `<span class="ev-nota">${esc(it.nota)}</span>` : ""}
                ${where}
              </div>
            </li>`;
          }).join("")}
        </ol>
      </section>`).join("");
    box.innerHTML = html;
    box.addEventListener("click", (e) => {
      const chip = e.target.closest("button.place-chip");
      if (chip) openPlaceById(chip.dataset.place);
    });
  })();

  // Qué traer
  (function renderTraer() {
    const box = $("traer-list");
    if (!TRAER.length) {
      box.innerHTML = '<div class="empty"><b>🧺</b>La lista de cosas que traer está en camino.<br>La hacemos ahora.</div>';
      return;
    }
    // Guardamos lo marcado por el nombre de cada cosa, así no se descoloca si cambia el orden.
    const done = store.get("traer-hecho", {});
    const counter = () => {
      const n = TRAER.filter((t) => done[t.item]).length;
      $("traer-count").textContent = n === TRAER.length ? "¡Todo listo! 🙌" : `${n} de ${TRAER.length} en la maleta`;
    };
    box.innerHTML = `
      <p class="view-sub">Ve marcando lo que ya tengas. <b id="traer-count"></b></p>
      ${TRAER.map((t) => `
        <label class="row check-row ${done[t.item] ? "done" : ""}">
          <input type="checkbox" data-item="${t.item}" ${done[t.item] ? "checked" : ""}>
          <span class="traer-emoji">${t.emoji || "•"}</span>
          <span class="traer-text">
            <span class="que">${t.item}</span>${t.opcional ? ' <span class="tag">opcional</span>' : ""}
            ${t.nota ? `<br><span class="donde">${t.nota}</span>` : ""}
            ${t.quien ? `<br><span class="quien">👤 Lo traen ${t.quien}</span>` : ""}
          </span>
        </label>`).join("")}
      ${(typeof TRAER_NOTAS !== "undefined" ? TRAER_NOTAS : []).map((n) => `<div class="nota">${n}</div>`).join("")}`;
    counter();
    box.addEventListener("change", (e) => {
      const key = e.target.dataset.item;
      if (!key) return;
      done[key] = e.target.checked;
      e.target.closest(".check-row").classList.toggle("done", e.target.checked);
      store.set("traer-hecho", done);
      counter();
    });
  })();

  // ================= LISTA DE LA COMPRA =================
  // Con COMPRA_DB (Firebase Realtime Database) la lista es compartida: todos ven lo de todos.
  // Sin ella, funciona igual pero solo en este móvil.
  const compra = (() => {
    const DB = typeof COMPRA_DB === "string" ? COMPRA_DB.trim().replace(/\/+$/, "") : "";
    const shared = !!DB;
    let data = { compra: {}, comprado: {} };
    let me = store.get("yo", "");
    let qty = 1;
    let pollTimer = 0;
    let lastOk = 0;

    const escHtml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // "Cervezas" y "cerveza" cuentan como lo mismo; "panes" y "pan", también.
    function keyOf(text) {
      return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9 ]+/g, " ").trim().split(/\s+/)
        .map((w) => (w.length > 3 && /[lnrdzj]es$/.test(w) ? w.slice(0, -2) : w.length > 2 && w.endsWith("s") ? w.slice(0, -1) : w))
        .join("-") || "x";
    }

    async function api(method, path, body) {
      const r = await fetch(`${DB}/vda${path}.json`, {
        method, cache: "no-store",
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }

    async function load() {
      if (shared) {
        const d = (await api("GET", "")) || {};
        data = { compra: d.compra || {}, comprado: d.comprado || {} };
        lastOk = Date.now();
      } else {
        data = store.get("compra-local", { compra: {}, comprado: {} });
      }
    }
    function saveLocal() { store.set("compra-local", data); }

    async function add(text, n) {
      const entry = { item: text, qty: n, quien: me, t: Date.now() };
      if (shared) await api("POST", "/compra", entry);
      else { data.compra["l" + Date.now() + Math.floor(Math.random() * 1000)] = entry; saveLocal(); }
    }
    // Quita una unidad de una de mis entradas (o la entrada entera si solo quedaba una).
    async function removeOne(id, n) {
      if (n > 1) {
        if (shared) await api("PUT", `/compra/${id}/qty`, n - 1);
        else { data.compra[id].qty = n - 1; saveLocal(); }
      } else if (shared) await api("DELETE", `/compra/${id}`);
      else { delete data.compra[id]; saveLocal(); }
    }
    async function setBought(key, val) {
      if (shared) await api(val ? "PUT" : "DELETE", `/comprado/${key}`, val ? true : undefined);
      else { if (val) data.comprado[key] = true; else delete data.comprado[key]; saveLocal(); }
    }

    function groups() {
      const g = {};
      Object.entries(data.compra || {}).forEach(([id, e]) => {
        if (!e || !e.item) return;
        const k = keyOf(String(e.item));
        const n = Math.max(1, Math.min(99, parseInt(e.qty, 10) || 1));
        if (!g[k]) g[k] = { key: k, label: String(e.item).trim(), total: 0, people: {}, mine: [], first: e.t || 0 };
        g[k].total += n;
        const who = e.quien || "Alguien";
        g[k].people[who] = (g[k].people[who] || 0) + n;
        if (who === me) g[k].mine.push({ id, t: e.t || 0, n });
        if ((e.t || 0) < g[k].first) { g[k].first = e.t || 0; g[k].label = String(e.item).trim(); }
      });
      const done = (x) => (data.comprado[x.key] ? 1 : 0);
      return Object.values(g).sort((a, b) => done(a) - done(b) || b.total - a.total || a.label.localeCompare(b.label, "es"));
    }

    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

    function render() {
      const list = groups();
      // Resumen en la tarjeta del planning
      const prev = $("compra-preview");
      if (prev) {
        prev.innerHTML = list.length
          ? `${list.length} ${list.length === 1 ? "cosa" : "cosas"} apuntadas<br><small>${list.slice(0, 4).map((x) => `${escHtml(cap(x.label))} ×${x.total}`).join(" · ")}${list.length > 4 ? " · …" : ""}</small>`
          : "Todavía no hay nada apuntado. ¡Estrénala!";
      }
      if ($("compra-panel").hidden) return;
      $("compra-list").innerHTML = list.length ? list.map((x) => {
        const who = Object.entries(x.people).map(([p, n]) => (n > 1 ? `${escHtml(p)} ×${n}` : escHtml(p))).join(", ");
        const bought = !!data.comprado[x.key];
        return `
          <li class="${bought ? "bought" : ""}">
            <input type="checkbox" data-key="${x.key}" ${bought ? "checked" : ""} aria-label="Comprado">
            <div class="c-main"><span class="c-name">${escHtml(cap(x.label))}</span><span class="c-who">${who}</span></div>
            ${x.mine.length ? `<button class="c-del" data-key="${x.key}">quitar 1 mío</button>` : ""}
            <span class="c-qty">×${x.total}</span>
          </li>`;
      }).join("") : '<li class="compra-empty">Nada por aquí todavía.</li>';
      $("compra-sync").textContent = shared ? (lastOk ? "🟢 en directo" : "") : "";
    }

    function renderMe() {
      $("compra-yo").innerHTML = GUESTS.map((n) =>
        `<button type="button" data-name="${escHtml(n)}" aria-pressed="${n === me}">${escHtml(n)}</button>`).join("");
    }

    function showError(msg) {
      const el = $("compra-error");
      el.textContent = msg;
      el.hidden = !msg;
    }

    async function refresh() {
      try { await load(); showError(""); }
      catch { showError("No se ha podido conectar con la lista. Revisa la conexión y vuelve a intentarlo."); }
      render();
    }

    function startPolling() {
      stopPolling();
      if (!shared) return;
      pollTimer = setInterval(() => { if (!document.hidden) refresh(); }, 5000);
    }
    function stopPolling() { clearInterval(pollTimer); pollTimer = 0; }

    function open() {
      $("compra-panel").hidden = false;
      $("compra-modo").className = "compra-modo " + (shared ? "shared" : "local");
      $("compra-modo").textContent = shared
        ? "🟢 Lista compartida: todos veis lo que apunta cada uno. Las cosas repetidas se suman solas."
        : "🟡 De momento esta lista solo se guarda en tu móvil. Cuando conectemos la base de datos, la veréis todos.";
      renderMe();
      refresh();
      startPolling();
    }
    function close() {
      $("compra-panel").hidden = true;
      stopPolling();
      render();
    }

    $("compra-close").addEventListener("click", close);
    $("compra-yo").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      me = b.dataset.name;
      store.set("yo", me);
      renderMe();
      render();
    });
    $("compra-atajos").innerHTML = (typeof COMPRA_ATAJOS !== "undefined" ? COMPRA_ATAJOS : []).map((a) =>
      `<button type="button" data-v="${escHtml(a.replace(/^\S+\s/, ""))}">${escHtml(a)}</button>`).join("");
    $("compra-atajos").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $("compra-input").value = b.dataset.v;
      $("compra-input").focus();
    });
    document.querySelector(".qty").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      qty = Math.max(1, Math.min(20, qty + Number(b.dataset.q)));
      $("compra-qty").textContent = qty;
    });
    $("compra-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = $("compra-input").value.trim().slice(0, 60);
      if (!text) return;
      if (!me) { showError("Primero toca tu nombre arriba, para saber quién lo pide."); return; }
      try {
        await add(text, qty);
        $("compra-input").value = "";
        qty = 1;
        $("compra-qty").textContent = 1;
        showError("");
        await refresh();
      } catch {
        showError("No se ha podido guardar. Revisa la conexión y vuelve a intentarlo.");
      }
    });
    $("compra-list").addEventListener("change", async (e) => {
      const key = e.target.dataset.key;
      if (!key) return;
      try { await setBought(key, e.target.checked); } catch { showError("No se ha podido marcar. Vuelve a intentarlo."); }
      refresh();
    });
    $("compra-list").addEventListener("click", async (e) => {
      const b = e.target.closest(".c-del");
      if (!b) return;
      const g = groups().find((x) => x.key === b.dataset.key);
      if (!g || !g.mine.length) return;
      const latest = g.mine.sort((a, c) => c.t - a.t)[0];
      try { await removeOne(latest.id, latest.n); } catch { showError("No se ha podido quitar. Vuelve a intentarlo."); }
      refresh();
    });

    return { open, refresh, shared };
  })();

  $("planning-list").addEventListener("click", (e) => {
    if (e.target.closest("#compra-open")) compra.open();
  });
  compra.refresh();

  // ================= SORTEO =================
  const everyone = [...GUESTS, VIRGEN];
  let active = store.get("sorteo-active", everyone.slice()).filter((n) => everyone.includes(n));
  let pool = store.get("sorteo-pool", []);
  let history = store.get("sorteo-history", []);
  let spinning = false;

  // Pruebas y preguntas: no se repiten hasta que hayan salido todas.
  let modo = store.get("sorteo-modo", "prueba");
  let lastWinner = "";
  function renderModo() {
    $("sorteo-modo").querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.modo === modo)));
  }
  renderModo();
  $("sorteo-modo").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || spinning) return;
    modo = b.dataset.modo;
    store.set("sorteo-modo", modo);
    renderModo();
  });
  function drawReto() {
    if (modo === "nombre") return null;
    const tipo = modo === "mix" ? (Math.random() < 0.65 ? "prueba" : "pregunta") : modo;
    const all = RETOS[tipo] || [];
    if (!all.length) return null;
    let left = store.get("retos-" + tipo, []).filter((i) => i < all.length);
    if (!left.length) left = all.map((_, i) => i);
    const i = pick(left);
    store.set("retos-" + tipo, left.filter((x) => x !== i));
    return { tipo, texto: all[i] };
  }
  function showReto(r, winner) {
    const box = $("reto");
    if (!r) { box.hidden = true; return; }
    const todos = winner === VIRGEN;
    $("reto-kind").textContent = (r.tipo === "prueba" ? "🔥 Prueba" : "💬 Pregunta") + (todos ? " para todos" : "");
    $("reto-text").textContent = r.texto;
    box.hidden = false;
    box.style.animation = "none";
    void box.offsetWidth;
    box.style.animation = "";
  }
  $("btn-otro-reto").addEventListener("click", () => {
    if (spinning || !history.length) return;
    const r = drawReto();
    if (!r) return;
    showReto(r, lastWinner);
    history[0].reto = r.texto;
    history[0].cobarde = (history[0].cobarde || 0) + 1;
    store.set("sorteo-history", history);
    renderHistory();
    toast2(lastWinner === VIRGEN ? "Cobardes… 🐔" : `${lastWinner}, cobarde 🐔`);
  });
  function toast2(msg) { $("sorteo-msg").textContent = msg; }

  function renderChips() {
    $("sorteo-chips").innerHTML = everyone.map((n) =>
      `<button type="button" data-name="${n}" aria-pressed="${active.includes(n)}">${n === VIRGEN ? "🙏 " : ""}${n}</button>`
    ).join("");
  }
  function renderHistory() {
    $("sorteo-history").innerHTML = history.length
      ? history.slice(0, 8).map((h) => `<li><b>${h.name}</b> · ${h.when}${h.cobarde ? " · 🐔".repeat(Math.min(3, h.cobarde)) : ""}${h.reto ? `<small>${h.reto.replace(/</g, "&lt;")}</small>` : ""}</li>`).join("")
      : '<li style="list-style:none;margin-left:-22px">Todavía no ha salido nadie.</li>';
  }
  renderChips();
  renderHistory();

  $("sorteo-chips").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || spinning) return;
    const n = b.dataset.name;
    if (active.includes(n)) { if (active.length > 1) active = active.filter((x) => x !== n); }
    else active.push(n);
    pool = pool.filter((x) => active.includes(x));
    store.set("sorteo-active", active);
    store.set("sorteo-pool", pool);
    renderChips();
  });

  $("btn-sortear").addEventListener("click", () => {
    if (spinning) return;
    const noRepeat = $("sorteo-norepeat").checked;
    let candidates = active;
    if (noRepeat) {
      pool = pool.filter((x) => active.includes(x));
      if (!pool.length) pool = active.slice();
      candidates = pool;
    }
    const winner = pick(candidates);
    spinning = true;
    $("btn-sortear").disabled = true;
    $("sorteo-msg").textContent = "";
    $("reto").hidden = true;
    const slot = $("slot");
    const name = $("slot-name");
    slot.classList.remove("done");
    slot.classList.add("spinning");

    let delay = 50;
    let i = Math.floor(Math.random() * active.length);
    const step = () => {
      i = (i + 1) % active.length;
      name.textContent = active[i];
      delay *= 1.12;
      if (delay < 380) setTimeout(step, delay);
      else {
        name.textContent = winner;
        slot.classList.remove("spinning");
        slot.classList.add("done");
        $("sorteo-msg").textContent = winner === VIRGEN
          ? "¡Le toca a la Virgen! Como no puede, lo hacéis TODOS 😇"
          : `¡Le toca a ${winner}! 🎉`;
        if (noRepeat) pool = pool.filter((x) => x !== winner);
        lastWinner = winner;
        const reto = drawReto();
        showReto(reto, winner);
        const d = new Date();
        const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
        history.unshift({ name: winner, reto: reto ? reto.texto : "", when: `${days[d.getDay()]} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` });
        history = history.slice(0, 30);
        store.set("sorteo-pool", pool);
        store.set("sorteo-history", history);
        renderHistory();
        spinning = false;
        $("btn-sortear").disabled = false;
        if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
      }
    };
    step();
  });

  // El juego solo es obligatorio la primera vez en cada móvil; después se entra directo a la app.
  show(played ? "s-main" : "s-start");
})();

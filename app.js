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
  const game = { level: 0, items: [], start: 0, penalty: 0, fails: 0, raf: 0, timer: 0, playing: false, total: 0 };
  const arena = $("arena");

  $("btn-go").addEventListener("click", () => {
    game.level = 0;
    game.total = 0;
    game.fails = 0;
    show("s-game");
    startLevel();
  });

  function startLevel() {
    const lvl = LEVELS[game.level];
    $("game-level").textContent = `Prueba ${game.level + 1}/${LEVELS.length}`;
    $("game-instr").textContent = lvl.text;
    $("game-time").textContent = `${game.total.toFixed(1)} s`;
    arena.innerHTML = "";
    $("overlay-step").textContent = `Prueba ${game.level + 1} de ${LEVELS.length}`;
    $("overlay-text").textContent = lvl.text;
    $("game-overlay").hidden = false;
    // Esperamos a que el layout tenga tamaño real antes de colocar nada.
    setTimeout(() => {
      $("game-overlay").hidden = true;
      buildLevel(lvl);
      game.penalty = 0;
      game.start = performance.now();
      game.playing = true;
      tick();
    }, 1400);
  }

  function buildLevel(lvl) {
    const W = arena.clientWidth;
    const H = arena.clientHeight;
    const vw = lvl.layout ? Math.min(110, W * 0.28) : Math.min(62, Math.max(44, W * 0.13));
    const vh = vw * 1.5;
    const virgins = [];
    const overlaps = (a, b, pad) =>
      a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

    if (lvl.layout === "arriba-abajo") {
      virgins.push({ x: rand(8, W - vw - 8), y: rand(8, H * 0.12), w: vw, h: vh });
      virgins.push({ x: rand(8, W - vw - 8), y: rand(H * 0.62, H - vh - 8), w: vw, h: vh });
    } else {
      let tries = 0;
      while (virgins.length < lvl.virgins && tries < 2000) {
        tries++;
        const v = { x: rand(4, W - vw - 4), y: rand(4, H - vh - 4), w: vw, h: vh };
        const ok = virgins.every((o) => !overlaps(v, o, 10) && Math.abs(o.y - v.y) > vh * 0.35);
        if (ok) virgins.push(v);
      }
    }

    // Fruta: la repartimos evitando tapar a las Vírgenes.
    const fs = 36;
    const fruits = [];
    for (let n = 0; n < lvl.fruits; n++) {
      for (let t = 0; t < 40; t++) {
        const f = { x: rand(0, W - fs), y: rand(0, H - fs), w: fs, h: fs };
        if (lvl.move || virgins.every((v) => !overlaps(f, v, 4))) { fruits.push(f); break; }
      }
    }

    game.items = [];
    fruits.forEach((f) => {
      const el = document.createElement("div");
      el.className = "item fruit";
      el.textContent = pick(FRUITS);
      el.style.transform = `rotate(${rand(-25, 25)}deg)`;
      addItem(el, f, "fruit", lvl.move ? 70 : 0);
    });
    virgins.forEach((v) => {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttribute("viewBox", "0 0 60 90");
      el.setAttribute("class", "item virgin");
      el.setAttribute("width", v.w);
      el.setAttribute("height", v.h);
      el.innerHTML = '<use href="#virgen"/>';
      addItem(el, v, "virgin", lvl.move ? 55 : 0);
    });
  }

  function addItem(el, box, kind, speed) {
    const angle = rand(0, Math.PI * 2);
    const s = speed ? rand(speed * 0.5, speed) : 0;
    const item = { el, kind, ...box, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, rot: el.style.transform || "" };
    el.style.transform = `translate(${box.x}px, ${box.y}px) ${item.rot}`;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); onHit(item); });
    arena.appendChild(el);
    game.items.push(item);
  }

  let last = 0;
  function tick(now = performance.now()) {
    if (!game.playing) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (LEVELS[game.level].move) {
      const W = arena.clientWidth, H = arena.clientHeight;
      game.items.forEach((it) => {
        it.x += it.vx * dt; it.y += it.vy * dt;
        if (it.x < 0) { it.x = 0; it.vx = Math.abs(it.vx); }
        if (it.x > W - it.w) { it.x = W - it.w; it.vx = -Math.abs(it.vx); }
        if (it.y < 0) { it.y = 0; it.vy = Math.abs(it.vy); }
        if (it.y > H - it.h) { it.y = H - it.h; it.vy = -Math.abs(it.vy); }
        it.el.style.transform = `translate(${it.x}px, ${it.y}px) ${it.rot}`;
      });
    }
    const elapsed = (now - game.start) / 1000 + game.penalty;
    $("game-time").textContent = `${(game.total + elapsed).toFixed(1)} s`;
    game.raf = requestAnimationFrame(tick);
  }

  const WRONG_VIRGIN = ["¡Esa es la de abajo! +2 s", "¡Más arriba! +2 s", "¡Hereje! Esa no es +2 s", "La de ARRIBA 🙄 +2 s"];
  const WRONG_FRUIT = ["¡Eso es fruta! +1 s", "Eso es un melón… +1 s", "¡Que no es la Virgen! +1 s"];

  function onHit(item) {
    if (!game.playing) return;
    if (item.kind === "fruit") {
      fail(item, pick(WRONG_FRUIT), 1);
      return;
    }
    const virgins = game.items.filter((i) => i.kind === "virgin");
    const top = Math.min(...virgins.map((v) => v.y));
    if (item.y <= top + 2) win(item);
    else fail(item, pick(WRONG_VIRGIN), 2);
  }

  function fail(item, msg, secs) {
    game.penalty += secs;
    game.fails++;
    item.el.classList.remove("wrong");
    void item.el.getBoundingClientRect();
    item.el.classList.add("wrong");
    toast(msg);
    if (navigator.vibrate) navigator.vibrate(80);
  }

  function win(item) {
    game.playing = false;
    cancelAnimationFrame(game.raf);
    last = 0;
    game.total += (performance.now() - game.start) / 1000 + game.penalty;
    $("game-time").textContent = `${game.total.toFixed(1)} s`;
    item.el.classList.add("win");
    toast(pick(["¡Amén! 🙏", "¡Esa es! ✨", "¡Viva la Virgen de Arriba!", "¡Bien visto!"]), true);
    setTimeout(() => {
      game.level++;
      if (game.level < LEVELS.length) startLevel();
      else showResult();
    }, 900);
  }

  function toast(msg, good) {
    const t = $("toast");
    t.textContent = msg;
    t.className = "toast" + (good ? " good" : "");
    t.hidden = false;
    clearTimeout(game.timer);
    game.timer = setTimeout(() => { t.hidden = true; }, 1100);
  }

  // ================= RESULTADO =================
  function showResult() {
    $("toast").hidden = true;
    const t = game.total;
    let rank;
    if (t < 12 && quiz.score >= 6) rank = "¡Hoyalense de pura cepa! 🍇";
    else if (t < 20) rank = "Devoto/a de la Virgen de Arriba 🙏";
    else if (t < 35) rank = "Peregrino/a en prácticas 🚶";
    else rank = "Te ha despistado la fruta 🍌";
    $("result-rank").textContent = rank;
    $("result-quiz").textContent = `${quiz.score}/${QUIZ.length}`;
    $("result-time").textContent = `${t.toFixed(1)} s`;
    $("result-fails").textContent = game.fails;
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
    const p = PLACES[spot.dataset.place];
    if (!p) return;
    document.querySelectorAll(".spot").forEach((s) => s.classList.toggle("active", s === spot));
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
    if (!PLANNING.length) {
      box.innerHTML = '<div class="empty"><b>📅</b>El planning del finde está en camino.<br>Lo rellenamos enseguida.</div>';
      return;
    }
    box.innerHTML = PLANNING.map((d) => `
      <div class="day">
        <h3>${d.dia}</h3>
        ${d.items.map((it) => `
          <div class="row">
            <span class="hora">${it.hora || ""}</span>
            <span><span class="que">${it.que}</span>${it.donde ? `<br><span class="donde">📍 ${PLACES[it.donde] ? PLACES[it.donde].name : it.donde}</span>` : ""}</span>
          </div>`).join("")}
      </div>`).join("");
  })();

  // Qué traer
  (function renderTraer() {
    const box = $("traer-list");
    if (!TRAER.length) {
      box.innerHTML = '<div class="empty"><b>🧺</b>La lista de cosas que traer está en camino.<br>La hacemos ahora.</div>';
      return;
    }
    const done = store.get("traer", {});
    box.innerHTML = TRAER.map((t, i) => `
      <label class="row check-row ${done[i] ? "done" : ""}">
        <input type="checkbox" data-i="${i}" ${done[i] ? "checked" : ""}>
        <span><span class="que">${t.item}</span>${t.quien ? `<br><span class="donde">👤 ${t.quien}</span>` : ""}</span>
      </label>`).join("");
    box.addEventListener("change", (e) => {
      const i = e.target.dataset.i;
      done[i] = e.target.checked;
      e.target.closest(".check-row").classList.toggle("done", e.target.checked);
      store.set("traer", done);
    });
  })();

  // ================= SORTEO =================
  const everyone = [...GUESTS, VIRGEN];
  let active = store.get("sorteo-active", everyone.slice()).filter((n) => everyone.includes(n));
  let pool = store.get("sorteo-pool", []);
  let history = store.get("sorteo-history", []);
  let spinning = false;

  function renderChips() {
    $("sorteo-chips").innerHTML = everyone.map((n) =>
      `<button type="button" data-name="${n}" aria-pressed="${active.includes(n)}">${n === VIRGEN ? "🙏 " : ""}${n}</button>`
    ).join("");
  }
  function renderHistory() {
    $("sorteo-history").innerHTML = history.length
      ? history.slice(0, 8).map((h) => `<li><b>${h.name}</b> · ${h.when}</li>`).join("")
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
          ? "¡Le toca a la Virgen! Como no puede, la prueba la hacéis TODOS 😇"
          : `¡Le toca a ${winner}! 🎉`;
        if (noRepeat) pool = pool.filter((x) => x !== winner);
        const d = new Date();
        const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
        history.unshift({ name: winner, when: `${days[d.getDay()]} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` });
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

  show("s-start");
})();

// Cuentas del finde (tipo Tricount).
// Sin base de datos: cada móvil guarda sus cuentas y se pasan por WhatsApp con un enlace.
// Al cargar un enlace, las cuentas se JUNTAN con las tuyas (no se duplica nada y lo más nuevo gana),
// así que varias personas pueden apuntar gastos y mandarse el enlace unas a otras.
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PEOPLE = GUESTS.slice(); // sin la Virgen
  const KEY = "vda:cuentas";
  const ME_KEY = "vda:cuentas-yo";

  const CATS = [
    { id: "compra", emoji: "🛒", name: "Compra" },
    { id: "bebida", emoji: "🍺", name: "Bebida" },
    { id: "comida", emoji: "🍽️", name: "Comida" },
    { id: "gasolina", emoji: "⛽", name: "Gasolina" },
    { id: "casa", emoji: "🏠", name: "Casa" },
    { id: "fiesta", emoji: "🎉", name: "Fiesta" },
    { id: "otros", emoji: "📦", name: "Otros" }
  ];
  const catOf = (id) => CATS.find((c) => c.id === id) || CATS[CATS.length - 1];

  // ---------- almacenamiento ----------
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

  let db = load(KEY, { v: 1, e: {} });
  if (!db || typeof db.e !== "object") db = { v: 1, e: {} };
  let me = load(ME_KEY, "");
  if (!PEOPLE.includes(me)) me = "";
  const persist = () => save(KEY, db);

  // ---------- utilidades ----------
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (c) => `${nf.format(c / 100)} €`;
  const signed = (c) => (c > 0 ? "+" : c < 0 ? "−" : "") + money(Math.abs(c));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const dayLabel = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (isNaN(dt)) return iso;
    return `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]}`;
  };

  // "12,50" · "12.5" · "1.234,56" · "12 €" → céntimos (o NaN)
  function parseMoney(str) {
    let s = String(str || "").replace(/[€\s]/g, "");
    if (!s) return NaN;
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(",", ".");
    if (!/^\d*\.?\d{0,2}$/.test(s)) return NaN;
    const v = Math.round(parseFloat(s) * 100);
    return Number.isFinite(v) ? v : NaN;
  }

  // ---------- reparto de cada gasto (en céntimos exactos) ----------
  // Devuelve { nombre: céntimos } que suma exactamente el importe, o null si el gasto no es válido.
  function sharesOf(e) {
    const a = e.amount;
    const split = e.split || {};
    const out = {};
    if (e.mode === "transfer") {
      const to = Object.keys(split)[0];
      if (!to) return null;
      out[to] = a;
      return out;
    }
    if (e.mode === "exact") {
      let sum = 0;
      PEOPLE.forEach((p) => { const v = Math.max(0, Math.round(split[p] || 0)); if (v) { out[p] = v; sum += v; } });
      return sum === a ? out : null;
    }
    if (e.mode === "shares") {
      const w = PEOPLE.map((p) => Math.max(0, Math.round(split[p] || 0)));
      const W = w.reduce((x, y) => x + y, 0);
      if (!W) return null;
      let given = 0;
      const parts = PEOPLE.map((p, i) => {
        const exact = (a * w[i]) / W;
        const base = Math.floor(exact);
        given += base;
        return { p, base, frac: exact - base, w: w[i] };
      });
      let rem = a - given;
      parts.slice().sort((x, y) => y.frac - x.frac).forEach((x) => { if (rem > 0 && x.w > 0) { x.base++; rem--; } });
      parts.forEach((x) => { if (x.base) out[x.p] = x.base; });
      return out;
    }
    // a partes iguales
    const who = PEOPLE.filter((p) => split[p]);
    if (!who.length) return null;
    const base = Math.floor(a / who.length);
    let rem = a - base * who.length;
    who.forEach((p) => { out[p] = base + (rem > 0 ? 1 : 0); if (rem > 0) rem--; });
    return out;
  }

  const live = () => Object.values(db.e).filter((e) => e && !e.del && e.amount > 0 && PEOPLE.includes(e.payer) && sharesOf(e));

  function balances() {
    const paid = {}, owed = {};
    PEOPLE.forEach((p) => { paid[p] = 0; owed[p] = 0; });
    let total = 0;
    const cats = {};
    live().forEach((e) => {
      const sh = sharesOf(e);
      paid[e.payer] += e.amount;
      Object.entries(sh).forEach(([p, c]) => { owed[p] += c; });
      if (e.mode !== "transfer") {
        total += e.amount;
        cats[e.cat || "otros"] = (cats[e.cat || "otros"] || 0) + e.amount;
      }
    });
    // Lo que ha "gastado" cada uno de verdad (su parte en gastos, sin contar pagos entre vosotros)
    const spent = {};
    PEOPLE.forEach((p) => { spent[p] = 0; });
    live().filter((e) => e.mode !== "transfer").forEach((e) => { Object.entries(sharesOf(e)).forEach(([p, c]) => { spent[p] += c; }); });
    const paidReal = {};
    PEOPLE.forEach((p) => { paidReal[p] = 0; });
    live().filter((e) => e.mode !== "transfer").forEach((e) => { paidReal[e.payer] += e.amount; });
    const bal = {};
    PEOPLE.forEach((p) => { bal[p] = paid[p] - owed[p]; });
    return { bal, total, cats, spent, paidReal };
  }

  // Mínimo número de pagos para quedar en paz.
  function settle(bal) {
    const debt = PEOPLE.filter((p) => bal[p] < 0).map((p) => ({ p, c: -bal[p] }));
    const cred = PEOPLE.filter((p) => bal[p] > 0).map((p) => ({ p, c: bal[p] }));
    const moves = [];
    while (debt.length && cred.length) {
      debt.sort((a, b) => b.c - a.c);
      cred.sort((a, b) => b.c - a.c);
      const d = debt[0], c = cred[0];
      const x = Math.min(d.c, c.c);
      if (x > 0) moves.push({ from: d.p, to: c.p, c: x });
      d.c -= x; c.c -= x;
      if (!d.c) debt.shift();
      if (!c.c) cred.shift();
    }
    return moves;
  }

  // ---------- pintar la pestaña ----------
  let tab = "gastos";

  function render() {
    const { bal, total, cats, spent, paidReal } = balances();
    $("cu-total").textContent = money(total);
    $("cu-count").textContent = `${live().filter((e) => e.mode !== "transfer").length} gastos`;

    // ¿Quién eres?
    const meBox = $("cu-me");
    if (!me) {
      meBox.innerHTML = `<p class="cu-me-q">¿Quién eres? Así te digo cuánto debes o te deben.</p>
        <div class="chips cu-people">${PEOPLE.map((p) => `<button type="button" data-me="${esc(p)}">${esc(p)}</button>`).join("")}</div>`;
    } else {
      const b = bal[me];
      meBox.innerHTML = `<div class="cu-me-line"><span>Eres <b>${esc(me)}</b> · <button type="button" class="btn-link cu-change" data-me="">cambiar</button></span>
        <span class="cu-me-bal ${b > 0 ? "pos" : b < 0 ? "neg" : ""}">${b > 0 ? `Te deben ${money(b)}` : b < 0 ? `Debes ${money(-b)}` : "Estás en paz 😇"}</span></div>`;
    }

    $("cu-seg").querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x.dataset.cu === tab)));
    $("cu-gastos").hidden = tab !== "gastos";
    $("cu-saldos").hidden = tab !== "saldos";

    // Lista de gastos por días
    const list = live().sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.created || 0) - (a.created || 0));
    if (!list.length) {
      $("cu-list").innerHTML = `<div class="empty"><b>🧾</b>Todavía no hay gastos.<br>Dale a «Añadir gasto» para apuntar el primero.</div>`;
    } else {
      let html = "", day = "";
      list.forEach((e) => {
        if (e.date !== day) { day = e.date; html += `<h3 class="cu-day">${esc(dayLabel(day))}</h3>`; }
        const sh = sharesOf(e);
        if (e.mode === "transfer") {
          const to = Object.keys(sh)[0];
          html += `<button type="button" class="cu-item transfer" data-id="${esc(e.id)}">
            <span class="cu-ico">💸</span>
            <span class="cu-main"><b>${esc(e.payer)} → ${esc(to)}</b><small>Pago para saldar cuentas</small></span>
            <span class="cu-amt">${money(e.amount)}</span></button>`;
          return;
        }
        const n = Object.keys(sh).length;
        const mine = me ? sh[me] || 0 : null;
        const how = e.mode === "equal" ? (n === PEOPLE.length ? "entre todos" : `entre ${n}`) : e.mode === "exact" ? "por importes" : "por partes";
        html += `<button type="button" class="cu-item" data-id="${esc(e.id)}">
          <span class="cu-ico">${catOf(e.cat).emoji}</span>
          <span class="cu-main"><b>${esc(e.desc)}</b><small>Pagó ${esc(e.payer)} · ${how}</small></span>
          <span class="cu-amt">${money(e.amount)}${mine !== null ? `<small>${mine ? `tu parte ${money(mine)}` : "no entras"}</small>` : ""}</span></button>`;
      });
      $("cu-list").innerHTML = html;
    }

    // Saldos
    const max = Math.max(1, ...PEOPLE.map((p) => Math.abs(bal[p])));
    $("cu-bal").innerHTML = PEOPLE.map((p) => {
      const b = bal[p];
      const w = Math.round((Math.abs(b) / max) * 100);
      return `<li class="${p === me ? "is-me" : ""}">
        <span class="cu-bal-name">${esc(p)}${p === me ? " (tú)" : ""}</span>
        <span class="cu-bar"><span class="cu-bar-half neg">${b < 0 ? `<i style="width:${w}%"></i>` : ""}</span><span class="cu-bar-half pos">${b > 0 ? `<i style="width:${w}%"></i>` : ""}</span></span>
        <span class="cu-bal-val ${b > 0 ? "pos" : b < 0 ? "neg" : ""}">${signed(b)}</span>
      </li>`;
    }).join("");

    const moves = settle(bal);
    $("cu-moves").innerHTML = moves.length
      ? moves.map((m) => `<li><span><b>${esc(m.from)}</b> paga a <b>${esc(m.to)}</b></span><span class="cu-move-amt">${money(m.c)}</span>
          <button type="button" class="btn-chip-sm" data-settle="${esc(m.from)}|${esc(m.to)}|${m.c}">Hecho ✓</button></li>`).join("")
      : `<li class="cu-paz">${total ? "¡Estáis en paz! Nadie debe nada 🙌" : "Cuando apuntéis gastos, aquí sale quién paga a quién."}</li>`;

    $("cu-people-sum").innerHTML = PEOPLE.map((p) => `<tr><td>${esc(p)}</td><td>${money(paidReal[p])}</td><td>${money(spent[p])}</td></tr>`).join("");

    const catMax = Math.max(1, ...Object.values(cats));
    $("cu-cats").innerHTML = Object.keys(cats).length
      ? Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([id, c]) => {
        const cat = catOf(id);
        return `<li><span>${cat.emoji} ${cat.name}</span><span class="cu-cat-bar"><i style="width:${Math.round((c / catMax) * 100)}%"></i></span><b>${money(c)}</b></li>`;
      }).join("")
      : `<li class="cu-paz">Sin gastos todavía.</li>`;
  }

  // ---------- formulario de gasto ----------
  const form = { id: null, kind: "gasto", mode: "equal", payer: "", to: "", split: {}, cat: "compra" };

  function openForm(id) {
    const e = id ? db.e[id] : null;
    form.id = e ? e.id : null;
    form.kind = e && e.mode === "transfer" ? "pago" : "gasto";
    form.mode = e && e.mode !== "transfer" ? e.mode : "equal";
    form.payer = e ? e.payer : me || PEOPLE[0];
    form.cat = e ? e.cat || "otros" : "compra";
    form.to = e && e.mode === "transfer" ? Object.keys(e.split)[0] : PEOPLE.find((p) => p !== form.payer);
    form.split = {};
    if (e && e.mode !== "transfer") PEOPLE.forEach((p) => { if (e.split[p]) form.split[p] = e.split[p]; });
    $("cu-desc").value = e ? e.desc || "" : "";
    $("cu-amount").value = e ? nf.format(e.amount / 100) : "";
    $("cu-date").value = e ? e.date : todayISO();
    $("cu-form-title").textContent = e ? (form.kind === "pago" ? "Editar pago" : "Editar gasto") : "Nuevo gasto";
    $("cu-delete").hidden = !e;
    $("cu-form-error").hidden = true;
    defaultSplit(true);
    renderForm();
    $("cu-panel").hidden = false;
    if (!e) setTimeout(() => $("cu-desc").focus(), 60);
  }
  function closeForm() { $("cu-panel").hidden = true; }

  // Valores por defecto al cambiar de modo de reparto.
  function defaultSplit(keep) {
    const amount = parseMoney($("cu-amount").value);
    if (form.mode === "equal" && (!keep || !Object.keys(form.split).length)) { form.split = {}; PEOPLE.forEach((p) => { form.split[p] = 1; }); }
    if (form.mode === "shares" && (!keep || !Object.keys(form.split).length)) { form.split = {}; PEOPLE.forEach((p) => { form.split[p] = 1; }); }
    if (form.mode === "exact" && (!keep || !Object.keys(form.split).length)) {
      form.split = {};
      if (amount > 0) { const eq = sharesOf({ amount, mode: "equal", split: Object.fromEntries(PEOPLE.map((p) => [p, 1])) }); PEOPLE.forEach((p) => { form.split[p] = eq[p] || 0; }); }
    }
  }

  function renderForm() {
    const isPago = form.kind === "pago";
    $("cu-kind").querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.kind === form.kind)));
    $("cu-gasto-fields").hidden = isPago;
    $("cu-to-row").hidden = !isPago;
    $("cu-split-box").hidden = isPago;
    $("cu-payer-label").textContent = isPago ? "¿Quién paga?" : "¿Quién lo ha pagado?";
    $("cu-payer").innerHTML = PEOPLE.map((p) => `<button type="button" data-payer="${esc(p)}" aria-pressed="${p === form.payer}">${esc(p)}</button>`).join("");
    $("cu-to").innerHTML = PEOPLE.filter((p) => p !== form.payer).map((p) => `<button type="button" data-to="${esc(p)}" aria-pressed="${p === form.to}">${esc(p)}</button>`).join("");
    $("cu-cats-pick").innerHTML = CATS.map((c) => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === form.cat}">${c.emoji} ${c.name}</button>`).join("");
    $("cu-mode").querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === form.mode)));
    renderSplit();
  }

  function renderSplit() {
    const amount = parseMoney($("cu-amount").value);
    const preview = amount > 0 ? sharesOf({ amount, mode: form.mode, split: form.split }) : null;
    const rows = PEOPLE.map((p) => {
      let control = "";
      if (form.mode === "equal") control = `<input type="checkbox" data-eq="${esc(p)}" ${form.split[p] ? "checked" : ""} aria-label="${esc(p)} entra">`;
      if (form.mode === "shares") control = `<span class="cu-step"><button type="button" data-sh="${esc(p)}" data-d="-1">−</button><b>${form.split[p] || 0}</b><button type="button" data-sh="${esc(p)}" data-d="1">+</button></span>`;
      if (form.mode === "exact") control = `<input class="cu-ex" inputmode="decimal" data-ex="${esc(p)}" value="${form.split[p] ? nf.format(form.split[p] / 100) : ""}" placeholder="0,00" aria-label="Parte de ${esc(p)}">`;
      const val = form.mode === "exact" ? "" : `<span class="cu-split-val">${preview && preview[p] ? money(preview[p]) : "—"}</span>`;
      return `<li><label class="cu-split-name">${form.mode === "equal" ? control : ""}<span>${esc(p)}</span></label>${form.mode !== "equal" ? control : ""}${val}</li>`;
    }).join("");
    $("cu-split").innerHTML = rows;
    let hint = "";
    if (form.mode === "exact") {
      const sum = PEOPLE.reduce((s, p) => s + (form.split[p] || 0), 0);
      const diff = (amount > 0 ? amount : 0) - sum;
      hint = !(amount > 0) ? "Pon primero el importe." : diff === 0 ? "✅ Cuadra con el total." : diff > 0 ? `Faltan ${money(diff)} por repartir.` : `Te pasas en ${money(-diff)}.`;
    } else if (form.mode === "equal") {
      const n = PEOPLE.filter((p) => form.split[p]).length;
      hint = n ? `Entre ${n}${amount > 0 ? ` · ${money(Math.floor(amount / n))} cada uno, más o menos` : ""}` : "Elige al menos a una persona.";
    } else {
      const W = PEOPLE.reduce((s, p) => s + (form.split[p] || 0), 0);
      hint = W ? `${W} partes en total. Por ejemplo, quien bebe el doble pone 2.` : "Pon al menos una parte.";
    }
    $("cu-split-hint").textContent = hint;
  }

  function formError(msg) { $("cu-form-error").textContent = msg; $("cu-form-error").hidden = !msg; }

  function saveForm() {
    const amount = parseMoney($("cu-amount").value);
    if (!(amount > 0)) return formError("Pon un importe válido, por ejemplo 12,50.");
    if (amount > 10000000) return formError("Ese importe es demasiado grande.");
    const old = form.id ? db.e[form.id] : null;
    const now = Date.now();
    let e;
    if (form.kind === "pago") {
      if (!form.to || form.to === form.payer) return formError("Elige a quién le paga.");
      e = { id: form.id || uid(), desc: "Pago", amount, payer: form.payer, date: $("cu-date").value || todayISO(), cat: "otros", mode: "transfer", split: { [form.to]: amount } };
    } else {
      const desc = $("cu-desc").value.trim().slice(0, 60);
      if (!desc) return formError("Pon qué es (por ejemplo: Compra Mercadona).");
      const split = {};
      PEOPLE.forEach((p) => { if (form.split[p]) split[p] = form.split[p]; });
      e = { id: form.id || uid(), desc, amount, payer: form.payer, date: $("cu-date").value || todayISO(), cat: form.cat, mode: form.mode, split };
      if (!sharesOf(e)) {
        return formError(form.mode === "exact" ? "Los importes de cada uno tienen que sumar el total." : form.mode === "equal" ? "Elige al menos a una persona." : "Pon al menos una parte.");
      }
    }
    e.created = old ? old.created : now;
    e.upd = now;
    db.e[e.id] = e;
    persist();
    closeForm();
    render();
    toast(old ? "Cambios guardados ✓" : "Gasto apuntado ✓");
  }

  function removeExpense(id) {
    const e = db.e[id];
    if (!e) return;
    // Se marca como borrado (y no se elimina) para que el borrado también llegue a los demás al compartir.
    db.e[id] = { id, del: true, upd: Date.now(), created: e.created };
    persist();
    render();
  }

  // ---------- compartir por enlace ----------
  const b64url = (bytes) => { let s = ""; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb64url = (str) => { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };

  async function pack() {
    const json = JSON.stringify({ v: 1, e: Object.values(db.e) });
    const bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream !== "undefined") {
      try {
        const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
        return "z" + b64url(new Uint8Array(buf));
      } catch { /* sin compresión */ }
    }
    return "j" + b64url(bytes);
  }
  async function unpack(code) {
    const kind = code[0], body = code.slice(1);
    let bytes = unb64url(body);
    if (kind === "z") {
      if (typeof DecompressionStream === "undefined") throw new Error("Este móvil no puede abrir el enlace. Actualiza el sistema.");
      bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    } else if (kind !== "j") throw new Error("Código no válido");
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || !Array.isArray(data.e)) throw new Error("Código no válido");
    return data.e;
  }
  const codeFrom = (text) => {
    const t = String(text || "").trim();
    const m = t.match(/#cuentas=([A-Za-z0-9_-]+)/);
    return m ? m[1] : /^[zj][A-Za-z0-9_-]+$/.test(t) ? t : "";
  };

  // Junta las cuentas recibidas con las tuyas: por cada gasto se queda la versión más reciente.
  function merge(list) {
    let added = 0, updated = 0;
    list.forEach((x) => {
      if (!x || typeof x.id !== "string" || !x.id || x.id.length > 40) return;
      const clean = x.del
        ? { id: x.id, del: true, upd: Number(x.upd) || 0, created: Number(x.created) || 0 }
        : {
          id: x.id, desc: String(x.desc || "").slice(0, 60), amount: Math.round(Number(x.amount) || 0), payer: String(x.payer || ""),
          date: /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : todayISO(), cat: CATS.some((c) => c.id === x.cat) ? x.cat : "otros",
          mode: ["equal", "exact", "shares", "transfer"].includes(x.mode) ? x.mode : "equal",
          split: Object.fromEntries(Object.entries(x.split || {}).filter(([p]) => PEOPLE.includes(p)).map(([p, v]) => [p, Math.round(Number(v) || 0)])),
          upd: Number(x.upd) || 0, created: Number(x.created) || 0
        };
      const cur = db.e[x.id];
      if (!cur) { db.e[x.id] = clean; if (!clean.del) added++; }
      else if ((clean.upd || 0) > (cur.upd || 0)) { db.e[x.id] = clean; updated++; }
    });
    persist();
    render();
    return { added, updated };
  }

  async function share() {
    const code = await pack();
    const url = `${location.origin}${location.pathname}#cuentas=${code}`;
    const { total } = balances();
    const text = `💶 Cuentas del finde de la Virgen de Arriba (${money(total)} en total). Ábrelo para juntarlas con las tuyas:`;
    try {
      if (navigator.share) { await navigator.share({ title: "Cuentas Virgen de Arriba", text, url }); return; }
    } catch (err) { if (err && err.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Enlace copiado. Pégalo en el grupo ✓"); return; } catch { /* sin portapapeles */ }
    $("cu-link-out").value = url;
    $("cu-link-out").hidden = false;
    $("cu-link-out").select();
    toast("Copia el enlace de la casilla");
  }

  function summaryText() {
    const { bal, total } = balances();
    const lines = [`💶 Cuentas de la Virgen de Arriba`, `Total gastado: ${money(total)}`, "", "Saldos:"];
    PEOPLE.forEach((p) => lines.push(`· ${p}: ${signed(bal[p])}`));
    const moves = settle(bal);
    lines.push("", moves.length ? "Para quedar en paz:" : "¡Estamos en paz! 🙌");
    moves.forEach((m) => lines.push(`· ${m.from} → ${m.to}: ${money(m.c)}`));
    return lines.join("\n");
  }

  async function copySummary() {
    const t = summaryText();
    try { await navigator.clipboard.writeText(t); toast("Resumen copiado ✓"); }
    catch { location.href = `https://wa.me/?text=${encodeURIComponent(t)}`; }
  }

  async function importCode(code, fromLink) {
    try {
      const list = await unpack(code);
      const r = merge(list);
      toast(r.added || r.updated ? `Cuentas juntadas: ${r.added} nuevos, ${r.updated} actualizados ✓` : "Ya tenías todo, no había nada nuevo 👍");
      if (fromLink) history.replaceState(null, "", location.pathname + location.search);
      return true;
    } catch (err) {
      toast(err && err.message && err.message.length < 80 ? err.message : "No se ha podido leer ese enlace");
      return false;
    }
  }

  // ---------- avisos ----------
  let toastTimer = 0;
  function toast(msg) {
    const t = $("cu-toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ---------- eventos ----------
  $("cu-me").addEventListener("click", (e) => {
    const b = e.target.closest("[data-me]");
    if (!b) return;
    me = b.dataset.me;
    save(ME_KEY, me);
    render();
  });
  $("cu-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cu]");
    if (!b) return;
    tab = b.dataset.cu;
    render();
  });
  $("cu-add").addEventListener("click", () => openForm(null));
  $("cu-list").addEventListener("click", (e) => {
    const b = e.target.closest(".cu-item");
    if (b) openForm(b.dataset.id);
  });
  $("cu-moves").addEventListener("click", (e) => {
    const b = e.target.closest("[data-settle]");
    if (!b) return;
    const [from, to, c] = b.dataset.settle.split("|");
    if (!confirm(`¿Apuntar que ${from} le ha pagado ${money(Number(c))} a ${to}?`)) return;
    const now = Date.now();
    const id = uid();
    db.e[id] = { id, desc: "Pago", amount: Number(c), payer: from, date: todayISO(), cat: "otros", mode: "transfer", split: { [to]: Number(c) }, created: now, upd: now };
    persist();
    render();
    toast("Pago apuntado ✓");
  });
  $("cu-share").addEventListener("click", share);
  $("cu-summary").addEventListener("click", copySummary);
  $("cu-import").addEventListener("click", async () => {
    const code = codeFrom($("cu-paste").value);
    if (!code) { toast("Pega aquí el enlace de las cuentas que te han mandado"); return; }
    if (await importCode(code, false)) $("cu-paste").value = "";
  });
  $("cu-reset").addEventListener("click", () => {
    if (!confirm("¿Borrar TODAS las cuentas de este móvil? No se puede deshacer.")) return;
    if (!confirm("¿Seguro, seguro? Si ya las habías compartido, los demás las seguirán teniendo.")) return;
    db = { v: 1, e: {} };
    persist();
    render();
    toast("Cuentas borradas");
  });

  // Formulario
  $("cu-close").addEventListener("click", closeForm);
  $("cu-save").addEventListener("click", saveForm);
  $("cu-delete").addEventListener("click", () => {
    if (!form.id || !confirm("¿Borrar este gasto?")) return;
    removeExpense(form.id);
    closeForm();
    toast("Borrado");
  });
  $("cu-kind").addEventListener("click", (e) => {
    const b = e.target.closest("[data-kind]");
    if (!b) return;
    form.kind = b.dataset.kind;
    if (!form.to || form.to === form.payer) form.to = PEOPLE.find((p) => p !== form.payer);
    renderForm();
  });
  $("cu-payer").addEventListener("click", (e) => {
    const b = e.target.closest("[data-payer]");
    if (!b) return;
    form.payer = b.dataset.payer;
    if (form.to === form.payer) form.to = PEOPLE.find((p) => p !== form.payer);
    renderForm();
  });
  $("cu-to").addEventListener("click", (e) => {
    const b = e.target.closest("[data-to]");
    if (!b) return;
    form.to = b.dataset.to;
    renderForm();
  });
  $("cu-cats-pick").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    form.cat = b.dataset.cat;
    renderForm();
  });
  $("cu-mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b) return;
    form.mode = b.dataset.mode;
    defaultSplit(false);
    renderForm();
  });
  $("cu-amount").addEventListener("input", () => {
    if (form.mode === "exact" && !PEOPLE.some((p) => form.split[p])) defaultSplit(false);
    renderSplit();
  });
  $("cu-split").addEventListener("change", (e) => {
    const p = e.target.dataset.eq;
    if (p) { if (e.target.checked) form.split[p] = 1; else delete form.split[p]; renderSplit(); }
  });
  $("cu-split").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sh]");
    if (!b) return;
    const p = b.dataset.sh;
    form.split[p] = Math.max(0, Math.min(20, (form.split[p] || 0) + Number(b.dataset.d)));
    renderSplit();
  });
  $("cu-split").addEventListener("input", (e) => {
    const p = e.target.dataset.ex;
    if (!p) return;
    const v = parseMoney(e.target.value);
    form.split[p] = v > 0 ? v : 0;
    // Solo actualizamos el aviso para no quitar el foco de la casilla.
    const amount = parseMoney($("cu-amount").value);
    const sum = PEOPLE.reduce((s, q) => s + (form.split[q] || 0), 0);
    const diff = (amount > 0 ? amount : 0) - sum;
    $("cu-split-hint").textContent = !(amount > 0) ? "Pon primero el importe." : diff === 0 ? "✅ Cuadra con el total." : diff > 0 ? `Faltan ${money(diff)} por repartir.` : `Te pasas en ${money(-diff)}.`;
  });
  $("cu-split-all").addEventListener("click", () => {
    if (form.mode === "equal") {
      const all = PEOPLE.every((p) => form.split[p]);
      form.split = {};
      if (!all) PEOPLE.forEach((p) => { form.split[p] = 1; });
    } else defaultSplit(false);
    renderSplit();
  });

  // Enlace recibido (#cuentas=…)
  async function checkLink() {
    const code = codeFrom(location.hash);
    if (!code) return;
    let list;
    try { list = await unpack(code); } catch (err) { toast("Ese enlace de cuentas no se puede leer"); return; }
    const n = list.filter((x) => x && !x.del && x.mode !== "transfer").length;
    $("cu-import-text").textContent = `Te han mandado unas cuentas con ${n} ${n === 1 ? "gasto" : "gastos"}. ¿Las juntamos con las tuyas? No se duplica nada.`;
    $("cu-import-sheet").hidden = false;
    $("cu-import-backdrop").hidden = false;
    $("cu-import-yes").onclick = async () => {
      closeImport();
      await importCode(code, true);
      const tabBtn = document.querySelector('#tabs [data-view="cuentas"]');
      if (tabBtn && !document.getElementById("s-main").hidden) tabBtn.click();
    };
  }
  function closeImport() { $("cu-import-sheet").hidden = true; $("cu-import-backdrop").hidden = true; }
  $("cu-import-no").addEventListener("click", () => { closeImport(); history.replaceState(null, "", location.pathname + location.search); });
  $("cu-import-backdrop").addEventListener("click", closeImport);
  window.addEventListener("hashchange", checkLink);

  // Para las pruebas automáticas.
  window.__cuentas = { sharesOf, settle, balances, parseMoney, merge, pack, unpack };

  render();
  checkLink();
})();

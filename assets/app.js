import { firebaseConfig, DB_PATH } from "./firebase-config.js";

/* =========================================================
   Constantes
   ========================================================= */

const WEEKDAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const SHORT_WD = {
  "Sábado": "Sáb", "Domingo": "Dom", "Segunda": "Seg",
  "Terça": "Ter", "Quarta": "Qua", "Quinta": "Qui", "Sexta": "Sex"
};

const COOK_PALETTE = [
  "#C1462F", "#2F6F5E", "#2C5A8C", "#8A4A72",
  "#B37C0B", "#5C6B4B", "#6B5CA5", "#A6572E"
];

const MAX_LEN = 500;
const MENUS_BASE = DB_PATH.split("/")[0];

const GOOGLE_G_SVG =
  '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">' +
  '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>' +
  '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.55-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z"/>' +
  '<path fill="#FBBC05" d="M3.97 10.73A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.19.29-1.73V4.94H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.06z"/>' +
  '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.94l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>' +
  "</svg>";

/* =========================================================
   Estado
   ========================================================= */

let menus = {};                  // { "2026-08-01": "Bacalhau à Brás", ... }
let feedback = {};                // { dayId: { entryId: {type, stars, text, ts} } }
let attendance = {};               // { dayId: { uid: {count, ts} } }
let shoppingLists = {};            // { listId: {name, createdBy, ts, items: {itemId: {name, done, ts}}} }
let activeTab = "escala";          // "escala" | "compras"
let allMenus = {};                 // { periodo: { dayId: texto } } — histórico completo
let allReviews = {};               // { periodo: { dayId: { entryId: entry } } }
let menuIndex = null;              // Map norm -> {display, lastDate, starSum, starCount} (lazy)
let profiles = {};                 // { uid: {name, householdSize, ts} }
let filter = null;                 // cozinheiro (uid) selecionado, ou null
let backend = null;                // preenchido depois do login
let currentUser = null;            // { uid, name }
let openPanelDay = null;            // { dayId, card, sections: {attendance, menu, feedback}, sheet, suggestionsEl }

let scheduleConfig = { period: null, cooks: null }; // { period: {startDate,endDate}, cooks: {order} }
let PERIODO = null;
let PEOPLE = {};                   // uid -> { name, color }
let DAYS = [];                     // [{ id, num, wd, who: uid }]

const textareas = new Map();       // dayId -> elemento
const feedbackLists = new Map();   // dayId -> elemento <ul>
const attendanceBadges = new Map();   // dayId -> elemento do total
const attendanceControls = new Map(); // dayId -> { render() }

const $status = document.getElementById("status");
const $note = document.getElementById("mode-note");
const $session = document.getElementById("session");
const $subtitle = document.getElementById("subtitle");
const $gate = document.getElementById("gate");
const $appWrap = document.getElementById("app-wrap");
const $panel = document.getElementById("day-panel");
const $unconfigured = document.getElementById("unconfigured");
const $adminPanel = document.getElementById("admin-panel");
const $viewEscala = document.getElementById("view-escala");
const $viewCompras = document.getElementById("view-compras");
const $tabEscala = document.getElementById("tab-escala");
const $tabCompras = document.getElementById("tab-compras");
const $shopLists = document.getElementById("shop-lists");
const $shopEmpty = document.getElementById("shop-empty");

function setStatus(text, state) {
  $status.textContent = text;
  if (state) $status.dataset.state = state;
  else $status.removeAttribute("data-state");
}

function todayId() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function isConfigured() {
  return !String(firebaseConfig.apiKey || "").includes("COLOCAR_AQUI");
}

function formatDatePt(iso) {
  const parts = iso.split("-");
  return parts[2] + "/" + parts[1];
}

/* =========================================================
   Portão de entrada (Google Sign-In)
   ========================================================= */

function clearGate() {
  $gate.replaceChildren();
  $gate.hidden = false;
  $appWrap.hidden = true;
  $unconfigured.hidden = true;
}

function renderGateLogin(onClick) {
  clearGate();
  const card = document.createElement("div");
  card.className = "gate-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "gate-eyebrow";
  eyebrow.textContent = "Escala de jantares";

  const title = document.createElement("h1");
  title.className = "gate-title";
  title.textContent = "Antes de te sentares à mesa";

  const sub = document.createElement("p");
  sub.className = "gate-sub";
  sub.textContent =
    "Entra com o Google para veres a escala, escreveres a ementa e confirmares presença.";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gate-google";
  btn.innerHTML = GOOGLE_G_SVG + "<span>Continuar com Google</span>";
  btn.addEventListener("click", onClick);

  card.append(eyebrow, title, sub, btn);
  $gate.appendChild(card);
}

function renderGateError(message, retryFn) {
  clearGate();
  const card = document.createElement("div");
  card.className = "gate-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "gate-eyebrow";
  eyebrow.textContent = "Escala de jantares";

  const title = document.createElement("h1");
  title.className = "gate-title";
  title.textContent = "Não foi possível entrar";

  const msg = document.createElement("p");
  msg.className = "gate-error";
  msg.textContent = message;

  card.append(eyebrow, title, msg);

  if (retryFn) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gate-google";
    btn.textContent = "Tentar outra vez";
    btn.addEventListener("click", retryFn);
    card.appendChild(btn);
  }

  $gate.appendChild(card);
}

function renderProfilePrompt(name, onSubmit) {
  clearGate();
  const card = document.createElement("div");
  card.className = "gate-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "gate-eyebrow";
  eyebrow.textContent = "Olá, " + name;

  const title = document.createElement("h1");
  title.className = "gate-title";
  title.textContent = "Quantos vêm contigo?";

  const sub = document.createElement("p");
  sub.className = "gate-sub";
  sub.textContent =
    "Este número conta por omissão em cada jantar. Podes sempre ajustar dia a dia.";

  const form = document.createElement("form");
  form.className = "gate-form";

  const stepperRow = document.createElement("div");
  stepperRow.className = "gate-stepper";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "att-btn";
  minus.textContent = "−";

  const bigNum = document.createElement("span");
  bigNum.className = "gate-num";
  let n = 1;
  bigNum.textContent = String(n);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "att-btn";
  plus.textContent = "+";

  minus.addEventListener("click", () => {
    n = Math.max(1, n - 1);
    bigNum.textContent = String(n);
  });
  plus.addEventListener("click", () => {
    n = Math.min(20, n + 1);
    bigNum.textContent = String(n);
  });

  stepperRow.append(minus, bigNum, plus);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "gate-google";
  submitBtn.textContent = "Confirmar";

  form.append(stepperRow, submitBtn);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    onSubmit(n);
  });

  card.append(eyebrow, title, sub, form);
  $gate.appendChild(card);
}

/* =========================================================
   Ligação ao Firebase
   ========================================================= */

function makeBackend(db, fns) {
  const { ref, onValue, update, push, set, get } = fns;
  const usersNode = ref(db, "users");
  const configPeriodNode = ref(db, "config/period");
  const configCooksNode = ref(db, "config/cooks");

  let currentPeriodo = null;
  let menusNode = null;
  let unsubMenus = null;
  let unsubReviews = null;
  let unsubAttendance = null;

  return {
    startConfig(onPeriod, onCooks, onError) {
      onValue(
        configPeriodNode,
        (snap) => onPeriod(snap.exists() ? snap.val() : null),
        (err) => onError(err)
      );
      onValue(
        configCooksNode,
        (snap) => onCooks(snap.exists() ? snap.val() : null),
        (err) => onError(err)
      );
    },
    async writePeriod(period) {
      await set(configPeriodNode, period);
    },
    async writeCooks(cooks) {
      await set(configCooksNode, cooks);
    },
    startScheduleData(periodo, handlers) {
      if (periodo === currentPeriodo) return;
      currentPeriodo = periodo;

      if (unsubMenus) unsubMenus();
      if (unsubReviews) unsubReviews();
      if (unsubAttendance) unsubAttendance();

      menusNode = ref(db, MENUS_BASE + "/" + periodo);
      const reviewsNode = ref(db, "reviews/" + periodo);
      const attendanceNode = ref(db, "attendance/" + periodo);

      unsubMenus = onValue(
        menusNode,
        (snap) => handlers.onMenus(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
      unsubReviews = onValue(
        reviewsNode,
        (snap) => handlers.onFeedback(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
      unsubAttendance = onValue(
        attendanceNode,
        (snap) => handlers.onAttendance(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
    },
    async write(dayId, value) {
      await update(menusNode, { [dayId]: value });
    },
    async writeFeedback(dayId, entry) {
      const entryRef = push(ref(db, "reviews/" + currentPeriodo + "/" + dayId));
      await set(entryRef, entry);
      return entryRef.key;
    },
    async writeAttendance(dayId, count) {
      await set(ref(db, "attendance/" + currentPeriodo + "/" + dayId + "/" + currentUser.uid), {
        count,
        ts: Date.now()
      });
    },
    startMenuHistory(onMenus, onReviews) {
      onValue(
        ref(db, MENUS_BASE),
        (snap) => onMenus(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
      onValue(
        ref(db, "reviews"),
        (snap) => onReviews(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
    },
    startShoppingLists(onRemote) {
      onValue(
        ref(db, "shoppingLists"),
        (snap) => onRemote(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
    },
    async createShoppingList(name) {
      const listRef = push(ref(db, "shoppingLists"));
      await set(listRef, { name, createdBy: currentUser.uid, ts: Date.now() });
    },
    async addShoppingItem(listId, name) {
      const itemRef = push(ref(db, "shoppingLists/" + listId + "/items"));
      await set(itemRef, { name, done: false, ts: Date.now() });
    },
    async setShoppingItemDone(listId, itemId, done) {
      await set(ref(db, "shoppingLists/" + listId + "/items/" + itemId + "/done"), done);
    },
    startProfiles(onRemote, onError) {
      onValue(
        usersNode,
        (snap) => onRemote(snap.val() || {}),
        (err) => {
          setStatus("Sem ligação à base de dados: " + err.code, "error");
          if (onError) onError(err);
        }
      );
    },
    async writeProfile(uid, profile) {
      await set(ref(db, "users/" + uid), profile);
    },
    async readProfile(uid) {
      const snap = await get(ref(db, "users/" + uid));
      return snap.exists() ? snap.val() : null;
    }
  };
}

/* =========================================================
   Geração da escala a partir da configuração
   ========================================================= */

function cookColor(index) {
  return COOK_PALETTE[index % COOK_PALETTE.length];
}

function buildPeople(cookOrder, profilesMap) {
  const map = {};
  cookOrder.forEach((uid, idx) => {
    const profile = profilesMap[uid];
    map[uid] = {
      name: profile ? profile.name : "Conta",
      color: cookColor(idx)
    };
  });
  return map;
}

function buildDays(startDate, endDate, cookOrder) {
  const days = [];
  const cursor = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  let i = 0;
  while (cursor <= end) {
    const id = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, "0"),
      String(cursor.getDate()).padStart(2, "0")
    ].join("-");
    days.push({
      id,
      num: String(cursor.getDate()).padStart(2, "0"),
      wd: WEEKDAY_NAMES[cursor.getDay()],
      who: cookOrder[i % cookOrder.length]
    });
    cursor.setDate(cursor.getDate() + 1);
    i++;
  }
  return days;
}

function regenerateSchedule() {
  if (openPanelDay) closeDayPanel();

  const { period, cooks } = scheduleConfig;
  const hasCooks = cooks && cooks.order && cooks.order.length;

  if (!period || !hasCooks) {
    $appWrap.hidden = true;
    $unconfigured.hidden = false;
    renderUnconfigured();
    return;
  }

  try {
    regenerateScheduleUnsafe(period, cooks);
  } catch (e) {
    renderScheduleMessage(
      "Não foi possível montar a escala",
      "A configuração guardada parece inválida. Abre a administração e confirma o período e os cozinheiros."
    );
  }
}

function regenerateScheduleUnsafe(period, cooks) {
  $unconfigured.hidden = true;
  $appWrap.hidden = false;

  PEOPLE = buildPeople(cooks.order, profiles);
  DAYS = buildDays(period.startDate, period.endDate, cooks.order);

  const newPeriodo = period.startDate.slice(0, 7);
  if (newPeriodo !== PERIODO) {
    PERIODO = newPeriodo;
    backend.startScheduleData(PERIODO, {
      onMenus: applyRemote,
      onFeedback: applyRemoteFeedback,
      onAttendance: applyRemoteAttendance
    });
  }

  $subtitle.textContent =
    formatDatePt(period.startDate) + " a " + formatDatePt(period.endDate) +
    " · " + cooks.order.length + (cooks.order.length > 1 ? " cozinheiros" : " cozinheiro") +
    " · " + DAYS.length + (DAYS.length > 1 ? " jantares" : " jantar");

  renderPeople();
  renderWeeks();
}

/* =========================================================
   Mensagens de carregamento/erro (antes de saber se há configuração)
   ========================================================= */

function renderScheduleMessage(title, message) {
  $appWrap.hidden = true;
  $unconfigured.hidden = false;
  $unconfigured.replaceChildren();

  const card = document.createElement("div");
  card.className = "gate-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "gate-eyebrow";
  eyebrow.textContent = "Escala de jantares";

  const h1 = document.createElement("h1");
  h1.className = "gate-title";
  h1.textContent = title;

  card.append(eyebrow, h1);

  if (message) {
    const p = document.createElement("p");
    p.className = "gate-error";
    p.textContent = message;
    card.appendChild(p);
  }

  $unconfigured.appendChild(card);
}

/* =========================================================
   Estado "por configurar"
   ========================================================= */

function renderUnconfigured() {
  $unconfigured.replaceChildren();
  const card = document.createElement("div");
  card.className = "gate-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "gate-eyebrow";
  eyebrow.textContent = "Escala de jantares";

  const title = document.createElement("h1");
  title.className = "gate-title";
  title.textContent = "Ainda não há uma escala configurada";

  const sub = document.createElement("p");
  sub.className = "gate-sub";
  sub.textContent = "Escolhe quem cozinha e o intervalo de datas para começar.";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "gate-google";
  btn.textContent = "Abrir administração";
  btn.addEventListener("click", openAdminPanel);

  card.append(eyebrow, title, sub, btn);
  $unconfigured.appendChild(card);
}

/* =========================================================
   Administração (cozinheiros + período)
   ========================================================= */

function openAdminPanel() {
  if (openPanelDay) closeDayPanel();

  $adminPanel.replaceChildren();

  const backdrop = document.createElement("div");
  backdrop.className = "panel-backdrop";
  backdrop.addEventListener("click", closeAdminPanel);

  const sheet = document.createElement("div");
  sheet.className = "panel-sheet";

  const head = document.createElement("div");
  head.className = "panel-head";

  const title = document.createElement("h2");
  title.className = "gate-title admin-title";
  title.textContent = "Administração";
  head.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "panel-close";
  closeBtn.setAttribute("aria-label", "Fechar");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeAdminPanel);
  head.appendChild(closeBtn);

  sheet.appendChild(head);

  const form = document.createElement("form");
  form.className = "admin-form";

  const cooksLabel = document.createElement("h3");
  cooksLabel.className = "suggestions-title";
  cooksLabel.textContent = "Quem cozinha";
  form.appendChild(cooksLabel);

  const cooksList = document.createElement("div");
  cooksList.className = "admin-cooks";

  const existingOrder = (scheduleConfig.cooks && scheduleConfig.cooks.order) || [];
  const checkboxes = [];

  const profileEntries = Object.entries(profiles);
  if (!profileEntries.length) {
    const empty = document.createElement("p");
    empty.className = "gate-sub";
    empty.textContent = "Ainda ninguém fez login além de ti.";
    cooksList.appendChild(empty);
  }

  profileEntries.forEach(([uid, profile]) => {
    const label = document.createElement("label");
    label.className = "admin-cook-item";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = uid;
    cb.checked = existingOrder.includes(uid);
    const span = document.createElement("span");
    span.textContent = profile.name;
    label.append(cb, span);
    cooksList.appendChild(label);
    checkboxes.push(cb);
  });

  form.appendChild(cooksList);

  const periodLabel = document.createElement("h3");
  periodLabel.className = "suggestions-title";
  periodLabel.textContent = "Período";
  form.appendChild(periodLabel);

  const periodRow = document.createElement("div");
  periodRow.className = "admin-period";

  const startInput = document.createElement("input");
  startInput.type = "date";
  startInput.required = true;
  startInput.value = (scheduleConfig.period && scheduleConfig.period.startDate) || "";

  const sep = document.createElement("span");
  sep.textContent = "a";

  const endInput = document.createElement("input");
  endInput.type = "date";
  endInput.required = true;
  endInput.value = (scheduleConfig.period && scheduleConfig.period.endDate) || "";

  periodRow.append(startInput, sep, endInput);
  form.appendChild(periodRow);

  const errorEl = document.createElement("p");
  errorEl.className = "gate-error";
  form.appendChild(errorEl);

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "gate-google";
  saveBtn.textContent = "Guardar";
  form.appendChild(saveBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const order = checkboxes.filter((cb) => cb.checked).map((cb) => cb.value);
    if (!order.length) {
      errorEl.textContent = "Escolhe pelo menos uma conta.";
      return;
    }
    if (!startInput.value || !endInput.value) {
      errorEl.textContent = "Escolhe as datas de início e fim.";
      return;
    }
    if (endInput.value < startInput.value) {
      errorEl.textContent = "A data de fim não pode ser antes da de início.";
      return;
    }

    saveBtn.disabled = true;
    Promise.all([
      backend.writeCooks({ order, ts: Date.now() }),
      backend.writePeriod({ startDate: startInput.value, endDate: endInput.value, ts: Date.now() })
    ])
      .then(() => closeAdminPanel())
      .catch(() => {
        errorEl.textContent = "Não foi possível guardar. Tenta outra vez.";
      })
      .finally(() => {
        saveBtn.disabled = false;
      });
  });

  sheet.appendChild(form);
  $adminPanel.append(backdrop, sheet);
  $adminPanel.hidden = false;
}

function closeAdminPanel() {
  $adminPanel.hidden = true;
  $adminPanel.replaceChildren();
}

document.getElementById("admin-open").addEventListener("click", openAdminPanel);

/* =========================================================
   Render
   ========================================================= */

function renderPeople() {
  const counts = {};
  DAYS.forEach((d) => (counts[d.who] = (counts[d.who] || 0) + 1));

  const nav = document.getElementById("people");
  nav.replaceChildren();

  Object.entries(PEOPLE).forEach(([uid, p]) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.style.setProperty("--c", p.color);
    b.setAttribute("aria-pressed", filter === uid ? "true" : "false");

    const dot = document.createElement("span");
    dot.className = "dot";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = (counts[uid] || 0) + "×";

    b.append(dot, document.createTextNode(p.name), n);
    b.addEventListener("click", () => {
      filter = filter === uid ? null : uid;
      renderPeople();
      applyFilter();
    });
    nav.appendChild(b);
  });
}

function applyFilter() {
  document.querySelectorAll(".day").forEach((el) => {
    el.classList.toggle("dim", !!filter && el.dataset.who !== filter);
  });
}

function autoGrow(ta) {
  ta.style.height = "auto";
  ta.style.height = Math.max(46, ta.scrollHeight) + "px";
}

function buildCard(d, today) {
  const p = PEOPLE[d.who] || { name: "?", color: "#999999" };
  const card = document.createElement("article");
  card.className = "day" + (d.id === today ? " today" : "");
  card.dataset.who = d.who;
  card.style.setProperty("--c", p.color);

  const taId = "ta-" + d.id;
  card.innerHTML =
    '<div class="spine"></div>' +
    '<div class="day-head">' +
      '<div class="num">' + d.num + "</div>" +
      '<div class="wd">' + d.wd + "</div>" +
      '<div class="cook"><span class="dot"></span>' + p.name + "</div>" +
      (d.id === today ? '<span class="today-tag">Hoje</span>' : "") +
    "</div>" +
    '<div class="menu">' +
      '<label for="' + taId + '">Ementa</label>' +
      '<textarea id="' + taId + '" maxlength="' + MAX_LEN + '" placeholder="Por preencher"></textarea>' +
    "</div>";

  const ta = card.querySelector("textarea");
  ta.value = menus[d.id] || "";
  ta.addEventListener("input", () => {
    autoGrow(ta);
    queueWrite(d.id, ta.value);
    renderMenuChips(d.id);
    if (openPanelDay && openPanelDay.dayId === d.id) updatePanelSuggestions();
  });
  ta.addEventListener("focus", () => renderMenuChips(d.id));

  const menuChips = document.createElement("div");
  menuChips.className = "menu-chips";
  card.querySelector(".menu").appendChild(menuChips);
  menuChipEls.set(d.id, menuChips);

  textareas.set(d.id, ta);
  requestAnimationFrame(() => autoGrow(ta));

  card.insertBefore(buildAttendanceSection(d), card.querySelector(".menu"));
  card.appendChild(buildFeedbackSection(d));

  card.addEventListener("click", (e) => {
    if (e.target.closest("textarea, .feedback-form, .attendance-control")) return;
    openDayPanel(d, card);
  });

  return card;
}

/* =========================================================
   Presenças
   ========================================================= */

function getMyCount(dayId) {
  const mine = (attendance[dayId] || {})[currentUser.uid];
  if (mine) return mine.count;
  const profile = profiles[currentUser.uid];
  return profile ? profile.householdSize : 1;
}

function computeDayTotal(dayId) {
  const dayAttendance = attendance[dayId] || {};
  return Object.keys(profiles).reduce((sum, uid) => {
    const override = dayAttendance[uid];
    const count = override ? override.count : profiles[uid].householdSize;
    return sum + count;
  }, 0);
}

function renderAttendanceBadge(dayId) {
  const badge = attendanceBadges.get(dayId);
  if (!badge) return;
  const total = computeDayTotal(dayId);
  badge.textContent = total + (total === 1 ? " pessoa" : " pessoas");
}

function buildAttendanceSection(d) {
  const wrap = document.createElement("div");
  wrap.className = "attendance";

  const badge = document.createElement("div");
  badge.className = "attendance-badge";
  wrap.appendChild(badge);
  attendanceBadges.set(d.id, badge);
  renderAttendanceBadge(d.id);

  const control = document.createElement("div");
  control.className = "attendance-control";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "att-btn";
  minus.textContent = "−";

  const countDisplay = document.createElement("span");
  countDisplay.className = "att-count";

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "att-btn";
  plus.textContent = "+";

  const skipBtn = document.createElement("button");
  skipBtn.type = "button";
  skipBtn.className = "att-skip";
  skipBtn.textContent = "Não vou";

  let myCount = getMyCount(d.id);

  function paint() {
    countDisplay.textContent = String(myCount);
    skipBtn.classList.toggle("active", myCount === 0);
  }
  paint();

  function commit() {
    minus.disabled = plus.disabled = skipBtn.disabled = true;
    backend
      .writeAttendance(d.id, myCount)
      .catch(() => setStatus("Não foi possível guardar a presença.", "error"))
      .finally(() => {
        minus.disabled = plus.disabled = skipBtn.disabled = false;
      });
  }

  minus.addEventListener("click", () => {
    myCount = Math.max(0, myCount - 1);
    paint();
    commit();
  });
  plus.addEventListener("click", () => {
    myCount = Math.min(50, myCount + 1);
    paint();
    commit();
  });
  skipBtn.addEventListener("click", () => {
    const profile = profiles[currentUser.uid];
    myCount = myCount === 0 ? (profile ? profile.householdSize : 1) : 0;
    paint();
    commit();
  });

  control.append(minus, countDisplay, plus, skipBtn);
  wrap.appendChild(control);

  attendanceControls.set(d.id, {
    render() {
      myCount = getMyCount(d.id);
      paint();
    }
  });

  return wrap;
}

function applyRemoteProfiles(remote) {
  profiles = remote || {};
  attendanceBadges.forEach((_, dayId) => renderAttendanceBadge(dayId));
  attendanceControls.forEach((ctrl) => ctrl.render());
}

function applyRemoteAttendance(remote) {
  attendance = remote || {};
  attendanceBadges.forEach((_, dayId) => renderAttendanceBadge(dayId));
  attendanceControls.forEach((ctrl) => ctrl.render());
}

/* =========================================================
   Reviews e recomendações
   ========================================================= */

function renderFeedbackList(dayId) {
  const list = feedbackLists.get(dayId);
  if (!list) return;

  const entries = Object.values(feedback[dayId] || {}).sort((a, b) => a.ts - b.ts);
  list.replaceChildren();

  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "feedback-empty";
    empty.textContent = "Ainda sem reviews nem recomendações.";
    list.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "feedback-item " + entry.type;

    if (entry.type === "review") {
      const stars = document.createElement("span");
      stars.className = "fb-stars-display";
      stars.textContent = "★".repeat(entry.stars) + "☆".repeat(5 - entry.stars);
      li.appendChild(stars);
    } else {
      const tag = document.createElement("span");
      tag.className = "fb-tag";
      tag.textContent = "Recomendação";
      li.appendChild(tag);
    }

    if (entry.text) {
      const txt = document.createElement("span");
      txt.className = "fb-text-display";
      txt.textContent = entry.text;
      li.appendChild(txt);
    }

    list.appendChild(li);
  });
}

function buildFeedbackSection(d) {
  const wrap = document.createElement("div");
  wrap.className = "feedback";

  const title = document.createElement("h3");
  title.className = "feedback-title";
  title.textContent = "Reviews e recomendações";
  wrap.appendChild(title);

  const list = document.createElement("ul");
  list.className = "feedback-list";
  wrap.appendChild(list);
  feedbackLists.set(d.id, list);
  renderFeedbackList(d.id);

  const form = document.createElement("form");
  form.className = "feedback-form";

  const typeRow = document.createElement("div");
  typeRow.className = "fb-type";

  const reviewLabel = document.createElement("label");
  const reviewRadio = document.createElement("input");
  reviewRadio.type = "radio";
  reviewRadio.name = "fb-type-" + d.id;
  reviewRadio.value = "review";
  reviewRadio.checked = true;
  reviewLabel.append(reviewRadio, document.createTextNode(" Review"));

  const recLabel = document.createElement("label");
  const recRadio = document.createElement("input");
  recRadio.type = "radio";
  recRadio.name = "fb-type-" + d.id;
  recRadio.value = "recommendation";
  recLabel.append(recRadio, document.createTextNode(" Recomendação"));

  typeRow.append(reviewLabel, recLabel);
  form.appendChild(typeRow);

  const starsRow = document.createElement("div");
  starsRow.className = "fb-stars";
  let selectedStars = 0;
  const starButtons = [];
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "fb-star";
    b.textContent = "★";
    b.setAttribute("aria-label", i + (i > 1 ? " estrelas" : " estrela"));
    b.addEventListener("click", () => {
      selectedStars = i;
      starButtons.forEach((sb, idx) => sb.classList.toggle("on", idx < i));
    });
    starButtons.push(b);
    starsRow.appendChild(b);
  }
  form.appendChild(starsRow);

  const textField = document.createElement("textarea");
  textField.className = "fb-text";
  textField.maxLength = MAX_LEN;
  textField.placeholder = "Comentário (opcional)";
  form.appendChild(textField);

  function currentType() {
    return reviewRadio.checked ? "review" : "recommendation";
  }

  function updateMode() {
    const isReview = currentType() === "review";
    starsRow.classList.toggle("hidden", !isReview);
    if (!isReview) {
      selectedStars = 0;
      starButtons.forEach((sb) => sb.classList.remove("on"));
    }
    textField.placeholder = isReview
      ? "Comentário (opcional)"
      : "O que sugeres para este dia?";
  }
  reviewRadio.addEventListener("change", updateMode);
  recRadio.addEventListener("change", updateMode);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "fb-submit";
  submitBtn.textContent = "Adicionar";
  form.appendChild(submitBtn);

  const errorEl = document.createElement("p");
  errorEl.className = "fb-error";
  form.appendChild(errorEl);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const type = currentType();
    const text = textField.value.trim();

    if (type === "review" && selectedStars === 0) {
      errorEl.textContent = "Escolhe uma classificação de 1 a 5 estrelas.";
      return;
    }
    if (type === "recommendation" && !text) {
      errorEl.textContent = "Escreve a tua recomendação.";
      return;
    }

    const entry = { type, text, ts: Date.now() };
    if (type === "review") entry.stars = selectedStars;

    submitBtn.disabled = true;
    backend
      .writeFeedback(d.id, entry)
      .then(() => {
        textField.value = "";
        selectedStars = 0;
        starButtons.forEach((sb) => sb.classList.remove("on"));
        reviewRadio.checked = true;
        updateMode();
      })
      .catch(() => {
        errorEl.textContent = "Não foi possível guardar. Tenta outra vez.";
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });

  wrap.appendChild(form);
  return wrap;
}

function applyRemoteFeedback(remote) {
  feedback = remote || {};
  feedbackLists.forEach((_, dayId) => renderFeedbackList(dayId));
  if (openPanelDay) updatePanelSuggestions();
}

/* =========================================================
   Painel de detalhe do dia
   ========================================================= */

function buildSuggestionsSection(d) {
  if ((menus[d.id] || "").trim()) return null;

  const recs = Object.values(feedback[d.id] || {}).filter(
    (e) => e.type === "recommendation" && e.text
  );
  const hasHistory = getMenuIndex().size > 0;
  if (!recs.length && !hasHistory) return null;

  const wrap = document.createElement("div");
  wrap.className = "suggestions";

  const title = document.createElement("h3");
  title.className = "suggestions-title";
  title.textContent = "Sugestões";
  wrap.appendChild(title);

  if (hasHistory) {
    const roleta = document.createElement("button");
    roleta.type = "button";
    roleta.className = "suggestion-use roleta-btn";
    roleta.textContent = "Sem ideias? Sugerir um prato do histórico";
    roleta.addEventListener("click", () => {
      const pick = pickRoletaDish();
      if (pick) fillMenu(d.id, pick.display);
    });
    wrap.appendChild(roleta);
  }

  if (!recs.length) return wrap;

  const list = document.createElement("ul");
  list.className = "suggestions-list";

  recs.forEach((rec) => {
    const li = document.createElement("li");
    li.className = "suggestion-item";

    const txt = document.createElement("span");
    txt.className = "suggestion-text";
    txt.textContent = rec.text;

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "suggestion-use";
    useBtn.textContent = "Usar esta sugestão";
    useBtn.addEventListener("click", () => {
      const ta = textareas.get(d.id);
      if (!ta) return;
      ta.value = rec.text;
      autoGrow(ta);
      queueWrite(d.id, ta.value);
      updatePanelSuggestions();
    });

    li.append(txt, useBtn);
    list.appendChild(li);
  });

  wrap.appendChild(list);
  return wrap;
}

function updatePanelSuggestions() {
  if (!openPanelDay) return;
  const d = DAYS.find((day) => day.id === openPanelDay.dayId);
  if (!d) return;

  if (openPanelDay.suggestionsEl) {
    openPanelDay.suggestionsEl.remove();
    openPanelDay.suggestionsEl = null;
  }

  const suggestions = buildSuggestionsSection(d);
  if (suggestions) {
    openPanelDay.sheet.insertBefore(suggestions, openPanelDay.sections.menu);
    openPanelDay.suggestionsEl = suggestions;
  }
}

function openDayPanel(d, card) {
  if (openPanelDay && openPanelDay.dayId === d.id) return;
  if (openPanelDay) closeDayPanel();

  const attendanceEl = card.querySelector(".attendance");
  const menuEl = card.querySelector(".menu");
  const feedbackEl = card.querySelector(".feedback");

  const p = PEOPLE[d.who] || { name: "?", color: "#999999" };
  $panel.replaceChildren();

  const backdrop = document.createElement("div");
  backdrop.className = "panel-backdrop";
  backdrop.addEventListener("click", closeDayPanel);

  const sheet = document.createElement("div");
  sheet.className = "panel-sheet";
  sheet.style.setProperty("--c", p.color);

  const head = document.createElement("div");
  head.className = "panel-head";
  head.innerHTML =
    '<div class="panel-day">' +
      '<div class="num">' + d.num + "</div>" +
      '<div class="wd">' + d.wd + "</div>" +
      '<div class="cook"><span class="dot"></span>' + p.name + "</div>" +
    "</div>";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "panel-close";
  closeBtn.setAttribute("aria-label", "Fechar");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeDayPanel);
  head.appendChild(closeBtn);

  sheet.appendChild(head);
  sheet.appendChild(attendanceEl);

  const suggestionsEl = buildSuggestionsSection(d);
  if (suggestionsEl) sheet.appendChild(suggestionsEl);

  sheet.appendChild(menuEl);
  sheet.appendChild(feedbackEl);

  $panel.append(backdrop, sheet);
  $panel.hidden = false;
  card.classList.add("panel-source");

  openPanelDay = {
    dayId: d.id,
    card,
    sheet,
    sections: { attendance: attendanceEl, menu: menuEl, feedback: feedbackEl },
    suggestionsEl
  };

  const ta = textareas.get(d.id);
  if (ta) requestAnimationFrame(() => autoGrow(ta));
}

function closeDayPanel() {
  if (!openPanelDay) return;
  const { card, sections } = openPanelDay;

  card.insertBefore(sections.attendance, card.querySelector(".menu"));
  card.insertBefore(sections.menu, card.querySelector(".feedback"));
  card.appendChild(sections.feedback);

  card.classList.remove("panel-source");
  $panel.hidden = true;
  $panel.replaceChildren();
  openPanelDay = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (openPanelDay) closeDayPanel();
  if (!$adminPanel.hidden) closeAdminPanel();
});

function renderWeeks() {
  const host = document.getElementById("weeks");
  host.replaceChildren();
  textareas.clear();
  feedbackLists.clear();
  attendanceBadges.clear();
  attendanceControls.clear();
  menuChipEls.clear();
  const today = todayId();

  for (let from = 0; from < DAYS.length; from += 7) {
    const to = Math.min(from + 7, DAYS.length);
    const sec = document.createElement("section");
    sec.className = "week";

    const label = document.createElement("h2");
    label.className = "week-label";
    label.textContent = "Semana " + (from / 7 + 1) + " · " + DAYS[from].num + "–" + DAYS[to - 1].num;
    sec.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "grid";
    DAYS.slice(from, to).forEach((d) => grid.appendChild(buildCard(d, today)));

    sec.appendChild(grid);
    host.appendChild(sec);
  }

  applyFilter();
}

/* Atualiza os campos quando chegam alterações de outra pessoa,
   sem mexer no campo que está a ser escrito neste momento. */
function applyRemote(remote) {
  menus = remote || {};
  textareas.forEach((ta, dayId) => {
    const incoming = menus[dayId] || "";
    if (ta === document.activeElement || ta.value === incoming) return;
    ta.value = incoming;
    autoGrow(ta);
  });
  if (openPanelDay) updatePanelSuggestions();
}

/* =========================================================
   Escrita com debounce
   ========================================================= */

const timers = new Map();

function queueWrite(dayId, value) {
  menus[dayId] = value;
  setStatus("A guardar…", "saving");
  clearTimeout(timers.get(dayId));
  timers.set(
    dayId,
    setTimeout(async () => {
      try {
        await backend.write(dayId, value);
        setStatus(
          "Guardado às " +
            new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
        );
      } catch (e) {
        setStatus("Não foi possível guardar. Escreve outra vez para tentar de novo.", "error");
      }
    }, 600)
  );
}

/* =========================================================
   Copiar para o grupo
   ========================================================= */

document.getElementById("copy").addEventListener("click", async () => {
  const period = scheduleConfig.period;
  let out =
    "👨‍🍳 ESCALA DE JANTARES" +
    (period ? " (" + formatDatePt(period.startDate) + " a " + formatDatePt(period.endDate) + ")" : "") +
    " 🍽️\n\n";

  DAYS.forEach((d) => {
    const m = (menus[d.id] || "").trim().replace(/\n+/g, " / ");
    const cookName = (PEOPLE[d.who] && PEOPLE[d.who].name) || "?";
    out += "📅 " + d.num + "/" + d.id.split("-")[1] + " (" + SHORT_WD[d.wd] + ") — " + cookName + "\n";
    out += "🍽️ Ementa: " + m + "\n";

    const entries = Object.values(feedback[d.id] || {});
    const reviews = entries.filter((e) => e.type === "review");
    const recs = entries.filter((e) => e.type === "recommendation");
    if (reviews.length || recs.length) {
      const parts = [];
      if (reviews.length) {
        const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
        parts.push("⭐ " + avg.toFixed(1) + " (" + reviews.length + ")");
      }
      if (recs.length) {
        parts.push(recs.length + (recs.length > 1 ? " recomendações" : " recomendação"));
      }
      out += parts.join(" · ") + "\n";
    }
    out += "👥 " + computeDayTotal(d.id) + " pessoas\n\n";
  });
  try {
    await navigator.clipboard.writeText(out.trim());
    setStatus("Escala copiada. Já podes colar no grupo.");
  } catch {
    setStatus("O copiar falhou. Seleciona o texto do quadro à mão.", "error");
  }
});

/* =========================================================
   Histórico de ementas (autocomplete + roleta)
   ========================================================= */

const menuChipEls = new Map(); // dayId -> contentor dos chips

function applyRemoteAllMenus(remote) {
  allMenus = remote || {};
  menuIndex = null;
}

function applyRemoteAllReviews(remote) {
  allReviews = remote || {};
  menuIndex = null;
}

function getMenuIndex() {
  if (menuIndex) return menuIndex;
  menuIndex = new Map();
  Object.entries(allMenus).forEach(([periodo, days]) => {
    Object.entries(days || {}).forEach(([dayId, text]) => {
      const display = String(text || "").trim();
      if (!display) return;
      const norm = display.toLowerCase();
      let entry = menuIndex.get(norm);
      if (!entry) {
        entry = { display, lastDate: dayId, starSum: 0, starCount: 0 };
        menuIndex.set(norm, entry);
      }
      if (dayId >= entry.lastDate) {
        entry.lastDate = dayId;
        entry.display = display;
      }
      const dayReviews = (allReviews[periodo] || {})[dayId];
      if (dayReviews) {
        Object.values(dayReviews).forEach((r) => {
          if (r.type === "review" && r.stars) {
            entry.starSum += r.stars;
            entry.starCount++;
          }
        });
      }
    });
  });
  return menuIndex;
}

function fillMenu(dayId, text) {
  const ta = textareas.get(dayId);
  if (!ta) return;
  ta.value = text;
  autoGrow(ta);
  queueWrite(dayId, text);
  renderMenuChips(dayId);
  if (openPanelDay && openPanelDay.dayId === dayId) updatePanelSuggestions();
}

function renderMenuChips(dayId) {
  const host = menuChipEls.get(dayId);
  const ta = textareas.get(dayId);
  if (!host || !ta) return;

  const q = ta.value.trim().toLowerCase();
  let entries = [...getMenuIndex().values()];
  if (q) {
    entries = entries.filter(
      (e) => e.display.toLowerCase().includes(q) && e.display.toLowerCase() !== q
    );
  }
  entries.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  entries = entries.slice(0, 6);

  host.replaceChildren();
  entries.forEach((e) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "menu-chip";
    b.textContent = e.display;
    b.addEventListener("mousedown", (ev) => ev.preventDefault());
    b.addEventListener("click", () => fillMenu(dayId, e.display));
    host.appendChild(b);
  });
}

function pickRoletaDish() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);
  const cutoff = [
    cutoffDate.getFullYear(),
    String(cutoffDate.getMonth() + 1).padStart(2, "0"),
    String(cutoffDate.getDate()).padStart(2, "0")
  ].join("-");

  const all = [...getMenuIndex().values()];
  if (!all.length) return null;
  const rested = all.filter((e) => e.lastDate < cutoff);
  const pool = rested.length ? rested : all;

  pool.sort((a, b) => {
    const sa = a.starCount ? a.starSum / a.starCount : 3;
    const sb = b.starCount ? b.starSum / b.starCount : 3;
    if (sb !== sa) return sb - sa;
    return a.lastDate.localeCompare(b.lastDate);
  });
  const top = pool.slice(0, 5);
  return top[Math.floor(Math.random() * top.length)];
}

/* =========================================================
   Tabs (Escala / Lista de compras)
   ========================================================= */

function setActiveTab(tab) {
  if (tab === activeTab) return;
  activeTab = tab;

  if (openPanelDay) closeDayPanel();
  if (!$adminPanel.hidden) closeAdminPanel();

  $viewEscala.hidden = tab !== "escala";
  $viewCompras.hidden = tab !== "compras";
  $tabEscala.setAttribute("aria-selected", tab === "escala" ? "true" : "false");
  $tabCompras.setAttribute("aria-selected", tab === "compras" ? "true" : "false");
}

$tabEscala.addEventListener("click", () => setActiveTab("escala"));
$tabCompras.addEventListener("click", () => setActiveTab("compras"));

/* =========================================================
   Listas de compras
   ========================================================= */

const shopListEls = new Map(); // listId -> { card, nameEl, itemsUl }

function buildShopListCard(listId) {
  const card = document.createElement("article");
  card.className = "shop-list";

  const nameEl = document.createElement("h3");
  nameEl.className = "shop-list-name";
  card.appendChild(nameEl);

  const itemsUl = document.createElement("ul");
  itemsUl.className = "shop-items";
  card.appendChild(itemsUl);

  const form = document.createElement("form");
  form.className = "shop-add";

  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 200;
  input.placeholder = "Adicionar item";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "shop-add-btn";
  btn.textContent = "Adicionar";

  form.append(input, btn);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    btn.disabled = true;
    backend
      .addShoppingItem(listId, name)
      .then(() => {
        input.value = "";
      })
      .catch(() => setStatus("Não foi possível adicionar o item.", "error"))
      .finally(() => {
        btn.disabled = false;
        input.focus();
      });
  });
  card.appendChild(form);

  return { card, nameEl, itemsUl };
}

function renderShopItems(listId) {
  const els = shopListEls.get(listId);
  if (!els) return;

  const items = Object.entries((shoppingLists[listId] || {}).items || {}).sort(
    (a, b) => (a[1].ts || 0) - (b[1].ts || 0)
  );
  els.itemsUl.replaceChildren();

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "shop-empty-item";
    li.textContent = "Ainda sem itens.";
    els.itemsUl.appendChild(li);
    return;
  }

  items.forEach(([itemId, item]) => {
    const li = document.createElement("li");
    li.className = "shop-item" + (item.done ? " done" : "");

    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!item.done;
    cb.addEventListener("change", () => {
      backend
        .setShoppingItemDone(listId, itemId, cb.checked)
        .catch(() => setStatus("Não foi possível guardar o item.", "error"));
    });

    const span = document.createElement("span");
    span.textContent = item.name;

    label.append(cb, span);
    li.appendChild(label);
    els.itemsUl.appendChild(li);
  });
}

/* Re-render incremental: os cartões e formulários existentes mantêm o DOM
   (não se perde texto a meio de escrita); só as listas de itens reconstroem. */
function renderShoppingLists() {
  const entries = Object.entries(shoppingLists).sort(
    (a, b) => (b[1].ts || 0) - (a[1].ts || 0)
  );

  shopListEls.forEach((els, listId) => {
    if (!shoppingLists[listId]) {
      els.card.remove();
      shopListEls.delete(listId);
    }
  });

  $shopEmpty.hidden = entries.length > 0;

  entries.forEach(([listId, list], idx) => {
    let els = shopListEls.get(listId);
    if (!els) {
      els = buildShopListCard(listId);
      shopListEls.set(listId, els);
    }
    els.nameEl.textContent = list.name || "";
    renderShopItems(listId);

    const inPlace = $shopLists.children[idx];
    if (inPlace !== els.card) $shopLists.insertBefore(els.card, inPlace || null);
  });
}

function applyRemoteShoppingLists(remote) {
  shoppingLists = remote || {};
  renderShoppingLists();
}

document.getElementById("shop-create").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("shop-create-name");
  const name = input.value.trim();
  if (!name) return;

  const btn = e.target.querySelector("button");
  btn.disabled = true;
  backend
    .createShoppingList(name)
    .then(() => {
      input.value = "";
    })
    .catch(() => setStatus("Não foi possível criar a lista.", "error"))
    .finally(() => {
      btn.disabled = false;
    });
});

/* =========================================================
   Arranque
   ========================================================= */

/* Quem faz login pela PRIMEIRA vez entra automaticamente na rotação
   (só quando já existe uma escala configurada). Logins seguintes não
   re-inscrevem — senão remover um cozinheiro na administração seria
   revertido pela sessão aberta do removido. */
let selfEnrollPending = false;
let enrollingSelf = false;

function enrollSelfAsCook() {
  if (!selfEnrollPending || enrollingSelf) return;
  const cooks = scheduleConfig.cooks;
  if (!cooks || !cooks.order || !cooks.order.length) return;
  if (cooks.order.includes(currentUser.uid)) {
    selfEnrollPending = false;
    return;
  }
  enrollingSelf = true;
  backend
    .writeCooks({ order: cooks.order.concat(currentUser.uid), ts: Date.now() })
    .then(() => {
      selfEnrollPending = false;
    })
    .catch(() => {})
    .finally(() => {
      enrollingSelf = false;
    });
}

function startApp() {
  $gate.hidden = true;
  renderScheduleMessage("A carregar…");

  $session.textContent = "A usar como " + currentUser.name;
  $note.textContent =
    "As ementas, reviews e presenças ficam guardadas e sincronizam em tempo real.";

  const onLoadError = (err) => {
    renderScheduleMessage(
      "Não foi possível carregar a escala",
      "Erro: " + (err && err.code ? err.code : "desconhecido") + ". Recarrega a página para tentar de novo."
    );
  };

  backend.startProfiles((remote) => {
    applyRemoteProfiles(remote);
    regenerateSchedule();
  }, onLoadError);

  backend.startShoppingLists(applyRemoteShoppingLists);
  backend.startMenuHistory(applyRemoteAllMenus, applyRemoteAllReviews);

  backend.startConfig(
    (periodConfig) => {
      scheduleConfig.period = periodConfig;
      regenerateSchedule();
    },
    (cooksConfig) => {
      scheduleConfig.cooks = cooksConfig;
      enrollSelfAsCook();
      regenerateSchedule();
    },
    onLoadError
  );

  setStatus("");
}

async function boot() {
  if (!isConfigured()) {
    renderGateError("Falta configurar o Firebase — pede a quem administra o site para preencher as credenciais.");
    return;
  }

  let app, authMod, dbMod;
  try {
    const [{ initializeApp }, aMod, dMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
    ]);
    authMod = aMod;
    dbMod = dMod;
    app = initializeApp(firebaseConfig);
  } catch (e) {
    renderGateError("Não foi possível ligar ao Firebase.");
    return;
  }

  const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } = authMod;
  const { getDatabase, ref, onValue, update, push, set, get } = dbMod;

  const auth = getAuth(app);
  const db = getDatabase(app);
  backend = makeBackend(db, { ref, onValue, update, push, set, get });

  function attemptLogin() {
    renderGateLogin(async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (e) {
        renderGateError("O login falhou. Tenta outra vez.", attemptLogin);
      }
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      currentUser = null;
      attemptLogin();
      return;
    }

    const googleInfo = (user.providerData || []).find((p) => p && p.providerId === "google.com");
    const authName =
      user.displayName ||
      (googleInfo && googleInfo.displayName) ||
      user.email ||
      (googleInfo && googleInfo.email) ||
      null;
    currentUser = { uid: user.uid, name: authName || "Conta Google" };

    let profile;
    try {
      profile = await backend.readProfile(user.uid);
    } catch (e) {
      renderGateError("Não foi possível ligar à base de dados.");
      return;
    }

    /* O nome guardado no primeiro login pode ter ficado "Conta Google"
       (o displayName ainda não estava disponível). Corrige-o em cada login. */
    if (profile && authName && profile.name !== authName) {
      const healed = { name: authName, householdSize: profile.householdSize, ts: Date.now() };
      try {
        await backend.writeProfile(user.uid, healed);
        profile = healed;
      } catch (e) {
        // se falhar, segue com o nome antigo
      }
    }

    if (!profile) {
      const askForProfile = () => renderProfilePrompt(currentUser.name, submitProfile);

      async function submitProfile(householdSize) {
        const newProfile = {
          name: currentUser.name,
          householdSize,
          ts: Date.now()
        };
        try {
          await backend.writeProfile(user.uid, newProfile);
        } catch (e) {
          renderGateError("Não foi possível guardar o teu perfil. Tenta outra vez.", askForProfile);
          return;
        }
        profiles[user.uid] = newProfile;
        selfEnrollPending = true;
        startApp();
      }

      askForProfile();
      return;
    }

    profiles[user.uid] = profile;
    startApp();
  });
}

boot();

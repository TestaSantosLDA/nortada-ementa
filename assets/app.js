import { firebaseConfig, DB_PATH } from "./firebase-config.js";

/* =========================================================
   Dados da escala
   ========================================================= */

const PEOPLE = {
  francisco: { name: "Francisco", color: "var(--francisco)" },
  luis:      { name: "Luís",      color: "var(--luis)" },
  afonso:    { name: "Afonso",    color: "var(--afonso)" },
  ines:      { name: "Inês",      color: "var(--ines)" },
  joao:      { name: "João",      color: "var(--joao)" }
};

const DAYS = [
  { id: "2026-08-01", num: "01", wd: "Sábado",  who: "francisco" },
  { id: "2026-08-02", num: "02", wd: "Domingo", who: "luis" },
  { id: "2026-08-03", num: "03", wd: "Segunda", who: "afonso" },
  { id: "2026-08-04", num: "04", wd: "Terça",   who: "ines" },
  { id: "2026-08-05", num: "05", wd: "Quarta",  who: "joao" },
  { id: "2026-08-06", num: "06", wd: "Quinta",  who: "luis" },
  { id: "2026-08-07", num: "07", wd: "Sexta",   who: "francisco" },
  { id: "2026-08-08", num: "08", wd: "Sábado",  who: "ines" },
  { id: "2026-08-09", num: "09", wd: "Domingo", who: "joao" },
  { id: "2026-08-10", num: "10", wd: "Segunda", who: "afonso" },
  { id: "2026-08-11", num: "11", wd: "Terça",   who: "francisco" },
  { id: "2026-08-12", num: "12", wd: "Quarta",  who: "luis" },
  { id: "2026-08-13", num: "13", wd: "Quinta",  who: "ines" },
  { id: "2026-08-14", num: "14", wd: "Sexta",   who: "joao" }
];

const SHORT_WD = {
  "Sábado": "Sáb", "Domingo": "Dom", "Segunda": "Seg",
  "Terça": "Ter", "Quarta": "Qua", "Quinta": "Qui", "Sexta": "Sex"
};

const LOCAL_KEY = "nortada-ementa-2026-08";
const MAX_LEN = 500;

/* =========================================================
   Estado
   ========================================================= */

let menus = {};                 // { "2026-08-01": "Bacalhau à Brás", ... }
let filter = null;              // pessoa selecionada, ou null
let backend = null;             // preenchido no arranque
const textareas = new Map();    // dayId -> elemento

const $status = document.getElementById("status");
const $note = document.getElementById("mode-note");

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

/* =========================================================
   Backends de persistência
   ========================================================= */

function localBackend() {
  return {
    label: "local",
    async start(onRemote) {
      try {
        menus = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
      } catch {
        menus = {};
      }
      onRemote(menus);
    },
    async write(dayId, value) {
      menus[dayId] = value;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(menus));
    }
  };
}

async function firebaseBackend() {
  const [{ initializeApp }, { getAuth, signInAnonymously }, dbMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
  ]);
  const { getDatabase, ref, onValue, update } = dbMod;

  const app = initializeApp(firebaseConfig);
  await signInAnonymously(getAuth(app));

  const db = getDatabase(app);
  const node = ref(db, DB_PATH);

  return {
    label: "firebase",
    async start(onRemote) {
      onValue(
        node,
        (snap) => onRemote(snap.val() || {}),
        (err) => setStatus("Sem ligação à base de dados: " + err.code, "error")
      );
    },
    async write(dayId, value) {
      await update(node, { [dayId]: value });
    }
  };
}

function isConfigured() {
  return !String(firebaseConfig.apiKey || "").includes("COLOCAR_AQUI");
}

/* =========================================================
   Render
   ========================================================= */

function renderPeople() {
  const counts = {};
  DAYS.forEach((d) => (counts[d.who] = (counts[d.who] || 0) + 1));

  const nav = document.getElementById("people");
  nav.replaceChildren();

  Object.entries(PEOPLE).forEach(([key, p]) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.style.setProperty("--c", p.color);
    b.setAttribute("aria-pressed", filter === key ? "true" : "false");

    const dot = document.createElement("span");
    dot.className = "dot";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = counts[key] + "\u00D7";

    b.append(dot, document.createTextNode(p.name), n);
    b.addEventListener("click", () => {
      filter = filter === key ? null : key;
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
  const p = PEOPLE[d.who];
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
  });

  textareas.set(d.id, ta);
  requestAnimationFrame(() => autoGrow(ta));
  return card;
}

function renderWeeks() {
  const host = document.getElementById("weeks");
  host.replaceChildren();
  textareas.clear();
  const today = todayId();

  [[0, 7], [7, 14]].forEach(([from, to], i) => {
    const sec = document.createElement("section");
    sec.className = "week";

    const label = document.createElement("h2");
    label.className = "week-label";
    label.textContent =
      "Semana " + (i + 1) + " · " + DAYS[from].num + "\u2013" + DAYS[to - 1].num + " agosto";
    sec.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "grid";
    DAYS.slice(from, to).forEach((d) => grid.appendChild(buildCard(d, today)));

    sec.appendChild(grid);
    host.appendChild(sec);
  });

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
}

/* =========================================================
   Escrita com debounce
   ========================================================= */

const timers = new Map();

function queueWrite(dayId, value) {
  menus[dayId] = value;
  setStatus("A guardar\u2026", "saving");
  clearTimeout(timers.get(dayId));
  timers.set(
    dayId,
    setTimeout(async () => {
      try {
        await backend.write(dayId, value);
        setStatus(
          "Guardado \u00E0s " +
            new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
        );
      } catch (e) {
        setStatus("N\u00E3o foi poss\u00EDvel guardar. Escreve outra vez para tentar de novo.", "error");
      }
    }, 600)
  );
}

/* =========================================================
   Copiar para o grupo
   ========================================================= */

document.getElementById("copy").addEventListener("click", async () => {
  let out = "\uD83D\uDC68\u200D\uD83C\uDF73 ESCALA DE JANTARES (1 a 14 de Agosto) \uD83C\uDF7D\uFE0F\n\n";
  DAYS.forEach((d) => {
    const m = (menus[d.id] || "").trim().replace(/\n+/g, " / ");
    out += "\uD83D\uDCC5 " + d.num + "/08 (" + SHORT_WD[d.wd] + ") \u2014 " + PEOPLE[d.who].name + "\n";
    out += "\uD83C\uDF7D\uFE0F Ementa: " + m + "\n\n";
  });
  try {
    await navigator.clipboard.writeText(out.trim());
    setStatus("Escala copiada. J\u00E1 podes colar no grupo.");
  } catch {
    setStatus("O copiar falhou. Seleciona o texto do quadro \u00E0 m\u00E3o.", "error");
  }
});

/* =========================================================
   Arranque
   ========================================================= */

async function boot() {
  renderPeople();
  renderWeeks();

  if (isConfigured()) {
    setStatus("A ligar\u2026");
    try {
      backend = await firebaseBackend();
      $note.textContent = "As ementas ficam guardadas e aparecem a toda a gente em tempo real.";
    } catch (e) {
      backend = localBackend();
      $note.textContent =
        "Falhou a liga\u00E7\u00E3o \u00E0 base de dados \u2014 as ementas ficam s\u00F3 neste dispositivo.";
    }
  } else {
    backend = localBackend();
    $note.textContent =
      "Falta configurar o Firebase \u2014 por agora as ementas ficam s\u00F3 neste dispositivo.";
  }

  await backend.start(applyRemote);
  setStatus("");
}

boot();

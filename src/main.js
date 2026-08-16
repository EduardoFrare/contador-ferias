import confetti from 'canvas-confetti';

// ==========================================================================
// CONSTANTS & INITIAL CONFIGURATION
// ==========================================================================

// Default target: 02/09/2026 at 14:00:00
const DEFAULT_VACATION_START = new Date('2026-08-15T23:00:00').getTime();
const DEFAULT_TARGET_DATE = new Date('2026-09-02T14:00:00').getTime();

let vacationStart = DEFAULT_VACATION_START;
let targetDate = getSavedTargetDate();

// Array of funny corporate survival quotes
const FUNNY_QUOTES = [
  "Se o servidor cair ou o sistema der erro, responda no grupo: 'Excelente ponto, vou validar isso assim que o Duduzinho voltar!'",
  "Dica de ouro: Se perguntarem sobre o relatório, diga que 'está em fase final de alinhamento com o Duduzinho'.",
  "Respire fundo: O Duduzinho tá na praia tomando água de coco enquanto você tenta entender a planilha dele.",
  "Se a bomba estourar, coloque a culpa no estagiário ou diga que foi instabilidade na nuvem.",
  "Lembre-se: 'Tá no meu radar' é a resposta universal para absolutamente qualquer cobrança durante as férias do chefe.",
  "Mantenha a calma e um café na mão: faltam poucos dias para a salvação da equipe!",
  "Na dúvida sobre como resolver um bug? Diga que prefere esperar o parecer técnico do Duduzinho dia 02/09 às 14h.",
  "Se alguém chamar para reunião presencial de emergência, finja queda de energia instantânea.",
  "Regra das férias: Se a conversa durar mais de 3 minutos, mande um emoji de 'joinha' e saia devagar."
];

// Initial Sticky Notes if none exist
const DEFAULT_NOTES = [
  { id: 1, author: "Dev Desesperado 💻", text: "Duduzinho, pelo amor de Deus, não esquece de trazer alfajor e paciência!" },
  { id: 2, author: "Suporte TI ☕", text: "Estamos sobrevivendo a base de café requentado e oração. Volta logo!" },
  { id: 3, author: "Atendimento 📞", text: "Já falei 'o Duduzinho tá no projeto externo' umas 40 vezes hoje!" }
];

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const displayTargetDateEl = document.getElementById('displayTargetDate');
const funnySubtitleEl = document.getElementById('funnySubtitle');
const progressFillEl = document.getElementById('progressFill');
const progressPercentEl = document.getElementById('progressPercent');

const coffeeCounterEl = document.getElementById('coffeeCounter');
const batteryPercentEl = document.getElementById('batteryPercent');
const batteryFillEl = document.getElementById('batteryFill');
const batteryStatusEl = document.getElementById('batteryStatus');
const meetingsCounterEl = document.getElementById('meetingsCounter');

const panicBtn = document.getElementById('panicBtn');
const excelOverlay = document.getElementById('excelOverlay');
const closeExcelBtn = document.getElementById('closeExcelBtn');

const adviceQuoteEl = document.getElementById('adviceQuote');
const newAdviceBtn = document.getElementById('newAdviceBtn');

const noteForm = document.getElementById('noteForm');
const noteAuthorInput = document.getElementById('noteAuthor');
const noteTextInput = document.getElementById('noteText');
const notesGridEl = document.getElementById('notesGrid');

const configBtn = document.getElementById('configBtn');
const configModal = document.getElementById('configModal');
const closeConfigBtn = document.getElementById('closeConfigBtn');
const inputTargetDate = document.getElementById('inputTargetDate');
const saveDateBtn = document.getElementById('saveDateBtn');
const resetDateBtn = document.getElementById('resetDateBtn');

let timerInterval = null;
let celebrationTriggered = false;

// ==========================================================================
// INIT APP
// ==========================================================================
function init() {
  updateDisplayTargetDateText();
  startCountdown();
  initQuotes();
  initNotes();
  initEventListeners();
  updateSurvivalStats();
}

// Get saved date or fallback to default
function getSavedTargetDate() {
  const saved = localStorage.getItem('duduzinho_target_date');
  if (saved) {
    const parsed = new Date(saved).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return DEFAULT_TARGET_DATE;
}

function updateDisplayTargetDateText() {
  const dateObj = new Date(targetDate);
  const formatted = dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  displayTargetDateEl.textContent = `${formatted}`;
}

// ==========================================================================
// COUNTDOWN ENGINE
// ==========================================================================
function startCountdown() {
  if (timerInterval) clearInterval(timerInterval);

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      // TIME IS UP!
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';

      progressFillEl.style.width = '100%';
      progressPercentEl.textContent = '100%';

      funnySubtitleEl.textContent = "🎉 O DUDUZINHO VOLTOU! PODEM SOLTAR OS FOGOS E OS REQUISITOS! 🎉";
      
      if (!celebrationTriggered) {
        celebrationTriggered = true;
        triggerCelebration();
      }
      return;
    }

    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    // Progress percentage
    const totalDuration = targetDate - vacationStart;
    const elapsed = now - vacationStart;
    let percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    progressFillEl.style.width = `${percentage.toFixed(1)}%`;
    progressPercentEl.textContent = `${percentage.toFixed(1)}%`;

    // Dynamic funny subtitle based on days left
    updateFunnySubtitle(days);
    
    // Dynamic Coffee & Battery Stats
    updateSurvivalStats(elapsed, distance);
  }

  update();
  timerInterval = setInterval(update, 1000);
}

function updateFunnySubtitle(days) {
  if (days > 10) {
    funnySubtitleEl.textContent = '"Ainda no começo da maratona... O café é nosso melhor amigo!" 🏖️';
  } else if (days > 5) {
    funnySubtitleEl.textContent = '"Metade do caminho percorrido! Ninguém surtou gravemente ainda." ☕';
  } else if (days > 2) {
    funnySubtitleEl.textContent = '"Reta final! Limpem os teclados e finjam que os relatórios estão em dia!" 🚀';
  } else if (days >= 0) {
    funnySubtitleEl.textContent = '🚨 "CÓDIGO VERMELHO: O DUDUZINHO ESTÁ CHEGANDO! ARRUMEM A MESA!" 🚨';
  }
}

// Dynamic Coffee and Emotional Battery stats update
function updateSurvivalStats(elapsed = 0, distance = 0) {
  // Coffee consumed calculation (base ~120 + 1 cup per 15 minutes of vacation elapsed)
  const cups = Math.max(142, Math.floor(142 + (elapsed / (1000 * 60 * 15))));
  coffeeCounterEl.textContent = cups.toLocaleString('pt-BR');

  // Battery status logic based on time left
  const totalDays = 17;
  const daysLeft = distance / (1000 * 60 * 60 * 24);
  let battery = Math.max(10, Math.min(99, Math.round((1 - (daysLeft / totalDays)) * 80 + 15)));
  
  batteryPercentEl.textContent = `${battery}%`;
  batteryFillEl.style.width = `${battery}%`;

  if (battery > 70) {
    batteryStatusEl.textContent = '"Com luz no fim do túnel e ânimo renovado!"';
  } else if (battery > 40) {
    batteryStatusEl.textContent = '"Sobrevivendo à base de fé, chá e memes"';
  } else {
    batteryStatusEl.textContent = '"Bateria fraca... Socorro, quem tem o acesso root?"';
  }

  // Meetings avoided calculation
  const avoided = Math.max(28, Math.floor(28 + (elapsed / (1000 * 60 * 60 * 6))));
  meetingsCounterEl.textContent = avoided;
}

// Celebration confetti
function triggerCelebration() {
  const duration = 5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ==========================================================================
// FUNNY ADVICE QUOTES
// ==========================================================================
function initQuotes() {
  getRandomQuote();
}

function getRandomQuote() {
  const index = Math.floor(Math.random() * FUNNY_QUOTES.length);
  adviceQuoteEl.textContent = `"${FUNNY_QUOTES[index]}"`;
}

// ==========================================================================
// STICKY NOTES CRUD
// ==========================================================================
function initNotes() {
  const savedNotes = localStorage.getItem('duduzinho_notes');
  let notes = savedNotes ? JSON.parse(savedNotes) : DEFAULT_NOTES;
  renderNotes(notes);
}

function renderNotes(notes) {
  notesGridEl.innerHTML = '';
  notes.forEach((note) => {
    const div = document.createElement('div');
    div.className = 'sticky-note';
    div.innerHTML = `
      <div class="sticky-content">"${escapeHtml(note.text)}"</div>
      <div class="sticky-author">- ${escapeHtml(note.author)}</div>
    `;
    notesGridEl.appendChild(div);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ==========================================================================
// EVENT LISTENERS & MODALS
// ==========================================================================
function initEventListeners() {
  // Quote generator
  newAdviceBtn.addEventListener('click', getRandomQuote);

  // Sticky Notes submit
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const author = noteAuthorInput.value.trim();
    const text = noteTextInput.value.trim();

    if (!author || !text) return;

    const savedNotes = localStorage.getItem('duduzinho_notes');
    let notes = savedNotes ? JSON.parse(savedNotes) : [...DEFAULT_NOTES];

    notes.unshift({ id: Date.now(), author, text });
    localStorage.setItem('duduzinho_notes', JSON.stringify(notes));
    
    renderNotes(notes);
    noteAuthorInput.value = '';
    noteTextInput.value = '';
  });

  // Panic Button (Mode Excel)
  panicBtn.addEventListener('click', () => {
    excelOverlay.classList.remove('hidden');
  });

  closeExcelBtn.addEventListener('click', () => {
    excelOverlay.classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      excelOverlay.classList.add('hidden');
      configModal.classList.add('hidden');
    }
  });

  // Config Modal
  configBtn.addEventListener('click', () => {
    // Format input datetime-local string
    const d = new Date(targetDate);
    const tzOffset = d.getTimezoneOffset() * 60000; // ms
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    inputTargetDate.value = localISOTime;
    configModal.classList.remove('hidden');
  });

  closeConfigBtn.addEventListener('click', () => {
    configModal.classList.add('hidden');
  });

  saveDateBtn.addEventListener('click', () => {
    const val = inputTargetDate.value;
    if (val) {
      const newTime = new Date(val).getTime();
      if (!isNaN(newTime)) {
        targetDate = newTime;
        localStorage.setItem('duduzinho_target_date', new Date(newTime).toISOString());
        celebrationTriggered = false;
        updateDisplayTargetDateText();
        startCountdown();
        configModal.classList.add('hidden');
      }
    }
  });

  resetDateBtn.addEventListener('click', () => {
    targetDate = DEFAULT_TARGET_DATE;
    localStorage.removeItem('duduzinho_target_date');
    celebrationTriggered = false;
    updateDisplayTargetDateText();
    startCountdown();
    configModal.classList.add('hidden');
  });
}

// Run app
init();

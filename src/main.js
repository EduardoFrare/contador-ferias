import confetti from 'canvas-confetti';

// ==========================================================================
// CONSTANTS & INITIAL CONFIGURATION
// ==========================================================================

// Default target: 02/09/2026 at 14:00:00
const DEFAULT_VACATION_START = new Date('2026-08-15T23:00:00').getTime();
const DEFAULT_TARGET_DATE = new Date('2026-09-02T14:00:00').getTime();

let vacationStart = DEFAULT_VACATION_START;
let targetDate = DEFAULT_TARGET_DATE;

// Array of funny corporate survival quotes
const FUNNY_QUOTES = [
  "Se o sistema do cliente cair, responda no ticket: 'Excelente ponto, vou repassar pro nível 3 assim que o Duduzinho voltar!'",
  "Dica de ouro: Se cobrarem o SLA, diga que 'está em análise profunda com o Duduzinho'.",
  "Respire fundo: O Duduzinho tá na praia tomando água de coco enquanto a fila de chamados só cresce.",
  "Se a bomba estourar, coloque a culpa na operadora ou diga que é instabilidade geral.",
  "Lembre-se: 'Já passei pro responsável' é a resposta universal durante as férias do chefe.",
  "Mantenha a calma e um café na mão: faltam poucos dias para a salvação da equipe do suporte!",
  "Na dúvida sobre como resolver o B.O. do cliente? Diga que precisamos da aprovação técnica do Duduzinho dia 02/09 às 14h.",
  "Se um cliente VIP ligar, finja que a ligação tá cortando e desligue.",
  "Regra das férias: Se a call durar mais de 3 minutos, finja queda de internet e abra um ticket.",
  "se vocês pensarem em me ligar, liga pra 190 antes."
];

// Initial Sticky Notes if none exist
const DEFAULT_NOTES = [
  { id: 1, author: "Duduzinho", text: "Lamento por abandonar vocês haha" }
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

// ==========================================================================

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
const API_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a008653f1428a0';

async function initNotes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API error");
    const result = await res.json();
    let notes = result.data?.notes;
    if (!notes || notes.length === 0) {
      notes = DEFAULT_NOTES;
    }
    renderNotes(notes);
  } catch(e) {
    console.error("Erro ao carregar recados da API, usando os padrões locais.", e);
    renderNotes(DEFAULT_NOTES);
  }
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
  noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = noteAuthorInput.value.trim();
    const text = noteTextInput.value.trim();

    if (!author || !text) return;
    
    const newNote = { id: Date.now(), author, text };
    
    // UI Feedback
    const submitBtn = noteForm.querySelector('button');
    const oldText = submitBtn.textContent;
    submitBtn.textContent = 'Salvando...';
    submitBtn.disabled = true;

    try {
      // 1. Busca as notas mais recentes
      const res = await fetch(API_URL);
      const result = await res.json();
      let notes = result.data?.notes || [...DEFAULT_NOTES];
      
      // 2. Adiciona a nova nota no topo
      notes.unshift(newNote);
      
      // 3. Salva de volta na API
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'contador-ferias-notes', data: { notes } })
      });
      
      renderNotes(notes);
      noteAuthorInput.value = '';
      noteTextInput.value = '';
    } catch(e) {
      console.error(e);
      alert("Houve um erro ao salvar o recado para todos. Tente novamente.");
    } finally {
      submitBtn.textContent = oldText;
      submitBtn.disabled = false;
    }
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
    }
  });

}

// Run app
init();

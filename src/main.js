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
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKbNkFXnGlr3e0qRv1cnQTPzETuAFcwBsLctfgZtQoXZnytmRf8iMbTxhHdyzArhr1TSha3pYFj65L/pub?output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScEMMqCwJ8HZvnQKZZyPAtaaGHOiLL6FlEQrH_FfDzfissD5g/formResponse';

async function initNotes() {
  try {
    // 1. Tenta baixar a planilha (com cache buster para evitar cache do navegador)
    const timestamp = Date.now();
    const res = await fetch(`${CSV_URL}&t=${timestamp}`);
    if (!res.ok) throw new Error("Erro ao baixar CSV");
    
    const text = await res.text();
    const rows = parseCSV(text);
    
    // As linhas vêm como: [Data/Hora, Autor, Texto]
    // Ignoramos o cabeçalho (i=1 em diante)
    let notes = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 3) {
        notes.push({ id: i, author: row[1], text: row[2] });
      }
    }
    
    // Invertemos para os mais novos aparecerem primeiro
    notes.reverse();

    if (notes.length === 0) {
      notes = DEFAULT_NOTES;
    }
    
    renderNotes(notes);
  } catch(e) {
    console.error("Erro ao carregar recados da planilha, usando padrões.", e);
    renderNotes(DEFAULT_NOTES);
  }
}

// Pequeno parser de CSV para lidar com quebras de linha e aspas no Google Sheets
function parseCSV(str) {
  const result = [];
  let row = [];
  let col = "";
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inQuotes) {
      if (char === '"') {
        if (str[i + 1] === '"') { col += '"'; i++; }
        else inQuotes = false;
      } else col += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(col.trim()); col = ""; }
      else if (char === '\n') { row.push(col.trim()); result.push(row); row = []; col = ""; }
      else if (char !== '\r') col += char;
    }
  }
  if (col !== "") row.push(col.trim());
  if (row.length) result.push(row);
  return result;
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
    
    // UI Feedback & Optimistic Render (Mostra na tela instantaneamente)
    const newNote = { id: Date.now(), author, text };
    const submitBtn = noteForm.querySelector('button');
    const oldText = submitBtn.textContent;
    submitBtn.textContent = 'Salvando...';
    submitBtn.disabled = true;

    try {
      // Cria a carga de dados simulando o formulário do Google
      const formData = new URLSearchParams();
      formData.append('entry.862057512', author);
      formData.append('entry.179620545', text);

      // Envia os dados para o Google Forms em modo silencioso (no-cors)
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      // Limpa os campos
      noteAuthorInput.value = '';
      noteTextInput.value = '';
      
      // Mostrar na tela instantaneamente (Optimistic UI)
      // Como a planilha do Google pode demorar até 1 minuto para atualizar o link CSV público,
      // nós fingimos que já baixamos a planilha atualizada adicionando no topo:
      const currentNotes = Array.from(notesGridEl.children).map(child => {
         const authorEl = child.querySelector('.sticky-author').textContent.replace('- ', '');
         const contentEl = child.querySelector('.sticky-content').textContent.replace(/(^"|"$)/g, '');
         return { author: authorEl, text: contentEl };
      });
      // Filtra o DEFAULT_NOTES e os recados, pega os recados da tela
      currentNotes.unshift(newNote);
      renderNotes(currentNotes);

    } catch(e) {
      console.error(e);
      alert("Houve um erro ao enviar para a planilha. Tente novamente.");
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

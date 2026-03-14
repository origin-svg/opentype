'use strict';

// Data
const DATA = {
  words: {
    es: 'tiempo vida mundo gente casa ciudad agua luz mano año día noche trabajo forma parte lugar país bien gran nuevo mismo cada todo mucho como pero solo puede hacer saber creer ver dar decir llegar pasar quedar dejar seguir volver tener estar ser ir poder querer traer usar vivir leer pensar sentir correr escribir hablar caminar mirar escuchar aprender'.split(' '),
    en: 'time life world people home city water light hand year day night work form part place land well great new same each all much like but only can make know think see give say find reach pass stay leave follow return have be go get want put bring take come walk talk read write run learn feel grow move turn show keep start'.split(' '),
  },
  quotes: {
    es: [
      'el tiempo es el recurso más valioso que tenemos y no podemos recuperarlo',
      'la vida es lo que pasa mientras estás ocupado haciendo otros planes',
      'el único modo de hacer un gran trabajo es amar lo que haces de verdad',
      'en medio de la dificultad reside la oportunidad para crecer y avanzar',
      'la perseverancia es el camino al éxito cuando todo parece muy difícil',
      'no cuentes los días hazlos contar con todo lo que puedas dar cada día',
    ],
    en: [
      'the only way to do great work is to love what you do every single day',
      'life is what happens while you are busy making other plans for yourself',
      'in the middle of difficulty lies opportunity for growth and real change',
      'the future belongs to those who believe in the beauty of their dreams',
      'it does not matter how slowly you go as long as you do not stop moving',
      'success is not final failure is not fatal it is the courage to continue',
    ],
  },
};

// State
const S = {
  time: 30, mode: 'words', lang: 'es',
  words: [], wIdx: 0, cIdx: 0,
  correct: 0, wrong: 0,
  remaining: 30, timer: null,
  started: false, done: false,
};

// DOM
const wordsEl  = document.getElementById('words');
const inputEl  = document.getElementById('input');
const typeArea = document.getElementById('typeArea');
const hintEl   = document.getElementById('hint');
const resultsEl = document.getElementById('results');
const wpmEl    = document.getElementById('wpm');
const accEl    = document.getElementById('acc');
const timerEl  = document.getElementById('timerVal');

// Helpers
const pick  = arr => arr[Math.floor(Math.random() * arr.length)];
const $id   = id  => document.getElementById(id);
const allOf = sel => [...document.querySelectorAll(sel)];

function buildWordList() {
  if (S.mode === 'quotes') return pick(DATA.quotes[S.lang]).split(' ');
  const pool = DATA.words[S.lang];
  return Array.from({ length: 120 }, () => pick(pool));
}

// Init
function init() {
  clearInterval(S.timer);
  Object.assign(S, {
    words: buildWordList(),
    wIdx: 0, cIdx: 0,
    correct: 0, wrong: 0,
    remaining: S.time,
    started: false, done: false,
  });
  wordsEl.style.transform = '';
  resultsEl.hidden = true;
  hintEl.hidden    = false;
  wpmEl.textContent    = '0';
  accEl.textContent    = '100';
  timerEl.textContent  = S.time;
  timerEl.style.color  = '';
  renderWords();
  inputEl.value = '';
  typeArea.classList.remove('focused');
}

function renderWords() {
  wordsEl.innerHTML = S.words
    .map((w, wi) =>
      `<div class="word${wi === 0 ? ' active' : ''}">${
        [...w].map(ch => `<span class="char">${ch}</span>`).join('')
      }</div>`
    ).join('');
  setCursor();
}

// Cursor & scroll
function getWordEl(i) {
  return wordsEl.querySelectorAll('.word')[i] || null;
}

function setCursor() {
  wordsEl.querySelectorAll('.cursor').forEach(el => el.classList.remove('cursor'));

  const wordEl = getWordEl(S.wIdx);
  if (!wordEl) return;

  const chars = wordEl.querySelectorAll('.char');
  const target = chars[Math.min(S.cIdx, chars.length - 1)];
  if (target) target.classList.add('cursor');

  scrollCheck();
}

function scrollCheck() {
  const activeWord = getWordEl(S.wIdx);
  if (!activeWord) return;

  const allWords = [...wordsEl.querySelectorAll('.word')];
  const firstTop = allWords[0]?.offsetTop ?? 0;
  const secondRowWord = allWords.find(w => w.offsetTop > firstTop);
  const lineH = secondRowWord ? secondRowWord.offsetTop - firstTop : 46;

  const offset = Math.max(0, activeWord.offsetTop - lineH);
  wordsEl.style.transform = `translateY(${-offset}px)`;
}

// Timer
function startTimer() {
  S.started = true;
  hintEl.hidden = true;
  S.timer = setInterval(() => {
    S.remaining--;
    timerEl.textContent = S.remaining;
    if (S.remaining <= 5) timerEl.style.color = '#f87171';
    liveStats();
    if (S.remaining <= 0) { clearInterval(S.timer); finish(); }
  }, 1000);
}

function liveStats() {
  const elapsed = S.time - S.remaining;
  if (elapsed <= 0) return;
  wpmEl.textContent = Math.round((S.correct / 5) / (elapsed / 60));
  const total = S.correct + S.wrong;
  accEl.textContent = total ? Math.round((S.correct / total) * 100) : 100;
}

function finish() {
  S.done = true;
  inputEl.blur();
  const wpm   = Math.round((S.correct / 5) / (S.time / 60));
  const total = S.correct + S.wrong;
  const acc   = total ? Math.round((S.correct / total) * 100) : 100;
  $id('resWpm').textContent    = wpm;
  $id('resAcc').textContent    = acc + '%';
  $id('resChars').textContent  = S.correct;
  $id('resErrors').textContent = S.wrong;
  resultsEl.hidden = false;
  hintEl.hidden    = true;
}

// Typing actions
function typeChar(ch) {
  const wordEl = getWordEl(S.wIdx);
  if (!wordEl) return;
  const chars = wordEl.querySelectorAll('.char');
  if (S.cIdx >= chars.length) return;
  const ok = ch === S.words[S.wIdx][S.cIdx];
  chars[S.cIdx].classList.add(ok ? 'correct' : 'wrong');
  ok ? S.correct++ : S.wrong++;
  S.cIdx++;
  setCursor();
  liveStats();
}

function typeBackspace() {
  if (S.cIdx <= 0) return;
  S.cIdx--;
  const chars = getWordEl(S.wIdx)?.querySelectorAll('.char');
  if (!chars) return;
  const ch = chars[S.cIdx];
  if (ch.classList.contains('correct')) S.correct--;
  else if (ch.classList.contains('wrong')) S.wrong--;
  ch.classList.remove('correct', 'wrong');
  setCursor();
}

function typeSpace() {
  if (S.cIdx === 0) return;

  // Mark untouched chars as wrong
  const wordEl = getWordEl(S.wIdx);
  wordEl?.querySelectorAll('.char').forEach((ch, i) => {
    if (i >= S.cIdx) { ch.classList.add('wrong'); S.wrong++; }
  });
  wordEl?.classList.remove('active');

  S.wIdx++;
  S.cIdx = 0;

  if (S.wIdx >= S.words.length) { finish(); return; }

  getWordEl(S.wIdx)?.classList.add('active');
  setCursor();
}

// Keyboard handler
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); init(); return; }
  if (S.done) return;
  if (!S.started && e.key.length === 1) startTimer();

  if      (e.key === 'Backspace') { e.preventDefault(); typeBackspace(); }
  else if (e.key === ' ')         { e.preventDefault(); typeSpace(); }
  else if (e.key.length === 1)    typeChar(e.key);
});

// Focus management
typeArea.addEventListener('click', () => {
  inputEl.focus();
  typeArea.classList.add('focused');
});
inputEl.addEventListener('blur', () => typeArea.classList.remove('focused'));
document.addEventListener('keydown', e => {
  if (!S.done && e.key.length === 1 && e.key !== 'Tab') {
    inputEl.focus();
    typeArea.classList.add('focused');
  }
});

// Control pills
allOf('[data-time]').forEach(b => b.addEventListener('click', () => {
  allOf('[data-time]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  S.time = +b.dataset.time;
  init();
}));
allOf('[data-mode]').forEach(b => b.addEventListener('click', () => {
  allOf('[data-mode]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  S.mode = b.dataset.mode;
  init();
}));
allOf('[data-lang]').forEach(b => b.addEventListener('click', () => {
  allOf('[data-lang]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  S.lang = b.dataset.lang;
  init();
}));

$id('restartBtn').addEventListener('click', init);

// Start
init();

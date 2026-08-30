/* ==========================================================================
   1. FAQ DATA — replace this array (and the header title/subtitle above)
      to reuse this app for any product or business.
   ========================================================================== */
const FAQS = [
  { q: "How do I pair my Aurora earbuds with my phone?", a: "Open the charging case near your phone, hold the button on the back for 3 seconds until the light flashes blue, then select 'Aurora Buds' in your phone's Bluetooth settings." },
  { q: "What is the battery life of the earbuds?", a: "The earbuds last up to 8 hours on a single charge, and the charging case provides 3 additional full charges, for up to 32 hours of total listening time." },
  { q: "How long does it take to fully charge the case?", a: "The charging case takes about 1.5 hours to fully charge via USB-C, and supports wireless charging in 2 hours." },
  { q: "Are the earbuds waterproof?", a: "The earbuds are rated IPX4, meaning they can handle sweat and light rain, but should not be submerged in water." },
  { q: "How do I reset my earbuds to factory settings?", a: "Place both earbuds in the case, hold the button for 10 seconds until the LED flashes red and white three times, then release to complete the reset." },
  { q: "Why is only one earbud working?", a: "This usually happens when the earbuds get out of sync. Place both buds back in the case for 10 seconds, take them out, and they should reconnect automatically." },
  { q: "Can I use one earbud at a time?", a: "Yes, both the left and right earbuds can be used independently in mono mode for calls or casual listening." },
  { q: "Do the earbuds support noise cancellation?", a: "Yes, Aurora earbuds feature active noise cancellation (ANC) which can be toggled on or off through the companion app." },
  { q: "How do I control volume and playback?", a: "Tap once on either earbud to play or pause, double-tap to skip forward, triple-tap to go back, and press and hold to adjust volume up or down." },
  { q: "What should I do if my earbuds won't charge?", a: "Clean the charging contacts on both the earbuds and the case with a dry cloth, ensure the cable is fully connected, and try a different USB port or wall adapter." },
  { q: "Is there a warranty on the earbuds?", a: "Aurora earbuds come with a 1-year limited warranty covering manufacturing defects. Register your product online to activate the warranty." },
  { q: "How do I update the earbud firmware?", a: "Open the Aurora companion app, go to Settings > Device, and tap 'Check for Updates'. Keep the earbuds connected and within range during the update." },
  { q: "What's your return policy?", a: "You can return unused or defective products within 30 days of purchase for a full refund. Contact support with your order number to start a return." },
  { q: "Do the earbuds work with both Android and iPhone?", a: "Yes, Aurora earbuds are compatible with any Bluetooth 5.0+ device, including both Android and iOS phones, tablets, and laptops." },
  { q: "How do I find my lost earbud?", a: "Use the 'Find My Buds' feature in the Aurora app, which shows the last connected location and can play a sound to help you locate a nearby earbud." }
];
const SIMILARITY_THRESHOLD = 0.15;

/* ==========================================================================
   2. Preprocessing: lowercase, strip punctuation, tokenize, remove stopwords, light stem
   ========================================================================== */
const STOPWORDS = new Set(["a","an","the","is","are","was","were","be","been","being","i","you","he","she","it","we","they","my","your","his","her","its","our","their","this","that","these","those","of","in","on","at","to","for","with","and","or","but","if","do","does","did","can","could","will","would","should","have","has","had","not","no","so","what","how","when","where","why","which","who","whom"]);

function stem(word) {
  return word.replace(/(ing|edly|ed|es|s)$/, "").replace(/'$/, "");
}
function preprocess(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s']/g, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.filter(t => !STOPWORDS.has(t) && t.length > 1).map(stem);
}

/* ==========================================================================
   3. TF-IDF vectorization
   ========================================================================== */
const docsTokens = FAQS.map(f => preprocess(f.q));
const vocab = Array.from(new Set(docsTokens.flat()));
const vocabIndex = new Map(vocab.map((w, i) => [w, i]));

function termFreq(tokens) {
  const tf = new Array(vocab.length).fill(0);
  tokens.forEach(t => { const idx = vocabIndex.get(t); if (idx !== undefined) tf[idx] += 1; });
  const total = tokens.length || 1;
  return tf.map(c => c / total);
}
const df = new Array(vocab.length).fill(0);
docsTokens.forEach(tokens => { new Set(tokens).forEach(t => { const idx = vocabIndex.get(t); if (idx !== undefined) df[idx] += 1; }); });
const N = docsTokens.length;
const idf = df.map(d => Math.log((N + 1) / (d + 1)) + 1);
function tfidfVector(tokens) { const tf = termFreq(tokens); return tf.map((v, i) => v * idf[i]); }
const faqVectors = docsTokens.map(tokens => tfidfVector(tokens));
function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i]; }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/* ==========================================================================
   4. Matching
   ========================================================================== */
function getResponse(userText) {
  const tokens = preprocess(userText);
  if (tokens.length === 0) {
    return { answer: "I couldn't quite understand that. Could you rephrase your question?", confidence: 0, matchedIdx: -1 };
  }
  const queryVec = tfidfVector(tokens);
  let bestIdx = -1, bestScore = -1;
  faqVectors.forEach((vec, i) => { const score = cosineSim(queryVec, vec); if (score > bestScore) { bestScore = score; bestIdx = i; } });
  if (bestScore < SIMILARITY_THRESHOLD) {
    return { answer: "I'm not sure I have an answer for that yet. Try rephrasing, or ask something else about the product.", confidence: bestScore, matchedIdx: -1 };
  }
  return { answer: FAQS[bestIdx].a, confidence: bestScore, matchedIdx: bestIdx };
}

/* ==========================================================================
   5. Elements & state
   ========================================================================== */
const chatArea = document.getElementById('chatArea');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const typingRow = document.getElementById('typingRow');
const toastStack = document.getElementById('toastStack');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const menuBtn = document.getElementById('menuBtn');
const speakingIndicator = document.getElementById('speakingIndicator');

const state = {
  messages: 0,
  confidenceSum: 0,
  answered: 0,
  helpfulYes: 0,
  helpfulNo: 0,
  sessionStart: Date.now(),
  askedIdx: new Set(),
  busy: false
};
let transcriptLog = [];

function showToast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  toastStack.appendChild(el);
  setTimeout(() => el.remove(), 2900);
}

/* ---------- Stats ---------- */
function updateStats() {
  document.getElementById('statMessages').textContent = state.messages;
  document.getElementById('statConfidence').textContent = state.answered
    ? Math.round((state.confidenceSum / state.answered) * 100) + '%' : '—';
  const totalVotes = state.helpfulYes + state.helpfulNo;
  document.getElementById('statHelpful').textContent = totalVotes
    ? Math.round((state.helpfulYes / totalVotes) * 100) + '%' : '—';
}
setInterval(() => {
  const secs = Math.floor((Date.now() - state.sessionStart) / 1000);
  const m = Math.floor(secs / 60), s = secs % 60;
  document.getElementById('statTime').textContent = m + ':' + String(s).padStart(2, '0');
}, 1000);

/* ---------- Sidebar (mobile) ---------- */
function openSidebar() { sidebar.classList.add('open'); sidebarBackdrop.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarBackdrop.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
sidebarBackdrop.addEventListener('click', closeSidebar);

/* ---------- Theme ---------- */
const themeSwitch = document.getElementById('themeToggleSwitch');
const quickThemeBtn = document.getElementById('quickThemeBtn');
function setTheme(light) {
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  themeSwitch.checked = light;
}
themeSwitch.addEventListener('change', () => setTheme(themeSwitch.checked));
quickThemeBtn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') !== 'light'));
// Respect the visitor's OS preference on first load (no storage is used, so this resets each visit).
setTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

/* ==========================================================================
   6. Chat rendering
   ========================================================================== */
function scrollToBottom() { chatArea.scrollTop = chatArea.scrollHeight; }

function renderChips(excludeIdx) {
  const old = document.querySelector('.chips');
  if (old) old.remove();
  const pool = FAQS.map((f, i) => i).filter(i => i !== excludeIdx && !state.askedIdx.has(i));
  const picks = [];
  const source = pool.length >= 3 ? pool : FAQS.map((f, i) => i);
  while (picks.length < 3 && source.length) {
    const idx = source.splice(Math.floor(Math.random() * source.length), 1)[0];
    if (!picks.includes(idx)) picks.push(idx);
  }
  const wrap = document.createElement('div');
  wrap.className = 'chips';
  picks.forEach(i => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = FAQS[i].q;
    chip.addEventListener('click', () => sendMessage(FAQS[i].q));
    wrap.appendChild(chip);
  });
  chatArea.appendChild(wrap);
}

function addUserMessage(text) {
  const row = document.createElement('div');
  row.className = 'msg-row user';
  const col = document.createElement('div');
  col.className = 'msg-col';
  const bubble = document.createElement('div');
  bubble.className = 'bubble user-bubble';
  const p = document.createElement('p');
  p.textContent = text;
  bubble.appendChild(p);
  col.appendChild(bubble);
  row.appendChild(col);
  chatArea.appendChild(row);
  transcriptLog.push({ sender: 'You', text });
  scrollToBottom();
}

function addBotMessage(text, confidence, matchedIdx) {
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  const col = document.createElement('div');
  col.className = 'msg-col';
  const bubble = document.createElement('div');
  bubble.className = 'bubble bot-bubble';
  const p = document.createElement('p');
  p.textContent = text;
  bubble.appendChild(p);
  if (confidence !== null) {
    const tag = document.createElement('span');
    tag.className = 'confidence-tag';
    tag.textContent = `match confidence: ${(confidence * 100).toFixed(0)}%`;
    bubble.appendChild(tag);
  }
  col.appendChild(bubble);

  const actions = document.createElement('div');
  actions.className = 'msg-actions';

  const speakBtn = document.createElement('button');
  speakBtn.type = 'button';
  speakBtn.setAttribute('aria-label', 'Read this message aloud');
  speakBtn.title = ttsSupported ? 'Read aloud' : 'Read-aloud not supported in this browser';
  speakBtn.innerHTML = ICONS.speaker;
  speakBtn.disabled = !ttsSupported;
  speakBtn.addEventListener('click', () => toggleSpeak(text, speakBtn));
  actions.appendChild(speakBtn);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.setAttribute('aria-label', 'Copy message text');
  copyBtn.title = 'Copy';
  copyBtn.innerHTML = ICONS.copy;
  copyBtn.addEventListener('click', () => copyText(text));
  actions.appendChild(copyBtn);

  if (matchedIdx !== -1) {
    const sep = document.createElement('span');
    sep.className = 'sep';
    actions.appendChild(sep);

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.setAttribute('aria-label', 'Mark answer as helpful');
    upBtn.title = 'Helpful';
    upBtn.innerHTML = ICONS.thumbUp;
    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.setAttribute('aria-label', 'Mark answer as not helpful');
    downBtn.title = 'Not helpful';
    downBtn.innerHTML = ICONS.thumbDown;

    upBtn.addEventListener('click', () => {
      state.helpfulYes++; updateStats(); showToast('Thanks for the feedback!');
      upBtn.classList.add('thumb-selected', 'up'); upBtn.disabled = true; downBtn.disabled = true;
    });
    downBtn.addEventListener('click', () => {
      state.helpfulNo++; updateStats(); showToast('Thanks — noted for improvement.');
      downBtn.classList.add('thumb-selected', 'down'); upBtn.disabled = true; downBtn.disabled = true;
    });
    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
  }

  col.appendChild(actions);
  row.appendChild(col);
  chatArea.appendChild(row);
  transcriptLog.push({ sender: 'Aurora Assistant', text });
  scrollToBottom();

  if (autoReadToggle.checked && ttsSupported) toggleSpeak(text, speakBtn);
}

const ICONS = {
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M16 8a5 5 0 0 1 0 8" stroke-linecap="round"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  thumbUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 22V11m0 0 5-8 1.5 1.5L12 9h8a2 2 0 0 1 2 2.4l-1.6 7A2 2 0 0 1 18.5 20H7Z" stroke-linejoin="round"/></svg>',
  thumbDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 2v11m0 0-5 8-1.5-1.5L12 15H4a2 2 0 0 1-2-2.4l1.6-7A2 2 0 0 1 5.5 4H17Z" stroke-linejoin="round"/></svg>'
};

/* ==========================================================================
   7. Sending messages
   ========================================================================== */
function setBusy(isBusy) {
  state.busy = isBusy;
  sendBtn.disabled = isBusy;
  userInput.disabled = isBusy;
  document.querySelectorAll('.chip').forEach(c => c.disabled = isBusy);
}

function sendMessage(text) {
  if (!text || !text.trim() || state.busy) return;
  addUserMessage(text.trim());
  userInput.value = '';
  setBusy(true);
  typingRow.hidden = false;
  scrollToBottom();

  setTimeout(() => {
    let result;
    try {
      result = getResponse(text);
    } catch (err) {
      result = { answer: "Something went wrong finding an answer — please try rephrasing your question.", confidence: null, matchedIdx: -1 };
    }
    typingRow.hidden = true;
    state.messages++;
    if (result.confidence !== null) {
      state.answered++;
      state.confidenceSum += result.confidence;
      if (result.matchedIdx !== -1) state.askedIdx.add(result.matchedIdx);
    }
    updateStats();
    addBotMessage(result.answer, result.confidence, result.matchedIdx);
    renderChips(result.matchedIdx);
    setBusy(false);
    userInput.focus();
  }, 420);
}

chatForm.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(userInput.value); });

/* ==========================================================================
   8. Text-to-speech ("pronounce" / read-aloud)
   ========================================================================== */
const ttsSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const voiceSelect = document.getElementById('voiceSelect');
const autoReadToggle = document.getElementById('autoReadToggle');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');
let currentUtterance = null;
let currentSpeakBtn = null;

document.getElementById('ttsDot').className = 'support-dot ' + (ttsSupported ? 'ok' : 'no');
rateRange.addEventListener('input', () => { rateValue.textContent = parseFloat(rateRange.value).toFixed(1) + '×'; });

function populateVoices() {
  if (!ttsSupported) {
    voiceSelect.innerHTML = '<option>Not available in this browser</option>';
    voiceSelect.disabled = true;
    autoReadToggle.disabled = true;
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  voiceSelect.innerHTML = '';
  voices
    .slice()
    .sort((a, b) => a.lang.localeCompare(b.lang))
    .forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  const preferred = voices.find(v => v.lang && v.lang.startsWith((navigator.language || 'en').slice(0, 2)));
  if (preferred) voiceSelect.value = preferred.name;
}
if (ttsSupported) {
  populateVoices();
  window.speechSynthesis.onvoiceschanged = populateVoices;
}

function stopSpeaking() {
  if (!ttsSupported) return;
  try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  if (currentSpeakBtn) { currentSpeakBtn.innerHTML = ICONS.speaker; currentSpeakBtn.classList.remove('speaking'); }
  currentSpeakBtn = null;
  currentUtterance = null;
  speakingIndicator.classList.remove('active');
}

function toggleSpeak(text, btn) {
  if (!ttsSupported) { showToast('Read-aloud is not supported in this browser.'); return; }
  if (currentSpeakBtn === btn) { stopSpeaking(); return; }
  stopSpeaking();
  try {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find(v => v.name === voiceSelect.value);
    if (chosen) utter.voice = chosen;
    utter.rate = parseFloat(rateRange.value) || 1;
    utter.onstart = () => { btn.innerHTML = ICONS.stop; btn.classList.add('speaking'); speakingIndicator.classList.add('active'); };
    utter.onend = () => stopSpeaking();
    utter.onerror = () => { showToast('Could not read that message aloud.'); stopSpeaking(); };
    currentUtterance = utter;
    currentSpeakBtn = btn;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    showToast('Read-aloud failed to start.');
  }
}

function copyText(text) {
  const done = () => showToast('Copied to clipboard.');
  const fail = () => showToast('Could not copy — select and copy the text manually.');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? done() : fail();
    }
  } catch (err) { fail(); }
}

/* ==========================================================================
   9. Speech-to-text (voice input)
   ========================================================================== */
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
const sttSupported = !!SpeechRecognitionCtor;
document.getElementById('sttDot').className = 'support-dot ' + (sttSupported ? 'ok' : 'no');
let recognizer = null;
let listening = false;

if (!sttSupported) {
  micBtn.disabled = true;
  micBtn.title = 'Voice input is not supported in this browser';
} else {
  try {
    recognizer = new SpeechRecognitionCtor();
    recognizer.lang = navigator.language || 'en-US';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.onstart = () => { listening = true; micBtn.classList.add('mic-active'); };
    recognizer.onend = () => { listening = false; micBtn.classList.remove('mic-active'); };
    recognizer.onerror = (e) => {
      listening = false; micBtn.classList.remove('mic-active');
      const reason = e && e.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice input hit an error — please try again.';
      showToast(reason);
    };
    recognizer.onresult = (e) => {
      const transcript = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : '';
      if (transcript) { userInput.value = transcript; sendMessage(transcript); }
    };
  } catch (err) {
    sttSupported && (micBtn.disabled = true);
  }
}
micBtn.addEventListener('click', () => {
  if (!recognizer || state.busy) return;
  if (listening) { try { recognizer.stop(); } catch (e) {} return; }
  try { recognizer.start(); } catch (err) { showToast('Could not start voice input.'); }
});

/* ==========================================================================
   10. New chat / export
   ========================================================================== */
function welcomeMessage() {
  chatArea.innerHTML = '';
  addBotMessageSilent("Hi! I'm Aurora Assistant. I can answer questions about pairing, battery life, charging, warranty, and more. What would you like to know?");
  renderChips(-1);
}
function addBotMessageSilent(text) {
  // Same as addBotMessage but never triggers auto-read (used for the greeting).
  const wasAuto = autoReadToggle.checked;
  autoReadToggle.checked = false;
  addBotMessage(text, null, -1);
  autoReadToggle.checked = wasAuto;
}

document.getElementById('newChatBtn').addEventListener('click', () => {
  stopSpeaking();
  state.messages = 0; state.confidenceSum = 0; state.answered = 0;
  state.helpfulYes = 0; state.helpfulNo = 0; state.sessionStart = Date.now();
  state.askedIdx.clear();
  transcriptLog = [];
  updateStats();
  welcomeMessage();
  showToast('Started a new chat.');
  closeSidebar();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  try {
    if (!transcriptLog.length) { showToast('Nothing to export yet.'); return; }
    const lines = transcriptLog.map(m => `[${m.sender}] ${m.text}`);
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-assistant-transcript-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Transcript downloaded.');
  } catch (err) {
    showToast('Export failed — please try again.');
  }
});

/* ==========================================================================
   11. Extra keyboard niceties
   ========================================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (sidebar.classList.contains('open')) { closeSidebar(); return; }
    if (currentSpeakBtn) stopSpeaking();
  }
});

/* ==========================================================================
   12. Init
   ========================================================================== */
welcomeMessage();
updateStats();
userInput.focus();

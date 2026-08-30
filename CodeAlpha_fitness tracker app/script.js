/* =========================================================
   LANE — Fitness Tracker
   All data lives in localStorage. No backend required.
========================================================= */

const STORAGE_KEYS = {
  entries: 'lane_entries',
  goals: 'lane_goals',
  theme: 'lane_theme',
  voice: 'lane_voice',
};

const THEME_COLORS = { light: '#1F6F5C', dark: '#0F1613' };

const DEFAULT_GOALS = { steps: 8000, calories: 500, minutes: 45 };

const TYPE_ICONS = {
  'Running': '🏃',
  'Walking': '🚶',
  'Cycling': '🚴',
  'Strength Training': '🏋️',
  'Yoga': '🧘',
  'Swimming': '🏊',
  'HIIT': '⚡',
  'Other': '✨',
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 60; // r=60

let state = {
  entries: [],
  goals: { ...DEFAULT_GOALS },
  weekMetric: 'steps',
  voiceFeedback: false,
};

/* ---------------------------------------------------------
   Storage helpers
--------------------------------------------------------- */
function loadState(){
  try{
    const rawEntries = localStorage.getItem(STORAGE_KEYS.entries);
    state.entries = rawEntries ? JSON.parse(rawEntries) : [];
  }catch(e){ state.entries = []; }

  try{
    const rawGoals = localStorage.getItem(STORAGE_KEYS.goals);
    state.goals = rawGoals ? { ...DEFAULT_GOALS, ...JSON.parse(rawGoals) } : { ...DEFAULT_GOALS };
  }catch(e){ state.goals = { ...DEFAULT_GOALS }; }

  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  applyThemeColorMeta(theme || 'light');

  state.voiceFeedback = localStorage.getItem(STORAGE_KEYS.voice) === '1';
}

function applyThemeColorMeta(theme){
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
}

function saveEntries(){
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
}
function saveGoals(){
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(state.goals));
}

/* ---------------------------------------------------------
   Date helpers
--------------------------------------------------------- */
function toISODate(d){
  const yr = d.getFullYear();
  const mo = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${yr}-${mo}-${day}`;
}
function todayISO(){ return toISODate(new Date()); }

function lastNDays(n){
  const days = [];
  for (let i = n-1; i >= 0; i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  return days;
}

function formatFriendlyDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

/* ---------------------------------------------------------
   Derived data
--------------------------------------------------------- */
function entriesForDate(iso){
  return state.entries.filter(e => e.date === iso);
}

function totalsForDate(iso){
  const list = entriesForDate(iso);
  return list.reduce((acc, e) => {
    acc.steps += Number(e.steps) || 0;
    acc.calories += Number(e.calories) || 0;
    acc.minutes += Number(e.duration) || 0;
    return acc;
  }, { steps: 0, calories: 0, minutes: 0 });
}

function computeStreak(){
  // consecutive days up to today (or yesterday if today has no entry yet)
  // where step goal was met
  let streak = 0;
  const days = [];
  for (let i = 0; i < 60; i++){
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  let started = false;
  for (const iso of days){
    const totals = totalsForDate(iso);
    const met = totals.steps >= state.goals.steps && entriesForDate(iso).length > 0;
    if (!started){
      if (met){ streak++; started = true; }
      else if (iso === todayISO()){ continue; } // today not logged yet, don't break streak
      else { break; }
    } else {
      if (met) streak++;
      else break;
    }
  }
  return streak;
}

/* ---------------------------------------------------------
   Rendering: header
--------------------------------------------------------- */
function renderHeader(){
  const now = new Date();
  document.getElementById('dateLabel').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById('greeting').textContent = greeting;
}

/* ---------------------------------------------------------
   Rendering: hero ring + streak
--------------------------------------------------------- */
function renderHero(){
  const totals = totalsForDate(todayISO());
  const g = state.goals;
  const pctSteps = g.steps ? totals.steps / g.steps : 0;
  const pctCal = g.calories ? totals.calories / g.calories : 0;
  const pctMin = g.minutes ? totals.minutes / g.minutes : 0;
  const overall = Math.min(1, (pctSteps + pctCal + pctMin) / 3);

  const ring = document.getElementById('ringProgress');
  const offset = RING_CIRCUMFERENCE * (1 - overall);
  ring.style.strokeDasharray = RING_CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;
  document.getElementById('ringPercent').textContent = Math.round(overall * 100) + '%';

  document.getElementById('streakCount').textContent = computeStreak();

  const note = document.getElementById('heroNote');
  const todayCount = entriesForDate(todayISO()).length;
  if (todayCount === 0){
    note.textContent = "Nothing logged yet today — add your first activity.";
  } else if (overall >= 1){
    note.textContent = "All daily goals hit. Great work today.";
  } else {
    note.textContent = `${todayCount} ${todayCount === 1 ? 'activity' : 'activities'} logged today. Keep going.`;
  }
}

/* ---------------------------------------------------------
   Rendering: track-lane bars
--------------------------------------------------------- */
function laneRow({ label, value, goal, unit, color }){
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return `
    <div class="lane-card">
      <div class="lane-top">
        <span class="lane-title"><span class="lane-dot" style="background:${color}"></span>${label}</span>
        <span class="lane-value">${formatNum(value)}<span> / ${formatNum(goal)} ${unit}</span></span>
      </div>
      <div class="lane-track">
        <div class="lane-fill" style="width:${pct}%; background:${color}"></div>
      </div>
    </div>
  `;
}

function formatNum(n){
  return Number(n || 0).toLocaleString();
}

function renderLanes(){
  const totals = totalsForDate(todayISO());
  const g = state.goals;
  const html = [
    laneRow({ label: 'Steps', value: totals.steps, goal: g.steps, unit: 'steps', color: 'var(--primary)' }),
    laneRow({ label: 'Calories', value: totals.calories, goal: g.calories, unit: 'kcal', color: 'var(--coral)' }),
    laneRow({ label: 'Active minutes', value: totals.minutes, goal: g.minutes, unit: 'min', color: 'var(--amber)' }),
  ].join('');
  document.getElementById('laneStack').innerHTML = html;
}

/* ---------------------------------------------------------
   Rendering: weekly SVG bar chart
--------------------------------------------------------- */
function renderWeekChart(){
  const days = lastNDays(7);
  const values = days.map(iso => totalsForDate(iso)[state.weekMetric]);
  const max = Math.max(1, ...values);

  const width = 320, height = 160;
  const padTop = 22, padBottom = 24, padSide = 8;
  const chartH = height - padTop - padBottom;
  const barGap = 10;
  const barW = (width - padSide*2 - barGap*(days.length-1)) / days.length;

  const colorVar = state.weekMetric === 'steps' ? 'var(--primary)'
    : state.weekMetric === 'calories' ? 'var(--coral)' : 'var(--amber)';

  let bars = '';
  days.forEach((iso, i) => {
    const val = values[i];
    const h = max ? (val / max) * chartH : 0;
    const x = padSide + i * (barW + barGap);
    const y = padTop + (chartH - h);
    const isToday = iso === todayISO();
    const dayLabel = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });

    bars += `
      <rect x="${x}" y="${y}" width="${barW}" height="${Math.max(h,3)}" rx="6"
        fill="${isToday ? colorVar : 'var(--surface-2)'}"
        stroke="${isToday ? 'none' : 'var(--line)'}" stroke-width="1"></rect>
      <text x="${x + barW/2}" y="${padTop - 8}" text-anchor="middle" class="bar-value${isToday ? ' today' : ''}" font-size="9.5">${val > 0 ? formatCompact(val) : ''}</text>
      <text x="${x + barW/2}" y="${height - 6}" text-anchor="middle" class="bar-label" font-size="10">${dayLabel}</text>
    `;
  });

  // dashed baseline, track-lane motif
  const baseline = `<line x1="${padSide}" y1="${padTop+chartH}" x2="${width-padSide}" y2="${padTop+chartH}" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"></line>`;

  document.getElementById('weekChart').innerHTML = baseline + bars;
}

function formatCompact(n){
  if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/,'') + 'k';
  return String(Math.round(n));
}

/* ---------------------------------------------------------
   Rendering: entry lists
--------------------------------------------------------- */
function entryItemHTML(e){
  const icon = TYPE_ICONS[e.type] || '✨';
  const parts = [];
  if (e.duration) parts.push(`${e.duration} min`);
  if (e.calories) parts.push(`${formatNum(e.calories)} kcal`);
  if (e.steps) parts.push(`${formatNum(e.steps)} steps`);
  return `
    <div class="entry-item" data-id="${e.id}">
      <div class="entry-icon">${icon}</div>
      <div class="entry-body">
        <div class="entry-type">${e.type}</div>
        <div class="entry-meta">${parts.join(' · ') || 'No details'}</div>
      </div>
      <div class="entry-date">${formatShortDate(e.date)}</div>
      <button class="entry-del" data-del="${e.id}" aria-label="Delete entry" title="Delete entry">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;
}

function formatShortDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function emptyStateHTML(message, sub){
  return `<div class="empty-state"><strong>${message}</strong>${sub}</div>`;
}

function renderTodayList(){
  const list = entriesForDate(todayISO()).sort((a,b) => b.id - a.id);
  const container = document.getElementById('todayList');
  if (list.length === 0){
    container.innerHTML = emptyStateHTML('No activity yet today', 'Head to the Log tab to add your first entry.');
    return;
  }
  container.innerHTML = list.map(entryItemHTML).join('');
}

function renderHistory(){
  const filter = document.getElementById('historyFilter').value;
  let list = [...state.entries].sort((a,b) => (b.date.localeCompare(a.date)) || (b.id - a.id));
  if (filter !== 'all') list = list.filter(e => e.type === filter);

  const container = document.getElementById('historyList');
  if (list.length === 0){
    container.innerHTML = emptyStateHTML('Nothing here yet', 'Entries you log will show up in this list.');
    return;
  }

  // group by date
  const groups = {};
  list.forEach(e => { (groups[e.date] = groups[e.date] || []).push(e); });

  let html = '';
  Object.keys(groups).forEach(date => {
    html += `<div class="section-heading" style="margin-top:16px"><h2 style="font-size:13px;color:var(--ink-faint);font-family:var(--font-mono);text-transform:none;letter-spacing:0">${formatFriendlyDate(date)}</h2></div>`;
    html += groups[date].map(entryItemHTML).join('');
  });
  container.innerHTML = html;
}

/* ---------------------------------------------------------
   Master render
--------------------------------------------------------- */
function renderAll(){
  renderHeader();
  renderHero();
  renderLanes();
  renderWeekChart();
  renderTodayList();
  renderHistory();
}

/* ---------------------------------------------------------
   Actions
--------------------------------------------------------- */
function addEntry(entry){
  state.entries.push({ id: Date.now(), ...entry });
  saveEntries();
  renderAll();
}

function deleteEntry(id){
  state.entries = state.entries.filter(e => e.id !== id);
  saveEntries();
  renderAll();
}

function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);

  if (state.voiceFeedback) speak(msg);
}

/* ---------------------------------------------------------
   Speech / pronounce (Web Speech API — offline, no keys needed)
--------------------------------------------------------- */
const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speak(text){
  if (!speechSupported || !text) return;
  try{
    window.speechSynthesis.cancel(); // don't stack utterances
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }catch(e){ /* speech not available on this device — fail silently */ }
}

function buildDailySummarySpeech(){
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const totals = totalsForDate(todayISO());
  const g = state.goals;
  const streak = computeStreak();
  const todayCount = entriesForDate(todayISO()).length;

  if (todayCount === 0){
    return `${greeting}. You haven't logged any activity today yet. Your goals are ${formatNum(g.steps)} steps, ${formatNum(g.calories)} calories, and ${formatNum(g.minutes)} active minutes.`;
  }

  const parts = [
    `${greeting}.`,
    `Today you've logged ${formatNum(totals.steps)} of ${formatNum(g.steps)} steps,`,
    `${formatNum(totals.calories)} of ${formatNum(g.calories)} calories,`,
    `and ${formatNum(totals.minutes)} of ${formatNum(g.minutes)} active minutes.`,
  ];
  if (streak > 0) parts.push(`You're on a ${streak} day streak.`);
  const pctSteps = g.steps ? totals.steps / g.steps : 0;
  const pctCal = g.calories ? totals.calories / g.calories : 0;
  const pctMin = g.minutes ? totals.minutes / g.minutes : 0;
  if (Math.min(pctSteps, pctCal, pctMin) >= 1) parts.push('All daily goals hit. Great work.');
  return parts.join(' ');
}

function toggleSpeakSummary(){
  const btn = document.getElementById('speakBtn');
  if (!speechSupported){
    showToast('Voice is not supported on this device');
    return;
  }
  if (window.speechSynthesis.speaking){
    window.speechSynthesis.cancel();
    btn.classList.remove('is-speaking');
    return;
  }
  btn.classList.add('is-speaking');
  const utter = new SpeechSynthesisUtterance(buildDailySummarySpeech());
  utter.onend = () => btn.classList.remove('is-speaking');
  utter.onerror = () => btn.classList.remove('is-speaking');
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

/* ---------------------------------------------------------
   Navigation
--------------------------------------------------------- */
function switchView(name){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
}

/* ---------------------------------------------------------
   Init / event wiring
--------------------------------------------------------- */
function initGoalsForm(){
  document.getElementById('gSteps').value = state.goals.steps;
  document.getElementById('gCalories').value = state.goals.calories;
  document.getElementById('gMinutes').value = state.goals.minutes;
}

function init(){
  loadState();
  document.getElementById('fDate').value = todayISO();
  initGoalsForm();
  renderAll();

  // bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // log form
  document.getElementById('logForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const type = document.getElementById('fType').value;
    const duration = Number(document.getElementById('fDuration').value) || 0;
    const calories = Number(document.getElementById('fCalories').value) || 0;
    const steps = Number(document.getElementById('fSteps').value) || 0;
    const date = document.getElementById('fDate').value || todayISO();
    const notes = document.getElementById('fNotes').value.trim();

    if (!type || duration <= 0 || calories < 0){
      showToast('Add a duration and calories to continue');
      return;
    }

    addEntry({ type, duration, calories, steps, date, notes });
    ev.target.reset();
    document.getElementById('fDate').value = todayISO();
    showToast('Activity logged');
    switchView('dashboard');
  });

  // history filter
  document.getElementById('historyFilter').addEventListener('change', renderHistory);

  // delete (event delegation across dashboard + history)
  document.getElementById('view-dashboard').addEventListener('click', handleDeleteClick);
  document.getElementById('view-history').addEventListener('click', handleDeleteClick);
  function handleDeleteClick(ev){
    const btn = ev.target.closest('[data-del]');
    if (!btn) return;
    const id = Number(btn.dataset.del);
    deleteEntry(id);
    showToast('Entry removed');
  }

  // weekly metric toggle
  document.getElementById('metricToggle').addEventListener('click', (ev) => {
    const chip = ev.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.weekMetric = chip.dataset.metric;
    renderWeekChart();
  });

  // goals form
  document.getElementById('goalsForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    state.goals = {
      steps: Number(document.getElementById('gSteps').value) || DEFAULT_GOALS.steps,
      calories: Number(document.getElementById('gCalories').value) || DEFAULT_GOALS.calories,
      minutes: Number(document.getElementById('gMinutes').value) || DEFAULT_GOALS.minutes,
    };
    saveGoals();
    renderAll();
    showToast('Goals updated');
  });

  // clear data
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (confirm('This will permanently delete all logged activities on this device. Continue?')){
      state.entries = [];
      saveEntries();
      renderAll();
      showToast('All data cleared');
    }
  });

  // theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    applyThemeColorMeta(next);
  });

  // pronounce / speak today's summary
  const speakBtn = document.getElementById('speakBtn');
  if (!speechSupported) speakBtn.style.opacity = '0.4';
  speakBtn.addEventListener('click', toggleSpeakSummary);

  // voice feedback toggle
  const voiceToggle = document.getElementById('voiceToggle');
  voiceToggle.checked = state.voiceFeedback;
  if (!speechSupported){
    voiceToggle.disabled = true;
  }
  voiceToggle.addEventListener('change', () => {
    state.voiceFeedback = voiceToggle.checked;
    localStorage.setItem(STORAGE_KEYS.voice, state.voiceFeedback ? '1' : '0');
    if (state.voiceFeedback) speak('Voice feedback on');
  });

  // stop any speech before the page is hidden/unloaded
  window.addEventListener('pagehide', () => {
    if (speechSupported) window.speechSynthesis.cancel();
  });

  registerServiceWorker();
}

function registerServiceWorker(){
  if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {
        /* offline support unavailable — app still works normally */
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

(function () {
  "use strict";

  // ---------- DATA (in-memory only) ----------
  let cards = [
    { id: 1, category: "Biology",   question: "What is the powerhouse of the cell?", answer: "The mitochondria." },
    { id: 2, category: "Geography", question: "What is the capital of France?", answer: "Paris." },
    { id: 3, category: "Chemistry", question: "What is H2O more commonly known as?", answer: "Water." },
    { id: 4, category: "Literature",question: "Who wrote \"Romeo and Juliet\"?", answer: "William Shakespeare." },
    { id: 5, category: "Math",      question: "What is the square root of 144?", answer: "12." },
    { id: 6, category: "Astronomy", question: "Which planet is known as the Red Planet?", answer: "Mars." },
    { id: 7, category: "Geography", question: "What is the largest ocean on Earth?", answer: "The Pacific Ocean." },
    { id: 8, category: "Biology",   question: "What gas do plants absorb from the atmosphere for photosynthesis?", answer: "Carbon dioxide." },
    { id: 9, category: "History",   question: "In what year did World War II end?", answer: "1945." },
    { id: 10, category: "Chemistry",question: "What is the chemical symbol for gold?", answer: "Au." }
  ];
  let nextId = 11;
  let currentIndex = 0;
  let isFlipped = false;
  let editingId = null;
  let searchTerm = "";
  const stats = { correct: 0, review: 0 };
  const settings = { pronounce: false };

  // ---------- ELEMENTS ----------
  const flipCard       = document.getElementById('flipCard');
  const questionText   = document.getElementById('questionText');
  const answerText     = document.getElementById('answerText');
  const categoryTag    = document.getElementById('categoryTag');
  const progressFill   = document.getElementById('progressFill');
  const progressCount  = document.getElementById('progressCount');
  const prevBtn        = document.getElementById('prevBtn');
  const nextBtn        = document.getElementById('nextBtn');
  const showAnswerBtn  = document.getElementById('showAnswerBtn');
  const cardView       = document.getElementById('cardView');
  const manageView     = document.getElementById('manageView');
  const navRow         = document.getElementById('navRow');
  const assessRow      = document.getElementById('assessRow');
  const gotItBtn       = document.getElementById('gotItBtn');
  const reviewBtn      = document.getElementById('reviewBtn');
  const tabStudy       = document.getElementById('tabStudy');
  const tabManage      = document.getElementById('tabManage');
  const listScroll     = document.getElementById('listScroll');
  const searchInput    = document.getElementById('searchInput');
  const addCardBtn     = document.getElementById('addCardBtn');
  const modalOverlay   = document.getElementById('modalOverlay');
  const modalTitle     = document.getElementById('modalTitle');
  const inputCategory  = document.getElementById('inputCategory');
  const inputQuestion  = document.getElementById('inputQuestion');
  const inputAnswer    = document.getElementById('inputAnswer');
  const saveBtn        = document.getElementById('saveBtn');
  const cancelBtn      = document.getElementById('cancelBtn');
  const toast          = document.getElementById('toast');
  const shuffleBtn     = document.getElementById('shuffleBtn');
  const pronounceToggle= document.getElementById('pronounceToggle');
  const statsDisplay   = document.getElementById('statsDisplay');

  // ---------- CATEGORY COLOURS ----------
  // A small fixed palette, hashed by category name, so each subject reads as
  // its own colour everywhere it appears (study view + manage list) without
  // needing the user to configure anything.
  const PALETTE = [
    { bg: "rgba(61,107,112,.14)",  fg: "#2C4E52" },  // teal
    { bg: "rgba(201,162,39,.18)",  fg: "#8A6A14" },  // gold
    { bg: "rgba(180,72,61,.13)",   fg: "#8A3A30" },  // coral
    { bg: "rgba(106,90,160,.15)",  fg: "#4B3E82" },  // indigo
    { bg: "rgba(107,122,61,.15)",  fg: "#54611F" },  // olive
    { bg: "rgba(180,90,140,.15)",  fg: "#8A3E68" },  // rose
    { bg: "rgba(90,110,130,.15)",  fg: "#3D5266" },  // slate
    { bg: "rgba(150,100,60,.16)",  fg: "#7A4E22" },  // brown
  ];
  function categoryColor(category) {
    const str = category || "General";
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return PALETTE[hash % PALETTE.length];
  }
  function paintTag(el, category) {
    const c = categoryColor(category);
    el.style.background = c.bg;
    el.style.color = c.fg;
    el.textContent = category || "General";
  }

  // ---------- CLOCK ----------
  function updateClock() {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    document.getElementById('clock').textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ---------- TOAST ----------
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // ---------- SPEECH (pronounce) ----------
  const speechSupported = "speechSynthesis" in window;
  if (!speechSupported) {
    pronounceToggle.disabled = true;
    pronounceToggle.title = "Speech is not supported in this browser";
  }
  function speak(text) {
    if (!speechSupported || !text) return;
    try {
      window.speechSynthesis.cancel(); // avoid queued/overlapping utterances
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.98;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech synthesis unavailable:", err);
    }
  }
  pronounceToggle.addEventListener('click', () => {
    settings.pronounce = !settings.pronounce;
    pronounceToggle.setAttribute('aria-pressed', String(settings.pronounce));
    if (settings.pronounce) {
      showToast('Pronounce on');
      if (cards.length) speak(isFlipped ? cards[currentIndex].answer : cards[currentIndex].question);
    } else {
      showToast('Pronounce off');
      if (speechSupported) window.speechSynthesis.cancel();
    }
  });

  // ---------- STATS DASHBOARD ----------
  function renderStats() {
    statsDisplay.innerHTML = `✅ ${stats.correct} &nbsp;·&nbsp; 🔁 ${stats.review}`;
  }

  // ---------- STUDY VIEW RENDER ----------
  function renderCard() {
    if (cards.length === 0) {
      questionText.textContent = "No flashcards yet.";
      answerText.textContent = "Add one from the Manage tab.";
      categoryTag.textContent = "—";
      categoryTag.style.background = "transparent";
      categoryTag.style.color = "var(--muted)";
      progressCount.textContent = "0 / 0";
      progressFill.style.width = "0%";
      prevBtn.disabled = true; nextBtn.disabled = true;
      showAnswerBtn.style.display = "none";
      assessRow.style.display = "none";
      return;
    }
    if (currentIndex >= cards.length) currentIndex = cards.length - 1;
    if (currentIndex < 0) currentIndex = 0;

    const c = cards[currentIndex];
    questionText.textContent = c.question;
    answerText.textContent = c.answer;
    paintTag(categoryTag, c.category);
    progressCount.textContent = `${currentIndex + 1} / ${cards.length}`;
    progressFill.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
    showAnswerBtn.style.display = "flex";
    assessRow.style.display = "flex";

    isFlipped = false;
    flipCard.classList.remove('flipped');

    if (settings.pronounce) speak(c.question);
  }

  function flip() {
    if (cards.length === 0) return;
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);
    if (settings.pronounce) {
      const c = cards[currentIndex];
      speak(isFlipped ? c.answer : c.question);
    }
  }

  flipCard.addEventListener('click', flip);
  showAnswerBtn.addEventListener('click', (e) => { e.stopPropagation(); flip(); });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; renderCard(); }
  });
  nextBtn.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) { currentIndex++; renderCard(); }
  });

  function advance() {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      renderCard();
    } else {
      currentIndex = 0;
      renderCard();
      showToast(`Session complete — ${stats.correct} correct, ${stats.review} to review`);
    }
  }
  gotItBtn.addEventListener('click', () => {
    if (cards.length === 0) return;
    stats.correct++;
    renderStats();
    speak("Marked as known.");
    advance();
  });
  reviewBtn.addEventListener('click', () => {
    if (cards.length === 0) return;
    stats.review++;
    renderStats();
    speak("Marked for review.");
    advance();
  });

  // ---------- SHUFFLE ----------
  shuffleBtn.addEventListener('click', () => {
    if (cards.length < 2) { showToast('Add more cards to shuffle'); return; }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentIndex = 0;
    renderCard();
    showToast('Deck shuffled');
  });

  // ---------- TAB SWITCHING ----------
  function goToStudy() {
    tabStudy.classList.add('active');
    tabManage.classList.remove('active');
    cardView.classList.remove('hidden');
    manageView.classList.remove('active');
    navRow.style.display = 'flex';
    if (speechSupported) window.speechSynthesis.cancel();
    renderCard();
  }
  function goToManage() {
    tabManage.classList.add('active');
    tabStudy.classList.remove('active');
    cardView.classList.add('hidden');
    manageView.classList.add('active');
    navRow.style.display = 'none';
    if (speechSupported) window.speechSynthesis.cancel();
    renderList();
  }
  tabStudy.addEventListener('click', goToStudy);
  tabManage.addEventListener('click', goToManage);

  // ---------- MANAGE LIST RENDER ----------
  function renderList() {
    listScroll.innerHTML = '';
    const term = searchTerm.trim().toLowerCase();
    const visible = term
      ? cards.filter(c =>
          c.question.toLowerCase().includes(term) ||
          c.answer.toLowerCase().includes(term) ||
          (c.category || '').toLowerCase().includes(term))
      : cards;

    if (cards.length === 0) {
      listScroll.innerHTML = `<div class="empty-state">No flashcards yet.<br>Tap the + button to add your first card.</div>`;
      return;
    }
    if (visible.length === 0) {
      listScroll.innerHTML = `<div class="empty-state">No cards match &ldquo;${escapeHtml(searchTerm)}&rdquo;.</div>`;
      return;
    }

    visible.forEach(c => {
      const item = document.createElement('div');
      item.className = 'list-item';
      const color = categoryColor(c.category);
      item.innerHTML = `
        <div class="tag" style="background:${color.bg};color:${color.fg}">${escapeHtml(c.category || 'General')}</div>
        <div class="q">${escapeHtml(c.question)}</div>
        <div class="row">
          <button class="icon-btn" data-edit="${c.id}">Edit</button>
          <button class="icon-btn danger" data-delete="${c.id}">Delete</button>
        </div>
      `;
      listScroll.appendChild(item);
    });

    listScroll.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openModal('edit', parseInt(btn.dataset.edit, 10)));
    });
    listScroll.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteCard(parseInt(btn.dataset.delete, 10)));
    });
  }

  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    renderList();
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function deleteCard(id) {
    cards = cards.filter(c => c.id !== id);
    renderList();
    showToast('Flashcard deleted');
    if (currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
  }

  // ---------- MODAL (Add / Edit) ----------
  function openModal(mode, id) {
    editingId = mode === 'edit' ? id : null;
    modalTitle.textContent = mode === 'edit' ? 'Edit Flashcard' : 'Add Flashcard';
    if (mode === 'edit') {
      const c = cards.find(c => c.id === id);
      inputCategory.value = c.category || '';
      inputQuestion.value = c.question;
      inputAnswer.value = c.answer;
    } else {
      inputCategory.value = '';
      inputQuestion.value = '';
      inputAnswer.value = '';
    }
    modalOverlay.classList.add('active');
    setTimeout(() => inputQuestion.focus(), 150);
  }
  function closeModal() {
    modalOverlay.classList.remove('active');
    editingId = null;
  }

  addCardBtn.addEventListener('click', () => openModal('add'));
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  saveBtn.addEventListener('click', () => {
    const question = inputQuestion.value.trim();
    const answer = inputAnswer.value.trim();
    const category = inputCategory.value.trim() || 'General';

    if (!question || !answer) {
      showToast('Question and answer are required');
      return;
    }

    if (editingId) {
      const c = cards.find(c => c.id === editingId);
      c.question = question; c.answer = answer; c.category = category;
      showToast('Flashcard updated');
    } else {
      cards.push({ id: nextId++, category, question, answer });
      currentIndex = cards.length - 1;
      showToast('Flashcard added');
    }
    closeModal();
    renderList();
  });

  // ---------- KEYBOARD SUPPORT (nice-to-have on desktop) ----------
  document.addEventListener('keydown', (e) => {
    const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (typing || modalOverlay.classList.contains('active')) return;
    if (cardView.classList.contains('hidden')) return;

    if (e.key === 'ArrowRight' && !nextBtn.disabled) nextBtn.click();
    if (e.key === 'ArrowLeft' && !prevBtn.disabled) prevBtn.click();
    if (e.key === ' ') { e.preventDefault(); flip(); }
    if (e.key === '1') gotItBtn.click();
    if (e.key === '2') reviewBtn.click();
  });

  // ---------- INIT ----------
  renderStats();
  renderCard();
})();

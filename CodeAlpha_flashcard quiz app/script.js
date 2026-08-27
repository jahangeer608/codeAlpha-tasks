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
  const tabStudy       = document.getElementById('tabStudy');
  const tabManage      = document.getElementById('tabManage');
  const listScroll     = document.getElementById('listScroll');
  const addCardBtn     = document.getElementById('addCardBtn');
  const modalOverlay   = document.getElementById('modalOverlay');
  const modalTitle     = document.getElementById('modalTitle');
  const inputCategory  = document.getElementById('inputCategory');
  const inputQuestion  = document.getElementById('inputQuestion');
  const inputAnswer    = document.getElementById('inputAnswer');
  const saveBtn        = document.getElementById('saveBtn');
  const cancelBtn      = document.getElementById('cancelBtn');
  const toast          = document.getElementById('toast');

  // ---------- CLOCK ----------
  function updateClock(){
    const d = new Date();
    let h = d.getHours(); const m = d.getMinutes().toString().padStart(2,'0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if(h === 0) h = 12;
    document.getElementById('clock').textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ---------- TOAST ----------
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 1600);
  }

  // ---------- STUDY VIEW RENDER ----------
  function renderCard(){
    if(cards.length === 0){
      questionText.textContent = "No flashcards yet.";
      answerText.textContent = "Add one from the Manage tab.";
      categoryTag.textContent = "—";
      progressCount.textContent = "0 / 0";
      progressFill.style.width = "0%";
      prevBtn.disabled = true; nextBtn.disabled = true;
      showAnswerBtn.style.display = "none";
      return;
    }
    if(currentIndex >= cards.length) currentIndex = cards.length - 1;
    if(currentIndex < 0) currentIndex = 0;

    const c = cards[currentIndex];
    questionText.textContent = c.question;
    answerText.textContent = c.answer;
    categoryTag.textContent = c.category || "General";
    progressCount.textContent = `${currentIndex + 1} / ${cards.length}`;
    progressFill.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
    showAnswerBtn.style.display = "flex";

    isFlipped = false;
    flipCard.classList.remove('flipped');
  }

  function flip(){
    if(cards.length === 0) return;
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);
  }

  flipCard.addEventListener('click', flip);
  showAnswerBtn.addEventListener('click', (e)=>{ e.stopPropagation(); flip(); });

  prevBtn.addEventListener('click', ()=>{
    if(currentIndex > 0){ currentIndex--; renderCard(); }
  });
  nextBtn.addEventListener('click', ()=>{
    if(currentIndex < cards.length - 1){ currentIndex++; renderCard(); }
  });

  // ---------- TAB SWITCHING ----------
  function goToStudy(){
    tabStudy.classList.add('active');
    tabManage.classList.remove('active');
    cardView.classList.remove('hidden');
    manageView.classList.remove('active');
    navRow.style.display = 'flex';
    renderCard();
  }
  function goToManage(){
    tabManage.classList.add('active');
    tabStudy.classList.remove('active');
    cardView.classList.add('hidden');
    manageView.classList.add('active');
    navRow.style.display = 'none';
    renderList();
  }
  tabStudy.addEventListener('click', goToStudy);
  tabManage.addEventListener('click', goToManage);

  // ---------- MANAGE LIST RENDER ----------
  function renderList(){
    listScroll.innerHTML = '';
    if(cards.length === 0){
      listScroll.innerHTML = `<div class="empty-state">No flashcards yet.<br>Tap the + button to add your first card.</div>`;
      return;
    }
    cards.forEach(c => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="tag">${escapeHtml(c.category || 'General')}</div>
        <div class="q">${escapeHtml(c.question)}</div>
        <div class="row">
          <button class="icon-btn" data-edit="${c.id}">Edit</button>
          <button class="icon-btn danger" data-delete="${c.id}">Delete</button>
        </div>
      `;
      listScroll.appendChild(item);
    });

    listScroll.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click', ()=> openModal('edit', parseInt(btn.dataset.edit)));
    });
    listScroll.querySelectorAll('[data-delete]').forEach(btn=>{
      btn.addEventListener('click', ()=> deleteCard(parseInt(btn.dataset.delete)));
    });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function deleteCard(id){
    cards = cards.filter(c => c.id !== id);
    renderList();
    showToast('Flashcard deleted');
    if(currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
  }

  // ---------- MODAL (Add / Edit) ----------
  function openModal(mode, id){
    editingId = mode === 'edit' ? id : null;
    modalTitle.textContent = mode === 'edit' ? 'Edit Flashcard' : 'Add Flashcard';
    if(mode === 'edit'){
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
    setTimeout(()=> inputQuestion.focus(), 150);
  }
  function closeModal(){
    modalOverlay.classList.remove('active');
    editingId = null;
  }

  addCardBtn.addEventListener('click', ()=> openModal('add'));
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e)=>{ if(e.target === modalOverlay) closeModal(); });

  saveBtn.addEventListener('click', ()=>{
    const question = inputQuestion.value.trim();
    const answer = inputAnswer.value.trim();
    const category = inputCategory.value.trim() || 'General';

    if(!question || !answer){
      showToast('Question and answer are required');
      return;
    }

    if(editingId){
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
  document.addEventListener('keydown', (e)=>{
    if(!cardView.classList.contains('hidden')){
      if(e.key === 'ArrowRight' && !nextBtn.disabled) nextBtn.click();
      if(e.key === 'ArrowLeft' && !prevBtn.disabled) prevBtn.click();
      if(e.key === ' '){ e.preventDefault(); flip(); }
    }
  });

  // ---------- INIT ----------
  renderCard();

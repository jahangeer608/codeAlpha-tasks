const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const tab = document.getElementById('tab');
const seqLabel = document.getElementById('seqLabel');
const dotsWrap = document.getElementById('dots');
const card = document.getElementById('card');
const btn = document.getElementById('newQuoteBtn');

// build sequence dots (one per quote)
quotes.forEach(() => {
  const d = document.createElement('span');
  d.className = 'dot';
  dotsWrap.appendChild(d);
});
const dotEls = Array.from(dotsWrap.children);

// shuffle-bag: walk every quote once in random order before repeating any
function shuffledIndices() {
  const arr = quotes.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let bag = shuffledIndices();
let step = 0; // position within the current pass (0-based)

function render() {
  const idx = bag[step];
  const q = quotes[idx];

  quoteText.textContent = q.text;
  quoteAuthor.textContent = q.author;
  tab.textContent = 'No. ' + String(step + 1).padStart(2, '0');
  seqLabel.textContent = (step + 1) + ' / ' + quotes.length;

  dotEls.forEach((d, i) => d.classList.toggle('seen', i <= step));

  card.style.animation = 'none';
  void card.offsetWidth; // restart animation
  card.style.animation = 'rise 0.45s ease forwards';
}

function nextQuote() {
  step += 1;
  if (step >= bag.length) {
    bag = shuffledIndices();
    step = 0;
  }
  render();
}

btn.addEventListener('click', nextQuote);

// show a fresh random quote on load
render();

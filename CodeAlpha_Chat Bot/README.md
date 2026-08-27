# 🌌 Aurora Assistant — FAQ Chatbot

A mobile-first FAQ chatbot demo styled like a native messaging app — dark aurora-glow header, animated typing indicator, and confidence-scored replies. Matching is done entirely client-side with a hand-rolled **TF-IDF + cosine similarity** engine — no server, no API key, no external ML library.

![type](https://img.shields.io/badge/type-single--file%20HTML-7c6ff0?style=flat-square)
![matching](https://img.shields.io/badge/matching-TF--IDF%20%2B%20cosine%20similarity-2dd4bf?style=flat-square)
![server](https://img.shields.io/badge/server-none%20required-34d399?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-8c93b0?style=flat-square)

## Features

- **Runs 100% in the browser** — one HTML file, no build step, no backend, no API key
- **TF-IDF + cosine similarity matching** — scores every FAQ question against the user's message and returns the closest match
- **Confidence tag** on every bot reply (e.g. `match confidence: 82%`) so you can see how sure the match was
- **Similarity threshold fallback** — below the threshold, the bot admits it doesn't know instead of guessing
- **Suggestion chips** — the first four FAQs are shown as tappable quick-start questions
- **Animated typing indicator** before each reply, for a more natural feel
- **Lightweight text preprocessing** — lowercasing, punctuation stripping, stopword removal, and light suffix-stemming, so "How do I pair my earbuds?" and "pairing instructions" can still match
- Fully responsive — phone-mockup shell on desktop, fills the real viewport on mobile
- Respects `prefers-reduced-motion`

## Demo

Just open `faq-chatbot.html` in any browser — there's nothing to install.

```bash
open faq-chatbot.html        # macOS
start faq-chatbot.html        # Windows
xdg-open faq-chatbot.html     # Linux
```

Or serve it with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Project Structure

```
faq-chatbot.html   # Everything: markup, styles, and the TF-IDF matching engine — one file
```

## How Matching Works

1. **Preprocess** — lowercase the text, strip punctuation, tokenize, drop stopwords, and lightly stem each word (`preprocess()`).
2. **Vectorize** — build a TF-IDF vector for every FAQ question up front, and for each user message at query time (`tfidfVector()`).
3. **Score** — compute cosine similarity between the user's vector and every FAQ vector (`cosineSim()`), and keep the highest-scoring match.
4. **Threshold** — if the best score falls below `SIMILARITY_THRESHOLD` (default `0.15`), the bot returns a "not sure" fallback instead of a low-confidence guess.

## Customizing

- **Add or edit FAQs** — edit the `FAQS` array near the top of the `<script>` block; each entry is just `{ q: "...", a: "..." }`. The TF-IDF index rebuilds automatically from whatever is in the array.
- **Tune match strictness** — raise `SIMILARITY_THRESHOLD` to make the bot more conservative about answering, or lower it to answer more loosely-related questions.
- **Change the bot's persona/branding** — update the `<title>`, `.header-text h1`, `.status` line, and the `--teal` / `--violet` / `--green` color tokens in `:root`.
- **Adjust the stemmer/stopword list** — `STOPWORDS` and `stem()` are intentionally simple; extend them if your FAQ content uses more varied phrasing.
- **Suggestion chips** — currently shows `FAQS.slice(0, 4)`; change the slice to show a different set or count.

## Limitations

This is a lightweight demo matcher, not a production NLU pipeline:

- No synonym/semantic understanding — matching is purely lexical (shared stemmed words), so paraphrases with completely different vocabulary may miss.
- No conversation memory — every message is matched independently, with no multi-turn context.
- Best suited to small-to-medium FAQ sets; very large FAQ lists will need a smarter retrieval approach.

## License

MIT — free to use, modify, and ship.

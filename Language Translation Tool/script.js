/* ==========================================================================
   Lingo Board — app logic
   Translation is powered by the free MyMemory Translation API
   (no API key required): https://mymemory.translated.net/doc/spec.php
   Swap in Google Cloud Translate / Microsoft Translator by editing
   the translateText() function below — see the comment inside it.
   ========================================================================== */

(() => {
  "use strict";

  /* -------------------------------------------------------------------- */
  /* 1. Language catalogue                                                 */
  /* -------------------------------------------------------------------- */

  const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ur", name: "Urdu" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "bn", name: "Bengali" },
    { code: "fa", name: "Persian" },
    { code: "sv", name: "Swedish" },
    { code: "el", name: "Greek" },
  ];

  /* -------------------------------------------------------------------- */
  /* 2. Element references                                                 */
  /* -------------------------------------------------------------------- */

  const sourceLangEl = document.getElementById("sourceLang");
  const targetLangEl = document.getElementById("targetLang");
  const swapBtn = document.getElementById("swapBtn");
  const boardStrip = document.getElementById("boardStrip");

  const sourceTextEl = document.getElementById("sourceText");
  const charCountEl = document.getElementById("charCount");
  const clearBtn = document.getElementById("clearBtn");
  const micBtn = document.getElementById("micBtn");

  const translateBtn = document.getElementById("translateBtn");

  const resultBody = document.getElementById("resultBody");
  const placeholderText = document.getElementById("placeholderText");
  const statusPill = document.getElementById("statusPill");
  const copyBtn = document.getElementById("copyBtn");
  const speakBtn = document.getElementById("speakBtn");

  const MAX_CHARS = 500;
  let lastTranslation = "";

  /* -------------------------------------------------------------------- */
  /* 3. Populate language dropdowns                                        */
  /* -------------------------------------------------------------------- */

  function populateSelect(selectEl, defaultCode) {
    LANGUAGES.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.name;
      if (lang.code === defaultCode) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  populateSelect(sourceLangEl, "en");
  populateSelect(targetLangEl, "fr");

  function updateBoardStrip() {
    const from = sourceLangEl.value.toUpperCase();
    const to = targetLangEl.value.toUpperCase();
    boardStrip.textContent = `${from}   →   ${to}`;
  }
  updateBoardStrip();

  sourceLangEl.addEventListener("change", updateBoardStrip);
  targetLangEl.addEventListener("change", updateBoardStrip);

  /* -------------------------------------------------------------------- */
  /* 4. Swap languages                                                     */
  /* -------------------------------------------------------------------- */

  swapBtn.addEventListener("click", () => {
    const temp = sourceLangEl.value;
    sourceLangEl.value = targetLangEl.value;
    targetLangEl.value = temp;
    updateBoardStrip();

    swapBtn.classList.add("spin");
    setTimeout(() => swapBtn.classList.remove("spin"), 250);

    // If there's already a translation, swap the text too for convenience.
    if (lastTranslation) {
      const temp2 = sourceTextEl.value;
      sourceTextEl.value = lastTranslation;
      updateCharCount();
      renderResult(temp2, "idle");
    }
  });

  /* -------------------------------------------------------------------- */
  /* 5. Character count + clear                                            */
  /* -------------------------------------------------------------------- */

  function updateCharCount() {
    charCountEl.textContent = `${sourceTextEl.value.length} / ${MAX_CHARS}`;
  }

  sourceTextEl.addEventListener("input", updateCharCount);
  updateCharCount();

  clearBtn.addEventListener("click", () => {
    sourceTextEl.value = "";
    updateCharCount();
    sourceTextEl.focus();
    resetResult();
  });

  /* -------------------------------------------------------------------- */
  /* 6. Translate                                                          */
  /* -------------------------------------------------------------------- */

  translateBtn.addEventListener("click", handleTranslate);

  sourceTextEl.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleTranslate();
    }
  });

  async function handleTranslate() {
    const text = sourceTextEl.value.trim();
    if (!text) {
      sourceTextEl.focus();
      return;
    }

    const source = sourceLangEl.value;
    const target = targetLangEl.value;

    if (source === target) {
      renderResult(text, "live");
      return;
    }

    setLoading(true);
    setStatus("Translating…", "live");

    try {
      const translated = await translateText(text, source, target);
      lastTranslation = translated;
      renderResult(translated, "live");
    } catch (err) {
      console.error(err);
      renderError("Couldn't reach the translation service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Calls a translation API and resolves with the translated string.
   *
   * Currently wired to MyMemory (free, no API key, ~500 chars/request,
   * fine for demos and prototyping).
   *
   * --- To use Google Cloud Translate instead ---
   *   const res = await fetch(
   *     `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
   *     {
   *       method: "POST",
   *       headers: { "Content-Type": "application/json" },
   *       body: JSON.stringify({ q: text, source, target, format: "text" }),
   *     }
   *   );
   *   const data = await res.json();
   *   return data.data.translations[0].translatedText;
   *
   * --- To use Microsoft Translator instead ---
   *   const res = await fetch(
   *     `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${source}&to=${target}`,
   *     {
   *       method: "POST",
   *       headers: {
   *         "Ocp-Apim-Subscription-Key": API_KEY,
   *         "Ocp-Apim-Subscription-Region": REGION,
   *         "Content-Type": "application/json",
   *       },
   *       body: JSON.stringify([{ Text: text }]),
   *     }
   *   );
   *   const data = await res.json();
   *   return data[0].translations[0].text;
   *
   * Both require a paid/free-tier API key from Google Cloud Console or
   * Azure Cognitive Services — never hardcode real keys in client-side
   * code shipped to users; proxy the request through your own backend.
   */
  async function translateText(text, source, target) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${source}|${target}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    if (!translated) throw new Error("No translation returned");
    return translated;
  }

  /* -------------------------------------------------------------------- */
  /* 7. Render result states                                               */
  /* -------------------------------------------------------------------- */

  function setLoading(isLoading) {
    translateBtn.disabled = isLoading;
    translateBtn.classList.toggle("loading", isLoading);
    translateBtn.querySelector(".translate-btn-text").textContent = isLoading
      ? "Translating"
      : "Translate";
  }

  function setStatus(text, kind) {
    statusPill.textContent = text;
    statusPill.classList.remove("live", "error");
    if (kind) statusPill.classList.add(kind);
  }

  function renderResult(text, kind) {
    resultBody.innerHTML = `<p class="result-text">${escapeHtml(text)}</p>`;
    setStatus(kind === "live" ? "Translated" : "Ready", kind);
    copyBtn.disabled = false;
    speakBtn.disabled = false;
  }

  function renderError(message) {
    resultBody.innerHTML = `<p class="placeholder-text">${escapeHtml(message)}</p>`;
    setStatus("Error", "error");
    copyBtn.disabled = true;
    speakBtn.disabled = true;
  }

  function resetResult() {
    resultBody.innerHTML = `<p class="placeholder-text" id="placeholderText">Your translation will land here.</p>`;
    setStatus("Ready", null);
    copyBtn.disabled = true;
    speakBtn.disabled = true;
    lastTranslation = "";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* -------------------------------------------------------------------- */
  /* 8. Copy to clipboard                                                  */
  /* -------------------------------------------------------------------- */

  copyBtn.addEventListener("click", async () => {
    const resultTextEl = resultBody.querySelector(".result-text");
    if (!resultTextEl) return;

    try {
      await navigator.clipboard.writeText(resultTextEl.textContent);
      copyBtn.textContent = "✅ Copied";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "📋 Copy";
        copyBtn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      console.error("Clipboard write failed", err);
    }
  });

  /* -------------------------------------------------------------------- */
  /* 9. Text-to-speech (Web Speech API)                                    */
  /* -------------------------------------------------------------------- */

  speakBtn.addEventListener("click", () => {
    const resultTextEl = resultBody.querySelector(".result-text");
    if (!resultTextEl || !("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(resultTextEl.textContent);
    utterance.lang = targetLangEl.value;
    window.speechSynthesis.cancel(); // stop any current speech
    window.speechSynthesis.speak(utterance);
  });

  /* -------------------------------------------------------------------- */
  /* 10. Speech-to-text for input (optional, Chrome/Edge support)          */
  /* -------------------------------------------------------------------- */

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.addEventListener("click", () => {
      recognition.lang = sourceLangEl.value;
      micBtn.textContent = "🎙️ Listening…";
      recognition.start();
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      sourceTextEl.value = (sourceTextEl.value + " " + transcript).trim();
      updateCharCount();
    });

    recognition.addEventListener("end", () => {
      micBtn.textContent = "🎤 Speak";
    });

    recognition.addEventListener("error", () => {
      micBtn.textContent = "🎤 Speak";
    });
  } else {
    // Speech recognition not supported in this browser — hide the control.
    micBtn.style.display = "none";
  }
})();

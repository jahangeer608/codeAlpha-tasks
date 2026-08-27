/* ==========================================================================
   Lingo Board — app logic
   Primary translation: MyMemory Translation API (no key required):
   https://mymemory.translated.net/doc/spec.php
   Automatic fallback: Lingva Translate (public, no key) if MyMemory is
   unreachable or its free quota is exhausted for the day.

   Swap in Google Cloud Translate / Microsoft Translator by editing
   callMyMemory() / callLingva() below — see comments inside translateText().
   ========================================================================== */

(() => {
  "use strict";

  /* -------------------------------------------------------------------- */
  /* 1. Language catalogue                                                 */
  /* -------------------------------------------------------------------- */

  const LANGUAGES = [
    { code: "en", name: "English", locale: "en-US" },
    { code: "es", name: "Spanish", locale: "es-ES" },
    { code: "fr", name: "French", locale: "fr-FR" },
    { code: "de", name: "German", locale: "de-DE" },
    { code: "it", name: "Italian", locale: "it-IT" },
    { code: "pt", name: "Portuguese", locale: "pt-PT" },
    { code: "ur", name: "Urdu", locale: "ur-PK" },
    { code: "hi", name: "Hindi", locale: "hi-IN" },
    { code: "ar", name: "Arabic", locale: "ar-SA" },
    { code: "zh", name: "Chinese (Simplified)", locale: "zh-CN" },
    { code: "ja", name: "Japanese", locale: "ja-JP" },
    { code: "ko", name: "Korean", locale: "ko-KR" },
    { code: "ru", name: "Russian", locale: "ru-RU" },
    { code: "tr", name: "Turkish", locale: "tr-TR" },
    { code: "nl", name: "Dutch", locale: "nl-NL" },
    { code: "pl", name: "Polish", locale: "pl-PL" },
    { code: "bn", name: "Bengali", locale: "bn-BD" },
    { code: "fa", name: "Persian", locale: "fa-IR" },
    { code: "sv", name: "Swedish", locale: "sv-SE" },
    { code: "el", name: "Greek", locale: "el-GR" },
    { code: "vi", name: "Vietnamese", locale: "vi-VN" },
    { code: "th", name: "Thai", locale: "th-TH" },
    { code: "id", name: "Indonesian", locale: "id-ID" },
    { code: "ms", name: "Malay", locale: "ms-MY" },
    { code: "he", name: "Hebrew", locale: "he-IL" },
    { code: "uk", name: "Ukrainian", locale: "uk-UA" },
    { code: "cs", name: "Czech", locale: "cs-CZ" },
    { code: "ro", name: "Romanian", locale: "ro-RO" },
    { code: "hu", name: "Hungarian", locale: "hu-HU" },
    { code: "fi", name: "Finnish", locale: "fi-FI" },
    { code: "da", name: "Danish", locale: "da-DK" },
    { code: "no", name: "Norwegian", locale: "nb-NO" },
    { code: "tl", name: "Filipino", locale: "fil-PH" },
    { code: "pa", name: "Punjabi", locale: "pa-IN" },
    { code: "ta", name: "Tamil", locale: "ta-IN" },
    { code: "te", name: "Telugu", locale: "te-IN" },
    { code: "mr", name: "Marathi", locale: "mr-IN" },
    { code: "gu", name: "Gujarati", locale: "gu-IN" },
    { code: "kn", name: "Kannada", locale: "kn-IN" },
    { code: "ml", name: "Malayalam", locale: "ml-IN" },
    { code: "sw", name: "Swahili", locale: "sw-KE" },
    { code: "af", name: "Afrikaans", locale: "af-ZA" },
    { code: "sr", name: "Serbian", locale: "sr-RS" },
    { code: "hr", name: "Croatian", locale: "hr-HR" },
    { code: "sk", name: "Slovak", locale: "sk-SK" },
    { code: "bg", name: "Bulgarian", locale: "bg-BG" },
  ];

  const AUTO_OPTION = { code: "auto", name: "Detect language" };
  const localeFor = (code) => (LANGUAGES.find((l) => l.code === code) || {}).locale || code;

  /* -------------------------------------------------------------------- */
  /* 2. Element references                                                 */
  /* -------------------------------------------------------------------- */

  const sourceLangEl = document.getElementById("sourceLang");
  const targetLangEl = document.getElementById("targetLang");
  const swapBtn = document.getElementById("swapBtn");
  const boardStrip = document.getElementById("boardStrip");
  const detectedBadge = document.getElementById("detectedBadge");

  const sourceTextEl = document.getElementById("sourceText");
  const charCountEl = document.getElementById("charCount");
  const clearBtn = document.getElementById("clearBtn");
  const dictateBtn = document.getElementById("dictateBtn");
  const sourcePronounceBtn = document.getElementById("sourcePronounceBtn");

  const translateBtn = document.getElementById("translateBtn");

  const resultBody = document.getElementById("resultBody");
  const statusPill = document.getElementById("statusPill");
  const copyBtn = document.getElementById("copyBtn");
  const resultPronounceBtn = document.getElementById("resultPronounceBtn");
  const saveBtn = document.getElementById("saveBtn");

  const statNum = document.getElementById("statNum");
  const offlinePill = document.getElementById("offlinePill");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const savedList = document.getElementById("savedList");
  const savedEmpty = document.getElementById("savedEmpty");
  const savedCount = document.getElementById("savedCount");

  const themeSegmented = document.getElementById("themeSegmented");
  const rateSlider = document.getElementById("rateSlider");
  const rateValue = document.getElementById("rateValue");
  const quotaEmailEl = document.getElementById("quotaEmail");
  const clearSavedBtn = document.getElementById("clearSavedBtn");

  const navItems = document.querySelectorAll(".nav-item");

  const MAX_CHARS = 1000;
  const CHUNK_SIZE = 480; // stay under MyMemory's ~500 char/request ceiling
  const REQUEST_TIMEOUT_MS = 12000;
  let lastTranslation = "";
  let lastDetectedCode = null; // resolved code when source is "auto"

  /* -------------------------------------------------------------------- */
  /* 3. Populate language dropdowns                                        */
  /* -------------------------------------------------------------------- */

  function populateSelect(selectEl, defaultCode, includeAuto) {
    const list = includeAuto ? [AUTO_OPTION, ...LANGUAGES] : LANGUAGES;
    list.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.name;
      if (lang.code === defaultCode) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  populateSelect(sourceLangEl, "en", true);
  populateSelect(targetLangEl, "fr", false);

  function languageName(code) {
    if (code === "auto") return "Detect language";
    const match = LANGUAGES.find((l) => l.code === code);
    return match ? match.name : code.toUpperCase();
  }

  function updateBoardStrip() {
    const from = sourceLangEl.value === "auto" ? "AUTO" : sourceLangEl.value.toUpperCase();
    const to = targetLangEl.value.toUpperCase();
    boardStrip.textContent = `${from}   →   ${to}`;
  }
  updateBoardStrip();

  function hideDetectedBadge() {
    detectedBadge.hidden = true;
    detectedBadge.textContent = "";
    lastDetectedCode = null;
  }

  sourceLangEl.addEventListener("change", () => {
    updateBoardStrip();
    hideDetectedBadge();
    persistLangs();
  });
  targetLangEl.addEventListener("change", () => {
    updateBoardStrip();
    persistLangs();
  });

  /* -------------------------------------------------------------------- */
  /* 4. Lightweight client-side language detection (Unicode-script based)  */
  /* -------------------------------------------------------------------- */

  function detectLanguage(text) {
    const sample = text.trim();

    const scriptTests = [
      { code: "ko", re: /[\uac00-\ud7af]/ },
      { code: "ja", re: /[\u3040-\u30ff]/ },
      { code: "zh", re: /[\u4e00-\u9fff]/ },
      { code: "th", re: /[\u0e00-\u0e7f]/ },
      { code: "he", re: /[\u0590-\u05ff]/ },
      { code: "ur", re: /[\u0679\u0688\u0691\u06ba\u06be\u06c1\u06c2\u06d2]/ },
      { code: "fa", re: /[\u067e\u0686\u0698\u06af]/ },
      { code: "ar", re: /[\u0600-\u06ff]/ },
      { code: "hi", re: /[\u0900-\u097f]/ },
      { code: "bn", re: /[\u0980-\u09ff]/ },
      { code: "pa", re: /[\u0a00-\u0a7f]/ },
      { code: "gu", re: /[\u0a80-\u0aff]/ },
      { code: "ta", re: /[\u0b80-\u0bff]/ },
      { code: "te", re: /[\u0c00-\u0c7f]/ },
      { code: "kn", re: /[\u0c80-\u0cff]/ },
      { code: "ml", re: /[\u0d00-\u0d7f]/ },
      { code: "el", re: /[\u0370-\u03ff]/ },
      { code: "ru", re: /[\u0400-\u04ff]/ },
    ];

    for (const test of scriptTests) {
      if (test.re.test(sample)) return { code: test.code, approximate: false };
    }
    return { code: "en", approximate: true };
  }

  /* -------------------------------------------------------------------- */
  /* 5. Swap languages                                                     */
  /* -------------------------------------------------------------------- */

  swapBtn.addEventListener("click", () => {
    const currentSource = sourceLangEl.value === "auto" ? lastDetectedCode : sourceLangEl.value;

    if (!currentSource) {
      swapBtn.classList.add("shake");
      setTimeout(() => swapBtn.classList.remove("shake"), 350);
      return;
    }

    const temp = currentSource;
    sourceLangEl.value = targetLangEl.value;
    targetLangEl.value = temp;
    hideDetectedBadge();
    updateBoardStrip();
    persistLangs();

    swapBtn.classList.add("spin");
    setTimeout(() => swapBtn.classList.remove("spin"), 250);

    if (lastTranslation) {
      const previousSource = sourceTextEl.value;
      sourceTextEl.value = lastTranslation;
      updateCharCount();
      renderResult(previousSource, "idle");
    }
  });

  /* -------------------------------------------------------------------- */
  /* 6. Character count + clear                                            */
  /* -------------------------------------------------------------------- */

  function updateCharCount() {
    const len = sourceTextEl.value.length;
    charCountEl.textContent = `${len} / ${MAX_CHARS}`;
    charCountEl.classList.toggle("char-count--warn", len >= MAX_CHARS * 0.9);
    sourcePronounceBtn.disabled = len === 0;
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
  /* 7. Translate                                                          */
  /* -------------------------------------------------------------------- */

  translateBtn.addEventListener("click", handleTranslate);

  sourceTextEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  });

  async function handleTranslate() {
    const text = sourceTextEl.value.trim();
    if (!text) {
      sourceTextEl.focus();
      return;
    }

    if (!navigator.onLine) {
      renderError("You're offline. Reconnect to translate.");
      return;
    }

    let source = sourceLangEl.value;
    const target = targetLangEl.value;

    if (source === "auto") {
      const detection = detectLanguage(text);
      source = detection.code;
      lastDetectedCode = detection.code;
      detectedBadge.hidden = false;
      detectedBadge.textContent = detection.approximate
        ? `≈ ${languageName(detection.code)}`
        : languageName(detection.code);
    }

    if (source === target) {
      renderResult(text, "live");
      return;
    }

    setLoading(true);
    setStatus("Translating…", "live");
    resultBody.classList.add("is-loading");

    try {
      const translated = await translateLong(text, source, target);
      lastTranslation = translated;
      renderResult(translated, "live");
      bumpStat();
    } catch (err) {
      console.error(err);
      renderError(err.friendlyMessage || "Couldn't reach the translation service. Check your connection and try again.");
    } finally {
      setLoading(false);
      resultBody.classList.remove("is-loading");
    }
  }

  /* -------------------------------------------------------------------- */
  /* 7b. Chunking — MyMemory/Lingva work best under ~500 chars/request.    */
  /*     Split long input on sentence/word boundaries, translate each      */
  /*     chunk in order, then stitch the results back together.           */
  /* -------------------------------------------------------------------- */

  function splitIntoChunks(text, maxLen) {
    if (text.length <= maxLen) return [text];
    const chunks = [];
    let remaining = text;
    while (remaining.length > maxLen) {
      let cut = remaining.lastIndexOf(". ", maxLen);
      if (cut < maxLen * 0.4) cut = remaining.lastIndexOf(" ", maxLen);
      if (cut < 1) cut = maxLen;
      chunks.push(remaining.slice(0, cut + 1).trim());
      remaining = remaining.slice(cut + 1);
    }
    if (remaining.trim()) chunks.push(remaining.trim());
    return chunks;
  }

  async function translateLong(text, source, target) {
    const chunks = splitIntoChunks(text, CHUNK_SIZE);
    if (chunks.length === 1) return translateWithRetry(chunks[0], source, target);

    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      setStatus(`Translating ${i + 1}/${chunks.length}…`, "live");
      results.push(await translateWithRetry(chunks[i], source, target));
    }
    return results.join(" ");
  }

  async function translateWithRetry(text, source, target) {
    try {
      return await translateText(text, source, target);
    } catch (err) {
      if (err.retryable) {
        await new Promise((r) => setTimeout(r, 700));
        try {
          return await translateText(text, source, target);
        } catch (err2) {
          if (err2.tryFallback) return await callLingva(text, source, target);
          throw err2;
        }
      }
      if (err.tryFallback) return await callLingva(text, source, target);
      throw err;
    }
  }

  /**
   * Primary + fallback translation providers.
   *
   * --- To use Google Cloud Translate instead ---
   *   const res = await fetch(
   *     `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
   *     { method: "POST", headers: { "Content-Type": "application/json" },
   *       body: JSON.stringify({ q: text, source, target, format: "text" }) }
   *   );
   *   const data = await res.json();
   *   return data.data.translations[0].translatedText;
   *
   * --- To use Microsoft Translator instead ---
   *   const res = await fetch(
   *     `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${source}&to=${target}`,
   *     { method: "POST",
   *       headers: { "Ocp-Apim-Subscription-Key": API_KEY, "Ocp-Apim-Subscription-Region": REGION, "Content-Type": "application/json" },
   *       body: JSON.stringify([{ Text: text }]) }
   *   );
   *   const data = await res.json();
   *   return data[0].translations[0].text;
   *
   * Both require a paid/free-tier API key — never hardcode real keys in
   * client-side code shipped to users; proxy the request through your own backend.
   */
  async function translateText(text, source, target) {
    return callMyMemory(text, source, target);
  }

  async function withTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function callMyMemory(text, source, target) {
    const email = (quotaEmailEl && quotaEmailEl.value.trim()) || "";
    let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
    if (email) url += `&de=${encodeURIComponent(email)}`;

    let res;
    try {
      res = await withTimeout(url, {});
    } catch (err) {
      const wrapped = new Error(err.name === "AbortError" ? "Request timed out" : "Network error");
      wrapped.retryable = true;
      wrapped.tryFallback = true;
      wrapped.friendlyMessage = err.name === "AbortError"
        ? "The translation service took too long to respond. Please try again."
        : "Couldn't reach the translation service. Check your connection and try again.";
      throw wrapped;
    }

    if (!res.ok) {
      const err = new Error(`Request failed: ${res.status}`);
      err.retryable = res.status >= 500;
      err.tryFallback = true;
      err.friendlyMessage = res.status === 429
        ? "Too many requests right now — please wait a moment and try again."
        : "The translation service returned an error. Please try again.";
      throw err;
    }

    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    const status = data?.responseStatus;

    const looksLikeQuotaWarning =
      typeof translated === "string" && /MYMEMORY WARNING/i.test(translated);

    if (looksLikeQuotaWarning || (status && Number(status) !== 200)) {
      const err = new Error("Translation quota exceeded");
      err.retryable = false;
      err.tryFallback = true; // let Lingva pick up the slack instead of failing outright
      err.friendlyMessage = "The free translation quota has been reached for today.";
      throw err;
    }

    if (!translated) {
      const err = new Error("No translation returned");
      err.retryable = false;
      err.tryFallback = true;
      err.friendlyMessage = "No translation came back. Please try again.";
      throw err;
    }

    return translated;
  }

  // Fallback provider: Lingva Translate (public instance, no key, MIT-licensed
  // front end for Google Translate). Used only if MyMemory fails/quota-outs,
  // so the app keeps working globally without ever needing a paid key.
  async function callLingva(text, source, target) {
    const from = source === "auto" ? "auto" : source;
    const url = `https://lingva.ml/api/v1/${from}/${target}/${encodeURIComponent(text)}`;
    let res;
    try {
      res = await withTimeout(url, {});
    } catch (err) {
      const wrapped = new Error("Fallback network error");
      wrapped.retryable = false;
      wrapped.friendlyMessage = "Couldn't reach any translation service. Check your connection and try again.";
      throw wrapped;
    }
    if (!res.ok) {
      const err = new Error(`Fallback failed: ${res.status}`);
      err.retryable = false;
      err.friendlyMessage = "Translation services are temporarily unavailable. Please try again shortly.";
      throw err;
    }
    const data = await res.json();
    if (!data?.translation) {
      const err = new Error("No fallback translation returned");
      err.friendlyMessage = "No translation came back. Please try again.";
      throw err;
    }
    return data.translation;
  }

  /* -------------------------------------------------------------------- */
  /* 8. Render result states                                               */
  /* -------------------------------------------------------------------- */

  function setLoading(isLoading) {
    translateBtn.disabled = isLoading;
    translateBtn.classList.toggle("loading", isLoading);
    translateBtn.querySelector(".translate-btn-text").textContent = isLoading ? "Translating" : "Translate";
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
    resultPronounceBtn.disabled = !ttsSupported;
    saveBtn.disabled = false;
    saveBtn.textContent = "☆ Save";
    saveBtn.classList.remove("is-saved");
  }

  function renderError(message) {
    resultBody.innerHTML = `<p class="placeholder-text">${escapeHtml(message)}</p>`;
    setStatus("Error", "error");
    copyBtn.disabled = true;
    resultPronounceBtn.disabled = true;
    saveBtn.disabled = true;
  }

  function resetResult() {
    resultBody.innerHTML = `<p class="placeholder-text" id="placeholderText">Your translation will land here.</p>`;
    setStatus("Ready", null);
    copyBtn.disabled = true;
    resultPronounceBtn.disabled = true;
    saveBtn.disabled = true;
    lastTranslation = "";
    hideDetectedBadge();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* -------------------------------------------------------------------- */
  /* 9. Copy to clipboard (with fallback for non-secure contexts)         */
  /* -------------------------------------------------------------------- */

  copyBtn.addEventListener("click", async () => {
    const resultTextEl = resultBody.querySelector(".result-text");
    if (!resultTextEl) return;
    const text = resultTextEl.textContent;

    async function copyViaClipboardApi() {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
    }

    function copyViaFallback() {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.focus();
      helper.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(helper);
      if (!ok) throw new Error("execCommand copy failed");
    }

    try {
      try {
        await copyViaClipboardApi();
      } catch {
        copyViaFallback();
      }
      copyBtn.textContent = "✅ Copied";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "📋 Copy";
        copyBtn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      console.error("Clipboard write failed", err);
      copyBtn.textContent = "⚠️ Couldn't copy";
      setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 1500);
    }
  });

  /* -------------------------------------------------------------------- */
  /* 10. Pronounce — text-to-speech (Web Speech API)                       */
  /* -------------------------------------------------------------------- */

  const ttsSupported = "speechSynthesis" in window;
  let cachedVoices = [];

  function refreshVoices() {
    if (ttsSupported) cachedVoices = window.speechSynthesis.getVoices();
  }
  if (ttsSupported) {
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }

  function bestVoiceFor(langCode) {
    if (!cachedVoices.length) return null;
    const locale = localeFor(langCode);
    return (
      cachedVoices.find((v) => v.lang === locale) ||
      cachedVoices.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase())) ||
      null
    );
  }

  function currentRate() {
    return rateSlider ? Number(rateSlider.value) : 1;
  }

  function speak(text, langCode) {
    if (!ttsSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeFor(langCode);
    utterance.rate = currentRate();
    const voice = bestVoiceFor(langCode);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  if (ttsSupported) {
    resultPronounceBtn.addEventListener("click", () => {
      const resultTextEl = resultBody.querySelector(".result-text");
      if (!resultTextEl) return;
      speak(resultTextEl.textContent, targetLangEl.value);
    });

    sourcePronounceBtn.addEventListener("click", () => {
      const text = sourceTextEl.value.trim();
      if (!text) return;
      const lang = sourceLangEl.value === "auto" ? (lastDetectedCode || "en") : sourceLangEl.value;
      speak(text, lang);
    });
  } else {
    resultPronounceBtn.style.display = "none";
    sourcePronounceBtn.style.display = "none";
  }

  /* -------------------------------------------------------------------- */
  /* 11. Dictate — speech-to-text for input                                */
  /* -------------------------------------------------------------------- */

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let isListening = false;

    dictateBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      recognition.lang = sourceLangEl.value === "auto" ? "en-US" : localeFor(sourceLangEl.value);
      try {
        recognition.start();
        isListening = true;
        dictateBtn.textContent = "🎙️ Listening…";
        dictateBtn.classList.add("is-listening");
      } catch (err) {
        console.error("Speech recognition failed to start", err);
        isListening = false;
        dictateBtn.textContent = "🎤 Dictate";
        dictateBtn.classList.remove("is-listening");
      }
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      sourceTextEl.value = (sourceTextEl.value + " " + transcript).trim().slice(0, MAX_CHARS);
      updateCharCount();
    });

    recognition.addEventListener("end", () => {
      isListening = false;
      dictateBtn.textContent = "🎤 Dictate";
      dictateBtn.classList.remove("is-listening");
    });

    recognition.addEventListener("error", () => {
      isListening = false;
      dictateBtn.textContent = "🎤 Dictate";
      dictateBtn.classList.remove("is-listening");
    });
  } else {
    dictateBtn.style.display = "none";
  }

  /* -------------------------------------------------------------------- */
  /* 12. Remember last-used languages across visits                        */
  /* -------------------------------------------------------------------- */

  function safeLocalStorage() {
    try {
      const k = "__lingoboard_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }
  const storageOk = safeLocalStorage();

  (function restoreLangs() {
    if (!storageOk) return;
    try {
      const saved = JSON.parse(localStorage.getItem("lingoboard:langs") || "null");
      if (saved && saved.source && saved.target) {
        if ([...sourceLangEl.options].some((o) => o.value === saved.source)) sourceLangEl.value = saved.source;
        if ([...targetLangEl.options].some((o) => o.value === saved.target)) targetLangEl.value = saved.target;
        updateBoardStrip();
      }
    } catch {
      /* corrupted value — ignore, defaults stand */
    }
  })();

  function persistLangs() {
    if (!storageOk) return;
    try {
      localStorage.setItem("lingoboard:langs", JSON.stringify({ source: sourceLangEl.value, target: targetLangEl.value }));
    } catch {
      /* storage unavailable (e.g. private browsing) — non-critical */
    }
  }

  /* -------------------------------------------------------------------- */
  /* 13. View switching (Translate / Saved / Settings)                     */
  /* -------------------------------------------------------------------- */

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.viewTarget;
      document.body.dataset.view = target;
      navItems.forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  /* -------------------------------------------------------------------- */
  /* 14. Saved translations                                                */
  /* -------------------------------------------------------------------- */

  function loadSaved() {
    if (!storageOk) return [];
    try {
      return JSON.parse(localStorage.getItem("lingoboard:saved") || "[]");
    } catch {
      return [];
    }
  }

  function writeSaved(list) {
    if (!storageOk) return;
    try {
      localStorage.setItem("lingoboard:saved", JSON.stringify(list));
    } catch {
      /* ignore quota errors */
    }
  }

  function renderSaved() {
    const items = loadSaved();
    savedCount.textContent = items.length;
    savedEmpty.hidden = items.length > 0;
    savedList.querySelectorAll(".saved-item").forEach((el) => el.remove());

    items.slice().reverse().forEach((item) => {
      const el = document.createElement("div");
      el.className = "saved-item";
      el.innerHTML = `
        <div class="saved-item-langs">${item.source.toUpperCase()} → ${item.target.toUpperCase()}</div>
        <p class="saved-item-source">${escapeHtml(item.sourceText)}</p>
        <p class="saved-item-target">${escapeHtml(item.targetText)}</p>
        <div class="saved-item-actions">
          <button class="ghost-btn use-btn">↩ Use</button>
          <button class="ghost-btn ghost-btn--danger delete-btn">🗑 Delete</button>
        </div>
      `;
      el.querySelector(".use-btn").addEventListener("click", () => {
        sourceLangEl.value = item.source;
        targetLangEl.value = item.target;
        sourceTextEl.value = item.sourceText;
        updateCharCount();
        updateBoardStrip();
        renderResult(item.targetText, "live");
        lastTranslation = item.targetText;
        document.body.dataset.view = "translate";
        navItems.forEach((b) => b.classList.toggle("is-active", b.dataset.viewTarget === "translate"));
      });
      el.querySelector(".delete-btn").addEventListener("click", () => {
        const remaining = loadSaved().filter((x) => x.id !== item.id);
        writeSaved(remaining);
        renderSaved();
      });
      savedList.appendChild(el);
    });
  }
  renderSaved();

  saveBtn.addEventListener("click", () => {
    const resultTextEl = resultBody.querySelector(".result-text");
    if (!resultTextEl || saveBtn.disabled) return;
    const items = loadSaved();
    items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      source: sourceLangEl.value === "auto" ? (lastDetectedCode || "auto") : sourceLangEl.value,
      target: targetLangEl.value,
      sourceText: sourceTextEl.value.trim(),
      targetText: resultTextEl.textContent,
    });
    writeSaved(items);
    renderSaved();
    saveBtn.textContent = "★ Saved";
    saveBtn.classList.add("is-saved");
  });

  clearSavedBtn.addEventListener("click", () => {
    if (!confirm("Clear all saved translations? This can't be undone.")) return;
    writeSaved([]);
    renderSaved();
  });

  /* -------------------------------------------------------------------- */
  /* 15. Settings — theme, voice speed, quota email                        */
  /* -------------------------------------------------------------------- */

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    themeIcon.textContent = theme === "light" ? "☀" : "☾";
    themeSegmented.querySelectorAll(".segmented-btn").forEach((b) => {
      const active = b.dataset.themeChoice === theme;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-checked", String(active));
    });
    if (storageOk) {
      try { localStorage.setItem("lingoboard:theme", theme); } catch { /* ignore */ }
    }
  }

  const savedTheme = storageOk ? localStorage.getItem("lingoboard:theme") : null;
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(savedTheme || (prefersLight ? "light" : "dark"));

  themeToggle.addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "light" ? "dark" : "light");
  });
  themeSegmented.addEventListener("click", (e) => {
    const btn = e.target.closest(".segmented-btn");
    if (btn) applyTheme(btn.dataset.themeChoice);
  });

  if (storageOk) {
    const savedRate = localStorage.getItem("lingoboard:rate");
    if (savedRate) rateSlider.value = savedRate;
  }
  rateValue.textContent = `${Number(rateSlider.value).toFixed(1)}×`;
  rateSlider.addEventListener("input", () => {
    rateValue.textContent = `${Number(rateSlider.value).toFixed(1)}×`;
    if (storageOk) {
      try { localStorage.setItem("lingoboard:rate", rateSlider.value); } catch { /* ignore */ }
    }
  });

  if (storageOk) {
    const savedEmail = localStorage.getItem("lingoboard:email");
    if (savedEmail) quotaEmailEl.value = savedEmail;
  }
  quotaEmailEl.addEventListener("change", () => {
    if (storageOk) {
      try { localStorage.setItem("lingoboard:email", quotaEmailEl.value.trim()); } catch { /* ignore */ }
    }
  });

  /* -------------------------------------------------------------------- */
  /* 16. Daily translation counter (dashboard stat chip)                   */
  /* -------------------------------------------------------------------- */

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function readStat() {
    if (!storageOk) return 0;
    try {
      const raw = JSON.parse(localStorage.getItem("lingoboard:stat") || "null");
      if (raw && raw.day === todayKey()) return raw.count;
      return 0;
    } catch {
      return 0;
    }
  }

  function bumpStat() {
    const count = readStat() + 1;
    statNum.textContent = count;
    if (storageOk) {
      try { localStorage.setItem("lingoboard:stat", JSON.stringify({ day: todayKey(), count })); } catch { /* ignore */ }
    }
  }
  statNum.textContent = readStat();

  /* -------------------------------------------------------------------- */
  /* 17. Offline handling                                                  */
  /* -------------------------------------------------------------------- */

  function updateOnlineStatus() {
    offlinePill.hidden = navigator.onLine;
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();
})();

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// Types
type LangCode = "en" | "hi" | "hinglish";
type DictEngine = "free-dictionary" | "datamuse" | "wiktionary" | "libretranslate";
type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "determiner" | "unknown";

interface DefinitionMeaning {
  partOfSpeech: PartOfSpeech;
  definitions: Array<{
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: DefinitionMeaning[];
  origin?: string;
  sourceUrls?: string[];
  license?: { name: string; url: string };
  cachedAt?: number;
  engine?: DictEngine;
  frequency?: "Common" | "Uncommon" | "Rare";
}

interface TranslationResult {
  translatedText: string;
  detectedLang?: string;
  detectedLanguage?: string;
  engine: string;
}

interface SearchHistoryItem {
  word: string;
  timestamp: number;
  lang: LangCode;
  engine: DictEngine;
}

interface SynonymResult {
  word: string;
  score?: number;
  tags?: string[];
}

interface LangPack {
  code: LangCode;
  name: string;
  ui: Record<string, string>;
}

// Language packs
const LANG_PACKS: Record<LangCode, LangPack> = {
  en: {
    code: "en",
    name: "English",
    ui: {
      title: "PrivMITLab LexiCore",
      tagline: "Open Knowledge • Zero Tracking • Full Control",
      privacyNotice: "PrivMITLab LexiCore does not track users or collect personal data.",
      apiWarning: "Dictionary lookups may query public APIs. No user data is collected by PrivMITLab.",
      searchPlaceholder: "Search a word, phrase, or text...",
      selectEngines: "Dictionary Engines",
      searchBtn: "Search",
      recent: "Recent",
      clearHistory: "Clear History",
      exportData: "Export",
      importData: "Import",
      offlineTools: "Offline Tools",
      wordCounter: "Words",
      charCounter: "Characters",
      readability: "Readability",
      freqCommon: "Common",
      freqUncommon: "Uncommon",
      freqRare: "Rare",
      synonyms: "Synonyms",
      antonyms: "Antonyms",
      examples: "Examples",
      pronunciation: "Pronunciation",
      etymology: "Etymology",
      definitions: "Definitions",
      translation: "Translation",
      detectedLang: "Detected",
      from: "From",
      to: "To",
      translateBtn: "Translate",
      play: "Play",
      pause: "Pause",
      copy: "Copy",
      copied: "Copied!",
      cacheBadge: "Cached",
      noResults: "No results found. Try a different word or select more engines.",
      historyCleared: "History cleared",
      dataExported: "Data exported",
      dataImported: "Data imported",
      settings: "Settings",
      highContrast: "High Contrast",
      language: "Language",
      cacheSize: "Cache",
      entries: "entries",
      clearCache: "Clear Cache",
      toolsTextLabel: "Analyze text",
      analyzeBtn: "Analyze",
      translating: "Translating...",
      translationError: "Translation failed. Try again or use different text.",
      selectEngine: "Select at least one engine",
      noAudio: "No audio available",
      related: "Related",
      rhymes: "Rhymes",
    },
  },
  hi: {
    code: "hi",
    name: "हिन्दी",
    ui: {
      title: "PrivMITLab LexiCore",
      tagline: "खुला ज्ञान • शून्य ट्रैकिंग • पूर्ण नियंत्रण",
      privacyNotice: "PrivMITLab LexiCore उपयोगकर्ताओं को ट्रैक नहीं करता।",
      apiWarning: "शब्दकोश खोज सार्वजनिक APIs का उपयोग कर सकती है।",
      searchPlaceholder: "शब्द, वाक्यांश या टेक्स्ट खोजें...",
      selectEngines: "डिक्शनरी इंजन",
      searchBtn: "खोजें",
      recent: "हाल की",
      clearHistory: "इतिहास हटाएं",
      exportData: "निर्यात",
      importData: "आयात",
      offlineTools: "ऑफ़लाइन टूल्स",
      wordCounter: "शब्द",
      charCounter: "अक्षर",
      readability: "पठनीयता",
      freqCommon: "आम",
      freqUncommon: "असामान्य",
      freqRare: "दुर्लभ",
      synonyms: "समानार्थी",
      antonyms: "विलोम",
      examples: "उदाहरण",
      pronunciation: "उच्चारण",
      etymology: "व्युत्पत्ति",
      definitions: "अर्थ",
      translation: "अनुवाद",
      detectedLang: "पहचानी गई",
      from: "से",
      to: "में",
      translateBtn: "अनुवाद करें",
      play: "चलाएं",
      pause: "रोकें",
      copy: "कॉपी",
      copied: "कॉपी किया!",
      cacheBadge: "कैश्ड",
      noResults: "कोई परिणाम नहीं मिला।",
      historyCleared: "इतिहास हटाया गया",
      dataExported: "डेटा निर्यातित",
      dataImported: "डेटा आयातित",
      settings: "सेटिंग्स",
      highContrast: "उच्च कंट्रास्ट",
      language: "भाषा",
      cacheSize: "कैश",
      entries: "प्रविष्टियां",
      clearCache: "कैश हटाएं",
      toolsTextLabel: "टेक्स्ट विश्लेषण",
      analyzeBtn: "विश्लेषण",
      translating: "अनुवाद हो रहा है...",
      translationError: "अनुवाद विफल। पुनः प्रयास करें।",
      selectEngine: "कम से कम एक इंजन चुनें",
      noAudio: "ऑडियो उपलब्ध नहीं",
      related: "संबंधित",
      rhymes: "तुकबंद",
    },
  },
  hinglish: {
    code: "hinglish",
    name: "Hinglish",
    ui: {
      title: "PrivMITLab LexiCore",
      tagline: "Open Knowledge • Zero Tracking • Full Control",
      privacyNotice: "PrivMITLab LexiCore kisi user ko track nahi karta.",
      apiWarning: "Dictionary lookups public APIs use kar sakti hai.",
      searchPlaceholder: "Word, phrase ya text search karo...",
      selectEngines: "Dictionary Engines",
      searchBtn: "Search",
      recent: "Recent",
      clearHistory: "History Clear",
      exportData: "Export",
      importData: "Import",
      offlineTools: "Offline Tools",
      wordCounter: "Words",
      charCounter: "Characters",
      readability: "Readability",
      freqCommon: "Common",
      freqUncommon: "Uncommon",
      freqRare: "Rare",
      synonyms: "Synonyms",
      antonyms: "Antonyms",
      examples: "Examples",
      pronunciation: "Pronunciation",
      etymology: "Etymology",
      definitions: "Definitions",
      translation: "Translation",
      detectedLang: "Detected",
      from: "From",
      to: "To",
      translateBtn: "Translate",
      play: "Play",
      pause: "Pause",
      copy: "Copy",
      copied: "Copied!",
      cacheBadge: "Cached",
      noResults: "Koi result nahi mila. Dubara try karo.",
      historyCleared: "History clear ho gaya",
      dataExported: "Data export ho gaya",
      dataImported: "Data import ho gaya",
      settings: "Settings",
      highContrast: "High Contrast",
      language: "Language",
      cacheSize: "Cache",
      entries: "entries",
      clearCache: "Clear Cache",
      toolsTextLabel: "Text Analyze",
      analyzeBtn: "Analyze",
      translating: "Translating...",
      translationError: "Translation fail ho gaya. Dobara try karo.",
      selectEngine: "Kam se ek engine select karo",
      noAudio: "Audio available nahi",
      related: "Related",
      rhymes: "Rhymes",
    },
  },
};

// Utilities
const STORAGE_KEYS = {
  history: "plx_history_v1",
  cache: "plx_cache_v1",
  settings: "plx_settings_v1",
  lang: "plx_lang_v1",
};

function sanitize(input: string) {
  return input.replace(/[<>'"]/g, "").slice(0, 256).trim();
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString();
}

function estimateFrequency(word: string): DictionaryResult["frequency"] {
  const len = word.length;
  const commonWords = ["the", "and", "for", "with", "from", "this", "that", "have", "were", "been", "your", "their", "are", "was", "but", "not", "you", "all", "can", "had", "her", "she", "him", "his", "how", "its", "may", "now", "old", "see", "than", "time", "way", "what", "when", "who", "will", "with", "the"];
  if (len <= 3 || commonWords.includes(word.toLowerCase())) return "Common";
  if (len <= 6) return "Common";
  if (len <= 10) return "Uncommon";
  return "Rare";
}

// Local storage
const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// Cache
type CacheMap = Record<string, DictionaryResult>;
function cacheKey(engine: DictEngine, word: string, lang: string) {
  return `${engine}::${lang}::${word.toLowerCase()}`;
}

// Rate limiter
const rateLimiter = (() => {
  const buckets = new Map<string, number[]>();
  const LIMIT = 8;
  const WINDOW = 10_000;
  return {
    allow(engine: string) {
      const now = Date.now();
      const arr = buckets.get(engine) ?? [];
      const filtered = arr.filter((t) => now - t < WINDOW);
      if (filtered.length >= LIMIT) return false;
      filtered.push(now);
      buckets.set(engine, filtered);
      return true;
    },
  };
})();

// API functions
async function fetchFreeDictionary(word: string, lang = "en"): Promise<DictionaryResult | null> {
  if (!rateLimiter.allow("free-dict")) throw new Error("Rate limit");
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${encodeURIComponent(lang)}/${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || !json[0]) return null;
    const entry = json[0];
    return {
      word: entry.word ?? word,
      phonetic: entry.phonetic,
      phonetics: entry.phonetics,
      meanings: (entry.meanings ?? []).map((m: any) => ({
        partOfSpeech: (m.partOfSpeech ?? "unknown") as PartOfSpeech,
        definitions: (m.definitions ?? []).map((d: any) => ({
          definition: d.definition,
          example: d.example,
          synonyms: d.synonyms,
          antonyms: d.antonyms,
        })),
        synonyms: m.synonyms,
        antonyms: m.antonyms,
      })),
      sourceUrls: entry.sourceUrls,
      license: entry.license,
      engine: "free-dictionary",
      cachedAt: Date.now(),
      frequency: estimateFrequency(word),
    };
  } catch {
    return null;
  }
}

async function fetchDatamuseRelated(word: string) {
  if (!rateLimiter.allow("datamuse")) throw new Error("Rate limit");
  try {
    const [syn, ant, rel, rhy] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=15`).then((r) => r.json()).catch(() => []),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=15`).then((r) => r.json()).catch(() => []),
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15`).then((r) => r.json()).catch(() => []),
      fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=10`).then((r) => r.json()).catch(() => []),
    ]);
    return {
      synonyms: (syn as SynonymResult[]).map((s) => s.word),
      antonyms: (ant as SynonymResult[]).map((s) => s.word),
      related: (rel as SynonymResult[]).map((s) => s.word),
      rhymes: (rhy as SynonymResult[]).map((s) => s.word),
    };
  } catch {
    return null;
  }
}

async function fetchWiktionary(word: string, lang = "en") {
  if (!rateLimiter.allow("wiktionary")) throw new Error("Rate limit");
  try {
    const url = `https://${lang}.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    let origin: string | undefined;
    const extract = json.extract;
    if (extract) {
      const m = extract.match(/From (Latin|Greek|Old English|French|Sanskrit|Hindi|Arabic|German|Spanish|Proto-Indo-European)[^.,;]*/i);
      if (m) origin = m[0];
    }
    return { origin, sourceUrls: json.content_urls ? [json.content_urls.desktop?.page] : undefined };
  } catch {
    return null;
  }
}

// Translation with MyMemory (free, no key) + LibreTranslate fallback
async function translateLibre(text: string, source: string, target: string): Promise<TranslationResult | null> {
  if (!rateLimiter.allow("libre")) throw new Error("Rate limit");
  
  // Try MyMemory first - completely free, CORS-friendly, no API key
  try {
    // Detect source if auto
    let actualSource = source;
    if (source === "auto") {
      actualSource = detectLanguage(text);
    }
    
    const langPair = `${actualSource}|${target}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${encodeURIComponent(langPair)}`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const json = await res.json();
      const translated = json?.responseData?.translatedText;
      // Check it's not an error message
      if (translated && 
          !translated.includes('INVALID') && 
          !translated.includes('LIMIT') &&
          !translated.includes('PLEASE') &&
          translated.trim().length > 0 &&
          translated.toLowerCase() !== text.toLowerCase()) {
        return {
          translatedText: translated,
          detectedLang: actualSource,
          detectedLanguage: actualSource,
          engine: "MyMemory",
        };
      }
    }
  } catch (e) {
    console.warn("MyMemory failed:", e);
  }
  
  // Fallback to LibreTranslate instances
  const instances = [
    "https://translate.argosopentech.com/translate",
    "https://translate.terraprint.co/translate",
    "https://libretranslate.de/translate",
  ];

  for (let i = 0; i < instances.length; i++) {
    const url = instances[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text.slice(0, 1000),
          source: source === "auto" ? detectLanguage(text) : source,
          target,
          format: "text",
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const json = await res.json();
        if (json.translatedText && json.translatedText.trim()) {
          return {
            translatedText: json.translatedText,
            detectedLang: json.detected?.language || json.detectedLanguage || source,
            detectedLanguage: json.detected?.language || json.detectedLanguage || source,
            engine: "LibreTranslate",
          };
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Language detection
function detectLanguage(text: string): string {
  const t = text.trim();
  if (!t) return "en";
  if (/[\u0900-\u097F]/.test(t)) return "hi";
  if (/[\u0600-\u06FF]/.test(t)) return "ar";
  if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(t)) return "ja";
  if (/[áéíóúñçàèìòùäöüß]/i.test(t)) return "es";
  if (/[äöüß]/i.test(t)) return "de";
  if (/[a-zA-Z]/.test(t)) return "en";
  return "en";
}

// Offline tools
function countWords(text: string) {
  const words = text.trim().match(/\b\w+\b/g);
  return words ? words.length : 0;
}

function fleschReadingEase(text: string) {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const wordsArr = text.trim().match(/\b\w+\b/g) || [];
  const words = wordsArr.length || 1;
  const syllables = wordsArr.reduce((sum, w) => sum + Math.max(1, (w.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length), 0);
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Main App
export default function App() {
  const [lang, setLang] = useState<LangCode>(() => storage.get<LangCode>(STORAGE_KEYS.lang, "en"));
  const t = useMemo(() => LANG_PACKS[lang].ui, [lang]);

  const [query, setQuery] = useState("");
  const [engines, setEngines] = useState<DictEngine[]>(["free-dictionary", "datamuse"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [extra, setExtra] = useState<{ synonyms?: string[]; antonyms?: string[]; related?: string[]; rhymes?: string[] } | null>(null);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => storage.get<SearchHistoryItem[]>(STORAGE_KEYS.history, []));
  const [cache, setCache] = useState<CacheMap>(() => storage.get<CacheMap>(STORAGE_KEYS.cache, {}));
  const [highContrast, setHighContrast] = useState<boolean>(() => storage.get(STORAGE_KEYS.settings, { highContrast: false }).highContrast ?? false);
  const [toast, setToast] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [fromLang, setFromLang] = useState("auto");
  const [toLang, setToLang] = useState("hi");
  const [translateInput, setTranslateInput] = useState("");
  const [detectInfo, setDetectInfo] = useState<string | null>(null);

  const [toolText, setToolText] = useState("Privacy-first language tools build trust. They never phone home unless you ask.");
  const [toolStats, setToolStats] = useState({ words: 0, chars: 0, readability: 0 });

  // Persist settings
  useEffect(() => { storage.set(STORAGE_KEYS.lang, lang); }, [lang]);
  useEffect(() => { storage.set(STORAGE_KEYS.history, history.slice(0, 200)); }, [history]);
  useEffect(() => { storage.set(STORAGE_KEYS.cache, cache); }, [cache]);
  useEffect(() => { storage.set(STORAGE_KEYS.settings, { highContrast }); }, [highContrast]);

  // Document title
  useEffect(() => {
    document.title = "PrivMITLab LexiCore – Privacy-First Universal Dictionary";
  }, []);

  // Tool stats
  useEffect(() => {
    setToolStats({
      words: countWords(toolText),
      chars: toolText.length,
      readability: fleschReadingEase(toolText),
    });
  }, [toolText]);

  const toggleEngine = (e: DictEngine) => {
    setEngines((prev) => {
      if (prev.includes(e)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== e);
      }
      return [...prev, e];
    });
  };

  const addHistory = useCallback((word: string, engine: DictEngine) => {
    const item: SearchHistoryItem = { word, timestamp: Date.now(), lang, engine };
    setHistory((h) => [item, ...h.filter((x) => !(x.word === word && x.lang === lang && x.engine === engine))].slice(0, 200));
  }, [lang]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const cachedResultFor = (word: string) => {
    for (const e of engines) {
      const key = cacheKey(e, word, lang);
      if (cache[key]) return { ...cache[key], engine: e } as DictionaryResult;
    }
    return null;
  };

  const handleSearch = async () => {
    const w = sanitize(query.trim());
    if (!w || engines.length === 0) {
      setError(t.selectEngine);
      return;
    }
    setError(null);
    setTranslation(null);
    setExtra(null);
    setResult(null);
    setAudioUrl(null);

    const cached = cachedResultFor(w);
    if (cached) {
      setResult(cached);
      showToast(`${t.cacheBadge}`);
      addHistory(w, cached.engine || engines[0]);
      if (engines.includes("datamuse")) {
        fetchDatamuseRelated(w).then((r) => r && setExtra(r)).catch(() => {});
      }
      return;
    }

    setLoading(true);
    try {
      let primary: DictionaryResult | null = null;

      if (engines.includes("free-dictionary")) {
        try {
          primary = await fetchFreeDictionary(w, "en");
        } catch { /* ignore */ }
      }

      if (!primary && engines.includes("wiktionary")) {
        try {
          const wik = await fetchWiktionary(w, "en");
          if (wik) {
            primary = {
              word: w,
              origin: wik.origin,
              sourceUrls: wik.sourceUrls,
              meanings: [],
              engine: "wiktionary",
              cachedAt: Date.now(),
              frequency: estimateFrequency(w),
            };
          }
        } catch { /* ignore */ }
      }

      if (primary) {
        const key = cacheKey(primary.engine || "free-dictionary", w, lang);
        setCache((c) => ({ ...c, [key]: primary! }));
        setResult(primary);
        addHistory(w, primary.engine || "free-dictionary");
        const audio = primary.phonetics?.find((p) => p.audio)?.audio;
        if (audio) setAudioUrl(audio);
      } else {
        setError(t.noResults);
      }

      if (engines.includes("datamuse")) {
        try {
          const r = await fetchDatamuseRelated(w);
          if (r) setExtra(r);
        } catch { /* ignore */ }
      }
    } catch (err: any) {
      setError(err?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    const text = sanitize(translateInput.trim());
    if (!text) return;
    setTranslateError(null);
    setTranslation(null);
    setTranslateLoading(true);
    
    try {
      const detected = fromLang === "auto" ? detectLanguage(text) : fromLang;
      if (fromLang === "auto") setDetectInfo(detected);
      
      const res = await translateLibre(text, fromLang, toLang);
      if (res) {
        setTranslation(res);
      } else {
        setTranslateError(t.translationError);
      }
    } catch {
      setTranslateError(t.translationError);
    } finally {
      setTranslateLoading(false);
    }
  };

  const playPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      showToast(t.copied);
    } catch { /* ignore */ }
  };

  const clearHistory = () => {
    setHistory([]);
    storage.remove(STORAGE_KEYS.history);
    showToast(t.historyCleared);
  };

  const clearCache = () => {
    setCache({});
    storage.remove(STORAGE_KEYS.cache);
    showToast(t.clearCache);
  };

  const exportData = () => {
    const data = {
      meta: { app: "PrivMITLab LexiCore", exportedAt: new Date().toISOString(), version: 1 },
      settings: { lang, highContrast },
      history,
      cache,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privmitlab-lexicore-data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.dataExported);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.settings?.lang && ["en", "hi", "hinglish"].includes(data.settings.lang)) setLang(data.settings.lang);
      if (typeof data.settings?.highContrast === "boolean") setHighContrast(data.settings.highContrast);
      if (Array.isArray(data.history)) setHistory(data.history.slice(0, 200));
      if (data.cache && typeof data.cache === "object") setCache(data.cache);
      showToast(t.dataImported);
    } catch {
      setError("Invalid file format");
    }
  };

  const cacheSize = Object.keys(cache).length;

  const recentWords = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const h of history) {
      const key = h.word.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(h.word);
      }
      if (list.length >= 10) break;
    }
    return list;
  }, [history]);

  const popular = ["privacy", "algorithm", "encryption", "consent", "transparency", "metadata", "anonymity", "token", "hash", "entropy"];

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={`min-h-screen bg-[#05070c] text-slate-100 selection:bg-cyan-500/30 ${highContrast ? "contrast-125" : ""}`}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.15),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] [background-image:linear-gradient(transparent_95%,rgba(255,255,255,0.4)_96%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.4)_96%)] [background-size:24px_24px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M4 4v15.5A2.5 2.5 0 0 0 6.5 22H20V6a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 6.5z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">{t.title}</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-300/70">PrivMITLab • @PrivMITLab</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cyan-100/80 md:block">
              {t.tagline}
            </div>
            <select
              aria-label={t.language}
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-400/50"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="hinglish">HN</option>
            </select>
          </div>
        </div>
      </header>

      {/* Privacy Banner */}
      <div className="relative z-10 mx-auto mt-4 max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-100/80 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>{t.privacyNotice}</span>
          </div>
          <div className="text-cyan-300/60">{t.apiWarning}</div>
        </div>
      </div>

      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 md:grid-cols-[1.3fr_0.7fr] md:px-6 md:py-6">
        {/* Left Column */}
        <section className="space-y-5">
          {/* Search Card */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-violet-300/80">
                <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 ring-1 ring-violet-400/20">Dictionary</span>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.1)]"
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40">
                    Ctrl+K
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim() || engines.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0 5 5h3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  )}
                  <span>{t.searchBtn}</span>
                </button>
              </div>

              {/* Engine Selection */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] uppercase tracking-widest text-white/40">{t.selectEngines}:</span>
                {[
                  { id: "free-dictionary", label: "Dictionary API" },
                  { id: "datamuse", label: "Datamuse" },
                  { id: "wiktionary", label: "Wiktionary" },
                ].map((e) => {
                  const active = engines.includes(e.id as DictEngine);
                  return (
                    <button
                      key={e.id}
                      onClick={() => toggleEngine(e.id as DictEngine)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs ring-1 transition ${
                        active
                          ? "bg-cyan-500/15 ring-cyan-400/40 text-cyan-100"
                          : "bg-white/5 ring-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: active ? "#22d3ee" : "#64748b" }} />
                      {e.label}
                    </button>
                  );
                })}
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">{t.recent}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentWords.length === 0 && <span className="text-xs text-white/30">—</span>}
                    {recentWords.map((w) => (
                      <button
                        key={w}
                        onClick={() => { setQuery(w); setTimeout(handleSearch, 0); }}
                        className="rounded bg-white/5 px-2 py-1 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">Popular</div>
                  <div className="flex flex-wrap gap-1.5">
                    {popular.map((w) => (
                      <button
                        key={w}
                        onClick={() => { setQuery(w); setTimeout(handleSearch, 0); }}
                        className="rounded bg-violet-500/10 px-2 py-1 text-xs text-violet-200 ring-1 ring-violet-400/20 hover:bg-violet-500/20"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl">
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M4 4v15.5A2.5 2.5 0 0 0 6.5 22H20V6a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 6.5z" />
                  </svg>
                </div>
                <div className="text-base font-medium text-white">Search a word</div>
                <div className="max-w-xs text-xs text-slate-400">Select engines and search for definitions, synonyms, and more.</div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-3 py-10 text-cyan-200">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0 5 5h3" />
                </svg>
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="bg-gradient-to-br from-white to-slate-200 bg-clip-text text-2xl font-bold text-transparent">
                        {result.word}
                      </h2>
                      {result.cachedAt && (
                        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-200 ring-1 ring-cyan-400/30">
                          {t.cacheBadge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      {result.phonetic && <span className="font-mono text-cyan-200/90">{result.phonetic}</span>}
                      {result.frequency && (
                        <span className="rounded bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
                          {result.frequency === "Common" ? t.freqCommon : result.frequency === "Uncommon" ? t.freqUncommon : t.freqRare}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copy(result.word)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/10">
                      {t.copy}
                    </button>
                    {audioUrl && (
                      <button
                        onClick={playPause}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        {t.play}
                      </button>
                    )}
                    <audio ref={audioRef} src={audioUrl ?? undefined} preload="none" className="hidden" />
                  </div>
                </div>

                {/* Definitions */}
                {(result.meanings && result.meanings.length > 0) ? (
                  <div className="space-y-3">
                    {result.meanings.map((m, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-violet-300/80">{m.partOfSpeech}</div>
                        <div className="space-y-2">
                          {m.definitions.map((d, i) => (
                            <div key={i} className="flex gap-2">
                              <div className="mt-1.5 h-1 w-1 flex-none rounded-full bg-cyan-400" />
                              <div>
                                <div className="text-sm leading-relaxed text-slate-100">{d.definition}</div>
                                {d.example && <div className="mt-1 text-xs italic text-slate-400">“{d.example}”</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-slate-400">
                    No definitions available. Try enabling Free Dictionary API.
                  </div>
                )}

                {/* Synonyms/Antonyms */}
                {extra && (extra.synonyms?.length || extra.antonyms?.length || extra.related?.length || extra.rhymes?.length) && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {extra.synonyms && extra.synonyms.length > 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-cyan-300/80">{t.synonyms}</div>
                        <div className="flex flex-wrap gap-1">
                          {extra.synonyms.slice(0, 12).map((s) => (
                            <button key={s} onClick={() => { setQuery(s); setTimeout(handleSearch, 0); }} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-xs text-cyan-100 ring-1 ring-cyan-400/20 hover:bg-cyan-500/20">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {extra.antonyms && extra.antonyms.length > 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-violet-300/80">{t.antonyms}</div>
                        <div className="flex flex-wrap gap-1">
                          {extra.antonyms.slice(0, 12).map((s) => (
                            <button key={s} onClick={() => { setQuery(s); setTimeout(handleSearch, 0); }} className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-white/10">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {extra.related && extra.related.length > 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">{t.related}</div>
                        <div className="flex flex-wrap gap-1">
                          {extra.related.slice(0, 12).map((s) => (
                            <button key={s} onClick={() => { setQuery(s); setTimeout(handleSearch, 0); }} className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-white/10">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {extra.rhymes && extra.rhymes.length > 0 && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">{t.rhymes}</div>
                        <div className="flex flex-wrap gap-1">
                          {extra.rhymes.slice(0, 12).map((s) => (
                            <button key={s} onClick={() => { setQuery(s); setTimeout(handleSearch, 0); }} className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-white/10">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Etymology */}
                {result.origin && (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-violet-300/80">{t.etymology}</div>
                    <div className="text-sm text-slate-200">{result.origin}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Translation Card - IMPROVED */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 8l6 6m0-6l-6 6m14-6h-8" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{t.translation}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/25">Free</span>
                </div>
                <div className="text-[10px] text-white/40">MyMemory + LibreTranslate (Auto-failover)</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="relative">
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/50">{t.from}</label>
                  <select
                    value={fromLang}
                    onChange={(e) => setFromLang(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 pr-8 text-sm font-medium text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20"
                  >
                    <option value="auto">🌐 Auto-Detect</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="ar">🇸🇦 Arabic</option>
                    <option value="ja">🇯🇵 Japanese</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-[26px] h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>

                <button
                  onClick={() => {
                    const tmp = fromLang;
                    setFromLang(toLang === 'auto' ? 'en' : toLang);
                    setToLang(tmp === 'auto' ? 'hi' : tmp);
                    if (translation) {
                      setTranslateInput(translation.translatedText);
                      setTranslation(null);
                    }
                  }}
                  className="mt-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 hover:text-white hover:ring-white/20 active:scale-95"
                  title="Swap languages"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4m6 8v-12m0 12l4-4m-4 4l-4-4"/>
                  </svg>
                </button>

                <div className="relative">
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/50">{t.to}</label>
                  <select
                    value={toLang}
                    onChange={(e) => setToLang(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 pr-8 text-sm font-medium text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="ar">🇸🇦 Arabic</option>
                    <option value="ja">🇯🇵 Japanese</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-[26px] h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="group relative">
                  <textarea
                    value={translateInput}
                    onChange={(e) => setTranslateInput(e.target.value)}
                    placeholder="Type or paste text to translate..."
                    className="min-h-[140px] w-full resize-y rounded-xl border border-white/10 bg-[#060a14] p-3.5 pr-10 text-[13px] leading-relaxed text-slate-100 placeholder-white/25 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/15"
                    maxLength={1000}
                  />
                  <div className="absolute bottom-2.5 right-2.5 text-[10px] font-medium text-white/30">
                    {translateInput.length}/1000
                  </div>
                </div>

                <div className="relative min-h-[140px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#060a14] to-[#060a14]/80">
                  {translateLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060a14]/90 backdrop-blur-sm">
                      <div className="relative">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400"></div>
                        <div className="absolute inset-2 rounded-full bg-violet-500/10 blur-xl"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-violet-200">{t.translating}</div>
                        <div className="mt-0.5 text-[10px] text-white/40">MyMemory → LibreTranslate</div>
                      </div>
                    </div>
                  ) : translation ? (
                    <div className="flex h-full flex-col p-3.5">
                      <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/20">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
                          {translation.engine}
                        </span>
                        {detectInfo && (
                          <span className="text-[10px] text-white/50">
                            {t.detectedLang}: <span className="font-medium text-white/70">{detectInfo.toUpperCase()}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto pr-1 text-[13px] leading-relaxed text-slate-100">
                        {translation.translatedText}
                      </div>
                      <div className="mt-2 flex gap-1.5 border-t border-white/5 pt-2">
                        <button onClick={() => copy(translation.translatedText)} className="ml-auto flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.98]">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          {t.copy}
                        </button>
                        <button onClick={() => { setQuery(translation.translatedText); document.querySelector('input[placeholder*="earch"]')?.scrollIntoView({behavior:'smooth'}); }} className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-medium text-violet-200 ring-1 ring-violet-400/20 transition hover:bg-violet-500/15 active:scale-[0.98]">
                          Search
                        </button>
                      </div>
                    </div>
                  ) : translateError ? (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/20">
                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div className="max-w-[240px] text-[11px] leading-relaxed text-red-200/90">{translateError}</div>
                      <button onClick={handleTranslate} className="mt-3 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 ring-1 ring-white/10 hover:bg-white/10">Retry</button>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center opacity-60">
                      <svg className="mb-2 h-8 w-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                      <div className="text-xs text-white/30">Translation will appear here</div>
                      <div className="mt-1 text-[10px] text-white/20">100% free • No API key required</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={translateLoading || !translateInput.trim()}
                className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:shadow-violet-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition group-hover:opacity-100 group-hover:[transform:translateX(100%)] group-hover:duration-700" style={{transform: 'translateX(-100%) skewX(-12deg)'}}></div>
                {translateLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>{t.translating}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>{t.translateBtn}</span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold backdrop-blur">FREE</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-white/35">
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                MyMemory (Primary)
              </span>
              <span className="h-2.5 w-px bg-white/10"></span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-violet-400"></span>
                LibreTranslate (Fallback)
              </span>
              <span className="h-2.5 w-px bg-white/10"></span>
              <span>No signup • Works offline after first load</span>
            </div>
          </div>
        </section>

        {/* Right Column */}
        <aside className="space-y-4">
          {/* Offline Tools */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-300/80">
              <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 ring-1 ring-cyan-400/20">{t.offlineTools}</span>
            </div>
            <textarea
              value={toolText}
              onChange={(e) => setToolText(e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs outline-none focus:border-cyan-400/50"
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                <div className="text-[9px] uppercase tracking-widest text-white/40">{t.wordCounter}</div>
                <div className="mt-1 text-base font-semibold text-white">{toolStats.words}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                <div className="text-[9px] uppercase tracking-widest text-white/40">{t.charCounter}</div>
                <div className="mt-1 text-base font-semibold text-white">{toolStats.chars}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                <div className="text-[9px] uppercase tracking-widest text-white/40">{t.readability}</div>
                <div className="mt-1 text-base font-semibold text-white">{toolStats.readability}</div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-violet-300/80">History</div>
              <div className="flex gap-1">
                <button onClick={exportData} className="rounded bg-white/5 px-2 py-1 text-[10px] ring-1 ring-white/10 hover:bg-white/10">{t.exportData}</button>
                <label className="cursor-pointer rounded bg-white/5 px-2 py-1 text-[10px] ring-1 ring-white/10 hover:bg-white/10">
                  {t.importData}
                  <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
                </label>
                <button onClick={clearHistory} className="rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-200 ring-1 ring-red-400/20 hover:bg-red-500/20">{t.clearHistory}</button>
              </div>
            </div>
            <div className="max-h-[200px] space-y-1.5 overflow-auto pr-1">
              {history.length === 0 && <div className="text-xs text-white/30">No searches yet.</div>}
              {history.slice(0, 20).map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 p-2 ring-1 ring-white/10">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-100">{h.word}</div>
                    <div className="truncate text-[9px] text-white/40">{formatDate(h.timestamp)}</div>
                  </div>
                  <button onClick={() => { setQuery(h.word); setTimeout(handleSearch, 0); }} className="rounded bg-white/5 px-2 py-1 text-[9px] ring-1 ring-white/10 hover:bg-white/10">
                    Open
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
              <span>{t.cacheSize}: {cacheSize} {t.entries}</span>
              <button onClick={clearCache} className="rounded bg-white/5 px-2 py-1 ring-1 ring-white/10 hover:bg-white/10">{t.clearCache}</button>
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-transparent p-4 backdrop-blur-xl">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-cyan-300/80">{t.settings}</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">{t.language}</span>
                <select value={lang} onChange={(e) => setLang(e.target.value as LangCode)} className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs">
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-xs text-slate-300">{t.highContrast}</span>
                <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="h-4 w-4 accent-cyan-500" />
              </label>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-7xl px-4 pb-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-center text-[10px] text-white/40 md:flex-row md:text-left">
          <div>
            <div className="text-sm font-semibold text-white/60">© {new Date().getFullYear()} PrivMITLab LexiCore</div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
              <span>Secure & Private</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/PrivMITLab" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-cyan-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span>GitHub</span>
            </a>
            <span className="h-3 w-px bg-white/10"></span>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Zero Tracking</span>
            </div>
            <span className="h-3 w-px bg-white/10"></span>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>No Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-cyan-400/30 bg-[#0b1220]/95 px-4 py-2 text-xs text-cyan-100 shadow-xl backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}

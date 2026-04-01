# PrivMITLab LexiCore

<div align="center">

**Privacy-First Universal Dictionary & Language Intelligence Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repo](https://img.shields.io/badge/GitHub-PrivMITLabLexiCore-blue.svg)](https://github.com/PrivMITLab/lexicore)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Tracking-green.svg)](#privacy-principles)

*Open Knowledge • Zero Tracking • Full Control*

</div>

---

## 🌟 Features

### 🔍 Dictionary Search
- **Multiple Dictionary Engines**: Free Dictionary API, Datamuse, Wiktionary
- **Definitions** with part of speech (noun, verb, adjective, etc.)
- **Pronunciation** audio playback
- **Synonyms & Antonyms** from Datamuse API
- **Etymology** (word origins) from Wiktionary
- **Usage frequency** indicators (Common, Uncommon, Rare)

### 🌐 Translation Module
- **LibreTranslate** integration with auto-failover to multiple public instances
- **Language detection** (automatic)
- Support for: English, Hindi, Spanish, French, German

### 📊 Offline Tools
- **Word Counter** - count words in any text
- **Character Counter** - count characters
- **Readability Score** - Flesch reading ease score

### 💾 Privacy & Data
- **Local-first architecture**: All data stored in browser (localStorage/IndexedDB)
- **No tracking, no telemetry, no cookies**
- **Search history** with export/import as JSON
- **Dictionary cache** for instant offline lookups

### 🎨 User Interface
- **Cyber-knowledge dashboard** design
- **Dark mode** with cyan/purple accents
- **Glass-morphism** cards
- **Responsive design** for desktop, tablet, and mobile
- **High contrast mode** accessibility option
- **Multi-language UI**: English, Hindi, Hinglish

---

## 🔒 Privacy Principles

> **"Privacy is not an option, it's a requirement."**

| Principle | Implementation |
|-----------|---------------|
| **No Telemetry** | No analytics scripts, no user data collection |
| **No Tracking** | No cookies for tracking, no fingerprinting |
| **User-Initiated Only** | All API calls made only when you click Search/Translate |
| **Local Storage** | All data stays in your browser |
| **Open APIs Only** | Uses only free, open-source dictionary APIs |

### Privacy Notice
> *Dictionary lookups may query public APIs. No user data is collected by PrivMITLab.*

---

## 🚀 Supported Dictionary Engines

| Engine | Purpose | API |
|--------|---------|-----|
| **Free Dictionary API** | Definitions, phonetics, examples | [dictionaryapi.dev](https://dictionaryapi.dev) |
| **Datamuse** | Synonyms, antonyms, related words, rhymes | [datamuse.com](https://www.datamuse.com/api) |
| **Wiktionary** | Etymology, word origins | [wiktionary.org](https://www.wiktionary.org) |
| **LibreTranslate** | Translation between languages | [libretranslate.com](https://libretranslate.com) |

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 3.x
- **TypeScript**: Full type safety
- **No CDNs**: All dependencies bundled locally
- **No Build Issues**: Optimized for Vercel deployment

---

## 📦 Project Structure

```
privmitlab-lexicore/
├── public/
│   └── favicon.ico          # Favicon for deployment
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   └── utils/
│       └── cn.ts            # Utility for class names
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🔧 Installation & Running

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus search input |
| `Enter` | Execute search |
| `Space` | Play/pause audio |

---

## 🌐 Supported Languages

### Interface Languages
- English (en)
- Hindi (hi) 
- Hinglish (hinglish)

### Translation Languages
- English ↔ Hindi
- English ↔ Spanish
- English ↔ French
- English ↔ German

---

## 🔐 Security Practices

- **Input Sanitization**: All user input is sanitized to prevent XSS
- **Rate Limiting**: API requests are rate-limited (8 requests per 10 seconds)
- **No External Scripts**: No third-party analytics or tracking scripts
- **Relative Paths**: All assets use relative paths for deployment flexibility

---

## 📄 License

**MIT License** - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

### Ways to Contribute
- Report bugs
- Suggest new features
- Improve translations
- Enhance privacy features
- Submit pull requests

---

## 📞 Contact

- **GitHub**: [@PrivMITLab](https://github.com/PrivMITLab)
- **Website**: [privmitlab.io](https://privmitlab.io)

---

<div align="center">

**Built with ❤️ for privacy, by privacy engineers.**

*Your data stays yours. Always.*

</div>

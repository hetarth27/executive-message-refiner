# Executive Message Refiner 👔✨

An AI-powered communication assistant built with **React + TypeScript + Tailwind CSS** designed specifically to help you draft, correct, and elevate daily messages to your boss, clients, team, and peers.

Instead of writing repetitive prompts in ChatGPT ("*please make this sound professional and fix my grammar*"), **Executive Message Refiner** gives you a dedicated workflow tailored to professional business communication.

---

## 🚀 Key Features

- **⚡ Instant Grammar & Syntax Correction**: Fixes clumsy wording, typos, punctuation, and awkward sentence structures.
- **👑 Bottom-Line-Up-Front (BLUF)**: Restructures rambling drafts into executive-ready communication where the core decision or update comes first.
- **🎯 Recipient Persona Adaptation**:
  - **Boss / C-Suite**: High brevity, decisions needed, impact, and proactive mitigation (eliminates timid apologies).
  - **Client / Customer**: Empathy, confidence, deliverable-focused, setting boundaries without being combative.
  - **Direct Report / Team**: Clear expectations, constructive coaching, psychological safety.
  - **Cross-functional Peer**: Alignment-focused, respectful of time, clear collaborative touchpoints.
  - **Vendor / Partner**: Milestone bounds, contractual clarity, strict SLAs.
- **🎨 7 Dedicated Tones**: Executive, Diplomatic, Assertive, Warm & Friendly, Urgent Action, Persuasive, Ultra-Concise.
- **🔍 Word-Level Visual Diff Viewer**: See exactly what was removed (filler, timid apologies, fluff) and what was added or polished.
- **⚡ 1-Click Quick Refinements**:
  - *Make 30% Shorter*
  - *Remove Apologies & Boost Confidence*
  - *Convert to Actionable Bullets*
  - *Soften Tone (More Diplomatic)*
  - *Add 1-Line TL;DR*
  - *Sharpen Call to Action (CTA)*
- **🤖 Multi-Provider AI Support**:
  - **Built-in Smart Engine**: Ready immediately with **zero setup** and works 100% offline.
  - **Google Gemini**: Gemini 1.5 Flash & Pro support.
  - **OpenAI**: GPT-4o & GPT-4o-mini support.
  - **Anthropic Claude**: Claude 3.5 Sonnet support.
  - **OpenRouter**: Any open-weights or commercial model.
- **🛡️ Custom Persona & Rules Engine**: Define rules such as *"Never say 'sorry for the delay' — use 'thank you for your patience'"*, *"Always state next steps with owners and due dates"*, or custom signature titles.
- **💾 History & Favorites**: Auto-saves your past refined messages in your browser's local storage for instant retrieval.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Privacy

All API keys and message history are stored solely in your local browser (`localStorage`). No messages are sent to external servers unless you configure an external LLM API key.


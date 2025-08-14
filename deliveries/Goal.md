# 🚀 Key Features & Technical Overview

## 📌 Development Phases

### **Phase 1** — Basic Voice Payments
- Example: `"Send 5 DOT to Alice"`

### **Phase 2** — Full Voice-Controlled Wallet
- Balance checks
- Multi-token support for DOT and Polkadot ecosystem assets

### **Phase 3** — Advanced Features
- DeFi operations (staking, swaps, liquidity provision, etc.)

---

## 🛠 Technology Stack

- **PAPI** — Modern Polkadot API integration (preferred over legacy Polkadot.js)
- **ElevenLabs** — Voice processing (speech-to-text & text-to-speech)
- **Cloudflare Workers** + **Hono.js** — Serverless API framework
- **Cloudflare D1** — Database for transaction logs & voice session storage

---

## 🔐 Security Approach

- **Traditional wallet connections**
  - Users connect their existing Polkadot wallets (Polkadot.js, Talisman, SubWallet, etc.)
- **Client-side transaction signing**
  - Private keys never touch the server
- **Voice data encryption**
  - Encrypted in transit and at rest
- **Audit logs**
  - Full logging of all voice commands & transaction actions

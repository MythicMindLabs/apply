# 🎤 VoiceDOT - Multi-Language Voice-Controlled Polkadot Payment Platform

**Deploy to Cloudflare Workers | MCP Compatible | Multi-Language | Polkadot | Hardware Wallets**

The world's first **multi-language voice-controlled Polkadot payment platform** with AI integration, hardware wallet support, and mobile app.

VoiceDOT enables users to make blockchain payments, DeFi operations, and manage their crypto portfolio using **natural voice commands** in **English, Spanish, French, and German**.

Built with **cutting-edge AI**, deployed on **Cloudflare Workers**, with:
- Real-time blockchain integration
- Hardware wallet security
- MCP server capabilities for AI-to-AI payments

---

## 🌟 Key Features

### 🎙️ Multi-Language Voice Commands
- **Supported Languages**: English, Spanish, French, German
- **NLP**: Powered by Perplexity.ai
- **Smart Detection**: Automatic language recognition & localized responses
- **Voice Synthesis**: ElevenLabs integration for audio replies

### 🔗 Live Blockchain Integration
- Real Polkadot network
- Multi-Token Support: DOT, USDT, USDC, ACA, GLMR, KSM
- Network health monitoring
- Wallet support: Polkadot.js, Talisman, SubWallet

### 🔐 Hardware Wallet Security
- Ledger Nano S/X & Trezor Model T/One
- Voice + Hardware Confirmation: `"Send 5 DOT using Ledger"`
- Secure transaction signing
- Audit logging for compliance

### 📱 Mobile App (React Native)
- Native voice recording
- Face ID / Touch ID authentication
- Offline transaction queuing
- Push notifications
- Multi-language UI

### 🤖 MCP Server for AI Integration
- First voice-powered blockchain payment MCP server
- 6 AI tools for payments, balance queries, etc.
- Cross-AI compatibility (Claude, ChatGPT, etc.)
- Server-Sent Events support

### 🌐 Modern Web Interface
- Responsive design
- Live audio & transcription
- Real-time blockchain dashboard
- Language selector with saved preferences

---

## 🚀 Live Demo

Try VoiceDOT now:  
**[https://85641b964c389aee6873b397.fp.dev](https://85641b964c389aee6873b397.fp.dev)**

---

## 🎯 Example Voice Commands

| Language | Command                       | Translation               |
|----------|--------------------------------|---------------------------|
| 🇺🇸 English | `Send 5 DOT to Alice`         | Send 5 DOT to Alice        |
| 🇪🇸 Spanish | `Envía 5 DOT a Alice`         | Send 5 DOT to Alice        |
| 🇫🇷 French  | `Envoie 5 DOT à Alice`        | Send 5 DOT to Alice        |
| 🇩🇪 German  | `Sende 5 DOT an Alice`        | Send 5 DOT to Alice        |

**Hardware Wallet Commands:**
- `Send 10 DOT using Ledger`
- `Connect my Trezor wallet`
- `Execute hardware wallet transaction`

**Advanced Operations:**
- Balance check: `"What's my DOT balance?"` / `"¿Cuál es mi saldo de DOT?"`
- Price check: `"What's the current DOT price?"`
- History: `"Show my last 5 transactions"`
- USD conversion: `"Send $100 worth of DOT to Bob"`
- Batch: `"Send 5 DOT to Alice and 10 USDT to Bob"`
- Conditional: `"Send 5 DOT to Alice if my balance is above 100 DOT"`

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Cloudflare Workers
- **API Framework**: Hono.js
- **DB**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Storage**: Cloudflare R2

### AI & Voice
- **Voice Processing**: ElevenLabs
- **NLP**: Perplexity.ai
- **Protocol**: MCP

### Blockchain
- **Network**: Polkadot (PAPI)
- **Wallets**: Ledger, Trezor
- **Tokens**: DOT, USDT, USDC, ACA, GLMR, KSM

### Mobile
- **Framework**: React Native
- **Auth**: Face ID / Touch ID
- **Offline**: AsyncStorage
- **Push**: React Native Push Notification

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Cloudflare Workers account
- API keys for **ElevenLabs** and **Perplexity.ai**
- Optional: hardware wallet

### Steps
git clone https://github.com/yourusername/voicedot-platform.git
cd voicedot-platform
npm install

**Create `.env` file:**

ELEVENLABS_API_KEY=your_elevenlabs_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
POLKADOT_RPC_ENDPOINT=wss://rpc.polkadot.io
ENCRYPTION_KEY=your_secure_encryption_key

npm run deploy

Set production secrets
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put PERPLEXITY_API_KEY
wrangler secret put POLKADOT_RPC_ENDPOINT
wrangler secret put ENCRYPTION_KEY


**Mobile App Setup (optional):**

cd voicedot-mobile
npm install
npx react-native run-ios

or
npx react-native run-android


---

## 🏗 Project Structure

voicedot-platform/
├── src/
│ ├── index.ts # Main API
│ └── db/
│ └── schema.ts # Database schema
├── voicedot-mobile/ # Mobile app
│ ├── src/
│ ├── android/
│ └── ios/
├── SPEC.md
├── package.json
├── wrangler.toml
├── drizzle.config.ts
└── README.md



---

## 🔌 API Endpoints

### Voice Processing
- `POST /voice/process`
- `POST /voice/confirm`
- `GET /voice/tts`
- `POST /voice/hardware-payment`

### Blockchain
- `GET /wallet/balance/:token`
- `POST /wallet/connect`
- `POST /transactions/execute`
- `GET /transactions/history`

### Hardware Wallet
- `POST /wallet/hardware/connect`
- `POST /wallet/hardware/prepare-transaction`
- `POST /wallet/hardware/execute-transaction`

### MCP
- `POST /mcp/voice_payment`
- `POST /mcp/check_balance`
- `POST /mcp/execute_transaction`
- `POST /mcp/connect_wallet`
- `POST /mcp/get_network_status`

---

## 🌍 Multi-Language Support
- **Languages**: 🇺🇸 English, 🇪🇸 Spanish, 🇫🇷 French, 🇩🇪 German
- **Auto-detection** with localized currency formatting

---

## 🔐 Security Features
- End-to-end encryption
- Hardware wallet signing
- Biometric authentication on mobile
- Secure key management
- Audit logging
- Rate limiting
- Multi-sig support

---

## 📊 Database Schema
Tables:
- `users`
- `transactions`
- `voice_sessions`
- `wallet_connections`
- `tokens`
- `voice_commands`
- `audit_logs`
- `xcm_transactions`
- `user_preferences`

---

## 📱 Mobile App Features
- Voice recording
- Real-time transcription
- Face ID / Touch ID
- Offline transactions
- Push alerts
- Bluetooth hardware wallet support
- Multi-language UI
- Accessibility features

---

## 🚀 Deployment

### Web (Cloudflare Workers)


npm install -g wrangler
wrangler login
wrangler deploy


### Mobile
**iOS:**


cd voicedot-mobile/ios
xcodebuild -workspace VoiceDOT.xcworkspace -scheme VoiceDOT -configuration Release


**Android:**


---

## 🧪 Development
npm run dev
npm run typecheck
npm run db:generate
npm run db:migrate



---

## 📈 Performance
- Voice processing: `<200ms`
- Balance checks: `<500ms`
- Language detection: `<100ms`
- Hardware wallet confirmation: `<3s`
- Mobile app launch: `<1s`

---

## 🤝 Contributing
1. Fork the repo
2. Create branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a PR

---

## 📄 License
MIT License - See `LICENSE` file

---

## 🙏 Acknowledgments
- **Polkadot** — blockchain infrastructure
- **ElevenLabs** — voice synthesis
- **Perplexity.ai** — NLP engine
- **Cloudflare** — serverless CDN
- **Ledger & Trezor** — hardware wallet tech
- **React Native** — mobile framework
- **Fiberplane** — dev & deployment tools





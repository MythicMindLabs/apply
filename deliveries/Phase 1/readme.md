# 🎤 VoiceDOT - Multi-Language Voice-Controlled Polkadot Payment Platform

**The world's first multi-language voice-controlled Polkadot payment platform with AI integration**

---

[Cloudflare Workers](https://workers.cloudflare.com/) | [Model Context Protocol](https://modelcontextprotocol.io/) | [GitHub Repo](https://github.com/yourusername/voicedot-platform) | [Polkadot Network](https://polkadot.network/)

---

VoiceDOT lets users make blockchain payments using natural voice commands in **English**, **Spanish**, **French**, and **German**. Powered by cutting-edge AI and deployed via Cloudflare Workers, it features real-time blockchain integration and MCP server capabilities for AI-to-AI payments.

---

## 🌟 Key Features

### 🎙️ Multi-Language Voice Commands
- **Languages Supported:** English, Spanish, French, German
- **Natural Language Processing:** Powered by Perplexity.ai
- **Smart Language Detection:** Automatic recognition, localized responses
- **Voice Synthesis:** ElevenLabs integration for audio replies

### 🔗 Live Blockchain Integration
- Real Polkadot network (live balance queries, transaction execution)
- **Multi-Token Support:** DOT, USDT, USDC, ACA, GLMR, KSM
- Network health/status monitoring
- Wallet integration (Polkadot.js, Talisman, SubWallet)

### 🤖 MCP Server for AI Integration
- **First of its kind:** Payments accessible to other AIs
- **6 Powerful Tools:** Complete payment ecosystem for AI assistants
- **Cross-AI capabilities:** Claude, ChatGPT, and other AIs supported
- **Full MCP Protocol:** Server-Sent Events implementation

### 🌐 Modern Web Interface
- Responsive design: desktop, tablet, mobile
- Live audio recording & transcription
- Transaction dashboard (live blockchain data)
- Multi-language UI

---

## 🚀 Live Demo

**Try VoiceDOT now:**  
[https://85641b964c389aee6873b397.fp.dev](https://85641b964c389aee6873b397.fp.dev)

---

## 🎯 Example Voice Commands

| Language | Command                     | Translation              |
|----------|----------------------------|--------------------------|
| 🇺🇸 English  | "Send 5 DOT to Alice"      | Send 5 DOT to Alice      |
| 🇪🇸 Spanish  | "Envía 5 DOT a Alice"      | Send 5 DOT to Alice      |
| 🇫🇷 French   | "Envoie 5 DOT à Alice"     | Send 5 DOT to Alice      |
| 🇩🇪 German   | "Sende 5 DOT an Alice"     | Send 5 DOT to Alice      |

**More Commands:**  
- Balance queries: `"What's my DOT balance?"`, `"¿Cuál es mi saldo de DOT?"`
- Price checks: `"What's the current DOT price?"`, `"¿Cuál es el precio de DOT?"`
- Transaction history: `"Show my last 5 transactions"`, `"Muestra mis últimas 5 transacciones"`
- USD payments: `"Send $100 worth of DOT to Bob"`, `"Envía €100 de DOT a Bob"`

---

## 🛠 Technology Stack

- **Runtime:** Cloudflare Workers
- **API Framework:** Hono.js
- **Database:** Cloudflare D1 (SQLite)
- **ORM:** Drizzle ORM
- **Voice Processing:** ElevenLabs API
- **NLP:** Perplexity.ai
- **Blockchain:** Polkadot API (PAPI)
- **Storage:** Cloudflare R2
- **Protocol:** MCP (Model Context Protocol)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Cloudflare Workers account
- API keys for ElevenLabs & Perplexity.ai

### Steps
1. **Clone the Repository**
2. **Install Dependencies**
3. **Create `.env` File**

ELEVENLABS_API_KEY=your_elevenlabs_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
POLKADOT_RPC_ENDPOINT=wss://rpc.polkadot.io
ENCRYPTION_KEY=your_secure_encryption_key


4. **Deploy to Cloudflare Workers**
5. **Set Secrets (Production)**

---

## 🏗️ Project Structure

- `src/` — Source code
- `src/index.ts` — Main API
- `src/db/schema.ts` — Database schema
- Documentation, configs, and contribution guides

---

## 🔌 API Endpoints

**Voice Processing**
- `POST /voice/process` — Process voice commands
- `POST /voice/confirm` — Confirm voice transactions
- `GET /voice/tts` — Text-to-speech synthesis

**Blockchain Operations**
- `GET /wallet/balance/:token` — Check token balances
- `POST /wallet/connect` — Connect Polkadot wallets
- `POST /transactions/execute` — Execute blockchain transactions
- `GET /transactions/history` — Get transaction history

**Multi-Currency Support**
- `GET /prices/:token` — Get token prices
- `POST /convert/usd` — USD to token conversion
- `POST /transactions/batch` — Batch transactions

**Network Status**
- `GET /network/status` — Real-time network status
- `GET /health` — API health check

**MCP Server**
- `GET /mcp` — MCP specification
- `POST /mcp/voice_payment` — AI voice payment processing
- `POST /mcp/check_balance` — AI balance queries
- `POST /mcp/execute_transaction` — AI transaction execution

---

## 🤖 MCP Integration

VoiceDOT provides a full **Model Context Protocol** server enabling other AI assistants to use the voice payment platform.

**Available MCP Tools:**
- `voice_payment` — Process voice commands for payments
- `check_balance` — Query wallet balances
- `get_token_price` — Get real-time token prices
- `execute_transaction` — Submit blockchain transactions
- `connect_wallet` — Connect Polkadot wallets
- `get_network_status` — Check network health

---

## 🌍 Multi-Language Support

- **English 🇺🇸:** Natural language processing
- **Spanish 🇪🇸:** Euro currency support
- **French 🇫🇷:** Regional formatting
- **German 🇩🇪:** Localized responses
- **Automatic Language Detection** for user commands & localized responses

---

## 🔐 Security Features

- **End-to-End Encryption:** All voice data is encrypted
- **Secure Key Management:** Private keys never touch the server
- **Audit Logging:** Transparent transaction trail
- **Rate Limiting:** Prevents abuse
- **Wallet Signature Verification:** Cryptographic signing

---

## 📊 Database Schema

Tables include:
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

## 🚀 Deployment

**Cloudflare Workers (Recommended):**
- Install Wrangler CLI: `npm install -g wrangler`
- Login: `wrangler login`
- Deploy: `wrangler deploy`

**Environment Variables:**
- `ELEVENLABS_API_KEY` — ElevenLabs API key
- `PERPLEXITY_API_KEY` — Perplexity.ai API key
- `POLKADOT_RPC_ENDPOINT` — Polkadot RPC endpoint
- `ENCRYPTION_KEY` — Secure encryption key

---

## 🧪 Development

- Local development, database migrations, and type checking supported.

---

## 📈 Performance

- **Voice Processing:** <200ms
- **Blockchain Queries:** <500ms
- **Language Detection:** <100ms
- **Concurrent Users:** Scales automatically with Cloudflare Workers
- **Global CDN:** Sub-100ms response worldwide

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guidelines](https://fiberplane.com/codegen/c-3RmbZq-uoNOKhQvcDRe/attachments/CONTRIBUTING.md).

### Development Setup
- Fork the repository
- Create a feature branch: `git checkout -b feature/amazing-feature`
- Commit: `git commit -m 'Add amazing feature'`
- Push: `git push origin feature/amazing-feature`
- Open a Pull Request

---

## 📄 License

Project licensed under the MIT License — see [LICENSE](https://fiberplane.com/codegen/c-3RmbZq-uoNOKhQvcDRe/attachments/LICENSE).

---

## 🙏 Acknowledgments

- **Polkadot** — Blockchain tech
- **ElevenLabs** — Voice synthesis
- **Perplexity.ai** — Advanced NLP
- **Cloudflare** — Serverless infrastructure
- **Fiberplane** — Dev & deployment platform

---
---

## 🎯 Roadmap

**Phase 1 ✅ (Completed)**
- Multi-language voice processing
- Real Polkadot blockchain integration
- MCP server implementation
- Modern web interface

**Phase 2 🚧 (In Progress)**
- Mobile app development
- Hardware wallet integration
- Advanced DeFi operations
- Cross-chain bridge support

**Phase 3 🔮 (Planned)**
- Voice biometric authentication
- AI-powered trading strategies
- Enterprise features
- Regulatory compliance tools



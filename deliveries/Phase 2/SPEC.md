# VoiceDOT Payment Platform Specification

This document outlines the design and step-by-step implementation plan for a voice-controlled payment platform built on the Polkadot blockchain.

The API will support voice-to-blockchain transactions, allowing users to send DOT and other Polkadot ecosystem tokens through natural voice commands. The system processes voice input, extracts payment intent, confirms transactions through voice responses, and executes transfers on the Polkadot network.

The system is to be built using Cloudflare Workers with Hono as the API framework, ElevenLabs for voice processing, and PAPI for Polkadot blockchain integration.

## 1. Technology Stack

- **Edge Runtime:** Cloudflare Workers
- **API Framework:** Hono.js (TypeScript-based API framework)
- **Voice Processing:** ElevenLabs API for speech-to-text and text-to-speech
- **Blockchain Integration:** PAPI (Polkadot API) for Polkadot network interactions
- **Database:** Cloudflare D1 (SQLite) for transaction logs and user sessions
- **ORM:** Drizzle for type-safe database operations

## 2. Database Schema Design

The database will store transaction logs, user sessions, and voice command history for audit and debugging purposes.

### 2.1. Users Table

- id (TEXT, Primary Key)
- wallet_address (TEXT, NOT NULL, UNIQUE)
- created_at (INTEGER, NOT NULL)
- last_active (INTEGER, NOT NULL)

### 2.2. Transactions Table

- id (TEXT, Primary Key)
- user_id (TEXT, Foreign Key to users.id)
- voice_command (TEXT, NOT NULL)
- parsed_intent (TEXT, NOT NULL) // JSON string
- recipient_address (TEXT, NOT NULL)
- amount (TEXT, NOT NULL) // String to handle large numbers
- token_symbol (TEXT, NOT NULL)
- transaction_hash (TEXT)
- status (TEXT, NOT NULL) // 'pending', 'confirmed', 'failed'
- created_at (INTEGER, NOT NULL)
- confirmed_at (INTEGER)

### 2.3. Voice_Sessions Table

- id (TEXT, Primary Key)
- user_id (TEXT, Foreign Key to users.id)
- audio_url (TEXT)
- transcription (TEXT)
- response_audio_url (TEXT)
- response_text (TEXT)
- created_at (INTEGER, NOT NULL)

## 3. API Endpoints

We will structure our API endpoints into logical groups for voice processing, transaction management, and wallet operations.

### 3.1. Voice Processing Endpoints

- **POST /voice/process**
  - Description: Process voice input for payment commands
  - Expected Payload:
    ```json
    {
      "audio_data": "base64_encoded_audio",
      "user_id": "wallet_address_or_session_id",
      "format": "mp3|wav|webm"
    }
    ```
  - Response: Parsed intent and confirmation audio

- **POST /voice/confirm**
  - Description: Process voice confirmation for pending transactions
  - Expected Payload:
    ```json
    {
      "audio_data": "base64_encoded_audio",
      "transaction_id": "uuid",
      "user_id": "wallet_address_or_session_id"
    }
    ```

### 3.2. Transaction Endpoints

- **GET /transactions**
  - Description: Retrieve user transaction history
  - Query Params: user_id, status, limit, offset

- **GET /transactions/:id**
  - Description: Get specific transaction details
  - Path Params: transaction ID

- **POST /transactions/execute**
  - Description: Execute confirmed transaction on Polkadot network
  - Expected Payload:
    ```json
    {
      "transaction_id": "uuid",
      "signed_extrinsic": "hex_string"
    }
    ```

### 3.3. Wallet Integration Endpoints

- **POST /wallet/connect**
  - Description: Connect and verify wallet for voice payments
  - Expected Payload:
    ```json
    {
      "wallet_address": "polkadot_address",
      "signature": "signed_message",
      "message": "verification_message"
    }
    ```

- **GET /wallet/balance**
  - Description: Get wallet balance for supported tokens
  - Query Params: wallet_address, token_symbols

### 3.4. Health and Status Endpoints

- **GET /health**
  - Description: API health check and service status

- **GET /status/polkadot**
  - Description: Polkadot network connection status

## 4. Integrations

### 4.1. ElevenLabs Integration
- Speech-to-text for voice command processing
- Text-to-speech for transaction confirmations and responses
- Voice cloning for personalized responses (future enhancement)

### 4.2. PAPI (Polkadot API) Integration
- Connect to Polkadot and parachain networks
- Query account balances and transaction history
- Submit and monitor extrinsics (transactions)
- Handle runtime upgrades and metadata changes

### 4.3. Wallet Integration
- Support for popular Polkadot wallets (Polkadot.js, Talisman, SubWallet)
- Message signing for authentication
- Transaction signing delegation

## 5. Development Milestones

### Milestone 1: Enhanced Voice Processing & Multi-Currency Support
**Focus**: Advanced voice capabilities and comprehensive token ecosystem support

**Core Features**:
- **Perplexity.ai NLP Processing**
  - Natural language understanding for complex payment commands using Perplexity.ai
  - Context-aware conversation handling with real-time web knowledge
  - Intent recognition and entity extraction via Perplexity API
  - Multi-language support preparation
  
- **Multi-Currency Support**
  - DOT (native Polkadot token) transfers
  - Parachain token support (USDT, USDC, ACA, GLMR, etc.)
  - Real-time token price fetching and conversion
  - Cross-parachain asset discovery
  
- **Complex Command Handling**
  - Batch transactions ("Send 5 DOT to Alice and 10 USDT to Bob")
  - Conditional payments ("Send 5 DOT to Alice if my balance is above 100 DOT")
  - Scheduled payments with voice confirmation
  - Transaction templates and shortcuts

**Technical Implementation**:
- Integration with Perplexity.ai for advanced NLP and real-time knowledge
- PAPI integration for multi-chain asset queries
- Enhanced voice processing pipeline
- Intelligent command parsing and validation

### Milestone 2: Cross-Chain Integration & Production Security
**Focus**: XCM cross-chain capabilities and enterprise-grade security

**Core Features**:
- **XCM (Cross-Consensus Messaging) Support**
  - Cross-parachain asset transfers via voice
  - Relay chain to parachain operations
  - Cross-chain DeFi operations (staking across chains)
  - Real-time XCM transaction tracking
  
- **Production Security Features**
  - End-to-end encryption for voice data
  - Secure key management and hardware wallet support
  - Transaction signing with multiple confirmation methods
  - Audit logging and compliance features
  - Rate limiting and fraud detection
  
- **Multi-Factor Authentication**
  - Voice biometric authentication (voiceprint analysis)
  - Hardware wallet integration (Ledger, Trezor)
  - Time-based OTP integration
  - Behavioral analysis for anomaly detection
  - Emergency recovery mechanisms

**Technical Implementation**:
- XCM message construction and execution
- Advanced cryptographic security measures
- Biometric voice analysis integration
- Production monitoring and alerting
- Compliance and regulatory features

## 6. Security Considerations

- Wallet private keys never stored on the platform
- Voice data encrypted in transit and at rest
- Transaction signing happens client-side
- Rate limiting on voice processing endpoints
- Audit logs for all transactions and voice commands

## 7. Environment Variables

The following environment variables should be configured in the Cloudflare Workers environment:

- `ELEVENLABS_API_KEY` - ElevenLabs API authentication
- `POLKADOT_RPC_ENDPOINT` - Polkadot network RPC URL
- `DATABASE_URL` - Cloudflare D1 database connection
- `ENCRYPTION_KEY` - For encrypting sensitive voice data

## 8. Further Reading

Take inspiration from the project template here: https://github.com/fiberplane/create-honc-app/tree/main/templates/d1

For PAPI integration, refer to: https://papi.how/
For ElevenLabs voice processing: https://elevenlabs.io/docs
For Polkadot development: https://wiki.polkadot.network/docs/build-index
# 🛠️ EchoPay-2 Development Guide

## Overview

This comprehensive development guide covers everything you need to build, test, and contribute to EchoPay-2, the revolutionary voice-activated Polkadot payment system.

---

## 🚀 Quick Start

### Prerequisites

Before getting started, ensure you have the following installed:

#### Required Software
- **Node.js** (v18+ recommended) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Rust** (stable toolchain) - [Install](https://rustup.rs/)
- **Git** for version control

#### Polkadot Development Tools
```bash
# Install cargo-contract for ink! development
cargo install cargo-contract --force --locked

# Install substrate-contracts-node for local testing
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force --locked
```

#### Browser Extensions
- **SubWallet** - [Download](https://subwallet.app/)
- **Talisman** - [Download](https://talisman.xyz/)
- **Polkadot.js Extension** - [Download](https://polkadot.js.org/extension/)

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/MythicMindLabs/apply.git
cd "apply/Phase 2"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

Edit `.env` file with your settings:

```env
# Network Configuration
VITE_NETWORK_URL=ws://127.0.0.1:9944
VITE_NETWORK_NAME=development

# Smart Contract (will be set after deployment)
VITE_CONTRACT_ADDRESS=

# ElevenLabs API (optional for voice synthesis)
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

---

## 🏗️ Project Architecture

### Directory Structure

```
Phase 2/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── VoiceInterface.tsx    # Main voice interface
│   │   ├── WalletConnector.tsx   # Wallet integration
│   │   ├── TransactionHistory.tsx # Payment history
│   │   └── ui/                   # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   │   ├── useVoice.ts          # Voice recognition
│   │   ├── useWallet.ts         # Wallet management
│   │   └── useApi.ts            # Polkadot API
│   ├── services/                 # External service integrations
│   ├── utils/                    # Utility functions
│   ├── config/                   # Configuration files
│   └── types/                    # TypeScript type definitions
├── contracts/                    # Smart contracts
│   └── payment_recorder/         # ink! payment recorder
│       ├── lib.rs               # Contract implementation
│       ├── Cargo.toml           # Dependencies
│       └── tests/               # Contract tests
├── docs/                        # Documentation
├── scripts/                     # Build and deployment scripts
└── e2e/                         # End-to-end tests
```

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Polkadot.js** for blockchain interaction
- **Web Speech API** for voice recognition
- **ElevenLabs API** for voice synthesis

#### Smart Contracts
- **ink!** smart contract framework
- **Rust** programming language
- **Substrate** blockchain runtime

#### Testing
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Playwright** for E2E testing

---

## 🏃‍♂️ Running the Development Environment

### 1. Start Local Blockchain Node

```bash
# Start substrate contracts node
npm run start:node

# Alternative: manual start
substrate-contracts-node --dev --tmp
```

Keep this terminal running throughout development.

### 2. Build and Deploy Smart Contract

```bash
# Build the contract
npm run contracts:build

# Alternative: manual build
cd contracts/payment_recorder
cargo contract build
```

```bash
# Deploy the contract
npm run contracts:deploy

# Alternative: manual deployment
cargo contract instantiate \
  --suri //Alice \
  --args \
  --skip-confirm
```

**Important**: Copy the contract address from the deployment output and update your `.env` file:

```env
VITE_CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

### 3. Start Frontend Development Server

```bash
# Start development server
npm run dev

# Alternative with specific port
npm run dev -- --port 3000
```

Access the application at `http://localhost:3000`

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run smart contract tests
npm run contracts:test
```

### Test Structure

#### Unit Tests
```typescript
// src/hooks/__tests__/useVoice.test.ts
import { renderHook, act } from '@testing-library/react';
import { useVoice } from '../useVoice';

describe('useVoice', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useVoice());
    
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.confidence).toBe(0);
  });
});
```

#### Component Tests
```typescript
// src/components/__tests__/VoiceInterface.test.tsx
import { render, screen } from '@testing-library/react';
import { VoiceInterface } from '../VoiceInterface';

test('renders voice interface correctly', () => {
  render(<VoiceInterface />);
  expect(screen.getByText('Voice-Activated Payments')).toBeInTheDocument();
});
```

#### E2E Tests
```typescript
// e2e/voice-commands.spec.ts
import { test, expect } from '@playwright/test';

test('voice command flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-recording"]');
  // Simulate voice input and verify transaction flow
});
```

---

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/voice-improvements

# Make changes and test
npm run dev
npm test

# Commit changes
git add .
git commit -m "feat: improve voice recognition accuracy"

# Push and create PR
git push origin feature/voice-improvements
```

### 2. Code Quality

#### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

#### Type Checking
```bash
# Run TypeScript compiler check
npm run type-check
```

### 3. Pre-commit Checks

```bash
# Run all quality checks
npm run validate

# This runs:
# - Type checking
# - Linting
# - Tests
# - Build verification
```

---

## 🛠️ Development Tools

### Browser Developer Tools

#### Chrome DevTools Extensions
- **React Developer Tools**
- **Polkadot.js Extension DevTools**

#### Debugging Voice Recognition
```javascript
// Enable verbose logging in development
if (process.env.NODE_ENV === 'development') {
  window.speechRecognition.onstart = () => console.log('Voice recognition started');
  window.speechRecognition.onresult = (event) => console.log('Recognition result:', event);
}
```

### VS Code Extensions

Recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright"
  ]
}
```

### Git Hooks

Setup pre-commit hooks:

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run validate"
```

---

## 🏗️ Building for Production

### Frontend Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Smart Contract Build

```bash
# Build optimized contract
cd contracts/payment_recorder
cargo contract build --release

# Verify contract size and optimization
ls -la target/ink/
```

### Build Verification

```bash
# Test production build
npm run build
npm run preview

# Verify all features work in production mode
```

---

## 🚀 Contributing

### Code Style Guidelines

#### TypeScript/React
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript strict mode

#### Rust/ink!
- Follow Rust naming conventions
- Write comprehensive tests
- Document public functions
- Handle errors gracefully

### Pull Request Process

1. **Fork the repository**
2. **Create feature branch** from `develop`
3. **Implement changes** with tests
4. **Update documentation** as needed
5. **Run quality checks** (`npm run validate`)
6. **Submit pull request** with detailed description

### Commit Message Format

```
type(scope): description

feat(voice): add support for multiple languages
fix(wallet): resolve connection timeout issues
docs(api): update smart contract documentation
test(e2e): add voice command integration tests
```

---

## 🐛 Debugging

### Common Development Issues

#### Voice Recognition Not Working
```typescript
// Check browser support
if (!('webkitSpeechRecognition' in window)) {
  console.error('Browser does not support speech recognition');
}

// Check microphone permissions
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('Microphone access granted'))
  .catch(err => console.error('Microphone access denied:', err));
```

#### Wallet Connection Issues
```typescript
// Debug wallet extension detection
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

const checkWallets = async () => {
  const extensions = await web3Enable('EchoPay-2');
  console.log('Available extensions:', extensions);
  
  const accounts = await web3Accounts();
  console.log('Available accounts:', accounts);
};
```

#### Smart Contract Deployment Issues
```bash
# Check node is running
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
  http://localhost:9944

# Verify contract compilation
cd contracts/payment_recorder
cargo contract check
```

### Debug Configuration

#### Vite Development Server
```typescript
// vite.config.ts
export default defineConfig({
  // ... other config
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  define: {
    __DEV__: true
  }
});
```

#### Environment-based Debugging
```typescript
// utils/debug.ts
export const debug = {
  voice: process.env.VITE_DEBUG_VOICE === 'true',
  wallet: process.env.VITE_DEBUG_WALLET === 'true',
  api: process.env.VITE_DEBUG_API === 'true',
};

// Usage
if (debug.voice) {
  console.log('Voice recognition started');
}
```

---

## 📊 Performance Optimization

### Frontend Optimization
- Code splitting with dynamic imports
- Lazy loading of components
- Polkadot.js API optimization
- Voice processing optimization

### Smart Contract Optimization
- Gas usage optimization
- Storage layout optimization
- Function call optimization

---

## 🔐 Security Considerations

### Development Security
- Never commit private keys
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error handling

### Code Review Checklist
- [ ] No sensitive data in code
- [ ] Proper input validation
- [ ] Error handling implemented
- [ ] Tests cover security scenarios
- [ ] Documentation updated

---

This development guide provides everything needed to contribute effectively to EchoPay-2. For additional help, refer to the API documentation and troubleshooting guide.

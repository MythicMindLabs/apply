# Voice-Activated DOT Payments MVP

## ✅ Core MVP Features
- Basic voice-activated payments using simple voice commands  
- Direct DOT transfers via wallet integration (no smart contract needed)  
- SubWallet/Talisman integration for transaction signing  
- Web Speech API for voice capture  
- Basic command parsing with regex/simple NLP  
- Transaction history (stored locally or in browser storage)  
- Responsive React frontend with TypeScript  

---

## 🛠️ Simplified Architecture (MVP)


User Voice → Web Speech API → Simple Text Parser → Polkadot.js API → Wallet Signing → Direct DOT Transfer

flowchart LR
A[User Voice] --> B[Web Speech API]
B --> C[Simple Text Parser]
C --> D[Polkadot.js API]
D --> E[Wallet Signing]
E --> F[Direct DOT Transfer]



---

## 🚫 What We're Skipping for MVP
- ❌ ink! smart contracts  
- ❌ Advanced NLP processing  
- ❌ External voice-to-text services  
- ❌ Cross-chain XCM functionality  
- ❌ Voice authentication/biometrics  
- ❌ Production security features  

---

## 📌 MVP Technical Stack

### **Frontend**
- React + Vite + TypeScript  
- `@polkadot/api` for blockchain connectivity  
- `@polkadot/extension-dapp` for wallet integration  
- Web Speech API for voice capture  
- Basic regex/string parsing for command interpretation  

### **Core Functionality**
- **Voice Commands**:  
  - `Send 5 DOT to [address]`  
  - `Send 5 DOT to Alice`  
- **Address Book**:  
  - Simple local storage for name-to-address mapping  
- **Direct Transfers**:  
  - Uses `api.tx.balances.transferKeepAlive()`  
- **Transaction History**:  
  - Stored locally  
- **Basic Error Handling**:  
  - Connection issues, insufficient funds, etc.  

---

## 🎙️ Supported Commands (MVP)
- `Send [amount] DOT to [address/name]`  
- `Check my balance`  
- `Show transaction history`  
- `Add contact [name] [address]`  

---

## 🚀 Development Approach

### **Phase 1: Basic Voice + Wallet**
- Set up React + Vite + TypeScript  
- Implement Web Speech API voice capture  
- Connect to SubWallet/Talisman  
- Basic command parsing  

### **Phase 2: Payment Functionality**
- Implement DOT transfer logic  
- Add basic error handling  
- Create simple transaction history  

### **Phase 3: Enhanced UX**
- Add address book functionality  
- Improve voice command parsing  
- Add visual feedback and confirmations  

---

## 📍 Milestones
- **Milestone 1** → Phase 1 + Phase 2  
- **Milestone 2** → Phase 3  

# 📚 EchoPay-2 API Documentation

## Overview

EchoPay-2 provides a comprehensive API ecosystem for voice-activated Polkadot payments, featuring smart contract interfaces, frontend APIs, and voice processing capabilities.

---

## 🔗 Smart Contract API

### Payment Recorder Contract (ink!)

The core smart contract written in Rust using the ink! framework.

#### Contract Address
- **Local Development**: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`
- **Westend Testnet**: `TBD`
- **Rococo Testnet**: `TBD`

#### Data Structures

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PaymentRecord {
    pub recipient: AccountId,
    pub amount: Balance,
    pub timestamp: Timestamp,
    pub memo: Option<Vec<u8>>,
}
```

#### Constructor

```rust
/// Creates a new payment recorder contract
#[ink(constructor)]
pub fn new() -> Self
```

**Description**: Initializes the contract with empty payment history storage.

#### Messages (Read Functions)

##### `get_payment_history`
```rust
#[ink(message)]
pub fn get_payment_history(&self, user: AccountId) -> Vec<PaymentRecord>
```

**Parameters**:
- `user`: AccountId - The user's Polkadot address

**Returns**: Vector of PaymentRecord structs containing payment history

**Example**:
```javascript
const history = await contract.query.getPaymentHistory(userAddress);
```

##### `get_my_payment_history`
```rust
#[ink(message)]
pub fn get_my_payment_history(&self) -> Vec<PaymentRecord>
```

**Returns**: Payment history for the calling account

**Example**:
```javascript
const myHistory = await contract.query.getMyPaymentHistory();
```

##### `get_total_payments`
```rust
#[ink(message)]
pub fn get_total_payments(&self) -> u64
```

**Returns**: Total number of payments recorded across all users

##### `get_payment_count`
```rust
#[ink(message)]
pub fn get_payment_count(&self, user: AccountId) -> u32
```

**Parameters**:
- `user`: AccountId - The user's address

**Returns**: Number of payments for the specified user

##### `has_payment_history`
```rust
#[ink(message)]
pub fn has_payment_history(&self, user: AccountId) -> bool
```

**Parameters**:
- `user`: AccountId - The user's address

**Returns**: Boolean indicating if user has any payment history

#### Messages (Write Functions)

##### `record_payment`
```rust
#[ink(message)]
pub fn record_payment(
    &mut self,
    recipient: AccountId,
    amount: Balance,
    memo: Option<Vec<u8>>,
) -> Result<()>
```

**Parameters**:
- `recipient`: AccountId - Payment recipient's address
- `amount`: Balance - Payment amount in planck (smallest DOT unit)
- `memo`: Option<Vec<u8>> - Optional payment memo

**Returns**: Result indicating success or error

**Errors**:
- `ZeroAmount`: Payment amount cannot be zero
- `InvalidRecipient`: Recipient address is invalid

**Example**:
```javascript
const result = await contract.tx.recordPayment(
  recipientAddress,
  amount,
  memo
).signAndSend(signer);
```

#### Events

##### `PaymentRecorded`
```rust
#[ink(event)]
pub struct PaymentRecorded {
    #[ink(topic)]
    sender: AccountId,
    #[ink(topic)]
    recipient: AccountId,
    amount: Balance,
    timestamp: Timestamp,
    memo: Option<Vec<u8>>,
}
```

**Emitted when**: A payment is successfully recorded

**Example Listener**:
```javascript
contract.events.PaymentRecorded((error, event) => {
  if (!error) {
    console.log('Payment recorded:', event.returnValues);
  }
});
```

---

## 🌐 Frontend API

### Voice Recognition API

#### `useVoice` Hook

Custom React hook for voice recognition functionality.

```typescript
interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useVoice = (): UseVoiceReturn
```

**Properties**:
- `isListening`: Boolean indicating if voice recognition is active
- `transcript`: Current transcribed text
- `confidence`: Recognition confidence (0-1)
- `error`: Error message if recognition fails
- `isSupported`: Browser support for Web Speech API

**Methods**:
- `startListening()`: Begin voice recognition
- `stopListening()`: Stop voice recognition
- `resetTranscript()`: Clear current transcript

**Example**:
```typescript
const {
  isListening,
  transcript,
  confidence,
  startListening,
  stopListening
} = useVoice();

// Start listening
const handleStartRecording = () => {
  startListening();
};

// Check transcript
useEffect(() => {
  if (transcript && confidence > 0.8) {
    // Process voice command
    parseVoiceCommand(transcript);
  }
}, [transcript, confidence]);
```

### Wallet Integration API

#### `useWallet` Hook

```typescript
interface UseWalletReturn {
  selectedAccount: InjectedAccount | null;
  accounts: InjectedAccount[];
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSend: (transaction: any) => Promise<string>;
}

const useWallet = (): UseWalletReturn
```

**Properties**:
- `selectedAccount`: Currently selected wallet account
- `accounts`: Available wallet accounts
- `isConnected`: Wallet connection status

**Methods**:
- `connect()`: Connect to wallet extension
- `disconnect()`: Disconnect wallet
- `signAndSend()`: Sign and send transaction

**Example**:
```typescript
const { connect, selectedAccount, signAndSend } = useWallet();

// Connect wallet
await connect();

// Send transaction
const hash = await signAndSend(transaction);
```

### Polkadot API Integration

#### `useApi` Hook

```typescript
interface UseApiReturn {
  api: ApiPromise | null;
  isConnected: boolean;
  connect: (endpoint: string) => Promise<void>;
  disconnect: () => void;
}

const useApi = (): UseApiReturn
```

**Example**:
```typescript
const { api, isConnected, connect } = useApi();

// Connect to Polkadot node
await connect('wss://westend-rpc.polkadot.io');

// Create transaction
const transfer = api.tx.balances.transferKeepAlive(recipient, amount);
```

---

## 🎤 Voice Processing API

### Command Parser

#### `parseVoiceCommand`

```typescript
interface ParsedCommand {
  amount: string;
  recipient: string;
  currency: string;
  memo?: string;
}

function parseVoiceCommand(text: string): ParsedCommand | null
```

**Supported Patterns**:
- `"Send [amount] [currency] to [recipient]"`
- `"Pay [recipient] [amount] [currency]"`
- `"Transfer [amount] [currency] to [address] with memo [memo]"`

**Example**:
```typescript
const command = parseVoiceCommand("Send 5 DOT to Alice");
// Returns: { amount: "5", currency: "DOT", recipient: "Alice" }
```

### Voice Synthesis (ElevenLabs Integration)

#### `elevenLabsService`

```typescript
interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
}

class ElevenLabsService {
  async synthesizeSpeech(text: string): Promise<AudioBuffer>;
  async playResponse(text: string): Promise<void>;
}
```

**Example**:
```typescript
import { elevenLabsService } from './services/elevenLabsService';

// Synthesize confirmation message
await elevenLabsService.playResponse(
  "Payment of 5 DOT to Alice has been confirmed"
);
```

---

## 🔗 Network Configuration

### Supported Networks

```typescript
interface NetworkConfig {
  name: string;
  endpoint: string;
  currency: string;
  decimals: number;
}

const NETWORKS: Record<string, NetworkConfig> = {
  westend: {
    name: 'Westend Testnet',
    endpoint: 'wss://westend-rpc.polkadot.io',
    currency: 'WND',
    decimals: 12
  },
  rococo: {
    name: 'Rococo Testnet',
    endpoint: 'wss://rococo-rpc.polkadot.io',
    currency: 'ROC',
    decimals: 12
  },
  local: {
    name: 'Local Development',
    endpoint: 'ws://127.0.0.1:9944',
    currency: 'DEV',
    decimals: 12
  }
}
```

---

## 📊 Error Handling

### Smart Contract Errors

```rust
#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    Unauthorized,
    ZeroAmount,
    InvalidRecipient,
}
```

### Frontend Error Types

```typescript
interface VoiceError {
  code: 'RECOGNITION_FAILED' | 'UNSUPPORTED_BROWSER' | 'PERMISSION_DENIED';
  message: string;
}

interface WalletError {
  code: 'CONNECTION_FAILED' | 'NO_ACCOUNTS' | 'USER_REJECTED';
  message: string;
}

interface TransactionError {
  code: 'INSUFFICIENT_BALANCE' | 'INVALID_ADDRESS' | 'NETWORK_ERROR';
  message: string;
  details?: any;
}
```

---

## 🔐 Security Considerations

### Authentication
- Voice biometric authentication (future enhancement)
- Wallet signature verification
- Transaction confirmation required

### Data Privacy
- Voice data processed locally when possible
- No persistent audio storage
- Encrypted communication with external services

### Smart Contract Security
- Ownership verification for administrative functions
- Input validation for all parameters
- Event emission for transparency

---

## 📈 Rate Limits

### ElevenLabs API
- **Free Tier**: 10,000 characters/month
- **Paid Tier**: Custom limits based on subscription

### Polkadot Network
- **Transaction Fees**: Dynamic based on network congestion
- **Block Time**: ~6 seconds per block

---

## 🧪 Testing API

### Contract Testing

```bash
# Run contract tests
cd contracts/payment_recorder
cargo test

# Run with coverage
cargo tarpaulin --out Html
```

### Frontend Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 📚 Examples

### Complete Payment Flow

```typescript
// 1. Initialize voice recognition
const { startListening, transcript } = useVoice();

// 2. Start listening
startListening();

// 3. Parse voice command
const command = parseVoiceCommand(transcript);

// 4. Connect wallet
const { signAndSend } = useWallet();

// 5. Create and send transaction
const transfer = api.tx.balances.transferKeepAlive(
  command.recipient,
  parseFloat(command.amount) * 1e12 // Convert to planck
);

const hash = await signAndSend(transfer);

// 6. Record payment in contract
await contract.tx.recordPayment(
  command.recipient,
  parseFloat(command.amount) * 1e12,
  command.memo ? new TextEncoder().encode(command.memo) : null
).signAndSend(signer);

// 7. Provide voice confirmation
await elevenLabsService.playResponse(
  `Payment of ${command.amount} ${command.currency} sent successfully`
);
```

---

## 🔗 External APIs

### Web Speech API
- **Recognition**: `webkitSpeechRecognition` or `SpeechRecognition`
- **Synthesis**: `speechSynthesis.speak()`

### Polkadot.js API
- **Documentation**: https://polkadot.js.org/docs/
- **GitHub**: https://github.com/polkadot-js/api

### ElevenLabs API
- **Documentation**: https://elevenlabs.io/docs
- **Rate Limits**: Based on subscription tier

---

This API documentation provides comprehensive coverage of all EchoPay-2 interfaces and integration points. For additional examples and advanced usage, refer to the source code and test files.

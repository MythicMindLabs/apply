# 🔧 EchoPay-2 Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide helps resolve common issues with EchoPay-2, the voice-activated Polkadot payment system. Find solutions for voice recognition, wallet connectivity, network issues, and more.

---

## 🎤 Voice Recognition Issues

### Problem: Voice Recognition Not Working

#### Symptoms
- Microphone button appears disabled
- No response when speaking
- Browser shows microphone permission denied

#### Solutions

**1. Check Browser Support**
```javascript
// Test in browser console
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('✅ Speech recognition supported');
} else {
  console.log('❌ Speech recognition not supported');
}
```

**Supported Browsers**:
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (limited support)

**2. Check Microphone Permissions**
```javascript
// Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone access denied:', err));
```

**To fix permissions**:
- **Chrome**: Settings → Privacy and Security → Site Settings → Microphone
- **Safari**: Safari → Preferences → Websites → Microphone
- **Edge**: Settings → Site permissions → Microphone

**3. Browser Settings Reset**
```bash
# Clear browser data for EchoPay
# Go to: chrome://settings/content/microphone
# Remove EchoPay from blocked sites
```

### Problem: Low Recognition Accuracy

#### Symptoms
- Commands not recognized correctly
- Partial transcripts
- Wrong amounts or recipients

#### Solutions

**1. Improve Speaking Technique**
- Speak clearly and at moderate pace
- Pause between command parts
- Use natural intonation
- Minimize background noise

**2. Optimal Environment**
- Quiet room with minimal echo
- Close to microphone (12-18 inches)
- Stable internet connection
- No competing audio sources

**3. Command Structure**
```
✅ Good: "Send" [pause] "five DOT" [pause] "to Alice"
❌ Poor: "Sendfivedotttoalice" (no pauses)

✅ Good: "Pay Bob ten point five WND"
❌ Poor: "Pay Bob 10.5 WND" (spell out numbers)
```

### Problem: Voice Recognition Stops Suddenly

#### Symptoms
- Recording stops mid-command
- Timeout errors
- Intermittent functionality

#### Solutions

**1. Check Network Stability**
```bash
# Test connection stability
ping google.com -c 10
```

**2. Browser Resource Management**
```javascript
// Clear browser cache
// Close unnecessary tabs
// Restart browser
```

**3. Microphone Hardware**
- Test with different microphone
- Check audio input levels
- Update audio drivers

---

## 🔗 Wallet Connection Issues

### Problem: Wallet Extension Not Detected

#### Symptoms
- "No wallet found" message
- Extension appears installed but not recognized
- Connection button not working

#### Solutions

**1. Verify Extension Installation**

**SubWallet**:
- Install from [SubWallet.app](https://subwallet.app/)
- Refresh browser after installation
- Check extension is enabled

**Talisman**:
- Install from [Talisman.xyz](https://talisman.xyz/)
- Allow access to all sites
- Enable developer mode if needed

**Polkadot.js**:
- Install from [Polkadot.js Extension](https://polkadot.js.org/extension/)
- Grant necessary permissions
- Ensure not blocked by ad blockers

**2. Extension Permission Check**
```javascript
// Test extension detection
import { web3Enable } from '@polkadot/extension-dapp';

web3Enable('EchoPay-2').then(extensions => {
  console.log('Available extensions:', extensions);
});
```

**3. Browser Compatibility**
- Use Chromium-based browsers (Chrome, Edge, Brave)
- Disable ad blockers temporarily
- Clear browser cache and cookies

### Problem: No Accounts Available

#### Symptoms
- Wallet connects but shows no accounts
- Empty account dropdown
- "Please create an account" message

#### Solutions

**1. Create Account in Extension**
- Open wallet extension
- Create new account or import existing
- Ensure account is not hidden

**2. Account Permissions**
- Grant website access to accounts
- Check privacy settings in extension
- Verify account is for correct network

**3. Network Configuration**
```javascript
// Verify account network compatibility
const accounts = await web3Accounts();
console.log('Available accounts:', accounts);
```

### Problem: Transaction Signing Fails

#### Symptoms
- "Transaction failed" error
- Signing popup doesn't appear
- User rejection errors

#### Solutions

**1. Check Account Balance**
```javascript
// Verify sufficient balance
const balance = await api.query.system.account(address);
console.log('Account balance:', balance.data.free.toString());
```

**2. Network Verification**
- Ensure connected to correct network
- Verify transaction fees available
- Check network status

**3. Extension Troubleshooting**
- Update extension to latest version
- Restart browser
- Re-import account if necessary

---

## 🌐 Network Connectivity Issues

### Problem: Cannot Connect to Polkadot Network

#### Symptoms
- "Network disconnected" status
- WebSocket connection errors
- API initialization failures

#### Solutions

**1. Network Endpoint Verification**
```javascript
// Test network connectivity
const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
wsProvider.connect().then(() => {
  console.log('✅ Network connected');
}).catch(err => {
  console.error('❌ Network connection failed:', err);
});
```

**2. Alternative Endpoints**

**Westend Testnet**:
- `wss://westend-rpc.polkadot.io`
- `wss://westend.api.onfinality.io/public-ws`
- `wss://westend-rpc.dwellir.com`

**Rococo Testnet**:
- `wss://rococo-rpc.polkadot.io`
- `wss://rococo.api.onfinality.io/public-ws`

**Local Development**:
- `ws://127.0.0.1:9944`
- `ws://localhost:9944`

**3. Firewall and Network Settings**
- Check corporate firewall settings
- Verify WebSocket connections allowed
- Test from different network

### Problem: Smart Contract Not Found

#### Symptoms
- "Contract not deployed" error
- Contract call failures
- Invalid contract address

#### Solutions

**1. Verify Contract Deployment**
```bash
# Check contract exists
cargo contract info \
  --url wss://westend-rpc.polkadot.io \
  5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

**2. Check Environment Configuration**
```env
# Verify .env file
VITE_CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
VITE_NETWORK_URL=wss://westend-rpc.polkadot.io
```

**3. Redeploy Contract**
```bash
# Deploy to current network
cd contracts/payment_recorder
cargo contract build --release
cargo contract instantiate --suri //Alice
```

---

## 💻 Application Issues

### Problem: Application Won't Load

#### Symptoms
- Blank white screen
- JavaScript errors in console
- Build artifacts missing

#### Solutions

**1. Clear Browser Cache**
```bash
# Force refresh
Ctrl+F5 (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear all data
Chrome → Settings → Privacy → Clear browsing data
```

**2. Check Console Errors**
```javascript
// Open browser developer tools (F12)
// Look for error messages in Console tab
// Common errors and solutions:

// Error: Module not found
// Solution: npm install

// Error: Environment variable undefined
// Solution: Check .env file configuration

// Error: Network request failed
// Solution: Check network connectivity
```

**3. Rebuild Application**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
npm run dev
```

### Problem: Styling Issues

#### Symptoms
- Layout broken
- Missing CSS styles
- Responsive design not working

#### Solutions

**1. CSS Loading Issues**
```bash
# Check if CSS files are loaded
# In browser Network tab, verify CSS files load successfully
```

**2. Responsive Design**
```css
/* Test viewport settings */
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**3. Browser Compatibility**
- Test in different browsers
- Check CSS Grid/Flexbox support
- Verify CSS custom properties support

### Problem: Transaction History Not Loading

#### Symptoms
- Empty transaction list
- Loading spinner never stops
- Error fetching history

#### Solutions

**1. Contract Query Issues**
```javascript
// Test contract query directly
const contract = new ContractPromise(api, abi, contractAddress);
const result = await contract.query.getMyPaymentHistory(address, {});
console.log('Query result:', result);
```

**2. Account Permissions**
- Verify account is connected
- Check read permissions
- Ensure correct contract address

**3. Network Synchronization**
- Wait for network sync completion
- Check block height synchronization
- Verify node is fully synced

---

## 🔊 Audio Issues

### Problem: ElevenLabs Voice Synthesis Not Working

#### Symptoms
- No voice confirmation playback
- Audio synthesis errors
- API key invalid errors

#### Solutions

**1. API Key Configuration**
```env
# Check .env file
VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

**2. API Key Verification**
```bash
# Test API key
curl -X GET \
  "https://api.elevenlabs.io/v1/voices" \
  -H "accept: application/json" \
  -H "xi-api-key: YOUR_API_KEY"
```

**3. Audio Playback Issues**
```javascript
// Test audio playback capability
const audio = new Audio();
audio.canPlayType('audio/mpeg'); // Should not be empty string
```

### Problem: Browser Audio Policy Restrictions

#### Symptoms
- "Audio play blocked" errors
- Autoplay policy violations
- Silent audio playback

#### Solutions

**1. User Interaction Requirement**
```javascript
// Audio must be triggered by user interaction
button.addEventListener('click', () => {
  audio.play(); // This will work
});

// This will be blocked:
// audio.play(); // Called without user interaction
```

**2. Audio Context Management**
```javascript
// Resume audio context after user interaction
document.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });
```

---

## 🔍 Development Issues

### Problem: Local Development Setup

#### Symptoms
- Cannot start local node
- Contract build failures
- npm install errors

#### Solutions

**1. Environment Setup**
```bash
# Verify installations
node --version  # Should be 18+
npm --version
rustc --version
cargo --version

# Install missing tools
cargo install cargo-contract --force --locked
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git
```

**2. Node.js Dependencies**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Rust Toolchain Issues**
```bash
# Update Rust
rustup update stable

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Verify cargo-contract
cargo contract --version
```

### Problem: Contract Compilation Errors

#### Symptoms
- Rust compilation failures
- ink! version conflicts
- WebAssembly build errors

#### Solutions

**1. ink! Version Compatibility**
```toml
# Check Cargo.toml
[dependencies]
ink = { version = "4.3.0", default-features = false }
```

**2. Rust Toolchain Version**
```bash
# Use specific toolchain
rustup default stable
rustup target add wasm32-unknown-unknown --toolchain stable
```

**3. Clean Build**
```bash
# Clean and rebuild
cd contracts/payment_recorder
cargo clean
cargo contract build --release
```

---

## 📱 Mobile Device Issues

### Problem: Mobile Browser Compatibility

#### Symptoms
- Voice recognition not working on mobile
- Touch interface issues
- Responsive design problems

#### Solutions

**1. Mobile Browser Support**
- **iOS Safari**: Limited speech recognition support
- **Android Chrome**: Full support
- **Mobile Firefox**: No speech recognition support

**2. Mobile-Specific Settings**
```javascript
// Detect mobile device
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Adjust voice recognition settings for mobile
  recognition.continuous = false;
  recognition.interimResults = false;
}
```

**3. Touch Interface Optimization**
```css
/* Improve touch targets */
.voice-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}
```

---

## 🐛 Common Error Messages

### "Speech recognition not supported in this browser"

**Solution**: Use Chrome, Edge, or Safari. Firefox has limited support.

### "Permission denied for microphone access"

**Solution**: Grant microphone permissions in browser settings.

### "Network connection failed"

**Solution**: Check internet connection and firewall settings.

### "Wallet not found"

**Solution**: Install and enable Polkadot wallet extension.

### "Insufficient balance for transaction"

**Solution**: Add funds to account or reduce transaction amount.

### "Contract method not found"

**Solution**: Verify contract is deployed and ABI is correct.

### "Invalid address format"

**Solution**: Use valid Polkadot address (47-48 characters starting with 5).

### "Transaction rejected by user"

**Solution**: User canceled transaction in wallet extension.

---

## 🛠️ Diagnostic Tools

### Browser Developer Tools

**1. Console Logging**
```javascript
// Enable debug mode
localStorage.setItem('echopay_debug', 'true');

// View detailed logs
console.log('[EchoPay] Voice recognition started');
console.log('[EchoPay] Transaction details:', txDetails);
```

**2. Network Tab**
- Monitor WebSocket connections
- Check API request/responses
- Verify resource loading

**3. Application Tab**
- Check localStorage values
- Verify service worker status
- Monitor IndexedDB usage

### Contract Testing Tools

**1. Polkadot.js Apps**
- Connect to [Polkadot.js Apps](https://polkadot.js.org/apps/)
- Test contract calls directly
- Verify account balances

**2. Cargo Contract CLI**
```bash
# Test contract calls
cargo contract call \
  --url wss://westend-rpc.polkadot.io \
  --contract $CONTRACT_ADDRESS \
  --message get_total_payments \
  --suri //Alice \
  --dry-run
```

### Network Diagnostic Commands

```bash
# Test network connectivity
curl -I https://westend-rpc.polkadot.io

# Check WebSocket connection
wscat -c wss://westend-rpc.polkadot.io

# DNS resolution test
nslookup westend-rpc.polkadot.io
```

---

## 🆘 Getting Help

### Community Support

**1. GitHub Issues**
- Report bugs: [GitHub Issues](https://github.com/MythicMindLabs/apply/issues)
- Feature requests: [GitHub Discussions](https://github.com/MythicMindLabs/apply/discussions)

**2. Documentation**
- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)

**3. Polkadot Community**
- [Polkadot Technical Chat](https://matrix.to/#/#polkadot-technical:matrix.org)
- [Substrate Technical Chat](https://matrix.to/#/#substrate-technical:matrix.org)
- [ink! Smart Contracts](https://matrix.to/#/#ink:matrix.parity.io)

### Issue Reporting Template

```markdown
## Bug Report

**Environment**:
- Browser: Chrome 96.0.4664.110
- OS: Windows 10
- Network: Westend
- EchoPay Version: 1.0.0

**Description**:
Brief description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Console Errors**:
Paste any console error messages

**Additional Context**:
Any other relevant information
```

---

## 🔄 Emergency Procedures

### Complete Reset

**1. Clear All Data**
```bash
# Clear browser storage
localStorage.clear();
sessionStorage.clear();

# Clear service workers
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
```

**2. Reinstall Extensions**
- Remove all Polkadot wallet extensions
- Clear browser cache and cookies
- Reinstall extensions
- Reconfigure accounts

**3. Fresh Environment**
```bash
# Complete project reset
rm -rf node_modules .env dist
git clean -fd
git reset --hard HEAD
npm install
cp .env.example .env
# Edit .env with correct values
npm run dev
```

### Data Recovery

**1. Account Recovery**
- Use seed phrase in wallet extension
- Import account to different extension
- Verify account on blockchain explorer

**2. Transaction History**
- Query directly from smart contract
- Use blockchain explorer
- Export data from wallet extension

---

This troubleshooting guide covers the most common issues with EchoPay-2. For issues not covered here, please refer to the GitHub repository or community support channels.

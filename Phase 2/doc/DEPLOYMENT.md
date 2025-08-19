# 🚀 EchoPay-2 Deployment Guide

## Overview

This guide covers deploying EchoPay-2 to various environments, from local development to production networks. EchoPay-2 supports deployment across multiple Polkadot networks and hosting platforms.

---

## 🌐 Supported Networks

### Local Development
- **Network**: Local Substrate node
- **Currency**: DEV tokens
- **Endpoint**: `ws://127.0.0.1:9944`
- **Use Case**: Development and testing

### Westend Testnet
- **Network**: Polkadot testnet
- **Currency**: WND (Westend tokens)
- **Endpoint**: `wss://westend-rpc.polkadot.io`
- **Use Case**: Public testing and demonstrations

### Rococo Testnet
- **Network**: Parachain testnet
- **Currency**: ROC (Rococo tokens)
- **Endpoint**: `wss://rococo-rpc.polkadot.io`
- **Use Case**: Parachain testing and XCM development

### Polkadot Mainnet (Future)
- **Network**: Polkadot production
- **Currency**: DOT tokens
- **Endpoint**: `wss://rpc.polkadot.io`
- **Use Case**: Production deployment

---

## 🏠 Local Development Deployment

### Prerequisites

```bash
# Install required tools
cargo install cargo-contract --force --locked
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force --locked
```

### 1. Start Local Node

```bash
# Start substrate contracts node
substrate-contracts-node --dev --tmp

# Alternative: using npm script
npm run start:node
```

**Verification**: Node should be running on `ws://127.0.0.1:9944`

### 2. Deploy Smart Contract

```bash
# Navigate to contract directory
cd contracts/payment_recorder

# Build contract
cargo contract build --release

# Deploy contract
cargo contract instantiate \
  --suri //Alice \
  --constructor new \
  --args \
  --skip-confirm
```

**Expected Output**:
```
Contract 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

### 3. Configure Frontend

Update `.env` file:
```env
VITE_NETWORK_URL=ws://127.0.0.1:9944
VITE_NETWORK_NAME=development
VITE_CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

### 4. Start Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Access**: Application available at `http://localhost:3000`

---

## 🌍 Testnet Deployment

### Westend Testnet Deployment

#### 1. Obtain WND Tokens

```bash
# Get testnet tokens from faucet
curl -X POST https://westend-faucet.polkadot.io/drip \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_WESTEND_ADDRESS"}'
```

**Alternative**: Use [Polkadot Faucet](https://faucet.polkadot.io/)

#### 2. Deploy Contract to Westend

```bash
# Build contract
cd contracts/payment_recorder
cargo contract build --release

# Deploy to Westend
cargo contract instantiate \
  --url wss://westend-rpc.polkadot.io \
  --suri "YOUR_SEED_PHRASE" \
  --constructor new \
  --args \
  --skip-confirm
```

#### 3. Configure for Westend

Update environment:
```env
VITE_NETWORK_URL=wss://westend-rpc.polkadot.io
VITE_NETWORK_NAME=westend
VITE_CONTRACT_ADDRESS=YOUR_WESTEND_CONTRACT_ADDRESS
```

### Rococo Testnet Deployment

#### 1. Deploy to Rococo

```bash
# Deploy to Rococo
cargo contract instantiate \
  --url wss://rococo-contracts-rpc.polkadot.io \
  --suri "YOUR_SEED_PHRASE" \
  --constructor new \
  --args \
  --skip-confirm
```

#### 2. Configure for Rococo

```env
VITE_NETWORK_URL=wss://rococo-contracts-rpc.polkadot.io
VITE_NETWORK_NAME=rococo
VITE_CONTRACT_ADDRESS=YOUR_ROCOCO_CONTRACT_ADDRESS
```

---

## ☁️ Frontend Deployment

### Vercel Deployment (Recommended)

#### 1. Prepare for Deployment

```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure deployment
```

#### 3. Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_NETWORK_URL": "wss://westend-rpc.polkadot.io",
    "VITE_NETWORK_NAME": "westend",
    "VITE_CONTRACT_ADDRESS": "@contract_address"
  }
}
```

**Environment Variables in Vercel Dashboard**:
- `VITE_NETWORK_URL`
- `VITE_NETWORK_NAME`
- `VITE_CONTRACT_ADDRESS`
- `VITE_ELEVENLABS_API_KEY` (optional)

### Netlify Deployment

#### 1. Build Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages Deployment

#### 1. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_NETWORK_URL: ${{ secrets.VITE_NETWORK_URL }}
        VITE_CONTRACT_ADDRESS: ${{ secrets.VITE_CONTRACT_ADDRESS }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 2. Configure Repository

1. Go to repository **Settings** → **Pages**
2. Select **GitHub Actions** as source
3. Add environment secrets in **Settings** → **Secrets**

---

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
# Build production image
docker build -t echopay-2:latest .

# Run container
docker run -p 80:80 \
  -e VITE_NETWORK_URL=wss://westend-rpc.polkadot.io \
  -e VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS \
  echopay-2:latest
```

### 2. Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  echopay-2:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_NETWORK_URL=wss://westend-rpc.polkadot.io
      - VITE_NETWORK_NAME=westend
      - VITE_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
    restart: unless-stopped

  substrate-node:
    image: parity/substrate-contracts-node:latest
    ports:
      - "9944:9944"
    command: 
      - --dev
      - --rpc-external
      - --rpc-cors=all
    restart: unless-stopped
```

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🔧 Environment Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NETWORK_URL` | Polkadot network endpoint | `wss://westend-rpc.polkadot.io` |
| `VITE_NETWORK_NAME` | Network display name | `westend` |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `5GrwvaEF...` |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key (optional) | `your_api_key` |
| `VITE_ELEVENLABS_VOICE_ID` | Voice ID for synthesis | `voice_id` |
| `VITE_DEBUG_MODE` | Enable debug logging | `true` |

### Network-Specific Configurations

#### Development
```env
VITE_NETWORK_URL=ws://127.0.0.1:9944
VITE_NETWORK_NAME=development
VITE_DEBUG_MODE=true
```

#### Westend Testnet
```env
VITE_NETWORK_URL=wss://westend-rpc.polkadot.io
VITE_NETWORK_NAME=westend
VITE_DEBUG_MODE=false
```

#### Production
```env
VITE_NETWORK_URL=wss://rpc.polkadot.io
VITE_NETWORK_NAME=polkadot
VITE_DEBUG_MODE=false
```

---

## 📊 Monitoring and Analytics

### Application Monitoring

#### Health Check Endpoint

Add to your deployment:
```typescript
// src/api/health.ts
export const healthCheck = async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    network: process.env.VITE_NETWORK_NAME,
    contract: process.env.VITE_CONTRACT_ADDRESS
  };
};
```

#### Error Monitoring

```typescript
// src/utils/monitoring.ts
export const logError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    console.error(`[${context}] ${error.message}`, error);
  }
};
```

### Performance Monitoring

```javascript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔐 Security Configuration

### HTTPS/SSL Configuration

#### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name echopay.example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' wss://*.polkadot.io ws://localhost:9944;
  media-src 'self' blob:;
  worker-src 'self' blob:;
">
```

---

## 🧪 Deployment Testing

### Pre-deployment Checklist

```bash
# 1. Run all tests
npm run test:ci

# 2. Build production version
npm run build

# 3. Test production build
npm run preview

# 4. Verify contract deployment
cargo contract info --url $NETWORK_URL $CONTRACT_ADDRESS

# 5. Test critical user flows
npm run test:e2e
```

### Post-deployment Verification

#### 1. Frontend Verification
- [ ] Application loads correctly
- [ ] Wallet connection works
- [ ] Voice recognition functions
- [ ] Transaction flow completes
- [ ] Error handling works

#### 2. Smart Contract Verification
```bash
# Test contract calls
cargo contract call \
  --url $NETWORK_URL \
  --contract $CONTRACT_ADDRESS \
  --message get_total_payments \
  --suri //Alice \
  --dry-run
```

#### 3. Integration Testing
```bash
# Run E2E tests against deployed version
VITE_BASE_URL=https://your-deployment.com npm run test:e2e
```

---

## 🚨 Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Contract Deployment Failures
```bash
# Check network connection
cargo contract info --url $NETWORK_URL

# Verify account balance
polkadot-js-api query.system.account $YOUR_ADDRESS --ws $NETWORK_URL
```

#### Runtime Errors
```bash
# Check browser console for errors
# Verify environment variables
# Test with minimal configuration
```

### Deployment Rollback

#### Frontend Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify deploy --prod --dir=previous-build

# GitHub Pages
git revert HEAD
git push origin main
```

#### Contract Rollback
```bash
# Deploy previous contract version
cargo contract instantiate \
  --url $NETWORK_URL \
  --suri "$SEED_PHRASE" \
  --constructor new \
  --args \
  --skip-confirm
```

---

## 📈 Scaling Considerations

### Frontend Scaling
- CDN configuration for static assets
- Image optimization and compression
- Code splitting and lazy loading
- Caching strategies

### Infrastructure Scaling
- Load balancer configuration
- Multiple region deployment
- Database scaling (if added)
- Monitoring and alerting

---

## 🔄 CI/CD Pipeline

### GitHub Actions Complete Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run test:ci
    - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Staging
      run: |
        # Deploy to staging environment
        
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Production
      run: |
        # Deploy to production environment
```

---

This deployment guide covers all aspects of deploying EchoPay-2 across different environments and platforms. Choose the deployment strategy that best fits your needs and infrastructure requirements.

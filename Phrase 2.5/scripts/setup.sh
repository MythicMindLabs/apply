#!/bin/bash

# EchoPay-2 Setup Script
set -e

echo "🚀 Setting up EchoPay-2..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install from https://nodejs.org/"
    exit 1
fi

# Navigate to frontend directory
cd frontend/voice-payment-dapp

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "⚡ Initializing React TypeScript project..."
    npm create vite@latest . -- --template react-ts
    npm install
    
    # Install additional dependencies
    echo "📦 Installing EchoPay-2 dependencies..."
    npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
    npm install @polkadot/api @polkadot/extension-dapp @polkadot/types
    npm install react-icons
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating environment file..."
    cp ../../.env.example .env
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   cd frontend/voice-payment-dapp"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:3000"
echo ""
echo "🎤 Try these voice commands:"
echo "   - 'Send 5 DOT to Alice'"
echo "   - 'What's my balance?'"
echo "   - 'Show transaction history'"
echo ""

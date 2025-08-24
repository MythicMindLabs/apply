#!/bin/bash

# EchoPay-2 One-Click Deployment Script
# This script sets up and deploys the EchoPay-2 interface for testing

set -e

echo "🚀 EchoPay-2 Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT_GUIDE.md" ]; then
    echo "❌ Please run this script from the directory containing DEPLOYMENT_GUIDE.md"
    exit 1
fi

# Create project structure
echo "📁 Creating project structure..."
mkdir -p frontend/voice-payment-dapp/src/{hooks,services,components}

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

# Navigate to frontend directory
cd frontend/voice-payment-dapp

# Initialize Vite React app if not already done
if [ ! -f "package.json" ]; then
    echo "⚡ Initializing React + TypeScript project with Vite..."
    npm create vite@latest . -- --template react-ts
    echo "✅ Project initialized"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install @polkadot/api @polkadot/extension-dapp @polkadot/types
npm install react-speech-kit @types/dom-speech-recognition
npm install axios crypto-js
npm install react-icons
npm install @testing-library/react @testing-library/jest-dom vitest

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env << EOL
# Network Configuration
VITE_WS_PROVIDER=wss://rococo-contracts-rpc.polkadot.io
VITE_NETWORK_NAME=Rococo Contracts
VITE_CONTRACT_ADDRESS=demo-contract-address

# ElevenLabs API (Optional - for TTS)
VITE_ELEVENLABS_API_KEY=

# Debug Mode
VITE_DEBUG_MODE=true
VITE_MOCK_MODE=true
EOL

# Create TypeScript config
echo "📝 Creating TypeScript configuration..."
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "types": ["dom-speech-recognition"]
  },
  "include": ["src", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create Vite config
echo "⚙️ Creating Vite configuration..."
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOL

# Update package.json scripts
echo "📋 Updating package.json scripts..."
npm pkg set scripts.dev="vite --host"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.deploy="npm run build"

# Create simple HTML template
echo "🌐 Creating HTML template..."
cat > index.html << 'EOL'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="EchoPay-2 - Voice-activated payments for Polkadot ecosystem" />
    <title>EchoPay-2 🎤 Voice Payments</title>
  </head>
  <body>
    <div id="root">
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px;">
        Loading EchoPay-2...
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Check if source files exist (they should be created by previous commands)
if [ ! -f "src/App.tsx" ] || [ ! -f "src/hooks/index.ts" ]; then
    echo "⚠️ Source files not found. Please ensure all files are created properly."
    echo "You may need to copy the App.tsx and hooks files manually."
    
    # Create basic App.tsx fallback
    cat > src/App.tsx << 'EOL'
import React from 'react';
import { ChakraProvider, Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Box p={8}>
        <VStack spacing={6}>
          <Heading size="xl" color="blue.500">EchoPay-2 🎤</Heading>
          <Text>Voice-activated payments for Polkadot ecosystem</Text>
          <Text fontSize="sm" color="gray.600">
            Demo mode - Interface loaded successfully!
          </Text>
          <Button colorScheme="blue" size="lg">
            🎤 Voice Interface Ready
          </Button>
          <Text fontSize="xs" textAlign="center" maxW="md">
            This is a basic fallback interface. Please ensure all source files are properly copied 
            from the deployment package for full functionality.
          </Text>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
EOL
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start development server
echo "🎯 Starting development server..."
echo ""
echo "✅ EchoPay-2 deployment completed!"
echo ""
echo "🌐 Application will open in your browser at: http://localhost:3000"
echo ""
echo "📋 Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"  
echo "  npm run preview  - Preview production build"
echo ""
echo "🎤 Test Voice Commands:"
echo "  - 'Send 5 DOT to Alice'"
echo "  - 'What's my balance?'"
echo "  - 'Show transaction history'"
echo "  - 'Add contact Bob'"
echo ""
echo "💡 The app is running in demo mode with mock data."
echo "   Toggle VITE_MOCK_MODE=false in .env for live blockchain connection."
echo ""

# Start the dev server
npm run dev

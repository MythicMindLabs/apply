@echo off
setlocal enabledelayedexpansion

echo 🚀 EchoPay-2 Deployment Script (Windows)
echo ==========================================

REM Check if we're in the right directory
if not exist "DEPLOYMENT_GUIDE.md" (
    echo ❌ Please run this script from the directory containing DEPLOYMENT_GUIDE.md
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is required but not installed.
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

echo 📁 Creating project structure...
mkdir frontend\voice-payment-dapp\src\hooks 2>nul
mkdir frontend\voice-payment-dapp\src\services 2>nul
mkdir frontend\voice-payment-dapp\src\components 2>nul

cd frontend\voice-payment-dapp

REM Initialize Vite React app if not already done
if not exist "package.json" (
    echo ⚡ Initializing React + TypeScript project with Vite...
    npm create vite@latest . -- --template react-ts
    echo ✅ Project initialized
)

echo 📦 Installing dependencies...
call npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
call npm install @polkadot/api @polkadot/extension-dapp @polkadot/types
call npm install react-speech-kit @types/dom-speech-recognition
call npm install axios crypto-js react-icons
call npm install @testing-library/react @testing-library/jest-dom vitest

echo 🔧 Creating environment configuration...
(
echo # Network Configuration
echo VITE_WS_PROVIDER=wss://rococo-contracts-rpc.polkadot.io
echo VITE_NETWORK_NAME=Rococo Contracts
echo VITE_CONTRACT_ADDRESS=demo-contract-address
echo.
echo # ElevenLabs API (Optional - for TTS^)
echo VITE_ELEVENLABS_API_KEY=
echo.
echo # Debug Mode
echo VITE_DEBUG_MODE=true
echo VITE_MOCK_MODE=true
) > .env

echo 📝 Creating TypeScript configuration...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "useDefineForClassFields": true,
echo     "lib": ["ES2020", "DOM", "DOM.Iterable"],
echo     "module": "ESNext",
echo     "skipLibCheck": true,
echo     "moduleResolution": "bundler",
echo     "allowImportingTsExtensions": true,
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "noEmit": true,
echo     "jsx": "react-jsx",
echo     "strict": true,
echo     "noUnusedLocals": false,
echo     "noUnusedParameters": false,
echo     "noFallthroughCasesInSwitch": true,
echo     "types": ["dom-speech-recognition"]
echo   },
echo   "include": ["src", "vite.config.ts"],
echo   "references": [{ "path": "./tsconfig.node.json" }]
echo }
) > tsconfig.json

echo ⚙️ Creating Vite configuration...
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   server: {
echo     port: 3000,
echo     host: true,
echo     open: true
echo   },
echo   define: {
echo     global: 'globalThis',
echo   },
echo   build: {
echo     outDir: 'dist',
echo     sourcemap: true
echo   }
echo })
) > vite.config.ts

echo 📋 Updating package.json scripts...
call npm pkg set scripts.dev="vite --host"
call npm pkg set scripts.build="tsc && vite build"
call npm pkg set scripts.preview="vite preview"
call npm pkg set scripts.deploy="npm run build"

echo 🌐 Creating HTML template...
(
echo ^<!doctype html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<link rel="icon" type="image/svg+xml" href="/vite.svg" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<meta name="description" content="EchoPay-2 - Voice-activated payments for Polkadot ecosystem" /^>
echo     ^<title^>EchoPay-2 🎤 Voice Payments^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>
echo       ^<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px;"^>
echo         Loading EchoPay-2...
echo       ^</div^>
echo     ^</div^>
echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > index.html

REM Check if source files exist
if not exist "src\App.tsx" (
    echo ⚠️ Creating basic fallback App.tsx...
    (
    echo import React from 'react';
    echo import { ChakraProvider, Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
    echo.
    echo const App: React.FC = (^) =^> {
    echo   return (
    echo     ^<ChakraProvider^>
    echo       ^<Box p={8}^>
    echo         ^<VStack spacing={6}^>
    echo           ^<Heading size="xl" color="blue.500"^>EchoPay-2 🎤^</Heading^>
    echo           ^<Text^>Voice-activated payments for Polkadot ecosystem^</Text^>
    echo           ^<Text fontSize="sm" color="gray.600"^>
    echo             Demo mode - Interface loaded successfully!
    echo           ^</Text^>
    echo           ^<Button colorScheme="blue" size="lg"^>
    echo             🎤 Voice Interface Ready
    echo           ^</Button^>
    echo           ^<Text fontSize="xs" textAlign="center" maxW="md"^>
    echo             This is a basic fallback interface. Please ensure all source files are properly copied 
    echo             from the deployment package for full functionality.
    echo           ^</Text^>
    echo         ^</VStack^>
    echo       ^</Box^>
    echo     ^</ChakraProvider^>
    echo   ^);
    echo };
    echo.
    echo export default App;
    ) > src\App.tsx
)

echo 🔨 Building application...
call npm run build

echo.
echo ✅ EchoPay-2 deployment completed!
echo.
echo 🌐 Application will open in your browser at: http://localhost:3000
echo.
echo 📋 Available commands:
echo   npm run dev      - Start development server
echo   npm run build    - Build for production  
echo   npm run preview  - Preview production build
echo.
echo 🎤 Test Voice Commands:
echo   - 'Send 5 DOT to Alice'
echo   - 'What's my balance?'
echo   - 'Show transaction history'
echo   - 'Add contact Bob'
echo.
echo 💡 The app is running in demo mode with mock data.
echo    Toggle VITE_MOCK_MODE=false in .env for live blockchain connection.
echo.

echo 🚀 Starting development server...
call npm run dev

pause

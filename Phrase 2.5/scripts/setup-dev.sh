#!/bin/bash

# EchoPay-2 Development Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up EchoPay-2 Development Environment"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_warning "$1 is not installed"
        return 1
    fi
}

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required"
        exit 1
    fi
else
    print_error "Node.js is required. Please install from https://nodejs.org/"
    exit 1
fi

# Check npm
if ! check_command npm; then
    print_error "npm is required (usually comes with Node.js)"
    exit 1
fi

# Check Rust
if check_command cargo; then
    RUST_VERSION=$(rustc --version)
    print_status "Rust version: $RUST_VERSION"
else
    print_warning "Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    print_success "Rust installed successfully"
fi

# Check cargo-contract
if check_command cargo-contract; then
    print_success "cargo-contract is installed"
else
    print_warning "cargo-contract not found. Installing..."
    cargo install --force --locked cargo-contract
    print_success "cargo-contract installed successfully"
fi

# Check substrate-contracts-node (optional for local development)
if check_command substrate-contracts-node; then
    print_success "substrate-contracts-node is available"
else
    print_warning "substrate-contracts-node not found."
    print_status "Install with: cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git"
fi

# Check Docker (optional)
if check_command docker; then
    print_success "Docker is available"
else
    print_warning "Docker not found. Recommended for deployment."
fi

# Setup project dependencies
print_status "Installing project dependencies..."

# Install root dependencies
if [ -f "package.json" ]; then
    print_status "Installing root package dependencies..."
    npm install
    print_success "Root dependencies installed"
fi

# Setup frontend
if [ -d "frontend/voice-payment-dapp" ]; then
    print_status "Setting up frontend dependencies..."
    cd frontend/voice-payment-dapp
    
    # Initialize if package.json doesn't exist
    if [ ! -f "package.json" ]; then
        print_status "Initializing React TypeScript project..."
        npm create vite@latest . -- --template react-ts
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Install additional dependencies
    print_status "Installing additional frontend packages..."
    npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
    npm install @polkadot/api @polkadot/extension-dapp @polkadot/types
    npm install react-speech-kit @types/dom-speech-recognition
    npm install axios crypto-js react-icons
    npm install @testing-library/react @testing-library/jest-dom vitest
    
    cd ../..
    print_success "Frontend setup completed"
fi

# Setup smart contracts
if [ -d "contracts/payment_recorder" ]; then
    print_status "Setting up smart contracts..."
    cd contracts/payment_recorder
    
    # Build the contract
    print_status "Building smart contract..."
    if cargo contract build; then
        print_success "Smart contract built successfully"
    else
        print_warning "Smart contract build failed. This is normal if dependencies are missing."
    fi
    
    cd ../..
fi

# Create environment file
print_status "Creating environment configuration..."
if [ ! -f "frontend/voice-payment-dapp/.env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example frontend/voice-payment-dapp/.env
        print_success "Environment file created from template"
    else
        cat > frontend/voice-payment-dapp/.env << EOF
# EchoPay-2 Development Environment
VITE_WS_PROVIDER=wss://rococo-contracts-rpc.polkadot.io
VITE_NETWORK_NAME=Rococo Contracts
VITE_CONTRACT_ADDRESS=demo-contract-address

# Development settings
VITE_DEBUG_MODE=true
VITE_MOCK_MODE=true

# Optional API keys
VITE_ELEVENLABS_API_KEY=
EOF
        print_success "Environment file created"
    fi
fi

# Setup git hooks
print_status "Setting up git hooks..."
if [ -d ".git" ]; then
    # Install husky if package.json exists
    if [ -f "package.json" ]; then
        npx husky install
        print_success "Git hooks configured"
    fi
fi

# Create necessary directories
print_status "Creating project directories..."
mkdir -p logs
mkdir -p docs/images
mkdir -p tests/{e2e,integration,performance}
mkdir -p deployment
mkdir -p config
mkdir -p scripts
print_success "Project directories created"

# Setup IDE configuration
print_status "Setting up IDE configuration..."

# Create VSCode settings
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.rs": "rust"
  },
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": ["std"]
}
EOF

# Create VSCode extensions recommendations
cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
EOF

print_success "IDE configuration created"

# Final checks and summary
print_status "Running final checks..."

# Check if we can build the frontend
if [ -d "frontend/voice-payment-dapp" ]; then
    cd frontend/voice-payment-dapp
    if npm run build > /dev/null 2>&1; then
        print_success "Frontend builds successfully"
    else
        print_warning "Frontend build check failed (this may be normal during initial setup)"
    fi
    cd ../..
fi

# Display setup summary
echo ""
echo "🎉 EchoPay-2 Development Environment Setup Complete!"
echo "=================================================="
echo ""
echo "📁 Project Structure:"
echo "  ├── frontend/voice-payment-dapp/  # React TypeScript frontend"
echo "  ├── contracts/payment_recorder/   # ink! smart contracts"
echo "  ├── docs/                        # Documentation"
echo "  ├── tests/                       # Test suites"
echo "  └── scripts/                     # Development scripts"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start development server:"
echo "   cd frontend/voice-payment-dapp"
echo "   npm run dev"
echo ""
echo "2. Build smart contracts:"
echo "   cd contracts/payment_recorder"
echo "   cargo contract build"
echo ""
echo "3. Run tests:"
echo "   npm test                    # All tests"
echo "   npm run test:frontend       # Frontend tests only"
echo "   npm run test:contracts      # Contract tests only"
echo ""
echo "4. Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "📖 Documentation:"
echo "   README.md                   # Main documentation"
echo "   docs/QUICK_START.md         # Getting started guide"
echo "   CONTRIBUTING.md             # Contribution guidelines"
echo ""
echo "🛟 Need Help?"
echo "   Discord: https://discord.gg/echopay"
echo "   Email: developers@echopay.io"
echo "   Issues: https://github.com/echopay-team/echopay-2/issues"
echo ""
print_success "Happy coding! 🎤💰"

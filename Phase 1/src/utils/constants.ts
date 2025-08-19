import type { NetworkConfig, NetworkType, WalletInfo, AppConfig } from './types'

// Environment variables with fallbacks
export const ENV = {
  POLKADOT_WS_URL: import.meta.env.VITE_POLKADOT_WS_URL || 'wss://rpc.polkadot.io',
  WESTEND_WS_URL: import.meta.env.VITE_WESTEND_WS_URL || 'wss://westend-rpc.polkadot.io',
  ROCOCO_WS_URL: import.meta.env.VITE_ROCOCO_WS_URL || 'wss://rococo-rpc.polkadot.io',
  LOCAL_WS_URL: import.meta.env.VITE_LOCAL_WS_URL || 'ws://127.0.0.1:9944',
  DEFAULT_NETWORK: (import.meta.env.VITE_DEFAULT_NETWORK as NetworkType) || 'westend',
  ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
  ENABLE_VOICE_SYNTHESIS: import.meta.env.VITE_ENABLE_VOICE_SYNTHESIS === 'true',
  ENABLE_TRANSACTION_HISTORY: import.meta.env.VITE_ENABLE_TRANSACTION_HISTORY !== 'false',
  ENABLE_CROSS_CHAIN: import.meta.env.VITE_ENABLE_CROSS_CHAIN === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true'
} as const

// Network configurations
export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  polkadot: {
    name: 'polkadot',
    displayName: 'Polkadot',
    wsUrl: ENV.POLKADOT_WS_URL,
    currency: 'DOT',
    decimals: 10,
    ss58Format: 0,
    color: '#E6007A',
    blockTime: 6000 // 6 seconds
  },
  westend: {
    name: 'westend',
    displayName: 'Westend Testnet',
    wsUrl: ENV.WESTEND_WS_URL,
    currency: 'WND',
    decimals: 12,
    ss58Format: 42,
    color: '#00A2FF',
    blockTime: 6000 // 6 seconds
  },
  rococo: {
    name: 'rococo',
    displayName: 'Rococo Testnet',
    wsUrl: ENV.ROCOCO_WS_URL,
    currency: 'ROC',
    decimals: 12,
    ss58Format: 42,
    color: '#FF6B35',
    blockTime: 6000 // 6 seconds
  },
  local: {
    name: 'local',
    displayName: 'Local Node',
    wsUrl: ENV.LOCAL_WS_URL,
    currency: 'UNIT',
    decimals: 12,
    ss58Format: 42,
    color: '#666666',
    blockTime: 6000 // 6 seconds
  }
} as const

// Supported wallet extensions
export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    extensionName: 'subwallet-js',
    title: 'SubWallet',
    installUrl: 'https://chrome.google.com/webstore/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn',
    logo: 'https://docs.subwallet.app/img/logo.png'
  },
  {
    extensionName: 'talisman',
    title: 'Talisman',
    installUrl: 'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    logo: 'https://talisman.xyz/icons/icon-192x192.png'
  },
  {
    extensionName: 'polkadot-js',
    title: 'Polkadot{.js}',
    installUrl: 'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
    logo: 'https://polkadot.js.org/extension/extension-logo.svg'
  }
] as const

// Voice recognition constants
export const VOICE_COMMANDS = {
  // Send/Transfer commands
  SEND_PATTERNS: [
    /send (\d+(?:\.\d+)?)\s*(\w+)\s*to\s+(.+)/i,
    /transfer (\d+(?:\.\d+)?)\s*(\w+)\s*to\s+(.+)/i,
    /pay (\d+(?:\.\d+)?)\s*(\w+)\s*to\s+(.+)/i
  ],
  
  // Balance commands  
  BALANCE_PATTERNS: [
    /check my balance/i,
    /what(?:'s| is) my balance/i,
    /show balance/i,
    /balance/i
  ],
  
  // History commands
  HISTORY_PATTERNS: [
    /show (?:my )?(?:transaction )?history/i,
    /(?:payment|transaction) history/i,
    /recent (?:payments|transactions)/i
  ],
  
  // Help commands
  HELP_PATTERNS: [
    /help/i,
    /what can (?:you do|i say)/i,
    /commands/i
  ],
  
  // Cancel commands
  CANCEL_PATTERNS: [
    /cancel/i,
    /stop/i,
    /nevermind/i,
    /abort/i
  ]
} as const

// Address validation patterns
export const ADDRESS_PATTERNS = {
  // Polkadot SS58 address (starts with 1)
  POLKADOT: /^1[0-9A-HJ-NP-Z]{47}$/,
  
  // Generic SS58 address
  SS58: /^[1-9A-HJ-NP-Za-km-z]{47,48}$/,
  
  // Hex address
  HEX: /^0x[a-fA-F0-9]{64}$/
} as const

// Transaction constants
export const TRANSACTION = {
  MIN_AMOUNT: '0.000000000001', // Minimum transferrable amount
  MAX_AMOUNT: '1000000', // Maximum amount for safety
  DEFAULT_TIP: '0',
  GAS_LIMIT: '200000000000', // 200B weight units
  CONFIRMATION_BLOCKS: 1
} as const

// Voice synthesis constants
export const VOICE_SYNTHESIS = {
  DEFAULT_RATE: 1.0,
  DEFAULT_PITCH: 1.0,
  DEFAULT_VOLUME: 0.8,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
} as const

// UI constants
export const UI = {
  NOTIFICATION_DURATION: 5000, // 5 seconds
  LOADING_TIMEOUT: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MAX_HISTORY_ITEMS: 50,
  PAGINATION_SIZE: 10
} as const

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  INVALID_NETWORK: 'INVALID_NETWORK',
  
  // Wallet errors
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  WALLET_PERMISSION_DENIED: 'WALLET_PERMISSION_DENIED',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // Transaction errors
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  TRANSACTION_CANCELLED: 'TRANSACTION_CANCELLED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  
  // Voice errors
  VOICE_NOT_SUPPORTED: 'VOICE_NOT_SUPPORTED',
  VOICE_PERMISSION_DENIED: 'VOICE_PERMISSION_DENIED',
  VOICE_RECOGNITION_FAILED: 'VOICE_RECOGNITION_FAILED',
  VOICE_SYNTHESIS_FAILED: 'VOICE_SYNTHESIS_FAILED',
  
  // Smart contract errors
  CONTRACT_CALL_FAILED: 'CONTRACT_CALL_FAILED',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  VOICE_COMMAND_PROCESSED: 'Voice command processed',
  BALANCE_UPDATED: 'Balance updated'
} as const

// Help text constants
export const HELP_TEXT = {
  VOICE_COMMANDS: `
Available voice commands:
• "Send [amount] [currency] to [recipient]" - Send cryptocurrency
• "Check my balance" - View your current balance  
• "Show my history" - View recent transactions
• "Help" - Show this help message
• "Cancel" - Cancel current operation

Examples:
• "Send 5 DOT to Alice"
• "Transfer 10 WND to 5GrwvaEF5z..."
• "Check my balance"
  `,
  
  WALLET_SETUP: `
To use EchoPay-2, you need a Polkadot wallet extension:
• SubWallet (recommended)
• Talisman
• Polkadot{.js} extension

Install one of these extensions and create an account to get started.
  `,
  
  TROUBLESHOOTING: `
Common issues and solutions:
• Voice not working: Check microphone permissions
• Wallet not connecting: Refresh page and try again  
• Transaction failing: Check balance and network connection
• Can't hear voice responses: Check browser audio settings
  `
} as const

// App configuration
export const APP_CONFIG: AppConfig = {
  networks: NETWORKS,
  features: {
    enableVoiceSynthesis: ENV.ENABLE_VOICE_SYNTHESIS,
    enableTransactionHistory: ENV.ENABLE_TRANSACTION_HISTORY,
    enableCrossChain: ENV.ENABLE_CROSS_CHAIN,
    debugMode: ENV.DEBUG_MODE
  },
  api: {
    elevenLabsApiKey: ENV.ELEVENLABS_API_KEY,
    contractAddress: ENV.CONTRACT_ADDRESS
  },
  ui: {
    theme: 'light',
    defaultNetwork: ENV.DEFAULT_NETWORK,
    enableAnimations: true
  }
} as const

// Currency symbols and formatting
export const CURRENCY_SYMBOLS = {
  DOT: '●',
  WND: '⧫',
  ROC: '◆',
  UNIT: '◉'
} as const

// URLs and links
export const URLS = {
  GITHUB: 'https://github.com/YanniWu88/EchoPay-2',
  DOCS: 'https://docs.echopay.io',
  DISCORD: 'https://discord.gg/echopay',
  TWITTER: 'https://twitter.com/EchoPay_io',
  WEBSITE: 'https://echopay.io',
  SUPPORT: 'https://support.echopay.io'
} as const

// Feature flags for development
export const FEATURES = {
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_REPORTING: false,
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_A_B_TESTING: false
} as const

// Export commonly used combinations
export const DEFAULT_NETWORK_CONFIG = NETWORKS[ENV.DEFAULT_NETWORK]
export const TESTNET_NETWORKS: NetworkType[] = ['westend', 'rococo', 'local']
export const MAINNET_NETWORKS: NetworkType[] = ['polkadot']
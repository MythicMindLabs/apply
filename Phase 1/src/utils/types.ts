import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import type { ApiPromise } from '@polkadot/api'
import type { Signer } from '@polkadot/types/types'

// Network Types
export type NetworkType = 'polkadot' | 'westend' | 'rococo' | 'local'

export interface NetworkConfig {
  name: string
  displayName: string
  wsUrl: string
  currency: string
  decimals: number
  ss58Format: number
  color: string
  blockTime: number
}

// Wallet Types
export interface WalletAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
  type?: string
}

export interface WalletInfo {
  extensionName: string
  title: string
  installUrl: string
  logo: string
}

export interface ConnectedWallet {
  extension: InjectedExtension
  accounts: InjectedAccount[]
  signer: Signer
}

// Voice Recognition Types
export interface VoiceCommand {
  action: VoiceAction
  amount?: number
  currency?: string
  recipient?: string
  rawText: string
  confidence: number
  timestamp: number
}

export type VoiceAction = 
  | 'send'
  | 'transfer' 
  | 'balance'
  | 'history'
  | 'help'
  | 'cancel'
  | 'unknown'

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechSynthesisOptions {
  text: string
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

// Transaction Types
export interface TransactionPreview {
  from: string
  to: string
  amount: string
  currency: string
  estimatedFee: string
  network: NetworkType
}

export interface TransactionResult {
  hash: string
  blockHash?: string
  blockNumber?: number
  success: boolean
  error?: string
  timestamp: number
}

export interface PaymentRecord {
  id: string
  sender: string
  recipient: string
  amount: string
  currency: string
  network: NetworkType
  hash: string
  blockNumber?: number
  timestamp: number
  status: TransactionStatus
}

export type TransactionStatus = 
  | 'pending'
  | 'confirmed' 
  | 'failed'
  | 'cancelled'

// Balance Types
export interface AccountBalance {
  address: string
  network: NetworkType
  free: string
  reserved: string
  frozen: string
  total: string
  currency: string
  decimals: number
}

// Smart Contract Types
export interface ContractConfig {
  address: string
  metadata: any
  network: NetworkType
}

export interface ContractCall {
  method: string
  args: any[]
  value?: string
  gasLimit?: string
}

// API State Types
export interface PolkadotApiState {
  api: ApiPromise | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  network: NetworkType
}

export interface WalletState {
  isConnected: boolean
  isLoading: boolean
  accounts: InjectedAccount[]
  selectedAccount: InjectedAccount | null
  extension: InjectedExtension | null
  signer: Signer | null
  error: string | null
}

export interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  command: VoiceCommand | null
  error: string | null
  isSupported: boolean
}

// UI State Types
export interface AppState {
  theme: 'light' | 'dark'
  network: NetworkType
  isFirstVisit: boolean
  debugMode: boolean
}

export interface NotificationMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  timestamp: number
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: number
  context?: string
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface VoiceRecorderProps extends BaseComponentProps {
  onCommand: (command: VoiceCommand) => void
  onError: (error: AppError) => void
  isDisabled?: boolean
}

export interface WalletConnectorProps extends BaseComponentProps {
  onConnect: (wallet: ConnectedWallet) => void
  onDisconnect: () => void
  supportedWallets: WalletInfo[]
}

export interface TransactionFormProps extends BaseComponentProps {
  onSubmit: (transaction: TransactionPreview) => void
  onCancel: () => void
  initialData?: Partial<TransactionPreview>
  isLoading?: boolean
}

export interface BalanceDisplayProps extends BaseComponentProps {
  balance: AccountBalance
  isLoading?: boolean
  showDetails?: boolean
}

export interface TransactionHistoryProps extends BaseComponentProps {
  transactions: PaymentRecord[]
  isLoading?: boolean
  onRefresh?: () => void
}

export interface NetworkSelectorProps extends BaseComponentProps {
  currentNetwork: NetworkType
  onNetworkChange: (network: NetworkType) => void
  availableNetworks: NetworkConfig[]
}

// Configuration Types
export interface AppConfig {
  networks: Record<NetworkType, NetworkConfig>
  features: {
    enableVoiceSynthesis: boolean
    enableTransactionHistory: boolean
    enableCrossChain: boolean
    debugMode: boolean
  }
  api: {
    elevenLabsApiKey?: string
    contractAddress?: string
  }
  ui: {
    theme: 'light' | 'dark'
    defaultNetwork: NetworkType
    enableAnimations: boolean
  }
}

// Event Types
export interface VoiceRecognitionEvent {
  type: 'start' | 'end' | 'result' | 'error'
  data?: any
}

export interface TransactionEvent {
  type: 'created' | 'signed' | 'broadcast' | 'confirmed' | 'failed'
  transaction: TransactionPreview | TransactionResult
  timestamp: number
}

export interface WalletEvent {
  type: 'connected' | 'disconnected' | 'account_changed' | 'network_changed'
  data?: any
  timestamp: number
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Voice Service Types
export interface ElevenLabsConfig {
  apiKey: string
  voiceId: string
  modelId?: string
}

export interface VoiceSettings {
  stability: number
  similarityBoost: number
  style?: number
  useSpeakerBoost?: boolean
}

// Export all types for easy import
export * from '@polkadot/types/types'
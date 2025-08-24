// EchoPay-2 Type Definitions
// Comprehensive TypeScript types for the entire application

import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';

// ================================
// CORE APPLICATION TYPES
// ================================

export interface AppConfig {
  version: string;
  buildTime: string;
  environment: 'development' | 'production' | 'test';
  debugMode: boolean;
  mockMode: boolean;
}

export interface User {
  id: string;
  address: string;
  name?: string;
  avatar?: string;
  preferences: UserPreferences;
  securitySettings: SecuritySettings;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  voiceSettings: VoiceSettings;
  accessibility: AccessibilitySettings;
  notifications: NotificationSettings;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  voiceVerificationEnabled: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  autoLockEnabled: boolean;
  autoLockTimeout: number;
}

// ================================
// VOICE & SPEECH TYPES
// ================================

export interface VoiceSettings {
  recognitionLanguage: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  enabledCommands: VoiceCommandType[];
  confidenceThreshold: number;
  noiseCancellation: boolean;
}

export type VoiceCommandType = 
  | 'payment'
  | 'query'
  | 'contact'
  | 'settings'
  | 'navigation'
  | 'help';

export interface VoiceCommand {
  id: string;
  type: VoiceCommandType;
  action: string;
  transcript: string;
  confidence: number;
  parameters: Record<string, any>;
  timestamp: Date;
  userId?: string;
  processed: boolean;
  result?: VoiceCommandResult;
}

export interface VoiceCommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface ParsedVoiceCommand {
  type: VoiceCommandType;
  action: string;
  amount?: number;
  currency?: string;
  recipient?: string;
  recipientAddress?: string;
  confidence: number;
  timestamp: number;
  parameters?: Record<string, any>;
  suggestions?: string[];
  requiresConfirmation: boolean;
  securityLevel: SecurityLevel;
}

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  isProcessing: boolean;
  interimResults: boolean;
  continuous: boolean;
}

export interface SpeechSynthesisSettings {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

// ================================
// BLOCKCHAIN & POLKADOT TYPES
// ================================

export interface PolkadotNetwork {
  name: string;
  wsProvider: string;
  chainId?: number;
  explorerUrl?: string;
  faucetUrl?: string;
  testnet?: boolean;
  parachains?: ParachainInfo[];
}

export interface ParachainInfo {
  paraId: number;
  name: string;
  wsProvider: string;
  nativeToken: string;
  supportedTokens: TokenInfo[];
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  assetId?: number;
  contractAddress?: string;
  logoUrl?: string;
  coingeckoId?: string;
}

export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
    genesisHash?: string;
  };
  type?: string;
}

export interface WalletExtension {
  name: string;
  version: string;
  accounts: WalletAccount[];
  signer: any; // Polkadot.js signer interface
}

export interface BlockchainConnection {
  api: ApiPromise | null;
  isConnected: boolean;
  blockNumber: number;
  chainName: string;
  error: string | null;
  reconnectAttempts: number;
  lastConnectedAt?: Date;
}

export interface TransactionStatus {
  status: 'pending' | 'inBlock' | 'finalized' | 'failed' | 'cancelled';
  blockHash?: string;
  blockNumber?: number;
  extrinsicIndex?: number;
  events?: any[];
  error?: string;
}

// ================================
// TRANSACTION TYPES
// ================================

export interface Transaction {
  id: string;
  hash?: string;
  type: TransactionType;
  from: string;
  to?: string;
  amount: string;
  currency: string;
  fee?: string;
  status: TransactionStatus['status'];
  timestamp: Date;
  blockNumber?: number;
  blockHash?: string;
  voiceCommand?: string;
  confidence?: number;
  metadata?: TransactionMetadata;
}

export type TransactionType = 
  | 'payment'
  | 'contractCall'
  | 'contractDeploy'
  | 'transfer'
  | 'xcmTransfer'
  | 'staking'
  | 'governance';

export interface TransactionMetadata {
  voiceActivated: boolean;
  securityLevel: SecurityLevel;
  deviceFingerprint?: string;
  location?: GeolocationCoordinates;
  userAgent?: string;
  biometricVerified?: boolean;
}

export interface PaymentRequest {
  recipient: string;
  amount: string;
  currency: string;
  memo?: string;
  voiceCommand?: string;
  securityLevel: SecurityLevel;
  requiresBiometric?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  hash?: string;
  blockHash?: string;
  error?: string;
  fee?: string;
  timestamp: Date;
}

// ================================
// CONTACT MANAGEMENT TYPES
// ================================

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  verified: boolean;
  tags: string[];
  notes?: string;
  transactionCount: number;
  totalSent: string;
  totalReceived: string;
  lastTransactionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contacts: string[]; // Contact IDs
  color?: string;
  icon?: string;
  createdAt: Date;
}

// ================================
// SECURITY TYPES
// ================================

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: GeolocationCoordinates;
  success: boolean;
  details?: Record<string, any>;
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  canvas?: string;
  webgl?: string;
  createdAt: Date;
}

export interface VoiceBiometric {
  id: string;
  userId: string;
  voiceprint: string; // Encrypted biometric template
  confidence: number;
  sampleDuration: number;
  modelVersion: string;
  createdAt: Date;
  lastUsedAt?: Date;
  verified: boolean;
}

export interface RateLimitInfo {
  requests: number;
  windowStart: Date;
  windowEnd: Date;
  limit: number;
  remaining: number;
  resetTime: Date;
}

export interface EncryptionKeys {
  publicKey: string;
  privateKey?: string; // Should be encrypted when stored
  keyType: 'RSA' | 'ECDSA' | 'Ed25519';
  keySize: number;
  createdAt: Date;
  expiresAt?: Date;
}

// ================================
// ACCESSIBILITY TYPES
// ================================

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  largeTextMode: boolean;
  reducedMotion: boolean;
  voiceFeedbackEnabled: boolean;
  keyboardNavigationEnabled: boolean;
  focusIndicatorEnhanced: boolean;
  colorBlindnessSupport: ColorBlindnessType | 'none';
}

export type ColorBlindnessType = 
  | 'protanopia'
  | 'deuteranopia' 
  | 'tritanopia'
  | 'achromatopsia';

export interface AccessibilityFeature {
  name: string;
  description: string;
  enabled: boolean;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive';
  impact: 'low' | 'medium' | 'high';
}

// ================================
// NOTIFICATION TYPES
// ================================

export interface NotificationSettings {
  enabled: boolean;
  transactionNotifications: boolean;
  securityAlerts: boolean;
  voiceCommandConfirmations: boolean;
  errorNotifications: boolean;
  systemUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'transaction'
  | 'security'
  | 'system'
  | 'voice'
  | 'error'
  | 'warning'
  | 'info';

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  primary?: boolean;
}

// ================================
// API & SERVICE TYPES
// ================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}

export interface ServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

export interface ExternalService {
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

// ================================
// PERFORMANCE & MONITORING TYPES
// ================================

export interface PerformanceMetrics {
  voiceProcessingTime: number;
  transactionTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  errorRate: number;
  timestamp: Date;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details?: Record<string, any>;
}

// ================================
// STATE MANAGEMENT TYPES
// ================================

export interface AppState {
  user: User | null;
  blockchain: BlockchainConnection;
  voice: VoiceRecognitionState;
  transactions: Transaction[];
  contacts: Contact[];
  notifications: Notification[];
  ui: UIState;
  security: SecurityState;
  performance: PerformanceMetrics;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    isOpen: boolean;
    collapsed: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  loading: {
    [key: string]: boolean;
  };
  errors: {
    [key: string]: string | null;
  };
}

export interface SecurityState {
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  biometricLocked: boolean;
  deviceTrusted: boolean;
  rateLimitInfo: RateLimitInfo | null;
  securityLevel: SecurityLevel;
}

// ================================
// EVENT TYPES
// ================================

export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface VoiceEvent extends AppEvent {
  type: 'voice.start' | 'voice.stop' | 'voice.result' | 'voice.error';
  payload: {
    transcript?: string;
    confidence?: number;
    error?: string;
  };
}

export interface TransactionEvent extends AppEvent {
  type: 'transaction.created' | 'transaction.pending' | 'transaction.confirmed' | 'transaction.failed';
  payload: {
    transaction: Transaction;
    details?: any;
  };
}

export interface SecurityEvent extends AppEvent {
  type: 'security.login' | 'security.logout' | 'security.breach' | 'security.verified';
  payload: {
    userId?: string;
    threat?: string;
    action?: string;
  };
}

// ================================
// UTILITY TYPES
// ================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

// ================================
// COMPONENT PROP TYPES
// ================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface VoiceComponentProps extends BaseComponentProps {
  onVoiceCommand?: (command: ParsedVoiceCommand) => void;
  onVoiceError?: (error: string) => void;
  disabled?: boolean;
  autoStart?: boolean;
}

export interface TransactionComponentProps extends BaseComponentProps {
  transaction: Transaction;
  onTransactionClick?: (transaction: Transaction) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export interface ContactComponentProps extends BaseComponentProps {
  contact: Contact;
  onContactSelect?: (contact: Contact) => void;
  onContactEdit?: (contact: Contact) => void;
  selectable?: boolean;
  selected?: boolean;
}

// ================================
// HOOK RETURN TYPES
// ================================

export interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export interface UsePolkadotReturn {
  api: ApiPromise | null;
  isConnected: boolean;
  blockNumber: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

export interface UseWalletReturn {
  accounts: WalletAccount[];
  selectedAccount: string | null;
  selectAccount: (address: string) => void;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string;
  error: string | null;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  sendTransaction: (request: PaymentRequest) => Promise<PaymentResult>;
  getTransaction: (id: string) => Transaction | null;
  refreshTransactions: () => Promise<void>;
}

export interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  searchContacts: (query: string) => Contact[];
}

// ================================
// EXTERNAL SERVICE TYPES
// ================================

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
  baseUrl: string;
}

export interface ElevenLabsResponse {
  audio: Blob;
  duration: number;
  characters: number;
}

export interface VoiceRecognitionService {
  start: () => Promise<void>;
  stop: () => void;
  isListening: boolean;
  onResult: (callback: (result: SpeechRecognitionResult) => void) => void;
  onError: (callback: (error: SpeechRecognitionError) => void) => void;
}

// ================================
// TEST TYPES
// ================================

export interface TestUtils {
  mockUser: User;
  mockTransaction: Transaction;
  mockContact: Contact;
  mockVoiceCommand: VoiceCommand;
}

export interface MockApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Re-export common types from external libraries
export type { ApiPromise } from '@polkadot/api';
export type { KeyringPair } from '@polkadot/keyring/types';
export type { SubmittableExtrinsic } from '@polkadot/api/types';

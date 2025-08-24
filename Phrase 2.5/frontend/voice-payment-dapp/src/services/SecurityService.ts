// Enhanced Security Service for EchoPay-2
import { ApiPromise } from '@polkadot/api';

export interface SecurityConfig {
  requireBiometric: boolean;
  rateLimitPerHour: number;
  maxAmountWithoutMFA: bigint;
  replayPreventionWindow: number; // 30 seconds
  encryptionRequired: boolean;
  voiceVerificationRequired: boolean;
}

export interface VoiceBiometricData {
  voiceprint: string;
  confidence: number;
  timestamp: number;
  hash: string;
}

export interface DeviceFingerprint {
  deviceId: string;
  browserFingerprint: string;
  screenResolution: string;
  timezone: string;
  language: string;
  hash: string;
}

export interface SecurityMetrics {
  rateLimit: number;
  rateLimitMax: number;
  recentAttempts: number;
  biometricRequired: boolean;
  voiceVerificationStatus: 'none' | 'pending' | 'verified' | 'failed';
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  riskScore: number; // 0-100
}

export interface TransactionValidation {
  isValid: boolean;
  error?: string;
  requiredSecurityLevel: 'basic' | 'biometric' | 'multifactor' | 'hardware';
  riskFactors: string[];
}

class SecurityService {
  private static instance: SecurityService;
  private securityConfig: SecurityConfig;
  private rateLimitCache: Map<string, { count: number; windowStart: number }>;
  private usedHashes: Map<string, number>;
  private voicePrints: Map<string, VoiceBiometricData[]>;
  private deviceFingerprints: Map<string, DeviceFingerprint>;

  private constructor() {
    this.securityConfig = {
      requireBiometric: false,
      rateLimitPerHour: 100,
      maxAmountWithoutMFA: BigInt('1000000000000'), // 1000 DOT in Planck
      replayPreventionWindow: 30000, // 30 seconds
      encryptionRequired: true,
      voiceVerificationRequired: false,
    };

    this.rateLimitCache = new Map();
    this.usedHashes = new Map();
    this.voicePrints = new Map();
    this.deviceFingerprints = new Map();

    // Initialize security features
    this.initializeSecurity();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private async initializeSecurity(): Promise<void> {
    // Load saved security data from secure storage
    try {
      const savedConfig = localStorage.getItem('echopay-security-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.securityConfig = { ...this.securityConfig, ...config };
      }

      // Initialize device fingerprinting
      await this.generateDeviceFingerprint();

      // Clean up old entries
      this.cleanupOldEntries();

    } catch (error) {
      console.error('Failed to initialize security:', error);
    }
  }

  // Device Fingerprinting for enhanced security
  public async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
    }

    const fingerprint: DeviceFingerprint = {
      deviceId: await this.generateDeviceId(),
      browserFingerprint: this.getBrowserFingerprint(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hash: '',
    };

    // Create hash of all fingerprint data
    fingerprint.hash = await this.createHash(JSON.stringify(fingerprint));
    
    return fingerprint;
  }

  private async generateDeviceId(): Promise<string> {
    // Use multiple sources to create a unique device ID
    const sources = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '0',
      navigator.deviceMemory?.toString() || '0',
    ];

    const combined = sources.join('|');
    return await this.createHash(combined);
  }

  private getBrowserFingerprint(): string {
    const features = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      navigator.cookieEnabled,
      typeof window.localStorage,
      typeof window.sessionStorage,
      typeof window.indexedDB,
      screen.colorDepth,
      screen.pixelDepth,
    ];

    return btoa(features.join('|'));
  }

  // Voice Biometric Verification
  public async verifyVoiceBiometric(
    audioData: Blob,
    userId: string,
    expectedPhrase: string
  ): Promise<{ verified: boolean; confidence: number; voiceprint?: string }> {
    try {
      // Convert audio to voice fingerprint
      const voiceprint = await this.extractVoiceprint(audioData);
      
      // Check against stored voiceprints
      const storedPrints = this.voicePrints.get(userId) || [];
      
      if (storedPrints.length === 0) {
        // First time - store the voiceprint
        const biometricData: VoiceBiometricData = {
          voiceprint,
          confidence: 1.0,
          timestamp: Date.now(),
          hash: await this.createHash(voiceprint),
        };
        
        storedPrints.push(biometricData);
        this.voicePrints.set(userId, storedPrints);
        
        return { verified: true, confidence: 1.0, voiceprint };
      }

      // Compare against stored voiceprints
      let bestMatch = 0;
      for (const stored of storedPrints) {
        const similarity = this.compareVoiceprints(voiceprint, stored.voiceprint);
        bestMatch = Math.max(bestMatch, similarity);
      }

      const verified = bestMatch > 0.85; // 85% similarity threshold
      
      if (verified && bestMatch > 0.9) {
        // High confidence match - update stored data
        const biometricData: VoiceBiometricData = {
          voiceprint,
          confidence: bestMatch,
          timestamp: Date.now(),
          hash: await this.createHash(voiceprint),
        };
        
        storedPrints.push(biometricData);
        // Keep only the 5 most recent voiceprints
        if (storedPrints.length > 5) {
          storedPrints.shift();
        }
        this.voicePrints.set(userId, storedPrints);
      }

      return { verified, confidence: bestMatch };

    } catch (error) {
      console.error('Voice biometric verification failed:', error);
      return { verified: false, confidence: 0 };
    }
  }

  private async extractVoiceprint(audioData: Blob): Promise<string> {
    // This is a simplified voiceprint extraction
    // In production, you would use a more sophisticated algorithm
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Extract basic features (simplified)
        const features = this.extractAudioFeatures(uint8Array);
        resolve(btoa(String.fromCharCode(...features)));
      };
      reader.readAsArrayBuffer(audioData);
    });
  }

  private extractAudioFeatures(audioData: Uint8Array): Uint8Array {
    // Simplified feature extraction
    // In production, you would extract MFCC, pitch, formants, etc.
    const features = new Uint8Array(128);
    
    for (let i = 0; i < 128; i++) {
      const start = Math.floor((i / 128) * audioData.length);
      const end = Math.floor(((i + 1) / 128) * audioData.length);
      
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += audioData[j];
      }
      
      features[i] = Math.floor(sum / (end - start));
    }
    
    return features;
  }

  private compareVoiceprints(print1: string, print2: string): number {
    // Simplified voice comparison
    // In production, you would use DTW, cosine similarity, etc.
    if (print1.length !== print2.length) return 0;
    
    let matches = 0;
    for (let i = 0; i < print1.length; i++) {
      if (print1[i] === print2[i]) matches++;
    }
    
    return matches / print1.length;
  }

  // Enhanced Rate Limiting with IP and device tracking
  public checkRateLimit(
    userId: string, 
    deviceFingerprint: string,
    ipHash?: string
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowSize = 3600000; // 1 hour
    
    // Check user rate limit
    const userKey = `user:${userId}`;
    const userLimit = this.getRateLimit(userKey, now, windowSize);
    
    // Check device rate limit (stricter)
    const deviceKey = `device:${deviceFingerprint}`;
    const deviceLimit = this.getRateLimit(deviceKey, now, windowSize);
    
    // Check IP rate limit if available (even stricter)
    let ipLimit = null;
    if (ipHash) {
      const ipKey = `ip:${ipHash}`;
      ipLimit = this.getRateLimit(ipKey, now, windowSize);
    }

    // Apply the most restrictive limit
    const userAllowed = userLimit.count < this.securityConfig.rateLimitPerHour;
    const deviceAllowed = deviceLimit.count < (this.securityConfig.rateLimitPerHour * 2);
    const ipAllowed = !ipLimit || ipLimit.count < (this.securityConfig.rateLimitPerHour * 10);

    const allowed = userAllowed && deviceAllowed && ipAllowed;
    const remaining = Math.max(0, this.securityConfig.rateLimitPerHour - userLimit.count);
    const resetTime = userLimit.windowStart + windowSize;

    if (allowed) {
      // Increment counters
      this.incrementRateLimit(userKey, now, windowSize);
      this.incrementRateLimit(deviceKey, now, windowSize);
      if (ipHash) {
        this.incrementRateLimit(`ip:${ipHash}`, now, windowSize);
      }
    }

    return { allowed, remaining, resetTime };
  }

  private getRateLimit(key: string, now: number, windowSize: number) {
    let limit = this.rateLimitCache.get(key);
    
    if (!limit || (now - limit.windowStart) >= windowSize) {
      limit = { count: 0, windowStart: now };
      this.rateLimitCache.set(key, limit);
    }
    
    return limit;
  }

  private incrementRateLimit(key: string, now: number, windowSize: number) {
    const limit = this.getRateLimit(key, now, windowSize);
    limit.count++;
    this.rateLimitCache.set(key, limit);
  }

  // Enhanced Replay Attack Prevention
  public checkReplayAttack(commandHash: string): boolean {
    const now = Date.now();
    const existingTime = this.usedHashes.get(commandHash);
    
    if (existingTime) {
      const timeDiff = now - existingTime;
      if (timeDiff < this.securityConfig.replayPreventionWindow) {
        return true; // Replay attack detected
      }
    }
    
    // Store the hash
    this.usedHashes.set(commandHash, now);
    return false;
  }

  // Transaction Validation with Risk Assessment
  public async validateTransaction(
    transaction: any,
    context: {
      api: ApiPromise;
      account: string;
      balance: string;
      deviceFingerprint?: DeviceFingerprint;
      voiceBiometric?: VoiceBiometricData;
    }
  ): Promise<TransactionValidation> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    try {
      // Basic validation
      if (!transaction.amount || transaction.amount <= 0) {
        return {
          isValid: false,
          error: 'Invalid transaction amount',
          requiredSecurityLevel: 'basic',
          riskFactors: ['Invalid amount'],
        };
      }

      if (!transaction.recipientAddress) {
        return {
          isValid: false,
          error: 'Invalid recipient address',
          requiredSecurityLevel: 'basic',
          riskFactors: ['Invalid recipient'],
        };
      }

      // Balance check
      const currentBalance = BigInt(context.balance);
      const transactionAmount = BigInt(transaction.amount);
      
      if (transactionAmount > currentBalance) {
        return {
          isValid: false,
          error: `Insufficient balance. Available: ${currentBalance}, Required: ${transactionAmount}`,
          requiredSecurityLevel: 'basic',
          riskFactors: ['Insufficient balance'],
        };
      }

      // Amount-based risk assessment
      if (transactionAmount > this.securityConfig.maxAmountWithoutMFA) {
        riskFactors.push('Large transaction amount');
        riskScore += 30;
      }

      // Device fingerprint check
      if (context.deviceFingerprint) {
        const knownDevice = this.deviceFingerprints.has(context.account);
        if (!knownDevice) {
          riskFactors.push('Unknown device');
          riskScore += 25;
        }
      }

      // Voice biometric check
      if (this.securityConfig.voiceVerificationRequired) {
        if (!context.voiceBiometric) {
          riskFactors.push('No voice verification');
          riskScore += 20;
        } else if (context.voiceBiometric.confidence < 0.8) {
          riskFactors.push('Low voice confidence');
          riskScore += 15;
        }
      }

      // Determine required security level
      let requiredSecurityLevel: 'basic' | 'biometric' | 'multifactor' | 'hardware' = 'basic';
      
      if (riskScore >= 50 || transactionAmount > this.securityConfig.maxAmountWithoutMFA) {
        requiredSecurityLevel = 'multifactor';
      } else if (riskScore >= 30 || this.securityConfig.requireBiometric) {
        requiredSecurityLevel = 'biometric';
      }

      // Check network status and fees
      try {
        const feeInfo = await context.api.tx.balances
          .transferKeepAlive(transaction.recipientAddress, transactionAmount.toString())
          .paymentInfo(context.account);
          
        const totalCost = transactionAmount + BigInt(feeInfo.partialFee.toString());
        
        if (totalCost > currentBalance) {
          return {
            isValid: false,
            error: `Insufficient balance for transaction and fees. Required: ${totalCost}, Available: ${currentBalance}`,
            requiredSecurityLevel,
            riskFactors: ['Insufficient balance for fees'],
          };
        }
      } catch (feeError) {
        riskFactors.push('Cannot estimate fees');
        riskScore += 10;
      }

      return {
        isValid: true,
        requiredSecurityLevel,
        riskFactors,
      };

    } catch (error) {
      console.error('Transaction validation error:', error);
      return {
        isValid: false,
        error: `Validation failed: ${error.message}`,
        requiredSecurityLevel: 'basic',
        riskFactors: ['Validation error'],
      };
    }
  }

  // Encryption utilities
  public async encryptSensitiveData(data: any): Promise<string> {
    if (!this.securityConfig.encryptionRequired) {
      return JSON.stringify(data);
    }

    try {
      const key = await this.getOrCreateEncryptionKey();
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encoded
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data); // Fallback to unencrypted
    }
  }

  public async decryptSensitiveData(encryptedData: string): Promise<any> {
    if (!this.securityConfig.encryptionRequired) {
      try {
        return JSON.parse(encryptedData);
      } catch {
        return encryptedData;
      }
    }

    try {
      const key = await this.getOrCreateEncryptionKey();
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encrypted
      );

      const decoded = new TextDecoder().decode(decrypted);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Decryption failed:', error);
      try {
        return JSON.parse(encryptedData); // Fallback
      } catch {
        return encryptedData;
      }
    }
  }

  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    const keyId = 'echopay-encryption-key';
    
    // Try to get existing key from IndexedDB (not implemented here for brevity)
    // For now, generate a new key each session
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );
  }

  // Security metrics calculation
  public calculateSecurityMetrics(
    userId: string,
    deviceFingerprint?: DeviceFingerprint,
    recentActivity?: any[]
  ): SecurityMetrics {
    const userRateLimit = this.rateLimitCache.get(`user:${userId}`) || { count: 0, windowStart: 0 };
    
    let securityLevel: 'basic' | 'enhanced' | 'maximum' = 'basic';
    let riskScore = 0;

    // Calculate risk based on various factors
    if (this.securityConfig.requireBiometric) {
      securityLevel = 'enhanced';
    }

    if (this.securityConfig.voiceVerificationRequired) {
      securityLevel = 'maximum';
    }

    // Device-based risk
    if (!deviceFingerprint || !this.deviceFingerprints.has(userId)) {
      riskScore += 20;
    }

    // Rate limiting status
    const rateLimitRatio = userRateLimit.count / this.securityConfig.rateLimitPerHour;
    if (rateLimitRatio > 0.8) {
      riskScore += 30;
    }

    return {
      rateLimit: userRateLimit.count,
      rateLimitMax: this.securityConfig.rateLimitPerHour,
      recentAttempts: recentActivity?.length || 0,
      biometricRequired: this.securityConfig.requireBiometric,
      voiceVerificationStatus: 'none', // This would be updated by the calling code
      securityLevel,
      riskScore,
    };
  }

  // Utility methods
  private async createHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up rate limit cache
    for (const [key, value] of this.rateLimitCache.entries()) {
      if (now - value.windowStart > maxAge) {
        this.rateLimitCache.delete(key);
      }
    }

    // Clean up replay attack hashes
    for (const [hash, timestamp] of this.usedHashes.entries()) {
      if (now - timestamp > this.securityConfig.replayPreventionWindow * 10) { // Keep for 10x window
        this.usedHashes.delete(hash);
      }
    }
  }

  // Configuration methods
  public updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.securityConfig = { ...this.securityConfig, ...newConfig };
    
    // Save to secure storage
    try {
      localStorage.setItem('echopay-security-config', JSON.stringify(this.securityConfig));
    } catch (error) {
      console.error('Failed to save security config:', error);
    }
  }

  public getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }

  // Emergency security functions
  public emergencyLockdown(): void {
    this.rateLimitCache.clear();
    this.securityConfig.rateLimitPerHour = 0;
    console.warn('EchoPay-2 Security: Emergency lockdown activated');
  }

  public resetSecurityState(): void {
    this.rateLimitCache.clear();
    this.usedHashes.clear();
    this.securityConfig.rateLimitPerHour = 100;
    console.info('EchoPay-2 Security: Security state reset');
  }
}

export default SecurityService.getInstance();

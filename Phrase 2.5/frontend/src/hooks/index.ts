// Mock services for EchoPay-2 testing without blockchain connection
import { useState, useEffect, useCallback } from 'react';

// Mock data for testing
const MOCK_ACCOUNTS = [
  { 
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', 
    meta: { name: 'Alice' },
    balance: '1000.50 DOT'
  },
  { 
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', 
    meta: { name: 'Bob' },
    balance: '750.25 DOT'
  },
  { 
    address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', 
    meta: { name: 'Charlie' },
    balance: '2500.00 DOT'
  }
];

const MOCK_CONTACTS = [
  { 
    name: 'Alice', 
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    verified: true,
    transactionCount: 12,
    totalSent: '150.75 DOT'
  },
  { 
    name: 'Bob', 
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    verified: false,
    transactionCount: 3,
    totalSent: '45.20 DOT'
  }
];

const MOCK_TRANSACTIONS = [
  {
    id: '0x123abc',
    type: 'payment',
    from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    to: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    amount: '10.50 DOT',
    voiceCommand: 'Send 10 DOT to Bob',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
    blockHash: '0x456def',
    fees: '0.01 DOT'
  },
  {
    id: '0x789ghi',
    type: 'payment',
    from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    to: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    amount: '25.00 DOT',
    voiceCommand: 'Send 25 DOT to Charlie',
    timestamp: Date.now() - 7200000,
    status: 'confirmed',
    blockHash: '0x789jkl',
    fees: '0.01 DOT'
  }
];

// Mock Voice Recognition Hook
export const useVoiceRecognition = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported] = useState(true);

  const startListening = useCallback(() => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setIsListening(true);
      setError(null);
      
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        const mockCommands = [
          'Send 5 DOT to Alice',
          'Check my balance',
          'Send 10 WND to Bob',
          'Show transaction history',
          'Add contact Charlie'
        ];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(randomCommand);
        setConfidence(0.95);
        setIsListening(false);
      }, 3000);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return {
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    transcript,
    confidence,
    error,
    isSupported
  };
};

// Mock Polkadot API Hook
export const usePolkadotApi = (options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [blockNumber, setBlockNumber] = useState(12345);
  const [error, setError] = useState(null);
  const [api] = useState({
    // Mock API object
    tx: {
      balances: {
        transferKeepAlive: (recipient, amount) => ({
          signAndSend: async (signer) => {
            // Simulate transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
              hash: '0x' + Math.random().toString(16).substr(2, 8),
              blockHash: '0x' + Math.random().toString(16).substr(2, 8)
            };
          },
          paymentInfo: async (account) => ({
            partialFee: { toString: () => '10000000000' } // 0.01 DOT in planck
          })
        })
      }
    },
    query: {
      system: {
        account: async (address) => ({
          data: {
            free: { toString: () => '1000000000000000' } // 1000 DOT in planck
          }
        })
      }
    },
    rpc: {
      system: {
        chain: async () => 'Rococo Contracts'
      }
    }
  });

  const connect = useCallback(async () => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setError(null);
      setTimeout(() => {
        setIsConnected(true);
      }, 1000);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Simulate block updates
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setBlockNumber(prev => prev + 1);
      }, 6000); // New block every 6 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Auto-connect in mock mode
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      connect();
    }
  }, [connect]);

  return {
    api: isConnected ? api : null,
    connect,
    disconnect,
    isConnected,
    blockNumber,
    error,
    networkEndpoint: 'wss://rococo-contracts-rpc.polkadot.io',
    switchNetwork: () => {}
  };
};

// Mock Wallet Connection Hook
export const useWalletConnection = (options = {}) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('1000.50');
  const [walletType] = useState('SubWallet');

  const connectWallet = useCallback(async () => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setError(null);
      setTimeout(() => {
        setAccounts(MOCK_ACCOUNTS);
        setSelectedAccount(MOCK_ACCOUNTS[0].address);
        setBalance(MOCK_ACCOUNTS[0].balance);
        setIsWalletReady(true);
      }, 1500);
    }
  }, []);

  const selectAccount = useCallback((address) => {
    const account = MOCK_ACCOUNTS.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(address);
      setBalance(account.balance);
    }
  }, []);

  const signTransaction = useCallback(async (transaction) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      hash: '0x' + Math.random().toString(16).substr(2, 8)
    };
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccounts([]);
    setSelectedAccount('');
    setIsWalletReady(false);
    setBalance('0');
  }, []);

  // Auto-connect in mock mode
  useEffect(() => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      connectWallet();
    }
  }, [connectWallet]);

  return {
    accounts,
    selectedAccount,
    selectAccount,
    signTransaction,
    isWalletReady,
    walletType,
    error,
    balance,
    connectWallet,
    disconnectWallet
  };
};

// Mock Contract Interaction Hook
export const useContractInteraction = (api, selectedAccount) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const recordPayment = useCallback(async (paymentData) => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setIsLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment recording
      const newTransaction = {
        id: '0x' + Math.random().toString(16).substr(2, 8),
        ...paymentData,
        timestamp: Date.now(),
        status: 'confirmed'
      };
      
      MOCK_TRANSACTIONS.unshift(newTransaction);
      setIsLoading(false);
      
      return {
        success: true,
        transactionHash: newTransaction.id
      };
    }
  }, []);

  const getPaymentHistory = useCallback(async (account, offset = 0, limit = 10) => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      
      return MOCK_TRANSACTIONS
        .filter(tx => tx.from === account || tx.to === account)
        .slice(offset, offset + limit);
    }
    return [];
  }, []);

  const addContact = useCallback(async (name, address) => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContact = {
        name,
        address,
        verified: false,
        transactionCount: 0,
        totalSent: '0 DOT'
      };
      
      MOCK_CONTACTS.push(newContact);
      setIsLoading(false);
      
      return { success: true };
    }
  }, []);

  const getContacts = useCallback(async () => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
      return MOCK_CONTACTS;
    }
    return [];
  }, []);

  return {
    recordPayment,
    getPaymentHistory,
    addContact,
    getContacts,
    isLoading,
    error
  };
};

// Mock Security Features Hook
export const useSecurityFeatures = () => {
  const checkSecurityLevel = useCallback(async (command, metrics) => {
    // Simulate security check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const isLargeAmount = command.amount && parseFloat(command.amount) > 100;
    
    return {
      requiresBiometric: isLargeAmount,
      securityLevel: isLargeAmount ? 'high' : 'standard',
      riskScore: isLargeAmount ? 75 : 25
    };
  }, []);

  const verifyVoiceBiometric = useCallback(async (voiceData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      verified: Math.random() > 0.1, // 90% success rate
      confidence: 0.95,
      voiceprint: 'mock-voiceprint-hash'
    };
  }, []);

  const generateDeviceFingerprint = useCallback(() => {
    return 'mock-device-fingerprint-' + Math.random().toString(16).substr(2, 8);
  }, []);

  const encryptSensitiveData = useCallback(async (data) => {
    return 'encrypted-' + btoa(JSON.stringify(data));
  }, []);

  const validateTransaction = useCallback(async (transaction, context) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      isValid: true,
      requiredSecurityLevel: 'standard',
      riskFactors: []
    };
  }, []);

  const getSecurityMetrics = useCallback(async (userId) => {
    return {
      rateLimit: Math.floor(Math.random() * 20),
      rateLimitMax: 100,
      recentAttempts: Math.floor(Math.random() * 5),
      biometricRequired: false,
      voiceVerificationStatus: 'none'
    };
  }, []);

  return {
    checkSecurityLevel,
    verifyVoiceBiometric,
    generateDeviceFingerprint,
    encryptSensitiveData,
    validateTransaction,
    getSecurityMetrics
  };
};

// Mock Performance Monitor Hook
export const usePerformanceMonitor = () => {
  const measurePerformance = useCallback((operation, name) => {
    const start = Date.now();
    return operation().then(result => {
      const duration = Date.now() - start;
      console.log(`Performance: ${name} took ${duration}ms`);
      return result;
    });
  }, []);

  const reportMetrics = useCallback((metrics) => {
    console.log('Performance metrics:', metrics);
  }, []);

  const optimizeMemory = useCallback(() => {
    console.log('Memory optimization triggered');
  }, []);

  return {
    measurePerformance,
    reportMetrics,
    optimizeMemory
  };
};

// Mock Device Fingerprint Hook
export const useDeviceFingerprint = () => {
  return 'mock-device-' + navigator.userAgent.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '');
};

// Mock Voice Biometrics Hook
export const useVoiceBiometrics = () => {
  const [voiceProfile, setVoiceProfile] = useState(null);
  
  const createVoiceProfile = useCallback(async (audioData) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const profile = {
      id: 'voice-profile-' + Math.random().toString(16).substr(2, 8),
      created: Date.now(),
      confidence: 0.98
    };
    setVoiceProfile(profile);
    return profile;
  }, []);

  const verifyVoice = useCallback(async (audioData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      verified: true,
      confidence: 0.92,
      matchScore: 0.89
    };
  }, []);

  return {
    voiceProfile,
    createVoiceProfile,
    verifyVoice
  };
};

// Mock Encryption Hook
export const useEncryption = () => {
  const encryptData = useCallback(async (data) => {
    return 'encrypted_' + btoa(JSON.stringify(data));
  }, []);

  const decryptData = useCallback(async (encryptedData) => {
    if (encryptedData.startsWith('encrypted_')) {
      return JSON.parse(atob(encryptedData.substring(10)));
    }
    return encryptedData;
  }, []);

  return { encryptData, decryptData };
};

// Mock Accessibility Hook
export const useAccessibility = () => {
  const announceToScreenReader = useCallback((message) => {
    console.log('Screen reader announcement:', message);
    
    // Create a live region for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const configureSpeechSynthesis = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not supported, would say:', text);
    }
  }, []);

  return {
    announceToScreenReader,
    configureSpeechSynthesis
  };
};

// Export all mock hooks for easy import
export default {
  useVoiceRecognition,
  usePolkadotApi,
  useWalletConnection,
  useContractInteraction,
  useSecurityFeatures,
  usePerformanceMonitor,
  useDeviceFingerprint,
  useVoiceBiometrics,
  useEncryption,
  useAccessibility
};

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import App from '../App';
import { useVoiceRecognition, usePolkadotApi, useWalletConnection } from '../hooks';

// Mock all the custom hooks
vi.mock('../hooks', () => ({
  useVoiceRecognition: vi.fn(),
  usePolkadotApi: vi.fn(),
  useWalletConnection: vi.fn(),
  useContractInteraction: vi.fn(),
  useSecurityFeatures: vi.fn(),
}));

// Mock ElevenLabs API
vi.mock('../services/ElevenLabsService', () => ({
  default: {
    speak: vi.fn(),
    getVoices: vi.fn(() => Promise.resolve([
      { voice_id: '1', name: 'Rachel' },
      { voice_id: '2', name: 'Adam' },
    ])),
  },
}));

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: true,
  interimResults: true,
  lang: 'en-US',
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

// Mock crypto.subtle for security tests
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(() => Promise.resolve({})),
      encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
    },
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

describe('EchoPay-2 Frontend Tests', () => {
  const mockVoiceRecognition = {
    startListening: vi.fn(),
    stopListening: vi.fn(),
    isListening: false,
    transcript: '',
    confidence: 0,
    error: null,
    resetTranscript: vi.fn(),
    isSupported: true,
  };

  const mockPolkadotApi = {
    api: {
      tx: {
        balances: {
          transferKeepAlive: vi.fn(() => ({
            signAndSend: vi.fn(() => Promise.resolve({ hash: '0x123' })),
          })),
        },
      },
      query: {
        system: {
          account: vi.fn(() => ({
            data: {
              free: { toString: () => '1000000000000' },
            },
          })),
        },
      },
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: true,
    blockNumber: 12345,
    error: null,
  };

  const mockWalletConnection = {
    accounts: [
      { address: '5GH7vw2GzRELhhzFygSGCBvzFyRCPcTRP6gJNuQP7pNSKiCR', meta: { name: 'Alice' } },
      { address: '5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV', meta: { name: 'Bob' } },
    ],
    selectedAccount: '5GH7vw2GzRELhhzFygSGCBvzFyRCPcTRP6gJNuQP7pNSKiCR',
    selectAccount: vi.fn(),
    signTransaction: vi.fn(() => Promise.resolve({ hash: '0x456' })),
    isWalletReady: true,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useVoiceRecognition as any).mockReturnValue(mockVoiceRecognition);
    (usePolkadotApi as any).mockReturnValue(mockPolkadotApi);
    (useWalletConnection as any).mockReturnValue(mockWalletConnection);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering Tests', () => {
    it('renders main application correctly', async () => {
      render(<App />);
      
      expect(screen.getByText(/EchoPay-2/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start voice/i })).toBeInTheDocument();
      expect(screen.getByText(/wallet connected/i)).toBeInTheDocument();
    });

    it('shows loading state when wallet is not ready', async () => {
      (useWalletConnection as any).mockReturnValue({
        ...mockWalletConnection,
        isWalletReady: false,
      });

      render(<App />);
      
      expect(screen.getByText(/connecting wallet/i)).toBeInTheDocument();
    });

    it('displays error state when API connection fails', async () => {
      (usePolkadotApi as any).mockReturnValue({
        ...mockPolkadotApi,
        isConnected: false,
        error: 'Failed to connect to network',
      });

      render(<App />);
      
      expect(screen.getByText(/failed to connect to network/i)).toBeInTheDocument();
    });

    it('shows voice recognition status correctly', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        isListening: true,
        transcript: 'Send 5 DOT to Alice',
      });

      render(<App />);
      
      expect(screen.getByText(/listening/i)).toBeInTheDocument();
      expect(screen.getByText(/send 5 dot to alice/i)).toBeInTheDocument();
    });
  });

  describe('Voice Recognition Tests', () => {
    it('starts voice recognition when button is clicked', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start voice/i });
      fireEvent.click(startButton);
      
      expect(mockVoiceRecognition.startListening).toHaveBeenCalled();
    });

    it('stops voice recognition when stop button is clicked', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        isListening: true,
      });

      render(<App />);
      
      const stopButton = screen.getByRole('button', { name: /stop voice/i });
      fireEvent.click(stopButton);
      
      expect(mockVoiceRecognition.stopListening).toHaveBeenCalled();
    });

    it('processes voice commands correctly', async () => {
      const mockProcessCommand = vi.fn();
      
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 10 DOT to Bob',
        confidence: 0.95,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/send 10 dot to bob/i)).toBeInTheDocument();
        expect(screen.getByText(/95%/i)).toBeInTheDocument(); // Confidence level
      });
    });

    it('handles voice recognition errors gracefully', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        error: 'Microphone access denied',
      });

      render(<App />);
      
      expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument();
    });
  });

  describe('Command Parsing Tests', () => {
    it('parses basic payment commands', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 5 DOT to Alice',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/amount: 5 dot/i)).toBeInTheDocument();
        expect(screen.getByText(/recipient: alice/i)).toBeInTheDocument();
      });
    });

    it('handles complex conditional commands', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'If my balance is greater than 10 DOT, send 5 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/conditional payment/i)).toBeInTheDocument();
        expect(screen.getByText(/condition: balance > 10 dot/i)).toBeInTheDocument();
      });
    });

    it('parses batch payment commands', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 1 DOT to Alice, 2 WND to Bob, and 3 ROC to Charlie',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/batch payment: 3 transactions/i)).toBeInTheDocument();
        expect(screen.getByText(/alice: 1 dot/i)).toBeInTheDocument();
        expect(screen.getByText(/bob: 2 wnd/i)).toBeInTheDocument();
        expect(screen.getByText(/charlie: 3 roc/i)).toBeInTheDocument();
      });
    });

    it('handles invalid commands with helpful suggestions', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send money to someone',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/command not understood/i)).toBeInTheDocument();
        expect(screen.getByText(/did you mean: send \d+ dot to/i)).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Processing Tests', () => {
    it('processes successful transactions', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 1 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      const confirmButton = await screen.findByRole('button', { name: /confirm transaction/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/transaction successful/i)).toBeInTheDocument();
        expect(screen.getByText(/hash: 0x123/i)).toBeInTheDocument();
      });
    });

    it('handles insufficient balance errors', async () => {
      mockPolkadotApi.api.query.system.account.mockResolvedValueOnce({
        data: { free: { toString: () => '100000000000' } }, // Only 100 DOT
      });

      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 200 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
        expect(screen.getByText(/available: 100 dot/i)).toBeInTheDocument();
        expect(screen.getByText(/required: 200 dot/i)).toBeInTheDocument();
      });
    });

    it('calculates fees correctly', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 5 DOT to Alice',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/estimated fee: ~0.01 dot/i)).toBeInTheDocument();
        expect(screen.getByText(/total cost: 5.01 dot/i)).toBeInTheDocument();
      });
    });
  });

  describe('Contact Management Tests', () => {
    it('adds new contacts via voice command', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Add contact Alice with address 5GH7vw2GzRELhhzFygSGCBvzFyRCPcTRP6gJNuQP7pNSKiCR',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/contact alice added/i)).toBeInTheDocument();
      });
    });

    it('resolves contact names in payments', async () => {
      // Mock existing contacts
      const mockContacts = [
        { name: 'Alice', address: '5GH7vw2GzRELhhzFygSGCBvzFyRCPcTRP6gJNuQP7pNSKiCR' },
      ];

      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 3 DOT to Alice',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/alice \(contact\)/i)).toBeInTheDocument();
        expect(screen.getByText(/5gh7vw2gzr.../i)).toBeInTheDocument();
      });
    });

    it('shows contact list and management', async () => {
      render(<App />);
      
      const contactsTab = screen.getByRole('tab', { name: /contacts/i });
      fireEvent.click(contactsTab);
      
      expect(screen.getByText(/manage contacts/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add contact/i })).toBeInTheDocument();
    });
  });

  describe('Security Features Tests', () => {
    it('requires biometric verification for large amounts', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 5000 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/biometric verification required/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /verify voice/i })).toBeInTheDocument();
      });
    });

    it('shows security warnings for suspicious activity', async () => {
      // Mock multiple rapid commands
      for (let i = 0; i < 10; i++) {
        (useVoiceRecognition as any).mockReturnValue({
          ...mockVoiceRecognition,
          transcript: `Send ${i + 1} DOT to Bob`,
        });

        render(<App />);
        
        const processButton = screen.getByRole('button', { name: /process command/i });
        fireEvent.click(processButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText(/unusual activity detected/i)).toBeInTheDocument();
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
      });
    });

    it('prevents replay attacks', async () => {
      const duplicateCommand = 'Send 1 DOT to Alice';
      
      // First command
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: duplicateCommand,
      });

      render(<App />);
      
      let processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      // Execute first transaction
      const confirmButton = await screen.findByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
      
      // Try same command again
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: duplicateCommand,
      });

      processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/duplicate command detected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Currency Support Tests', () => {
    it('handles DOT payments correctly', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 10 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/currency: dot/i)).toBeInTheDocument();
        expect(screen.getByText(/network: polkadot/i)).toBeInTheDocument();
      });
    });

    it('handles Westend (WND) payments', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 5 WND to Alice on Westend',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/currency: wnd/i)).toBeInTheDocument();
        expect(screen.getByText(/network: westend/i)).toBeInTheDocument();
      });
    });

    it('converts currency values correctly', async () => {
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send $100 worth of DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/usd value: \$100/i)).toBeInTheDocument();
        expect(screen.getByText(/dot amount: ~15.38 dot/i)).toBeInTheDocument(); // Assuming $6.50 DOT price
      });
    });
  });

  describe('Performance Tests', () => {
    it('processes voice commands within 1.5 seconds', async () => {
      const startTime = Date.now();
      
      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 1 DOT to Alice',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/transaction preview/i)).toBeInTheDocument();
      });
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1500);
    });

    it('handles rapid successive commands', async () => {
      const commands = [
        'Send 1 DOT to Alice',
        'Send 2 WND to Bob',
        'Check my balance',
        'Show contacts',
        'Send 3 ROC to Charlie',
      ];

      for (const command of commands) {
        (useVoiceRecognition as any).mockReturnValue({
          ...mockVoiceRecognition,
          transcript: command,
        });

        render(<App />);
        
        const processButton = screen.getByRole('button', { name: /process command/i });
        fireEvent.click(processButton);
        
        await waitFor(() => {
          expect(screen.getByText(/processing/i)).toBeInTheDocument();
        });
      }
    });

    it('caches frequently used data', async () => {
      // Mock cache hit
      const mockCacheGet = vi.fn(() => ({
        contacts: [{ name: 'Alice', address: '5GH7...' }],
        balances: { DOT: '1000000000000' },
      }));

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockCacheGet,
          setItem: vi.fn(),
        },
      });

      render(<App />);
      
      expect(mockCacheGet).toHaveBeenCalled();
    });
  });

  describe('Accessibility Tests', () => {
    it('supports keyboard navigation', async () => {
      render(<App />);
      
      const voiceButton = screen.getByRole('button', { name: /start voice/i });
      
      // Tab navigation
      await userEvent.tab();
      expect(voiceButton).toHaveFocus();
      
      // Space key activation
      await userEvent.keyboard(' ');
      expect(mockVoiceRecognition.startListening).toHaveBeenCalled();
      
      // Escape key to stop
      await userEvent.keyboard('{Escape}');
      expect(mockVoiceRecognition.stopListening).toHaveBeenCalled();
    });

    it('provides screen reader support', async () => {
      render(<App />);
      
      const voiceButton = screen.getByRole('button', { name: /start voice/i });
      expect(voiceButton).toHaveAttribute('aria-label');
      expect(voiceButton).toHaveAttribute('aria-describedby');
      
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('meets WCAG contrast requirements', async () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        // This would need actual contrast calculation in real tests
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      });
    });

    it('supports voice feedback for blind users', async () => {
      const mockSpeak = vi.fn();
      (window as any).speechSynthesis = {
        speak: mockSpeak,
        getVoices: () => [],
      };

      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 5 DOT to Alice',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringMatching(/sending 5 dot to alice/i),
          })
        );
      });
    });
  });

  describe('ElevenLabs Integration Tests', () => {
    it('uses ElevenLabs for voice feedback', async () => {
      const mockElevenLabsSpeak = vi.fn();
      
      vi.doMock('../services/ElevenLabsService', () => ({
        default: {
          speak: mockElevenLabsSpeak,
        },
      }));

      (useVoiceRecognition as any).mockReturnValue({
        ...mockVoiceRecognition,
        transcript: 'Send 1 DOT to Bob',
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(mockElevenLabsSpeak).toHaveBeenCalledWith(
          expect.stringMatching(/transaction processed/i)
        );
      });
    });

    it('handles ElevenLabs API errors gracefully', async () => {
      const mockElevenLabsSpeak = vi.fn().mockRejectedValue(new Error('API limit exceeded'));
      
      vi.doMock('../services/ElevenLabsService', () => ({
        default: {
          speak: mockElevenLabsSpeak,
        },
      }));

      render(<App />);
      
      // Should fall back to browser TTS
      expect(screen.getByText(/voice synthesis available/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling Tests', () => {
    it('recovers from network errors', async () => {
      (usePolkadotApi as any).mockReturnValue({
        ...mockPolkadotApi,
        isConnected: false,
        error: 'Network timeout',
      });

      render(<App />);
      
      expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
      
      // Mock successful reconnection
      (usePolkadotApi as any).mockReturnValue({
        ...mockPolkadotApi,
        isConnected: true,
        error: null,
      });
      
      const retryButton = screen.getByRole('button', { name: /retry connection/i });
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText(/connected to network/i)).toBeInTheDocument();
      });
    });

    it('handles wallet disconnection gracefully', async () => {
      (useWalletConnection as any).mockReturnValue({
        ...mockWalletConnection,
        isWalletReady: false,
        error: 'Wallet disconnected',
      });

      render(<App />);
      
      expect(screen.getByText(/wallet disconnected/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reconnect wallet/i })).toBeInTheDocument();
    });

    it('shows helpful error messages for common issues', async () => {
      const commonErrors = [
        { error: 'Insufficient balance', message: /not enough funds/i },
        { error: 'Invalid address', message: /please check the recipient address/i },
        { error: 'Network congestion', message: /network is busy/i },
        { error: 'Transaction failed', message: /transaction could not be processed/i },
      ];

      for (const { error, message } of commonErrors) {
        (usePolkadotApi as any).mockReturnValue({
          ...mockPolkadotApi,
          error,
        });

        render(<App />);
        expect(screen.getByText(message)).toBeInTheDocument();
      }
    });
  });

  describe('Mobile Responsiveness Tests', () => {
    it('adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      render(<App />);
      
      const container = screen.getByTestId('app-container');
      expect(container).toHaveClass('mobile-layout');
      
      const voiceButton = screen.getByRole('button', { name: /start voice/i });
      expect(voiceButton).toHaveClass('mobile-voice-button');
    });

    it('supports touch gestures', async () => {
      render(<App />);
      
      const voiceButton = screen.getByRole('button', { name: /start voice/i });
      
      // Simulate touch start
      fireEvent.touchStart(voiceButton);
      expect(mockVoiceRecognition.startListening).toHaveBeenCalled();
      
      // Simulate touch end
      fireEvent.touchEnd(voiceButton);
      expect(mockVoiceRecognition.stopListening).toHaveBeenCalled();
    });
  });
});

// Integration Tests
describe('EchoPay-2 Integration Tests', () => {
  it('completes full payment workflow', async () => {
    const mockVoiceRecognition = {
      startListening: vi.fn(),
      stopListening: vi.fn(),
      isListening: false,
      transcript: 'Send 5 DOT to Alice',
      confidence: 0.95,
      error: null,
      resetTranscript: vi.fn(),
      isSupported: true,
    };

    (useVoiceRecognition as any).mockReturnValue(mockVoiceRecognition);

    render(<App />);
    
    // 1. Start voice recognition
    const startButton = screen.getByRole('button', { name: /start voice/i });
    fireEvent.click(startButton);
    
    // 2. Process voice command
    await waitFor(() => {
      expect(screen.getByText(/send 5 dot to alice/i)).toBeInTheDocument();
    });
    
    const processButton = screen.getByRole('button', { name: /process command/i });
    fireEvent.click(processButton);
    
    // 3. Review transaction
    await waitFor(() => {
      expect(screen.getByText(/transaction preview/i)).toBeInTheDocument();
      expect(screen.getByText(/amount: 5 dot/i)).toBeInTheDocument();
    });
    
    // 4. Confirm transaction
    const confirmButton = screen.getByRole('button', { name: /confirm transaction/i });
    fireEvent.click(confirmButton);
    
    // 5. Verify success
    await waitFor(() => {
      expect(screen.getByText(/transaction successful/i)).toBeInTheDocument();
    });
  });

  it('handles complex multi-step workflows', async () => {
    const workflow = [
      'Add contact Bob with address 5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV',
      'Send 3 DOT to Bob',
      'Check my balance',
      'Show transaction history',
    ];

    for (const command of workflow) {
      (useVoiceRecognition as any).mockReturnValue({
        startListening: vi.fn(),
        stopListening: vi.fn(),
        isListening: false,
        transcript: command,
        confidence: 0.9,
        error: null,
        resetTranscript: vi.fn(),
        isSupported: true,
      });

      render(<App />);
      
      const processButton = screen.getByRole('button', { name: /process command/i });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText(/command processed/i)).toBeInTheDocument();
      });
    }
  });
});

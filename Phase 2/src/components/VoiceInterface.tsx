import React, { useState, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useWallet } from '../hooks/useWallet';
import { useApi } from '../hooks/useApi';
import VoiceRecorder from './VoiceRecorder';
import VoiceConfirmation from './VoiceConfirmation';
import WalletConnector from './WalletConnector';
import NetworkSelector from './NetworkSelector';
import LoadingSpinner from './LoadingSpinner';
import { Alert } from './ui/alert';
import { Card } from './ui/card';
import { Button } from './ui/button';
import './VoiceInterface.css';

interface ParsedCommand {
  amount: string;
  recipient: string;
  currency: string;
  memo?: string;
}

const VoiceInterface: React.FC = () => {
  const { 
    isListening, 
    transcript, 
    confidence, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported 
  } = useVoice();

  const { 
    selectedAccount, 
    accounts, 
    isConnected, 
    connect, 
    disconnect 
  } = useWallet();

  const { api, isConnected: apiConnected } = useApi();

  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse voice command
  useEffect(() => {
    if (transcript && confidence > 0.8) {
      const parsed = parseVoiceCommand(transcript);
      if (parsed) {
        setParsedCommand(parsed);
        stopListening();
      }
    }
  }, [transcript, confidence, stopListening]);

  const parseVoiceCommand = (text: string): ParsedCommand | null => {
    // Enhanced voice command parsing with multiple patterns
    const patterns = [
      // "Send 5 DOT to Alice"
      /(?:send|transfer|pay)\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/i,
      // "Pay Alice 5 DOT"
      /(?:pay|send)\s+(\w+)\s+(\d+(?:\.\d+)?)\s+(\w+)/i,
      // "Send 5 DOT to 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      /(?:send|transfer|pay)\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+([a-zA-Z0-9]{47,48})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          amount: match[1],
          currency: match[2].toUpperCase(),
          recipient: match[3] || match[4], // Handle different capture groups
        };
      }
    }

    return null;
  };

  const handleVoiceCommand = async () => {
    if (!parsedCommand || !selectedAccount || !api) {
      setError('Missing required information for transaction');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert amount to planck (smallest unit)
      const amount = parseFloat(parsedCommand.amount) * Math.pow(10, 12);

      // Create transfer transaction
      const tx = api.tx.balances.transferKeepAlive(
        parsedCommand.recipient,
        amount
      );

      // Sign and send transaction
      const hash = await tx.signAndSend(selectedAccount);

      setSuccess(`Transaction submitted with hash: ${hash}`);
      setParsedCommand(null);
      resetTranscript();

    } catch (err) {
      setError(`Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setParsedCommand(null);
    resetTranscript();
    setError(null);
    setSuccess(null);
  };

  if (!isSupported) {
    return (
      <div className="voice-interface">
        <Alert variant="destructive">
          <h3>Browser Not Supported</h3>
          <p>Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="voice-interface">
      <div className="voice-interface__header">
        <h1>🎤 Voice-Activated Payments</h1>
        <p>Speak your payment command naturally</p>
      </div>

      {/* Network and Wallet Status */}
      <div className="voice-interface__status">
        <NetworkSelector />
        <WalletConnector />
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <div className={`status-indicator ${apiConnected ? 'connected' : 'disconnected'}`}>
          API: {apiConnected ? 'Connected' : 'Disconnected'}
        </div>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          Wallet: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Voice Interface */}
      <Card className="voice-interface__main">
        {!isConnected ? (
          <div className="connection-prompt">
            <h3>Connect Your Wallet</h3>
            <p>Please connect a Polkadot wallet to start making voice payments</p>
            <Button onClick={connect}>Connect Wallet</Button>
          </div>
        ) : (
          <>
            {/* Voice Recorder */}
            <VoiceRecorder
              isListening={isListening}
              transcript={transcript}
              confidence={confidence}
              onStart={startListening}
              onStop={stopListening}
              onReset={handleReset}
            />

            {/* Parsed Command Display */}
            {parsedCommand && (
              <VoiceConfirmation
                command={parsedCommand}
                onConfirm={handleVoiceCommand}
                onCancel={handleReset}
                isProcessing={isProcessing}
              />
            )}

            {/* Status Messages */}
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                {success}
              </Alert>
            )}

            {/* Loading State */}
            {isProcessing && (
              <div className="processing-overlay">
                <LoadingSpinner />
                <p>Processing your voice payment...</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Instructions */}
      <div className="voice-interface__instructions">
        <h3>Voice Commands</h3>
        <ul>
          <li>"Send 5 DOT to Alice"</li>
          <li>"Pay Bob 10 WND"</li>
          <li>"Transfer 100 ROC to 5GrwvaEF5zXb..."</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInterface;
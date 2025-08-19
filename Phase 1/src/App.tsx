import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Mic, 
  MicOff, 
  Wallet, 
  Send, 
  History, 
  Settings, 
  HelpCircle,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Components
import WalletConnector from './components/WalletConnector'
import VoiceRecorder from './components/VoiceRecorder'
import TransactionForm from './components/TransactionForm'
import BalanceDisplay from './components/BalanceDisplay'
import TransactionHistory from './components/TransactionHistory'
import NetworkSelector from './components/NetworkSelector'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Hooks
import { usePolkadot } from './hooks/usePolkadot'
import { useWallet } from './hooks/useWallet'
import { useVoice } from './hooks/useVoice'

// Utils
import { NETWORKS, DEFAULT_NETWORK_CONFIG, HELP_TEXT, SUCCESS_MESSAGES } from './utils/constants'
import { validateVoiceCommand, validateTransaction } from './utils/validation'
import { formatBalance, formatTimestamp } from './utils/formatters'
import type { 
  VoiceCommand, 
  TransactionPreview, 
  PaymentRecord,
  NetworkType,
  AppError 
} from './utils/types'

// Main App Component
function App() {
  // State management
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>(DEFAULT_NETWORK_CONFIG.name as NetworkType)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState<TransactionPreview | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<PaymentRecord[]>([])
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home')

  // Custom hooks
  const { api, isConnected: isApiConnected, isLoading: isApiLoading, error: apiError, connect: connectToNetwork } = usePolkadot(currentNetwork)
  const { 
    accounts, 
    selectedAccount, 
    isConnected: isWalletConnected, 
    isLoading: isWalletLoading,
    error: walletError,
    connectWallet,
    disconnectWallet,
    selectAccount,
    getBalance
  } = useWallet()
  const {
    isListening,
    isProcessing,
    transcript,
    command,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    synthesizeSpeech
  } = useVoice()

  // Network switching
  const handleNetworkChange = useCallback(async (network: NetworkType) => {
    try {
      setCurrentNetwork(network)
      await connectToNetwork()
      toast.success(`Switched to ${NETWORKS[network].displayName}`)
    } catch (error) {
      toast.error(`Failed to switch to ${NETWORKS[network].displayName}`)
      console.error('Network switch error:', error)
    }
  }, [connectToNetwork])

  // Voice command handling
  const handleVoiceCommand = useCallback(async (voiceCommand: VoiceCommand) => {
    const validation = validateVoiceCommand(voiceCommand)
    
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '))
      await synthesizeSpeech('I didn\'t understand that command. Please try again.')
      return
    }

    switch (voiceCommand.action) {
      case 'send':
      case 'transfer':
        if (!isWalletConnected || !selectedAccount) {
          toast.error('Please connect your wallet first')
          await synthesizeSpeech('Please connect your wallet first to send payments.')
          return
        }
        
        if (voiceCommand.amount && voiceCommand.recipient) {
          const transaction: TransactionPreview = {
            from: selectedAccount.address,
            to: voiceCommand.recipient,
            amount: voiceCommand.amount.toString(),
            currency: voiceCommand.currency || NETWORKS[currentNetwork].currency,
            estimatedFee: '0.01', // This would be calculated
            network: currentNetwork
          }
          
          setPendingTransaction(transaction)
          setShowTransactionForm(true)
          await synthesizeSpeech(`I'll help you send ${voiceCommand.amount} ${voiceCommand.currency} to ${voiceCommand.recipient}. Please confirm the transaction.`)
        }
        break
        
      case 'balance':
        if (!isWalletConnected || !selectedAccount) {
          toast.error('Please connect your wallet first')
          await synthesizeSpeech('Please connect your wallet first to check your balance.')
          return
        }
        
        try {
          const balance = await getBalance(selectedAccount.address)
          if (balance) {
            const formattedBalance = formatBalance(balance.free, currentNetwork)
            toast.success(`Balance: ${formattedBalance}`)
            await synthesizeSpeech(`Your current balance is ${formattedBalance}`)
          }
        } catch (error) {
          toast.error('Failed to fetch balance')
          await synthesizeSpeech('I couldn\'t retrieve your balance. Please try again.')
        }
        break
        
      case 'history':
        setActiveTab('history')
        await synthesizeSpeech('Showing your transaction history')
        break
        
      case 'help':
        toast.success('Voice commands available')
        await synthesizeSpeech(HELP_TEXT.VOICE_COMMANDS)
        break
        
      case 'cancel':
        setShowTransactionForm(false)
        setPendingTransaction(null)
        await synthesizeSpeech('Operation cancelled')
        break
        
      default:
        toast.error('Command not recognized')
        await synthesizeSpeech('I didn\'t recognize that command. Say "help" to hear available commands.')
    }
  }, [
    isWalletConnected, 
    selectedAccount, 
    currentNetwork, 
    getBalance, 
    synthesizeSpeech
  ])

  // Transaction submission
  const handleTransactionSubmit = useCallback(async (transaction: TransactionPreview) => {
    if (!api || !selectedAccount) {
      toast.error('Wallet or network not connected')
      return
    }

    try {
      // This would implement the actual transaction logic
      // For now, we'll simulate a transaction
      const transactionHash = `0x${Math.random().toString(16).slice(2)}`
      
      const record: PaymentRecord = {
        id: transactionHash,
        sender: transaction.from,
        recipient: transaction.to,
        amount: transaction.amount,
        currency: transaction.currency,
        network: transaction.network,
        hash: transactionHash,
        timestamp: Date.now(),
        status: 'pending'
      }

      setTransactionHistory(prev => [record, ...prev])
      setPendingTransaction(null)
      setShowTransactionForm(false)
      
      toast.success(SUCCESS_MESSAGES.TRANSACTION_SUBMITTED)
      await synthesizeSpeech('Transaction submitted successfully')
      
      // Simulate confirmation after delay
      setTimeout(() => {
        setTransactionHistory(prev => 
          prev.map(tx => 
            tx.id === transactionHash 
              ? { ...tx, status: 'confirmed' as const, blockNumber: Math.floor(Math.random() * 1000000) }
              : tx
          )
        )
        toast.success(SUCCESS_MESSAGES.TRANSACTION_CONFIRMED)
      }, 3000)

    } catch (error) {
      toast.error('Transaction failed')
      console.error('Transaction error:', error)
    }
  }, [api, selectedAccount, synthesizeSpeech])

  // Error handling
  const handleError = useCallback((error: AppError) => {
    console.error('App error:', error)
    toast.error(error.message)
  }, [])

  // Initialize app
  useEffect(() => {
    connectToNetwork()
  }, [connectToNetwork])

  // Render loading state
  if (isApiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">Connecting to Polkadot Network</h2>
          <p className="text-gray-600">Please wait while we establish the connection...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-polkadot-pink rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">EchoPay-2</h1>
              </div>

              {/* Network Status & Selector */}
              <div className="flex items-center space-x-4">
                <NetworkSelector
                  currentNetwork={currentNetwork}
                  onNetworkChange={handleNetworkChange}
                  availableNetworks={Object.values(NETWORKS)}
                />
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  {isApiConnected ? (
                    <div className="network-indicator connected">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </div>
                  ) : (
                    <div className="network-indicator disconnected">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Disconnected
                    </div>
                  )}
                </div>

                {/* Wallet Connection */}
                <WalletConnector
                  onConnect={connectWallet}
                  onDisconnect={disconnectWallet}
                  supportedWallets={[]} // This would come from constants
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <nav className="flex space-x-8 mb-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-polkadot-pink text-polkadot-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-polkadot-pink text-polkadot-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-polkadot-pink text-polkadot-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </nav>

          {/* Tab Content */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Balance Display */}
              {isWalletConnected && selectedAccount && (
                <BalanceDisplay
                  balance={{
                    address: selectedAccount.address,
                    network: currentNetwork,
                    free: '1000000000000', // This would come from actual balance
                    reserved: '0',
                    frozen: '0',
                    total: '1000000000000',
                    currency: NETWORKS[currentNetwork].currency,
                    decimals: NETWORKS[currentNetwork].decimals
                  }}
                />
              )}

              {/* Voice Interface */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Voice Commands
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Speak naturally to send payments, check balances, and more
                  </p>

                  {/* Voice Controls */}
                  <div className="flex flex-col items-center space-y-4">
                    {isVoiceSupported ? (
                      <>
                        <VoiceRecorder
                          onCommand={handleVoiceCommand}
                          onError={handleError}
                          isDisabled={!isWalletConnected}
                        />
                        
                        {/* Voice Status */}
                        {isListening && (
                          <div className="text-center">
                            <div className="voice-waveform mb-2">
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                            </div>
                            <p className="text-sm text-gray-600">Listening...</p>
                            {transcript && (
                              <p className="text-xs text-gray-500 mt-1">"{transcript}"</p>
                            )}
                          </div>
                        )}
                        
                        {isProcessing && (
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-gray-600">Processing command...</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Voice commands are not supported in your browser
                        </p>
                        <button
                          onClick={() => setShowTransactionForm(true)}
                          className="btn btn-primary mt-4"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Payment Manually
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Help Text */}
                  <div className="mt-8 text-left">
                    <details className="bg-gray-50 rounded-lg p-4">
                      <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                        <HelpCircle className="w-4 h-4 inline mr-2" />
                        Available Commands
                      </summary>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>• "Send [amount] [currency] to [address]" - Send cryptocurrency</p>
                        <p>• "Check my balance" - View your current balance</p>
                        <p>• "Show my history" - View recent transactions</p>
                        <p>• "Help" - Show available commands</p>
                        <p>• "Cancel" - Cancel current operation</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <TransactionHistory
              transactions={transactionHistory}
              isLoading={false}
              onRefresh={() => {
                // Refresh transaction history
                toast.success('Transaction history refreshed')
              }}
            />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isVoiceEnabled}
                      onChange={(e) => setIsVoiceEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-polkadot-pink focus:ring-polkadot-pink"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable voice commands
                    </span>
                  </label>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Default Network</h3>
                  <NetworkSelector
                    currentNetwork={currentNetwork}
                    onNetworkChange={handleNetworkChange}
                    availableNetworks={Object.values(NETWORKS)}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <TransactionForm
                onSubmit={handleTransactionSubmit}
                onCancel={() => {
                  setShowTransactionForm(false)
                  setPendingTransaction(null)
                }}
                initialData={pendingTransaction || undefined}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {(apiError || walletError || voiceError) && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">
                  {apiError || walletError || voiceError}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChakraProvider, 
  Box, 
  VStack, 
  HStack, 
  Button, 
  Text, 
  Alert, 
  AlertIcon, 
  AlertDescription,
  Spinner,
  useToast,
  useColorMode,
  useColorModeValue,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  List,
  ListItem,
  Divider,
  Container,
  Heading,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

import { 
  MdMic, 
  MdMicOff, 
  MdPeople, 
  MdHistory, 
  MdSettings,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdWallet,
} from 'react-icons/md';

// Import our mock hooks and services
import { 
  useVoiceRecognition,
  usePolkadotApi, 
  useWalletConnection,
  useContractInteraction,
  useSecurityFeatures,
  useAccessibility,
} from './hooks';

import CommandParsingService from './services/CommandParsingService';
import ElevenLabsService from './services/ElevenLabsService';

// Types
interface ParsedCommand {
  type: 'payment' | 'contact' | 'query' | 'settings' | 'unknown';
  action: string;
  amount?: number;
  currency?: string;
  recipient?: string;
  recipientAddress?: string;
  confidence: number;
  timestamp: number;
  parameters?: Record<string, any>;
  suggestions?: string[];
}

const App: React.FC = () => {
  // Core state management
  const [currentTab, setCurrentTab] = useState(0);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Mock hooks
  const {
    startListening,
    stopListening,
    isListening,
    transcript,
    confidence,
    error: voiceError,
    resetTranscript,
    isSupported: isVoiceSupported,
  } = useVoiceRecognition();

  const {
    api,
    connect,
    disconnect,
    isConnected,
    blockNumber,
    error: apiError,
  } = usePolkadotApi();

  const {
    accounts,
    selectedAccount,
    selectAccount,
    isWalletReady,
    walletType,
    error: walletError,
    balance,
    connectWallet,
  } = useWalletConnection();

  const {
    recordPayment,
    getPaymentHistory,
    addContact,
    getContacts,
    error: contractError,
    isLoading: contractLoading,
  } = useContractInteraction(api, selectedAccount);

  const {
    checkSecurityLevel,
    verifyVoiceBiometric,
    validateTransaction,
  } = useSecurityFeatures();

  const { announceToScreenReader, configureSpeechSynthesis } = useAccessibility();

  // Chakra UI hooks
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Voice command processing
  const processVoiceCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    announceToScreenReader('Processing voice command...');

    try {
      // Parse command
      const parsed = await CommandParsingService.parseCommand(command, {
        userId: selectedAccount,
        timestamp: Date.now(),
      });

      setParsedCommand(parsed);

      if (parsed.confidence < 0.7) {
        toast({
          title: 'Command Not Clear',
          description: parsed.suggestions?.[0] || 'Please try again with a clearer command',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }

      // Provide voice feedback
      const feedbackText = `Command understood: ${CommandParsingService.getCommandSummary(parsed)}`;
      await ElevenLabsService.speak(feedbackText);

      announceToScreenReader(feedbackText);

    } catch (error: any) {
      console.error('Command processing error:', error);
      
      toast({
        title: 'Processing Error',
        description: error.message || 'Failed to process voice command',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  }, [selectedAccount, toast, resetTranscript, announceToScreenReader]);

  // Execute transactions
  const executeTransaction = useCallback(async (command: ParsedCommand) => {
    if (!command) return;

    setIsProcessing(true);

    try {
      switch (command.type) {
        case 'payment':
          if (command.amount && command.recipientAddress) {
            await recordPayment({
              recipient: command.recipientAddress,
              amount: command.amount.toString(),
              voiceCommand: `${command.action} ${command.amount} ${command.currency} to ${command.recipient}`,
              network: 'polkadot',
              currency: command.currency || 'DOT',
            });

            toast({
              title: 'Payment Recorded',
              description: `${command.amount} ${command.currency} to ${command.recipient}`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            await ElevenLabsService.speak(`Payment of ${command.amount} ${command.currency} to ${command.recipient} has been processed`);
          }
          break;

        case 'contact':
          if (command.action === 'add' && command.recipient) {
            await addContact(command.recipient, command.recipientAddress || '');
            toast({
              title: 'Contact Added',
              description: `${command.recipient} has been added to your contacts`,
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }
          break;

        case 'query':
          if (command.action === 'balance') {
            await ElevenLabsService.speak(`Your current balance is ${balance} DOT`);
          } else if (command.action === 'history') {
            setCurrentTab(1); // Switch to history tab
            await ElevenLabsService.speak('Showing your transaction history');
          }
          break;

        case 'settings':
          setCurrentTab(3); // Switch to settings tab
          await ElevenLabsService.speak('Opening settings');
          break;
      }

      setParsedCommand(null);

    } catch (error: any) {
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute command',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [balance, recordPayment, addContact, toast]);

  // Voice control handlers
  const handleStartListening = useCallback(async () => {
    if (!isVoiceSupported) {
      toast({
        title: 'Voice Not Supported',
        description: 'Your browser does not support voice recognition',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await startListening();
      announceToScreenReader('Voice recognition started. Please speak your command.');
    } catch (error: any) {
      toast({
        title: 'Voice Recognition Error',
        description: 'Failed to access microphone. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isVoiceSupported, startListening, toast, announceToScreenReader]);

  // Process transcript when available
  useEffect(() => {
    if (transcript && !isListening && confidence > 0.7) {
      processVoiceCommand(transcript);
    }
  }, [transcript, isListening, confidence, processVoiceCommand]);

  // Load transaction history and contacts
  useEffect(() => {
    const loadData = async () => {
      if (selectedAccount) {
        try {
          const history = await getPaymentHistory(selectedAccount);
          setTransactionHistory(history);

          const contactList = await getContacts();
          setContacts(contactList);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      }
    };

    loadData();
  }, [selectedAccount, getPaymentHistory, getContacts]);

  // Render loading state
  if (!isWalletReady || !isConnected) {
    return (
      <ChakraProvider>
        <Container centerContent p={8}>
          <VStack spacing={6}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="lg">Initializing EchoPay-2</Heading>
            <VStack spacing={2}>
              <Text>Wallet Status: {isWalletReady ? 'Ready' : 'Connecting...'}</Text>
              <Text>Network Status: {isConnected ? 'Connected' : 'Connecting...'}</Text>
              {(walletError || apiError) && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    {walletError || apiError}
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </VStack>
        </Container>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={bgColor} p={4}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="center">
              <Heading size="xl" color="blue.500">
                EchoPay-2 🎤
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="green" fontSize="sm">
                  {import.meta.env.VITE_MOCK_MODE === 'true' ? 'Demo Mode' : 'Connected'}
                </Badge>
                <Tooltip label="Toggle dark mode">
                  <IconButton
                    aria-label="Toggle dark mode"
                    icon={colorMode === 'light' ? '🌙' : '☀️'}
                    onClick={toggleColorMode}
                    size="sm"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
            </HStack>

            {/* Status Bar */}
            <Card>
              <CardBody>
                <HStack justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">Account</Text>
                    <Text fontSize="xs" fontFamily="mono">
                      {selectedAccount?.slice(0, 8)}...{selectedAccount?.slice(-8)}
                    </Text>
                  </VStack>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">Balance</Text>
                    <Text fontSize="xs">{balance} DOT</Text>
                  </VStack>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">Network</Text>
                    <Badge colorScheme="blue" fontSize="xs">
                      {import.meta.env.VITE_MOCK_MODE === 'true' ? 'Demo' : 'Rococo'}
                    </Badge>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">Block</Text>
                    <Text fontSize="xs">#{blockNumber}</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Voice Control Interface */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={4} align="center">
                    <Button
                      size="lg"
                      colorScheme={isListening ? 'red' : 'blue'}
                      leftIcon={isListening ? <MdMicOff /> : <MdMic />}
                      onClick={isListening ? stopListening : handleStartListening}
                      disabled={isProcessing || !isVoiceSupported}
                      className={isListening ? 'voice-active' : ''}
                      aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
                    >
                      {isListening ? 'Stop Voice' : 'Start Voice'}
                    </Button>
                    
                    {isProcessing && <Spinner color="blue.500" />}
                    
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">
                        Status: {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
                      </Text>
                      {confidence > 0 && (
                        <Text fontSize="xs" color="gray.600">
                          Confidence: {Math.round(confidence * 100)}%
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Transcript Display */}
                  {transcript && (
                    <Box 
                      p={3} 
                      bg={useColorModeValue('gray.50', 'gray.700')} 
                      borderRadius="md" 
                      w="full"
                    >
                      <Text fontSize="sm" fontStyle="italic">
                        "{transcript}"
                      </Text>
                    </Box>
                  )}

                  {/* Parsed Command Display */}
                  {parsedCommand && (
                    <Card w="full" borderColor="blue.200">
                      <CardHeader>
                        <Heading size="md">Command Preview</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Type:</Text>
                            <Badge colorScheme="blue">{parsedCommand.type}</Badge>
                          </HStack>
                          {parsedCommand.amount && (
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Amount:</Text>
                              <Text>{parsedCommand.amount} {parsedCommand.currency}</Text>
                            </HStack>
                          )}
                          {parsedCommand.recipient && (
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Recipient:</Text>
                              <Text>{parsedCommand.recipient}</Text>
                            </HStack>
                          )}
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Confidence:</Text>
                            <Badge colorScheme="green">{Math.round(parsedCommand.confidence * 100)}%</Badge>
                          </HStack>
                          <Divider />
                          <HStack spacing={3}>
                            <Button
                              colorScheme="green"
                              onClick={() => executeTransaction(parsedCommand)}
                              disabled={isProcessing}
                              flex={1}
                            >
                              {isProcessing ? 'Processing...' : 'Execute Command'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setParsedCommand(null)}
                              disabled={isProcessing}
                            >
                              Cancel
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Error Alerts */}
            {(voiceError || apiError || walletError || contractError) && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  {voiceError || apiError || walletError || contractError}
                </AlertDescription>
              </Alert>
            )}

            {/* Main Content Tabs */}
            <Tabs index={currentTab} onChange={setCurrentTab}>
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <MdMic />
                    <Text>Voice Commands</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <MdHistory />
                    <Text>History</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <MdPeople />
                    <Text>Contacts</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <MdSettings />
                    <Text>Settings</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Voice Commands Help */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Voice Commands Guide</Heading>
                        <Text>Use natural language to interact with EchoPay-2:</Text>
                        
                        <Accordion allowMultiple>
                          <AccordionItem>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                Payment Commands
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                              <List spacing={2} fontSize="sm">
                                <ListItem>"Send 5 DOT to Alice"</ListItem>
                                <ListItem>"Pay 100 dollars worth of DOT to Bob"</ListItem>
                                <ListItem>"Transfer 2.5 WND to Charlie"</ListItem>
                              </List>
                            </AccordionPanel>
                          </AccordionItem>
                          
                          <AccordionItem>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                Query Commands
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                              <List spacing={2} fontSize="sm">
                                <ListItem>"What's my balance?"</ListItem>
                                <ListItem>"Show transaction history"</ListItem>
                                <ListItem>"Check network status"</ListItem>
                              </List>
                            </AccordionPanel>
                          </AccordionItem>

                          <AccordionItem>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                Contact Commands
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                              <List spacing={2} fontSize="sm">
                                <ListItem>"Add contact Alice"</ListItem>
                                <ListItem>"Show my contacts"</ListItem>
                                <ListItem>"Remove contact Bob"</ListItem>
                              </List>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Transaction History */}
                <TabPanel>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Transaction History</Heading>
                    </CardHeader>
                    <CardBody>
                      {transactionHistory.length > 0 ? (
                        <TableContainer>
                          <Table variant="simple">
                            <Tbody>
                              {transactionHistory.map((tx, index) => (
                                <Tr key={tx.id || index}>
                                  <Td>
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="bold">{tx.voiceCommand}</Text>
                                      <Text fontSize="sm" color="gray.600">
                                        {new Date(tx.timestamp).toLocaleString()}
                                      </Text>
                                    </VStack>
                                  </Td>
                                  <Td>
                                    <VStack align="end" spacing={1}>
                                      <Text>{tx.amount}</Text>
                                      <Badge 
                                        colorScheme={tx.status === 'confirmed' ? 'green' : 'yellow'}
                                        size="sm"
                                      >
                                        {tx.status}
                                      </Badge>
                                    </VStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Text>No transactions yet. Try making a payment with voice commands!</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Contacts */}
                <TabPanel>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Contacts</Heading>
                    </CardHeader>
                    <CardBody>
                      {contacts.length > 0 ? (
                        <VStack spacing={3}>
                          {contacts.map((contact, index) => (
                            <Box key={index} p={3} borderWidth={1} borderRadius="md" w="full">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">{contact.name}</Text>
                                  <Text fontSize="sm" color="gray.600" fontFamily="mono">
                                    {contact.address.slice(0, 8)}...{contact.address.slice(-8)}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Badge colorScheme={contact.verified ? 'green' : 'gray'}>
                                    {contact.verified ? 'Verified' : 'Unverified'}
                                  </Badge>
                                  <Text fontSize="sm">
                                    {contact.transactionCount} transactions
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text>No contacts yet. Try adding contacts with voice commands!</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Settings */}
                <TabPanel>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontWeight="bold" mb={2}>Application Info</Text>
                          <TableContainer>
                            <Table variant="simple" size="sm">
                              <Tbody>
                                <Tr>
                                  <Td fontWeight="bold">Version</Td>
                                  <Td>2.1.0</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Mode</Td>
                                  <Td>
                                    <Badge colorScheme={import.meta.env.VITE_MOCK_MODE === 'true' ? 'orange' : 'green'}>
                                      {import.meta.env.VITE_MOCK_MODE === 'true' ? 'Demo Mode' : 'Live Mode'}
                                    </Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Wallet</Td>
                                  <Td>{walletType}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Voice Support</Td>
                                  <Td>
                                    {isVoiceSupported ? (
                                      <Badge colorScheme="green">Supported</Badge>
                                    ) : (
                                      <Badge colorScheme="red">Not Supported</Badge>
                                    )}
                                  </Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontWeight="bold" mb={2}>Quick Actions</Text>
                          <VStack spacing={2} align="stretch">
                            <Button 
                              leftIcon={<MdRefresh />} 
                              variant="outline"
                              onClick={() => window.location.reload()}
                            >
                              Reload Application
                            </Button>
                            <Button 
                              leftIcon={<MdWallet />} 
                              variant="outline"
                              onClick={connectWallet}
                            >
                              Reconnect Wallet
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App;

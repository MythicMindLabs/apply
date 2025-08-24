import React, { useState, useCallback } from 'react';
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
  Container,
  Heading,
  List,
  ListItem,
  Divider,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
} from '@chakra-ui/react';

import { 
  MdMic, 
  MdMicOff, 
  MdPeople, 
  MdHistory, 
  MdSettings,
  MdRefresh,
  MdWallet,
} from 'react-icons/md';

// Mock hooks for demo functionality
const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    setIsListening(true);
    setError(null);
    
    // Simulate voice recognition
    setTimeout(() => {
      const mockCommands = [
        'Send 5 DOT to Alice',
        'What is my balance',
        'Show transaction history',
        'Add contact Bob',
        'Open settings'
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setTranscript(randomCommand);
      setConfidence(0.95);
      setIsListening(false);
    }, 2000);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    transcript,
    confidence,
    error,
    resetTranscript,
    isSupported: true,
  };
};

const useWalletConnection = () => {
  const [isConnected] = useState(true);
  const [selectedAccount] = useState('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const [balance] = useState('1,234.56');

  return {
    isConnected,
    selectedAccount,
    balance,
    walletType: 'SubWallet (Demo)',
    connectWallet: () => console.log('Connect wallet'),
  };
};

const usePolkadotApi = () => {
  return {
    api: null,
    isConnected: true,
    blockNumber: 12345678,
    error: null,
  };
};

// Mock data
const mockTransactionHistory = [
  {
    id: '1',
    voiceCommand: 'Send 10 DOT to Alice',
    amount: '10 DOT',
    timestamp: new Date('2025-08-24T10:30:00').toISOString(),
    status: 'confirmed',
  },
  {
    id: '2',
    voiceCommand: 'Pay 5 WND to Bob',
    amount: '5 WND',
    timestamp: new Date('2025-08-23T15:45:00').toISOString(),
    status: 'confirmed',
  },
  {
    id: '3',
    voiceCommand: 'Transfer 2.5 DOT to Charlie',
    amount: '2.5 DOT',
    timestamp: new Date('2025-08-22T09:15:00').toISOString(),
    status: 'pending',
  },
];

const mockContacts = [
  {
    name: 'Alice',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    verified: true,
    transactionCount: 15,
  },
  {
    name: 'Bob',
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    verified: true,
    transactionCount: 8,
  },
  {
    name: 'Charlie',
    address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    verified: false,
    transactionCount: 3,
  },
];

interface ParsedCommand {
  type: string;
  action: string;
  amount?: string;
  currency?: string;
  recipient?: string;
  confidence: number;
}

const parseVoiceCommand = (command: string): ParsedCommand => {
  const lowerCommand = command.toLowerCase();
  
  // Payment command parsing
  const paymentMatch = lowerCommand.match(/(?:send|pay|transfer)\s+(\d+(?:\.\d+)?)\s*(dot|wnd|usdc)?\s+to\s+(\w+)/);
  if (paymentMatch) {
    return {
      type: 'payment',
      action: 'send',
      amount: paymentMatch[1],
      currency: paymentMatch[2]?.toUpperCase() || 'DOT',
      recipient: paymentMatch[3],
      confidence: 0.95,
    };
  }

  // Balance query
  if (lowerCommand.includes('balance')) {
    return {
      type: 'query',
      action: 'balance',
      confidence: 0.98,
    };
  }

  // History query
  if (lowerCommand.includes('history')) {
    return {
      type: 'query',
      action: 'history',
      confidence: 0.96,
    };
  }

  // Contact commands
  if (lowerCommand.includes('contact')) {
    return {
      type: 'contact',
      action: 'manage',
      confidence: 0.92,
    };
  }

  // Settings
  if (lowerCommand.includes('settings')) {
    return {
      type: 'settings',
      action: 'open',
      confidence: 0.94,
    };
  }

  return {
    type: 'unknown',
    action: 'unknown',
    confidence: 0.1,
  };
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    isConnected,
    selectedAccount,
    balance,
    walletType,
    connectWallet,
  } = useWalletConnection();

  const {
    isConnected: apiConnected,
    blockNumber,
    error: apiError,
  } = usePolkadotApi();

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // Process voice command when transcript updates
  React.useEffect(() => {
    if (transcript && !isListening && confidence > 0.7) {
      const parsed = parseVoiceCommand(transcript);
      setParsedCommand(parsed);
      
      if (parsed.confidence > 0.8) {
        toast({
          title: 'Voice Command Recognized',
          description: `Understood: ${transcript}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [transcript, isListening, confidence, toast]);

  const executeCommand = useCallback(async (command: ParsedCommand) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      
      switch (command.type) {
        case 'payment':
          toast({
            title: 'Payment Processed',
            description: `${command.amount} ${command.currency} sent to ${command.recipient}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          break;
        case 'query':
          if (command.action === 'balance') {
            toast({
              title: 'Balance Information',
              description: `Your balance is ${balance} DOT`,
              status: 'info',
              duration: 3000,
              isClosable: true,
            });
          } else if (command.action === 'history') {
            setCurrentTab(1);
          }
          break;
        case 'settings':
          setCurrentTab(3);
          break;
      }
      
      setParsedCommand(null);
      resetTranscript();
    } catch (error) {
      toast({
        title: 'Command Failed',
        description: 'Unable to process voice command',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [balance, toast, resetTranscript]);

  const handleVoiceClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isConnected || !apiConnected) {
    return (
      <ChakraProvider>
        <Container centerContent p={8}>
          <VStack spacing={6}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="lg">Connecting to EchoPay-2</Heading>
            <Text>Initializing voice payment interface...</Text>
          </VStack>
        </Container>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="center">
              <Heading size="xl" color="blue.500">
                EchoPay-2 🎤
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="green" fontSize="sm">
                  Demo Mode
                </Badge>
                <IconButton
                  aria-label="Toggle dark mode"
                  icon={<Text>{colorMode === 'light' ? '🌙' : '☀️'}</Text>}
                  onClick={toggleColorMode}
                  size="sm"
                  variant="ghost"
                />
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
                    <Badge colorScheme="blue" fontSize="xs">Demo</Badge>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">Block</Text>
                    <Text fontSize="xs">#{blockNumber}</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Voice Interface */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={4} align="center">
                    <Button
                      size="lg"
                      colorScheme={isListening ? 'red' : 'blue'}
                      leftIcon={isListening ? <MdMicOff /> : <MdMic />}
                      onClick={handleVoiceClick}
                      disabled={isProcessing || !isVoiceSupported}
                      className={isListening ? 'voice-active' : ''}
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

                  {transcript && (
                    <Box 
                      p={3} 
                      bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} 
                      borderRadius="md" 
                      w="full"
                    >
                      <Text fontSize="sm" fontStyle="italic">
                        "{transcript}"
                      </Text>
                    </Box>
                  )}

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
                              onClick={() => executeCommand(parsedCommand)}
                              disabled={isProcessing}
                              flex={1}
                            >
                              Execute Command
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

            {/* Error Display */}
            {(voiceError || apiError) && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  {voiceError || apiError}
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs */}
            <Tabs index={currentTab} onChange={setCurrentTab}>
              <TabList>
                <Tab><HStack spacing={2}><MdMic /><Text>Voice Commands</Text></HStack></Tab>
                <Tab><HStack spacing={2}><MdHistory /><Text>History</Text></HStack></Tab>
                <Tab><HStack spacing={2}><MdPeople /><Text>Contacts</Text></HStack></Tab>
                <Tab><HStack spacing={2}><MdSettings /><Text>Settings</Text></HStack></Tab>
              </TabList>

              <TabPanels>
                {/* Voice Commands Help */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Voice Commands Guide</Heading>
                        <Text>Use natural language to interact with EchoPay-2:</Text>
                        
                        <Box>
                          <Text fontWeight="bold" mb={2}>Payment Commands:</Text>
                          <List spacing={1} fontSize="sm">
                            <ListItem>"Send 5 DOT to Alice"</ListItem>
                            <ListItem>"Pay 100 WND to Bob"</ListItem>
                            <ListItem>"Transfer 2.5 DOT to Charlie"</ListItem>
                          </List>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={2}>Query Commands:</Text>
                          <List spacing={1} fontSize="sm">
                            <ListItem>"What's my balance?"</ListItem>
                            <ListItem>"Show transaction history"</ListItem>
                            <ListItem>"Check network status"</ListItem>
                          </List>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={2}>Other Commands:</Text>
                          <List spacing={1} fontSize="sm">
                            <ListItem>"Add contact Alice"</ListItem>
                            <ListItem>"Open settings"</ListItem>
                            <ListItem>"Show my contacts"</ListItem>
                          </List>
                        </Box>
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
                      <TableContainer>
                        <Table variant="simple">
                          <Tbody>
                            {mockTransactionHistory.map((tx) => (
                              <Tr key={tx.id}>
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
                      <VStack spacing={3}>
                        {mockContacts.map((contact, index) => (
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
                                  <Td><Badge colorScheme="orange">Demo Mode</Badge></Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Wallet</Td>
                                  <Td>{walletType}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Voice Support</Td>
                                  <Td><Badge colorScheme="green">Supported</Badge></Td>
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

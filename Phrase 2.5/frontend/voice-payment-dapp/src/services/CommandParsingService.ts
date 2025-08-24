// Enhanced Command Parsing Service for EchoPay-2
export interface ParsedCommand {
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

class CommandParsingService {
  private patterns = {
    payment: [
      /(?:send|pay|transfer)\s+(\d+(?:\.\d+)?)\s*(dot|wnd|usdc|ksm)?\s+to\s+([a-zA-Z0-9]+)/i,
      /(?:give|send)\s+([a-zA-Z0-9]+)\s+(\d+(?:\.\d+)?)\s*(dot|wnd|usdc|ksm)?/i,
      /(?:transfer|pay)\s+(\d+(?:\.\d+)?)\s+(?:dollars?\s+worth\s+of\s+)?(dot|wnd|usdc|ksm)?\s+to\s+([a-zA-Z0-9]+)/i
    ],
    contact: [
      /(?:add|create)\s+contact\s+([a-zA-Z0-9]+)(?:\s+with\s+address\s+([a-zA-Z0-9]+))?/i,
      /(?:remove|delete)\s+contact\s+([a-zA-Z0-9]+)/i,
      /(?:show|list|display)\s+(?:my\s+)?contacts/i
    ],
    query: [
      /(?:what|show|check|display)(?:'s|\s+is)?\s+my\s+balance/i,
      /(?:show|display|list)\s+(?:my\s+)?(?:transaction\s+)?history/i,
      /(?:check|show|what)(?:'s|\s+is)?\s+(?:the\s+)?(?:network\s+)?status/i,
      /(?:how\s+much|what)\s+(?:money|funds|balance)\s+(?:do\s+i\s+have|have\s+i)/i
    ],
    settings: [
      /(?:open|show|go\s+to)\s+settings/i,
      /(?:change|update|modify)\s+(?:my\s+)?(?:security|preferences)/i,
      /(?:enable|disable|turn\s+on|turn\s+off)\s+(biometric|voice\s+verification)/i
    ]
  };

  private contacts = new Map([
    ['alice', '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
    ['bob', '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'],
    ['charlie', '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'],
  ]);

  private currencies = new Set(['dot', 'wnd', 'usdc', 'ksm', 'glmr', 'astr']);

  public async parseCommand(
    command: string, 
    context?: { userId?: string; timestamp?: number }
  ): Promise<ParsedCommand> {
    const cleanCommand = command.toLowerCase().trim();
    const timestamp = context?.timestamp || Date.now();
    
    console.log('Parsing command:', cleanCommand);

    // Try to parse as different command types
    let result = this.parsePaymentCommand(cleanCommand) ||
                 this.parseContactCommand(cleanCommand) ||
                 this.parseQueryCommand(cleanCommand) ||
                 this.parseSettingsCommand(cleanCommand) ||
                 this.parseUnknownCommand(cleanCommand);

    result.timestamp = timestamp;

    // Add suggestions if confidence is low
    if (result.confidence < 0.7) {
      result.suggestions = this.generateSuggestions(cleanCommand);
    }

    console.log('Parsed result:', result);
    return result;
  }

  private parsePaymentCommand(command: string): ParsedCommand | null {
    for (const pattern of this.patterns.payment) {
      const match = command.match(pattern);
      if (match) {
        let amount: number;
        let currency = 'DOT';
        let recipient: string;
        let confidence = 0.9;

        // Different pattern structures
        if (match[1] && isNaN(Number(match[1]))) {
          // Pattern: "give Alice 5 DOT"
          recipient = match[1];
          amount = parseFloat(match[2]);
          currency = (match[3] || 'DOT').toUpperCase();
        } else {
          // Pattern: "send 5 DOT to Alice"
          amount = parseFloat(match[1]);
          currency = (match[2] || 'DOT').toUpperCase();
          recipient = match[3] || match[1];
        }

        // Validate amount
        if (!amount || amount <= 0) {
          confidence *= 0.5;
        }

        // Validate currency
        if (!this.currencies.has(currency.toLowerCase())) {
          currency = 'DOT';
          confidence *= 0.8;
        }

        // Resolve recipient to address
        let recipientAddress: string | undefined;
        const recipientLower = recipient.toLowerCase();
        
        if (this.contacts.has(recipientLower)) {
          recipientAddress = this.contacts.get(recipientLower);
          confidence *= 1.1;
        } else if (this.isValidPolkadotAddress(recipient)) {
          recipientAddress = recipient;
          confidence *= 0.9;
        } else {
          // Try fuzzy matching
          const fuzzyMatch = this.findFuzzyContact(recipientLower);
          if (fuzzyMatch) {
            recipient = fuzzyMatch.name;
            recipientAddress = fuzzyMatch.address;
            confidence *= 0.8;
          } else {
            confidence *= 0.5;
          }
        }

        return {
          type: 'payment',
          action: 'send',
          amount,
          currency,
          recipient,
          recipientAddress,
          confidence: Math.min(confidence, 1.0),
          timestamp: 0,
          parameters: {
            originalCommand: command,
            parsedPattern: pattern.toString()
          }
        };
      }
    }
    return null;
  }

  private parseContactCommand(command: string): ParsedCommand | null {
    for (const pattern of this.patterns.contact) {
      const match = command.match(pattern);
      if (match) {
        let action: string;
        let confidence = 0.85;

        if (command.includes('add') || command.includes('create')) {
          action = 'add';
          const contactName = match[1];
          const contactAddress = match[2];

          return {
            type: 'contact',
            action,
            recipient: contactName,
            recipientAddress: contactAddress,
            confidence,
            timestamp: 0,
            parameters: {
              contactName,
              contactAddress
            }
          };
        } else if (command.includes('remove') || command.includes('delete')) {
          action = 'remove';
          const contactName = match[1];

          return {
            type: 'contact',
            action,
            recipient: contactName,
            confidence,
            timestamp: 0,
            parameters: {
              contactName
            }
          };
        } else if (command.includes('show') || command.includes('list')) {
          action = 'list';

          return {
            type: 'contact',
            action,
            confidence,
            timestamp: 0,
            parameters: {}
          };
        }
      }
    }
    return null;
  }

  private parseQueryCommand(command: string): ParsedCommand | null {
    for (const pattern of this.patterns.query) {
      const match = command.match(pattern);
      if (match) {
        let action: string;
        let confidence = 0.9;

        if (command.includes('balance')) {
          action = 'balance';
        } else if (command.includes('history')) {
          action = 'history';
        } else if (command.includes('status')) {
          action = 'status';
        } else if (command.includes('funds') || command.includes('money')) {
          action = 'balance';
        } else {
          action = 'unknown';
          confidence *= 0.7;
        }

        return {
          type: 'query',
          action,
          confidence,
          timestamp: 0,
          parameters: {
            queryType: action
          }
        };
      }
    }
    return null;
  }

  private parseSettingsCommand(command: string): ParsedCommand | null {
    for (const pattern of this.patterns.settings) {
      const match = command.match(pattern);
      if (match) {
        let action: string;
        let confidence = 0.8;

        if (command.includes('settings')) {
          action = 'open';
        } else if (command.includes('change') || command.includes('update')) {
          action = 'update';
        } else if (command.includes('enable') || command.includes('turn on')) {
          action = 'enable';
          const feature = match[1];
          return {
            type: 'settings',
            action,
            confidence,
            timestamp: 0,
            parameters: {
              feature: feature || 'unknown'
            }
          };
        } else if (command.includes('disable') || command.includes('turn off')) {
          action = 'disable';
          const feature = match[1];
          return {
            type: 'settings',
            action,
            confidence,
            timestamp: 0,
            parameters: {
              feature: feature || 'unknown'
            }
          };
        } else {
          action = 'open';
          confidence *= 0.7;
        }

        return {
          type: 'settings',
          action,
          confidence,
          timestamp: 0,
          parameters: {}
        };
      }
    }
    return null;
  }

  private parseUnknownCommand(command: string): ParsedCommand {
    return {
      type: 'unknown',
      action: 'unknown',
      confidence: 0.1,
      timestamp: 0,
      parameters: {
        originalCommand: command
      },
      suggestions: this.generateSuggestions(command)
    };
  }

  private isValidPolkadotAddress(address: string): boolean {
    // Basic validation for Polkadot SS58 addresses
    return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
  }

  private findFuzzyContact(name: string): { name: string; address: string } | null {
    const threshold = 0.6;
    let bestMatch: { name: string; address: string } | null = null;
    let bestScore = 0;

    for (const [contactName, address] of this.contacts.entries()) {
      const score = this.calculateSimilarity(name, contactName);
      if (score > threshold && score > bestScore) {
        bestScore = score;
        bestMatch = { name: contactName, address };
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  public generateSuggestions(command: string): string[] {
    const suggestions: string[] = [];
    
    // Payment suggestions
    if (command.includes('send') || command.includes('pay') || 
        command.includes('transfer') || /\d+/.test(command)) {
      suggestions.push(
        'Try: "Send 5 DOT to Alice"',
        'Try: "Pay 10 WND to Bob"',
        'Try: "Transfer 2.5 DOT to Charlie"'
      );
    }

    // Query suggestions
    if (command.includes('balance') || command.includes('check') || 
        command.includes('show') || command.includes('what')) {
      suggestions.push(
        'Try: "What\'s my balance?"',
        'Try: "Show transaction history"',
        'Try: "Check network status"'
      );
    }

    // Contact suggestions
    if (command.includes('contact') || command.includes('add') || 
        command.includes('list')) {
      suggestions.push(
        'Try: "Add contact Alice"',
        'Try: "Show my contacts"',
        'Try: "Remove contact Bob"'
      );
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push(
        'Try: "Send 5 DOT to Alice"',
        'Try: "What\'s my balance?"',
        'Try: "Show my contacts"',
        'Try: "Open settings"'
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  public getCommandSummary(command: ParsedCommand): string {
    switch (command.type) {
      case 'payment':
        return `Send ${command.amount} ${command.currency} to ${command.recipient}`;
      case 'contact':
        return `${command.action} contact ${command.recipient || ''}`.trim();
      case 'query':
        return `Show ${command.action}`;
      case 'settings':
        return `${command.action} settings`;
      default:
        return 'Unknown command';
    }
  }

  public getSuggestions(command: string): string {
    const suggestions = this.generateSuggestions(command);
    return `I didn't understand that command. ${suggestions.join(', ')}`;
  }

  // Add more contacts dynamically
  public addContact(name: string, address: string): void {
    this.contacts.set(name.toLowerCase(), address);
  }

  // Remove contacts
  public removeContact(name: string): boolean {
    return this.contacts.delete(name.toLowerCase());
  }

  // Get all contacts
  public getContacts(): Array<{name: string; address: string}> {
    return Array.from(this.contacts.entries()).map(([name, address]) => ({
      name,
      address
    }));
  }
}

export default new CommandParsingService();

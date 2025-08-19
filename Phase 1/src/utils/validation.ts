import { isValidAddress } from './addressUtils'
import { parseAmount } from './formatters'
import { TRANSACTION, VOICE_COMMANDS } from './constants'
import type { VoiceCommand, VoiceAction, TransactionPreview, NetworkType } from './types'

/**
 * Validates a transaction amount
 */
export function validateAmount(
  amount: string,
  maxAmount?: string,
  decimals: number = 12
): { isValid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' }
  }

  // Remove commas and whitespace
  const cleaned = amount.replace(/[,\s]/g, '')
  
  // Check for valid number format
  if (!/^\d*\.?\d*$/.test(cleaned)) {
    return { isValid: false, error: 'Invalid amount format' }
  }

  const num = parseFloat(cleaned)

  // Check for positive number
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' }
  }

  // Check minimum amount
  const minAmount = parseFloat(TRANSACTION.MIN_AMOUNT)
  if (num < minAmount) {
    return { isValid: false, error: `Amount must be at least ${minAmount}` }
  }

  // Check maximum amount
  if (maxAmount) {
    const max = parseFloat(maxAmount)
    if (num > max) {
      return { isValid: false, error: `Amount exceeds maximum of ${maxAmount}` }
    }
  }

  // Check decimal places
  const decimalPlaces = cleaned.includes('.') ? cleaned.split('.')[1].length : 0
  if (decimalPlaces > decimals) {
    return { isValid: false, error: `Maximum ${decimals} decimal places allowed` }
  }

  return { isValid: true }
}

/**
 * Validates a recipient address
 */
export function validateRecipient(
  recipient: string,
  network?: NetworkType
): { isValid: boolean; error?: string } {
  if (!recipient || recipient.trim() === '') {
    return { isValid: false, error: 'Recipient address is required' }
  }

  const trimmed = recipient.trim()

  if (!isValidAddress(trimmed)) {
    return { isValid: false, error: 'Invalid recipient address format' }
  }

  // Additional network-specific validation could go here
  if (network) {
    // For now, we'll accept any valid SS58 address
    // In the future, we could validate network-specific formats
  }

  return { isValid: true }
}

/**
 * Validates a complete transaction
 */
export function validateTransaction(
  transaction: Partial<TransactionPreview>,
  maxAmount?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Validate amount
  if (transaction.amount) {
    const amountValidation = validateAmount(transaction.amount, maxAmount)
    if (!amountValidation.isValid && amountValidation.error) {
      errors.amount = amountValidation.error
    }
  } else {
    errors.amount = 'Amount is required'
  }

  // Validate recipient
  if (transaction.to) {
    const recipientValidation = validateRecipient(transaction.to, transaction.network)
    if (!recipientValidation.isValid && recipientValidation.error) {
      errors.to = recipientValidation.error
    }
  } else {
    errors.to = 'Recipient address is required'
  }

  // Validate sender (if provided)
  if (transaction.from && !isValidAddress(transaction.from)) {
    errors.from = 'Invalid sender address'
  }

  // Validate network
  if (!transaction.network) {
    errors.network = 'Network is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates voice command text and extracts structured data
 */
export function validateAndParseVoiceCommand(text: string): VoiceCommand {
  const timestamp = Date.now()
  const cleanText = text.trim().toLowerCase()

  // Default command structure
  let command: VoiceCommand = {
    action: 'unknown',
    rawText: text,
    confidence: 0.8, // Default confidence
    timestamp
  }

  // Test send/transfer patterns
  for (const pattern of VOICE_COMMANDS.SEND_PATTERNS) {
    const match = cleanText.match(pattern)
    if (match) {
      const [, amount, currency, recipient] = match
      command = {
        ...command,
        action: 'send',
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        recipient: recipient.trim(),
        confidence: 0.9
      }
      break
    }
  }

  // Test balance patterns
  if (command.action === 'unknown') {
    for (const pattern of VOICE_COMMANDS.BALANCE_PATTERNS) {
      if (pattern.test(cleanText)) {
        command = {
          ...command,
          action: 'balance',
          confidence: 0.95
        }
        break
      }
    }
  }

  // Test history patterns
  if (command.action === 'unknown') {
    for (const pattern of VOICE_COMMANDS.HISTORY_PATTERNS) {
      if (pattern.test(cleanText)) {
        command = {
          ...command,
          action: 'history',
          confidence: 0.9
        }
        break
      }
    }
  }

  // Test help patterns
  if (command.action === 'unknown') {
    for (const pattern of VOICE_COMMANDS.HELP_PATTERNS) {
      if (pattern.test(cleanText)) {
        command = {
          ...command,
          action: 'help',
          confidence: 0.95
        }
        break
      }
    }
  }

  // Test cancel patterns
  if (command.action === 'unknown') {
    for (const pattern of VOICE_COMMANDS.CANCEL_PATTERNS) {
      if (pattern.test(cleanText)) {
        command = {
          ...command,
          action: 'cancel',
          confidence: 0.95
        }
        break
      }
    }
  }

  return command
}

/**
 * Validates voice command completeness and correctness
 */
export function validateVoiceCommand(command: VoiceCommand): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check confidence threshold
  if (command.confidence < 0.7) {
    errors.push('Voice recognition confidence too low')
  }

  // Validate send/transfer commands
  if (command.action === 'send' || command.action === 'transfer') {
    if (!command.amount || command.amount <= 0) {
      errors.push('Valid amount is required for send command')
    }

    if (!command.currency) {
      errors.push('Currency is required for send command')
    }

    if (!command.recipient) {
      errors.push('Recipient is required for send command')
    } else {
      const recipientValidation = validateRecipient(command.recipient)
      if (!recipientValidation.isValid && recipientValidation.error) {
        errors.push(`Invalid recipient: ${recipientValidation.error}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates network connectivity and configuration
 */
export function validateNetworkConfig(network: NetworkType): { isValid: boolean; error?: string } {
  // This would typically check network connectivity, but for now just validates config exists
  const networks = ['polkadot', 'westend', 'rococo', 'local']
  
  if (!networks.includes(network)) {
    return { isValid: false, error: 'Unsupported network' }
  }

  return { isValid: true }
}

/**
 * Validates wallet account
 */
export function validateWalletAccount(account: any): { isValid: boolean; error?: string } {
  if (!account) {
    return { isValid: false, error: 'Account is required' }
  }

  if (!account.address) {
    return { isValid: false, error: 'Account address is required' }
  }

  if (!isValidAddress(account.address)) {
    return { isValid: false, error: 'Invalid account address' }
  }

  return { isValid: true }
}

/**
 * Validates form input data
 */
export function validateFormData<T>(
  data: Record<string, any>,
  rules: Record<keyof T, {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    validator?: (value: any) => boolean
    message?: string
  }>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    const fieldKey = field as keyof T

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[fieldKey] = rule.message || `${String(field)} is required`
      continue
    }

    // Skip other validations if field is empty and not required
    if (!value) continue

    const stringValue = value.toString()

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors[fieldKey] = rule.message || `${String(field)} must be at least ${rule.minLength} characters`
      continue
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors[fieldKey] = rule.message || `${String(field)} must be at most ${rule.maxLength} characters`
      continue
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors[fieldKey] = rule.message || `${String(field)} format is invalid`
      continue
    }

    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      errors[fieldKey] = rule.message || `${String(field)} is invalid`
      continue
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates environment configuration
 */
export function validateEnvironment(): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check for required browser APIs
  if (!window.speechRecognition && !window.webkitSpeechRecognition) {
    warnings.push('Speech recognition not supported in this browser')
  }

  if (!window.speechSynthesis) {
    warnings.push('Speech synthesis not supported in this browser')
  }

  // Check for secure context (required for some APIs)
  if (!window.isSecureContext) {
    warnings.push('Secure context (HTTPS) required for full functionality')
  }

  // Check for localStorage availability
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
  } catch (e) {
    warnings.push('Local storage not available')
  }

  return {
    isValid: warnings.length === 0,
    warnings
  }
}

/**
 * Sanitizes user input to prevent XSS and other attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[match] || match
    })
}

/**
 * Validates URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates hex string
 */
export function validateHex(hex: string, length?: number): boolean {
  if (!hex.startsWith('0x')) return false
  
  const hexPart = hex.slice(2)
  const hexRegex = /^[a-fA-F0-9]+$/
  
  if (!hexRegex.test(hexPart)) return false
  
  if (length && hexPart.length !== length) return false
  
  return true
}

/**
 * Validates JSON string
 */
export function validateJSON(json: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(json)
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON'
    }
  }
}
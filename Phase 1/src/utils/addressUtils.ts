import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util'
import { ADDRESS_PATTERNS, NETWORKS } from './constants'
import type { NetworkType } from './types'

/**
 * Validates if a string is a valid Polkadot address
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  try {
    // Try to decode the address
    decodeAddress(address)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Validates if an address is valid for a specific network
 */
export function isValidAddressForNetwork(address: string, network: NetworkType): boolean {
  if (!isValidAddress(address)) {
    return false
  }

  try {
    const decoded = decodeAddress(address)
    const networkConfig = NETWORKS[network]
    const reencoded = encodeAddress(decoded, networkConfig.ss58Format)
    return reencoded === address
  } catch (error) {
    return false
  }
}

/**
 * Converts an address to the format for a specific network
 */
export function convertAddressForNetwork(address: string, network: NetworkType): string {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address')
  }

  try {
    const decoded = decodeAddress(address)
    const networkConfig = NETWORKS[network]
    return encodeAddress(decoded, networkConfig.ss58Format)
  } catch (error) {
    throw new Error(`Failed to convert address for network ${network}`)
  }
}

/**
 * Shortens an address for display purposes
 */
export function shortenAddress(address: string, length: number = 6): string {
  if (!address) return ''
  
  if (address.length <= length * 2 + 3) {
    return address
  }

  return `${address.slice(0, length)}...${address.slice(-length)}`
}

/**
 * Formats an address for display with network-specific styling
 */
export function formatAddressForDisplay(
  address: string, 
  network?: NetworkType,
  shorten: boolean = true
): string {
  if (!address) return ''

  let formattedAddress = address
  
  if (network) {
    try {
      formattedAddress = convertAddressForNetwork(address, network)
    } catch (error) {
      // If conversion fails, use original address
      console.warn('Address conversion failed:', error)
    }
  }

  return shorten ? shortenAddress(formattedAddress) : formattedAddress
}

/**
 * Extracts address from various input formats (includes contact names, etc.)
 */
export function extractAddress(input: string): string {
  if (!input) return ''

  const trimmed = input.trim()

  // Check if it's already a valid address
  if (isValidAddress(trimmed)) {
    return trimmed
  }

  // Try to extract address from longer text
  // Look for SS58 address pattern
  const ss58Match = trimmed.match(/[1-9A-HJ-NP-Za-km-z]{47,48}/)
  if (ss58Match && isValidAddress(ss58Match[0])) {
    return ss58Match[0]
  }

  // Look for hex address pattern  
  const hexMatch = trimmed.match(/0x[a-fA-F0-9]{64}/)
  if (hexMatch) {
    try {
      // Convert hex to SS58
      const decoded = hexToU8a(hexMatch[0])
      return encodeAddress(decoded)
    } catch (error) {
      console.warn('Failed to convert hex address:', error)
    }
  }

  return trimmed
}

/**
 * Validates address format patterns
 */
export function validateAddressFormat(address: string): {
  isValid: boolean
  format: 'ss58' | 'hex' | 'unknown'
  network?: NetworkType
} {
  if (!address) {
    return { isValid: false, format: 'unknown' }
  }

  // Check SS58 format
  if (ADDRESS_PATTERNS.SS58.test(address)) {
    // Try to determine network from SS58 prefix
    let detectedNetwork: NetworkType | undefined

    if (address.startsWith('1')) {
      detectedNetwork = 'polkadot'
    } else if (address.startsWith('5')) {
      // Could be Westend, Rococo, or local - we'll default to Westend
      detectedNetwork = 'westend'
    }

    return {
      isValid: isValidAddress(address),
      format: 'ss58',
      network: detectedNetwork
    }
  }

  // Check hex format
  if (ADDRESS_PATTERNS.HEX.test(address)) {
    return {
      isValid: isHex(address) && address.length === 66,
      format: 'hex'
    }
  }

  return { isValid: false, format: 'unknown' }
}

/**
 * Normalizes address input from user (handles common mistakes)
 */
export function normalizeAddress(input: string): string {
  if (!input) return ''

  let normalized = input.trim()

  // Remove common prefixes users might add
  normalized = normalized.replace(/^(polkadot:|dot:|substrate:)/i, '')

  // Handle copy-paste artifacts (extra spaces, line breaks)
  normalized = normalized.replace(/\s+/g, ' ').trim()

  // Extract actual address if embedded in text
  normalized = extractAddress(normalized)

  return normalized
}

/**
 * Gets the SS58 prefix for an address
 */
export function getAddressPrefix(address: string): number | null {
  try {
    const decoded = decodeAddress(address)
    // The first byte contains the SS58 format
    return decoded[0]
  } catch (error) {
    return null
  }
}

/**
 * Determines the network from an address
 */
export function getNetworkFromAddress(address: string): NetworkType | null {
  if (!isValidAddress(address)) {
    return null
  }

  // Check if it's a Polkadot mainnet address (starts with 1)
  if (address.startsWith('1')) {
    return 'polkadot'
  }

  // For other networks, we can't reliably determine from address alone
  // since Westend, Rococo, and local all use SS58 format 42
  // Return the default testnet
  return 'westend'
}

/**
 * Creates a contact-friendly name from an address
 */
export function createContactName(address: string, existingName?: string): string {
  if (existingName) return existingName

  // Create a readable name from address
  const prefix = getNetworkFromAddress(address)
  const shortAddr = shortenAddress(address, 4)
  
  return `${prefix ? NETWORKS[prefix].currency : 'Unknown'} Account (${shortAddr})`
}

/**
 * Validates multiple addresses at once
 */
export function validateAddresses(addresses: string[]): {
  valid: string[]
  invalid: string[]
  results: Array<{ address: string; isValid: boolean; error?: string }>
} {
  const valid: string[] = []
  const invalid: string[] = []
  const results: Array<{ address: string; isValid: boolean; error?: string }> = []

  addresses.forEach(address => {
    const normalized = normalizeAddress(address)
    
    if (isValidAddress(normalized)) {
      valid.push(normalized)
      results.push({ address: normalized, isValid: true })
    } else {
      invalid.push(address)
      results.push({ 
        address, 
        isValid: false, 
        error: 'Invalid address format' 
      })
    }
  })

  return { valid, invalid, results }
}

/**
 * Checks if two addresses are the same across different formats
 */
export function addressesEqual(addr1: string, addr2: string): boolean {
  if (!addr1 || !addr2) return false
  if (addr1 === addr2) return true

  try {
    const decoded1 = decodeAddress(addr1)
    const decoded2 = decodeAddress(addr2)
    return u8aToHex(decoded1) === u8aToHex(decoded2)
  } catch (error) {
    return false
  }
}

/**
 * Generates a QR code data string for an address
 */
export function generateAddressQRData(
  address: string, 
  network?: NetworkType,
  amount?: string
): string {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address for QR code generation')
  }

  let qrData = address

  // Add network prefix if specified
  if (network) {
    const networkConfig = NETWORKS[network]
    qrData = `${networkConfig.currency.toLowerCase()}:${address}`
  }

  // Add amount if specified
  if (amount) {
    qrData += `?amount=${amount}`
  }

  return qrData
}

/**
 * Parses a QR code data string to extract address and metadata
 */
export function parseAddressQRData(qrData: string): {
  address: string
  network?: NetworkType
  amount?: string
} {
  if (!qrData) {
    throw new Error('Empty QR data')
  }

  // Handle simple address
  if (isValidAddress(qrData)) {
    return { address: qrData }
  }

  // Parse formatted QR data
  const urlPattern = /^(\w+):([1-9A-HJ-NP-Za-km-z]{47,48})(\?(.+))?$/
  const match = qrData.match(urlPattern)

  if (!match) {
    throw new Error('Invalid QR code format')
  }

  const [, currency, address, , queryString] = match
  
  if (!isValidAddress(address)) {
    throw new Error('Invalid address in QR code')
  }

  const result: { address: string; network?: NetworkType; amount?: string } = { address }

  // Determine network from currency
  const network = Object.entries(NETWORKS).find(
    ([, config]) => config.currency.toLowerCase() === currency.toLowerCase()
  )?.[0] as NetworkType

  if (network) {
    result.network = network
  }

  // Parse query parameters
  if (queryString) {
    const params = new URLSearchParams(queryString)
    const amount = params.get('amount')
    if (amount) {
      result.amount = amount
    }
  }

  return result
}
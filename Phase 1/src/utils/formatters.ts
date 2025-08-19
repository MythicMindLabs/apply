import { formatBalance, BN } from '@polkadot/util'
import { NETWORKS, CURRENCY_SYMBOLS } from './constants'
import type { NetworkType } from './types'

/**
 * Formats a balance amount for display
 */
export function formatAmount(
  amount: string | number | BN,
  decimals: number = 12,
  showSymbol: boolean = true,
  precision: number = 4
): string {
  if (!amount) return '0'

  try {
    const bn = new BN(amount.toString())
    const formatted = formatBalance(bn, { 
      decimals, 
      withUnit: false,
      forceUnit: '-'
    })

    // Parse the formatted string to handle precision
    const num = parseFloat(formatted.replace(/,/g, ''))
    const truncated = num.toFixed(precision).replace(/\.?0+$/, '')
    
    // Add thousand separators
    const parts = truncated.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    return showSymbol ? `${parts.join('.')}` : parts.join('.')
  } catch (error) {
    console.warn('Failed to format amount:', error)
    return '0'
  }
}

/**
 * Formats a balance with currency symbol
 */
export function formatBalance(
  amount: string | number | BN,
  network: NetworkType,
  precision: number = 4,
  showFullPrecision: boolean = false
): string {
  const networkConfig = NETWORKS[network]
  const symbol = CURRENCY_SYMBOLS[networkConfig.currency as keyof typeof CURRENCY_SYMBOLS] || networkConfig.currency

  if (showFullPrecision) {
    const formatted = formatAmount(amount, networkConfig.decimals, false, networkConfig.decimals)
    return `${symbol} ${formatted}`
  }

  const formatted = formatAmount(amount, networkConfig.decimals, false, precision)
  return `${symbol} ${formatted}`
}

/**
 * Formats a USD value
 */
export function formatUSD(amount: number, precision: number = 2): string {
  if (!amount || isNaN(amount)) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(amount)
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, precision: number = 2): string {
  if (!value || isNaN(value)) return '0%'
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value / 100)
}

/**
 * Parses user input amount to smallest unit (planck)
 */
export function parseAmount(input: string, decimals: number = 12): BN {
  if (!input || input === '0') {
    return new BN(0)
  }

  // Remove any non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '')
  
  if (!cleaned || cleaned === '.') {
    return new BN(0)
  }

  // Handle decimal places
  const parts = cleaned.split('.')
  const whole = parts[0] || '0'
  const fraction = parts[1] || ''

  // Limit decimal places to network decimals
  const limitedFraction = fraction.slice(0, decimals)
  
  // Pad fraction to full decimals
  const paddedFraction = limitedFraction.padEnd(decimals, '0')
  
  // Combine whole and fraction parts
  const combined = whole + paddedFraction
  
  return new BN(combined)
}

/**
 * Validates if an amount string is valid
 */
export function isValidAmount(input: string, maxAmount?: string): boolean {
  if (!input) return false
  
  // Check for valid number format
  const numRegex = /^\d+\.?\d*$/
  if (!numRegex.test(input.replace(/,/g, ''))) {
    return false
  }
  
  const num = parseFloat(input.replace(/,/g, ''))
  
  // Check for positive number
  if (num <= 0) return false
  
  // Check maximum if provided
  if (maxAmount) {
    const max = parseFloat(maxAmount)
    if (num > max) return false
  }
  
  return true
}

/**
 * Formats a timestamp to human readable format
 */
export function formatTimestamp(timestamp: number, format: 'relative' | 'absolute' = 'relative'): string {
  const date = new Date(timestamp)
  
  if (format === 'absolute') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }
  
  // Relative time formatting
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else {
    return formatTimestamp(timestamp, 'absolute')
  }
}

/**
 * Formats a duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Formats a block number with network context
 */
export function formatBlockNumber(blockNumber: number, network?: NetworkType): string {
  if (!blockNumber) return 'Unknown'
  
  const formatted = new Intl.NumberFormat('en-US').format(blockNumber)
  
  if (network) {
    const networkName = NETWORKS[network].displayName
    return `#${formatted} (${networkName})`
  }
  
  return `#${formatted}`
}

/**
 * Formats a transaction hash
 */
export function formatTransactionHash(hash: string, length: number = 12): string {
  if (!hash) return 'Unknown'
  
  if (hash.length <= length * 2 + 3) {
    return hash
  }
  
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}

/**
 * Formats file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Formats a network name for display
 */
export function formatNetworkName(network: NetworkType, short: boolean = false): string {
  const config = NETWORKS[network]
  
  if (short) {
    return config.currency
  }
  
  return config.displayName
}

/**
 * Formats transaction fee
 */
export function formatFee(
  fee: string | number | BN,
  network: NetworkType,
  includeUSD: boolean = false,
  usdPrice?: number
): string {
  const feeFormatted = formatBalance(fee, network, 6)
  
  if (includeUSD && usdPrice) {
    const networkConfig = NETWORKS[network]
    const feeNum = parseFloat(formatAmount(fee, networkConfig.decimals, false, 6))
    const usdValue = feeNum * usdPrice
    return `${feeFormatted} (${formatUSD(usdValue)})`
  }
  
  return feeFormatted
}

/**
 * Formats a large number with appropriate suffixes
 */
export function formatLargeNumber(num: number, precision: number = 1): string {
  if (!num) return '0'
  
  const suffixes = ['', 'K', 'M', 'B', 'T']
  const tier = Math.log10(Math.abs(num)) / 3 | 0
  
  if (tier === 0) return num.toString()
  
  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = num / scale
  
  return scaled.toFixed(precision) + suffix
}

/**
 * Formats a confidence score as percentage
 */
export function formatConfidence(confidence: number): string {
  return formatPercentage(confidence * 100, 0)
}

/**
 * Formats voice recognition result
 */
export function formatVoiceResult(transcript: string, confidence: number): string {
  const confidencePercent = formatConfidence(confidence)
  return `"${transcript}" (${confidencePercent} confidence)`
}

/**
 * Formats error messages for user display
 */
export function formatError(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.toString) {
    return error.toString()
  }
  
  return 'Unknown error occurred'
}

/**
 * Formats API response time
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Formats account name for display
 */
export function formatAccountName(account: { meta?: { name?: string } }, fallback: string = 'Unnamed Account'): string {
  return account.meta?.name || fallback
}

/**
 * Formats multiple values as a range
 */
export function formatRange(min: number, max: number, unit?: string): string {
  const unitSuffix = unit ? ` ${unit}` : ''
  
  if (min === max) {
    return `${min}${unitSuffix}`
  }
  
  return `${min} - ${max}${unitSuffix}`
}

/**
 * Capitalizes first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Formats boolean as Yes/No
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No'
}

/**
 * Formats array as comma-separated list
 */
export function formatList(items: string[], limit?: number): string {
  if (!items.length) return 'None'
  
  const displayItems = limit ? items.slice(0, limit) : items
  const formatted = displayItems.join(', ')
  
  if (limit && items.length > limit) {
    return `${formatted}, and ${items.length - limit} more`
  }
  
  return formatted
}
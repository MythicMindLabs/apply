/// <reference types="vite/client" />

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
    speechRecognition: any
  }
}

interface ImportMetaEnv {
  readonly VITE_POLKADOT_WS_URL: string
  readonly VITE_WESTEND_WS_URL: string
  readonly VITE_ROCOCO_WS_URL: string
  readonly VITE_LOCAL_WS_URL: string
  readonly VITE_DEFAULT_NETWORK: string
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_ELEVENLABS_VOICE_ID: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_ENABLE_VOICE_SYNTHESIS: string
  readonly VITE_ENABLE_TRANSACTION_HISTORY: string
  readonly VITE_ENABLE_CROSS_CHAIN: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ANALYTICS_ENABLED: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
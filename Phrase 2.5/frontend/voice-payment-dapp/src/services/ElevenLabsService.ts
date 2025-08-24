// Enhanced ElevenLabs TTS Service for EchoPay-2
class ElevenLabsService {
  private apiKey: string | null;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private isAvailable: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || null;
    this.isAvailable = !!this.apiKey;
  }

  public isServiceAvailable(): boolean {
    return this.isAvailable && import.meta.env.VITE_MOCK_MODE !== 'true';
  }

  public async speak(text: string, voiceId: string = 'Rachel'): Promise<void> {
    // In mock mode, use browser TTS
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      return this.fallbackToWebSpeech(text);
    }

    if (!this.isServiceAvailable()) {
      console.warn('ElevenLabs not available, falling back to Web Speech API');
      return this.fallbackToWebSpeech(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey!
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            this.fallbackToWebSpeech(text).then(resolve).catch(reject);
          };
          audio.play();
        });
      } else {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      return this.fallbackToWebSpeech(text);
    }
  }

  private async fallbackToWebSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        speechSynthesis.speak(utterance);
      } else {
        console.log('Would speak:', text);
        setTimeout(resolve, 1000);
      }
    });
  }

  public async getVoices(): Promise<any[]> {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      return [
        { voice_id: 'rachel', name: 'Rachel' },
        { voice_id: 'adam', name: 'Adam' },
        { voice_id: 'antoni', name: 'Antoni' }
      ];
    }

    if (!this.isServiceAvailable()) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey!
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.voices || [];
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }

    return [];
  }
}

export default new ElevenLabsService();

export type VoiceState = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: number;
}

export interface ChatResponse {
  transcript: string;
  response: string;
  audioUrl: string;
  timing: {
    stt_ms: number;
    llm_ms: number;
    tts_ms: number;
    total_ms: number;
  };
  requestId: string;
}

export interface ChatError {
  error: string;
  requestId: string;
}

export interface ErrorState {
  message: string;
  requestId: string;
}

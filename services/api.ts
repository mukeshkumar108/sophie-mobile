import { Config } from '@/constants/config';
import { ChatResponse, ChatError } from '@/types';

export class ApiError extends Error {
  requestId: string;
  statusCode: number;

  constructor(message: string, requestId: string, statusCode: number) {
    super(message);
    this.requestId = requestId;
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export async function sendAudioToSophie(
  audioUri: string,
  token: string
): Promise<ChatResponse> {
  const formData = new FormData();

  // Append audio file
  formData.append('audioBlob', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);

  // Append required fields
  formData.append('personaId', Config.PERSONA_ID);
  formData.append('language', Config.LANGUAGE);

  const response = await fetch(`${Config.API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ChatError;
    throw new ApiError(
      errorData.error || 'Unknown error',
      errorData.requestId || 'unknown',
      response.status
    );
  }

  return data as ChatResponse;
}

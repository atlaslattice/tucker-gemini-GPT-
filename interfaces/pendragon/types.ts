export enum Sender {
  User = 'USER',
  System = 'TUCKER_PENDRAGON'
}

export interface AlignmentMetrics {
  jedi: number; // 0-100
  sith: number; // 0-100
  grey: number; // 0-100
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  metrics?: AlignmentMetrics;
  reasoning?: string;
  timestamp: number;
}

export interface GeminiResponse {
  response: string;
  metrics: AlignmentMetrics;
  reasoning: string;
}
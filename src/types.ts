export enum ViewMode {
  TERMINAL = 'TERMINAL',
  ARCHITECTURE = 'ARCHITECTURE',
  MONITOR = 'MONITOR',
  CONFIG = 'CONFIG'
}

export interface Message {
  id: string;
  role: 'user' | 'system' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ModelConfig {
  vocabSize: number;
  modelDim: number;
  depth: number;
  numHeads: number;
  useCouncil: boolean;
  numExperts: number;
}

export interface SystemMetrics {
  memoryUsage: number;
  computeLoad: number;
  reversibleCache: number;
  activeExperts: number;
}
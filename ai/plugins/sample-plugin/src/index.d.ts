/**
 * Type Definitions for Sample Plugin
 */

export interface PluginConfig {
  maxTextLength?: number;
  enableCache?: boolean;
  cacheTTL?: number;
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface AnalysisResult {
  success: boolean;
  error?: string;
  text?: string;
  textLength?: number;
  analysis?: {
    wordCount?: number;
    charCount?: number;
    stats?: TextStats;
    keywords?: Keyword[];
  };
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  lineCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  readabilityScore: number;
}

export interface Keyword {
  word: string;
  frequency: number;
}

export interface KeywordExtractionResult {
  success: boolean;
  error?: string;
  keywords: Keyword[];
  totalWords: number;
  uniqueWords: number;
}

export interface SentimentResult {
  success: boolean;
  error?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  positiveWords?: number;
  negativeWords?: number;
}

export interface PluginMetadata {
  name: string;
  version: string;
  capabilities: string[];
  commands: string[];
}

export interface ExecutionParams {
  text: string;
  [key: string]: any;
}

export class TextAnalyzer {
  constructor(config?: PluginConfig);
  analyze(params: ExecutionParams): Promise<AnalysisResult>;
  extractKeywords(params: ExecutionParams & { topN?: number }): Promise<KeywordExtractionResult>;
  getSentiment(params: ExecutionParams): Promise<SentimentResult>;
  getStats(text: string): TextStats;
}

export class PluginManager {
  register(name: string, plugin: SamplePlugin): void;
  unregister(name: string): boolean;
  execute(name: string, command: string, params?: ExecutionParams): Promise<any>;
  getPlugin(name: string): SamplePlugin | undefined;
  listPlugins(): Array<{ name: string; metadata: PluginMetadata }>;
  on(event: string, callback: (data: any) => Promise<void>): void;
  off(event: string, callback: (data: any) => Promise<void>): void;
  emit(event: string, data: any): Promise<void>;
  initializeAll(): Promise<void>;
  shutdownAll(): Promise<void>;
}

export class SamplePlugin {
  constructor(config?: PluginConfig);
  initialize(): Promise<{ success: boolean; message: string }>;
  execute(command: string, params: ExecutionParams): Promise<any>;
  validate(params: ExecutionParams): Promise<ValidationResult>;
  getMetadata(): PluginMetadata;
  shutdown(): Promise<{ success: boolean }>;
}

export default SamplePlugin;

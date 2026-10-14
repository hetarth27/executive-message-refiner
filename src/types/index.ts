export type AudienceType = 'boss' | 'client' | 'peer' | 'team' | 'vendor' | 'custom';

export type ToneType = 
  | 'executive' 
  | 'diplomatic' 
  | 'assertive' 
  | 'friendly' 
  | 'urgent' 
  | 'persuasive' 
  | 'concise';

export type FormatType = 
  | 'normal_discussion' // Simple & natural conversation
  | 'email' 
  | 'chat' // Slack / Teams
  | 'status_update' 
  | 'pushback' // Saying No / Boundary
  | 'meeting_request'
  | 'follow_up';

export type ModelProvider = 'mock' | 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export interface PersonaRule {
  id: string;
  title: string;
  rule: string;
  enabled: boolean;
}

export interface AppSettings {
  provider: ModelProvider;
  apiKey: string;
  selectedModel: string;
  customEndpoint?: string;
  userTitle?: string;
  userName?: string;
  systemPersonaInstructions?: string;
  rules: PersonaRule[];
  theme: 'light' | 'dark' | 'system';
}

export interface KeyImprovement {
  type: 'grammar' | 'tone' | 'brevity' | 'structure' | 'clarity';
  description: string;
  originalSnippet?: string;
  improvedSnippet?: string;
}

export interface RefinementResult {
  id: string;
  timestamp: number;
  originalText: string;
  refinedText: string;
  subjectLine?: string;
  audience: AudienceType;
  tone: ToneType;
  format: FormatType;
  executiveSummary: string;
  improvements: KeyImprovement[];
  wordCountOriginal: number;
  wordCountRefined: number;
  clarityScore: number; // 0-100
  formalityScore: number; // 0-100
  isFavorite?: boolean;
}

export interface ExampleDraft {
  id: string;
  title: string;
  audience: AudienceType;
  tone: ToneType;
  format: FormatType;
  draft: string;
}


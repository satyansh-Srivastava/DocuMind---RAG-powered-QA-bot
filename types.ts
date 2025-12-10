export interface UserDetails {
  domain: string;
  industry: string;
  role: string;
  docTitle: string;
  docTopic: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ParsedDocument {
  fullText: string;
  toc: string[];
}

export enum AppStep {
  ONBOARDING = 'ONBOARDING',
  PARSING = 'PARSING',
  ASSURANCE = 'ASSURANCE',
  CHAT = 'CHAT'
}

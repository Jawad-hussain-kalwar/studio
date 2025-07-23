export interface ShowcaseTag {
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

export interface ShowcaseApplication {
  id: string;
  title: string;
  description: string;
  icon: string; // URL or icon identifier
  category: ShowcaseCategory;
  tags: ShowcaseTag[];
  demoUrl?: string;
  sourceUrl?: string;
  apiEndpoints: string[];
  featured?: boolean;
}

export type ShowcaseCategory = 
  | 'text-generation'
  | 'image-generation' 
  | 'audio-generation'
  | 'code-generation'
  | 'data-analysis'
  | 'conversation'
  | 'creative'
  | 'productivity'
  | 'game'
  | 'education';

export interface ShowcaseFilter {
  category: ShowcaseCategory | 'all';
  label: string;
  count?: number;
}

export interface ShowcaseData {
  applications: ShowcaseApplication[];
  categories: ShowcaseFilter[];
  featuredApps: string[]; // IDs of featured applications
} 
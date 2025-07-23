import type { ShowcaseData, ShowcaseApplication, ShowcaseFilter } from '../types/showcase';

const showcaseApplications: ShowcaseApplication[] = [
  {
    id: 'chat-assistant',
    title: 'Intelligent Chat Assistant',
    description: 'A conversational AI that provides helpful responses across various topics with context awareness and multi-turn dialogue capabilities.',
    icon: '/assets/img/ui/chat-icon.png',
    category: 'conversation',
    tags: [
      { label: 'Chat API', color: 'primary' },
      { label: 'Streaming', color: 'info' },
      { label: 'Context Aware', color: 'success' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: true
  },
  {
    id: 'creative-writer',
    title: 'Creative Content Generator',
    description: 'Generate engaging blog posts, stories, and marketing copy with customizable tone, style, and length parameters.',
    icon: '/assets/img/ui/writing-icon.png',
    category: 'creative',
    tags: [
      { label: 'Text Generation', color: 'primary' },
      { label: 'Creative Writing', color: 'secondary' },
      { label: 'Marketing', color: 'warning' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: true
  },
  {
    id: 'code-reviewer',
    title: 'AI Code Reviewer',
    description: 'Automated code review system that analyzes code quality, suggests improvements, and identifies potential bugs or security issues.',
    icon: '/assets/img/ui/code-icon.png',
    category: 'code-generation',
    tags: [
      { label: 'Code Analysis', color: 'info' },
      { label: 'Security', color: 'error' },
      { label: 'Best Practices', color: 'success' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: false
  },
  {
    id: 'image-describer',
    title: 'Visual Content Analyzer',
    description: 'Upload images and get detailed descriptions, object detection, and content analysis using advanced computer vision.',
    icon: '/assets/img/ui/vision-icon.png',
    category: 'image-generation',
    tags: [
      { label: 'Vision API', color: 'primary' },
      { label: 'Object Detection', color: 'info' },
      { label: 'Content Analysis', color: 'secondary' }
    ],
    apiEndpoints: ['/v1/vision/analyze'],
    featured: true
  },
  {
    id: 'language-tutor',
    title: 'Language Learning Assistant',
    description: 'Interactive language learning tool with conversation practice, grammar correction, and vocabulary building exercises.',
    icon: '/assets/img/ui/language-icon.png',
    category: 'education',
    tags: [
      { label: 'Education', color: 'success' },
      { label: 'Language Learning', color: 'info' },
      { label: 'Interactive', color: 'secondary' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: false
  },
  {
    id: 'data-analyst',
    title: 'Business Intelligence Dashboard',
    description: 'Transform raw business data into actionable insights with natural language queries and automated report generation.',
    icon: '/assets/img/ui/analytics-icon.png',
    category: 'data-analysis',
    tags: [
      { label: 'Data Analysis', color: 'primary' },
      { label: 'Business Intelligence', color: 'warning' },
      { label: 'Automation', color: 'success' }
    ],
    apiEndpoints: ['/v1/chat/completions', '/v1/data/analyze'],
    featured: true
  },
  {
    id: 'productivity-coach',
    title: 'Personal Productivity Coach',
    description: 'AI-powered productivity assistant that helps plan schedules, prioritize tasks, and optimize workflow efficiency.',
    icon: '/assets/img/ui/productivity-icon.png',
    category: 'productivity',
    tags: [
      { label: 'Productivity', color: 'success' },
      { label: 'Task Management', color: 'info' },
      { label: 'Optimization', color: 'primary' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: false
  },
  {
    id: 'story-game',
    title: 'Interactive Story Adventure',
    description: 'Dynamic storytelling game where player choices influence the narrative direction using AI-generated content.',
    icon: '/assets/img/ui/game-icon.png',
    category: 'game',
    tags: [
      { label: 'Interactive Fiction', color: 'secondary' },
      { label: 'Gaming', color: 'primary' },
      { label: 'Dynamic Content', color: 'info' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: true
  },
  {
    id: 'music-composer',
    title: 'AI Music Composition Tool',
    description: 'Create original music compositions by describing style, mood, and instruments using natural language prompts.',
    icon: '/assets/img/ui/music-icon.png',
    category: 'audio-generation',
    tags: [
      { label: 'Music Generation', color: 'primary' },
      { label: 'Audio API', color: 'info' },
      { label: 'Creative', color: 'secondary' }
    ],
    apiEndpoints: ['/v1/audio/generate'],
    featured: false
  },
  {
    id: 'api-documentation',
    title: 'Smart API Documentation',
    description: 'Automatically generate comprehensive API documentation from code with examples, usage patterns, and best practices.',
    icon: '/assets/img/ui/docs-icon.png',
    category: 'code-generation',
    tags: [
      { label: 'Documentation', color: 'info' },
      { label: 'API Design', color: 'primary' },
      { label: 'Automation', color: 'success' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: false
  },
  {
    id: 'brand-voice',
    title: 'Brand Voice Consistency Tool',
    description: 'Maintain consistent brand voice across all communications by analyzing and adapting content to match your brand guidelines.',
    icon: '/assets/img/ui/brand-icon.png',
    category: 'creative',
    tags: [
      { label: 'Brand Management', color: 'warning' },
      { label: 'Content Strategy', color: 'primary' },
      { label: 'Consistency', color: 'success' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: true
  },
  {
    id: 'research-assistant',
    title: 'Academic Research Helper',
    description: 'Assist with academic research by summarizing papers, generating citations, and identifying research gaps in literature.',
    icon: '/assets/img/ui/research-icon.png',
    category: 'education',
    tags: [
      { label: 'Research', color: 'info' },
      { label: 'Academic', color: 'primary' },
      { label: 'Literature Review', color: 'secondary' }
    ],
    apiEndpoints: ['/v1/chat/completions'],
    featured: false
  }
];

const showcaseCategories: ShowcaseFilter[] = [
  { category: 'all', label: 'All Applications', count: showcaseApplications.length },
  { category: 'conversation', label: 'Conversation', count: showcaseApplications.filter(app => app.category === 'conversation').length },
  { category: 'creative', label: 'Creative', count: showcaseApplications.filter(app => app.category === 'creative').length },
  { category: 'code-generation', label: 'Code Generation', count: showcaseApplications.filter(app => app.category === 'code-generation').length },
  { category: 'image-generation', label: 'Image & Vision', count: showcaseApplications.filter(app => app.category === 'image-generation').length },
  { category: 'data-analysis', label: 'Data Analysis', count: showcaseApplications.filter(app => app.category === 'data-analysis').length },
  { category: 'education', label: 'Education', count: showcaseApplications.filter(app => app.category === 'education').length },
  { category: 'productivity', label: 'Productivity', count: showcaseApplications.filter(app => app.category === 'productivity').length },
  { category: 'game', label: 'Gaming', count: showcaseApplications.filter(app => app.category === 'game').length },
  { category: 'audio-generation', label: 'Audio', count: showcaseApplications.filter(app => app.category === 'audio-generation').length }
];

const featuredApps = showcaseApplications
  .filter(app => app.featured)
  .map(app => app.id);

export const showcaseData: ShowcaseData = {
  applications: showcaseApplications,
  categories: showcaseCategories,
  featuredApps
};

export default showcaseData; 
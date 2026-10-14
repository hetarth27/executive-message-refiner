import { AudienceType, ToneType, FormatType, PersonaRule } from '../types';

export interface AudienceOption {
  id: AudienceType;
  label: string;
  iconName: string;
  subtitle: string;
  description: string;
  coreRule: string;
}

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    id: 'boss',
    label: 'Boss / C-Suite',
    iconName: 'Crown',
    subtitle: 'High stakes, high brevity',
    description: 'Prioritizes Bottom-Line-Up-Front (BLUF), decisions needed, and impact on business objectives.',
    coreRule: 'Put the recommendation/conclusion first. Eliminate filler words and over-explanations. State exactly what decision or awareness is needed and by when.'
  },
  {
    id: 'client',
    label: 'Client / Customer',
    iconName: 'Briefcase',
    subtitle: 'Reassuring & value-focused',
    description: 'High empathy, confidence, and deliverable-focused. Avoids internal jargon.',
    coreRule: 'Maintain polished professionalism, reassure on value and timelines, avoid defensive language, and frame obstacles as clear solutions.'
  },
  {
    id: 'peer',
    label: 'Cross-functional Peer',
    iconName: 'Users',
    subtitle: 'Collaborative & respectful',
    description: 'Builds goodwill, aligns priorities, and respects mutual time constraints.',
    coreRule: 'Clear, collegial, explains the "why" briefly, and explicitly specifies mutual touchpoints and next milestones.'
  },
  {
    id: 'team',
    label: 'Direct Report / Team',
    iconName: 'Sparkles',
    subtitle: 'Clear, motivating & actionable',
    description: 'Unblocks obstacles, gives constructive guidance, and specifies clear deliverables.',
    coreRule: 'Provide psychological safety with clarity on the definition of done, ownership, and available support.'
  },
  {
    id: 'vendor',
    label: 'Vendor / Partner',
    iconName: 'Building',
    subtitle: 'Contractual & milestone-bound',
    description: 'Precise expectations, scope boundaries, and SLA requirements.',
    coreRule: 'Specific, unambiguous expectations, clear deadlines, and accountable deliverables.'
  }
];

export interface ToneOption {
  id: ToneType;
  label: string;
  badge: string;
  desc: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'executive', label: 'Executive', badge: 'BLUF', desc: 'Direct, confident, impact-first, zero fluff' },
  { id: 'diplomatic', label: 'Diplomatic', badge: 'Tactful', desc: 'Courteous, neutralizes tension, bridges disagreement' },
  { id: 'assertive', label: 'Assertive', badge: 'Firm', desc: 'Unambiguous boundaries, decisive, polite yet unyielding' },
  { id: 'friendly', label: 'Warm & Friendly', badge: 'Approachable', desc: 'Engaging, human, builds rapport while staying professional' },
  { id: 'urgent', label: 'Urgent Action', badge: 'High Priority', desc: 'Highlights deadlines and consequences cleanly without panic' },
  { id: 'persuasive', label: 'Persuasive', badge: 'Buy-in', desc: 'Focuses on benefits, ROI, and low-friction yes-responses' },
  { id: 'concise', label: 'Ultra Concise', badge: '< 3 sentences', desc: 'Maximum information density in minimal reading time' },
];

export interface FormatOption {
  id: FormatType;
  label: string;
  channel: string;
  defaultGreeting: boolean;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'normal_discussion', label: 'Normal Discussion (Simple)', channel: 'Simple Conversation', defaultGreeting: false },
  { id: 'polite_way', label: 'Polite way', channel: 'Courteous & Respectful', defaultGreeting: true },
  { id: 'email', label: 'Formal Email', channel: 'Email', defaultGreeting: true },
  { id: 'chat', label: 'Slack / Teams DM', channel: 'Instant Message', defaultGreeting: false },
  { id: 'status_update', label: 'Project Status Update', channel: 'Async Update', defaultGreeting: false },
  { id: 'pushback', label: 'Polite Pushback / Saying "No"', channel: 'Boundary', defaultGreeting: true },
  { id: 'meeting_request', label: 'Meeting Request with Agenda', channel: 'Calendar/Email', defaultGreeting: true },
  { id: 'follow_up', label: 'Follow-Up / Gentle Nudge', channel: 'Email/Slack', defaultGreeting: false },
];


export const DEFAULT_RULES: PersonaRule[] = [
  {
    id: 'r1',
    title: 'Never apologize for routine outreach',
    rule: 'Never say "Sorry to bother you" or "Sorry for the delay" unless there was an egregious mistake. Use "Thank you for your patience" instead.',
    enabled: true
  },
  {
    id: 'r2',
    title: 'Bottom Line Up Front (BLUF)',
    rule: 'Always present the bottom line or main request in the very first sentence before providing background.',
    enabled: true
  },
  {
    id: 'r3',
    title: 'Clear Call to Action',
    rule: 'State clearly what decision or response is requested directly in the message without adding artificial "Next Steps" headers.',
    enabled: true
  },
  {
    id: 'r4',
    title: 'Ban Corporate Jargon Clichés',
    rule: 'Avoid empty buzzwords like "synergize", "circle back", "boil the ocean", or "hope this email finds you well". Use natural, crisp English.',
    enabled: true
  }
];



import { AudienceType, ToneType, FormatType, ExampleDraft, PersonaRule } from '../types';

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
  { id: 'email', label: 'Formal Email', channel: 'Email', defaultGreeting: true },
  { id: 'chat', label: 'Slack / Teams DM', channel: 'Instant Message', defaultGreeting: false },
  { id: 'status_update', label: 'Project Status Update', channel: 'Async Update', defaultGreeting: false },
  { id: 'pushback', label: 'Polite Pushback / Saying "No"', channel: 'Boundary', defaultGreeting: true },
  { id: 'meeting_request', label: 'Meeting Request with Agenda', channel: 'Calendar/Email', defaultGreeting: true },
  { id: 'follow_up', label: 'Follow-Up / Gentle Nudge', channel: 'Email/Slack', defaultGreeting: false },
];

export interface QuickRefineAction {
  id: string;
  label: string;
  promptMod: string;
  icon: string;
}

export const QUICK_ACTIONS: QuickRefineAction[] = [
  { id: 'shorter', label: 'Make 30% Shorter', promptMod: 'Cut word count by 30%, remove non-essential qualifiers, and make it punchier.', icon: 'Minimize2' },
  { id: 'confident', label: 'Remove Apologies & Boost Confidence', promptMod: 'Eliminate timid phrases like "sorry to bother", "just checking in", "I think", or "I might be wrong". Make it sound authoritative and confident.', icon: 'ShieldCheck' },
  { id: 'bullets', label: 'Convert to Actionable Bullets', promptMod: 'Structure all key points and next steps into crisp bullet points with owners and due dates.', icon: 'ListCheck' },
  { id: 'soften', label: 'Soften Tone (More Diplomatic)', promptMod: 'Make the phrasing softer and more empathetic without losing clarity or firmness.', icon: 'HeartHandshake' },
  { id: 'tldr', label: 'Add 1-Line TL;DR at Top', promptMod: 'Prefix the message with a prominent "TL;DR:" summarizing the entire message in one sentence.', icon: 'Zap' },
  { id: 'cta', label: 'Sharpen Call to Action (CTA)', promptMod: 'End with a crystal-clear, specific question or call to action that makes it effortless for the reader to respond.', icon: 'CheckCircle2' },
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

export const EXAMPLE_DRAFTS: ExampleDraft[] = [
  {
    id: 'delay-to-boss',
    title: 'Project Delay to Boss',
    audience: 'boss',
    tone: 'executive',
    format: 'email',
    draft: 'hey Sarah, so the migration project is not going to finish by Friday like we said. the third party api is totally broken and my engineer is out sick today. we might get it done by next Wednesday if everything goes okay. sorry about this delay, let me know if you want to chat.'
  },
  {
    id: 'scope-creep-client',
    title: 'Pushing Back on Client Scope Creep',
    audience: 'client',
    tone: 'diplomatic',
    format: 'pushback',
    draft: 'Hi Mark, we saw the 4 new dashboard screens you sent over this morning. That was not in the original contract we signed last month and it will take a lot of extra hours that we didn\'t budget for. We cannot do this for free. If you really want it, you will have to pay more money and it will delay the launch.'
  },
  {
    id: 'slack-meeting-request',
    title: 'Slack Quick Sync Request',
    audience: 'peer',
    tone: 'friendly',
    format: 'chat',
    draft: 'hey quick question do you have 10 mins sometime today or tomorrow to talk about the Q3 marketing sync? I was confused about what you said in the email and wanted to make sure we are not duplicating effort.'
  },
  {
    id: 'team-feedback',
    title: 'Constructive Feedback to Report',
    audience: 'team',
    tone: 'diplomatic',
    format: 'email',
    draft: 'Hey Alex, I looked at the pull request you put up. There are a bunch of missing tests and the documentation isn\'t updated at all. Also you missed the deadline we agreed on yesterday. Please fix these issues today because QA needs it.'
  },
  {
    id: 'gentle-nudge',
    title: 'Follow-up on Overdue Client Sign-off',
    audience: 'client',
    tone: 'assertive',
    format: 'follow_up',
    draft: 'Hi David, just checking in on the contract I sent 5 days ago. We cannot start the implementation until you sign it. Let me know when you can sign.'
  }
];


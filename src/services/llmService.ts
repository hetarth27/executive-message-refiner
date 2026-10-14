import { AppSettings, AudienceType, FormatType, RefinementResult, ToneType } from '../types';
import { AUDIENCE_OPTIONS, TONE_OPTIONS } from '../data/presets';
import { countWords } from './diffService';

interface LLMRequestParams {
  rawText: string;
  audience: AudienceType;
  tone: ToneType;
  format: FormatType;
  quickActionPrompt?: string;
  settings: AppSettings;
}

export async function refineMessage(params: LLMRequestParams): Promise<RefinementResult> {
  const { settings } = params;

  if (settings.provider !== 'mock') {
    if (!settings.apiKey.trim()) {
      throw new Error(`Please enter your ${settings.provider.toUpperCase()} API key below the draft window to refine.`);
    }

    if (settings.provider === 'gemini') {
      return await callGeminiAPI(params);
    } else if (settings.provider === 'openai') {
      return await callOpenAIAPI(params);
    } else if (settings.provider === 'openrouter') {
      return await callOpenRouterAPI(params);
    } else if (settings.provider === 'anthropic') {
      return await callAnthropicAPI(params);
    }

    throw new Error('Unsupported AI provider selected.');
  }

  // Built-in intelligent engine (works 100% offline with zero setup)
  await new Promise((resolve) => setTimeout(resolve, 500));
  return generateLocalExecutiveRefinement(params);
}

function buildSystemPrompt(params: LLMRequestParams): string {
  const { audience, tone, format, quickActionPrompt, settings } = params;
  const audienceInfo = AUDIENCE_OPTIONS.find((a) => a.id === audience);
  const toneInfo = TONE_OPTIONS.find((t) => t.id === tone);

  const activeRules = settings.rules
    .filter((r) => r.enabled)
    .map((r) => `- ${r.title}: ${r.rule}`)
    .join('\n');

  return `You are an elite Executive Communications Specialist, C-Suite Advisor, and master editor.
Your mission is to transform raw, casual, poorly phrased, anxious, or ungrammatical drafts into crisp, high-impact, professional executive messages.

AUDIENCE: ${audienceInfo?.label || audience}
AUDIENCE PRINCIPLE: ${audienceInfo?.coreRule || ''}

TONE: ${toneInfo?.label || tone} (${toneInfo?.desc || ''})
FORMAT: ${format === 'normal_discussion' ? 'Normal Discussion (Keep phrasing simple, natural, clear, and direct. Avoid stiff corporate jargon and overly rigid memo structures).' : format}
${quickActionPrompt ? `SPECIAL ADJUSTMENT REQUEST: ${quickActionPrompt}` : ''}

USER CONTEXT:
- Name: ${settings.userName || 'Professional'}
- Title: ${settings.userTitle || 'Team Member'}
${settings.systemPersonaInstructions ? `- Persona Instructions: ${settings.systemPersonaInstructions}` : ''}

ENFORCED PERSONAL RULES:
${activeRules}

CORE EXECUTIVE GUIDELINES:
1. Fix all grammar, spelling, awkward punctuation, and syntax errors.
2. Bottom-Line-Up-Front (BLUF): State the core decision, status, or request immediately.
3. Ban unnecessary apologies ("sorry for bothering", "sorry for the delay" -> "thank you for your patience").
4. Eliminate timid hedge words ("just", "maybe", "I think", "sorry if this is dumb").
5. Structure for scanning: Short paragraphs (1-3 sentences), clean bullet points for action items.
6. Provide a clear Call to Action (CTA) or explicit timeline.

OUTPUT FORMAT:
Return strictly a valid JSON object matching this TypeScript structure:
{
  "subjectLine": "string (Compelling subject line, or null if chat/DM)",
  "refinedText": "string (The fully refined message ready to send)",
  "executiveSummary": "string (One-sentence summary of what this message accomplishes)",
  "clarityScore": 95, // 0 to 100
  "formalityScore": 88, // 0 to 100
  "improvements": [
    {
      "type": "grammar" | "tone" | "brevity" | "structure" | "clarity",
      "description": "Short explanation of the fix",
      "originalSnippet": "problematic phrase",
      "improvedSnippet": "corrected professional phrasing"
    }
  ]
}
Do not include markdown code block ticks outside the JSON. Return raw JSON.`;
}

async function callGeminiAPI(params: LLMRequestParams): Promise<RefinementResult> {
  const { rawText, settings } = params;
  const model = settings.selectedModel || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

  const systemInstruction = buildSystemPrompt(params);

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemInstruction },
          { text: `Raw draft to refine:\n\n${rawText}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Empty response from Gemini API');
  }

  return parseJsonResponse(textContent, rawText, params);
}

async function callOpenAIAPI(params: LLMRequestParams): Promise<RefinementResult> {
  const { rawText, settings } = params;
  const model = settings.selectedModel || 'gpt-4o-mini';
  const endpoint = settings.customEndpoint || 'https://api.openai.com/v1/chat/completions';

  const systemInstruction = buildSystemPrompt(params);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Please refine this draft:\n\n${rawText}` }
      ]
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenAI API returned status ${res.status}`);
  }

  const data = await res.json();
  const textContent = data.choices?.[0]?.message?.content;
  if (!textContent) {
    throw new Error('Empty response from OpenAI');
  }

  return parseJsonResponse(textContent, rawText, params);
}

async function callOpenRouterAPI(params: LLMRequestParams): Promise<RefinementResult> {
  const { rawText, settings } = params;
  const model = settings.selectedModel || 'google/gemini-2.0-flash-001';

  const systemInstruction = buildSystemPrompt(params);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Executive Message Refiner'
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Refine this message into JSON:\n\n${rawText}` }
      ]
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenRouter returned status ${res.status}`);
  }

  const data = await res.json();
  const textContent = data.choices?.[0]?.message?.content;
  return parseJsonResponse(textContent, rawText, params);
}

async function callAnthropicAPI(params: LLMRequestParams): Promise<RefinementResult> {
  const { rawText, settings } = params;
  const model = settings.selectedModel || 'claude-3-5-sonnet-latest';

  const systemInstruction = buildSystemPrompt(params);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system: systemInstruction,
      messages: [
        { role: 'user', content: `Refine this message and return pure JSON only:\n\n${rawText}` }
      ]
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Anthropic returned status ${res.status}`);
  }

  const data = await res.json();
  const textContent = data.content?.[0]?.text;
  return parseJsonResponse(textContent, rawText, params);
}

function parseJsonResponse(rawJson: string, rawText: string, params: LLMRequestParams): RefinementResult {
  try {
    // Strip markdown code fences if model enclosed it
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      originalText: rawText,
      refinedText: parsed.refinedText || rawText,
      subjectLine: parsed.subjectLine || undefined,
      audience: params.audience,
      tone: params.tone,
      format: params.format,
      executiveSummary: parsed.executiveSummary || 'Transformed into executive-ready communication.',
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      wordCountOriginal: countWords(rawText),
      wordCountRefined: countWords(parsed.refinedText || rawText),
      clarityScore: typeof parsed.clarityScore === 'number' ? parsed.clarityScore : 94,
      formalityScore: typeof parsed.formalityScore === 'number' ? parsed.formalityScore : 88,
    };
  } catch (err) {
    console.error('Failed to parse model JSON:', err, rawJson);
    throw new Error('AI returned an unparseable response format.');
  }
}

/**
 * Intelligent built-in rule and heuristic engine
 * Delivers instant refinements offline with zero setup
 */
function generateLocalExecutiveRefinement(params: LLMRequestParams): RefinementResult {
  const { rawText, audience, tone, format, quickActionPrompt, settings } = params;
  const lower = rawText.toLowerCase();

  let subjectLine: string | undefined = undefined;
  let refinedText = '';
  let summary = '';
  const improvements: RefinementResult['improvements'] = [];

  const userName = settings.userName || 'Best regards';
  const userTitle = settings.userTitle ? `\n${settings.userTitle}` : '';

  // 1. Detect Scenario Patterns
  const isDelay = lower.includes('delay') || lower.includes('late') || lower.includes('not going to finish') || lower.includes('behind schedule') || lower.includes('next week instead');
  const isScopeCreep = lower.includes('scope') || lower.includes('contract') || lower.includes('extra hours') || lower.includes('free') || lower.includes('pay more') || lower.includes('dashboard');
  const isQuickSync = lower.includes('quick question') || lower.includes('sync') || lower.includes('confused') || lower.includes('10 mins') || lower.includes('call');
  const isFeedback = lower.includes('pull request') || lower.includes('missing tests') || lower.includes('documentation') || lower.includes('deadline') || lower.includes('fix these');
  const isFollowUp = lower.includes('just checking in') || lower.includes('contract') || lower.includes('sign') || lower.includes('5 days ago');

  if (isDelay) {
    if (format === 'normal_discussion') {
      summary = 'Clear, simple update on timeline and cause without stiffness.';
      refinedText = `The migration project will need to be pushed to next Wednesday. We hit an issue with the third-party API this morning, and our engineer is out sick today. We are coordinating a fix with the vendor today and will keep you posted once we are back on track. Let me know if you need anything else from my side.`;
    } else if (audience === 'boss') {
      subjectLine = 'Update: Migration Project Timeline & Mitigation Plan';
      summary = 'Framed delay proactively around root causes, revised delivery date (Wednesday), and mitigation steps.';
      refinedText = format === 'chat'
        ? `*Project Update: Migration Timeline*\n\nBLUF: We are adjusting our migration completion target to *next Wednesday* due to an upstream third-party API outage and reduced engineering capacity today.\n\n• *Root Causes:* Third-party API failure + team member on sick leave.\n• *Mitigation:* We are coordinating a patch directly with the vendor today and reallocating review tasks.\n• *Target Delivery:* Next Wednesday by 5:00 PM.\n\nLet me know if you would like a brief 5-minute sync or need me to flag any cross-team dependencies.`
        : `Hi Sarah,\n\nI am writing to provide an updated timeline and mitigation plan for the migration project.\n\n**Bottom Line:** We are adjusting our completion target from this Friday to **next Wednesday**. \n\n**Key Factors:**\n• **Third-Party API Dependency:** The partner service encountered unexpected downtime this morning, temporarily blocking data ingestion.\n• **Capacity:** A key engineer is out sick today; we have redistributed remaining tasks to ensure continuity.\n\n**Next Steps & Delivery:**\nWe anticipate testing will resume tomorrow morning, with final verification scheduled for Wednesday afternoon. I will send a progress checkpoint on Monday at 12:00 PM.\n\nPlease let me know if you would like to discuss this or if there are leadership dependencies we should align on.\n\nBest regards,\n${userName}${userTitle}`;
    } else {
      subjectLine = 'Timeline Update: Project Milestone Adjustment';
      summary = 'Transformed informal delay notice into reassuring, milestone-driven client communication.';
      refinedText = `Hi,\n\nI am reaching out to provide a quick update on our milestone delivery timeline.\n\nTo ensure complete testing fidelity following an upstream API update, we have scheduled final delivery for **next Wednesday**. Our team is actively running validations to ensure a seamless rollout.\n\nI will follow up with our deployment confirmation on Tuesday.\n\nBest regards,\n${userName}${userTitle}`;
    }

    improvements.push(
      { type: 'tone', description: 'Eliminated timid apology ("sorry about this delay") and replaced with confident leadership and proactive ownership.', originalSnippet: 'sorry about this delay', improvedSnippet: 'I will send a progress checkpoint on Monday' },
      { type: 'structure', description: 'Placed the Bottom-Line-Up-Front (BLUF) in the opening sentence instead of burying it.', originalSnippet: 'hey Sarah, so the migration project...', improvedSnippet: 'Bottom Line: We are adjusting our completion target...' },
      { type: 'clarity', description: 'Replaced vague timeline ("might get it done if everything goes okay") with a definitive milestone date and mitigation plan.', originalSnippet: 'might get it done by next Wednesday if everything goes okay', improvedSnippet: 'Target Delivery: Next Wednesday by 5:00 PM' }
    );
  } else if (isScopeCreep) {
    if (format === 'normal_discussion') {
      summary = 'Clear, simple explanation of scope impact with direct options.';
      refinedText = `Thanks for sharing the 4 new dashboard screens! Because they fall outside our agreed project scope, adding them now would impact our timeline and budget. We can either launch on schedule and build these in Phase 2, or add them now with an updated timeline and estimate. Which option works best for you?`;
    } else {
      subjectLine = 'Review of New Dashboard Screens & Scope Alignment';
      summary = 'Replaced aggressive pushback with constructive commercial boundaries and clear pricing/schedule options.';
      refinedText = format === 'chat'
        ? `Hi Mark — Thank you for sharing the 4 additional dashboard concepts! They look promising.\n\nBecause these screens fall outside our agreed project scope, incorporating them will impact our delivery timeline and budget:\n• *Option A (Recommended):* Deliver our current sprint on schedule, and add these screens as Phase 2.\n• *Option B:* Incorporate them into the current milestone with a change order (+1.5 weeks / revised estimate).\n\nLet me know which direction best aligns with your target launch!`
        : `Hi Mark,\n\nThank you for sharing the four new dashboard designs earlier today. They provide great clarity on your long-term vision.\n\nBecause these screens represent features beyond our original signed Statement of Work (SOW), we want to provide two straightforward paths forward:\n\n1. **Maintain Target Launch (Recommended):** We complete and deploy the agreed core features on our current schedule, then scope these screens into a Phase 2 release.\n2. **Incorporate Immediately via Change Order:** We adjust our sprint schedule by approximately 10 business days and provide an updated project estimate for your review.\n\nPlease let me know which path aligns best with your team's launch priorities, and I will prepare the respective timeline details.\n\nBest regards,\n${userName}${userTitle}`;
    }

    improvements.push(
      { type: 'tone', description: 'Transformed confrontational language into clear options and constructive boundaries.', originalSnippet: 'We cannot do this for free. If you really want it, you will have to pay more money', improvedSnippet: 'We can either launch on schedule and build these in Phase 2, or add them now with an updated timeline' },
      { type: 'structure', description: 'Structured response into two crystal-clear decision options to accelerate decision-making.' }
    );
  } else if (isQuickSync) {
    summary = 'Simple, natural sync request without timid hedging.';
    refinedText = `Hey, do you have about 10 minutes today or tomorrow for a quick chat about Q3 marketing? Just want to make sure we are aligned and not duplicating effort. Let me know what time suits you best.`;

    improvements.push(
      { type: 'tone', description: 'Eliminated self-diminishing phrasing ("sorry to bother", "I was confused").', originalSnippet: 'sorry to bother / I was confused', improvedSnippet: 'make sure we are aligned and not duplicating effort' },
      { type: 'clarity', description: 'Framed the meeting agenda around mutual efficiency.' }
    );
  } else if (isFeedback) {
    summary = 'Direct, constructive discussion on PR changes needed.';
    refinedText = `Hey Alex, thanks for submitting the PR. Before we pass this to QA, could you add tests for the edge cases and update the setup documentation? We are aiming to wrap this up by 3:00 PM today. Let me know if you run into any issues or want to pair on anything!`;

    improvements.push(
      { type: 'tone', description: 'Shifted from blunt criticism to collaborative high-standards coaching.' },
      { type: 'structure', description: 'Provided a clear checklist with supportive unblocking offer.' }
    );
  } else if (isFollowUp) {
    summary = 'Simple, polite follow-up on agreement status.';
    refinedText = `Hi David, following up on the contract agreement sent last week. Once signed, our team is ready to begin implementation right away. Let me know if you have any questions or need any adjustments!`;

    improvements.push(
      { type: 'tone', description: 'Replaced passive check-in with positive forward momentum.' },
      { type: 'brevity', description: 'Encouraging call to action.' }
    );
  } else {
    // General synthesis algorithm for any custom input
    const cleanedDraft = rawText
      .replace(/sorry to bother you/gi, 'thank you for your time')
      .replace(/sorry for the delay/gi, 'thank you for your patience')
      .replace(/just checking in/gi, 'following up on our previous conversation')
      .replace(/i think maybe/gi, 'our analysis indicates')
      .replace(/hope this email finds you well/gi, '')
      .trim();

    const words = cleanedDraft.split('\n').filter(Boolean);
    const firstLine = words[0] || 'Regarding our upcoming milestone';

    if (format === 'normal_discussion') {
      subjectLine = undefined;
      refinedText = cleanedDraft;
    } else if (format === 'email') {
      subjectLine = `Action Required: ${firstLine.slice(0, 45).replace(/[^\w\s]/g, '')}...`;
      refinedText = `Hi,\n\nI am writing to share a brief update and outline our next steps.\n\n${cleanedDraft}\n\n**Action Items & Next Steps:**\n• Please review and confirm your alignment by end of day tomorrow.\n• Let me know if you have any questions or require additional details.\n\nBest regards,\n${userName}${userTitle}`;
    } else {
      refinedText = `${cleanedDraft}\n\n*Next Steps:* Please confirm if this aligns with your timeline, and I will proceed accordingly.`;
    }

    summary = 'Eliminated filler phrasing, elevated executive tone, and added clear next steps.';
    improvements.push(
      { type: 'grammar', description: 'Corrected capitalization, punctuation, and sentence cadence.', originalSnippet: rawText.slice(0, 30), improvedSnippet: refinedText.slice(0, 35) },
      { type: 'structure', description: 'Formatted with executive clarity, paragraph spacing, and explicit action items.' },
      { type: 'tone', description: `Adapted for ${audience} with a ${tone} posture.` }
    );
  }

  // Handle Quick Action prompt modifications
  if (quickActionPrompt) {
    if (quickActionPrompt.includes('30% Shorter') || quickActionPrompt.includes('Cut word count')) {
      const lines = refinedText.split('\n').filter(line => !line.startsWith('Best regards') && !line.startsWith('Hi ') && line.trim().length > 0);
      refinedText = lines.slice(0, Math.max(2, Math.floor(lines.length * 0.7))).join('\n\n') + `\n\nBest,\n${userName}`;
      improvements.push({ type: 'brevity', description: 'Reduced message length by 30% for rapid mobile reading.' });
    } else if (quickActionPrompt.includes('TL;DR')) {
      refinedText = `**TL;DR:** ${summary}\n\n` + refinedText;
      improvements.push({ type: 'structure', description: 'Added 1-line executive TL;DR at the top.' });
    } else if (quickActionPrompt.includes('Actionable Bullets') || quickActionPrompt.includes('bullet points')) {
      if (!refinedText.includes('•')) {
        refinedText += '\n\n**Summary of Actions:**\n• Immediate review of proposal\n• Final sign-off by COB tomorrow\n• Next status checkpoint on Friday';
      }
      improvements.push({ type: 'structure', description: 'Extracted key action items into bulleted list.' });
    }
  }

  return {
    id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    originalText: rawText,
    refinedText,
    subjectLine,
    audience,
    tone,
    format,
    executiveSummary: summary,
    improvements,
    wordCountOriginal: countWords(rawText),
    wordCountRefined: countWords(refinedText),
    clarityScore: 96,
    formalityScore: tone === 'friendly' ? 78 : tone === 'executive' ? 95 : 88,
  };
}




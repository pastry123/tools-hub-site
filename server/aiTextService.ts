import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AIDetectionResult {
  isAI: boolean;
  confidence: number;
  indicators: string[];
  analysis: string;
}

export interface HumanizationResult {
  humanizedText: string;
  changes: string[];
  readabilityScore: number;
}

export class AITextService {
  async detectAIText(text: string): Promise<AIDetectionResult> {
    if (!text || text.trim().length < 10) {
      throw new Error('Text must be at least 10 characters long');
    }

    try {
      const prompt = `Analyze this text and determine if it was written by AI or a human. Look carefully for AI patterns.

CLASSIC AI PATTERNS - Mark as AI if you see these:
- Formal, business-like language without personality
- Perfect grammar and structure with no natural flaws
- Generic, templated phrases (e.g., "I hope you had a great holiday", "as discussed", "moving forward")
- Overly polite and professional tone
- Consistent sentence lengths and patterns
- Lack of contractions or casual language
- Mechanical flow without natural conversation
- No personal voice, opinions, or emotional language
- Structured information delivery without human warmth

HUMAN PATTERNS - Mark as human if you see these:
- Casual contractions ("I'm", "you're", "don't", "can't")
- Natural grammatical variations or minor imperfections
- Personal opinions, experiences, or subjective statements
- Emotional expressions or exclamations
- Varied sentence structures (mix of long/short/fragments)
- Colloquial expressions or slang
- Natural conversational flow
- Personal voice and authentic personality

Text: "${text}"

If this text is formal, polished, and generic-sounding, it's likely AI. If it has natural human speech patterns and personality, it's likely human.

Return JSON:
{"isAI": boolean, "confidence": number, "indicators": ["specific evidence"], "analysis": "brief reasoning"}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI detection expert. Your primary goal is to accurately identify AI-generated text. AI text typically has formal language, perfect structure, generic phrases, and lacks personal voice. Be decisive - if text shows clear AI characteristics like formal business language and templated phrases, mark it as AI with high confidence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.2,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      // Parse JSON response with better error handling
      let jsonMatch = response.match(/\{[\s\S]*?\}(?=\s*$|\s*\n|$)/);
      if (!jsonMatch) {
        const codeMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonMatch = [codeMatch[1]];
        } else {
          jsonMatch = response.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
          if (jsonMatch) {
            jsonMatch = [jsonMatch[jsonMatch.length - 1]];
          }
        }
      }

      if (!jsonMatch) {
        throw new Error('Invalid response format - no JSON found');
      }

      let result;
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        let cleanJson = jsonMatch[0]
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}')
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        result = JSON.parse(cleanJson);
      }
      
      return {
        isAI: result.isAI || false,
        confidence: Math.min(100, Math.max(0, result.confidence || 50)),
        indicators: Array.isArray(result.indicators) ? result.indicators : [],
        analysis: result.analysis || "Analysis unavailable"
      };

    } catch (error) {
      console.error('AI Detection Error:', error);
      throw new Error('Failed to analyze text for AI detection');
    }
  }

  async humanizeText(text: string): Promise<HumanizationResult> {
    if (!text || text.trim().length < 10) {
      throw new Error('Text must be at least 10 characters long');
    }

    try {
      const prompt = `You must completely rewrite this AI text to be 100% undetectable as AI. Transform it using these critical techniques:

ESSENTIAL CHANGES:
- Add authentic human flaws: minor typos, informal grammar, run-on sentences
- Use real human speech: "gonna", "kinda", "you know", "I mean", "honestly"
- Include personal elements: "I think", "in my experience", "personally"
- Add emotional markers: "ugh", "wow", "lol", casual exclamations
- Break perfect structure: start sentences with "And", "But", "So"
- Use inconsistent punctuation and capitalization naturally
- Add conversational tangents or brief personal references
- Include regional/colloquial expressions
- Use varied sentence rhythm - some short, some long, some fragments

AVOID AT ALL COSTS:
- Perfect grammar and punctuation
- Formal business language
- Structured lists or perfect formatting
- Overly polite or professional tone
- Generic phrases without personality

Original text: "${text}"

Rewrite this to sound like a real person texting or talking casually. Make it completely natural and undetectable as AI.

Return JSON: {"humanizedText": "rewritten text", "changes": ["key changes"], "readabilityScore": 88}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert at making AI text completely undetectable. Your ONLY job is to rewrite text so it passes as 100% human-written. Add real human flaws, casual language, personal touches, and authentic imperfections. The text must sound like someone casually writing or texting - never formal or polished. Include contractions, slang, minor errors, and conversational elements that AI would never naturally produce."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 1.1,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      // More robust JSON parsing
      let jsonMatch = response.match(/\{[\s\S]*?\}(?=\s*$|\s*\n|$)/);
      if (!jsonMatch) {
        // Try extracting from code blocks
        const codeMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonMatch = [codeMatch[1]];
        } else {
          // Find the last complete JSON object
          jsonMatch = response.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
          if (jsonMatch) {
            jsonMatch = [jsonMatch[jsonMatch.length - 1]];
          }
        }
      }

      if (!jsonMatch) {
        throw new Error('Invalid response format - no JSON found');
      }

      let result;
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // Clean up common JSON issues
        let cleanJson = jsonMatch[0]
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
          .replace(/\n/g, ' ')     // Replace newlines with spaces
          .replace(/\r/g, '')      // Remove carriage returns
          .replace(/\t/g, ' ')     // Replace tabs with spaces
          .replace(/\s+/g, ' ')    // Normalize multiple spaces
          .trim();
        
        try {
          result = JSON.parse(cleanJson);
        } catch (secondError) {
          console.error('JSON Parse Error:', secondError);
          console.error('Original JSON:', jsonMatch[0]);
          console.error('Cleaned JSON:', cleanJson);
          throw new Error('Failed to parse JSON response');
        }
      }
      
      return {
        humanizedText: result.humanizedText || text,
        changes: Array.isArray(result.changes) ? result.changes : [],
        readabilityScore: Math.min(100, Math.max(0, result.readabilityScore || 75))
      };

    } catch (error) {
      console.error('Text Humanization Error:', error);
      throw new Error('Failed to humanize text');
    }
  }
}

export const aiTextService = new AITextService();
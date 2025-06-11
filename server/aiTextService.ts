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
      const prompt = `You are an expert at detecting AI-generated text. Analyze this text carefully and determine if it was written by AI or a human.

Look for these AI indicators:
- Overly perfect grammar with no natural errors
- Repetitive sentence patterns or structures
- Generic, templated language without personality
- Formal tone lacking human warmth or emotion
- Lists that are too perfectly formatted
- Lack of contractions or casual language
- Absence of personal opinions or experiences
- Mechanical transitions between ideas

Look for these human indicators:
- Natural grammatical variations or minor errors
- Contractions and casual expressions
- Personal voice, opinions, or experiences
- Varied sentence lengths and structures
- Emotional language or subjective statements
- Natural flow of conversation
- Imperfect but authentic phrasing
- Cultural references or personal anecdotes

Text to analyze: "${text}"

Be conservative - only mark as AI if you're quite confident. Humans write in many different styles.

Return JSON format:
{"isAI": boolean, "confidence": number, "indicators": ["key evidence"], "analysis": "reasoning"}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a highly accurate AI detection expert. Your job is to distinguish between AI-generated and human-written text. Be conservative in your assessments - when in doubt, lean toward human authorship since humans have diverse writing styles. Focus on authentic patterns that clearly indicate AI generation."
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

CRITICAL FIXES FOR BUSINESS LANGUAGE:
- "follow-ups" → "messages/texts/checking in"
- "disconnect and take a breather" → "chill out/relax/unwind"
- "regular routine" → "normal stuff/back to usual/regular flow"
- "touch base" → "catch up/chat/talk"
- "availability looks like" → "you're free/when works/your schedule"
- "schedule our next meeting" → "set up our next chat/call/get together"

HUMAN SPEECH PATTERNS:
- Start sentences casually: "So", "Anyway", "Honestly", "I was thinking"
- Add filler words: "like", "you know", "I mean", "basically"
- Use contractions: "I'd", "we're", "didn't", "you're", "would've"
- Add personal emotions: "I felt bad", "I didn't want to bug you"
- Include casual transitions: "btw", "also", "oh and"
- Make some sentences incomplete or run-on naturally
- Add minor grammatical variations humans make

ELIMINATE COMPLETELY:
- ALL business jargon and corporate speak
- Perfect sentence structure and formatting
- Overly polite professional phrases
- Generic formal expressions

Original text: "${text}"

CRITICAL: Make this sound like texting a close friend, NOT business communication. Eliminate ALL corporate language patterns.

DESTROY THESE PATTERNS:
- "managed to unwind and recharge" → "got to chill/relax"
- "business plan, timeline, and expectations" → break into casual mentions
- "we discussed before you took off" → "we talked about before your break"
- "back to our normal routine" → "back to the usual stuff"
- "touch base and schedule" → "catch up and figure out when"
- "let me know what your schedule looks like" → "when are you free?"
- "I'll send over a few options" → "I'll throw some times at you"

ADD AUTHENTIC HUMAN ELEMENTS:
- Start with casual thoughts: "So anyway", "I was just thinking"
- Add personal reactions: "I felt weird messaging during holidays"
- Use incomplete sentences and natural flow
- Include filler words and casual transitions
- Make it sound like someone actually talking

Return JSON: {"humanizedText": "ultra-casual version", "changes": ["eliminated all corporate speak"], "readabilityScore": 84}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You bypass AI detection by writing like a real human having a casual conversation. Your goal is to eliminate all AI patterns and make text sound like someone texting a friend - never business communication. Add authentic human elements: incomplete thoughts, natural speech mistakes, personal reactions, run-on sentences, and conversational flow. Use tons of contractions, filler words, and emotional reactions that feel genuine and imperfect."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-70b-8192",
        temperature: 1.3,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 1.0,
        presence_penalty: 0.8,
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
        // Clean up common JSON issues including control characters
        let cleanJson = jsonMatch[0]
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
          .replace(/\n/g, '\\n')   // Escape newlines properly
          .replace(/\r/g, '')      // Remove carriage returns
          .replace(/\t/g, '\\t')   // Escape tabs properly
          .replace(/\\/g, '\\\\')  // Escape backslashes
          .replace(/"/g, '\\"')    // Escape quotes in strings
          .replace(/\\\\"([^"]*)\\\\":/g, '"$1":')  // Fix over-escaped keys
          .replace(/: *\\\\"([^"]*)\\\\"([,}])/g, ': "$1"$2')  // Fix over-escaped values
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')  // Remove control characters
          .trim();
        
        try {
          result = JSON.parse(cleanJson);
        } catch (secondError) {
          // Last resort: extract just the text content manually
          const textMatch = cleanJson.match(/"humanizedText"\s*:\s*"([^"]+)"/);
          const changesMatch = cleanJson.match(/"changes"\s*:\s*\[([^\]]*)\]/);
          const scoreMatch = cleanJson.match(/"readabilityScore"\s*:\s*(\d+)/);
          
          if (textMatch) {
            result = {
              humanizedText: textMatch[1],
              changes: changesMatch ? [changesMatch[1]] : [],
              readabilityScore: scoreMatch ? parseInt(scoreMatch[1]) : 85
            };
          } else {
            console.error('JSON Parse Error:', secondError);
            console.error('Original JSON:', jsonMatch[0]);
            console.error('Cleaned JSON:', cleanJson);
            throw new Error('Failed to parse JSON response');
          }
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
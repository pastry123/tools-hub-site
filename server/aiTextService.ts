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
      const prompt = `Transform this AI-generated text into something that sounds genuinely human-written. Focus on:

- Adding natural speech patterns and contractions
- Including subtle grammatical variations humans use
- Adding personal touches, opinions, or experiences
- Using varied sentence structures and lengths
- Including filler words or casual expressions where appropriate
- Making it sound like someone actually talking, not a machine

Original text: "${text}"

Rewrite it to sound completely human while keeping the same core message. Make it conversational, natural, and authentic.

Return only a JSON object with this exact format:
{"humanizedText": "your rewritten text here", "changes": ["list of changes made"], "readabilityScore": 85}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a human writing expert who transforms robotic AI text into natural, conversational human writing. Your goal is to make text completely undetectable as AI-generated by adding authentic human speech patterns, personality, and natural imperfections."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.9,
        max_tokens: 2000,
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
export interface RemoveBgOptions {
  size?: 'auto' | 'preview' | 'full' | 'regular' | 'medium' | 'hd' | '4k';
  type?: 'auto' | 'person' | 'product' | 'car';
  format?: 'auto' | 'png' | 'jpg';
  crop?: boolean;
  add_shadow?: boolean;
  bg_color?: string;
}

export interface RemoveBgResult {
  success: boolean;
  data?: Buffer;
  error?: string;
  credits_charged?: number;
  credits_remaining?: number;
  result_b64?: string;
}

export class RemoveBgService {
  private apiKey: string;
  private baseUrl = 'https://api.remove.bg/v1.0';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async removeBackground(
    imageBuffer: Buffer, 
    options: RemoveBgOptions = {}
  ): Promise<RemoveBgResult> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Add image
      formData.append('image_file', imageBuffer, {
        filename: 'image.png',
        contentType: 'image/png'
      });
      
      // Add options
      if (options.size) formData.append('size', options.size);
      if (options.type) formData.append('type', options.type);
      if (options.format) formData.append('format', options.format);
      if (options.crop !== undefined) formData.append('crop', options.crop.toString());
      if (options.add_shadow !== undefined) formData.append('add_shadow', options.add_shadow.toString());
      if (options.bg_color) formData.append('bg_color', options.bg_color);

      const response = await fetch(`${this.baseUrl}/removebg`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          ...formData.getHeaders()
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.errors?.[0]?.title || errorMessage;
        } catch {
          // Use the default error message if JSON parsing fails
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const resultBuffer = Buffer.from(await response.arrayBuffer());
      const creditsCharged = response.headers.get('X-Credits-Charged');
      const creditsRemaining = response.headers.get('X-Credits-Remaining');

      return {
        success: true,
        data: resultBuffer,
        result_b64: resultBuffer.toString('base64'),
        credits_charged: creditsCharged ? parseInt(creditsCharged) : undefined,
        credits_remaining: creditsRemaining ? parseInt(creditsRemaining) : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAccountInfo(): Promise<{ success: boolean; credits?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        credits: data.attributes?.credits?.total
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
import crypto from 'crypto';

export interface RegexTestResult {
  matches: Array<{
    match: string;
    index: number;
    groups?: string[];
  }>;
  isValid: boolean;
  flags: string;
  totalMatches: number;
}

export interface APITestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  error?: string;
}

export interface JWTDecoded {
  header: any;
  payload: any;
  signature: string;
  valid: boolean;
  expired?: boolean;
  error?: string;
}

export interface MinifyResult {
  original: string;
  minified: string;
  originalSize: number;
  minifiedSize: number;
  savings: number;
  compressionRatio: number;
}

export class DeveloperService {
  testRegex(pattern: string, flags: string, testString: string): RegexTestResult {
    try {
      const regex = new RegExp(pattern, flags);
      const matches: Array<{ match: string; index: number; groups?: string[] }> = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) break;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      return {
        matches,
        isValid: true,
        flags,
        totalMatches: matches.length
      };
    } catch (error: any) {
      return {
        matches: [],
        isValid: false,
        flags,
        totalMatches: 0
      };
    }
  }

  async testAPI(url: string, method: string, headers: Record<string, string> = {}, body?: string): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      const fetch = (await import('node-fetch')).default;
      const options: any = {
        method: method.toUpperCase(),
        headers: {
          'User-Agent': 'ToolHub-API-Tester/1.0',
          ...headers
        }
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        options.body = body;
        if (!options.headers['Content-Type']) {
          options.headers['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = `[Binary data - ${contentType}]`;
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        responseTime
      };
    } catch (error: any) {
      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  decodeJWT(token: string): JWTDecoded {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      const signature = parts[2];

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const expired = payload.exp && payload.exp < now;

      return {
        header,
        payload,
        signature,
        valid: true,
        expired
      };
    } catch (error: any) {
      return {
        header: null,
        payload: null,
        signature: '',
        valid: false,
        error: error.message
      };
    }
  }

  encodeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  decodeHTML(html: string): string {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  minifyCSS(css: string): MinifyResult {
    const original = css;
    const originalSize = original.length;

    const minified = css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*:\s*/g, ':')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      .trim();

    const minifiedSize = minified.length;
    const savings = originalSize - minifiedSize;
    const compressionRatio = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    return {
      original,
      minified,
      originalSize,
      minifiedSize,
      savings,
      compressionRatio
    };
  }

  minifyJavaScript(js: string): MinifyResult {
    const original = js;
    const originalSize = original.length;

    const minified = js
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s*=\s*/g, '=')
      .replace(/\s*\+\s*/g, '+')
      .replace(/\s*-\s*/g, '-')
      .trim();

    const minifiedSize = minified.length;
    const savings = originalSize - minifiedSize;
    const compressionRatio = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    return {
      original,
      minified,
      originalSize,
      minifiedSize,
      savings,
      compressionRatio
    };
  }

  generateLoremPicsum(width: number, height: number, options: {
    blur?: number;
    grayscale?: boolean;
    seed?: string;
  } = {}): string {
    let url = `https://picsum.photos/${width}/${height}`;
    
    const params = [];
    if (options.blur) params.push(`blur=${options.blur}`);
    if (options.grayscale) params.push('grayscale');
    if (options.seed) {
      url = `https://picsum.photos/seed/${options.seed}/${width}/${height}`;
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return url;
  }
}

export const developerService = new DeveloperService();
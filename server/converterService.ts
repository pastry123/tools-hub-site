import crypto from 'crypto';

export interface ColorConversion {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

export interface TimestampConversion {
  unix: number;
  iso: string;
  utc: string;
  local: string;
  formatted: string;
}

export class ConverterService {
  convertColor(input: string, fromFormat: 'hex' | 'rgb' | 'hsl'): ColorConversion {
    let r: number, g: number, b: number;

    if (fromFormat === 'hex') {
      const hex = input.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (fromFormat === 'rgb') {
      const match = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) throw new Error('Invalid RGB format');
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      throw new Error('HSL conversion not implemented');
    }

    // Convert to all formats
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    
    // RGB to HSL conversion
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const l = (max + min) / 2;
    
    if (diff !== 0) {
      if (max === rNorm) h = ((gNorm - bNorm) / diff) % 6;
      else if (max === gNorm) h = (bNorm - rNorm) / diff + 2;
      else h = (rNorm - gNorm) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);
    const vPercent = Math.round(max * 100);

    return {
      hex,
      rgb: { r, g, b },
      hsl: { h, s: sPercent, l: lPercent },
      hsv: { h, s: sPercent, v: vPercent }
    };
  }

  convertTimestamp(input: string | number, fromFormat: 'unix' | 'iso'): TimestampConversion {
    let date: Date;

    if (fromFormat === 'unix') {
      const timestamp = typeof input === 'string' ? parseInt(input) : input;
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(input as string);
    }

    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }

    return {
      unix: Math.floor(date.getTime() / 1000),
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      formatted: date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    };
  }

  encodeBase64(text: string): string {
    return Buffer.from(text, 'utf8').toString('base64');
  }

  decodeBase64(base64: string): string {
    try {
      return Buffer.from(base64, 'base64').toString('utf8');
    } catch (error) {
      throw new Error('Invalid Base64 string');
    }
  }

  encodeURL(text: string): string {
    return encodeURIComponent(text);
  }

  decodeURL(encoded: string): string {
    try {
      return decodeURIComponent(encoded);
    } catch (error) {
      throw new Error('Invalid URL encoded string');
    }
  }

  formatJSON(jsonString: string, indent: number = 2): { formatted: string; valid: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        formatted: JSON.stringify(parsed, null, indent),
        valid: true
      };
    } catch (error: any) {
      return {
        formatted: jsonString,
        valid: false,
        error: error.message
      };
    }
  }

  csvToJson(csvString: string): Array<Record<string, string>> {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least headers and one data row');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const results: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      
      results.push(obj);
    }

    return results;
  }

  markdownToHTML(markdown: string): string {
    // Simple markdown to HTML converter
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');

    return html;
  }
}

export const converterService = new ConverterService();
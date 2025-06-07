import crypto from 'crypto';

export interface CaseConversionOptions {
  type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab';
}

export interface LoremOptions {
  type: 'words' | 'sentences' | 'paragraphs';
  count: number;
  startWithLorem?: boolean;
}

export interface HashOptions {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
}

export interface CodeFormatterOptions {
  language: 'html' | 'css' | 'javascript' | 'json' | 'xml';
  indent: number;
  minify?: boolean;
}

export interface SlugOptions {
  lowercase?: boolean;
  separator?: string;
  maxLength?: number;
  removeDiacritics?: boolean;
}

export class TextService {
  convertCase(text: string, options: CaseConversionOptions): string {
    switch (options.type) {
      case 'uppercase':
        return text.toUpperCase();
      
      case 'lowercase':
        return text.toLowerCase();
      
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      
      case 'sentence':
        return text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => 
          c.toUpperCase()
        );
      
      case 'camel':
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '');
      
      case 'pascal':
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
      
      case 'snake':
        return text
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');
      
      case 'kebab':
        return text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
      
      default:
        return text;
    }
  }

  generateLoremIpsum(options: LoremOptions): string {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
      'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
      'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
      'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo'
    ];

    switch (options.type) {
      case 'words':
        const selectedWords = [];
        if (options.startWithLorem) {
          selectedWords.push('Lorem', 'ipsum');
        }
        for (let i = selectedWords.length; i < options.count; i++) {
          selectedWords.push(words[Math.floor(Math.random() * words.length)]);
        }
        return selectedWords.join(' ') + '.';

      case 'sentences':
        const sentences = [];
        for (let i = 0; i < options.count; i++) {
          const sentenceLength = Math.floor(Math.random() * 15) + 5;
          const sentence = [];
          
          if (i === 0 && options.startWithLorem) {
            sentence.push('Lorem', 'ipsum');
          }
          
          for (let j = sentence.length; j < sentenceLength; j++) {
            sentence.push(words[Math.floor(Math.random() * words.length)]);
          }
          
          sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
          sentences.push(sentence.join(' ') + '.');
        }
        return sentences.join(' ');

      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < options.count; i++) {
          const sentenceCount = Math.floor(Math.random() * 5) + 3;
          const paragraphSentences = [];
          
          for (let j = 0; j < sentenceCount; j++) {
            const sentenceLength = Math.floor(Math.random() * 15) + 5;
            const sentence = [];
            
            if (i === 0 && j === 0 && options.startWithLorem) {
              sentence.push('Lorem', 'ipsum');
            }
            
            for (let k = sentence.length; k < sentenceLength; k++) {
              sentence.push(words[Math.floor(Math.random() * words.length)]);
            }
            
            sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
            paragraphSentences.push(sentence.join(' ') + '.');
          }
          
          paragraphs.push(paragraphSentences.join(' '));
        }
        return paragraphs.join('\n\n');

      default:
        return '';
    }
  }

  reverseText(text: string): string {
    return text.split('').reverse().join('');
  }

  generateHash(text: string, options: HashOptions): string {
    const hash = crypto.createHash(options.algorithm);
    hash.update(text);
    return hash.digest('hex');
  }

  formatCode(code: string, options: CodeFormatterOptions): string {
    const indent = ' '.repeat(options.indent || 2);
    
    try {
      switch (options.language) {
        case 'json':
          const parsed = JSON.parse(code);
          return JSON.stringify(parsed, null, options.indent || 2);
        
        case 'html':
          return this.formatHTML(code, indent);
        
        case 'css':
          return this.formatCSS(code, indent);
        
        case 'javascript':
          return this.formatJavaScript(code, indent);
        
        case 'xml':
          return this.formatXML(code, indent);
        
        default:
          return code;
      }
    } catch (error: any) {
      throw new Error(`Code formatting failed: ${error.message}`);
    }
  }

  private formatHTML(html: string, indent: string): string {
    let formatted = '';
    let level = 0;
    const tokens = html.match(/<\/?[^>]+>|[^<]+/g) || [];
    
    for (const token of tokens) {
      if (token.trim()) {
        if (token.startsWith('</')) {
          level--;
          formatted += indent.repeat(level) + token.trim() + '\n';
        } else if (token.startsWith('<') && !token.endsWith('/>')) {
          formatted += indent.repeat(level) + token.trim() + '\n';
          if (!token.includes('</')) level++;
        } else if (token.startsWith('<') && token.endsWith('/>')) {
          formatted += indent.repeat(level) + token.trim() + '\n';
        } else {
          formatted += indent.repeat(level) + token.trim() + '\n';
        }
      }
    }
    
    return formatted.trim();
  }

  private formatCSS(css: string, indent: string): string {
    return css
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.endsWith('{')) return trimmed;
        if (trimmed === '}') return trimmed;
        if (trimmed) return indent + trimmed;
        return '';
      })
      .filter(line => line !== '')
      .join('\n');
  }

  private formatJavaScript(js: string, indent: string): string {
    let formatted = '';
    let level = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < js.length; i++) {
      const char = js[i];
      const prevChar = js[i - 1];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = '';
      }
      
      if (!inString) {
        if (char === '{') {
          formatted += char + '\n';
          level++;
          formatted += indent.repeat(level);
          continue;
        } else if (char === '}') {
          level--;
          formatted = formatted.replace(/\s+$/, '');
          formatted += '\n' + indent.repeat(level) + char + '\n';
          formatted += indent.repeat(level);
          continue;
        } else if (char === ';') {
          formatted += char + '\n';
          formatted += indent.repeat(level);
          continue;
        }
      }
      
      formatted += char;
    }
    
    return formatted.trim();
  }

  private formatXML(xml: string, indent: string): string {
    let formatted = '';
    let level = 0;
    const tokens = xml.match(/<\/?[^>]+>|[^<]+/g) || [];
    
    for (const token of tokens) {
      if (token.trim()) {
        if (token.startsWith('</')) {
          level--;
          formatted += indent.repeat(level) + token.trim() + '\n';
        } else if (token.startsWith('<') && !token.endsWith('/>')) {
          formatted += indent.repeat(level) + token.trim() + '\n';
          level++;
        } else if (token.startsWith('<') && token.endsWith('/>')) {
          formatted += indent.repeat(level) + token.trim() + '\n';
        } else {
          formatted += indent.repeat(level) + token.trim() + '\n';
        }
      }
    }
    
    return formatted.trim();
  }

  textToSlug(text: string, options: SlugOptions = {}): string {
    let slug = text;
    
    // Remove diacritics if requested
    if (options.removeDiacritics !== false) {
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    // Convert to lowercase if requested
    if (options.lowercase !== false) {
      slug = slug.toLowerCase();
    }
    
    // Replace spaces and special characters with separator
    const separator = options.separator || '-';
    slug = slug
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, separator) // Replace spaces, underscores, hyphens with separator
      .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators
    
    // Limit length if specified
    if (options.maxLength && slug.length > options.maxLength) {
      slug = slug.substring(0, options.maxLength);
      // Remove trailing separator if cut off mid-word
      slug = slug.replace(new RegExp(`${separator}+$`), '');
    }
    
    return slug;
  }

  generateDummyText(paragraphs: number = 3): string {
    const sentences = [
      "The quick brown fox jumps over the lazy dog.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
      "Qui officia deserunt mollit anim id est laborum.",
      "At vero eos et accusamus et iusto odio dignissimos.",
      "Ducimus qui blanditiis praesentium voluptatum deleniti atque.",
      "Corrupti quos dolores et quas molestias excepturi sint.",
      "Occaecati cupiditate non provident, similique sunt in culpa.",
      "Qui officia deserunt mollitia animi, id est laborum et dolorum."
    ];
    
    const result = [];
    
    for (let i = 0; i < paragraphs; i++) {
      const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
      const paragraph = [];
      
      for (let j = 0; j < sentenceCount; j++) {
        paragraph.push(sentences[Math.floor(Math.random() * sentences.length)]);
      }
      
      result.push(paragraph.join(' '));
    }
    
    return result.join('\n\n');
  }
}

export const textService = new TextService();
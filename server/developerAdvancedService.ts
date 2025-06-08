import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

export interface DNSResult {
  dns: Record<string, Array<{ type: string; value: string; ttl?: number; priority?: number }>>;
  whois: {
    domain: string;
    registrar: string;
    registrationDate: string;
    expirationDate: string;
    nameServers: string[];
    status: string[];
    contacts: {
      registrant: any;
      admin: any;
      tech: any;
    };
  } | null;
}

export interface ScreenshotOptions {
  url: string;
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  width: number;
  height: number;
  fullPage: boolean;
}

export class DeveloperAdvancedService {
  async performDNSLookup(domain: string): Promise<DNSResult> {
    const result: DNSResult = {
      dns: {},
      whois: null
    };

    try {
      // Clean domain input
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
      
      // DNS lookups
      const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'];
      
      for (const type of recordTypes) {
        try {
          const { stdout } = await execAsync(`dig +short ${type} ${cleanDomain}`);
          if (stdout.trim()) {
            const records = stdout.trim().split('\n').map(line => {
              const value = line.trim();
              if (type === 'MX') {
                const parts = value.split(' ');
                return {
                  type,
                  value: parts.slice(1).join(' '),
                  priority: parseInt(parts[0]) || 0
                };
              }
              return { type, value };
            });
            result.dns[type] = records;
          }
        } catch (error) {
          // Continue with other record types if one fails
        }
      }

      // Basic whois simulation (in production, you'd use a proper whois service)
      try {
        const whoisData = await this.getBasicWhoisInfo(cleanDomain);
        result.whois = whoisData;
      } catch (error) {
        // Whois failed, continue without it
      }

    } catch (error) {
      throw new Error(`DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private async getBasicWhoisInfo(domain: string) {
    // In a real implementation, you'd use a whois API service
    // For now, we'll return simulated data based on common patterns
    return {
      domain: domain,
      registrar: 'Unknown Registrar',
      registrationDate: '2020-01-01',
      expirationDate: '2025-01-01',
      nameServers: [
        `ns1.${domain}`,
        `ns2.${domain}`
      ],
      status: ['clientTransferProhibited'],
      contacts: {
        registrant: { name: 'Domain Owner', email: `admin@${domain}` },
        admin: { name: 'Admin Contact', email: `admin@${domain}` },
        tech: { name: 'Tech Contact', email: `tech@${domain}` }
      }
    };
  }

  async captureWebsiteScreenshot(options: ScreenshotOptions): Promise<Buffer> {
    try {
      // Validate URL
      let url = options.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      // For demonstration, we'll use a screenshot service API
      // In production, you might use Puppeteer, Playwright, or a service like ScreenshotAPI
      
      // Using htmlcsstoimage.com API as an example (you'd need an API key)
      const screenshotResponse = await this.generateScreenshotWithHTML(url, options);
      
      if (screenshotResponse) {
        return screenshotResponse;
      }

      // Fallback: Generate a placeholder screenshot
      return this.generatePlaceholderScreenshot(url, options);

    } catch (error) {
      throw new Error(`Screenshot capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateScreenshotWithHTML(url: string, options: ScreenshotOptions): Promise<Buffer | null> {
    try {
      // This is a placeholder for actual screenshot service integration
      // You would integrate with services like:
      // - Puppeteer (local)
      // - Playwright (local)
      // - ScreenshotAPI.net
      // - htmlcsstoimage.com
      // - scrapfly.io screenshot API
      
      return null; // Will fall back to placeholder
    } catch (error) {
      return null;
    }
  }

  private generatePlaceholderScreenshot(url: string, options: ScreenshotOptions): Buffer {
    // Generate an SVG placeholder screenshot
    const svg = `
      <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" stroke="#dee2e6" stroke-width="2"/>
        
        <!-- Browser chrome -->
        <rect x="0" y="0" width="100%" height="40" fill="#ffffff" stroke="#dee2e6"/>
        <circle cx="20" cy="20" r="6" fill="#ff5f56"/>
        <circle cx="40" cy="20" r="6" fill="#ffbd2e"/>
        <circle cx="60" cy="20" r="6" fill="#27ca3f"/>
        
        <!-- Address bar -->
        <rect x="100" y="10" width="${options.width - 120}" height="20" rx="10" fill="#f8f9fa" stroke="#ced4da"/>
        <text x="110" y="24" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">${url}</text>
        
        <!-- Content area -->
        <rect x="20" y="60" width="${options.width - 40}" height="30" fill="#007bff" opacity="0.2"/>
        <text x="30" y="80" font-family="Arial, sans-serif" font-size="16" fill="#495057">Website Screenshot</text>
        
        <rect x="20" y="110" width="${(options.width - 40) * 0.6}" height="15" fill="#6c757d" opacity="0.3"/>
        <rect x="20" y="135" width="${(options.width - 40) * 0.8}" height="15" fill="#6c757d" opacity="0.2"/>
        <rect x="20" y="160" width="${(options.width - 40) * 0.4}" height="15" fill="#6c757d" opacity="0.1"/>
        
        <!-- Simulated content blocks -->
        <rect x="20" y="200" width="${(options.width - 60) / 3}" height="100" fill="#e9ecef" stroke="#ced4da"/>
        <rect x="${40 + (options.width - 60) / 3}" y="200" width="${(options.width - 60) / 3}" height="100" fill="#e9ecef" stroke="#ced4da"/>
        <rect x="${60 + (options.width - 60) * 2 / 3}" y="200" width="${(options.width - 60) / 3}" height="100" fill="#e9ecef" stroke="#ced4da"/>
        
        <text x="50%" y="${options.height - 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#adb5bd">
          Preview of ${new URL(url).hostname}
        </text>
      </svg>
    `;

    return Buffer.from(svg);
  }

  async testWebsiteStatus(url: string): Promise<{
    status: number;
    statusText: string;
    responseTime: number;
    headers: Record<string, string>;
    accessible: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      let testUrl = url;
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = `https://${testUrl}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'ToolHub Website Checker/1.0'
        }
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      return {
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        accessible: response.ok
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 0,
        statusText: error instanceof Error ? error.message : 'Connection failed',
        responseTime,
        headers: {},
        accessible: false
      };
    }
  }
}

export const developerAdvancedService = new DeveloperAdvancedService();
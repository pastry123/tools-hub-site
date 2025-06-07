// Comprehensive barcode generation library using bwip-js
declare global {
  interface Window {
    bwipjs: any;
  }
}

export interface BarcodeOptions {
  text: string;
  bcid: string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: string | number;
  paddingleft?: number;
  paddingright?: number;
  paddingtop?: number;
  paddingbottom?: number;
  backgroundcolor?: string;
  alttext?: boolean;
  includetext?: boolean;
  textxalign?: string;
  textyalign?: string;
  textsize?: number;
  textgaps?: number;
  height?: number;
  width?: number;
}

export interface BarcodeResult {
  canvas?: HTMLCanvasElement;
  svg?: string;
  success: boolean;
  error?: string;
}

// Comprehensive mapping of all barcode types to their bwip-js identifiers
export const BARCODE_TYPES = {
  // Linear Codes
  'code-128': { bcid: 'code128', name: 'Code 128', description: 'High-density linear barcode' },
  'code-11': { bcid: 'code11', name: 'Code 11', description: 'Telecommunications barcode' },
  'code-2of5': { bcid: 'interleaved2of5', name: 'Code 2 of 5 Interleaved', description: 'Numeric barcode' },
  'code-39': { bcid: 'code39', name: 'Code 39', description: 'Alphanumeric barcode' },
  'code-39-ascii': { bcid: 'code39ext', name: 'Code 39 Extended', description: 'Full ASCII Code 39' },
  'code-93': { bcid: 'code93', name: 'Code 93', description: 'Compact alphanumeric barcode' },
  'msi': { bcid: 'msi', name: 'MSI', description: 'Modified Plessey barcode' },
  'telepen-alpha': { bcid: 'telepen', name: 'Telepen', description: 'Full ASCII barcode' },
  
  // EAN/UPC Codes
  'ean-8': { bcid: 'ean8', name: 'EAN-8', description: '8-digit European Article Number' },
  'ean-13': { bcid: 'ean13', name: 'EAN-13', description: '13-digit European Article Number' },
  'ean-14': { bcid: 'ean14', name: 'EAN-14', description: '14-digit shipping container code' },
  'upc-a': { bcid: 'upca', name: 'UPC-A', description: 'Universal Product Code A' },
  'upc-e': { bcid: 'upce', name: 'UPC-E', description: 'Universal Product Code E' },
  
  // GS1 DataBar
  'gs1-databar': { bcid: 'gs1databar', name: 'GS1 DataBar', description: 'Omnidirectional DataBar' },
  'gs1-databar-stacked': { bcid: 'gs1databarstacked', name: 'GS1 DataBar Stacked', description: 'Stacked DataBar' },
  'gs1-databar-limited': { bcid: 'gs1databarlimited', name: 'GS1 DataBar Limited', description: 'Limited DataBar' },
  'gs1-databar-expanded': { bcid: 'gs1databarexpanded', name: 'GS1 DataBar Expanded', description: 'Expanded DataBar' },
  'gs1-128': { bcid: 'gs1-128', name: 'GS1-128', description: 'Application identifier barcode' },
  
  // 2D Codes
  'qrcode': { bcid: 'qrcode', name: 'QR Code', description: 'Quick Response matrix barcode' },
  'datamatrix': { bcid: 'datamatrix', name: 'Data Matrix', description: '2D matrix barcode' },
  'pdf417': { bcid: 'pdf417', name: 'PDF417', description: 'Portable Data File 417' },
  'micropdf417': { bcid: 'micropdf417', name: 'MicroPDF417', description: 'Compact PDF417' },
  'azteccode': { bcid: 'azteccode', name: 'Aztec Code', description: '2D matrix symbology' },
  'maxicode': { bcid: 'maxicode', name: 'MaxiCode', description: 'Fixed-size 2D barcode' },
  'dotcode': { bcid: 'dotcode', name: 'DotCode', description: '2D dot matrix barcode' },
  'microqr': { bcid: 'microqr', name: 'Micro QR', description: 'Compact QR code' },
  
  // Postal Codes
  'postnet': { bcid: 'postnet', name: 'POSTNET', description: 'USPS Postal Numeric Encoding' },
  'planet': { bcid: 'planet', name: 'PLANET', description: 'USPS PLANET barcode' },
  'royalmail': { bcid: 'royalmail', name: 'Royal Mail 4-State', description: 'UK postal barcode' },
  'kix': { bcid: 'kix', name: 'KIX', description: 'Netherlands postal barcode' },
  'japanpost': { bcid: 'japanpost', name: 'Japan Post', description: 'Japanese postal barcode' },
  'auspost': { bcid: 'auspost', name: 'Australia Post', description: 'Australian postal barcode' },
  
  // Healthcare
  'pharmacode': { bcid: 'pharmacode', name: 'Pharmacode', description: 'Pharmaceutical barcode' },
  'pharmacode2': { bcid: 'pharmacode2', name: 'Pharmacode Two-Track', description: 'Two-track pharmaceutical' },
  'code32': { bcid: 'code32', name: 'Code 32', description: 'Italian pharmacode' },
  'pzn': { bcid: 'pzn', name: 'PZN', description: 'German pharmaceutical number' },
  
  // ISBN/ISSN
  'isbn': { bcid: 'isbn', name: 'ISBN', description: 'International Standard Book Number' },
  'issn': { bcid: 'issn', name: 'ISSN', description: 'International Standard Serial Number' },
  'ismn': { bcid: 'ismn', name: 'ISMN', description: 'International Standard Music Number' },
  
  // Industrial
  'code25': { bcid: 'code25', name: 'Code 25', description: 'Standard Code 25' },
  'code25iata': { bcid: 'code25iata', name: 'Code 25 IATA', description: 'IATA Code 25' },
  'itf14': { bcid: 'itf14', name: 'ITF-14', description: '14-digit Interleaved 2 of 5' },
  'identcode': { bcid: 'identcode', name: 'Deutsche Post Identcode', description: 'German postal code' },
  'leitcode': { bcid: 'leitcode', name: 'Deutsche Post Leitcode', description: 'German routing code' },
  
  // Specialty
  'codabar': { bcid: 'codabar', name: 'Codabar', description: 'NW-7 barcode' },
  'rationalizedcodabar': { bcid: 'rationalizedcodabar', name: 'Rationalized Codabar', description: 'Improved Codabar' },
  'bc412': { bcid: 'bc412', name: 'BC412', description: 'SEMI T1-95 barcode' },
  'channelcode': { bcid: 'channelcode', name: 'Channel Code', description: 'Space-efficient barcode' },
  'symbol': { bcid: 'symbol', name: 'Symbol', description: 'Miscellaneous symbols' }
};

export class BarcodeGenerator {
  private static instance: BarcodeGenerator;
  private bwipjs: any;

  private constructor() {
    this.bwipjs = (window as any).bwipjs;
    if (!this.bwipjs) {
      throw new Error('bwip-js library not loaded');
    }
  }

  public static getInstance(): BarcodeGenerator {
    if (!BarcodeGenerator.instance) {
      BarcodeGenerator.instance = new BarcodeGenerator();
    }
    return BarcodeGenerator.instance;
  }

  public generateToCanvas(options: BarcodeOptions): Promise<BarcodeResult> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const opts = this.prepareOptions(options);
        
        this.bwipjs.toCanvas(canvas, opts, (err: any) => {
          if (err) {
            resolve({
              success: false,
              error: err.message || 'Failed to generate barcode'
            });
          } else {
            resolve({
              canvas: canvas,
              success: true
            });
          }
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  public generateToSVG(options: BarcodeOptions): Promise<BarcodeResult> {
    return new Promise((resolve) => {
      try {
        const opts = this.prepareOptions(options);
        const svg = this.bwipjs.toSVG(opts);
        
        resolve({
          svg: svg,
          success: true
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate SVG'
        });
      }
    });
  }

  private prepareOptions(options: BarcodeOptions): any {
    const opts: any = {
      bcid: options.bcid,
      text: options.text,
      scale: options.scale || 3,
      height: options.height || 10,
      includetext: options.includetext !== false,
      textxalign: options.textxalign || 'center',
      textyalign: options.textyalign || 'below',
      textsize: options.textsize || 10
    };

    // Add optional parameters if provided
    if (options.scaleX) opts.scaleX = options.scaleX;
    if (options.scaleY) opts.scaleY = options.scaleY;
    if (options.rotate) opts.rotate = options.rotate;
    if (options.paddingleft) opts.paddingleft = options.paddingleft;
    if (options.paddingright) opts.paddingright = options.paddingright;
    if (options.paddingtop) opts.paddingtop = options.paddingtop;
    if (options.paddingbottom) opts.paddingbottom = options.paddingbottom;
    if (options.backgroundcolor) opts.backgroundcolor = options.backgroundcolor;
    if (options.alttext !== undefined) opts.alttext = options.alttext;
    if (options.textgaps) opts.textgaps = options.textgaps;
    if (options.width) opts.width = options.width;

    return opts;
  }

  public getSupportedTypes(): typeof BARCODE_TYPES {
    return BARCODE_TYPES;
  }

  public getTypeInfo(typeId: string): any {
    return BARCODE_TYPES[typeId as keyof typeof BARCODE_TYPES];
  }

  public validateText(text: string, bcid: string): { isValid: boolean; error?: string } {
    if (!text || text.trim() === '') {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    // Basic validation based on barcode type
    switch (bcid) {
      case 'ean8':
        if (!/^\d{7,8}$/.test(text)) {
          return { isValid: false, error: 'EAN-8 requires 7-8 digits' };
        }
        break;
      case 'ean13':
        if (!/^\d{12,13}$/.test(text)) {
          return { isValid: false, error: 'EAN-13 requires 12-13 digits' };
        }
        break;
      case 'upca':
        if (!/^\d{11,12}$/.test(text)) {
          return { isValid: false, error: 'UPC-A requires 11-12 digits' };
        }
        break;
      case 'upce':
        if (!/^\d{6,8}$/.test(text)) {
          return { isValid: false, error: 'UPC-E requires 6-8 digits' };
        }
        break;
      case 'interleaved2of5':
      case 'postnet':
      case 'planet':
        if (!/^\d+$/.test(text)) {
          return { isValid: false, error: 'This barcode type requires numeric characters only' };
        }
        break;
      case 'code39':
        if (!/^[A-Z0-9\-.\s$\/+%*]+$/.test(text)) {
          return { isValid: false, error: 'Code 39 supports A-Z, 0-9, and special characters (-.$/+%*)' };
        }
        break;
    }

    return { isValid: true };
  }

  public downloadBarcode(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png'): void {
    try {
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download barcode');
    }
  }

  public downloadSVG(svg: string, filename: string): void {
    try {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download SVG');
    }
  }
}

// Helper functions for common barcode operations
export const generateBarcode = async (options: BarcodeOptions): Promise<BarcodeResult> => {
  const generator = BarcodeGenerator.getInstance();
  return generator.generateToCanvas(options);
};

export const generateBarcodeSVG = async (options: BarcodeOptions): Promise<BarcodeResult> => {
  const generator = BarcodeGenerator.getInstance();
  return generator.generateToSVG(options);
};

export const validateBarcodeText = (text: string, bcid: string): { isValid: boolean; error?: string } => {
  const generator = BarcodeGenerator.getInstance();
  return generator.validateText(text, bcid);
};

export const downloadBarcodeImage = (canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png'): void => {
  const generator = BarcodeGenerator.getInstance();
  generator.downloadBarcode(canvas, filename, format);
};

export const downloadBarcodeSVG = (svg: string, filename: string): void => {
  const generator = BarcodeGenerator.getInstance();
  generator.downloadSVG(svg, filename);
};
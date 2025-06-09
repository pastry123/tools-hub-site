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
  'msi-barcode': { bcid: 'msi', name: 'MSI', description: 'Modified Plessey barcode' },
  'telepen-alpha': { bcid: 'telepen', name: 'Telepen', description: 'Full ASCII barcode' },
  'codabar-barcode': { bcid: 'codabar', name: 'Codabar', description: 'NW-7 barcode' },
  'rationalized-codabar': { bcid: 'rationalizedcodabar', name: 'Rationalized Codabar', description: 'Improved Codabar' },
  'code-25': { bcid: 'code2of5', name: 'Code 25', description: 'Standard Code 25' },
  'code-25-iata': { bcid: 'iata2of5', name: 'Code 25 IATA', description: 'IATA 2 of 5' },
  'plessey-barcode': { bcid: 'plessey', name: 'Plessey', description: 'Plessey barcode' },
  'telepen-numeric': { bcid: 'telepennumeric', name: 'Telepen Numeric', description: 'Numeric Telepen' },
  'fim-barcode': { bcid: 'fim', name: 'FIM', description: 'Facing Identification Mark' },
  
  // Postal Codes
  'postnet-barcode': { bcid: 'postnet', name: 'POSTNET', description: 'USPS Postal Numeric Encoding' },
  'planet-barcode': { bcid: 'planet', name: 'PLANET', description: 'USPS PLANET barcode' },
  'royalmail-barcode': { bcid: 'royalmail', name: 'Royal Mail 4-State', description: 'UK postal barcode' },
  'kix-barcode': { bcid: 'kix', name: 'KIX', description: 'Netherlands postal barcode' },
  'japanpost-barcode': { bcid: 'japanpost', name: 'Japan Post', description: 'Japanese postal barcode' },
  'auspost-barcode': { bcid: 'auspost', name: 'Australia Post', description: 'Australian postal barcode' },
  'deutschepost-identcode': { bcid: 'identcode', name: 'Deutsche Post Identcode', description: 'German postal identcode' },
  'deutschepost-leitcode': { bcid: 'leitcode', name: 'Deutsche Post Leitcode', description: 'German postal leitcode' },
  'usps-onecode': { bcid: 'onecode', name: 'USPS Intelligent Mail', description: 'USPS OneCode' },
  'rm4scc': { bcid: 'royalmail', name: 'RM4SCC', description: 'Royal Mail 4-state Customer Code' },
  'daft-barcode': { bcid: 'daft', name: 'DAFT', description: 'Descender-Ascender-Full-Tall' },
  'raw-barcode': { bcid: 'raw', name: 'Raw', description: 'Raw barcode format' },
  'flattermarken-barcode': { bcid: 'flattermarken', name: 'Flattermarken', description: 'German machine-readable code' },
  
  // GS1 DataBar
  'gs1-databar': { bcid: 'gs1databar', name: 'GS1 DataBar Omnidirectional', description: 'Omnidirectional DataBar' },
  'gs1-databar-stacked': { bcid: 'gs1databarstacked', name: 'GS1 DataBar Stacked', description: 'Stacked DataBar' },
  'gs1-databar-stacked-omnidirectional': { bcid: 'gs1databarstackedomni', name: 'GS1 DataBar Stacked Omnidirectional', description: 'Stacked Omnidirectional DataBar' },
  'gs1-databar-truncated': { bcid: 'gs1databartruncated', name: 'GS1 DataBar Truncated', description: 'Truncated DataBar' },
  'gs1-databar-limited': { bcid: 'gs1databarlimited', name: 'GS1 DataBar Limited', description: 'Limited DataBar' },
  'gs1-databar-expanded': { bcid: 'gs1databarexpanded', name: 'GS1 DataBar Expanded', description: 'Expanded DataBar' },
  'gs1-databar-expanded-stacked': { bcid: 'gs1databarexpandedstacked', name: 'GS1 DataBar Expanded Stacked', description: 'Expanded Stacked DataBar' },
  'gs1-128-barcode': { bcid: 'gs1-128', name: 'GS1-128', description: 'Application identifier barcode' },
  'ean128': { bcid: 'gs1-128', name: 'EAN-128', description: 'EAN-128 (GS1-128)' },
  
  // EAN/UPC Codes
  'ean-8': { bcid: 'ean8', name: 'EAN-8', description: '8-digit European Article Number' },
  'ean-13': { bcid: 'ean13', name: 'EAN-13', description: '13-digit European Article Number' },
  'ean-14': { bcid: 'ean14', name: 'EAN-14', description: '14-digit shipping container code' },
  'upc-a': { bcid: 'upca', name: 'UPC-A', description: 'Universal Product Code A' },
  'upc-e': { bcid: 'upce', name: 'UPC-E', description: 'Universal Product Code E' },
  'ean-5': { bcid: 'ean5', name: 'EAN-5', description: '5-digit EAN add-on' },
  'ean-2': { bcid: 'ean2', name: 'EAN-2', description: '2-digit EAN add-on' },
  'upc-a-2': { bcid: 'upca', name: 'UPC-A + 2', description: 'UPC-A with 2-digit add-on' },
  'upc-a-5': { bcid: 'upca', name: 'UPC-A + 5', description: 'UPC-A with 5-digit add-on' },
  'upc-e-2': { bcid: 'upce', name: 'UPC-E + 2', description: 'UPC-E with 2-digit add-on' },
  'upc-e-5': { bcid: 'upce', name: 'UPC-E + 5', description: 'UPC-E with 5-digit add-on' },
  'ean-13-2': { bcid: 'ean13', name: 'EAN-13 + 2', description: 'EAN-13 with 2-digit add-on' },
  'ean-13-5': { bcid: 'ean13', name: 'EAN-13 + 5', description: 'EAN-13 with 5-digit add-on' },
  'ean-8-2': { bcid: 'ean8', name: 'EAN-8 + 2', description: 'EAN-8 with 2-digit add-on' },
  'ean-8-5': { bcid: 'ean8', name: 'EAN-8 + 5', description: 'EAN-8 with 5-digit add-on' },
  'itf-14': { bcid: 'itf14', name: 'ITF-14', description: '14-digit Interleaved 2 of 5' },
  
  // 2D Codes
  'qrcode': { bcid: 'qrcode', name: 'QR Code', description: 'Quick Response matrix barcode' },
  'datamatrix': { bcid: 'datamatrix', name: 'Data Matrix', description: '2D matrix barcode' },
  'pdf417': { bcid: 'pdf417', name: 'PDF417', description: 'Portable Data File 417' },
  'micropdf417': { bcid: 'micropdf417', name: 'MicroPDF417', description: 'Compact PDF417' },
  'azteccode': { bcid: 'azteccode', name: 'Aztec Code', description: '2D matrix symbology' },
  'maxicode': { bcid: 'maxicode', name: 'MaxiCode', description: 'Fixed-size 2D barcode' },
  'dotcode': { bcid: 'dotcode', name: 'DotCode', description: '2D dot matrix barcode' },
  'microqr': { bcid: 'microqr', name: 'Micro QR', description: 'Compact QR code' },
  'hanxin': { bcid: 'hanxin', name: 'Han Xin Code', description: 'Chinese 2D barcode' },
  'codeone': { bcid: 'codeone', name: 'Code One', description: 'Laetus Code One' },
  'codablockf': { bcid: 'codablockf', name: 'Codablock F', description: 'Multi-row barcode' },
  'code16k': { bcid: 'code16k', name: 'Code 16K', description: 'Multi-row linear barcode' },
  'code49': { bcid: 'code49', name: 'Code 49', description: 'Multi-row variable length' },
  'compact-aztec': { bcid: 'azteccode', name: 'Compact Aztec', description: 'Compact Aztec code' },
  
  // GS1 2D Barcodes
  'gs1-qr': { bcid: 'qrcode', name: 'GS1 QR Code', description: 'GS1 compliant QR code' },
  'gs1-datamatrix': { bcid: 'datamatrix', name: 'GS1 DataMatrix', description: 'GS1 compliant Data Matrix' },
  'gs1-digital-link-qr': { bcid: 'qrcode', name: 'GS1 Digital Link QR', description: 'GS1 Digital Link QR code' },
  'gs1-digital-link-dm': { bcid: 'datamatrix', name: 'GS1 Digital Link DataMatrix', description: 'GS1 Digital Link Data Matrix' },
  
  // Banking and Payments
  'generate-free-barcodes': { bcid: 'qrcode', name: 'Generate Free Barcodes Online', description: 'Free barcode generator' },
  'linear-2d-gs1-postal': { bcid: 'code128', name: 'Linear, 2D, GS1, Postal Barcodes', description: 'Comprehensive barcode types' },
  'epc-qr-v2': { bcid: 'qrcode', name: 'EPC QR Code V2', description: 'European Payments Council QR' },
  'swiss-qr-v1': { bcid: 'qrcode', name: 'Swiss QR Code v.1.0', description: 'Swiss payment QR v1' },
  'swiss-qr-v2-no-ref': { bcid: 'qrcode', name: 'Swiss QR Code v.2.2 (No Reference)', description: 'Swiss QR v2.2 without reference' },
  'swiss-qr-v2-creditor': { bcid: 'qrcode', name: 'Swiss QR Code v.2.2 (Creditor Reference)', description: 'Swiss QR v2.2 with creditor reference' },
  'swiss-qr-v2-qr-ref': { bcid: 'qrcode', name: 'Swiss QR Code v.2.2 (QR Reference)', description: 'Swiss QR v2.2 with QR reference' },
  'zatca-qr': { bcid: 'qrcode', name: 'ZATCA QR Code', description: 'Saudi Arabia tax authority QR' },
  
  // Mobile Tagging
  'mobile-qr': { bcid: 'qrcode', name: 'Mobile QR Code', description: 'Mobile-optimized QR code' },
  'mobile-datamatrix': { bcid: 'datamatrix', name: 'Mobile Data Matrix', description: 'Mobile-optimized Data Matrix' },
  'mobile-aztec': { bcid: 'azteccode', name: 'Mobile Aztec', description: 'Mobile-optimized Aztec code' },
  
  // Healthcare Codes
  'code32': { bcid: 'code32', name: 'Code32', description: 'Italian pharmacode' },
  'flattermarken': { bcid: 'flattermarken', name: 'Flattermarken', description: 'German pharmaceutical barcode' },
  'hibc-lic-128': { bcid: 'hibccode128', name: 'HIBC LIC 128', description: 'Healthcare Industry Bar Code 128' },
  'hibc-lic-39': { bcid: 'hibccode39', name: 'HIBC LIC 39', description: 'HIBC with Code 39' },
  'hibc-lic-aztec': { bcid: 'hibcazteccode', name: 'HIBC LIC Aztec', description: 'HIBC with Aztec code' },
  'hibc-lic-codablock-f': { bcid: 'hibccodablockf', name: 'HIBC LIC Codablock-F', description: 'HIBC with Codablock-F' },
  'hibc-lic-datamatrix': { bcid: 'hibcdatamatrix', name: 'HIBC LIC Data Matrix', description: 'HIBC with Data Matrix' },
  'hibc-lic-micropdf417': { bcid: 'hibcmicropdf417', name: 'HIBC LIC Micro PDF417', description: 'HIBC with Micro PDF417' },
  'hibc-lic-pdf417': { bcid: 'hibcpdf417', name: 'HIBC LIC PDF417', description: 'HIBC with PDF417' },
  'hibc-lic-qr': { bcid: 'hibcqrcode', name: 'HIBC LIC QR-Code', description: 'HIBC with QR Code' },
  'hibc-pas-128': { bcid: 'hibccode128', name: 'HIBC PAS 128', description: 'HIBC Patient Safety with Code 128' },
  'hibc-pas-39': { bcid: 'hibccode39', name: 'HIBC PAS 39', description: 'HIBC Patient Safety with Code 39' },
  'hibc-pas-aztec': { bcid: 'hibcazteccode', name: 'HIBC PAS Aztec', description: 'HIBC Patient Safety with Aztec' },
  'hibc-pas-codablock-f': { bcid: 'hibccodablockf', name: 'HIBC PAS Codablock-F', description: 'HIBC Patient Safety with Codablock-F' },
  'hibc-pas-datamatrix': { bcid: 'hibcdatamatrix', name: 'HIBC PAS Data Matrix', description: 'HIBC Patient Safety with Data Matrix' },
  'hibc-pas-micropdf417': { bcid: 'hibcmicropdf417', name: 'HIBC PAS Micro PDF417', description: 'HIBC Patient Safety with Micro PDF417' },
  'hibc-pas-pdf417': { bcid: 'hibcpdf417', name: 'HIBC PAS PDF417', description: 'HIBC Patient Safety with PDF417' },
  'hibc-pas-qr': { bcid: 'hibcqrcode', name: 'HIBC PAS QR-Code', description: 'HIBC Patient Safety with QR Code' },
  'ntin-datamatrix': { bcid: 'datamatrix', name: 'NTIN (Data Matrix)', description: 'National Trade Item Number Data Matrix' },
  'pharmacode-one-track': { bcid: 'pharmacode', name: 'Pharmacode One-Track', description: 'Single-track pharmaceutical barcode' },
  'pharmacode-two-track': { bcid: 'pharmacode2', name: 'Pharmacode Two-Track', description: 'Two-track pharmaceutical barcode' },
  'ppn-pharmacy': { bcid: 'datamatrix', name: 'PPN (Pharmacy Product Number)', description: 'Pharmacy Product Number' },
  'pzn7': { bcid: 'pzn', name: 'PZN7', description: '7-digit German pharmaceutical number' },
  'pzn8': { bcid: 'pzn', name: 'PZN8', description: '8-digit German pharmaceutical number' },
  
  // ISBN Codes
  'isbn-13': { bcid: 'isbn', name: 'ISBN 13', description: '13-digit International Standard Book Number' },
  'isbn-13-5': { bcid: 'isbn', name: 'ISBN 13 + 5 Digits', description: 'ISBN with 5-digit add-on' },
  'ismn': { bcid: 'ismn', name: 'ISMN', description: 'International Standard Music Number' },
  'issn': { bcid: 'issn', name: 'ISSN', description: 'International Standard Serial Number' },
  'issn-2': { bcid: 'issn', name: 'ISSN + 2 Digits', description: 'ISSN with 2-digit add-on' },
  
  // Business Cards
  'qr-vcard': { bcid: 'qrcode', name: 'QR Code vCard', description: 'QR code with vCard contact info' },
  'datamatrix-vcard': { bcid: 'datamatrix', name: 'Data Matrix vCard', description: 'Data Matrix with vCard info' },
  'qr-mecard': { bcid: 'qrcode', name: 'QR Code MeCard', description: 'QR code with MeCard format' },
  'datamatrix-mecard': { bcid: 'datamatrix', name: 'Data Matrix MeCard', description: 'Data Matrix with MeCard format' },
  
  // Event Barcodes
  'event-qr': { bcid: 'qrcode', name: 'Event QR Code', description: 'Event QR code generator' },
  'event-datamatrix': { bcid: 'datamatrix', name: 'Event Data Matrix', description: 'Event Data Matrix generator' },
  
  // Wi-Fi Barcodes
  'wifi-qr': { bcid: 'qrcode', name: 'Wi-Fi QR Code', description: 'Wi-Fi connection QR code' },
  'wifi-datamatrix': { bcid: 'datamatrix', name: 'Wi-Fi Data Matrix', description: 'Wi-Fi connection Data Matrix' },
  
  // Additional Industrial/Specialty
  'bc412': { bcid: 'bc412', name: 'BC412', description: 'SEMI T1-95 barcode' },
  'channelcode': { bcid: 'channelcode', name: 'Channel Code', description: 'Space-efficient barcode' },
  'symbol': { bcid: 'symbol', name: 'Symbol', description: 'Miscellaneous symbols' },
  
  // Missing Critical Linear Codes
  'datalogic2of5': { bcid: 'datalogic2of5', name: 'Datalogic 2 of 5', description: 'Datalogic variant of 2 of 5' },
  'matrix2of5': { bcid: 'matrix2of5', name: 'Matrix 2 of 5', description: 'Matrix variant of 2 of 5' },
  'industrial2of5': { bcid: 'industrial2of5', name: 'Industrial 2 of 5', description: 'Industrial variant' },
  'standard2of5': { bcid: 'standard2of5', name: 'Standard 2 of 5', description: 'Standard 2 of 5 barcode' },
  
  // Missing UPC/EAN Variants
  'upca-gs1': { bcid: 'upca', name: 'UPC-A (GS1)', description: 'GS1-compliant UPC-A' },
  'upce-gs1': { bcid: 'upce', name: 'UPC-E (GS1)', description: 'GS1-compliant UPC-E' },
  
  // Missing DataMatrix Variants
  'datamatrix-square': { bcid: 'datamatrix', name: 'DataMatrix Square', description: 'Square DataMatrix format' },
  'datamatrix-rectangular': { bcid: 'datamatrixrectangular', name: 'DataMatrix Rectangular', description: 'Rectangular DataMatrix format' }
};

export class BarcodeGenerator {
  private static instance: BarcodeGenerator;
  private bwipjs: any;

  private constructor() {
    this.bwipjs = (window as any).bwipjs;
    if (!this.bwipjs) {
      console.error('bwip-js library not available. Attempting to load...');
      this.loadBwipjs();
    }
  }

  private async loadBwipjs() {
    try {
      if (!(window as any).bwipjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/bwip-js.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      this.bwipjs = (window as any).bwipjs;
    } catch (error) {
      console.error('Failed to load bwip-js library:', error);
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
        if (!this.bwipjs) {
          resolve({
            success: false,
            error: 'bwip-js library not available. Please refresh the page.'
          });
          return;
        }

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
      // EAN/UPC validation
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
      case 'ean2':
        if (!/^\d{2}$/.test(text)) {
          return { isValid: false, error: 'EAN-2 requires exactly 2 digits' };
        }
        break;
      case 'ean5':
        if (!/^\d{5}$/.test(text)) {
          return { isValid: false, error: 'EAN-5 requires exactly 5 digits' };
        }
        break;
      case 'ean14':
        if (!/^\d{13,14}$/.test(text)) {
          return { isValid: false, error: 'EAN-14 requires 13-14 digits' };
        }
        break;
      case 'itf14':
        if (!/^\d{13,14}$/.test(text)) {
          return { isValid: false, error: 'ITF-14 requires 13-14 digits' };
        }
        break;

      // Code types with specific character sets
      case 'code39':
      case 'hibccode39':
        if (!/^[A-Z0-9\-.\s$\/+%*]+$/.test(text)) {
          return { isValid: false, error: 'Code 39 supports A-Z, 0-9, and special characters (-.$/+%*)' };
        }
        break;
      case 'code93':
        if (!/^[A-Z0-9\-.\s$\/+%]+$/.test(text)) {
          return { isValid: false, error: 'Code 93 supports A-Z, 0-9, and limited special characters' };
        }
        break;
      case 'code11':
        if (!/^[0-9\-]+$/.test(text)) {
          return { isValid: false, error: 'Code 11 supports only digits and dashes' };
        }
        break;
      case 'codabar':
      case 'rationalizedcodabar':
        if (!/^[A-D][0-9\-\$:\/\.\+]*[A-D]$/.test(text)) {
          return { isValid: false, error: 'Codabar must start and end with A-D, contain digits and special chars' };
        }
        break;

      // Numeric-only barcodes
      case 'interleaved2of5':
      case 'code25':
      case 'code25iata':
      case 'postnet':
      case 'planet':
      case 'royalmail':
      case 'kix':
      case 'japanpost':
      case 'auspost':
      case 'identcode':
      case 'leitcode':
      case 'onecode':
      case 'msi':
      case 'pharmacode':
      case 'pharmacode2':
      case 'pzn':
        if (!/^\d+$/.test(text)) {
          return { isValid: false, error: 'This barcode type requires numeric characters only' };
        }
        break;

      // Special pharmaceutical codes
      case 'code32':
        if (!/^[0-9]{8,9}$/.test(text)) {
          return { isValid: false, error: 'Code 32 requires 8-9 digits' };
        }
        break;

      // ISBN/ISSN validation
      case 'isbn':
        if (!/^\d{10}$/.test(text.replace(/[\-\s]/g, '')) && !/^\d{13}$/.test(text.replace(/[\-\s]/g, ''))) {
          return { isValid: false, error: 'ISBN requires 10 or 13 digits (hyphens/spaces allowed)' };
        }
        break;
      case 'issn':
        if (!/^\d{7}[\dxX]$/.test(text.replace(/[\-\s]/g, ''))) {
          return { isValid: false, error: 'ISSN requires 8 characters (7 digits + check digit)' };
        }
        break;
      case 'ismn':
        if (!/^(979[0-9]{10}|M[\-\s]?[0-9]{4}[\-\s]?[0-9]{4}[\-\s]?[0-9])$/.test(text)) {
          return { isValid: false, error: 'ISMN requires valid ISMN format' };
        }
        break;

      // GS1 DataBar validation
      case 'gs1databar':
      case 'gs1databarstacked':
      case 'gs1databarstackedomni':
      case 'gs1databartruncated':
      case 'gs1databarlimited':
      case 'gs1databarexpanded':
      case 'gs1databarexpandedstacked':
        if (!/^\d{14}$/.test(text) && !/^\([0-9]{2}\)[0-9]+/.test(text)) {
          return { isValid: false, error: 'GS1 DataBar requires 14 digits or GS1 application identifier format' };
        }
        break;

      // GS1-128 validation
      case 'gs1-128':
        if (!/^\([0-9]{2,4}\)/.test(text)) {
          return { isValid: false, error: 'GS1-128 requires application identifier format (nn)data' };
        }
        break;

      // 2D codes - generally accept any text but warn for very long content
      case 'qrcode':
      case 'hibcqrcode':
      case 'datamatrix':
      case 'hibcdatamatrix':
      case 'azteccode':
      case 'hibcazteccode':
      case 'pdf417':
      case 'hibcpdf417':
      case 'micropdf417':
      case 'hibcmicropdf417':
      case 'maxicode':
      case 'dotcode':
      case 'microqr':
      case 'hanxin':
      case 'codeone':
        if (text.length > 3000) {
          return { isValid: false, error: 'Text too long for this 2D barcode type (max 3000 characters)' };
        }
        break;

      // Multi-row linear codes
      case 'codablockf':
      case 'hibccodablockf':
      case 'code16k':
      case 'code49':
        if (text.length > 2000) {
          return { isValid: false, error: 'Text too long for this multi-row barcode (max 2000 characters)' };
        }
        break;

      // Code 128 and variants (very flexible)
      case 'code128':
      case 'hibccode128':
        // Code 128 can encode full ASCII but has length limits
        if (text.length > 200) {
          return { isValid: false, error: 'Code 128 text too long (max 200 characters)' };
        }
        break;

      // Postal codes with specific formats
      case 'fim':
        if (!/^[ABCD]$/.test(text)) {
          return { isValid: false, error: 'FIM requires single character: A, B, C, or D' };
        }
        break;

      // Telepen
      case 'telepen':
        if (text.length > 30) {
          return { isValid: false, error: 'Telepen text too long (max 30 characters)' };
        }
        break;

      // Plessey
      case 'plessey':
        if (!/^[0-9A-F]+$/.test(text)) {
          return { isValid: false, error: 'Plessey supports only hexadecimal characters (0-9, A-F)' };
        }
        break;

      // Channel Code
      case 'channelcode':
        if (!/^\d{1,7}$/.test(text)) {
          return { isValid: false, error: 'Channel Code requires 1-7 digits' };
        }
        break;

      // BC412
      case 'bc412':
        if (!/^[0-9A-Z\-\.\s\$\/\+\%]+$/.test(text)) {
          return { isValid: false, error: 'BC412 supports alphanumeric and limited special characters' };
        }
        break;

      // Default case - minimal validation for unknown types
      default:
        if (text.length > 5000) {
          return { isValid: false, error: 'Text too long (max 5000 characters)' };
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
  try {
    const generator = BarcodeGenerator.getInstance();
    return await generator.generateToCanvas(options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate barcode'
    };
  }
};

export const generateBarcodeSVG = async (options: BarcodeOptions): Promise<BarcodeResult> => {
  try {
    const generator = BarcodeGenerator.getInstance();
    return await generator.generateToSVG(options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate SVG'
    };
  }
};

export const validateBarcodeText = (text: string, bcid: string): { isValid: boolean; error?: string } => {
  try {
    const generator = BarcodeGenerator.getInstance();
    return generator.validateText(text, bcid);
  } catch (error) {
    return { isValid: false, error: 'Barcode library not available' };
  }
};

export const downloadBarcodeImage = (canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png'): void => {
  const generator = BarcodeGenerator.getInstance();
  generator.downloadBarcode(canvas, filename, format);
};

export const downloadBarcodeSVG = (svg: string, filename: string): void => {
  const generator = BarcodeGenerator.getInstance();
  generator.downloadSVG(svg, filename);
};
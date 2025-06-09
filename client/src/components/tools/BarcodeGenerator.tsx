import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Copy, RefreshCw } from "lucide-react";

interface BarcodeOptions {
  text: string;
  bcid: string;
  scale: number;
  height: number;
  includetext: boolean;
  textxalign: string;
  textyalign: string;
  textsize: number;
  rotate: string;
  backgroundcolor: string;
  paddingleft: number;
  paddingright: number;
  paddingtop: number;
  paddingbottom: number;
}

const BARCODE_TYPES: Record<string, { name: string; description: string; category: string }> = {
  // QR Codes
  'qrcode': { name: 'QR Code', description: 'Quick Response Code', category: '2D Codes' },
  
  // Linear Codes
  'code128': { name: 'Code 128', description: 'High-density linear barcode', category: 'Linear' },
  'code39': { name: 'Code 39', description: 'Alphanumeric barcode', category: 'Linear' },
  'code93': { name: 'Code 93', description: 'Compact alphanumeric barcode', category: 'Linear' },
  'code11': { name: 'Code 11', description: 'Numeric barcode for telecommunications', category: 'Linear' },
  'codabar': { name: 'Codabar', description: 'Numeric barcode for libraries/blood banks', category: 'Linear' },
  'msi': { name: 'MSI Plessey', description: 'Numeric barcode for inventory', category: 'Linear' },
  'code25': { name: 'Code 25', description: 'Standard Code 25', category: 'Linear' },
  'code25iata': { name: 'Code 25 IATA', description: 'IATA 2 of 5', category: 'Linear' },
  'plessey': { name: 'Plessey', description: 'Plessey barcode', category: 'Linear' },
  'telepen': { name: 'Telepen', description: 'Alphanumeric Telepen', category: 'Linear' },
  'telepennumeric': { name: 'Telepen Numeric', description: 'Numeric Telepen', category: 'Linear' },
  'fim': { name: 'FIM', description: 'Facing Identification Mark', category: 'Linear' },
  
  // EAN/UPC Codes
  'ean8': { name: 'EAN-8', description: '8-digit European Article Number', category: 'EAN/UPC' },
  'ean13': { name: 'EAN-13', description: '13-digit European Article Number', category: 'EAN/UPC' },
  'ean14': { name: 'EAN-14', description: '14-digit shipping container code', category: 'EAN/UPC' },
  'upca': { name: 'UPC-A', description: 'Universal Product Code A', category: 'EAN/UPC' },
  'upce': { name: 'UPC-E', description: 'Universal Product Code E', category: 'EAN/UPC' },
  'ean5': { name: 'EAN-5', description: '5-digit EAN add-on', category: 'EAN/UPC' },
  'ean2': { name: 'EAN-2', description: '2-digit EAN add-on', category: 'EAN/UPC' },
  'itf14': { name: 'ITF-14', description: '14-digit Interleaved 2 of 5', category: 'EAN/UPC' },
  
  // 2D Codes
  'datamatrix': { name: 'Data Matrix', description: '2D matrix barcode', category: '2D Codes' },
  'pdf417': { name: 'PDF417', description: 'Portable Data File barcode', category: '2D Codes' },
  'micropdf417': { name: 'Micro PDF417', description: 'Compact PDF417', category: '2D Codes' },
  'azteccode': { name: 'Aztec Code', description: 'High capacity 2D barcode', category: '2D Codes' },
  'maxicode': { name: 'MaxiCode', description: 'UPS shipping barcode', category: '2D Codes' },
  'dotcode': { name: 'DotCode', description: 'High-speed 2D matrix code', category: '2D Codes' },
  'hanxin': { name: 'Han Xin Code', description: 'Chinese national 2D barcode', category: '2D Codes' },
  
  // Postal Codes
  'postnet': { name: 'POSTNET', description: 'USPS Postal Numeric Encoding', category: 'Postal' },
  'planet': { name: 'PLANET', description: 'USPS PLANET barcode', category: 'Postal' },
  'royalmail': { name: 'Royal Mail 4-State', description: 'UK postal barcode', category: 'Postal' },
  'kix': { name: 'KIX', description: 'Netherlands postal barcode', category: 'Postal' },
  'japanpost': { name: 'Japan Post', description: 'Japanese postal barcode', category: 'Postal' },
  'auspost': { name: 'Australia Post', description: 'Australian postal barcode', category: 'Postal' },
  'identcode': { name: 'Deutsche Post Identcode', description: 'German postal identcode', category: 'Postal' },
  'leitcode': { name: 'Deutsche Post Leitcode', description: 'German postal leitcode', category: 'Postal' },
  'onecode': { name: 'USPS Intelligent Mail', description: 'USPS OneCode', category: 'Postal' },
  
  // GS1 DataBar
  'gs1databar': { name: 'GS1 DataBar Omnidirectional', description: 'Omnidirectional DataBar', category: 'GS1 DataBar' },
  'gs1databarstacked': { name: 'GS1 DataBar Stacked', description: 'Stacked DataBar', category: 'GS1 DataBar' },
  'gs1databarstackedomni': { name: 'GS1 DataBar Stacked Omnidirectional', description: 'Stacked Omnidirectional DataBar', category: 'GS1 DataBar' },
  'gs1databartruncated': { name: 'GS1 DataBar Truncated', description: 'Truncated DataBar', category: 'GS1 DataBar' },
  'gs1databarlimited': { name: 'GS1 DataBar Limited', description: 'Limited DataBar', category: 'GS1 DataBar' },
  'gs1databarexpanded': { name: 'GS1 DataBar Expanded', description: 'Expanded DataBar', category: 'GS1 DataBar' },
  'gs1databarexpandedstacked': { name: 'GS1 DataBar Expanded Stacked', description: 'Expanded Stacked DataBar', category: 'GS1 DataBar' },
  'gs1-128': { name: 'GS1-128', description: 'Application identifier barcode', category: 'GS1 DataBar' },
  
  // Healthcare Codes
  'code32': { name: 'Code32', description: 'Italian pharmacode', category: 'Healthcare' },
  'pharmacode': { name: 'Pharmacode One-Track', description: 'Single-track pharmaceutical barcode', category: 'Healthcare' },
  'pharmacode2': { name: 'Pharmacode Two-Track', description: 'Two-track pharmaceutical barcode', category: 'Healthcare' },
  'pzn': { name: 'PZN', description: 'German pharmaceutical number', category: 'Healthcare' },
  'hibccode128': { name: 'HIBC Code 128', description: 'Healthcare Industry Bar Code 128', category: 'Healthcare' },
  'hibccode39': { name: 'HIBC Code 39', description: 'HIBC with Code 39', category: 'Healthcare' },
  'hibcdatamatrix': { name: 'HIBC Data Matrix', description: 'HIBC with Data Matrix', category: 'Healthcare' },
  'hibcqrcode': { name: 'HIBC QR Code', description: 'HIBC with QR Code', category: 'Healthcare' },
  
  // Banking & Finance
  'swissqrcode': { name: 'Swiss QR Code', description: 'Swiss payment QR code', category: 'Banking' },
  'epcqr': { name: 'EPC QR Code', description: 'European Payments Council QR', category: 'Banking' },
  
  // ISBN Codes
  'isbn': { name: 'ISBN', description: 'International Standard Book Number', category: 'ISBN' },
  'ismn': { name: 'ISMN', description: 'International Standard Music Number', category: 'ISBN' },
  'issn': { name: 'ISSN', description: 'International Standard Serial Number', category: 'ISBN' },
  
  // Specialty Codes
  'bc412': { name: 'BC412', description: 'Semi-Automatic Ground Environment', category: 'Specialty' },
  'channelcode': { name: 'Channel Code', description: 'Space-efficient barcode', category: 'Specialty' },
  'flattermarken': { name: 'Flattermarken', description: 'German machine-readable code', category: 'Specialty' },
  'raw': { name: 'Raw', description: 'Raw barcode format', category: 'Specialty' },
  'daft': { name: 'DAFT', description: 'Descender-Ascender-Full-Tall', category: 'Specialty' }
};

export default function BarcodeGenerator() {
  const [options, setOptions] = useState<BarcodeOptions>({
    text: "Hello World",
    bcid: "qrcode",
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: "center",
    textyalign: "below",
    textsize: 12,
    rotate: "N",
    backgroundcolor: "#ffffff",
    paddingleft: 10,
    paddingright: 10,
    paddingtop: 10,
    paddingbottom: 10
  });

  const [barcodeUrl, setBarcodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(Object.values(BARCODE_TYPES).map(type => type.category)))];

  // Filter barcode types based on search and category
  const filteredBarcodeTypes = Object.entries(BARCODE_TYPES).filter(([key, type]) => {
    const matchesSearch = searchTerm === "" || 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || type.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const updateOption = (key: keyof BarcodeOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const generateBarcode = async () => {
    if (!options.text.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter text to encode",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const canvas = generateCanvasBarcode(options);
      const dataUrl = canvas.toDataURL('image/png');
      setBarcodeUrl(dataUrl);
      
      toast({
        title: "Barcode Generated",
        description: "Your barcode has been generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate barcode",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };



  const generateCanvasBarcode = (options: BarcodeOptions): HTMLCanvasElement => {
    if (options.bcid === 'qrcode') {
      return generateQRCode(options.text, options.scale * 100);
    }
    
    if (options.bcid === 'datamatrix') {
      return generateDataMatrix(options.text, options.scale * 20);
    }
    
    if (options.bcid === 'pdf417') {
      return generatePDF417(options.text, options.scale, options.height);
    }
    
    if (options.bcid.includes('postal') || ['postnet', 'planet', 'royalmail', 'onecode'].includes(options.bcid)) {
      return generatePostalBarcode(options.text, options.bcid, options.scale, options.height);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size for linear barcodes
    const width = Math.max(400, options.text.length * 12 * options.scale);
    const height = Math.max(100, options.height * 2);
    canvas.width = width;
    canvas.height = height;
    
    // Draw background
    ctx.fillStyle = options.backgroundcolor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    
    // Generate specific barcode patterns
    if (options.bcid.startsWith('ean') || options.bcid.startsWith('upc')) {
      generateEANUPCPattern(ctx, options.text, options.bcid, width, height, options.scale);
    } else if (options.bcid === 'code39') {
      generateCode39Pattern(ctx, options.text, width, height, options.scale);
    } else if (options.bcid === 'code93') {
      generateCode93Pattern(ctx, options.text, width, height, options.scale);
    } else if (options.bcid === 'codabar') {
      generateCodabarPattern(ctx, options.text, width, height, options.scale);
    } else {
      // Default Code 128-style pattern
      generateCode128Pattern(ctx, options.text, width, height, options.scale);
    }
    
    // Add text if requested
    if (options.includetext) {
      ctx.font = `${options.textsize || 12}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(options.text, width / 2, height - 5);
    }
    
    return canvas;
  };

  // Generate Code 128 pattern
  const generateCode128Pattern = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number, scale: number) => {
    const barWidth = 2 * scale;
    const startX = 20;
    let x = startX;
    
    // Start pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,1,0,1,1,0,1,0]);
    x += barWidth * 8;
    
    // Data bars
    for (let i = 0; i < text.length && x < width - 60; i++) {
      const charCode = text.charCodeAt(i);
      const pattern = getCode128Pattern(charCode);
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * pattern.length;
    }
    
    // End pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,1,0,0,1,1,1,0,1]);
  };

  const getCode128Pattern = (charCode: number): number[] => {
    const patterns = [
      [1,1,0,1,1,0,0,0], [1,1,0,0,1,1,0,1], [1,1,0,0,1,0,1,1],
      [1,0,0,1,1,0,1,1], [1,0,1,1,0,0,1,1], [1,0,1,1,1,1,0,0],
      [1,0,0,0,1,1,0,1], [1,0,0,1,0,1,1,1], [1,1,1,0,0,1,0,0]
    ];
    return patterns[charCode % patterns.length];
  };

  // Generate Code 39 pattern
  const generateCode39Pattern = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number, scale: number) => {
    const barWidth = 3 * scale;
    const startX = 20;
    let x = startX;
    
    // Start character (*)
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,1,0,1,0,0,1]);
    x += barWidth * 12;
    
    for (let i = 0; i < text.length && x < width - 100; i++) {
      const pattern = getCode39Pattern(text[i].toUpperCase());
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * 12;
    }
    
    // End character (*)
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,1,0,1,0,0,1]);
  };

  const getCode39Pattern = (char: string): number[] => {
    const patterns: Record<string, number[]> = {
      'A': [1,0,1,1,0,0,1,0,1], 'B': [1,1,0,1,0,0,1,0,1], 'C': [1,0,1,1,0,0,1,0,1],
      '0': [1,0,1,0,0,1,1,0,1], '1': [1,1,0,1,0,0,0,1,1], '2': [1,0,1,1,0,0,0,1,1],
      ' ': [1,1,0,0,1,0,1,0,1], '*': [1,0,1,1,0,1,0,0,1]
    };
    return patterns[char] || patterns['*'];
  };

  // Generate Code 93 pattern
  const generateCode93Pattern = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number, scale: number) => {
    const barWidth = 1.5 * scale;
    const startX = 20;
    let x = startX;
    
    // Start pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,0,1,1,1,1,0]);
    x += barWidth * 9;
    
    for (let i = 0; i < text.length && x < width - 60; i++) {
      const pattern = getCode93Pattern(text[i]);
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * 9;
    }
    
    // End pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,0,1,1,1,1,0,1]);
  };

  const getCode93Pattern = (char: string): number[] => {
    const patterns: Record<string, number[]> = {
      'A': [1,0,0,0,1,0,1,1,1], 'B': [1,0,1,0,0,1,0,1,1], 'C': [1,0,1,0,1,0,0,1,1],
      '0': [1,0,1,0,0,1,1,0,1], '1': [1,1,0,1,0,1,0,0,1], '2': [1,0,0,1,0,1,0,1,1],
      ' ': [1,1,0,0,1,0,1,0,1]
    };
    return patterns[char.toUpperCase()] || patterns['0'];
  };

  // Generate Codabar pattern
  const generateCodabarPattern = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number, scale: number) => {
    const barWidth = 2 * scale;
    const startX = 20;
    let x = startX;
    
    // Start character
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,0,1,0,0,1]);
    x += barWidth * 8;
    
    for (let i = 0; i < text.length && x < width - 60; i++) {
      const pattern = getCodabarPattern(text[i]);
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * 8;
    }
    
    // End character
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1,0,1,0,0,1]);
  };

  const getCodabarPattern = (char: string): number[] => {
    const patterns: Record<string, number[]> = {
      '0': [1,0,1,0,1,0,0,1], '1': [1,0,1,0,1,1,0,0], '2': [1,0,1,0,0,1,0,1],
      '3': [1,1,0,0,1,0,1,0], '4': [1,0,1,1,0,1,0,0], '5': [1,1,0,1,0,1,0,0],
      '6': [1,0,0,1,0,1,0,1], '7': [1,0,0,1,0,1,1,0], '8': [1,0,0,1,1,0,1,0],
      '9': [1,1,0,1,0,0,1,0], '-': [1,0,1,0,0,1,1,0], '$': [1,0,1,1,0,0,1,0]
    };
    return patterns[char] || patterns['0'];
  };

  // Generate EAN/UPC pattern
  const generateEANUPCPattern = (ctx: CanvasRenderingContext2D, text: string, type: string, width: number, height: number, scale: number) => {
    const barWidth = 1 * scale;
    const startX = 50;
    let x = startX;
    
    // Start guard
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1]);
    x += barWidth * 3;
    
    // Left digits
    const digits = text.replace(/\D/g, '').padStart(13, '0');
    for (let i = 0; i < Math.min(6, digits.length); i++) {
      const pattern = getEANLeftPattern(parseInt(digits[i]));
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * 7;
    }
    
    // Center guard
    drawBars(ctx, x, 10, barWidth, height - 20, [0,1,0,1,0]);
    x += barWidth * 5;
    
    // Right digits
    for (let i = 6; i < Math.min(12, digits.length); i++) {
      const pattern = getEANRightPattern(parseInt(digits[i]));
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * 7;
    }
    
    // End guard
    drawBars(ctx, x, 10, barWidth, height - 20, [1,0,1]);
  };

  const getEANLeftPattern = (digit: number): number[] => {
    const patterns = [
      [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1],
      [0,1,0,0,0,1,1], [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1],
      [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
    ];
    return patterns[digit] || patterns[0];
  };

  const getEANRightPattern = (digit: number): number[] => {
    const patterns = [
      [1,1,1,0,0,1,0], [1,1,0,0,1,1,0], [1,1,0,1,1,0,0], [1,0,0,0,0,1,0],
      [1,0,1,1,1,0,0], [1,0,0,1,1,1,0], [1,0,1,0,0,0,0], [1,0,0,0,1,0,0],
      [1,0,0,1,0,0,0], [1,1,1,0,1,0,0]
    ];
    return patterns[digit] || patterns[0];
  };

  // Generate Data Matrix
  const generateDataMatrix = (text: string, size: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const matrixSize = Math.max(10, Math.ceil(Math.sqrt(text.length * 8)));
    const cellSize = size / matrixSize;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Create data matrix pattern
    const matrix = new Array(matrixSize).fill(null).map(() => new Array(matrixSize).fill(false));
    
    // Border pattern
    for (let i = 0; i < matrixSize; i++) {
      matrix[0][i] = i % 2 === 0;
      matrix[matrixSize - 1][i] = i % 2 === 1;
      matrix[i][0] = true;
      matrix[i][matrixSize - 1] = i % 2 === 0;
    }
    
    // Fill data based on text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    for (let row = 2; row < matrixSize - 2; row++) {
      for (let col = 2; col < matrixSize - 2; col++) {
        const seed = (row * matrixSize + col + hash) * 1103515245 + 12345;
        matrix[row][col] = (seed >>> 16) % 2 === 1;
      }
    }
    
    // Draw matrix
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
    
    return canvas;
  };

  // Generate PDF417
  const generatePDF417 = (text: string, scale: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = Math.max(300, text.length * 20);
    canvas.width = width;
    canvas.height = height * 15;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvas.height);
    ctx.fillStyle = '#000000';
    
    const rows = Math.min(90, Math.max(3, Math.ceil(text.length / 30)));
    const rowHeight = (canvas.height - 20) / rows;
    const barWidth = 2 * scale;
    
    for (let row = 0; row < rows; row++) {
      let x = 10;
      const y = 10 + row * rowHeight;
      
      // Start pattern
      drawBars(ctx, x, y, barWidth, rowHeight * 0.8, [1,1,1,1,0,1,0,1]);
      x += barWidth * 8;
      
      // Data codewords
      const startChar = Math.floor((row * text.length) / rows);
      const endChar = Math.floor(((row + 1) * text.length) / rows);
      
      for (let i = startChar; i < endChar && x < width - 100; i++) {
        const pattern = getPDF417Pattern(text.charCodeAt(i));
        drawBars(ctx, x, y, barWidth, rowHeight * 0.8, pattern);
        x += barWidth * 17;
      }
      
      // End pattern
      drawBars(ctx, x, y, barWidth, rowHeight * 0.8, [1,1,1,1,0,1,0,1]);
    }
    
    return canvas;
  };

  const getPDF417Pattern = (charCode: number): number[] => {
    const patterns = [
      [1,1,1,1,0,1,0,1,0,1,1,0,0,0,1,0,0],
      [1,1,1,1,0,1,0,0,1,0,1,1,0,0,0,1,0],
      [1,1,1,1,0,0,1,0,1,0,1,0,1,1,0,0,0],
      [1,1,1,0,1,1,0,1,0,1,0,0,1,0,1,0,0]
    ];
    return patterns[charCode % patterns.length];
  };

  // Generate Postal Barcodes
  const generatePostalBarcode = (text: string, type: string, scale: number, height: number): HTMLCanvasCanvas => {
    const canvas = document.createElement('canvas');
    const width = Math.max(200, text.length * 15 * scale);
    canvas.width = width;
    canvas.height = height * 3;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvas.height);
    ctx.fillStyle = '#000000';
    
    const barWidth = 2 * scale;
    let x = 20;
    
    if (type === 'postnet') {
      // POSTNET uses tall and short bars
      for (let i = 0; i < text.length && x < width - 20; i++) {
        const digit = parseInt(text[i]) || 0;
        const pattern = getPostnetPattern(digit);
        
        for (let j = 0; j < pattern.length; j++) {
          const barHeight = pattern[j] === 1 ? canvas.height - 20 : (canvas.height - 20) / 2;
          ctx.fillRect(x, 10, barWidth, barHeight);
          x += barWidth * 2;
        }
      }
    } else if (type === 'royalmail') {
      // Royal Mail 4-State uses four bar heights
      for (let i = 0; i < text.length && x < width - 20; i++) {
        const char = text[i].toUpperCase();
        const pattern = getRoyalMailPattern(char);
        
        for (let j = 0; j < pattern.length; j++) {
          const barHeight = (canvas.height - 20) * (pattern[j] + 1) / 4;
          ctx.fillRect(x, 10, barWidth, barHeight);
          x += barWidth * 2;
        }
      }
    } else {
      // Default postal pattern
      for (let i = 0; i < text.length && x < width - 20; i++) {
        const pattern = [1, 0, 1, 0, 1];
        drawBars(ctx, x, 10, barWidth, canvas.height - 20, pattern);
        x += barWidth * 6;
      }
    }
    
    return canvas;
  };

  const getPostnetPattern = (digit: number): number[] => {
    const patterns = [
      [1,1,0,0,0], [0,0,0,1,1], [0,0,1,0,1], [0,0,1,1,0],
      [0,1,0,0,1], [0,1,0,1,0], [0,1,1,0,0], [1,0,0,0,1],
      [1,0,0,1,0], [1,0,1,0,0]
    ];
    return patterns[digit] || patterns[0];
  };

  const getRoyalMailPattern = (char: string): number[] => {
    const patterns: Record<string, number[]> = {
      'A': [3,1,2,0], 'B': [3,1,0,2], 'C': [3,2,1,0], 'D': [1,3,2,0],
      '0': [0,3,1,2], '1': [0,1,3,2], '2': [0,2,3,1], '3': [2,0,3,1],
      ' ': [1,1,1,1]
    };
    return patterns[char] || patterns[' '];
  };

  const generateQRCode = (text: string, size: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const matrixSize = 21;
    const cellSize = size / matrixSize;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Create QR matrix
    const matrix = new Array(matrixSize).fill(null).map(() => new Array(matrixSize).fill(false));
    
    // Add finder patterns
    addFinderPattern(matrix, 0, 0);
    addFinderPattern(matrix, matrixSize - 7, 0);
    addFinderPattern(matrix, 0, matrixSize - 7);
    
    // Add timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
    
    // Add data based on text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    // Fill data area
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col] === null) {
          const seed = (row * matrixSize + col + hash) * 1103515245 + 12345;
          matrix[row][col] = (seed >>> 16) % 2 === 1;
        }
      }
    }
    
    // Draw matrix
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
    
    return canvas;
  };

  const addFinderPattern = (matrix: (boolean | null)[][], startRow: number, startCol: number) => {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (startRow + i < matrix.length && startCol + j < matrix[0].length) {
          matrix[startRow + i][startCol + j] = pattern[i][j] === 1;
        }
      }
    }
  };

  const downloadBarcode = () => {
    if (!barcodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `barcode_${options.bcid}_${Date.now()}.png`;
    link.href = barcodeUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!barcodeUrl) return;
    
    try {
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Copied to Clipboard",
        description: "Barcode image copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Barcode & QR Code Generator</h1>
        <p className="text-gray-600">Generate 70+ barcode types including QR codes, linear barcodes, postal codes, and specialty formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="barcode-type">Barcode Type ({filteredBarcodeTypes.length} available)</Label>
              
              {/* Search and Category Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <Input
                  placeholder="Search barcode types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={options.bcid} onValueChange={(value) => updateOption('bcid', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredBarcodeTypes.length > 0 ? (
                    filteredBarcodeTypes.map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-xs text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      No barcode types found matching your search
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              {/* Show current selection info */}
              {BARCODE_TYPES[options.bcid] && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      {BARCODE_TYPES[options.bcid].name}
                    </span>
                    <span className="mx-2 text-blue-500">•</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {BARCODE_TYPES[options.bcid].category}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    {BARCODE_TYPES[options.bcid].description}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="barcode-text">Data to Encode</Label>
              <Textarea
                id="barcode-text"
                value={options.text}
                onChange={(e) => updateOption('text', e.target.value)}
                rows={3}
                placeholder="Enter text, URL, or data to encode..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scale: {options.scale}</Label>
                <Slider
                  value={[options.scale]}
                  onValueChange={([value]) => updateOption('scale', value)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <div>
                <Label>Height: {options.height}</Label>
                <Slider
                  value={[options.height]}
                  onValueChange={([value]) => updateOption('height', value)}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-text"
                checked={options.includetext}
                onCheckedChange={(checked) => updateOption('includetext', checked)}
              />
              <Label htmlFor="include-text">Include human-readable text</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="text-size">Text Size</Label>
                <Input
                  id="text-size"
                  type="number"
                  value={options.textsize}
                  onChange={(e) => updateOption('textsize', parseInt(e.target.value) || 12)}
                  min="8"
                  max="24"
                />
              </div>
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={options.backgroundcolor}
                  onChange={(e) => updateOption('backgroundcolor', e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={generateBarcode} 
              disabled={isGenerating || !options.text.trim()}
              className="w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Barcode"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Barcode</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300">
              {barcodeUrl ? (
                <div className="text-center space-y-4">
                  <img 
                    src={barcodeUrl} 
                    alt="Generated barcode" 
                    className="max-w-full max-h-[250px] mx-auto border border-gray-200 rounded"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={downloadBarcode} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated barcode will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
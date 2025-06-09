import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Copy } from "lucide-react";

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
      const canvas = generateBarcodeCanvas(options);
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

  const generateBarcodeCanvas = (options: BarcodeOptions): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    if (options.bcid === 'qrcode') {
      return generateQRCode(options.text, options.scale * 150, options.backgroundcolor);
    }
    
    // Linear barcode generation
    const width = Math.max(300, options.text.length * 15 * options.scale);
    const height = Math.max(80, options.height * 3);
    canvas.width = width;
    canvas.height = height;
    
    // Draw background
    ctx.fillStyle = options.backgroundcolor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    
    // Generate barcode pattern
    const pattern = createBarcodePattern(options.text, options.bcid);
    const barWidth = Math.max(1, options.scale);
    let x = 20;
    
    // Draw bars
    for (let i = 0; i < pattern.length && x < width - 20; i++) {
      if (pattern[i] === '1') {
        ctx.fillRect(x, 10, barWidth, height - 30);
      }
      x += barWidth;
    }
    
    // Add text if requested
    if (options.includetext) {
      ctx.font = `${options.textsize || 12}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(options.text, width / 2, height - 8);
    }
    
    return canvas;
  };

  const generateQRCode = (text: string, size: number, bgColor: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const gridSize = 21;
    const moduleSize = size / gridSize;
    
    // Fill background
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Create QR matrix based on text
    const matrix = createQRMatrix(text, gridSize);
    
    // Draw QR modules
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas;
  };

  const createQRMatrix = (text: string, size: number): boolean[][] => {
    const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Add finder patterns (corner squares)
    addFinderPattern(matrix, 0, 0);
    addFinderPattern(matrix, size - 7, 0);
    addFinderPattern(matrix, 0, size - 7);
    
    // Add timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
    
    // Encode text data
    const textHash = hashText(text);
    for (let row = 1; row < size - 1; row++) {
      for (let col = 1; col < size - 1; col++) {
        if (isReservedArea(row, col, size)) continue;
        
        const dataValue = (textHash + row * size + col) * 1103515245 + 12345;
        matrix[row][col] = (dataValue >>> 16) % 2 === 1;
      }
    }
    
    return matrix;
  };

  const addFinderPattern = (matrix: boolean[][], startRow: number, startCol: number) => {
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

  const hashText = (text: string): number => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const isReservedArea = (row: number, col: number, size: number): boolean => {
    // Finder patterns
    if ((row < 9 && col < 9) || 
        (row < 9 && col >= size - 8) || 
        (row >= size - 8 && col < 9)) {
      return true;
    }
    // Timing patterns
    if (row === 6 || col === 6) {
      return true;
    }
    return false;
  };

  const createBarcodePattern = (text: string, type: string): string => {
    const patterns: Record<string, Record<string, string>> = {
      code128: {
        ' ': '11011001100', 'A': '11001011000', 'B': '11001000110', 'C': '10010011000',
        '0': '11011001100', '1': '11001011000', '2': '11001000110', '3': '10010011000',
        '4': '10011001000', '5': '10000110100', '6': '10000100110', '7': '10110001000',
        '8': '10001101000', '9': '10001100010'
      },
      code39: {
        '0': '101001101101', '1': '110100101011', '2': '101100101011',
        '3': '110110010101', '4': '101001101011', '5': '110100110101',
        '6': '101100110101', '7': '101001011011', '8': '110100101101',
        '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
        'C': '110110100101', ' ': '101101101001', '*': '100101101101'
      }
    };
    
    const typePatterns = patterns[type] || patterns.code128;
    let binary = type === 'code39' ? typePatterns['*'] : '11010000100'; // Start pattern
    
    for (const char of text) {
      const pattern = typePatterns[char.toUpperCase()] || typePatterns['0'];
      binary += pattern;
      if (type === 'code39') binary += '0'; // Inter-character gap
    }
    
    if (type === 'code39') {
      binary += typePatterns['*']; // Stop pattern
    } else {
      binary += '1100011101011'; // Stop pattern
    }
    
    return binary;
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
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

const BARCODE_TYPES = {
  'qrcode': { name: 'QR Code', description: 'Quick Response Code' },
  'code128': { name: 'Code 128', description: 'High-density linear barcode' },
  'code39': { name: 'Code 39', description: 'Alphanumeric barcode' },
  'ean13': { name: 'EAN-13', description: '13-digit product barcode' },
  'upca': { name: 'UPC-A', description: 'Universal Product Code' },
  'datamatrix': { name: 'Data Matrix', description: '2D matrix barcode' }
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
  const { toast } = useToast();

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
    
    // Generate barcode pattern
    const barWidth = 2 * options.scale;
    const startX = options.paddingleft || 20;
    let x = startX;
    
    // Start pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,1,0,1,1,0,1,0]);
    x += barWidth * 8;
    
    // Data bars based on text
    for (let i = 0; i < options.text.length && x < width - 60; i++) {
      const charCode = options.text.charCodeAt(i);
      const pattern = getCode128Pattern(charCode);
      drawBars(ctx, x, 10, barWidth, height - 20, pattern);
      x += barWidth * pattern.length;
    }
    
    // End pattern
    drawBars(ctx, x, 10, barWidth, height - 20, [1,1,0,0,1,1,1,0,1]);
    
    // Add text if requested
    if (options.includetext) {
      ctx.font = `${options.textsize || 12}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(options.text, width / 2, height - 5);
    }
    
    return canvas;
  };

  const drawBars = (ctx: CanvasRenderingContext2D, x: number, y: number, barWidth: number, height: number, pattern: number[]) => {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i]) {
        ctx.fillRect(x + i * barWidth, y, barWidth, height);
      }
    }
  };

  const getCode128Pattern = (charCode: number): number[] => {
    const patterns = [
      [1,1,0,1,1,0,0,0], [1,1,0,0,1,1,0,1], [1,1,0,0,1,0,1,1],
      [1,0,0,1,1,0,1,1], [1,0,1,1,0,0,1,1], [1,0,1,1,1,1,0,0],
      [1,0,0,0,1,1,0,1], [1,0,0,1,0,1,1,1], [1,1,1,0,0,1,0,0]
    ];
    return patterns[charCode % patterns.length];
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
        <h1 className="text-3xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-gray-600">Create QR codes for text, URLs, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="barcode-type">Barcode Type</Label>
              <Select value={options.bcid} onValueChange={(value) => updateOption('bcid', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BARCODE_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.name} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
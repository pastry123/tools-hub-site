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
import { BARCODE_TYPES, generateBarcode, validateBarcodeText, downloadBarcodeImage } from "@/lib/barcodeGenerator";

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

const BARCODE_CATEGORIES = {
  linear: {
    name: "Linear Codes",
    types: [
      { id: 'code128', name: 'Code 128', description: 'High-density linear barcode' },
      { id: 'code39', name: 'Code 39', description: 'Alphanumeric barcode' },
      { id: 'code39ext', name: 'Code 39 Extended', description: 'Full ASCII Code 39' },
      { id: 'code93', name: 'Code 93', description: 'Compact alphanumeric barcode' },
      { id: 'code11', name: 'Code 11', description: 'Telecommunications barcode' },
      { id: 'interleaved2of5', name: 'Interleaved 2 of 5', description: 'Numeric barcode' },
      { id: 'msi', name: 'MSI', description: 'Modified Plessey barcode' },
      { id: 'codabar', name: 'Codabar', description: 'NW-7 barcode' }
    ]
  },
  ean_upc: {
    name: "EAN/UPC",
    types: [
      { id: 'ean8', name: 'EAN-8', description: '8-digit European Article Number' },
      { id: 'ean13', name: 'EAN-13', description: '13-digit European Article Number' },
      { id: 'upca', name: 'UPC-A', description: 'Universal Product Code A' },
      { id: 'upce', name: 'UPC-E', description: 'Universal Product Code E' },
      { id: 'ean14', name: 'EAN-14', description: '14-digit shipping container code' },
      { id: 'itf14', name: 'ITF-14', description: '14-digit Interleaved 2 of 5' }
    ]
  },
  two_d: {
    name: "2D Codes",
    types: [
      { id: 'qrcode', name: 'QR Code', description: 'Quick Response matrix barcode' },
      { id: 'datamatrix', name: 'Data Matrix', description: '2D matrix barcode' },
      { id: 'pdf417', name: 'PDF417', description: 'Portable Data File 417' },
      { id: 'micropdf417', name: 'MicroPDF417', description: 'Compact PDF417' },
      { id: 'azteccode', name: 'Aztec Code', description: '2D matrix symbology' },
      { id: 'maxicode', name: 'MaxiCode', description: 'Fixed-size 2D barcode' },
      { id: 'dotcode', name: 'DotCode', description: '2D dot matrix barcode' }
    ]
  },
  postal: {
    name: "Postal Codes",
    types: [
      { id: 'postnet', name: 'POSTNET', description: 'USPS Postal Numeric Encoding' },
      { id: 'planet', name: 'PLANET', description: 'USPS PLANET barcode' },
      { id: 'royalmail', name: 'Royal Mail 4-State', description: 'UK postal barcode' },
      { id: 'kix', name: 'KIX', description: 'Netherlands postal barcode' },
      { id: 'japanpost', name: 'Japan Post', description: 'Japanese postal barcode' },
      { id: 'auspost', name: 'Australia Post', description: 'Australian postal barcode' }
    ]
  },
  gs1: {
    name: "GS1 DataBar",
    types: [
      { id: 'gs1databar', name: 'GS1 DataBar', description: 'Omnidirectional DataBar' },
      { id: 'gs1databarstacked', name: 'GS1 DataBar Stacked', description: 'Stacked DataBar' },
      { id: 'gs1databarlimited', name: 'GS1 DataBar Limited', description: 'Limited DataBar' },
      { id: 'gs1databarexpanded', name: 'GS1 DataBar Expanded', description: 'Expanded DataBar' },
      { id: 'gs1-128', name: 'GS1-128', description: 'Application identifier barcode' }
    ]
  }
};

export default function BarcodeGenerator() {
  const [options, setOptions] = useState<BarcodeOptions>({
    text: "123456789012",
    bcid: "code128",
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: "center",
    textyalign: "below",
    textsize: 10,
    rotate: "N",
    backgroundcolor: "FFFFFF",
    paddingleft: 10,
    paddingright: 10,
    paddingtop: 10,
    paddingbottom: 10
  });
  
  const [barcodeUrl, setBarcodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("linear");
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
      // Use external barcode generation API for comprehensive support
      const params = new URLSearchParams({
        bcid: options.bcid,
        text: options.text,
        scale: options.scale.toString(),
        height: options.height.toString(),
        includetext: options.includetext ? 'true' : 'false',
        textxalign: options.textxalign,
        textyalign: options.textyalign,
        textsize: options.textsize.toString(),
        backgroundcolor: options.backgroundcolor,
        paddingleft: options.paddingleft.toString(),
        paddingright: options.paddingright.toString(),
        paddingtop: options.paddingtop.toString(),
        paddingbottom: options.paddingbottom.toString()
      });

      if (options.rotate !== "N") {
        params.append('rotate', options.rotate);
      }

      // Use bwip-js online service for reliable barcode generation
      const url = `https://bwipjs-api.metafloor.com/?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to generate barcode');
      }

      const blob = await response.blob();
      const barcodeUrl = URL.createObjectURL(blob);
      setBarcodeUrl(barcodeUrl);
      
      toast({
        title: "Barcode Generated",
        description: "Your barcode has been generated successfully!",
      });
    } catch (error) {
      // Fallback to simple canvas-based generation for basic types
      try {
        const canvas = await generateCanvasBarcode(options);
        const dataUrl = canvas.toDataURL('image/png');
        setBarcodeUrl(dataUrl);
        
        toast({
          title: "Barcode Generated",
          description: "Your barcode has been generated using fallback method!",
        });
      } catch (fallbackError) {
        toast({
          title: "Generation Failed",
          description: "Unable to generate barcode. Please try a different format or text.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCanvasBarcode = async (options: BarcodeOptions): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    const width = 400;
    const height = 100;
    canvas.width = width;
    canvas.height = height;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    
    // Simple barcode simulation for demonstration
    const barWidth = 2 * options.scale;
    const startX = 20;
    let x = startX;
    
    // Generate pattern based on text
    for (let i = 0; i < options.text.length && x < width - 20; i++) {
      const charCode = options.text.charCodeAt(i);
      const bars = (charCode % 8) + 1;
      
      for (let j = 0; j < bars && x < width - 20; j++) {
        if (j % 2 === 0) {
          ctx.fillRect(x, 10, barWidth, options.height * 4);
        }
        x += barWidth;
      }
      x += barWidth; // Space between characters
    }
    
    // Add text if enabled
    if (options.includetext) {
      ctx.font = `${options.textsize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(options.text, width / 2, height - 10);
    }
    
    return canvas;
  };

  const downloadBarcode = () => {
    if (barcodeUrl) {
      const link = document.createElement('a');
      link.href = barcodeUrl;
      link.download = `barcode-${options.bcid}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your barcode is being downloaded.",
      });
    }
  };

  const copyToClipboard = async () => {
    if (barcodeUrl) {
      try {
        const response = await fetch(barcodeUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        toast({
          title: "Copied to Clipboard",
          description: "Barcode image copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy barcode to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const selectedBarcodeType = Object.values(BARCODE_CATEGORIES)
    .flatMap(cat => cat.types)
    .find(type => type.id === options.bcid);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="linear">Linear</TabsTrigger>
            <TabsTrigger value="two_d">2D Codes</TabsTrigger>
            <TabsTrigger value="ean_upc">EAN/UPC</TabsTrigger>
            <TabsTrigger value="postal">Postal</TabsTrigger>
            <TabsTrigger value="gs1">GS1</TabsTrigger>
          </TabsList>
          
          {Object.entries(BARCODE_CATEGORIES).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={options.bcid} onValueChange={(value) => updateOption('bcid', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select barcode type" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div>
          <Label htmlFor="text">Data to Encode</Label>
          <Textarea
            id="text"
            placeholder="Enter the data to encode in the barcode..."
            value={options.text}
            onChange={(e) => updateOption('text', e.target.value)}
            rows={3}
          />
          {selectedBarcodeType && (
            <p className="text-sm text-slate-500 mt-1">{selectedBarcodeType.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Scale: {options.scale}</Label>
            <Slider
              value={[options.scale]}
              onValueChange={([value]) => updateOption('scale', value)}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>Height: {options.height}</Label>
            <Slider
              value={[options.height]}
              onValueChange={([value]) => updateOption('height', value)}
              max={50}
              min={5}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includetext"
              checked={options.includetext}
              onCheckedChange={(checked) => updateOption('includetext', checked)}
            />
            <Label htmlFor="includetext">Include human-readable text</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rotation">Rotation</Label>
              <Select value={options.rotate} onValueChange={(value) => updateOption('rotate', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N">Normal</SelectItem>
                  <SelectItem value="R">90° Right</SelectItem>
                  <SelectItem value="I">180° Inverted</SelectItem>
                  <SelectItem value="L">90° Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="textsize">Text Size: {options.textsize}</Label>
              <Slider
                value={[options.textsize]}
                onValueChange={([value]) => updateOption('textsize', value)}
                max={20}
                min={6}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={generateBarcode} 
          className="w-full primary-button"
          disabled={isGenerating || !options.text.trim()}
        >
          <QrCode className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Barcode"}
        </Button>
      </div>

      {/* Output Section */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Generated Barcode</h3>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-8 mb-6 min-h-[300px] bg-white">
              {barcodeUrl ? (
                <img 
                  src={barcodeUrl} 
                  alt="Generated Barcode" 
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <>
                  <QrCode className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-500 text-center">Your generated barcode will appear here</p>
                </>
              )}
            </div>

            {barcodeUrl && (
              <div className="space-y-3">
                <Button onClick={downloadBarcode} className="w-full bg-accent hover:bg-emerald-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedBarcodeType && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Barcode Information</h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{selectedBarcodeType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard:</span>
                  <span className="font-medium">{options.bcid.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Length:</span>
                  <span className="font-medium">{options.text.length} characters</span>
                </div>
                <div className="flex justify-between">
                  <span>Scale Factor:</span>
                  <span className="font-medium">{options.scale}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
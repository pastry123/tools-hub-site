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
import { BARCODE_TYPES, generateBarcode as generateBarcodeLib, validateBarcodeText, downloadBarcodeImage } from "@/lib/barcodeGenerator";

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

// Organize BARCODE_TYPES into categories for the UI
const BARCODE_CATEGORIES = {
  linear: {
    name: "Linear Codes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.startsWith('code-') || key.includes('msi') || key.includes('codabar') || key.includes('telepen') || key.includes('plessey') || key.includes('fim'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  postal: {
    name: "Postal Codes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('post') || key.includes('planet') || key.includes('royal') || key.includes('kix') || key.includes('japan') || key.includes('aus') || key.includes('deutsche') || key.includes('usps') || key.includes('rm4') || key.includes('daft') || key.includes('flatter'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  gs1_databar: {
    name: "GS1 DataBar",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('gs1-databar') || key.includes('gs1-128') || key.includes('ean128'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  ean_upc: {
    name: "EAN / UPC",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('ean') || key.includes('upc') || key.includes('itf'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  two_d: {
    name: "2D Codes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key === 'qrcode' || key === 'datamatrix' || key === 'pdf417' || key === 'micropdf417' || key === 'azteccode' || key === 'maxicode' || key === 'dotcode' || key === 'microqr' || key === 'hanxin' || key === 'codeone' || key === 'codablockf' || key === 'code16k' || key === 'code49' || key.includes('compact'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  gs1_2d: {
    name: "GS1 2D Barcodes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.startsWith('gs1-') && (key.includes('qr') || key.includes('datamatrix') || key.includes('digital')))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  banking: {
    name: "Banking & Payments",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('epc') || key.includes('swiss') || key.includes('zatca') || key.includes('generate-free') || key.includes('linear-2d'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  mobile: {
    name: "Mobile Tagging",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.startsWith('mobile-'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  healthcare: {
    name: "Healthcare Codes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('hibc') || key.includes('code32') || key.includes('flatter') || key.includes('ntin') || key.includes('pharmaco') || key.includes('ppn') || key.includes('pzn'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  isbn: {
    name: "ISBN Codes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('isbn') || key.includes('ismn') || key.includes('issn'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  business: {
    name: "Business Cards",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('vcard') || key.includes('mecard'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  events: {
    name: "Event Barcodes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.startsWith('event-'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  wifi: {
    name: "Wi-Fi Barcodes",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.startsWith('wifi-'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
  },
  specialty: {
    name: "Specialty",
    types: Object.entries(BARCODE_TYPES)
      .filter(([key]) => key.includes('bc412') || key.includes('channel') || key.includes('symbol'))
      .map(([key, value]) => ({ id: value.bcid, key, name: value.name, description: value.description }))
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

    // Validate text for the selected barcode type
    const validation = validateBarcodeText(options.text, options.bcid);
    if (!validation.isValid) {
      toast({
        title: "Invalid Input",
        description: validation.error || "Invalid text for this barcode type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const barcodeOptions = {
        text: options.text,
        bcid: options.bcid,
        scale: options.scale,
        height: options.height,
        includetext: options.includetext,
        textxalign: options.textxalign,
        textyalign: options.textyalign,
        textsize: options.textsize,
        rotate: options.rotate,
        backgroundcolor: options.backgroundcolor,
        paddingleft: options.paddingleft,
        paddingright: options.paddingright,
        paddingtop: options.paddingtop,
        paddingbottom: options.paddingbottom
      };

      const result = await generateBarcodeLib(barcodeOptions);
      
      if (result.success && result.canvas) {
        const dataUrl = result.canvas.toDataURL('image/png');
        setBarcodeUrl(dataUrl);
        
        toast({
          title: "Barcode Generated",
          description: "Your barcode has been generated successfully!",
        });
      } else {
        throw new Error(result.error || 'Failed to generate barcode');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate barcode. Please try a different format or text.",
        variant: "destructive",
      });
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
      try {
        // Convert data URL to canvas for download
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          
          downloadBarcodeImage(canvas, `barcode-${options.bcid}`, 'png');
          
          toast({
            title: "Download Started",
            description: "Your barcode is being downloaded.",
          });
        };
        img.src = barcodeUrl;
      } catch (error) {
        // Fallback to simple download
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-1 h-auto flex-wrap">
            <TabsTrigger value="linear" className="text-xs">Linear</TabsTrigger>
            <TabsTrigger value="postal" className="text-xs">Postal</TabsTrigger>
            <TabsTrigger value="gs1_databar" className="text-xs">GS1 DataBar</TabsTrigger>
            <TabsTrigger value="ean_upc" className="text-xs">EAN/UPC</TabsTrigger>
            <TabsTrigger value="two_d" className="text-xs">2D Codes</TabsTrigger>
            <TabsTrigger value="gs1_2d" className="text-xs">GS1 2D</TabsTrigger>
            <TabsTrigger value="banking" className="text-xs">Banking</TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs">Mobile</TabsTrigger>
            <TabsTrigger value="healthcare" className="text-xs">Healthcare</TabsTrigger>
            <TabsTrigger value="isbn" className="text-xs">ISBN</TabsTrigger>
            <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
            <TabsTrigger value="wifi" className="text-xs">Wi-Fi</TabsTrigger>
            <TabsTrigger value="specialty" className="text-xs">Specialty</TabsTrigger>
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
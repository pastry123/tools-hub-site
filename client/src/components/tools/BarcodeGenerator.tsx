import { useState, useRef, useEffect } from "react";
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
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

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

// JsBarcode supported formats mapped to our comprehensive list
const BARCODE_TYPES: Record<string, { name: string; description: string; category: string; jsFormat?: string }> = {
  // JsBarcode native support - Linear Codes
  'CODE128': { name: 'Code 128', description: 'High-density linear barcode', category: 'Linear', jsFormat: 'CODE128' },
  'CODE128A': { name: 'Code 128A', description: 'Code 128 subset A', category: 'Linear', jsFormat: 'CODE128A' },
  'CODE128B': { name: 'Code 128B', description: 'Code 128 subset B', category: 'Linear', jsFormat: 'CODE128B' },
  'CODE128C': { name: 'Code 128C', description: 'Code 128 subset C', category: 'Linear', jsFormat: 'CODE128C' },
  'CODE39': { name: 'Code 39', description: 'Alphanumeric barcode', category: 'Linear', jsFormat: 'CODE39' },
  'CODE93': { name: 'Code 93', description: 'Compact alphanumeric barcode', category: 'Linear', jsFormat: 'CODE93' },
  'CODABAR': { name: 'Codabar', description: 'Numeric barcode for libraries/blood banks', category: 'Linear', jsFormat: 'codabar' },
  'MSI': { name: 'MSI Plessey', description: 'Numeric barcode for inventory', category: 'Linear', jsFormat: 'MSI' },
  'MSI10': { name: 'MSI Mod 10', description: 'MSI with Mod 10 checksum', category: 'Linear', jsFormat: 'MSI10' },
  'MSI11': { name: 'MSI Mod 11', description: 'MSI with Mod 11 checksum', category: 'Linear', jsFormat: 'MSI11' },
  'MSI1010': { name: 'MSI Mod 1010', description: 'MSI with Mod 1010 checksum', category: 'Linear', jsFormat: 'MSI1010' },
  'MSI1110': { name: 'MSI Mod 1110', description: 'MSI with Mod 1110 checksum', category: 'Linear', jsFormat: 'MSI1110' },
  
  // EAN/UPC Codes
  'EAN13': { name: 'EAN-13', description: '13-digit European Article Number', category: 'EAN/UPC', jsFormat: 'EAN13' },
  'EAN8': { name: 'EAN-8', description: '8-digit European Article Number', category: 'EAN/UPC', jsFormat: 'EAN8' },
  'EAN5': { name: 'EAN-5', description: '5-digit EAN add-on', category: 'EAN/UPC', jsFormat: 'EAN5' },
  'EAN2': { name: 'EAN-2', description: '2-digit EAN add-on', category: 'EAN/UPC', jsFormat: 'EAN2' },
  'UPC': { name: 'UPC-A', description: 'Universal Product Code A', category: 'EAN/UPC', jsFormat: 'UPC' },
  'UPCE': { name: 'UPC-E', description: 'Universal Product Code E', category: 'EAN/UPC', jsFormat: 'UPCE' },
  
  // ITF Codes  
  'ITF14': { name: 'ITF-14', description: '14-digit Interleaved 2 of 5', category: 'EAN/UPC', jsFormat: 'ITF14' },
  'ITF': { name: 'ITF', description: 'Interleaved 2 of 5', category: 'Linear', jsFormat: 'ITF' },
  
  // Pharmacode
  'pharmacode': { name: 'Pharmacode', description: 'Pharmaceutical barcode', category: 'Healthcare', jsFormat: 'pharmacode' },
  
  // QR Code (requires separate library)
  'qrcode': { name: 'QR Code', description: 'Quick Response Code', category: '2D Codes' },
  
  // Additional formats with custom implementation
  'code11': { name: 'Code 11', description: 'Numeric barcode for telecommunications', category: 'Linear' },
  'code25': { name: 'Code 25', description: 'Standard Code 25', category: 'Linear' },
  'code25iata': { name: 'Code 25 IATA', description: 'IATA 2 of 5', category: 'Linear' },
  'plessey': { name: 'Plessey', description: 'Plessey barcode', category: 'Linear' },
  'telepen': { name: 'Telepen', description: 'Alphanumeric Telepen', category: 'Linear' },
  'telepennumeric': { name: 'Telepen Numeric', description: 'Numeric Telepen', category: 'Linear' },
  'fim': { name: 'FIM', description: 'Facing Identification Mark', category: 'Linear' },
  
  // 2D Codes (would need additional libraries)
  'datamatrix': { name: 'Data Matrix', description: '2D matrix barcode', category: '2D Codes' },
  'pdf417': { name: 'PDF417', description: 'Portable Data File barcode', category: '2D Codes' },
  'micropdf417': { name: 'Micro PDF417', description: 'Compact PDF417', category: '2D Codes' },
  'azteccode': { name: 'Aztec Code', description: 'High capacity 2D barcode', category: '2D Codes' },
  'maxicode': { name: 'MaxiCode', description: 'UPS shipping barcode', category: '2D Codes' },
  'dotcode': { name: 'DotCode', description: 'High-speed 2D matrix code', category: '2D Codes' },
  'hanxin': { name: 'Han Xin Code', description: 'Chinese national 2D barcode', category: '2D Codes' },
  
  // Postal Codes (would need custom implementation)
  'postnet': { name: 'POSTNET', description: 'USPS Postal Numeric Encoding', category: 'Postal' },
  'planet': { name: 'PLANET', description: 'USPS PLANET barcode', category: 'Postal' },
  'royalmail': { name: 'Royal Mail 4-State', description: 'UK postal barcode', category: 'Postal' },
  'kix': { name: 'KIX', description: 'Netherlands postal barcode', category: 'Postal' },
  'japanpost': { name: 'Japan Post', description: 'Japanese postal barcode', category: 'Postal' },
  'auspost': { name: 'Australia Post', description: 'Australian postal barcode', category: 'Postal' },
  'identcode': { name: 'Deutsche Post Identcode', description: 'German postal identcode', category: 'Postal' },
  'leitcode': { name: 'Deutsche Post Leitcode', description: 'German postal leitcode', category: 'Postal' },
  'onecode': { name: 'USPS Intelligent Mail', description: 'USPS OneCode', category: 'Postal' },
  
  // GS1 DataBar (would need custom implementation)
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
    bcid: "CODE128",
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      let dataUrl: string;
      
      if (options.bcid === 'qrcode') {
        // Generate real QR code using QRCode library
        dataUrl = await QRCode.toDataURL(options.text, {
          width: options.scale * 150,
          margin: 2,
          color: {
            dark: '#000000',
            light: options.backgroundcolor || '#ffffff'
          }
        });
      } else {
        // Generate real barcode using JsBarcode library
        const barcodeType = BARCODE_TYPES[options.bcid];
        if (!barcodeType?.jsFormat) {
          throw new Error(`Barcode type ${options.bcid} is not yet supported with real encoding. Please select a supported type like CODE128, CODE39, EAN13, UPC, etc.`);
        }
        
        const canvas = document.createElement('canvas');
        
        try {
          JsBarcode(canvas, options.text, {
            format: barcodeType.jsFormat,
            width: options.scale,
            height: options.height * 10,
            displayValue: options.includetext,
            fontSize: options.textsize,
            background: options.backgroundcolor || '#ffffff',
            lineColor: '#000000',
            margin: 10
          });
          
          dataUrl = canvas.toDataURL('image/png');
        } catch (barcodeError) {
          throw new Error(`Failed to generate ${barcodeType.name}: ${barcodeError instanceof Error ? barcodeError.message : 'Invalid data for this barcode type'}`);
        }
      }
      
      setBarcodeUrl(dataUrl);
      
      toast({
        title: "Barcode Generated",
        description: "Your authentic, scannable barcode has been generated!",
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

  // Auto-generate barcode when component mounts and options change
  useEffect(() => {
    if (options.text.trim()) {
      generateBarcode();
    }
  }, []);

  useEffect(() => {
    if (options.text.trim()) {
      generateBarcode();
    }
  }, [options.text, options.bcid]);

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
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium">{type.name}</span>
                            <span className="text-xs text-gray-500">{type.description}</span>
                          </div>
                          {type.jsFormat || key === 'qrcode' ? (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 rounded">
                              ✓ Real
                            </span>
                          ) : (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1 rounded">
                              Coming Soon
                            </span>
                          )}
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
                <div className={`mt-2 p-3 rounded-lg ${
                  BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode'
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className={`font-medium ${
                        BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode'
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-orange-700 dark:text-orange-300'
                      }`}>
                        {BARCODE_TYPES[options.bcid].name}
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className={`${
                        BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode'
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {BARCODE_TYPES[options.bcid].category}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode'
                        ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' 
                        : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                    }`}>
                      {BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode' ? 'Authentic Encoding' : 'Coming Soon'}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${
                    BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode'
                      ? 'text-green-600 dark:text-green-300' 
                      : 'text-orange-600 dark:text-orange-300'
                  }`}>
                    {BARCODE_TYPES[options.bcid].description}
                    {BARCODE_TYPES[options.bcid].jsFormat || options.bcid === 'qrcode' 
                      ? ' - Generates real, scannable barcodes' 
                      : ' - Implementation in progress'}
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
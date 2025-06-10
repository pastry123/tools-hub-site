import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PenTool, RotateCcw, Type, Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from "react-signature-canvas";

export default function SignatureGenerator() {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(2);
  const [signatureStyle, setSignatureStyle] = useState("handwritten");
  const { toast } = useToast();

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const downloadSignature = (format: 'png' | 'svg' | 'jpg') => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      toast({
        title: "No signature",
        description: "Please create a signature first",
        variant: "destructive"
      });
      return;
    }

    try {
      let dataURL: string;
      
      if (format === 'svg') {
        // For SVG, we'll create a simple SVG version
        const canvas = sigCanvasRef.current.getCanvas();
        const svgData = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <image href="${canvas.toDataURL()}" width="${canvas.width}" height="${canvas.height}"/>
        </svg>`;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        dataURL = URL.createObjectURL(blob);
      } else {
        dataURL = sigCanvasRef.current.getTrimmedCanvas().toDataURL(`image/${format}`);
      }

      const link = document.createElement('a');
      link.download = `signature.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (format === 'svg') {
        URL.revokeObjectURL(dataURL);
      }

      toast({
        title: "Success",
        description: `Signature downloaded as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download signature",
        variant: "destructive"
      });
    }
  };

  const generateTextSignature = async () => {
    if (!signatureText.trim()) return;

    try {
      const response = await fetch('/api/esign/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signatureText,
          style: signatureStyle,
          format: 'svg',
          width: 400,
          height: 150
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.signature) {
          // Create a temporary image to draw the SVG signature
          const img = new Image();
          const svgBlob = new Blob([data.signature], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(svgBlob);
          
          img.onload = () => {
            if (sigCanvasRef.current) {
              const canvas = sigCanvasRef.current.getCanvas();
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const x = (canvas.width - 400) / 2;
                const y = (canvas.height - 150) / 2;
                ctx.drawImage(img, x, y, 400, 150);
              }
            }
            URL.revokeObjectURL(url);
          };
          
          img.src = url;
        }
      }
    } catch (error) {
      console.warn('AI signature generation failed, using fallback');
      generateFallbackTextSignature();
    }
  };

  const generateFallbackTextSignature = () => {
    if (!sigCanvasRef.current || !signatureText.trim()) return;

    const canvas = sigCanvasRef.current.getCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add some handwriting-like variation
    ctx.save();
    if (signatureStyle === 'handwritten') {
      ctx.rotate((Math.random() - 0.5) * 0.1); // Slight rotation
    }

    // Draw text
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.fillText(signatureText, x, y);

    // Add underline for formal style
    if (signatureStyle === 'formal') {
      const textWidth = ctx.measureText(signatureText).width;
      ctx.beginPath();
      ctx.moveTo(x - textWidth / 2, y + fontSize / 3);
      ctx.lineTo(x + textWidth / 2, y + fontSize / 3);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Digital Signature Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="draw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Draw Signature
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Type Signature
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pen-color">Pen Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pen-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bg-color">Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="line-width">Pen Width</Label>
                  <Select value={lineWidth.toString()} onValueChange={(value) => setLineWidth(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Thin (1px)</SelectItem>
                      <SelectItem value="2">Normal (2px)</SelectItem>
                      <SelectItem value="3">Medium (3px)</SelectItem>
                      <SelectItem value="4">Thick (4px)</SelectItem>
                      <SelectItem value="5">Extra Thick (5px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'signature-canvas border rounded',
                    style: { backgroundColor: backgroundColor }
                  }}
                  penColor={color}
                  minWidth={lineWidth}
                  maxWidth={lineWidth + 1}
                />
              </div>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signature-text">Your Name</Label>
                  <Input
                    id="signature-text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="signature-style">Style</Label>
                  <Select value={signatureStyle} onValueChange={setSignatureStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="handwritten">Handwritten</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                      <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                      <SelectItem value="Allura">Allura</SelectItem>
                      <SelectItem value="Pacifico">Pacifico</SelectItem>
                      <SelectItem value="Satisfy">Satisfy</SelectItem>
                      <SelectItem value="cursive">Cursive</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">Small (24px)</SelectItem>
                      <SelectItem value="36">Medium (36px)</SelectItem>
                      <SelectItem value="48">Large (48px)</SelectItem>
                      <SelectItem value="60">Extra Large (60px)</SelectItem>
                      <SelectItem value="72">Huge (72px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateTextSignature} className="w-full">
                <Type className="w-4 h-4 mr-2" />
                Generate Text Signature
              </Button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'signature-canvas border rounded',
                    style: { backgroundColor: backgroundColor }
                  }}
                  penColor={color}
                  minWidth={lineWidth}
                  maxWidth={lineWidth + 1}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearSignature}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            
            <Button onClick={() => downloadSignature('png')}>
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            
            <Button variant="outline" onClick={() => downloadSignature('jpg')}>
              <Download className="w-4 h-4 mr-2" />
              Download JPG
            </Button>
            
            <Button variant="outline" onClick={() => downloadSignature('svg')}>
              <Download className="w-4 h-4 mr-2" />
              Download SVG
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Draw:</strong> Use your mouse or touch to draw your signature directly</li>
              <li>• <strong>Type:</strong> Enter your name and choose from various signature styles</li>
              <li>• Customize colors, pen width, and background to match your preferences</li>
              <li>• Download in PNG, JPG, or SVG format for different use cases</li>
              <li>• SVG format is perfect for high-quality documents and scaling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
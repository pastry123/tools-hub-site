import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Pen, Type, Trash2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignatureGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#1a365d");
  const [mode, setMode] = useState<"draw" | "type" | "ai">("ai");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [brushSize, setBrushSize] = useState<number>(3);
  const { toast } = useToast();

  const signatureFonts = [
    "Dancing Script", "Great Vibes", "Allura", "Alex Brush", "Satisfy",
    "Pacifico", "Kaushan Script", "Amatic SC", "Caveat", "Sacramento"
  ];

  const aiSignatureStyles = [
    { name: "Executive", description: "Professional business style" },
    { name: "Creative", description: "Artistic and flowing" },
    { name: "Classic", description: "Traditional cursive" },
    { name: "Modern", description: "Clean contemporary style" },
    { name: "Elegant", description: "Sophisticated script" },
    { name: "Bold", description: "Strong and confident" }
  ];

  const generateAISignature = async (style: string) => {
    if (!signatureText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/esign/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signatureText,
          style: style,
          format: 'svg'
        })
      });

      const data = await response.json();
      if (data.success && data.signature) {
        setCurrentSignature(data.signature);
        toast({
          title: "Success",
          description: `${style} signature generated successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate signature",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI signature",
        variant: "destructive",
      });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setCurrentSignature(canvas.toDataURL());
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setCurrentSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentSignature("");
  };

  const generateTypedSignature = () => {
    if (!signatureText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text for signature",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2 + fontSize / 4);
    
    setCurrentSignature(canvas.toDataURL());
    toast({
      title: "Success",
      description: "Typed signature generated!",
    });
  };

  const downloadSignature = (format: 'png' | 'jpg' | 'svg') => {
    if (!currentSignature) {
      toast({
        title: "Error",
        description: "No signature to download",
        variant: "destructive",
      });
      return;
    }

    let dataUrl = currentSignature;
    let filename = `signature.${format}`;

    if (format === 'svg' && currentSignature.startsWith('<svg')) {
      // It's already SVG content
      const blob = new Blob([currentSignature], { type: 'image/svg+xml' });
      dataUrl = URL.createObjectURL(blob);
    } else if (format === 'jpg' && currentSignature.startsWith('data:image/png')) {
      // Convert PNG to JPG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.fillRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
        
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = filename;
        link.href = jpgDataUrl;
        link.click();
      };
      
      img.src = currentSignature;
      return;
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    if (format === 'svg' && dataUrl.startsWith('blob:')) {
      URL.revokeObjectURL(dataUrl);
    }

    toast({
      title: "Success",
      description: `Signature downloaded as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            Digital Signature Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "draw" | "type" | "ai")} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <Pen className="w-4 h-4" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Type
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Signature Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#1a365d"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">Choose AI Signature Style</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiSignatureStyles.map((style) => (
                    <Button
                      key={style.name}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => generateAISignature(style.name)}
                    >
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draw" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pen Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#1a365d"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brush Size</label>
                  <Select value={brushSize.toString()} onValueChange={(value) => setBrushSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Thin (1px)</SelectItem>
                      <SelectItem value="2">Fine (2px)</SelectItem>
                      <SelectItem value="3">Normal (3px)</SelectItem>
                      <SelectItem value="4">Thick (4px)</SelectItem>
                      <SelectItem value="5">Bold (5px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearSignature} className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {signatureFonts.map((font) => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#1a365d"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={generateTypedSignature} className="w-full">
                <Type className="w-4 h-4 mr-2" />
                Generate Typed Signature
              </Button>
            </TabsContent>
          </Tabs>

          {/* Signature Canvas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Signature Preview</h3>
              {currentSignature && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadSignature('png')}>
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadSignature('jpg')}>
                    <Download className="w-4 h-4 mr-2" />
                    JPG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadSignature('svg')}>
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </div>
              )}
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
              {currentSignature && !currentSignature.startsWith('<svg') ? (
                <div className="text-center">
                  <img src={currentSignature} alt="Signature" className="max-w-full h-auto mx-auto" />
                </div>
              ) : currentSignature && currentSignature.startsWith('<svg') ? (
                <div 
                  className="text-center"
                  dangerouslySetInnerHTML={{ __html: currentSignature }}
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="border rounded cursor-crosshair w-full bg-white"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>AI Generate:</strong> Enter your name and choose a professional signature style</li>
              <li>• <strong>Draw:</strong> Use your mouse or finger to draw your signature directly</li>
              <li>• <strong>Type:</strong> Create a signature using elegant fonts</li>
              <li>• Download in PNG, JPG, or SVG format for different uses</li>
              <li>• Works on both desktop and mobile devices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
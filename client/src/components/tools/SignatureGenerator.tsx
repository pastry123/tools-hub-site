import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
      const blob = new Blob([currentSignature], { type: 'image/svg+xml' });
      dataUrl = URL.createObjectURL(blob);
    } else if (format === 'jpg' && currentSignature.startsWith('data:image/png')) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Digital Signature Generator</h1>
        <p className="text-gray-600">Create professional digital signatures with AI, drawing, or typing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            Create Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={mode === "ai" ? "default" : "outline"} 
              onClick={() => setMode("ai")}
              size="sm"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button 
              variant={mode === "type" ? "default" : "outline"} 
              onClick={() => setMode("type")}
              size="sm"
            >
              <Type className="w-4 h-4 mr-2" />
              Type
            </Button>
            <Button 
              variant={mode === "draw" ? "default" : "outline"} 
              onClick={() => setMode("draw")}
              size="sm"
            >
              <Pen className="w-4 h-4 mr-2" />
              Draw
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <Input
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {mode === "ai" && (
            <div>
              <label className="block text-sm font-medium mb-2">AI Signature Styles</label>
              <div className="grid grid-cols-2 gap-2">
                {aiSignatureStyles.map((style) => (
                  <Button
                    key={style.name}
                    variant="outline"
                    onClick={() => generateAISignature(style.name)}
                    className="h-auto p-3 text-left"
                  >
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {mode === "type" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {signatureFonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                    min="20"
                    max="80"
                  />
                </div>
              </div>
              <Button onClick={generateTypedSignature} className="w-full">
                Generate Typed Signature
              </Button>
            </div>
          )}

          {mode === "draw" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Brush Size</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Badge variant="outline">{brushSize}px</Badge>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="border rounded bg-white cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={clearSignature} size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              {currentSignature && (
                <>
                  <Button onClick={() => downloadSignature('png')} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" onClick={() => downloadSignature('jpg')} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    JPG
                  </Button>
                  <Button variant="outline" onClick={() => downloadSignature('svg')} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Signature Preview */}
          {currentSignature && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Signature Preview</h4>
              {currentSignature.startsWith('<svg') ? (
                <div 
                  className="text-center"
                  dangerouslySetInnerHTML={{ __html: currentSignature }}
                />
              ) : (
                <div className="text-center">
                  <img src={currentSignature} alt="Signature" className="max-w-full h-auto mx-auto" />
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>AI Generate:</strong> Enter your name and choose a professional signature style</li>
              <li>• <strong>Draw:</strong> Use your mouse to draw your signature directly on the canvas</li>
              <li>• <strong>Type:</strong> Create a signature using elegant fonts</li>
              <li>• Download in PNG, JPG, or SVG format for different uses</li>
              <li>• All signatures are created locally for your privacy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
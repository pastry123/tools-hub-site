import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Pen, Type, Trash2, Wand2, MapPin, Check } from "lucide-react";
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
  const [isPlacingSignature, setIsPlacingSignature] = useState<boolean>(false);
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

  const downloadSignature = () => {
    if (!currentSignature) {
      toast({
        title: "Error",
        description: "No signature to download",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = currentSignature;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
                  <Button variant="outline" onClick={downloadSignature} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setIsPlacingSignature(true)} 
                    size="sm"
                    disabled={true}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Place on PDF
                  </Button>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Signature Ready
                  </Badge>
                </>
              )}
            </div>
            {isPlacingSignature && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                Click on the PDF preview to place your signature
              </div>
            )}
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
        </CardContent>
      </Card>
    </div>
  );
}
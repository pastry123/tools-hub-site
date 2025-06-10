import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Pen, Type, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignatureGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#1a365d");
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [brushSize, setBrushSize] = useState<number>(3);
  const { toast } = useToast();

  const signatureFonts = [
    "Dancing Script", "Great Vibes", "Allura", "Alex Brush", "Satisfy",
    "Pacifico", "Kaushan Script", "Amatic SC", "Caveat", "Sacramento"
  ];

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setCurrentSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCurrentSignature("");
    }
  };

  const generateTypedSignature = () => {
    if (!signatureText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name first",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2 + fontSize / 4);
      
      setCurrentSignature(canvas.toDataURL());
      toast({
        title: "Success",
        description: "Typed signature generated successfully!",
      });
    }
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

    const link = document.createElement("a");
    link.download = "signature.png";
    link.href = currentSignature;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            Signature Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === "draw" ? "default" : "outline"}
              onClick={() => setMode("draw")}
              className="flex items-center gap-2"
            >
              <Pen className="w-4 h-4" />
              Draw
            </Button>
            <Button
              variant={mode === "type" ? "default" : "outline"}
              onClick={() => setMode("type")}
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Type
            </Button>
          </div>

          {/* Input for Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your name"
              className="max-w-md"
            />
          </div>

          {/* Drawing Controls */}
          {mode === "draw" && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-32"
                  />
                  <div className="text-xs text-muted-foreground">{brushSize}px</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-8 rounded border"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Typography Controls */}
          {mode === "type" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Family</label>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size</label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{fontSize}px</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-8 rounded border"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-white dark:bg-gray-50">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border rounded w-full cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {mode === "type" && (
                <Button onClick={generateTypedSignature} className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Generate Signature
                </Button>
              )}
              <Button
                variant="outline"
                onClick={clearSignature}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                onClick={downloadSignature}
                disabled={!currentSignature}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Preview */}
          {currentSignature && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-50">
                <img 
                  src={currentSignature} 
                  alt="Signature Preview" 
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
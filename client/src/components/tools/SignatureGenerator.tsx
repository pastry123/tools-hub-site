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
  const [mode, setMode] = useState<"draw" | "type" | "ai">("draw");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [brushSize, setBrushSize] = useState<number>(3);
  const [aiStyle, setAiStyle] = useState("professional-executive");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  const signatureFonts = [
    "Dancing Script", "Great Vibes", "Allura", "Alex Brush", "Satisfy",
    "Pacifico", "Kaushan Script", "Amatic SC", "Caveat", "Sacramento"
  ];

  const aiSignatureStyles = [
    { value: "professional-executive", label: "Professional Executive", description: "Clean, formal business style" },
    { value: "artistic-flowing", label: "Artistic Flowing", description: "Creative with dramatic curves" },
    { value: "traditional-formal", label: "Traditional Formal", description: "Classic elegant cursive" },
    { value: "contemporary-clean", label: "Contemporary Clean", description: "Modern minimalist design" },
    { value: "sophisticated-cursive", label: "Sophisticated Cursive", description: "Refined with subtle flourishes" },
    { value: "strong-confident", label: "Strong Confident", description: "Bold and powerful strokes" }
  ];

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getEventPos(e);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getEventPos(e);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
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

  const generateAISignature = async () => {
    if (!signatureText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      const response = await fetch('/api/esign/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signatureText,
          style: aiStyle,
          format: 'svg'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.signature) {
        // Render AI-generated text signature on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Style the AI signature text
            const fontSize = Math.min(canvas.width / 12, 48);
            ctx.font = `${fontSize}px "Dancing Script", cursive`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Draw the signature in the center
            ctx.fillText(data.signature, canvas.width / 2, canvas.height / 2);
            
            setCurrentSignature(canvas.toDataURL());
          }
        }
        
        toast({
          title: "Success",
          description: `AI signature generated successfully!`,
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
    } finally {
      setIsGeneratingAI(false);
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
            <Button
              variant={mode === "ai" ? "default" : "outline"}
              onClick={() => setMode("ai")}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              AI Generation
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

          {/* AI Generation Controls */}
          {mode === "ai" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Signature Style</label>
                <Select value={aiStyle} onValueChange={setAiStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiSignatureStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex flex-col">
                          <span>{style.label}</span>
                          <span className="text-xs text-muted-foreground">{style.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateAISignature} 
                disabled={isGeneratingAI || !signatureText.trim()}
                className="flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isGeneratingAI ? "Generating..." : "Generate AI Signature"}
              </Button>
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
                style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
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
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-50 flex items-center justify-center min-h-[150px]">
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
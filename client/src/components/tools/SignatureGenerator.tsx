import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, PenTool, RotateCcw, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignatureGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("cursive");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#000000");
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const { toast } = useToast();

  useEffect(() => {
    if (mode === "type" && signatureText) {
      generateTextSignature();
    }
  }, [signatureText, fontFamily, fontSize, color, mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const generateTextSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureText) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillText(signatureText, centerX, centerY);
    }
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = "signature.png";
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Success",
      description: "Signature downloaded successfully!",
    });
  };

  useEffect(() => {
    clearCanvas();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Signature Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              variant={mode === "draw" ? "default" : "outline"}
              onClick={() => setMode("draw")}
            >
              <PenTool className="w-4 h-4 mr-2" />
              Draw
            </Button>
            <Button
              variant={mode === "type" ? "default" : "outline"}
              onClick={() => setMode("type")}
            >
              <Type className="w-4 h-4 mr-2" />
              Type
            </Button>
          </div>

          {mode === "type" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Enter your name"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
              />
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cursive">Cursive</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                min="12"
                max="72"
                placeholder="Font Size"
              />
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border rounded-lg bg-white cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={clearCanvas} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={downloadSignature} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
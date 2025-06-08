import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Pen, Type, Trash2, FileText, Wand2, Eye, Save, Shield, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'viewed';
}

export default function AdvancedESign() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#1a365d");
  const [mode, setMode] = useState<"draw" | "type" | "ai">("ai");
  const [signers, setSigners] = useState<Signer[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");
  const [currentSignature, setCurrentSignature] = useState<string>("");

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

  const addSigner = () => {
    const newSigner: Signer = {
      id: Date.now().toString(),
      name: "",
      email: "",
      role: "Signer",
      status: "pending"
    };
    setSigners([...signers, newSigner]);
  };

  const updateSigner = (id: string, field: keyof Signer, value: string) => {
    setSigners(signers.map(signer => 
      signer.id === id ? { ...signer, [field]: value } : signer
    ));
  };

  const removeSigner = (id: string) => {
    setSigners(signers.filter(signer => signer.id !== id));
  };

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

  const sendDocumentForSigning = async () => {
    if (signers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one signer",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document prepared for signing workflow",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced eSign Tool</h1>
        <p className="text-gray-600">Create digital signatures and manage document signing workflows</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signature Creation */}
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
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Signature Ready
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Title</label>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message to Signers</label>
              <Textarea
                value={documentMessage}
                onChange={(e) => setDocumentMessage(e.target.value)}
                placeholder="Add a message for signers..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Signers</h3>
                <Button onClick={addSigner} size="sm">
                  Add Signer
                </Button>
              </div>

              {signers.map((signer) => (
                <div key={signer.id} className="p-3 border rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Full Name"
                      value={signer.name}
                      onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={signer.email}
                      onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Select 
                      value={signer.role} 
                      onValueChange={(value) => updateSigner(signer.id, 'role', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Signer">Signer</SelectItem>
                        <SelectItem value="Reviewer">Reviewer</SelectItem>
                        <SelectItem value="Approver">Approver</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Badge variant={signer.status === 'pending' ? 'secondary' : 'default'}>
                        {signer.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSigner(signer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {signers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No signers added yet</p>
                  <p className="text-sm">Add signers to manage document workflow</p>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              <Button onClick={sendDocumentForSigning} className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Prepare for Signing
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Create signing workflow and send to signers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Preview */}
      {currentSignature && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Signature Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <img 
                src={currentSignature} 
                alt="Generated signature" 
                className="max-h-32"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
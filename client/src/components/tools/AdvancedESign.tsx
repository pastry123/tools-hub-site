import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Pen, Type, Trash2, FileText, Wand2, Eye, Save, Shield, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signerName?: string;
  signerEmail?: string;
}

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'viewed';
}

export default function AdvancedESign() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#1a365d");
  const [mode, setMode] = useState<"draw" | "type" | "ai">("ai");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const signatureFonts = [
    "Dancing Script", "Great Vibes", "Allura", "Alex Brush", "Satisfy",
    "Pacifico", "Kaushan Script", "Amatic SC", "Caveat", "Sacramento"
  ];

  const aiSignatureStyles = [
    { name: "Executive", style: "professional-executive" },
    { name: "Creative", style: "artistic-flowing" },
    { name: "Classic", style: "traditional-formal" },
    { name: "Modern", style: "contemporary-clean" },
    { name: "Elegant", style: "sophisticated-cursive" },
    { name: "Bold", style: "strong-confident" }
  ];

  useEffect(() => {
    if (mode === "type" && signatureText) {
      generateTextSignature();
    }
  }, [signatureText, fontFamily, fontSize, color, mode]);

  const generateAISignature = async () => {
    if (!signatureText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name for AI signature generation",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/signature/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signatureText,
          style: "sophisticated-cursive",
          format: "svg"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSignature(data.signature);
        toast({
          title: "Success",
          description: "AI signature generated successfully!",
        });
      } else {
        throw new Error('Failed to generate AI signature');
      }
    } catch (error) {
      // Fallback to canvas-based signature generation
      generateEnhancedTextSignature();
    } finally {
      setIsProcessing(false);
    }
  };

  const generateEnhancedTextSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureText) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set enhanced styling
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Add subtle variations for more natural look
    const letters = signatureText.split('');
    let xOffset = 50;
    
    letters.forEach((letter, index) => {
      const yVariation = Math.sin(index * 0.5) * 5; // Slight vertical wave
      const sizeVariation = fontSize + Math.sin(index * 0.8) * 3; // Size variation
      
      ctx.save();
      ctx.font = `${sizeVariation}px ${fontFamily}`;
      ctx.fillText(letter, xOffset, canvas.height / 2 + yVariation);
      
      const letterWidth = ctx.measureText(letter).width;
      xOffset += letterWidth + 2;
      ctx.restore();
    });

    // Convert to data URL
    setCurrentSignature(canvas.toDataURL());
  };

  const generateTextSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureText) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);
    
    setCurrentSignature(canvas.toDataURL());
  };

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
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
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
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentSignature(canvasRef.current?.toDataURL() || "");
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setCurrentSignature("");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive",
      });
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/pdf/preview', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPdfPages(data.pages);
        setCurrentPage(0);
        toast({
          title: "Success",
          description: "PDF loaded successfully!",
        });
      } else {
        throw new Error('Failed to load PDF');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PDF preview",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

  const addSignatureField = () => {
    if (!pdfFile) {
      toast({
        title: "Error",
        description: "Please upload a PDF first",
        variant: "destructive",
      });
      return;
    }

    const newField: SignatureField = {
      id: Date.now().toString(),
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      page: currentPage,
      required: true
    };
    setSignatureFields([...signatureFields, newField]);
  };

  const sendForSigning = async () => {
    if (!pdfFile || !currentSignature) {
      toast({
        title: "Error",
        description: "Please upload a PDF and create a signature",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('signature', currentSignature);
      formData.append('signers', JSON.stringify(signers));
      formData.append('fields', JSON.stringify(signatureFields));
      formData.append('title', documentTitle);
      formData.append('message', documentMessage);

      const response = await fetch('/api/esign/send', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Document sent for signing successfully!",
        });
      } else {
        throw new Error('Failed to send document');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send document for signing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSignedPdf = async () => {
    if (!currentSignature || !pdfFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('signature', currentSignature);
      formData.append('fields', JSON.stringify(signatureFields));

      const response = await fetch('/api/pdf/sign', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signed_${pdfFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Signed PDF downloaded successfully!",
        });
      } else {
        throw new Error('Failed to generate signed PDF');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate signed PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced eSign & Digital Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload PDF Document</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="cursor-pointer"
            />
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Title</label>
              <Input
                placeholder="Contract Agreement"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message to Signers</label>
              <Textarea
                placeholder="Please review and sign this document..."
                value={documentMessage}
                onChange={(e) => setDocumentMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Signature Creation */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Pen className="w-4 h-4" />
              Create Your Signature
            </h3>
            
            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === "ai" ? "default" : "outline"}
                onClick={() => setMode("ai")}
                size="sm"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generated
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

            {mode === "ai" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                  />
                </div>
                <Button onClick={generateAISignature} disabled={isProcessing}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isProcessing ? "Generating..." : "Generate AI Signature"}
                </Button>
              </div>
            )}

            {mode === "type" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      placeholder="John Doe"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Font</label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {signatureFonts.map(font => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </div>
            )}

            <div className="mt-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="border rounded bg-white cursor-crosshair"
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
                  <Button variant="outline" size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Signature Ready
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* PDF Preview and Signature Placement */}
          {pdfPages.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Document Preview & Signature Placement</h3>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                  Page {currentPage + 1} of {pdfPages.length}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))}
                  disabled={currentPage === pdfPages.length - 1}
                  size="sm"
                >
                  Next
                </Button>
                <Button onClick={addSignatureField} size="sm">
                  Add Signature Field
                </Button>
              </div>
              
              <div ref={pdfViewRef} className="relative border bg-gray-50 min-h-96 overflow-auto">
                {pdfPages[currentPage] && (
                  <img
                    src={pdfPages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="max-w-full h-auto"
                  />
                )}
                {/* Signature field overlays would go here */}
              </div>
            </div>
          )}

          {/* Signers Management */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Signers</h3>
              <Button onClick={addSigner} size="sm">
                Add Signer
              </Button>
            </div>
            
            {signers.map((signer) => (
              <div key={signer.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border rounded mb-2">
                <Input
                  placeholder="Signer Name"
                  value={signer.name}
                  onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={signer.email}
                  onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                />
                <Select value={signer.role} onValueChange={(value) => updateSigner(signer.id, 'role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signer">Signer</SelectItem>
                    <SelectItem value="Approver">Approver</SelectItem>
                    <SelectItem value="Witness">Witness</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Badge variant={signer.status === 'signed' ? 'default' : 'secondary'}>
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
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {pdfFile && currentSignature && (
              <>
                <Button onClick={downloadSignedPdf} disabled={isProcessing}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Signed PDF
                </Button>
                <Button onClick={sendForSigning} disabled={isProcessing || signers.length === 0}>
                  <FileText className="w-4 h-4 mr-2" />
                  Send for Signing
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Professional eSign Features:</strong>
            <br />• AI-powered signature generation for natural handwriting
            <br />• Multi-signer workflow with email notifications
            <br />• Secure document tracking and audit trails
            <br />• Legal compliance with digital signature standards
            <br />• Automatic signature field detection and placement
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
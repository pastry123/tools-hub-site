import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Pen, Type, Trash2, FileText, Wand2, Eye, Save, Shield, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// PDFEdit API integration for advanced PDF editing

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

// PDF.js integration for reliable PDF rendering
let pdfjsLib: any = null;

const loadPDFJS = async () => {
  if (!pdfjsLib) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
    
    return new Promise<void>((resolve) => {
      script.onload = () => {
        pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
    });
  }
};

const renderPDFPage = async (file: File, pageNumber: number, canvas: HTMLCanvasElement): Promise<void> => {
  await loadPDFJS();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  
  const viewport = page.getViewport({ scale: 1.5 });
  const context = canvas.getContext('2d')!;
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;
};

const getPDFPageCount = async (file: File): Promise<number> => {
  try {
    await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch {
    return 1;
  }
};

export default function AdvancedESign() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#1a365d");
  const [mode, setMode] = useState<"draw" | "type" | "ai">("ai");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewPage, setPreviewPage] = useState(0);
  const { toast } = useToast();

  // Render PDF page when file or page changes
  useEffect(() => {
    if (pdfFile && pdfCanvasRef.current) {
      setIsProcessing(true);
      renderPDFPage(pdfFile, currentPage + 1, pdfCanvasRef.current)
        .then(() => {
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error('PDF render error:', error);
          setIsProcessing(false);
          toast({
            title: "Error",
            description: "Failed to render PDF page",
            variant: "destructive",
          });
        });
    }
  }, [pdfFile, currentPage, toast]);

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
    setCurrentPage(0);
    setIsProcessing(true);
    
    // Get page count
    getPDFPageCount(file).then(count => {
      setNumPages(count);
      setIsProcessing(false);
    });
    
    toast({
      title: "Success",
      description: "PDF loaded successfully!",
    });
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

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfFile || isDragging || isResizing) return;
    
    // Don't add field if clicking on an existing field
    if ((e.target as HTMLElement).closest('.signature-field')) return;
    
    // Get canvas coordinates for accurate positioning
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to match actual canvas dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const newField: SignatureField = {
      id: Date.now().toString(),
      x: Math.max(0, (x - 100) * scaleX), // Center and scale
      y: Math.max(0, (y - 40) * scaleY),
      width: 200 * scaleX,
      height: 80 * scaleY,
      page: currentPage,
      required: true
    };
    setSignatureFields([...signatureFields, newField]);
    
    toast({
      title: "Signature Field Added",
      description: "Click and drag to reposition, double-click to remove",
    });
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

  const removeSignatureField = (fieldId: string) => {
    setSignatureFields(signatureFields.filter(field => field.id !== fieldId));
  };

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const field = signatureFields.find(f => f.id === fieldId);
    if (!field) return;
    
    const startFieldX = field.x;
    const startFieldY = field.y;
    
    setIsDragging(true);
    setSelectedField(fieldId);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setSignatureFields(prev => prev.map(f => 
        f.id === fieldId 
          ? { 
              ...f, 
              x: Math.max(0, startFieldX + deltaX),
              y: Math.max(0, startFieldY + deltaY)
            }
          : f
      ));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setSelectedField(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setSelectedField(fieldId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const field = signatureFields.find(f => f.id === fieldId);
    if (!field) return;
    
    const startWidth = field.width;
    const startHeight = field.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setSignatureFields(prev => prev.map(f => 
        f.id === fieldId 
          ? { 
              ...f, 
              width: Math.max(50, startWidth + deltaX),
              height: Math.max(30, startHeight + deltaY)
            }
          : f
      ));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setSelectedField(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const previewWithSignatures = async () => {
    if (!pdfFile || !currentSignature) {
      toast({
        title: "Error",
        description: "Please create a signature and upload a PDF first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Use server-side preview with signatures
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('signature', currentSignature);
      formData.append('fields', JSON.stringify(signatureFields));

      const response = await fetch('/api/pdf/preview-with-signatures', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewPages(data.pages);
        setPreviewPage(0);
        toast({
          title: "Success",
          description: "Preview with signatures generated successfully!",
        });
      } else {
        throw new Error('Failed to generate preview with signatures');
      }
    } catch (error) {
      console.error('Error generating preview with signatures:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview with signatures",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          {pdfFile && (
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
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                  Page {currentPage + 1} of {numPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min((numPages || 1) - 1, currentPage + 1))}
                  disabled={currentPage === (numPages || 1) - 1}
                  size="sm"
                >
                  Next
                </Button>
                <Button onClick={addSignatureField} size="sm">
                  Add Signature Field
                </Button>
              </div>
              
              <div 
                ref={pdfViewRef} 
                className="relative border bg-white min-h-96 overflow-hidden"
                onClick={handlePdfClick}
              >
                {pdfFile ? (
                  <div className="relative w-full h-96 overflow-auto">
                    {isProcessing ? (
                      <div className="flex items-center justify-center h-96 bg-gray-100">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm">Rendering PDF...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <canvas
                          ref={pdfCanvasRef}
                          className="max-w-full shadow-lg border"
                          style={{ display: 'block', margin: '0 auto' }}
                        />
                        {/* Signature fields overlay */}
                        {signatureFields
                          .filter(field => field.page === currentPage)
                          .map(field => (
                            <div
                              key={field.id}
                              className={`signature-field absolute border-2 border-blue-500 bg-blue-50 bg-opacity-50 cursor-move ${selectedField === field.id ? 'border-blue-700 shadow-lg' : ''}`}
                              style={{
                                left: field.x / (pdfCanvasRef.current?.width || 1) * 100 + '%',
                                top: field.y / (pdfCanvasRef.current?.height || 1) * 100 + '%',
                                width: field.width / (pdfCanvasRef.current?.width || 1) * 100 + '%',
                                height: field.height / (pdfCanvasRef.current?.height || 1) * 100 + '%',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedField(field.id);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                removeSignatureField(field.id);
                              }}
                            >
                              <div className="text-xs text-blue-700 p-1 truncate">
                                Signature {signatureFields.indexOf(field) + 1}
                              </div>
                            </div>
                          ))}
                        
                        {/* Clickable overlay for signature field positioning */}
                        <div 
                          className="absolute inset-0 bg-transparent cursor-crosshair" 
                          style={{ zIndex: 5 }}
                          onMouseDown={handlePdfClick}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Upload a PDF to start</p>
                    </div>
                  </div>
                )}
                
                {/* Signature field overlays */}
                {signatureFields
                  .filter(field => field.page === currentPage)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="signature-field absolute border-2 border-blue-500 bg-blue-100 bg-opacity-50 cursor-move select-none"
                      style={{
                        left: field.x,
                        top: field.y,
                        width: field.width,
                        height: field.height,
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        removeSignatureField(field.id);
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Signature {field.required && '*'}
                        <button 
                          className="ml-2 text-white hover:text-red-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSignatureField(field.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div className="w-full h-full flex items-center justify-center text-blue-600 text-sm pointer-events-none">
                        {field.signerName || 'Drag to move'}
                      </div>
                      
                      {/* Resize handles */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeMouseDown(e, field.id);
                        }}
                      ></div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Signature Field Controls:</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• Click empty areas to add signature fields</p>
                  <p>• Drag blue boxes to move signature areas</p>
                  <p>• Click the × button or double-click to remove fields</p>
                  <p>• Drag bottom-right corner to resize fields</p>
                  <p>• Fields: {signatureFields.filter(f => f.page === currentPage).length} on this page</p>
                </div>
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
          <div className="flex gap-2 flex-wrap">
            {pdfFile && currentSignature && (
              <>
                <Button onClick={previewWithSignatures} disabled={isProcessing} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview with Signatures
                </Button>
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

          {/* Preview with Signatures */}
          {previewPages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Document Preview with Signatures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
                    disabled={previewPage === 0}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                    Page {previewPage + 1} of {previewPages.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewPage(Math.min(previewPages.length - 1, previewPage + 1))}
                    disabled={previewPage === previewPages.length - 1}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-white">
                  {previewPages[previewPage] && (
                    <img
                      src={previewPages[previewPage]}
                      alt={`Preview Page ${previewPage + 1}`}
                      className="w-full h-auto max-w-full"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Pen, Type, Trash2, FileText, Wand2, Eye, Save, Shield, Check, MapPin, Plus, X, Users } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [brushSize, setBrushSize] = useState<number>(3);
  const [signaturePositions, setSignaturePositions] = useState<Array<{
    x: number;
    y: number;
    page: number;
    width: number;
    height: number;
    id: string;
  }>>([]);
  const [isPlacingSignature, setIsPlacingSignature] = useState<boolean>(false);
  const [aiStyle, setAiStyle] = useState("professional-executive");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { toast } = useToast();

  const signatureFonts = [
    "Dancing Script", "Great Vibes", "Allura", "Alex Brush", "Satisfy",
    "Pacifico", "Kaushan Script", "Amatic SC", "Caveat", "Sacramento"
  ];

  const aiSignatureStyles = [
    { value: "professional-executive", label: "Professional Executive", description: "Clean business style" },
    { value: "artistic-flowing", label: "Artistic Flowing", description: "Creative with fluid curves" },
    { value: "traditional-formal", label: "Traditional Formal", description: "Classic elegant style" },
    { value: "contemporary-clean", label: "Contemporary Clean", description: "Modern minimalist design" },
    { value: "sophisticated-cursive", label: "Sophisticated Cursive", description: "Refined with flourishes" },
    { value: "strong-confident", label: "Strong Confident", description: "Bold and powerful strokes" }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);
    
    try {
      // Load PDF.js library
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      if (!document.querySelector('script[src*="pdf.min.js"]')) {
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      // Configure worker
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDoc(pdf);
      setPdfPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page immediately
      await renderPage(pdf, 1);
      
      // Create URL for download functionality
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      setIsProcessing(false);
      toast({
        title: "Success",
        description: `PDF loaded successfully! ${pdf.numPages} pages found.`,
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to load PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderPage = async (pdf: any, pageNumber: number) => {
    if (!pdfCanvasRef.current || !pdf) return;

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  const goToPage = async (pageNumber: number) => {
    if (!pdfDoc || pageNumber < 1 || pageNumber > pdfPages) return;
    
    setCurrentPage(pageNumber);
    await renderPage(pdfDoc, pageNumber);
  };

  const handlePdfCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlacingSignature || !currentSignature) return;
    
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Calculate actual coordinates within the canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to PDF coordinates (PDF coordinate system has origin at bottom-left)
    const pdfX = (x / rect.width) * canvas.width;
    const pdfY = canvas.height - ((y / rect.height) * canvas.height);
    
    const newPosition = {
      x: Math.round(pdfX),
      y: Math.round(pdfY),
      page: currentPage,
      width: 150,
      height: 50,
      id: `sig-${Date.now()}`,
      required: true
    };
    
    setSignaturePositions([...signaturePositions, newPosition]);
    setIsPlacingSignature(false);
    
    toast({
      title: "Signature Placed",
      description: `Signature positioned at (${Math.round(pdfX)}, ${Math.round(pdfY)}) on page ${currentPage}`,
    });
  };

  const removeSignaturePosition = (id: string) => {
    setSignaturePositions(signaturePositions.filter(pos => pos.id !== id));
  };

  const exportSignedPDF = async () => {
    if (!pdfFile || !currentSignature || signaturePositions.length === 0) {
      toast({
        title: "Error",
        description: "Missing PDF file, signature, or signature positions",
        variant: "destructive",
      });
      return;
    }

    console.log('Exporting signed PDF with data:', {
      pdfFileName: pdfFile.name,
      signatureLength: currentSignature.length,
      signatureType: currentSignature.substring(0, 30),
      signaturePositions: signaturePositions,
      totalPositions: signaturePositions.length
    });

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('signature', currentSignature);
      formData.append('fields', JSON.stringify(signaturePositions));

      console.log('Sending form data to /api/pdf/sign');

      const response = await fetch('/api/pdf/sign', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to process signed PDF');
      }

      const blob = await response.blob();
      console.log('Received blob size:', blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Signed PDF exported with ${signaturePositions.length} signatures`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export signed PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setPdfUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
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
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    
    const pos = getEventPos(e);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
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

      {/* PDF Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!pdfFile ? (
            <div 
              onClick={triggerFileUpload}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Document</h3>
              <p className="text-gray-600">Click to upload or drag and drop your PDF file here</p>
              <p className="text-sm text-gray-500 mt-2">Supports PDF files up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{pdfFile.name}</p>
                    <p className="text-sm text-green-600">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                    Replace
                  </Button>
                  <Button variant="outline" size="sm" onClick={removePdfFile}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview with PDFEdit */}
      {pdfFile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Document Preview - PDFEdit Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">Processing PDF with canvas renderer...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Canvas PDF Viewer Active</span>
                    {pdfPages > 0 && (
                      <Badge variant="secondary">
                        Page {currentPage} of {pdfPages}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {pdfPages > 1 && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage >= pdfPages}
                        >
                          Next
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (pdfUrl) {
                          const link = document.createElement('a');
                          link.href = pdfUrl;
                          link.download = pdfFile?.name || 'document.pdf';
                          link.click();
                        }
                      }}
                    >
                      Download Original
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-white p-4">
                  <div className="flex justify-center relative">
                    <canvas
                      ref={pdfCanvasRef}
                      className={`max-w-full shadow-lg border ${isPlacingSignature ? 'cursor-crosshair' : 'cursor-default'}`}
                      style={{ display: 'block' }}
                      onClick={handlePdfCanvasClick}
                    />
                    {/* Signature Position Overlays */}
                    {signaturePositions
                      .filter(pos => pos.page === currentPage)
                      .map(pos => {
                        const canvas = pdfCanvasRef.current;
                        if (!canvas) return null;
                        
                        const rect = canvas.getBoundingClientRect();
                        const scaleX = rect.width / canvas.width;
                        const scaleY = rect.height / canvas.height;
                        
                        return (
                          <div
                            key={pos.id}
                            className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-70 flex items-center justify-center rounded shadow-lg"
                            style={{
                              left: `${pos.x * scaleX}px`,
                              top: `${pos.y * scaleY}px`,
                              width: `${pos.width * scaleX}px`,
                              height: `${pos.height * scaleY}px`,
                            }}
                          >
                            <div className="text-xs text-blue-800 font-medium">Signature #{signaturePositions.indexOf(pos) + 1}</div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSignaturePosition(pos.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Real Content Display</p>
                    <p className="text-xs text-gray-600">Authentic PDF rendering</p>
                  </div>
                  <div className="text-center">
                    <Pen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Signature Planning</p>
                    <p className="text-xs text-gray-600">Identify signature areas</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Document Security</p>
                    <p className="text-xs text-gray-600">Verify authenticity</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                style={{ touchAction: 'none' }}
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
                      disabled={!pdfFile}
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

      {/* Signature Placement Summary */}
      {signaturePositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Signature Placement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signaturePositions.map((pos, index) => (
                <div key={pos.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">Page {pos.page}</p>
                      <p className="text-sm text-gray-500">
                        Position: ({Math.round(pos.x)}, {Math.round(pos.y)})
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSignaturePosition(pos.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="pt-3 border-t">
                <Button 
                  className="w-full" 
                  disabled={!currentSignature || signaturePositions.length === 0 || isProcessing}
                  onClick={exportSignedPDF}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Export Signed PDF ({signaturePositions.length} signatures)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {isPlacingSignature ? 'Click on PDF to place signature' : 'Ready to place on document'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, Download, Type, Image, MousePointer, 
  Bold, Italic, Underline, ZoomIn, ZoomOut,
  FileText, Signature, Eye, CheckSquare, Plus,
  ArrowLeft, ArrowRight, Trash2, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from 'react-signature-canvas';

// PDF.js configuration
import * as pdfjsLib from 'pdfjs-dist';
// Use the worker from the same version as the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface PDFPage {
  id: string;
  number: number;
  width: number;
  height: number;
  imageData?: string;
  textElements: PDFTextElement[];
  imageElements: PDFImageElement[];
  formFields: PDFFormField[];
}

interface PDFTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  isSelected: boolean;
  isEditing: boolean;
  isOriginal: boolean;
}

interface PDFImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
}

interface PDFFormField {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  required: boolean;
  isSelected: boolean;
}

interface DigitalSignature {
  id: string;
  signatureData: string;
  signerName: string;
  signerEmail: string;
  timestamp: Date;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function AdvancedPDFEditor() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  // Editor state
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'image' | 'form' | 'signature'>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'edit' | 'form' | 'sign'>('edit');
  
  // Text editing state
  const [textProperties, setTextProperties] = useState({
    fontSize: 14,
    fontFamily: 'Arial',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left' as const
  });
  
  // Signature state
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signerInfo, setSignerInfo] = useState({
    name: '',
    email: ''
  });

  const loadPDF = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      const loadedPages: PDFPage[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        
        // Render page to canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const imageData = canvas.toDataURL();
        
        // Extract text content
        const textContent = await page.getTextContent();
        const textElements: PDFTextElement[] = textContent.items.map((item: any, index: number) => ({
          id: `text-${pageNum}-${index}`,
          text: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5], // Convert PDF coordinates
          width: item.width || 100,
          height: item.height || 20,
          fontSize: item.height || 12,
          fontFamily: 'Arial',
          color: '#000000',
          bold: false,
          italic: false,
          underline: false,
          alignment: 'left' as const,
          isSelected: false,
          isEditing: false,
          isOriginal: true
        })).filter((obj: any) => obj.text.trim().length > 0);
        
        // Perform OCR using Tesseract for enhanced text extraction
        if (pageNum === 1 && textElements.length < 5) {
          setOcrProgress(0);
          try {
            const Tesseract = await import('tesseract.js');
            const worker = await Tesseract.createWorker('eng');
            
            const { data } = await worker.recognize(canvas);
            
            // Add OCR-detected text that wasn't found by PDF.js
            if (data.text && data.text.trim()) {
              // Simple text block approach instead of word-by-word
              const ocrText = data.text.trim();
              if (ocrText.length > 10) {
                textElements.push({
                  id: `ocr-${pageNum}-block`,
                  text: ocrText.substring(0, 200),
                  x: 50,
                  y: 50,
                  width: 400,
                  height: 100,
                  fontSize: 12,
                  fontFamily: 'Arial',
                  color: '#000000',
                  bold: false,
                  italic: false,
                  underline: false,
                  alignment: 'left' as const,
                  isSelected: false,
                  isEditing: false,
                  isOriginal: true
                });
              }
            }
            
            if (false && data.words && Array.isArray(data.words)) {
              data.words.forEach((word: any, index: number) => {
                if (word.confidence > 60 && word.text.trim()) {
                  const existingText = textElements.find(te => 
                    Math.abs(te.x - word.bbox.x0) < 20 && 
                    Math.abs(te.y - word.bbox.y0) < 20
                  );
                  
                  if (!existingText) {
                    textElements.push({
                      id: `ocr-${pageNum}-${index}`,
                      text: word.text,
                      x: word.bbox.x0,
                      y: word.bbox.y0,
                      width: word.bbox.x1 - word.bbox.x0,
                      height: word.bbox.y1 - word.bbox.y0,
                      fontSize: word.bbox.y1 - word.bbox.y0,
                      fontFamily: 'Arial',
                      color: '#000000',
                      bold: false,
                      italic: false,
                      underline: false,
                      alignment: 'left' as const,
                      isSelected: false,
                      isEditing: false,
                      isOriginal: true
                    });
                  }
                }
              });
            }
            
            await worker.terminate();
            setOcrProgress(100);
          } catch (error) {
            console.warn('OCR processing failed:', error);
          }
        }
        
        loadedPages.push({
          id: `page-${pageNum}`,
          number: pageNum,
          width: viewport.width,
          height: viewport.height,
          imageData,
          textElements,
          imageElements: [],
          formFields: []
        });
      }
      
      setPages(loadedPages);
      setCurrentPage(1);
      setOcrProgress(0);
      
      toast({
        title: "PDF loaded successfully",
        description: `${pdf.numPages} pages loaded with OCR text extraction`
      });
      
    } catch (error: any) {
      toast({
        title: "Failed to load PDF",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      loadPDF(file);
    }
  };

  const addTextElement = useCallback((x: number = 100, y: number = 100) => {
    const currentPageData = pages.find(p => p.number === currentPage);
    if (!currentPageData) return;
    
    const newText: PDFTextElement = {
      id: `text-new-${Date.now()}`,
      text: 'New text',
      x: x / zoom,
      y: y / zoom,
      width: 200,
      height: 30,
      fontSize: textProperties.fontSize,
      fontFamily: textProperties.fontFamily,
      color: textProperties.color,
      bold: textProperties.bold,
      italic: textProperties.italic,
      underline: textProperties.underline,
      alignment: textProperties.alignment,
      isSelected: true,
      isEditing: true,
      isOriginal: false
    };
    
    setPages(prev => prev.map(page => 
      page.number === currentPage 
        ? { ...page, textElements: [...page.textElements, newText] }
        : page
    ));
    
    setSelectedElementId(newText.id);
  }, [pages, currentPage, zoom, textProperties]);

  const updateTextElement = (id: string, updates: Partial<PDFTextElement>) => {
    setPages(prev => prev.map(page => 
      page.number === currentPage 
        ? {
            ...page, 
            textElements: page.textElements.map(el => 
              el.id === id ? { ...el, ...updates } : el
            )
          }
        : page
    ));
  };

  const deleteElement = (id: string) => {
    setPages(prev => prev.map(page => 
      page.number === currentPage 
        ? {
            ...page,
            textElements: page.textElements.filter(el => el.id !== id),
            imageElements: page.imageElements.filter(el => el.id !== id),
            formFields: page.formFields.filter(el => el.id !== id)
          }
        : page
    ));
    setSelectedElementId(null);
  };

  const addSignature = useCallback(() => {
    if (!signatureCanvasRef.current || !signerInfo.name) {
      toast({
        title: "Missing information",
        description: "Please provide signer name and create signature",
        variant: "destructive"
      });
      return;
    }
    
    const signatureData = signatureCanvasRef.current.toDataURL();
    
    const newSignature: DigitalSignature = {
      id: `signature-${Date.now()}`,
      signatureData,
      signerName: signerInfo.name,
      signerEmail: signerInfo.email,
      timestamp: new Date(),
      x: 100,
      y: 100,
      width: 200,
      height: 50
    };
    
    setSignatures(prev => [...prev, newSignature]);
    setShowSignatureModal(false);
    signatureCanvasRef.current.clear();
    
    toast({
      title: "Signature added",
      description: `Digital signature by ${signerInfo.name} added`
    });
  }, [signerInfo, toast]);

  const exportPDF = useCallback(async () => {
    if (!pdfFile) {
      toast({
        title: "No PDF loaded",
        description: "Please load a PDF first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Collect all edits
      const edits = {
        pages: pages.map(page => ({
          number: page.number,
          textElements: page.textElements.filter(el => !el.isOriginal),
          imageElements: page.imageElements,
          formFields: page.formFields,
          signatures: signatures
        }))
      };
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('edits', JSON.stringify(edits));
      
      const response = await fetch('/api/pdf/advanced-edit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF exported",
        description: "Your edited PDF has been downloaded"
      });
      
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [pdfFile, pages, signatures, toast]);

  const currentPageData = pages.find(p => p.number === currentPage);
  const selectedElement = currentPageData?.textElements.find(el => el.id === selectedElementId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Advanced PDF Editor
            </h2>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-4"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Upload PDF'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {ocrProgress > 0 && ocrProgress < 100 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">OCR Processing: {ocrProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {pages.length > 0 && (
            <>
              <Separator />
              
              {/* Edit Mode Tabs */}
              <Tabs value={editMode} onValueChange={(v) => setEditMode(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="form">Forms</TabsTrigger>
                  <TabsTrigger value="sign">Sign</TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="space-y-4">
                  {/* Tools */}
                  <div>
                    <h3 className="font-medium mb-2">Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedTool === 'select' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTool('select')}
                      >
                        <MousePointer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedTool === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTool('text')}
                      >
                        <Type className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedTool === 'image' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTool('image')}
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedTool === 'signature' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTool('signature')}
                      >
                        <Signature className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Text Properties */}
                  {(selectedTool === 'text' || selectedElement) && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Text Properties</h3>
                      
                      <div>
                        <Label className="text-sm">Font Size</Label>
                        <Slider
                          value={[selectedElement?.fontSize || textProperties.fontSize]}
                          onValueChange={(v) => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { fontSize: v[0] });
                            } else {
                              setTextProperties(prev => ({ ...prev, fontSize: v[0] }));
                            }
                          }}
                          max={72}
                          min={8}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-sm text-gray-500 mt-1">{selectedElement?.fontSize || textProperties.fontSize}px</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Font Family</Label>
                        <Select 
                          value={selectedElement?.fontFamily || textProperties.fontFamily} 
                          onValueChange={(v) => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { fontFamily: v });
                            } else {
                              setTextProperties(prev => ({ ...prev, fontFamily: v }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Color</Label>
                        <Input
                          type="color"
                          value={selectedElement?.color || textProperties.color}
                          onChange={(e) => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { color: e.target.value });
                            } else {
                              setTextProperties(prev => ({ ...prev, color: e.target.value }));
                            }
                          }}
                          className="h-10"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={(selectedElement?.bold || textProperties.bold) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { bold: !selectedElement.bold });
                            } else {
                              setTextProperties(prev => ({ ...prev, bold: !prev.bold }));
                            }
                          }}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={(selectedElement?.italic || textProperties.italic) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { italic: !selectedElement.italic });
                            } else {
                              setTextProperties(prev => ({ ...prev, italic: !prev.italic }));
                            }
                          }}
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={(selectedElement?.underline || textProperties.underline) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (selectedElement) {
                              updateTextElement(selectedElement.id, { underline: !selectedElement.underline });
                            } else {
                              setTextProperties(prev => ({ ...prev, underline: !prev.underline }));
                            }
                          }}
                        >
                          <Underline className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {selectedElement && (
                        <div className="space-y-2">
                          <Textarea
                            value={selectedElement.text}
                            onChange={(e) => updateTextElement(selectedElement.id, { text: e.target.value })}
                            placeholder="Edit text content"
                            rows={3}
                          />
                          <Button 
                            onClick={() => deleteElement(selectedElement.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Text
                          </Button>
                        </div>
                      )}
                      
                      {!selectedElement && (
                        <Button onClick={() => addTextElement()} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Text
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sign" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Digital Signatures</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Signer Name</Label>
                        <Input
                          value={signerInfo.name}
                          onChange={(e) => setSignerInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Email (optional)</Label>
                        <Input
                          type="email"
                          value={signerInfo.email}
                          onChange={(e) => setSignerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => setShowSignatureModal(true)}
                        className="w-full"
                      >
                        <Signature className="w-4 h-4 mr-2" />
                        Create Signature
                      </Button>
                    </div>
                    
                    {signatures.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Signatures ({signatures.length})</h4>
                        <ScrollArea className="h-32">
                          {signatures.map(sig => (
                            <div key={sig.id} className="flex items-center justify-between p-2 border rounded mb-2">
                              <div className="text-sm">
                                <div className="font-medium">{sig.signerName}</div>
                                <div className="text-gray-500">{sig.timestamp.toLocaleDateString()}</div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <Separator />
              
              {/* Page Navigation */}
              <div>
                <h3 className="font-medium mb-2">Pages</h3>
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{currentPage} / {pages.length}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                    disabled={currentPage === pages.length}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Zoom Controls */}
              <div>
                <h3 className="font-medium mb-2">Zoom: {Math.round(zoom * 100)}%</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Export */}
              <Button onClick={exportPDF} className="w-full" disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                {isLoading ? 'Exporting...' : 'Export PDF'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-auto p-4">
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center max-w-md">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
              <p className="text-gray-600 mb-4">
                Upload a PDF to start editing with advanced features including OCR, form filling, and digital signing
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </Card>
          </div>
        ) : currentPageData ? (
          <div className="flex justify-center">
            <div 
              className="relative bg-white shadow-lg border"
              style={{
                width: currentPageData.width * zoom,
                height: currentPageData.height * zoom,
                backgroundImage: currentPageData.imageData ? `url(${currentPageData.imageData})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
              onClick={(e) => {
                if (selectedTool === 'text') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  addTextElement(x, y);
                }
              }}
            >
              {/* Text Elements */}
              {currentPageData.textElements.map((textEl) => (
                <div
                  key={textEl.id}
                  className={`absolute cursor-pointer border-2 transition-all ${
                    textEl.isSelected 
                      ? 'border-blue-500 bg-blue-50 bg-opacity-50' 
                      : textEl.isOriginal
                        ? 'border-transparent hover:border-green-400'
                        : 'border-transparent hover:border-gray-400'
                  }`}
                  style={{
                    left: textEl.x * zoom,
                    top: textEl.y * zoom,
                    width: textEl.width * zoom,
                    height: textEl.height * zoom,
                    fontSize: textEl.fontSize * zoom,
                    fontFamily: textEl.fontFamily,
                    color: textEl.color,
                    fontWeight: textEl.bold ? 'bold' : 'normal',
                    fontStyle: textEl.italic ? 'italic' : 'normal',
                    textDecoration: textEl.underline ? 'underline' : 'none',
                    textAlign: textEl.alignment,
                    padding: '2px',
                    lineHeight: '1.2',
                    pointerEvents: selectedTool === 'select' ? 'auto' : 'none'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedTool === 'select') {
                      setSelectedElementId(textEl.id);
                      // Deselect other elements
                      setPages(prev => prev.map(page => 
                        page.number === currentPage 
                          ? {
                              ...page,
                              textElements: page.textElements.map(el => ({
                                ...el,
                                isSelected: el.id === textEl.id
                              }))
                            }
                          : page
                      ));
                    }
                  }}
                >
                  {textEl.text}
                  
                  {/* Original content indicator */}
                  {textEl.isOriginal && textEl.isSelected && (
                    <div className="absolute -top-6 -left-1 text-xs bg-green-500 text-white px-1 rounded">
                      Original
                    </div>
                  )}
                  
                  {/* New content indicator */}
                  {!textEl.isOriginal && textEl.isSelected && (
                    <div className="absolute -top-6 -left-1 text-xs bg-blue-500 text-white px-1 rounded">
                      Added
                    </div>
                  )}
                </div>
              ))}
              
              {/* Signatures */}
              {signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="absolute border border-gray-300"
                  style={{
                    left: sig.x * zoom,
                    top: sig.y * zoom,
                    width: sig.width * zoom,
                    height: sig.height * zoom
                  }}
                >
                  <img 
                    src={sig.signatureData} 
                    alt="Signature"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    {sig.signerName} - {sig.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Digital Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Draw your signature below:</Label>
                <div className="border border-gray-300 rounded mt-2">
                  <SignatureCanvas
                    ref={signatureCanvasRef}
                    canvasProps={{
                      width: 450,
                      height: 150,
                      className: 'signature-canvas'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => signatureCanvasRef.current?.clear()}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSignatureModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSignature}
                  className="flex-1"
                >
                  Add Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
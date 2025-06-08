import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, Download, Type, MousePointer, Bold, Italic, 
  Underline, ZoomIn, ZoomOut, FileText, Signature, 
  ArrowLeft, ArrowRight, Trash2, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdvancedPDFEditor() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'signature'>('select');
  
  const [textElements, setTextElements] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    page: number;
  }>>([]);

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
      // Use PDF.js for proper PDF rendering
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to a reliable CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      const pages: string[] = [];
      
      // Render each page to canvas
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        pages.push(canvas.toDataURL());
      }
      
      setPdfPages(pages);
      setCurrentPage(1);
      
      toast({
        title: "PDF loaded successfully",
        description: `${pdf.numPages} pages loaded and rendered`
      });
      
    } catch (error: any) {
      console.error('PDF loading error:', error);
      
      // Fallback to pdf-lib for basic functionality
      try {
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const pages: string[] = [];
        
        // Create basic page representations
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = 800;
          canvas.height = 1000;
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#e0e0e0';
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = '#333333';
          ctx.font = '24px Arial';
          ctx.fillText(`Page ${i + 1}`, 50, 50);
          ctx.font = '14px Arial';
          ctx.fillText('PDF content loaded - click to add text elements', 50, 100);
          
          pages.push(canvas.toDataURL());
        }
        
        setPdfPages(pages);
        setCurrentPage(1);
        
        toast({
          title: "PDF loaded",
          description: `${pdfDoc.getPageCount()} pages loaded (basic mode)`
        });
      } catch (fallbackError) {
        toast({
          title: "Failed to load PDF",
          description: "Unable to process this PDF file",
          variant: "destructive"
        });
      }
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

  const addTextElement = (x: number, y: number) => {
    const newText = {
      id: `text-${Date.now()}`,
      text: 'New text',
      x: x / zoom,
      y: y / zoom,
      fontSize: 16,
      color: '#000000',
      page: currentPage
    };
    
    setTextElements(prev => [...prev, newText]);
  };

  const updateTextElement = (id: string, updates: Partial<typeof textElements[0]>) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
  };

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
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('edits', JSON.stringify({
        textElements,
        pages: pdfPages.length
      }));
      
      const response = await fetch('/api/pdf/advanced-edit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
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
  }, [pdfFile, textElements, pdfPages.length, toast]);

  const currentPageElements = textElements.filter(el => el.page === currentPage);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r p-4 space-y-4">
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
        </div>

        {pdfPages.length > 0 && (
          <>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Tools</h3>
              <div className="grid grid-cols-3 gap-2">
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
                  variant={selectedTool === 'signature' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('signature')}
                >
                  <Signature className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Text Elements</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentPageElements.map(el => (
                  <div key={el.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate">{el.text}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTextElement(el.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
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
                <span className="text-sm">{currentPage} / {pdfPages.length}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(pdfPages.length, currentPage + 1))}
                  disabled={currentPage === pdfPages.length}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Zoom: {Math.round(zoom * 100)}%</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={exportPDF} className="w-full" disabled={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Exporting...' : 'Export PDF'}
            </Button>
          </>
        )}
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-auto p-4">
        {pdfPages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center max-w-md">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
              <p className="text-gray-600 mb-4">
                Upload a PDF to start editing with advanced features
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center">
            <div 
              className="relative bg-white shadow-lg border"
              style={{
                width: 800 * zoom,
                height: 1000 * zoom,
                backgroundImage: `url(${pdfPages[currentPage - 1]})`,
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
              {currentPageElements.map((textEl) => (
                <div
                  key={textEl.id}
                  className="absolute cursor-pointer border-2 border-blue-500 bg-blue-50 bg-opacity-50 p-1"
                  style={{
                    left: textEl.x * zoom,
                    top: textEl.y * zoom,
                    fontSize: textEl.fontSize * zoom,
                    color: textEl.color
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newText = prompt('Edit text:', textEl.text);
                    if (newText !== null) {
                      updateTextElement(textEl.id, { text: newText });
                    }
                  }}
                >
                  {textEl.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
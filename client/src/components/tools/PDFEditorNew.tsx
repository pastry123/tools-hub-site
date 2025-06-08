import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Move, RotateCw, Trash2, Copy, AlignLeft, 
  AlignCenter, AlignRight, Bold, Italic, 
  Underline, ZoomIn, ZoomOut, Grid, Layers, Settings,
  FileText, Edit3, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// PDF.js configuration
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

interface PDFTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  transform: number[];
  isEditing?: boolean;
  isOriginal: boolean;
}

interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  textItems: PDFTextItem[];
  viewport: any;
  width: number;
  height: number;
}

export default function PDFEditorNew() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tool, setTool] = useState<'select' | 'text' | 'move'>('select');

  const loadPDF = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid file",
        description: "Please select a valid PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
      });
      
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      
      // Load all pages
      const pagePromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(loadPage(pdf, i));
      }
      
      const loadedPages = await Promise.all(pagePromises);
      setPages(loadedPages);
      setCurrentPage(1);
      
      toast({
        title: "PDF loaded successfully",
        description: `${pdf.numPages} pages loaded with editable text`
      });
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error loading PDF",
        description: "Failed to load PDF file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadPage = async (pdf: any, pageNumber: number): Promise<PDFPage> => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Create canvas for PDF rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Extract text content with positioning
    const textContent = await page.getTextContent();
    const textItems: PDFTextItem[] = [];
    
    textContent.items.forEach((item: any, index: number) => {
      if (item.str.trim()) {
        const transform = item.transform;
        const x = transform[4];
        const y = viewport.height - transform[5]; // Flip Y coordinate
        
        textItems.push({
          id: `text-${pageNumber}-${index}`,
          text: item.str,
          x: x,
          y: y - item.height,
          width: item.width || 100,
          height: item.height || 12,
          fontSize: item.height || 12,
          fontFamily: item.fontName || 'Arial',
          color: '#000000',
          transform: transform,
          isOriginal: true
        });
      }
    });
    
    return {
      pageNumber,
      canvas,
      textItems,
      viewport,
      width: viewport.width,
      height: viewport.height
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      loadPDF(file);
    }
  };

  const getCurrentPage = () => pages.find(p => p.pageNumber === currentPage);

  const updateTextItem = (id: string, updates: Partial<PDFTextItem>) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.pageNumber === currentPage 
          ? {
              ...page,
              textItems: page.textItems.map(item => 
                item.id === id ? { ...item, ...updates } : item
              )
            }
          : page
      )
    );
  };

  const addNewText = () => {
    const currentPageData = getCurrentPage();
    if (!currentPageData) return;

    const newTextItem: PDFTextItem = {
      id: `new-text-${Date.now()}`,
      text: 'New text',
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      transform: [1, 0, 0, 1, 100, 100],
      isOriginal: false
    };

    setPages(prevPages => 
      prevPages.map(page => 
        page.pageNumber === currentPage 
          ? { ...page, textItems: [...page.textItems, newTextItem] }
          : page
      )
    );
    setSelectedTextId(newTextItem.id);
  };

  const deleteTextItem = (id: string) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.pageNumber === currentPage 
          ? {
              ...page,
              textItems: page.textItems.filter(item => item.id !== id)
            }
          : page
      )
    );
    setSelectedTextId(null);
  };

  const exportPDF = async () => {
    if (!pdfDoc) return;
    
    try {
      // This is a simplified export - in a real implementation,
      // you'd use PDF-lib to modify the original PDF
      toast({
        title: "Export functionality",
        description: "Export feature would save the modified PDF with your edits"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  const selectedText = getCurrentPage()?.textItems.find(item => item.id === selectedTextId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Tools */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              PDF Editor
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

          {pdfDoc && (
            <>
              <Separator />
              
              {/* Tools */}
              <div>
                <h3 className="font-medium mb-2">Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tool === 'select' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTool('select')}
                  >
                    <MousePointer className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={tool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTool('text')}
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Button onClick={addNewText} className="w-full" size="sm">
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
              </div>

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
                    Previous
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {pages.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                    disabled={currentPage === pages.length}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Zoom */}
              <div>
                <h3 className="font-medium mb-2">Zoom: {Math.round(zoom * 100)}%</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={exportPDF} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto p-4">
        {!pdfDoc ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
              <p className="text-gray-600 mb-4">Upload a PDF file to start editing</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </Card>
          </div>
        ) : (
          <div 
            ref={canvasContainerRef}
            className="relative mx-auto bg-white shadow-lg"
            style={{
              width: `${(getCurrentPage()?.width || 595) * zoom}px`,
              height: `${(getCurrentPage()?.height || 842) * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {/* PDF Canvas Background */}
            {getCurrentPage() && (
              <canvas
                width={getCurrentPage()!.width}
                height={getCurrentPage()!.height}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1
                }}
                ref={(canvas) => {
                  if (canvas && getCurrentPage()?.canvas) {
                    const ctx = canvas.getContext('2d')!;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(getCurrentPage()!.canvas, 0, 0);
                  }
                }}
              />
            )}

            {/* Text Elements Overlay */}
            {getCurrentPage()?.textItems.map((textItem) => (
              <div
                key={textItem.id}
                className={`absolute cursor-pointer select-none border-2 transition-all ${
                  selectedTextId === textItem.id 
                    ? 'border-blue-500 bg-blue-50 bg-opacity-50' 
                    : textItem.isOriginal 
                      ? 'border-transparent hover:border-green-400 bg-green-50 bg-opacity-20' 
                      : 'border-transparent hover:border-gray-400 bg-yellow-50 bg-opacity-30'
                }`}
                style={{
                  left: textItem.x / zoom,
                  top: textItem.y / zoom,
                  width: textItem.width / zoom,
                  minHeight: textItem.height / zoom,
                  fontSize: textItem.fontSize / zoom,
                  fontFamily: textItem.fontFamily,
                  color: textItem.color,
                  zIndex: 2,
                  padding: '2px'
                }}
                onClick={() => setSelectedTextId(textItem.id)}
                onDoubleClick={() => updateTextItem(textItem.id, { isEditing: true })}
              >
                {textItem.isEditing ? (
                  <textarea
                    value={textItem.text}
                    onChange={(e) => updateTextItem(textItem.id, { text: e.target.value })}
                    onBlur={() => updateTextItem(textItem.id, { isEditing: false })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        updateTextItem(textItem.id, { isEditing: false });
                      }
                    }}
                    className="w-full h-full bg-transparent border-none outline-none resize-none"
                    style={{
                      fontSize: textItem.fontSize / zoom,
                      fontFamily: textItem.fontFamily,
                      color: textItem.color
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {textItem.text}
                  </div>
                )}
                {!textItem.isOriginal && (
                  <Badge 
                    className="absolute -top-2 -right-2 text-xs"
                    variant="secondary"
                  >
                    New
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      {selectedText && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Text Properties</h3>
              {selectedText.isOriginal && (
                <Badge variant="secondary">Original</Badge>
              )}
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={selectedText.text}
                onChange={(e) => updateTextItem(selectedText.id, { text: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={Math.round(selectedText.x)}
                  onChange={(e) => updateTextItem(selectedText.id, { x: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={Math.round(selectedText.y)}
                  onChange={(e) => updateTextItem(selectedText.id, { y: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Font Size: {selectedText.fontSize}px</Label>
              <Slider
                value={[selectedText.fontSize]}
                onValueChange={([value]) => updateTextItem(selectedText.id, { fontSize: value })}
                min={8}
                max={72}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Font Family</Label>
              <Select
                value={selectedText.fontFamily}
                onValueChange={(value) => updateTextItem(selectedText.id, { fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={selectedText.color}
                onChange={(e) => updateTextItem(selectedText.id, { color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>

            <Button
              onClick={() => deleteTextItem(selectedText.id)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Text
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
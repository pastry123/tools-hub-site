import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, Download, Type, MousePointer, 
  Move, Trash2, AlignLeft, AlignCenter, AlignRight, 
  Bold, Italic, Underline, ZoomIn, ZoomOut, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextElement {
  id: string;
  content: string;
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
  page: number;
  rotation: number;
  isOriginal?: boolean;
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  rotation: number;
}

interface PDFPage {
  id: string;
  number: number;
  width: number;
  height: number;
  background: string;
  textElements: TextElement[];
  imageElements: ImageElement[];
  extractedText?: string;
}

export default function PDFEditorSimple() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'move'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElement, setDragElement] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    setPdfFile(file);
    setIsLoading(true);

    try {
      // Use backend API to analyze PDF and extract content
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/pdf/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze PDF');
      }

      const result = await response.json();
      
      if (result.success && result.pages) {
        setPages(result.pages);
        setCurrentPage(1);
        
        toast({
          title: "PDF loaded successfully",
          description: `${result.pages.length} pages loaded with extractable content`
        });
      } else {
        throw new Error(result.error || 'Failed to process PDF');
      }
    } catch (error: any) {
      console.error('PDF loading error:', error);
      toast({
        title: "Failed to load PDF",
        description: error.message || "Error processing PDF file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getCurrentPage = () => pages.find(p => p.number === currentPage);

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.number === currentPage 
          ? {
              ...page,
              textElements: page.textElements.map(item => 
                item.id === id ? { ...item, ...updates } : item
              )
            }
          : page
      )
    );
  };

  const addNewText = () => {
    const newTextElement: TextElement = {
      id: `new-text-${Date.now()}`,
      content: 'Click to edit this text',
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      bold: false,
      italic: false,
      underline: false,
      alignment: 'left',
      page: currentPage,
      rotation: 0,
      isOriginal: false
    };

    setPages(prevPages => 
      prevPages.map(page => 
        page.number === currentPage 
          ? { ...page, textElements: [...page.textElements, newTextElement] }
          : page
      )
    );
    setSelectedElement(newTextElement.id);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (tool === 'select' || tool === 'move') {
      e.preventDefault();
      setIsDragging(true);
      setDragElement(elementId);
      setSelectedElement(elementId);
      
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragElement) {
      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      
      const newX = (e.clientX - rect.left - dragStart.x) / zoom;
      const newY = (e.clientY - rect.top - dragStart.y) / zoom;
      
      updateTextElement(dragElement, {
        x: Math.max(0, Math.min(newX, (getCurrentPage()?.width || 595) - 100)),
        y: Math.max(0, Math.min(newY, (getCurrentPage()?.height || 842) - 30))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragElement(null);
  };

  const deleteTextElement = (id: string) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.number === currentPage 
          ? {
              ...page,
              textElements: page.textElements.filter(item => item.id !== id)
            }
          : page
      )
    );
    setSelectedElement(null);
  };

  const exportPDF = async () => {
    if (!pdfFile || pages.length === 0) {
      toast({
        title: "No PDF to export",
        description: "Please load a PDF file first",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('edits', JSON.stringify({
        pages: pages.map(page => ({
          number: page.number,
          textElements: page.textElements.filter(el => !el.isOriginal),
          imageElements: page.imageElements
        }))
      }));

      const response = await fetch('/api/pdf/export', {
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF exported successfully",
        description: "Your edited PDF has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export edited PDF",
        variant: "destructive"
      });
    }
  };

  const getSelectedTextElement = () => 
    getCurrentPage()?.textElements.find(item => item.id === selectedElement);

  const handleElementDrag = (id: string, deltaX: number, deltaY: number) => {
    const element = getCurrentPage()?.textElements.find(el => el.id === id);
    if (element) {
      updateTextElement(id, {
        x: Math.max(0, element.x + deltaX),
        y: Math.max(0, element.y + deltaY)
      });
    }
  };

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

          {pages.length > 0 && (
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
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
              <p className="text-gray-600 mb-4">Upload a PDF file to start editing with real content extraction</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </Card>
          </div>
        ) : (
          <div 
            className="relative mx-auto bg-white shadow-lg border"
            style={{
              width: `${(getCurrentPage()?.width || 595) * zoom}px`,
              height: `${(getCurrentPage()?.height || 842) * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* PDF Background */}
            {getCurrentPage()?.background && (
              <img
                src={getCurrentPage()!.background}
                alt={`Page ${currentPage}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
                draggable={false}
              />
            )}

            {/* Text Elements */}
            {getCurrentPage()?.textElements.map((textEl) => (
              <div
                key={textEl.id}
                className={`absolute select-none border-2 transition-all ${
                  isDragging && dragElement === textEl.id
                    ? 'cursor-grabbing border-blue-600 bg-blue-100 bg-opacity-70'
                    : selectedElement === textEl.id 
                      ? 'cursor-grab border-blue-500 bg-blue-50 bg-opacity-50' 
                      : 'cursor-pointer border-transparent hover:border-gray-400 bg-white bg-opacity-80'
                } ${tool === 'move' ? 'cursor-move' : ''}`}
                style={{
                  left: textEl.x / zoom,
                  top: textEl.y / zoom,
                  width: textEl.width / zoom,
                  minHeight: textEl.height / zoom,
                  fontSize: textEl.fontSize / zoom,
                  fontFamily: textEl.fontFamily,
                  color: textEl.color,
                  fontWeight: textEl.bold ? 'bold' : 'normal',
                  fontStyle: textEl.italic ? 'italic' : 'normal',
                  textDecoration: textEl.underline ? 'underline' : 'none',
                  textAlign: textEl.alignment,
                  zIndex: 2,
                  padding: '4px',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => handleMouseDown(e, textEl.id)}
                onClick={() => setSelectedElement(textEl.id)}
                onDoubleClick={() => {
                  const newContent = prompt('Edit text:', textEl.content);
                  if (newContent !== null) {
                    updateTextElement(textEl.id, { content: newContent });
                  }
                }}
              >
                <div className="whitespace-pre-wrap break-words pointer-events-none">
                  {textEl.content}
                </div>
                
                {/* Selection handles */}
                {selectedElement === textEl.id && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
                  </>
                )}
                
                {!textEl.isOriginal && (
                  <Badge 
                    className="absolute -top-2 -right-2 text-xs pointer-events-none"
                    variant="secondary"
                  >
                    New
                  </Badge>
                )}
              </div>
            ))}
            
            {/* Click to add text when text tool is selected */}
            {tool === 'text' && (
              <div 
                className="absolute inset-0 cursor-crosshair"
                style={{ zIndex: 3 }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / zoom;
                  const y = (e.clientY - rect.top) / zoom;
                  
                  const newTextElement: TextElement = {
                    id: `new-text-${Date.now()}`,
                    content: 'Click to edit this text',
                    x: Math.max(0, x - 100),
                    y: Math.max(0, y - 15),
                    width: 200,
                    height: 30,
                    fontSize: 16,
                    fontFamily: 'Arial',
                    color: '#000000',
                    bold: false,
                    italic: false,
                    underline: false,
                    alignment: 'left',
                    page: currentPage,
                    rotation: 0,
                    isOriginal: false
                  };

                  setPages(prevPages => 
                    prevPages.map(page => 
                      page.number === currentPage 
                        ? { ...page, textElements: [...page.textElements, newTextElement] }
                        : page
                    )
                  );
                  setSelectedElement(newTextElement.id);
                  setTool('select');
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      {selectedElement && getSelectedTextElement() && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Text Properties</h3>
              {getSelectedTextElement()?.isOriginal && (
                <Badge variant="secondary">Original PDF</Badge>
              )}
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={getSelectedTextElement()!.content}
                onChange={(e) => updateTextElement(selectedElement, { content: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={Math.round(getSelectedTextElement()!.x)}
                  onChange={(e) => updateTextElement(selectedElement, { x: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={Math.round(getSelectedTextElement()!.y)}
                  onChange={(e) => updateTextElement(selectedElement, { y: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Font Size: {getSelectedTextElement()!.fontSize}px</Label>
              <Slider
                value={[getSelectedTextElement()!.fontSize]}
                onValueChange={([value]) => updateTextElement(selectedElement, { fontSize: value })}
                min={8}
                max={72}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Font Family</Label>
              <Select
                value={getSelectedTextElement()!.fontFamily}
                onValueChange={(value) => updateTextElement(selectedElement, { fontFamily: value })}
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
                value={getSelectedTextElement()!.color}
                onChange={(e) => updateTextElement(selectedElement, { color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={getSelectedTextElement()!.bold ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { bold: !getSelectedTextElement()!.bold })}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={getSelectedTextElement()!.italic ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { italic: !getSelectedTextElement()!.italic })}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={getSelectedTextElement()!.underline ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { underline: !getSelectedTextElement()!.underline })}
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={getSelectedTextElement()!.alignment === 'left' ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { alignment: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={getSelectedTextElement()!.alignment === 'center' ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { alignment: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={getSelectedTextElement()!.alignment === 'right' ? 'default' : 'outline'}
                onClick={() => updateTextElement(selectedElement, { alignment: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => deleteTextElement(selectedElement)}
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
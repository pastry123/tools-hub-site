import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, Download, Type, MousePointer, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  ZoomIn, ZoomOut, FileText, Trash2, Move
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextLayer {
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
  isEditing: boolean;
  isSelected: boolean;
  isOriginal: boolean;
}

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
}

export default function PDFTextEditor() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tool, setTool] = useState<'select' | 'text'>('select');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/pdf/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to analyze PDF');

      const result = await response.json();
      
      if (result.success) {
        setPages(result.pages);
        
        // Extract original text as selectable text layers
        const allTextLayers: TextLayer[] = [];
        result.pages.forEach((page: any, pageIndex: number) => {
          if (page.extractedText) {
            // Create text regions from extracted text
            const lines = page.extractedText.split('\n').filter((line: string) => line.trim());
            lines.forEach((line: string, lineIndex: number) => {
              if (line.trim()) {
                allTextLayers.push({
                  id: `original-${pageIndex + 1}-${lineIndex}`,
                  content: line.trim(),
                  x: 50,
                  y: 80 + (lineIndex * 25),
                  width: 495,
                  height: 20,
                  fontSize: 14,
                  fontFamily: 'Arial',
                  color: '#1f2937',
                  bold: false,
                  italic: false,
                  underline: false,
                  alignment: 'left',
                  isEditing: false,
                  isSelected: false,
                  isOriginal: true
                });
              }
            });
          }
        });
        
        setTextLayers(allTextLayers);
        setCurrentPage(1);
        
        toast({
          title: "PDF loaded",
          description: `${result.pages.length} pages with selectable text`
        });
      }
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

  const addTextBox = (x: number = 100, y: number = 100) => {
    const newText: TextLayer = {
      id: `text-${Date.now()}`,
      content: 'Enter your text here',
      x,
      y,
      width: 200,
      height: 40,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      bold: false,
      italic: false,
      underline: false,
      alignment: 'left',
      isEditing: true,
      isSelected: true,
      isOriginal: false
    };
    
    setTextLayers(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setTool('select');
    
    // Focus the text input after a brief delay
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 100);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => 
      prev.map(layer => 
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };

  const deleteTextLayer = (id: string) => {
    setTextLayers(prev => prev.filter(layer => layer.id !== id));
    setSelectedTextId(null);
  };

  const handleTextClick = (textLayer: TextLayer, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Deselect all other text layers
    setTextLayers(prev => 
      prev.map(layer => ({ 
        ...layer, 
        isSelected: layer.id === textLayer.id,
        isEditing: false 
      }))
    );
    
    setSelectedTextId(textLayer.id);
  };

  const handleTextDoubleClick = (textLayer: TextLayer, event: React.MouseEvent) => {
    event.stopPropagation();
    updateTextLayer(textLayer.id, { isEditing: true });
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (tool === 'text') {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;
      addTextBox(x - 100, y - 20);
    } else {
      // Deselect all text layers
      setTextLayers(prev => 
        prev.map(layer => ({ ...layer, isSelected: false, isEditing: false }))
      );
      setSelectedTextId(null);
    }
  };

  const handleMouseDown = (textLayer: TextLayer, handle: string | null, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    }
    
    setDragStart({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!selectedTextId) return;
    
    const selectedText = textLayers.find(t => t.id === selectedTextId);
    if (!selectedText) return;

    const deltaX = (event.clientX - dragStart.x) / zoom;
    const deltaY = (event.clientY - dragStart.y) / zoom;

    if (isResizing && resizeHandle) {
      let newWidth = selectedText.width;
      let newHeight = selectedText.height;
      let newX = selectedText.x;
      let newY = selectedText.y;

      if (resizeHandle.includes('e')) newWidth = Math.max(50, selectedText.width + deltaX);
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(50, selectedText.width - deltaX);
        newX = selectedText.x + deltaX;
      }
      if (resizeHandle.includes('s')) newHeight = Math.max(20, selectedText.height + deltaY);
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, selectedText.height - deltaY);
        newY = selectedText.y + deltaY;
      }

      updateTextLayer(selectedTextId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      });
    } else {
      // Dragging
      updateTextLayer(selectedTextId, {
        x: selectedText.x + deltaX,
        y: selectedText.y + deltaY
      });
    }

    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  const selectedText = textLayers.find(t => t.id === selectedTextId);
  const currentPageData = pages.find(p => p.number === currentPage);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              PDF Text Editor
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
                <div className="text-xs text-gray-500 mt-2">
                  {tool === 'select' ? 'Click text to select, double-click to edit' : 'Click anywhere to add text'}
                </div>
              </div>

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
                  <span className="text-sm">{currentPage} / {pages.length}</span>
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
            </>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-auto p-4">
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
              <p className="text-gray-600 mb-4">Upload a PDF to start editing text</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </Card>
          </div>
        ) : (
          <div 
            ref={editorRef}
            className="relative mx-auto bg-white shadow-lg border"
            style={{
              width: `${(currentPageData?.width || 595) * zoom}px`,
              height: `${(currentPageData?.height || 842) * zoom}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* PDF Background */}
            {currentPageData?.background && (
              <img
                src={currentPageData.background}
                alt={`Page ${currentPage}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
                draggable={false}
              />
            )}

            {/* Text Layers */}
            {textLayers.map((textLayer) => (
              <div
                key={textLayer.id}
                className={`absolute border-2 transition-all ${
                  textLayer.isSelected 
                    ? 'border-blue-500 bg-blue-50 bg-opacity-30' 
                    : textLayer.isOriginal
                      ? 'border-transparent hover:border-green-400 bg-transparent'
                      : 'border-transparent hover:border-gray-400 bg-white bg-opacity-80'
                } ${tool === 'select' ? 'cursor-pointer' : ''}`}
                style={{
                  left: textLayer.x / zoom,
                  top: textLayer.y / zoom,
                  width: textLayer.width / zoom,
                  height: textLayer.height / zoom,
                  zIndex: 2
                }}
                onClick={(e) => handleTextClick(textLayer, e)}
                onDoubleClick={(e) => handleTextDoubleClick(textLayer, e)}
                onMouseDown={(e) => handleMouseDown(textLayer, null, e)}
              >
                {textLayer.isEditing ? (
                  <textarea
                    ref={textInputRef}
                    value={textLayer.content}
                    onChange={(e) => updateTextLayer(textLayer.id, { content: e.target.value })}
                    onBlur={() => updateTextLayer(textLayer.id, { isEditing: false })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        updateTextLayer(textLayer.id, { isEditing: false });
                      }
                      e.stopPropagation();
                    }}
                    className="w-full h-full border-none outline-none resize-none bg-transparent p-1"
                    style={{
                      fontSize: textLayer.fontSize / zoom,
                      fontFamily: textLayer.fontFamily,
                      color: textLayer.color,
                      fontWeight: textLayer.bold ? 'bold' : 'normal',
                      fontStyle: textLayer.italic ? 'italic' : 'normal',
                      textDecoration: textLayer.underline ? 'underline' : 'none',
                      textAlign: textLayer.alignment
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="w-full h-full p-1 whitespace-pre-wrap break-words select-text"
                    style={{
                      fontSize: textLayer.fontSize / zoom,
                      fontFamily: textLayer.fontFamily,
                      color: textLayer.color,
                      fontWeight: textLayer.bold ? 'bold' : 'normal',
                      fontStyle: textLayer.italic ? 'italic' : 'normal',
                      textDecoration: textLayer.underline ? 'underline' : 'none',
                      textAlign: textLayer.alignment,
                      cursor: 'text'
                    }}
                  >
                    {textLayer.content}
                  </div>
                )}

                {/* Resize handles */}
                {textLayer.isSelected && !textLayer.isEditing && (
                  <>
                    {/* Corner handles */}
                    <div 
                      className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nw-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'nw', e)}
                    />
                    <div 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-ne-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'ne', e)}
                    />
                    <div 
                      className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-sw-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'sw', e)}
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'se', e)}
                    />
                    
                    {/* Edge handles */}
                    <div 
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-n-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'n', e)}
                    />
                    <div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-s-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 's', e)}
                    />
                    <div 
                      className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-w-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'w', e)}
                    />
                    <div 
                      className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-e-resize"
                      onMouseDown={(e) => handleMouseDown(textLayer, 'e', e)}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Text tool cursor overlay */}
            {tool === 'text' && (
              <div className="absolute inset-0 cursor-crosshair" style={{ zIndex: 3 }} />
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      {selectedText && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Text Properties</h3>
              {selectedText.isOriginal && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Original
                </span>
              )}
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={selectedText.content}
                onChange={(e) => updateTextLayer(selectedText.id, { content: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={Math.round(selectedText.width)}
                  onChange={(e) => updateTextLayer(selectedText.id, { width: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={Math.round(selectedText.height)}
                  onChange={(e) => updateTextLayer(selectedText.id, { height: parseInt(e.target.value) || 20 })}
                />
              </div>
            </div>

            <div>
              <Label>Font Size: {selectedText.fontSize}px</Label>
              <Slider
                value={[selectedText.fontSize]}
                onValueChange={([value]) => updateTextLayer(selectedText.id, { fontSize: value })}
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
                onValueChange={(value) => updateTextLayer(selectedText.id, { fontFamily: value })}
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
                onChange={(e) => updateTextLayer(selectedText.id, { color: e.target.value })}
                className="mt-1 h-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedText.bold ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { bold: !selectedText.bold })}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedText.italic ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { italic: !selectedText.italic })}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedText.underline ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { underline: !selectedText.underline })}
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedText.alignment === 'left' ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { alignment: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedText.alignment === 'center' ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { alignment: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedText.alignment === 'right' ? 'default' : 'outline'}
                onClick={() => updateTextLayer(selectedText.id, { alignment: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => deleteTextLayer(selectedText.id)}
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
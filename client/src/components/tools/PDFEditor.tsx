import { useState, useRef, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isEditing: boolean;
  isTransparent: boolean;
  page: number;
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();

    // Load encrypted PDFs too
    const loadedPdf = await PDFDocument.load(arrayBuffer, {
      updateMetadata: true,
      ignoreEncryption: true,
    });

    setPdfDoc(loadedPdf);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    setUrl(URL.createObjectURL(blob));
    
    // Clear existing elements when loading new PDF
    setTextElements([]);
    setImageElements([]);
    setSelectedElement(null);
  }

  const addTextElement = () => {
    if (!pdfDoc) return;
    
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "Double-click to edit",
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 16,
      isEditing: false,
      isTransparent: false,
      page: 0
    };
    
    setTextElements(prev => [...prev, newElement]);
  };

  const addImageElement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const file = files[0];
    
    // Create data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      const newElement: ImageElement = {
        id: `image-${Date.now()}`,
        src,
        x: 150,
        y: 150,
        width: 200,
        height: 150,
        page: 0
      };
      
      setImageElements(prev => [...prev, newElement]);
    };
    reader.readAsDataURL(file);
  };

  // Interactive element handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, type: 'text' | 'image') => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const element = type === 'text' ? 
      textElements.find(t => t.id === elementId) : 
      imageElements.find(i => i.id === elementId);
    
    if (element) {
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      });
    }
  }, [textElements, imageElements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    if (selectedElement.startsWith('text-')) {
      setTextElements(prev => prev.map(element => 
        element.id === selectedElement ? 
          { ...element, x: Math.max(0, newX), y: Math.max(0, newY) } : 
          element
      ));
    } else if (selectedElement.startsWith('image-')) {
      setImageElements(prev => prev.map(element => 
        element.id === selectedElement ? 
          { ...element, x: Math.max(0, newX), y: Math.max(0, newY) } : 
          element
      ));
    }
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTextDoubleClick = (elementId: string) => {
    setTextElements(prev => prev.map(element => 
      element.id === elementId ? 
        { ...element, isEditing: true } : 
        { ...element, isEditing: false }
    ));
  };

  const handleTextChange = (elementId: string, newText: string) => {
    setTextElements(prev => prev.map(element => 
      element.id === elementId ? 
        { ...element, text: newText } : 
        element
    ));
  };

  const handleTextBlur = (elementId: string) => {
    setTextElements(prev => prev.map(element => 
      element.id === elementId ? 
        { ...element, isEditing: false } : 
        element
    ));
  };

  const toggleTransparency = (elementId: string) => {
    setTextElements(prev => prev.map(element => 
      element.id === elementId ? 
        { ...element, isTransparent: !element.isTransparent } : 
        element
    ));
  };

  const handleResize = (elementId: string, type: 'text' | 'image', direction: string, deltaX: number, deltaY: number) => {
    if (type === 'text') {
      setTextElements(prev => prev.map(element => {
        if (element.id !== elementId) return element;
        
        let newWidth = element.width;
        let newHeight = element.height;
        
        if (direction.includes('right')) newWidth = Math.max(50, element.width + deltaX);
        if (direction.includes('bottom')) newHeight = Math.max(20, element.height + deltaY);
        
        return { ...element, width: newWidth, height: newHeight };
      }));
    } else {
      setImageElements(prev => prev.map(element => {
        if (element.id !== elementId) return element;
        
        let newWidth = element.width;
        let newHeight = element.height;
        
        if (direction.includes('right')) newWidth = Math.max(50, element.width + deltaX);
        if (direction.includes('bottom')) newHeight = Math.max(50, element.height + deltaY);
        
        return { ...element, width: newWidth, height: newHeight };
      }));
    }
  };

  async function downloadPdf() {
    if (!pdfDoc) return;
    
    // Create a copy of the PDF
    const pdfCopy = await PDFDocument.create();
    const pages = pdfDoc.getPages();
    
    for (let i = 0; i < pages.length; i++) {
      const [copiedPage] = await pdfCopy.copyPages(pdfDoc, [i]);
      pdfCopy.addPage(copiedPage);
      
      // Add text elements to the page
      textElements.filter(el => el.page === i).forEach(async (textEl) => {
        const font = await pdfCopy.embedFont(StandardFonts.Helvetica);
        copiedPage.drawText(textEl.text, {
          x: textEl.x,
          y: copiedPage.getHeight() - textEl.y - textEl.height,
          size: textEl.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      
      // Add image elements would require converting data URLs back to image data
      // This is a simplified version - in production you'd want to handle image embedding properly
    }
    
    const pdfBytes = await pdfCopy.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "edited.pdf";
    a.click();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Interactive PDF Editor</h1>
      
      {/* File Upload */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant={url ? "outline" : "default"}
          >
            {url ? "Change PDF" : "Upload PDF"}
          </Button>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={loadPdf} 
            ref={fileInputRef} 
            className="hidden"
          />
        </div>
        {url && <span className="text-sm text-green-600">✓ PDF loaded</span>}
      </div>
      
      {/* Tool Controls */}
      {url && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={addTextElement}>Add Text</Button>
          <label className="cursor-pointer">
            <Button asChild>
              <span>Add Image</span>
            </Button>
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={addImageElement}
            />
          </label>
          <Button onClick={downloadPdf} variant="outline">Download PDF</Button>
        </div>
      )}

      {/* Selected Element Controls */}
      {selectedElement && selectedElement.startsWith('text-') && (
        <div className="flex gap-2 p-2 bg-gray-100 rounded">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toggleTransparency(selectedElement)}
          >
            {textElements.find(t => t.id === selectedElement)?.isTransparent ? 'Make Solid' : 'Make Transparent'}
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => setTextElements(prev => prev.filter(t => t.id !== selectedElement))}
          >
            Delete
          </Button>
        </div>
      )}

      {/* PDF Canvas Area */}
      {url && (
        <div className="relative">
          {/* PDF Background */}
          <div 
            ref={canvasRef}
            className="relative w-full h-[600px] border border-gray-300 overflow-hidden bg-white"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* PDF iframe as background */}
            <iframe
              src={url}
              className="absolute inset-0 w-full h-full pointer-events-none"
              title="PDF Background"
            />
            {/* Text Elements */}
            {textElements.map((textEl) => (
              <div
                key={textEl.id}
                className={`absolute cursor-move border-2 ${
                  selectedElement === textEl.id ? 'border-blue-500' : 'border-transparent'
                } ${textEl.isTransparent ? 'bg-transparent' : 'bg-white bg-opacity-80'} hover:border-gray-400`}
                style={{
                  left: textEl.x,
                  top: textEl.y,
                  width: textEl.width,
                  height: textEl.height,
                  fontSize: textEl.fontSize,
                  padding: '2px 4px',
                }}
                onMouseDown={(e) => handleMouseDown(e, textEl.id, 'text')}
                onDoubleClick={() => handleTextDoubleClick(textEl.id)}
              >
                {textEl.isEditing ? (
                  <input
                    type="text"
                    value={textEl.text}
                    onChange={(e) => handleTextChange(textEl.id, e.target.value)}
                    onBlur={() => handleTextBlur(textEl.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTextBlur(textEl.id);
                      }
                    }}
                    className="w-full h-full bg-transparent border-none outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="select-none">{textEl.text}</span>
                )}
                
                {/* Resize Handles */}
                {selectedElement === textEl.id && (
                  <>
                    <div
                      className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 cursor-se-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                      }}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Image Elements */}
            {imageElements.map((imgEl) => (
              <div
                key={imgEl.id}
                className={`absolute cursor-move border-2 ${
                  selectedElement === imgEl.id ? 'border-blue-500' : 'border-transparent'
                } hover:border-gray-400`}
                style={{
                  left: imgEl.x,
                  top: imgEl.y,
                  width: imgEl.width,
                  height: imgEl.height,
                }}
                onMouseDown={(e) => handleMouseDown(e, imgEl.id, 'image')}
              >
                <img
                  src={imgEl.src}
                  alt="Uploaded"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                
                {/* Resize Handles */}
                {selectedElement === imgEl.id && (
                  <>
                    <div
                      className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 cursor-se-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="absolute -top-8 -right-2"
                      onClick={() => setImageElements(prev => prev.filter(i => i.id !== imgEl.id))}
                    >
                      ×
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Instructions */}
          <div className="mt-2 text-sm text-gray-600">
            <p>• Click elements to select them</p>
            <p>• Double-click text to edit in real-time</p>
            <p>• Drag elements to move them</p>
            <p>• Use resize handles to adjust size</p>
            <p>• Toggle transparency for text backgrounds</p>
          </div>
        </div>
      )}
      
      {!url && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <h3 className="text-xl font-medium text-gray-700">No PDF loaded</h3>
            <p className="text-gray-500">Click "Upload PDF" above to start editing</p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="mt-4"
            >
              Choose PDF File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
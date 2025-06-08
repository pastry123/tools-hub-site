import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  page: number;
  isEditing: boolean;
}

interface PDFImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface PDFShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  page: number;
}

interface PDFPageData {
  width: number;
  height: number;
  backgroundColor: string;
  textElements: PDFTextElement[];
  imageElements: PDFImageElement[];
  shapeElements: PDFShapeElement[];
}

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PDFPageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'image' | 'rectangle' | 'circle'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const loadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadedPdf = await PDFDocument.load(arrayBuffer, {
        updateMetadata: true,
        ignoreEncryption: true,
      });
      
      setPdfDoc(loadedPdf);
      
      // Convert PDF pages to editable page data
      const pdfPages = loadedPdf.getPages();
      const editablePages: PDFPageData[] = pdfPages.map((page, index) => {
        const { width, height } = page.getSize();
        return {
          width,
          height,
          backgroundColor: '#ffffff',
          textElements: [],
          imageElements: [],
          shapeElements: []
        };
      });
      
      setPages(editablePages);
      setCurrentPageIndex(0);
      setSelectedElement(null);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try a different file.');
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current || selectedTool === 'select') return;
    
    const rect = editorRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (selectedTool === 'text') {
      addTextElement(x, y);
    } else if (selectedTool === 'rectangle') {
      addShapeElement('rectangle', x, y);
    } else if (selectedTool === 'circle') {
      addShapeElement('circle', x, y);
    }
  };

  const addTextElement = (x: number, y: number) => {
    const newElement: PDFTextElement = {
      id: `text-${Date.now()}`,
      text: "Double-click to edit",
      x: x - 75,
      y: y - 15,
      width: 150,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      page: currentPageIndex,
      isEditing: false,
    };
    
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? { ...page, textElements: [...page.textElements, newElement] }
        : page
    ));
    
    setSelectedElement(newElement.id);
    setSelectedTool('select');
  };

  const addShapeElement = (type: 'rectangle' | 'circle', x: number, y: number) => {
    const newElement: PDFShapeElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: x - 50,
      y: y - 40,
      width: 100,
      height: 80,
      strokeColor: '#000000',
      fillColor: 'transparent',
      strokeWidth: 2,
      page: currentPageIndex,
    };
    
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? { ...page, shapeElements: [...page.shapeElements, newElement] }
        : page
    ));
    
    setSelectedElement(newElement.id);
    setSelectedTool('select');
  };

  const addImageElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newElement: PDFImageElement = {
        id: `image-${Date.now()}`,
        src,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        page: currentPageIndex,
      };
      
      setPages(prev => prev.map((page, index) => 
        index === currentPageIndex 
          ? { ...page, imageElements: [...page.imageElements, newElement] }
          : page
      ));
      
      setSelectedElement(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  const updateTextElement = (id: string, updates: Partial<PDFTextElement>) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? {
            ...page, 
            textElements: page.textElements.map(el => 
              el.id === id ? { ...el, ...updates } : el
            )
          }
        : page
    ));
  };

  const updateImageElement = (id: string, updates: Partial<PDFImageElement>) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? {
            ...page, 
            imageElements: page.imageElements.map(el => 
              el.id === id ? { ...el, ...updates } : el
            )
          }
        : page
    ));
  };

  const updateShapeElement = (id: string, updates: Partial<PDFShapeElement>) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? {
            ...page, 
            shapeElements: page.shapeElements.map(el => 
              el.id === id ? { ...el, ...updates } : el
            )
          }
        : page
    ));
  };

  const deleteElement = (id: string) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? {
            ...page,
            textElements: page.textElements.filter(el => el.id !== id),
            imageElements: page.imageElements.filter(el => el.id !== id),
            shapeElements: page.shapeElements.filter(el => el.id !== id),
          }
        : page
    ));
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX / scale, 
      y: e.clientY / scale 
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElement) return;
      
      const deltaX = (e.clientX / scale) - dragStart.x;
      const deltaY = (e.clientY / scale) - dragStart.y;
      
      const currentPage = pages[currentPageIndex];
      if (!currentPage) return;
      
      // Update position based on element type
      const textElement = currentPage.textElements.find(el => el.id === selectedElement);
      if (textElement) {
        updateTextElement(selectedElement, {
          x: textElement.x + deltaX,
          y: textElement.y + deltaY
        });
      }
      
      const imageElement = currentPage.imageElements.find(el => el.id === selectedElement);
      if (imageElement) {
        updateImageElement(selectedElement, {
          x: imageElement.x + deltaX,
          y: imageElement.y + deltaY
        });
      }
      
      const shapeElement = currentPage.shapeElements.find(el => el.id === selectedElement);
      if (shapeElement) {
        updateShapeElement(selectedElement, {
          x: shapeElement.x + deltaX,
          y: shapeElement.y + deltaY
        });
      }
      
      setDragStart({ x: e.clientX / scale, y: e.clientY / scale });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElement, dragStart, scale, currentPageIndex, pages]);

  const exportToPDF = async () => {
    if (!pdfDoc || pages.length === 0) return;
    
    try {
      const newPdf = await PDFDocument.create();
      
      for (let i = 0; i < pages.length; i++) {
        const pageData = pages[i];
        const page = newPdf.addPage([pageData.width, pageData.height]);
        
        // Add text elements
        for (const textElement of pageData.textElements) {
          const font = await newPdf.embedFont(StandardFonts.Helvetica);
          page.drawText(textElement.text, {
            x: textElement.x,
            y: pageData.height - textElement.y - textElement.fontSize,
            size: textElement.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        
        // Add shape elements
        for (const shapeElement of pageData.shapeElements) {
          if (shapeElement.type === 'rectangle') {
            page.drawRectangle({
              x: shapeElement.x,
              y: pageData.height - shapeElement.y - shapeElement.height,
              width: shapeElement.width,
              height: shapeElement.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: shapeElement.strokeWidth,
            });
          } else if (shapeElement.type === 'circle') {
            page.drawEllipse({
              x: shapeElement.x + shapeElement.width / 2,
              y: pageData.height - shapeElement.y - shapeElement.height / 2,
              xScale: shapeElement.width / 2,
              yScale: shapeElement.height / 2,
              borderColor: rgb(0, 0, 0),
              borderWidth: shapeElement.strokeWidth,
            });
          }
        }
        
        // Add image elements
        for (const imageElement of pageData.imageElements) {
          try {
            const response = await fetch(imageElement.src);
            const imageBytes = await response.arrayBuffer();
            
            let image;
            if (imageElement.src.includes('image/png')) {
              image = await newPdf.embedPng(imageBytes);
            } else {
              image = await newPdf.embedJpg(imageBytes);
            }
            
            page.drawImage(image, {
              x: imageElement.x,
              y: pageData.height - imageElement.y - imageElement.height,
              width: imageElement.width,
              height: imageElement.height,
            });
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        }
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited-document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  const currentPage = pages[currentPageIndex];
  const pageWidth = currentPage?.width || 600;
  const pageHeight = currentPage?.height || 800;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Real-Time PDF Editor</h1>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant={pages.length ? "outline" : "default"}
        >
          {pages.length ? "Change PDF" : "Upload PDF"}
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={loadPdf} 
          ref={fileInputRef} 
          className="hidden"
        />
        {pages.length > 0 && <span className="text-sm text-green-600">✓ PDF loaded ({pages.length} pages)</span>}
      </div>
      
      {pages.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded border">
            <Button
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('select')}
            >
              Select
            </Button>
            <Button
              variant={selectedTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('text')}
            >
              Add Text
            </Button>
            <Button
              variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('rectangle')}
            >
              Rectangle
            </Button>
            <Button
              variant={selectedTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('circle')}
            >
              Circle
            </Button>
            <Button
              size="sm"
              onClick={() => imageInputRef.current?.click()}
            >
              Add Image
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              className="hidden"
              onChange={addImageElement}
            />
            
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm">Zoom:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              >
                -
              </Button>
              <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
              >
                +
              </Button>
            </div>
            
            {selectedElement && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteElement(selectedElement)}
              >
                Delete
              </Button>
            )}
            
            <div className="ml-auto">
              <Button onClick={exportToPDF} variant="outline">
                Download PDF
              </Button>
            </div>
          </div>

          {/* Page Navigation */}
          {pages.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button 
                onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPageIndex <= 0}
                size="sm"
              >
                ← Previous
              </Button>
              <span className="text-sm px-4">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <Button 
                onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                disabled={currentPageIndex >= pages.length - 1}
                size="sm"
              >
                Next →
              </Button>
            </div>
          )}

          {/* Real-Time Editor Canvas */}
          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              Real-Time Editor - {selectedTool === 'select' ? 'Select and edit elements' : `Click to add ${selectedTool}`}
            </h3>
            <div className="p-4 bg-gray-200 flex justify-center overflow-auto" style={{ minHeight: '70vh' }}>
              <div 
                ref={editorRef}
                className="relative bg-white shadow-lg border border-gray-400"
                style={{ 
                  width: pageWidth * scale, 
                  height: pageHeight * scale,
                  cursor: selectedTool !== 'select' ? 'crosshair' : 'default',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
                onClick={handleEditorClick}
              >
                {/* Text Elements */}
                {currentPage?.textElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-400'
                    } cursor-move`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      color: element.color,
                      padding: '4px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onDoubleClick={() => updateTextElement(element.id, { isEditing: true })}
                  >
                    {element.isEditing ? (
                      <Textarea
                        value={element.text}
                        onChange={(e) => updateTextElement(element.id, { text: e.target.value })}
                        onBlur={() => updateTextElement(element.id, { isEditing: false })}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            updateTextElement(element.id, { isEditing: false });
                          }
                        }}
                        className="w-full h-full border-none bg-transparent p-0 resize-none focus:ring-0"
                        style={{ 
                          fontSize: element.fontSize, 
                          fontFamily: element.fontFamily,
                          color: element.color 
                        }}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="w-full h-full whitespace-pre-wrap"
                        style={{ 
                          fontSize: element.fontSize, 
                          fontFamily: element.fontFamily,
                          color: element.color 
                        }}
                      >
                        {element.text}
                      </div>
                    )}
                  </div>
                ))}

                {/* Image Elements */}
                {currentPage?.imageElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
                    } cursor-move overflow-hidden`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    <img
                      src={element.src}
                      alt="PDF Element"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ))}

                {/* Shape Elements */}
                {currentPage?.shapeElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 cursor-move ${
                      selectedElement === element.id ? 'border-blue-500' : 'hover:border-gray-400'
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      borderColor: element.strokeColor,
                      borderWidth: element.strokeWidth,
                      borderRadius: element.type === 'circle' ? '50%' : '0',
                      backgroundColor: element.fillColor,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded space-y-2">
            <p><strong>Real-Time PDF Editor:</strong></p>
            <p>• Select tools from toolbar and click on the canvas to add elements</p>
            <p>• Double-click text to edit content directly</p>
            <p>• Drag any element to reposition it</p>
            <p>• Use zoom controls to adjust the view</p>
            <p>• All changes are immediately visible and editable</p>
            <p>• Download creates a new PDF with all your modifications</p>
          </div>
        </>
      )}
      
      {pages.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">✏️</div>
            <h3 className="text-xl font-medium text-gray-700">Real-Time PDF Editor</h3>
            <p className="text-gray-500">Upload a PDF to start editing with live, interactive elements</p>
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
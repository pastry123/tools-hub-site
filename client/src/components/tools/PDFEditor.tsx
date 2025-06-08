import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  page: number;
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
  page: number;
}

interface PDFShapeElement {
  id: string;
  type: 'rectangle' | 'circle';
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
  canvasDataUrl: string;
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
  const [scale, setScale] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const extractPDFContent = async (file: File): Promise<PDFPageData[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadedPdf = await PDFDocument.load(arrayBuffer, {
      updateMetadata: true,
      ignoreEncryption: true,
    });
    
    setPdfDoc(loadedPdf);
    
    // Load with PDF.js to render pages as images
    const pdfData = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    const extractedPages: PDFPageData[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      
      // Create canvas to render PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Extract text content
      const textContent = await page.getTextContent();
      const textElements: PDFTextElement[] = [];
      
      textContent.items.forEach((item: any, index: number) => {
        if (item.str && item.str.trim()) {
          // Calculate position and size
          const transform = item.transform;
          const x = transform[4];
          const y = viewport.height - transform[5]; // Flip Y coordinate
          const fontSize = Math.abs(transform[0]) || 12;
          
          textElements.push({
            id: `original-text-${pageNum}-${index}`,
            text: item.str,
            x: x / 2.0, // Scale back down since we rendered at 2x
            y: y / 2.0,
            width: item.width ? item.width / 2.0 : item.str.length * fontSize * 0.6,
            height: fontSize / 2.0,
            fontSize: fontSize / 2.0,
            color: '#000000',
            page: pageNum - 1,
            isEditing: false,
            isOriginal: true
          });
        }
      });
      
      const pdfPage = loadedPdf.getPage(pageNum - 1);
      const { width, height } = pdfPage.getSize();
      
      extractedPages.push({
        width: width,
        height: height,
        canvasDataUrl: canvas.toDataURL(),
        textElements,
        imageElements: [],
        shapeElements: []
      });
    }
    
    return extractedPages;
  };

  const loadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const extractedPages = await extractPDFContent(file);
      setPages(extractedPages);
      setCurrentPageIndex(0);
      setSelectedElement(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try a different file.');
    }
    setIsLoading(false);
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
      text: "Click to edit",
      x: x - 50,
      y: y - 15,
      width: 100,
      height: 30,
      fontSize: 16,
      color: '#000000',
      page: currentPageIndex,
      isEditing: true,
      isOriginal: false
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
        
        // Add background (original PDF content)
        if (pageData.canvasDataUrl) {
          try {
            const response = await fetch(pageData.canvasDataUrl);
            const imageBytes = await response.arrayBuffer();
            const backgroundImage = await newPdf.embedPng(imageBytes);
            page.drawImage(backgroundImage, {
              x: 0,
              y: 0,
              width: pageData.width,
              height: pageData.height,
            });
          } catch (error) {
            console.error('Error adding background:', error);
          }
        }
        
        // Add only new text elements (not original ones)
        const newTextElements = pageData.textElements.filter(el => !el.isOriginal);
        for (const textElement of newTextElements) {
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
      <h1 className="text-2xl font-bold">PDF Visual Editor</h1>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant={pages.length ? "outline" : "default"}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : pages.length ? "Change PDF" : "Upload PDF"}
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={loadPdf} 
          ref={fileInputRef} 
          className="hidden"
        />
        {pages.length > 0 && <span className="text-sm text-green-600">✓ PDF loaded with visible content ({pages.length} pages)</span>}
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
                onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))}
              >
                -
              </Button>
              <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
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

          {/* Visual PDF Editor */}
          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              Visual Editor - See and edit actual PDF content - {selectedTool === 'select' ? 'Select elements to edit' : `Click to add ${selectedTool}`}
            </h3>
            <div className="p-4 bg-gray-200 flex justify-center overflow-auto" style={{ minHeight: '70vh' }}>
              <div 
                ref={editorRef}
                className="relative bg-white shadow-lg border border-gray-400"
                style={{ 
                  width: pageWidth * scale, 
                  height: pageHeight * scale,
                  cursor: selectedTool !== 'select' ? 'crosshair' : 'default'
                }}
                onClick={handleEditorClick}
              >
                {/* PDF Background Image */}
                {currentPage?.canvasDataUrl && (
                  <img
                    src={currentPage.canvasDataUrl}
                    alt="PDF Page"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                  />
                )}
                
                {/* Editable Text Elements */}
                {currentPage?.textElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500 bg-blue-50 bg-opacity-70' : 
                      element.isOriginal ? 'border-transparent hover:border-yellow-400 hover:bg-yellow-50 hover:bg-opacity-50' :
                      'border-transparent hover:border-gray-400'
                    } cursor-move`}
                    style={{
                      left: element.x * scale,
                      top: element.y * scale,
                      width: element.width * scale,
                      height: element.height * scale,
                      fontSize: element.fontSize * scale,
                      color: element.isOriginal ? 'transparent' : element.color,
                      padding: '2px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onDoubleClick={() => updateTextElement(element.id, { isEditing: true })}
                    title={element.isOriginal ? `Original text: "${element.text}"` : 'Added text'}
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
                        className="w-full h-full border-none bg-white p-1 resize-none focus:ring-0 text-black"
                        style={{ 
                          fontSize: element.fontSize * scale,
                          minHeight: element.height * scale
                        }}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="w-full h-full whitespace-pre-wrap overflow-hidden"
                        style={{ 
                          fontSize: element.fontSize * scale,
                          color: element.isOriginal ? '#333' : element.color,
                          backgroundColor: element.isOriginal ? 'rgba(255, 255, 255, 0.8)' : 'transparent'
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
                      left: element.x * scale,
                      top: element.y * scale,
                      width: element.width * scale,
                      height: element.height * scale,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    <img
                      src={element.src}
                      alt="Added Image"
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
                      left: element.x * scale,
                      top: element.y * scale,
                      width: element.width * scale,
                      height: element.height * scale,
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
            <p><strong>Visual PDF Editor with Real Content:</strong></p>
            <p>• See the actual PDF content rendered as background</p>
            <p>• Original text appears with yellow highlight on hover - double-click to edit</p>
            <p>• Add new text, shapes, and images that overlay on the content</p>
            <p>• Drag any element to reposition it precisely</p>
            <p>• Use zoom controls to work at different detail levels</p>
            <p>• Download preserves original content plus your additions</p>
          </div>
        </>
      )}
      
      {pages.length === 0 && !isLoading && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">👁️</div>
            <h3 className="text-xl font-medium text-gray-700">Visual PDF Editor</h3>
            <p className="text-gray-500">Upload a PDF to see and edit the actual content visually</p>
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
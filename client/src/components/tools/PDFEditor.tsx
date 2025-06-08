import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  page: number;
  isEditing: boolean;
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

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  page: number;
}

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'image' | 'rectangle' | 'circle'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
      setNumPages(loadedPdf.getPageCount());
      
      // Create blob URL for PDF display
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Reset state
      setTextElements([]);
      setImageElements([]);
      setShapeElements([]);
      setSelectedElement(null);
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try a different file.');
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    
    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'text') {
      addTextElement(x, y);
    } else if (selectedTool === 'rectangle') {
      addShapeElement('rectangle', x, y);
    } else if (selectedTool === 'circle') {
      addShapeElement('circle', x, y);
    } else {
      setSelectedElement(null);
    }
  };

  const addTextElement = (x: number, y: number) => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "Edit me",
      x: x - 50,
      y: y - 15,
      fontSize: 16,
      color: "#000000",
      page: currentPage,
      isEditing: true,
    };
    
    setTextElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setSelectedTool('select');
  };

  const addShapeElement = (type: 'rectangle' | 'circle', x: number, y: number) => {
    const newElement: ShapeElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: x - 50,
      y: y - 50,
      width: 100,
      height: type === 'circle' ? 100 : 80,
      color: "#000000",
      page: currentPage,
    };
    
    setShapeElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setSelectedTool('select');
  };

  const addImageElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newElement: ImageElement = {
        id: `image-${Date.now()}`,
        src,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        page: currentPage,
      };
      setImageElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  const updateTextElement = (id: string, text: string) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, text } : el
    ));
  };

  const toggleTextEdit = (id: string) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, isEditing: !el.isEditing } : el
    ));
  };

  const deleteElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    setImageElements(prev => prev.filter(el => el.id !== id));
    setShapeElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const moveElement = (id: string, deltaX: number, deltaY: number) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, x: el.x + deltaX, y: el.y + deltaY } : el
    ));
    setImageElements(prev => prev.map(el => 
      el.id === id ? { ...el, x: el.x + deltaX, y: el.y + deltaY } : el
    ));
    setShapeElements(prev => prev.map(el => 
      el.id === id ? { ...el, x: el.x + deltaX, y: el.y + deltaY } : el
    ));
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElement) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      moveElement(selectedElement, deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
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
  }, [isDragging, selectedElement, dragStart]);

  const savePdfWithElements = async () => {
    if (!pdfDoc) return;
    
    try {
      const pdfCopy = await PDFDocument.create();
      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await pdfCopy.copyPages(pdfDoc, [i]);
        pdfCopy.addPage(copiedPage);
        const pageHeight = copiedPage.getHeight();
        
        // Add text elements for this page
        const pageTextElements = textElements.filter(el => el.page === i + 1);
        for (const element of pageTextElements) {
          const font = await pdfCopy.embedFont(StandardFonts.Helvetica);
          copiedPage.drawText(element.text, {
            x: element.x,
            y: pageHeight - element.y - element.fontSize,
            size: element.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        
        // Add shape elements for this page
        const pageShapeElements = shapeElements.filter(el => el.page === i + 1);
        for (const element of pageShapeElements) {
          if (element.type === 'rectangle') {
            copiedPage.drawRectangle({
              x: element.x,
              y: pageHeight - element.y - element.height,
              width: element.width,
              height: element.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
          } else if (element.type === 'circle') {
            // Draw circle as ellipse
            copiedPage.drawEllipse({
              x: element.x + element.width / 2,
              y: pageHeight - element.y - element.height / 2,
              xScale: element.width / 2,
              yScale: element.height / 2,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
          }
        }
        
        // Add image elements for this page
        const pageImageElements = imageElements.filter(el => el.page === i + 1);
        for (const element of pageImageElements) {
          try {
            const response = await fetch(element.src);
            const imageBytes = await response.arrayBuffer();
            
            let image;
            if (element.src.includes('image/png')) {
              image = await pdfCopy.embedPng(imageBytes);
            } else {
              image = await pdfCopy.embedJpg(imageBytes);
            }
            
            copiedPage.drawImage(image, {
              x: element.x,
              y: pageHeight - element.y - element.height,
              width: element.width,
              height: element.height,
            });
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        }
      }
      
      const pdfBytes = await pdfCopy.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited-document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    }
  };

  const currentPageTextElements = textElements.filter(el => el.page === currentPage);
  const currentPageImageElements = imageElements.filter(el => el.page === currentPage);
  const currentPageShapeElements = shapeElements.filter(el => el.page === currentPage);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Professional PDF Editor</h1>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant={pdfUrl ? "outline" : "default"}
        >
          {pdfUrl ? "Change PDF" : "Upload PDF"}
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={loadPdf} 
          ref={fileInputRef} 
          className="hidden"
        />
        {pdfUrl && <span className="text-sm text-green-600">✓ PDF loaded</span>}
      </div>
      
      {pdfUrl && (
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
            {selectedElement && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteElement(selectedElement)}
              >
                Delete Selected
              </Button>
            )}
            <div className="ml-auto">
              <Button onClick={savePdfWithElements} variant="outline">
                Download Edited PDF
              </Button>
            </div>
          </div>

          {/* Page Navigation */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                size="sm"
              >
                ← Previous
              </Button>
              <span className="text-sm px-4">
                Page {currentPage} of {numPages}
              </span>
              <Button 
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                disabled={currentPage >= numPages}
                size="sm"
              >
                Next →
              </Button>
            </div>
          )}

          {/* PDF Editor Area */}
          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              Editor - {selectedTool === 'select' ? 'Select and edit elements' : `Click to add ${selectedTool}`}
            </h3>
            <div className="p-4 bg-gray-50 flex justify-center">
              <div 
                ref={editorRef}
                className="relative bg-white border-2 border-gray-300 shadow-lg"
                style={{ width: '800px', height: '600px', cursor: selectedTool !== 'select' ? 'crosshair' : 'default' }}
                onClick={handleEditorClick}
              >
                {/* PDF Background */}
                <iframe
                  src={`${pdfUrl}#page=${currentPage}&zoom=100`}
                  className="w-full h-full pointer-events-none"
                  title="PDF Background"
                />
                
                {/* Text Elements Overlay */}
                {currentPageTextElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                    } hover:border-gray-400 cursor-move`}
                    style={{
                      left: element.x,
                      top: element.y,
                      fontSize: element.fontSize,
                      color: element.color,
                      padding: '2px 4px',
                      minWidth: '50px',
                      minHeight: '20px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onDoubleClick={() => toggleTextEdit(element.id)}
                  >
                    {element.isEditing ? (
                      <Input
                        type="text"
                        value={element.text}
                        onChange={(e) => updateTextElement(element.id, e.target.value)}
                        onBlur={() => toggleTextEdit(element.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') toggleTextEdit(element.id);
                        }}
                        className="border-none bg-transparent p-0 h-auto focus:ring-0"
                        style={{ fontSize: element.fontSize, color: element.color }}
                        autoFocus
                      />
                    ) : (
                      <span>{element.text}</span>
                    )}
                  </div>
                ))}

                {/* Image Elements Overlay */}
                {currentPageImageElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500' : 'border-transparent'
                    } hover:border-gray-400 cursor-move overflow-hidden`}
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
                      alt="Annotation"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ))}

                {/* Shape Elements Overlay */}
                {currentPageShapeElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id ? 'border-blue-500' : 'border-gray-400'
                    } hover:border-blue-400 cursor-move`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      borderColor: element.color,
                      borderRadius: element.type === 'circle' ? '50%' : '0',
                      background: 'transparent',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded space-y-2">
            <p><strong>Professional PDF Editor Features:</strong></p>
            <p>• Select tools from the toolbar and click on the PDF to add elements</p>
            <p>• Drag elements to reposition them</p>
            <p>• Double-click text to edit directly</p>
            <p>• Add images, shapes, and text annotations</p>
            <p>• Navigate between pages for multi-page documents</p>
            <p>• All edits are permanently saved to the downloaded PDF</p>
          </div>
        </>
      )}
      
      {!pdfUrl && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📝</div>
            <h3 className="text-xl font-medium text-gray-700">Professional PDF Editor</h3>
            <p className="text-gray-500">Upload a PDF to start editing with professional tools</p>
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
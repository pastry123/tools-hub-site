import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  page: number;
}

interface ImageAnnotation {
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextValue, setNewTextValue] = useState("Edit me");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
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
      setTextAnnotations([]);
      setImageAnnotations([]);
      setSelectedAnnotation(null);
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try a different file.');
    }
  }

  const addTextAnnotation = () => {
    if (!pdfDoc) return;
    
    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text: newTextValue,
      x: 100,
      y: 100,
      fontSize: 16,
      page: currentPage,
    };
    
    setTextAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
  };

  const addImageAnnotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newAnnotation: ImageAnnotation = {
        id: `image-${Date.now()}`,
        src,
        x: 150,
        y: 150,
        width: 200,
        height: 150,
        page: currentPage,
      };
      setImageAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
    };
    reader.readAsDataURL(file);
  };

  const updateTextAnnotation = (id: string, text: string) => {
    setTextAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, text } : ann
    ));
  };

  const updateAnnotationPosition = (id: string, x: number, y: number) => {
    setTextAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, x, y } : ann
    ));
    setImageAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, x, y } : ann
    ));
  };

  const deleteAnnotation = (id: string) => {
    setTextAnnotations(prev => prev.filter(ann => ann.id !== id));
    setImageAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const savePdfWithAnnotations = async () => {
    if (!pdfDoc) return;
    
    try {
      const pdfCopy = await PDFDocument.create();
      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await pdfCopy.copyPages(pdfDoc, [i]);
        pdfCopy.addPage(copiedPage);
        
        // Add text annotations for this page
        const pageTextAnnotations = textAnnotations.filter(ann => ann.page === i + 1);
        for (const annotation of pageTextAnnotations) {
          const font = await pdfCopy.embedFont(StandardFonts.Helvetica);
          copiedPage.drawText(annotation.text, {
            x: annotation.x,
            y: copiedPage.getHeight() - annotation.y - 50,
            size: annotation.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        
        // Add image annotations for this page
        const pageImageAnnotations = imageAnnotations.filter(ann => ann.page === i + 1);
        for (const annotation of pageImageAnnotations) {
          try {
            const response = await fetch(annotation.src);
            const imageBytes = await response.arrayBuffer();
            
            let image;
            if (annotation.src.includes('image/png')) {
              image = await pdfCopy.embedPng(imageBytes);
            } else {
              image = await pdfCopy.embedJpg(imageBytes);
            }
            
            copiedPage.drawImage(image, {
              x: annotation.x,
              y: copiedPage.getHeight() - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
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
      a.download = "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  const currentPageTextAnnotations = textAnnotations.filter(ann => ann.page === currentPage);
  const currentPageImageAnnotations = imageAnnotations.filter(ann => ann.page === currentPage);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Editor</h1>
      
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
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              type="text"
              value={newTextValue}
              onChange={(e) => setNewTextValue(e.target.value)}
              placeholder="Text to add"
              className="w-40"
            />
            <Button onClick={addTextAnnotation}>
              Add Text
            </Button>
            <Button onClick={() => imageInputRef.current?.click()}>
              Add Image
            </Button>
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={imageInputRef}
              className="hidden"
              onChange={addImageAnnotation}
            />
            <Button onClick={savePdfWithAnnotations} variant="outline">
              Download Edited PDF
            </Button>
          </div>

          {numPages > 1 && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {numPages}
              </span>
              <Button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                size="sm"
              >
                Next
              </Button>
            </div>
          )}

          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              PDF Editor - Add annotations and edit directly
            </h3>
            <div className="relative bg-white p-4">
              
              {/* PDF Viewer with iframe - stable approach */}
              <div className="relative mx-auto" style={{ width: '800px', height: '600px' }}>
                <iframe
                  src={`${pdfUrl}#page=${currentPage}&zoom=100`}
                  className="w-full h-full border shadow-lg"
                  title="PDF Viewer"
                />
                
                {/* Text Annotations Overlay */}
                {currentPageTextAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`absolute cursor-move border-2 ${
                      selectedAnnotation === annotation.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white bg-opacity-90'
                    } hover:border-blue-400 hover:bg-blue-50 rounded px-2 py-1`}
                    style={{
                      left: annotation.x,
                      top: annotation.y,
                      fontSize: annotation.fontSize,
                      minWidth: '100px',
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation.id);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startLeft = annotation.x;
                      const startTop = annotation.y;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;
                        updateAnnotationPosition(annotation.id, startLeft + deltaX, startTop + deltaY);
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <Input
                      type="text"
                      value={annotation.text}
                      onChange={(e) => updateTextAnnotation(annotation.id, e.target.value)}
                      className="border-none bg-transparent p-0 h-auto focus:ring-0"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: annotation.fontSize }}
                    />
                    
                    {selectedAnnotation === annotation.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-8 -right-2 w-6 h-6 p-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}

                {/* Image Annotations Overlay */}
                {currentPageImageAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`absolute cursor-move border-2 ${
                      selectedAnnotation === annotation.id ? 'border-blue-500' : 'border-gray-300'
                    } hover:border-blue-400 rounded overflow-hidden`}
                    style={{
                      left: annotation.x,
                      top: annotation.y,
                      width: annotation.width,
                      height: annotation.height,
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation.id);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startLeft = annotation.x;
                      const startTop = annotation.y;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;
                        updateAnnotationPosition(annotation.id, startLeft + deltaX, startTop + deltaY);
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <img
                      src={annotation.src}
                      alt="Annotation"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                    
                    {selectedAnnotation === annotation.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-8 -right-2 w-6 h-6 p-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded space-y-2">
            <p><strong>PDF Editor with Direct Annotations:</strong></p>
            <p>• Type text in the input field and click "Add Text" to place it on the PDF</p>
            <p>• Edit text directly in the annotation boxes</p>
            <p>• Drag annotations to move them around</p>
            <p>• Add images that overlay on the PDF content</p>
            <p>• Use page navigation for multi-page documents</p>
            <p>• Download saves all annotations permanently to the PDF file</p>
          </div>
          
          {/* Annotation List */}
          {(textAnnotations.length > 0 || imageAnnotations.length > 0) && (
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Current Annotations:</h4>
              <div className="space-y-1 text-sm">
                {textAnnotations.map(ann => (
                  <div key={ann.id} className="flex items-center gap-2">
                    <span className="text-blue-600">Text on page {ann.page}:</span>
                    <span className="truncate">{ann.text}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotation(ann.id)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {imageAnnotations.map(ann => (
                  <div key={ann.id} className="flex items-center gap-2">
                    <span className="text-green-600">Image on page {ann.page}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotation(ann.id)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {!pdfUrl && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <h3 className="text-xl font-medium text-gray-700">No PDF loaded</h3>
            <p className="text-gray-500">Upload a PDF to start editing with annotations</p>
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
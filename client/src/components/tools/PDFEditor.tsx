import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  
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
      setPdfFile(file);
      setTextAnnotations([]);
      setImageAnnotations([]);
      setSelectedAnnotation(null);
      setPageNumber(1);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try a different file.');
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const addTextAnnotation = () => {
    setIsAddingText(true);
  };

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingText) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text: "Click to edit",
      x: x - 100, // Center the text
      y: y - 15,
      fontSize: 16,
      page: pageNumber,
    };
    
    setTextAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setIsAddingText(false);
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
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        page: pageNumber,
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

  const deleteAnnotation = (id: string) => {
    setTextAnnotations(prev => prev.filter(ann => ann.id !== id));
    setImageAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const moveAnnotation = (id: string, deltaX: number, deltaY: number) => {
    setTextAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, x: ann.x + deltaX, y: ann.y + deltaY } : ann
    ));
    setImageAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, x: ann.x + deltaX, y: ann.y + deltaY } : ann
    ));
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
            y: copiedPage.getHeight() - annotation.y - 20,
            size: annotation.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        
        // Add image annotations for this page
        const pageImageAnnotations = imageAnnotations.filter(ann => ann.page === i + 1);
        for (const annotation of pageImageAnnotations) {
          try {
            // Convert data URL to bytes
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

  const currentPageTextAnnotations = textAnnotations.filter(ann => ann.page === pageNumber);
  const currentPageImageAnnotations = imageAnnotations.filter(ann => ann.page === pageNumber);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Editor</h1>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant={pdfFile ? "outline" : "default"}
        >
          {pdfFile ? "Change PDF" : "Upload PDF"}
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={loadPdf} 
          ref={fileInputRef} 
          className="hidden"
        />
        {pdfFile && <span className="text-sm text-green-600">✓ PDF loaded</span>}
      </div>
      
      {pdfFile && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={addTextAnnotation}
              variant={isAddingText ? "default" : "outline"}
            >
              {isAddingText ? "Click on PDF to add text" : "Add Text"}
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
                onClick={() => setPageNumber(pageNumber - 1)}
                disabled={pageNumber <= 1}
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pageNumber} of {numPages}
              </span>
              <Button 
                onClick={() => setPageNumber(pageNumber + 1)}
                disabled={pageNumber >= numPages}
                size="sm"
              >
                Next
              </Button>
            </div>
          )}

          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              PDF Editor - Click to add text, drag to move elements
            </h3>
            <div 
              className="relative bg-white p-4 flex justify-center"
              style={{ minHeight: '600px' }}
              onClick={handlePageClick}
            >
              <div className="relative">
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="shadow-lg"
                >
                  <Page 
                    pageNumber={pageNumber}
                    scale={1.2}
                    className="border"
                  />
                </Document>
                
                {/* Text Annotations Overlay */}
                {currentPageTextAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`absolute cursor-move border-2 ${
                      selectedAnnotation === annotation.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white bg-opacity-80'
                    } hover:border-gray-400 hover:bg-gray-50`}
                    style={{
                      left: annotation.x,
                      top: annotation.y,
                      fontSize: annotation.fontSize,
                      padding: '4px 8px',
                      minWidth: '100px',
                      minHeight: '30px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation.id);
                    }}
                    onMouseDown={(e) => {
                      if (selectedAnnotation === annotation.id) {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaY = moveEvent.clientY - startY;
                          moveAnnotation(annotation.id, deltaX, deltaY);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={annotation.text}
                      onChange={(e) => updateTextAnnotation(annotation.id, e.target.value)}
                      className="w-full bg-transparent border-none outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {selectedAnnotation === annotation.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-8 -right-2 w-6 h-6 p-0"
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
                      selectedAnnotation === annotation.id ? 'border-blue-500' : 'border-transparent'
                    } hover:border-gray-400`}
                    style={{
                      left: annotation.x,
                      top: annotation.y,
                      width: annotation.width,
                      height: annotation.height,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotation(annotation.id);
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
                        className="absolute -top-8 -right-2 w-6 h-6 p-0"
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

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>React PDF Editor:</strong></p>
            <p>• Click "Add Text" then click on the PDF to place text</p>
            <p>• Edit text directly in the input fields</p>
            <p>• Drag elements to move them around</p>
            <p>• Add images that overlay on the PDF</p>
            <p>• Download saves all annotations to the PDF permanently</p>
          </div>
        </>
      )}
      
      {!pdfFile && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <h3 className="text-xl font-medium text-gray-700">No PDF loaded</h3>
            <p className="text-gray-500">Upload a PDF to start editing</p>
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
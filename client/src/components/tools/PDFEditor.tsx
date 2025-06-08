import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from 'pdfjs-dist';

interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isEditing: boolean;
}

interface ImageAnnotation {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    setPdfBytes(bytes);

    try {
      // Load with pdf-lib for editing capabilities
      const loadedPdf = await PDFDocument.load(arrayBuffer, {
        updateMetadata: true,
        ignoreEncryption: true,
      });
      setPdfDoc(loadedPdf);

      // Load with PDF.js for rendering
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page
      renderPage(pdf, 1);
      
      // Clear annotations
      setTextAnnotations([]);
      setImageAnnotations([]);
      setSelectedAnnotation(null);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  const renderPage = async (pdf: any, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
  };

  const addTextAnnotation = () => {
    setIsAddingText(true);
    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text: "Click to edit",
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 16,
      isEditing: false,
    };
    setTextAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setIsAddingText(false);
  };

  const addImageAnnotation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    
    const file = files[0];
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
      };
      setImageAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingText) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newAnnotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text: "Edit me",
      x,
      y,
      width: 200,
      height: 30,
      fontSize: 16,
      isEditing: true,
    };
    
    setTextAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setIsAddingText(false);
  };

  const updateTextAnnotation = (id: string, text: string) => {
    setTextAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, text } : ann
    ));
  };

  const toggleTextEdit = (id: string) => {
    setTextAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, isEditing: !ann.isEditing } : ann
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
        
        // Add text annotations
        textAnnotations.forEach(async (annotation) => {
          const font = await pdfCopy.embedFont(StandardFonts.Helvetica);
          copiedPage.drawText(annotation.text, {
            x: annotation.x,
            y: copiedPage.getHeight() - annotation.y - annotation.height,
            size: annotation.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        });
      }
      
      const pdfBytes = await pdfCopy.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "edited.pdf";
      a.click();
      
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
  };

  const changePage = async (pageNum: number) => {
    if (!pdfBytes || pageNum < 1 || pageNum > numPages) return;
    
    setCurrentPage(pageNum);
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    renderPage(pdf, pageNum);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Editor with Canvas</h1>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant={pdfBytes ? "outline" : "default"}
        >
          {pdfBytes ? "Change PDF" : "Upload PDF"}
        </Button>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={loadPdf} 
          ref={fileInputRef} 
          className="hidden"
        />
        {pdfBytes && <span className="text-sm text-green-600">✓ PDF loaded</span>}
      </div>
      
      {pdfBytes && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={addTextAnnotation}>Add Text</Button>
            <label className="cursor-pointer">
              <Button asChild>
                <span>Add Image</span>
              </Button>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={addImageAnnotation}
              />
            </label>
            <Button onClick={savePdfWithAnnotations} variant="outline">
              Download PDF
            </Button>
          </div>

          {numPages > 1 && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1}
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {numPages}
              </span>
              <Button 
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= numPages}
                size="sm"
              >
                Next
              </Button>
            </div>
          )}

          <div className="border border-gray-300 rounded">
            <h3 className="p-2 bg-gray-100 font-medium text-sm">
              Canvas PDF Editor - Direct Editing
            </h3>
            <div 
              ref={containerRef}
              className="relative p-4 bg-gray-50"
              style={{ maxHeight: '80vh', overflow: 'auto' }}
            >
              <canvas
                ref={canvasRef}
                className="border shadow-lg mx-auto block"
                onClick={handleCanvasClick}
                style={{ cursor: isAddingText ? 'crosshair' : 'default' }}
              />
              
              {/* Text Annotations Overlay */}
              {textAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`absolute border-2 ${
                    selectedAnnotation === annotation.id ? 'border-blue-500' : 'border-transparent'
                  } bg-white bg-opacity-90 hover:border-gray-400`}
                  style={{
                    left: annotation.x + 16, // Account for container padding
                    top: annotation.y + 56,  // Account for header + padding
                    width: annotation.width,
                    height: annotation.height,
                    fontSize: annotation.fontSize,
                    padding: '4px',
                    cursor: 'move'
                  }}
                  onClick={() => setSelectedAnnotation(annotation.id)}
                  onDoubleClick={() => toggleTextEdit(annotation.id)}
                >
                  {annotation.isEditing ? (
                    <input
                      type="text"
                      value={annotation.text}
                      onChange={(e) => updateTextAnnotation(annotation.id, e.target.value)}
                      onBlur={() => toggleTextEdit(annotation.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          toggleTextEdit(annotation.id);
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="select-none">{annotation.text}</span>
                  )}
                  
                  {selectedAnnotation === annotation.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-8 -right-2"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}

              {/* Image Annotations Overlay */}
              {imageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`absolute border-2 ${
                    selectedAnnotation === annotation.id ? 'border-blue-500' : 'border-transparent'
                  } hover:border-gray-400`}
                  style={{
                    left: annotation.x + 16,
                    top: annotation.y + 56,
                    width: annotation.width,
                    height: annotation.height,
                    cursor: 'move'
                  }}
                  onClick={() => setSelectedAnnotation(annotation.id)}
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
                      className="absolute -top-8 -right-2"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>Canvas-based PDF Editor:</strong></p>
            <p>• Click "Add Text" then click on the PDF to place text</p>
            <p>• Double-click text to edit in real-time</p>
            <p>• Add images that overlay on the PDF</p>
            <p>• All annotations are saved when downloading</p>
            <p>• Navigate between pages with Previous/Next</p>
          </div>
        </>
      )}
      
      {!pdfBytes && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <h3 className="text-xl font-medium text-gray-700">No PDF loaded</h3>
            <p className="text-gray-500">Upload a PDF to start editing with canvas</p>
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
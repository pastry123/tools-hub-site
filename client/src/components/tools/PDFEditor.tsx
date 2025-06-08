import { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, Download, FileText, Edit3, Save, 
  Eye, RotateCw, Copy, Trash2, Plus, Type,
  Image, Move, Palette, AlignLeft, AlignCenter,
  AlignRight, Bold, Italic, Underline, MousePointer,
  Square, Circle, ArrowRight, Undo, Redo, ZoomIn,
  ZoomOut, Grid, Layers, Settings
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
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  page: number;
  originalFile?: File;
}

interface PDFPage {
  id: string;
  number: number;
  width: number;
  height: number;
  textElements: TextElement[];
  imageElements: ImageElement[];
  background?: string;
}

interface PDFDocument {
  id: string;
  name: string;
  file: File;
  pages: PDFPage[];
  currentPage: number;
  zoom: number;
  history: any[];
  historyIndex: number;
}

export default function PDFEditor() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'shape'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid File",
            description: "Please upload PDF files only",
            variant: "destructive",
          });
          continue;
        }

        // Analyze PDF structure
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('/api/pdf/analyze', {
          method: 'POST',
          body: formData,
        });

        const analysis = await response.json();

        const newDoc: PDFDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name.replace('.pdf', ''),
          file,
          pages: analysis.pages || generateSamplePages(),
          currentPage: 0,
          zoom: 1,
          history: [],
          historyIndex: -1
        };

        setDocuments(prev => [...prev, newDoc]);
        if (!selectedDoc) {
          setSelectedDoc(newDoc);
        }
      }

      toast({
        title: "PDF Loaded",
        description: "PDF is ready for editing",
      });
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Could not load PDF file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSamplePages = (): PDFPage[] => {
    return [
      {
        id: 'page-1',
        number: 1,
        width: 595,
        height: 842,
        textElements: [
          {
            id: 'text-1',
            content: 'Sample Text - Click to Edit',
            x: 100,
            y: 100,
            width: 300,
            height: 30,
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#000000',
            bold: false,
            italic: false,
            underline: false,
            alignment: 'left',
            page: 1,
            rotation: 0
          }
        ],
        imageElements: []
      }
    ];
  };

  const addTextElement = (x: number = 100, y: number = 100) => {
    if (!selectedDoc) return;

    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      content: 'New Text',
      x,
      y,
      width: 200,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      bold: false,
      italic: false,
      underline: false,
      alignment: 'left',
      page: selectedDoc.currentPage + 1,
      rotation: 0
    };

    const updatedDoc = {
      ...selectedDoc,
      pages: selectedDoc.pages.map(page =>
        page.number === selectedDoc.currentPage + 1
          ? {
              ...page,
              textElements: [...page.textElements, newTextElement]
            }
          : page
      )
    };

    updateDocument(updatedDoc);
    setSelectedElement(newTextElement.id);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      pages: selectedDoc.pages.map(page => ({
        ...page,
        textElements: page.textElements.map(element =>
          element.id === id ? { ...element, ...updates } : element
        )
      }))
    };

    updateDocument(updatedDoc);
  };

  const deleteTextElement = (id: string) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      pages: selectedDoc.pages.map(page => ({
        ...page,
        textElements: page.textElements.filter(element => element.id !== id)
      }))
    };

    updateDocument(updatedDoc);
    setSelectedElement(null);
  };

  const addImageElement = async (file: File) => {
    if (!selectedDoc) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImageElement: ImageElement = {
        id: `image-${Date.now()}`,
        src: e.target?.result as string,
        x: 100,
        y: 200,
        width: 200,
        height: 150,
        rotation: 0,
        opacity: 1,
        page: selectedDoc.currentPage + 1,
        originalFile: file
      };

      const updatedDoc = {
        ...selectedDoc,
        pages: selectedDoc.pages.map(page =>
          page.number === selectedDoc.currentPage + 1
            ? {
                ...page,
                imageElements: [...page.imageElements, newImageElement]
              }
            : page
        )
      };

      updateDocument(updatedDoc);
      setSelectedElement(newImageElement.id);
    };
    reader.readAsDataURL(file);
  };

  const updateImageElement = (id: string, updates: Partial<ImageElement>) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      pages: selectedDoc.pages.map(page => ({
        ...page,
        imageElements: page.imageElements.map(element =>
          element.id === id ? { ...element, ...updates } : element
        )
      }))
    };

    updateDocument(updatedDoc);
  };

  const deleteImageElement = (id: string) => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      pages: selectedDoc.pages.map(page => ({
        ...page,
        imageElements: page.imageElements.filter(element => element.id !== id)
      }))
    };

    updateDocument(updatedDoc);
    setSelectedElement(null);
  };

  const updateDocument = (doc: PDFDocument) => {
    setSelectedDoc(doc);
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload image files only",
        variant: "destructive",
      });
      return;
    }

    addImageElement(file);
  };

  const exportPDF = async () => {
    if (!selectedDoc) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedDoc.file);
      formData.append('edits', JSON.stringify({
        pages: selectedDoc.pages,
        textElements: selectedDoc.pages.flatMap(p => p.textElements),
        imageElements: selectedDoc.pages.flatMap(p => p.imageElements)
      }));

      const response = await fetch('/api/pdf/apply-edits', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_${selectedDoc.name}.pdf`;
        a.click();

        toast({
          title: "PDF Exported",
          description: "Edited PDF has been downloaded",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export edited PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentPage = () => {
    if (!selectedDoc) return null;
    return selectedDoc.pages[selectedDoc.currentPage];
  };

  const getSelectedTextElement = () => {
    const page = getCurrentPage();
    if (!page || !selectedElement) return null;
    return page.textElements.find(el => el.id === selectedElement);
  };

  const getSelectedImageElement = () => {
    const page = getCurrentPage();
    if (!page || !selectedElement) return null;
    return page.imageElements.find(el => el.id === selectedElement);
  };

  const handleElementDragStart = (e: DragEvent, elementId: string, elementType: 'text' | 'image') => {
    e.dataTransfer.setData('elementId', elementId);
    e.dataTransfer.setData('elementType', elementType);
    setSelectedElement(elementId);
  };

  const handleElementDragEnd = (e: DragEvent) => {
    if (!selectedDoc || !selectedElement) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, (e.clientX - rect.left) / selectedDoc.zoom);
    const y = Math.max(0, (e.clientY - rect.top) / selectedDoc.zoom);

    const elementType = e.dataTransfer.getData('elementType');
    
    if (elementType === 'text') {
      updateTextElement(selectedElement, { x, y });
    } else if (elementType === 'image') {
      updateImageElement(selectedElement, { x, y });
    }
  };

  const duplicateElement = () => {
    if (!selectedElement || !selectedDoc) return;

    const page = getCurrentPage();
    if (!page) return;

    const textElement = page.textElements.find(el => el.id === selectedElement);
    const imageElement = page.imageElements.find(el => el.id === selectedElement);

    if (textElement) {
      const newElement = {
        ...textElement,
        id: `text-${Date.now()}`,
        x: textElement.x + 20,
        y: textElement.y + 20,
        content: textElement.content + ' (Copy)'
      };

      const updatedDoc = {
        ...selectedDoc,
        pages: selectedDoc.pages.map(p =>
          p.number === selectedDoc.currentPage + 1
            ? { ...p, textElements: [...p.textElements, newElement] }
            : p
        )
      };

      updateDocument(updatedDoc);
      setSelectedElement(newElement.id);
    } else if (imageElement) {
      const newElement = {
        ...imageElement,
        id: `image-${Date.now()}`,
        x: imageElement.x + 20,
        y: imageElement.y + 20
      };

      const updatedDoc = {
        ...selectedDoc,
        pages: selectedDoc.pages.map(p =>
          p.number === selectedDoc.currentPage + 1
            ? { ...p, imageElements: [...p.imageElements, newElement] }
            : p
        )
      };

      updateDocument(updatedDoc);
      setSelectedElement(newElement.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced PDF Editor</h1>
        <p className="text-gray-600">Edit text, add images, and manipulate PDF content directly</p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Load PDF
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-2">
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
                <Button
                  variant={tool === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="w-4 h-4" />
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <Separator orientation="vertical" className="h-8" />

              <Button
                size="sm"
                onClick={() => addTextElement()}
                disabled={!selectedDoc}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Text
              </Button>

              {selectedElement && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={duplicateElement}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>

              {selectedDoc && (
                <Button 
                  onClick={exportPDF}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No PDF loaded</h3>
            <p className="text-gray-600 mb-4">Upload a PDF file to start editing</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Load PDF
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List */}
          <div className="space-y-4">
            <h3 className="font-medium">Open Documents</h3>
            {documents.map((doc) => (
              <Card 
                key={doc.id}
                className={`cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm">{doc.name}</h4>
                  <p className="text-xs text-gray-600">
                    Page {doc.currentPage + 1} of {doc.pages.length}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedDoc.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateDocument({
                          ...selectedDoc,
                          currentPage: Math.max(0, selectedDoc.currentPage - 1)
                        })}
                        disabled={selectedDoc.currentPage === 0}
                      >
                        Previous
                      </Button>
                      <span className="text-sm px-2">
                        {selectedDoc.currentPage + 1} / {selectedDoc.pages.length}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateDocument({
                          ...selectedDoc,
                          currentPage: Math.min(selectedDoc.pages.length - 1, selectedDoc.currentPage + 1)
                        })}
                        disabled={selectedDoc.currentPage === selectedDoc.pages.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative border rounded-lg overflow-hidden">
                    <div 
                      className={`relative bg-white ${showGrid ? 'bg-grid' : ''}`}
                      style={{
                        width: '100%',
                        height: '600px',
                        transform: `scale(${selectedDoc.zoom})`,
                        transformOrigin: 'top left'
                      }}
                      onClick={(e) => {
                        if (tool === 'text') {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / selectedDoc.zoom;
                          const y = (e.clientY - rect.top) / selectedDoc.zoom;
                          addTextElement(x, y);
                        }
                      }}
                    >
                      {/* Render Text Elements */}
                      {getCurrentPage()?.textElements.map((textEl) => (
                        <div
                          key={textEl.id}
                          draggable
                          className={`absolute cursor-move border-2 select-none ${
                            selectedElement === textEl.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{
                            left: textEl.x,
                            top: textEl.y,
                            width: textEl.width,
                            height: textEl.height,
                            fontSize: textEl.fontSize,
                            fontFamily: textEl.fontFamily,
                            color: textEl.color,
                            fontWeight: textEl.bold ? 'bold' : 'normal',
                            fontStyle: textEl.italic ? 'italic' : 'normal',
                            textDecoration: textEl.underline ? 'underline' : 'none',
                            textAlign: textEl.alignment,
                            transform: `rotate(${textEl.rotation}deg)`,
                            padding: '4px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement(textEl.id);
                          }}
                          onDragStart={(e) => handleElementDragStart(e, textEl.id, 'text')}
                          onDragEnd={handleElementDragEnd}
                        >
                          {textEl.content}
                        </div>
                      ))}

                      {/* Render Image Elements */}
                      {getCurrentPage()?.imageElements.map((imgEl) => (
                        <div
                          key={imgEl.id}
                          draggable
                          className={`absolute cursor-move border-2 select-none ${
                            selectedElement === imgEl.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{
                            left: imgEl.x,
                            top: imgEl.y,
                            width: imgEl.width,
                            height: imgEl.height,
                            transform: `rotate(${imgEl.rotation}deg)`,
                            opacity: imgEl.opacity
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement(imgEl.id);
                          }}
                          onDragStart={(e) => handleElementDragStart(e, imgEl.id, 'image')}
                          onDragEnd={handleElementDragEnd}
                        >
                          <img
                            src={imgEl.src}
                            alt="PDF Element"
                            className="w-full h-full object-contain pointer-events-none"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a document</h3>
                  <p className="text-gray-600">Choose a document from the list to start editing</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Properties Panel */}
          <div className="space-y-4">
            <h3 className="font-medium">Properties</h3>
            
            {selectedElement && getSelectedTextElement() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Text Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      value={getSelectedTextElement()!.content}
                      onChange={(e) => updateTextElement(selectedElement, { content: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Input
                        type="number"
                        value={getSelectedTextElement()!.fontSize}
                        onChange={(e) => updateTextElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Color</label>
                      <Input
                        type="color"
                        value={getSelectedTextElement()!.color}
                        onChange={(e) => updateTextElement(selectedElement, { color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Font Family</label>
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
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">X Position</label>
                      <Input
                        type="number"
                        value={getSelectedTextElement()!.x}
                        onChange={(e) => updateTextElement(selectedElement, { x: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Y Position</label>
                      <Input
                        type="number"
                        value={getSelectedTextElement()!.y}
                        onChange={(e) => updateTextElement(selectedElement, { y: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTextElement(selectedElement)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Text
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedElement && getSelectedImageElement() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Image Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Width</label>
                      <Input
                        type="number"
                        value={getSelectedImageElement()!.width}
                        onChange={(e) => updateImageElement(selectedElement, { width: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Height</label>
                      <Input
                        type="number"
                        value={getSelectedImageElement()!.height}
                        onChange={(e) => updateImageElement(selectedElement, { height: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">X Position</label>
                      <Input
                        type="number"
                        value={getSelectedImageElement()!.x}
                        onChange={(e) => updateImageElement(selectedElement, { x: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Y Position</label>
                      <Input
                        type="number"
                        value={getSelectedImageElement()!.y}
                        onChange={(e) => updateImageElement(selectedElement, { y: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rotation</label>
                    <Slider
                      value={[getSelectedImageElement()!.rotation]}
                      onValueChange={([value]) => updateImageElement(selectedElement, { rotation: value })}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-600 mt-1">{getSelectedImageElement()!.rotation}°</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Opacity</label>
                    <Slider
                      value={[getSelectedImageElement()!.opacity * 100]}
                      onValueChange={([value]) => updateImageElement(selectedElement, { opacity: value / 100 })}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-600 mt-1">{Math.round(getSelectedImageElement()!.opacity * 100)}%</div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImageElement(selectedElement)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Image
                  </Button>
                </CardContent>
              </Card>
            )}

            {!selectedElement && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MousePointer className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-sm font-medium mb-2">No element selected</h3>
                  <p className="text-xs text-gray-600">Click on text or image to edit properties</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Button } from "@/components/ui/button";

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfPages, setPdfPages] = useState<number[]>([]);
  const [pdfBlobs, setPdfBlobs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transparentField, setTransparentField] = useState(false);
  const [fields, setFields] = useState<Record<number, any[]>>({});
  const [images, setImages] = useState<Record<number, any[]>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const loadedPdf = await PDFDocument.load(arrayBuffer, {
      updateMetadata: true,
      ignoreEncryption: true,
    });
    const pageCount = loadedPdf.getPageCount();

    const pageUrls = [];
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(loadedPdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      pageUrls.push(URL.createObjectURL(blob));
    }

    setPdfDoc(loadedPdf);
    setPdfPages(Array.from({ length: pageCount }, (_, i) => i));
    setPdfBlobs(pageUrls);

    setFields({});
    setImages({});
  }

  function addDraggableText(page: number) {
    const id = Date.now().toString();
    setFields(prev => ({
      ...prev,
      [page]: [...(prev[page] || []), { id, x: 100, y: 100, text: "Edit me", width: 150, height: 30 }]
    }));
  }

  function updateField(page: number, id: string, updates: any) {
    setFields(prev => ({
      ...prev,
      [page]: (prev[page] || []).map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  }

  function startDrag(e: React.MouseEvent, page: number, id: string) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const onMove = (moveEvent: MouseEvent) => {
      const container = e.currentTarget.parentElement?.getBoundingClientRect();
      if (!container) return;
      
      updateField(page, id, {
        x: moveEvent.clientX - container.left - offsetX,
        y: moveEvent.clientY - container.top - offsetY,
      });
    };
    
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function addImageOverlay(page: number, file: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages(prev => ({
      ...prev,
      [page]: [...(prev[page] || []), {
        url,
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        type: file.type
      }]
    }));
  }

  function updateImage(page: number, idx: number, updates: any) {
    setImages(prev => {
      const updated = [...(prev[page] || [])];
      updated[idx] = { ...updated[idx], ...updates };
      return { ...prev, [page]: updated };
    });
  }

  function startImageDrag(e: React.MouseEvent, page: number, idx: number) {
    const offsetX = e.nativeEvent.offsetX;
    const offsetY = e.nativeEvent.offsetY;
    
    const onMove = (moveEvent: MouseEvent) => {
      updateImage(page, idx, {
        x: moveEvent.clientX - offsetX,
        y: moveEvent.clientY - offsetY,
      });
    };
    
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  async function renderToPdf() {
    if (!pdfDoc) return;

    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageFields = fields[i] || [];
      const pageImages = images[i] || [];

      for (const field of pageFields) {
        page.drawText(field.text, {
          x: field.x,
          y: page.getHeight() - field.y - field.height,
          size: 12,
          color: rgb(0, 0, 0),
          ...(transparentField ? {} : { backgroundColor: rgb(1, 1, 1) }),
        });
      }

      for (const img of pageImages) {
        const imageBytes = await fetch(img.url).then(res => res.arrayBuffer());
        let embeddedImg;
        if (img.type === "image/jpeg") {
          embeddedImg = await pdfDoc.embedJpg(imageBytes);
        } else {
          embeddedImg = await pdfDoc.embedPng(imageBytes);
        }
        page.drawImage(embeddedImg, {
          x: img.x,
          y: page.getHeight() - img.y - img.height,
          width: img.width,
          height: img.height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const newUrl = URL.createObjectURL(blob);
    setPdfBlobs([newUrl]);
  }

  async function downloadPdf() {
    if (!pdfDoc) return;
    
    // Apply all changes to PDF first
    await renderToPdf();
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "edited.pdf";
    a.click();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ToolHub PDF Editor</h1>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={loadPdf} 
        ref={fileInputRef} 
      />

      <div className="space-y-8">
        {pdfBlobs.map((blobUrl, pageIndex) => (
          <div key={pageIndex} className="relative w-full h-[700px] border">
            <iframe
              src={blobUrl}
              className="w-full h-full absolute z-0"
              title={`Page ${pageIndex + 1}`}
            />
            
            {/* Text fields - positioned absolutely but only where needed */}
            {(fields[pageIndex] || []).map(field => (
              <div
                key={field.id}
                style={{
                  position: "absolute",
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  height: field.height,
                  border: selectedField === field.id ? "2px solid #007acc" : "1px solid transparent",
                  resize: selectedField === field.id ? "both" : "none",
                  overflow: "hidden",
                  background: transparentField ? "transparent" : "white",
                  zIndex: 20,
                }}
                onMouseDown={e => {
                  e.stopPropagation();
                  setSelectedField(field.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const isResizeCorner = x > rect.width - 15 && y > rect.height - 15;
                  
                  if (!isResizeCorner) {
                    startDrag(e, pageIndex, field.id);
                  }
                }}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedField(field.id);
                }}
              >
                <textarea
                  value={field.text}
                  onChange={e => updateField(pageIndex, field.id, { text: e.target.value })}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    resize: "none",
                    outline: "none",
                    padding: "4px",
                    color: "#000000",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                  }}
                  onMouseDown={e => e.stopPropagation()}
                  onFocus={() => setSelectedField(field.id)}
                  onBlur={() => setSelectedField(null)}
                />
              </div>
            ))}
            
            {/* Images */}
            {(images[pageIndex] || []).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                onMouseDown={e => startImageDrag(e, pageIndex, idx)}
                style={{
                  position: "absolute",
                  left: img.x,
                  top: img.y,
                  width: img.width,
                  height: img.height,
                  cursor: "move",
                  zIndex: 20,
                }}
                draggable={false}
              />
            ))}
            
            {/* Controls */}
            <div className="absolute bottom-2 left-2 z-30 space-x-2 bg-white bg-opacity-80 p-1 rounded">
              <Button size="sm" onClick={() => addDraggableText(pageIndex)}>
                Add Text to Page {pageIndex + 1}
              </Button>
              <label className="cursor-pointer inline-block">
                <span className="px-2 py-1 bg-gray-300 rounded text-sm">Add Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={e => addImageOverlay(pageIndex, e.target.files?.[0]!)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="space-x-2 pt-4">
        <Button onClick={renderToPdf}>Apply All Changes</Button>
        <Button onClick={downloadPdf}>Download PDF</Button>
      </div>

      <label className="block pt-2">
        <input
          type="checkbox"
          checked={transparentField}
          onChange={(e) => setTransparentField(e.target.checked)}
          className="mr-2"
        />
        Transparent Background
      </label>
    </div>
  );
}
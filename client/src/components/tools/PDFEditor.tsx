import { useState, useRef } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface TextField {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  page: number;
}

export default function PDFEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [fields, setFields] = useState<TextField[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [transparentField, setTransparentField] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPageIndex(0);
    }
  }

  function addDraggableText() {
    const id = Date.now();
    setFields([
      ...fields,
      {
        id,
        x: 100,
        y: 100,
        text: "Edit me",
        color: textColor,
        page: pageIndex,
      },
    ]);
  }

  function updateField(id: number, updates: Partial<TextField>) {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }

  function deleteSelected() {
    setFields(fields.filter(f => f.id !== selectedId));
    setSelectedId(null);
  }

  const nextPage = () => {
    if (numPages && pageIndex < numPages - 1) setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  function startDrag(e: React.MouseEvent, id: number) {
    const startX = e.clientX;
    const startY = e.clientY;
    const target = fields.find(f => f.id === id);
    if (!target) return;
    
    setSelectedId(id);
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateField(id, { x: target.x + dx, y: target.y + dy });
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ToolHub PDF Canvas Editor</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {file && (
        <div className="relative border h-[600px]">
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="h-full w-full">
            <Page pageNumber={pageIndex + 1} width={800} renderTextLayer={true} renderAnnotationLayer={true} />
          </Document>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {fields
              .filter(f => f.page === pageIndex)
              .map(field => (
                <textarea
                  key={field.id}
                  value={field.text}
                  onChange={(e) => updateField(field.id, { text: e.target.value })}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    startDrag(e, field.id);
                  }}
                  style={{
                    position: "absolute",
                    top: field.y,
                    left: field.x,
                    background: transparentField ? "transparent" : "white",
                    color: field.color,
                    border: "1px solid #999",
                    resize: "both",
                    pointerEvents: "auto",
                    padding: "2px",
                  }}
                />
              ))}
          </div>
        </div>
      )}

      <div className="space-x-2">
        <Button onClick={addDraggableText}>Add Editable Text</Button>
        <Button onClick={deleteSelected} variant="destructive">Delete Selected</Button>
      </div>

      <div className="flex gap-2 items-center">
        <Button onClick={prevPage} disabled={pageIndex === 0}>Previous Page</Button>
        <Button onClick={nextPage} disabled={pageIndex >= (numPages || 1) - 1}>Next Page</Button>
        <span>Page {pageIndex + 1} / {numPages}</span>
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
      <label className="block pt-2">
        <span className="mr-2">Text Color:</span>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
      </label>
    </div>
  );
}
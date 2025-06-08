import { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFEditor() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textColor, setTextColor] = useState("#000000");
  const [transparentField, setTransparentField] = useState(false);
  const containerRef = useRef(null);

  const pageWidth = 800;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setPageIndex(0);
    setFields([]); // reset fields
  }

  function addDraggableText() {
    const id = Date.now();
    setFields(prev => [
      ...prev,
      {
        id,
        x: 100,
        y: 100,
        text: "Edit me",
        color: textColor,
        page: pageIndex,
        width: 150,
        height: 30,
      },
    ]);
  }

  function updateField(id, updates) {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }

  function deleteSelected() {
    if (selectedId != null) {
      setFields(fields.filter(f => f.id !== selectedId));
      setSelectedId(null);
    }
  }

  const nextPage = () => {
    if (pageIndex < numPages - 1) setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  function startDrag(e, id) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const target = fields.find(f => f.id === id);
    const origX = target.x;
    const origY = target.y;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateField(id, {
        x: Math.max(0, Math.min(origX + dx, pageWidth - target.width)),
        y: Math.max(0, origY + dy),
      });
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
        <div className="relative border mx-auto" ref={containerRef} style={{ width: pageWidth }}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="w-full"
          >
            <Page
              pageNumber={pageIndex + 1}
              width={pageWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {fields
              .filter(f => f.page === pageIndex)
              .map(field => (
                <textarea
                  key={field.id}
                  value={field.text}
                  onChange={e => updateField(field.id, { text: e.target.value })}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(field.id);
                    startDrag(e, field.id);
                  }}
                  style={{
                    position: "absolute",
                    top: field.y,
                    left: field.x,
                    width: field.width,
                    height: field.height,
                    background: transparentField ? "transparent" : "white",
                    color: field.color,
                    border: selectedId === field.id ? "2px solid blue" : "1px solid #999",
                    resize: "both",
                    pointerEvents: "auto",
                    padding: "4px",
                    overflow: "hidden",
                    zIndex: 10,
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
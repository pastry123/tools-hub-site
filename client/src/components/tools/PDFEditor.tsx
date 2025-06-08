import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Type, Image, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadedPdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(loadedPdf);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
      
      toast({
        title: "PDF loaded successfully",
        description: `Document with ${loadedPdf.getPageCount()} pages loaded`
      });
    } catch (error) {
      toast({
        title: "Failed to load PDF",
        description: "Please select a valid PDF file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function addTextToFirstPage() {
    if (!pdfDoc) return;
    
    setIsLoading(true);
    try {
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      firstPage.drawText("Edited by ToolHub PDF Editor", {
        x: 50,
        y: height - 100,
        size: 18,
        font,
        color: rgb(0.2, 0.2, 0.8),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
      
      toast({
        title: "Text added",
        description: "Text has been added to the first page"
      });
    } catch (error) {
      toast({
        title: "Failed to add text",
        description: "Could not add text to PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function addImageToFirstPage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!pdfDoc || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setIsLoading(true);
    
    try {
      const imageBytes = await file.arrayBuffer();
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      let img;
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        img = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === "image/png") {
        img = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Unsupported image format");
      }

      const imgDims = img.scale(0.5);

      firstPage.drawImage(img, {
        x: width / 2 - imgDims.width / 2,
        y: height / 2 - imgDims.height / 2,
        width: imgDims.width,
        height: imgDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
      
      toast({
        title: "Image added",
        description: "Image has been added to the first page"
      });
    } catch (error) {
      toast({
        title: "Failed to add image",
        description: "Could not add image to PDF. Please use PNG or JPEG format.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset the input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }

  async function downloadPdf() {
    if (!pdfDoc) return;
    
    setIsLoading(true);
    try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "edited-document.pdf";
      a.click();
      
      toast({
        title: "PDF downloaded",
        description: "Your edited PDF has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-upload">Upload PDF File</Label>
            <div className="mt-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? "Loading..." : "Choose PDF File"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={loadPdf}
                className="hidden"
                id="pdf-upload"
              />
            </div>
          </div>

          {url && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={url}
                  className="w-full h-[600px]"
                  title="PDF Preview"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={addTextToFirstPage}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Type className="w-4 h-4" />
                  Add Text
                </Button>

                <Button
                  onClick={() => imageInputRef.current?.click()}
                  variant="outline"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Add Image
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={addImageToFirstPage}
                />

                <Button
                  onClick={downloadPdf}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}

          {!url && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Upload a PDF file to start editing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
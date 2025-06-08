import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [marginX, setMarginX] = useState(50);
  const [marginY, setMarginY] = useState(30);
  const [numberedPdf, setNumberedPdf] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive",
      });
    }
  };

  const addPageNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('position', position);
    formData.append('startNumber', startNumber.toString());
    formData.append('fontSize', fontSize.toString());
    formData.append('marginX', marginX.toString());
    formData.append('marginY', marginY.toString());

    try {
      const response = await fetch('/api/pdf/add-page-numbers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setNumberedPdf(url);
        toast({
          title: "Success",
          description: "Page numbers added successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add page numbers');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add page numbers to PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (numberedPdf) {
      const a = document.createElement('a');
      a.href = numberedPdf;
      a.download = `numbered_${file?.name || 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Add Page Numbers to PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="pdf-upload" className="block text-sm font-medium mb-2">
              Upload PDF
            </label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm">
                  <strong>File:</strong> {file.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Number</label>
                  <Input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                    min="8"
                    max="24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Margin (px)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={marginX}
                      onChange={(e) => setMarginX(parseInt(e.target.value) || 50)}
                      placeholder="X"
                      min="10"
                    />
                    <Input
                      type="number"
                      value={marginY}
                      onChange={(e) => setMarginY(parseInt(e.target.value) || 30)}
                      placeholder="Y"
                      min="10"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={addPageNumbers} 
                disabled={isProcessing}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? "Adding Page Numbers..." : "Add Page Numbers"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {numberedPdf && (
        <Card>
          <CardHeader>
            <CardTitle>PDF with Page Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200">
                Page numbers have been successfully added to your PDF!
              </p>
            </div>
            <Button onClick={downloadPDF} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download PDF with Page Numbers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
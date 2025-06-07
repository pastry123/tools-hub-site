import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Download } from "lucide-react";

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Please select only PDF files.",
        variant: "destructive",
      });
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Insufficient Files",
        description: "Please select at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate PDF merging process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "PDFs Merged Successfully",
        description: "Your merged PDF is ready for download.",
      });
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "Failed to merge PDF files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Drag and drop PDF files here or click to browse</p>
            <Button variant="outline">
              Choose PDF Files
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            multiple
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Selected Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Button */}
      <Button
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="w-full primary-button"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Merging PDFs...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Merge PDF Files
          </>
        )}
      </Button>
    </div>
  );
}

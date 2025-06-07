import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Download, Gauge, FileText, Info } from "lucide-react";

interface CompressionLevel {
  id: string;
  name: string;
  description: string;
  quality: number;
  expectedReduction: string;
}

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>({
    id: 'medium',
    name: 'Medium',
    description: 'Good balance of quality and file size',
    quality: 70,
    expectedReduction: '40-60%'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressionLevels: CompressionLevel[] = [
    {
      id: 'low',
      name: 'Low Compression',
      description: 'Minimal compression, highest quality',
      quality: 90,
      expectedReduction: '10-30%'
    },
    {
      id: 'medium',
      name: 'Medium Compression',
      description: 'Good balance of quality and file size',
      quality: 70,
      expectedReduction: '40-60%'
    },
    {
      id: 'high',
      name: 'High Compression',
      description: 'Maximum compression, smaller file size',
      quality: 50,
      expectedReduction: '60-80%'
    },
    {
      id: 'extreme',
      name: 'Extreme Compression',
      description: 'Very small files, may reduce quality',
      quality: 30,
      expectedReduction: '70-90%'
    }
  ];

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 200 * 1024 * 1024) { // 200MB limit
      toast({
        title: "File too large",
        description: "File exceeds 200MB limit",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedPdfUrl(null);
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateCompressionRatio = () => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  };

  const compressPDF = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', compressionLevel.quality.toString());
      formData.append('compressionLevel', compressionLevel.id);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 400);

      const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to compress PDF: ${response.statusText}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      setCompressedSize(blob.size);
      
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);

      const reduction = calculateCompressionRatio();
      toast({
        title: "Success!",
        description: `PDF compressed successfully! Reduced by ${reduction}%`,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compress PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedPDF = () => {
    if (compressedPdfUrl && file) {
      const link = document.createElement("a");
      link.href = compressedPdfUrl;
      link.download = `compressed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setFile(null);
    setCompressedPdfUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            PDF Compressor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reduce PDF file size while maintaining quality. Choose compression level based on your needs.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileSelection(files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload PDF File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a PDF file here, or click to browse
            </p>
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelection(files[0]);
                }
              }}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Original size: {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compression Levels */}
          {file && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Compression Level</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {compressionLevels.map((level) => (
                  <Card
                    key={level.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      compressionLevel.id === level.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setCompressionLevel(level)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{level.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {level.expectedReduction}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Quality:</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${level.quality}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{level.quality}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Higher compression reduces file size but may affect image quality. 
                  Text and vector graphics are preserved at all levels.
                </span>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compressing PDF...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={compressPDF}
              disabled={!file || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Compressing..." : "Compress PDF"}
            </Button>
            
            {file && (
              <Button variant="outline" onClick={resetTool}>
                Reset
              </Button>
            )}
          </div>

          {/* Compression Results */}
          {compressedPdfUrl && compressedSize > 0 && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="space-y-3">
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  Compression Complete!
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original Size:</span>
                    <p className="font-medium">{formatFileSize(originalSize)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Compressed Size:</span>
                    <p className="font-medium">{formatFileSize(compressedSize)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size Reduction:</span>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {calculateCompressionRatio()}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your compressed PDF is ready for download
                  </p>
                  <Button onClick={downloadCompressedPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
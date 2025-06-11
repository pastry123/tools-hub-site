import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileUp, Download, RefreshCw, FileText, Image, FileSpreadsheet, FileCode } from "lucide-react";

interface ConversionFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: any;
  inputFormats: string[];
  outputFormat: string;
}

export default function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const conversionFormats: ConversionFormat[] = [
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      extension: '.docx',
      description: 'Convert PDF to editable Word document',
      icon: FileText,
      inputFormats: ['application/pdf'],
      outputFormat: 'docx'
    },
    {
      id: 'word-to-pdf',
      name: 'Word to PDF',
      extension: '.pdf',
      description: 'Convert Word document to PDF',
      icon: FileText,
      inputFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
      outputFormat: 'pdf'
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      extension: '.xlsx',
      description: 'Extract tables from PDF to Excel spreadsheet',
      icon: FileSpreadsheet,
      inputFormats: ['application/pdf'],
      outputFormat: 'xlsx'
    },
    {
      id: 'excel-to-pdf',
      name: 'Excel to PDF',
      extension: '.pdf',
      description: 'Convert Excel spreadsheet to PDF',
      icon: FileSpreadsheet,
      inputFormats: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      outputFormat: 'pdf'
    },
    {
      id: 'pdf-to-images',
      name: 'PDF to Images',
      extension: '.zip',
      description: 'Convert PDF pages to JPG/PNG images',
      icon: Image,
      inputFormats: ['application/pdf'],
      outputFormat: 'images'
    },
    {
      id: 'images-to-pdf',
      name: 'Images to PDF',
      extension: '.pdf',
      description: 'Combine multiple images into a PDF',
      icon: Image,
      inputFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
      outputFormat: 'pdf'
    },
    {
      id: 'pdf-to-text',
      name: 'PDF to Text',
      extension: '.txt',
      description: 'Extract plain text from PDF',
      icon: FileCode,
      inputFormats: ['application/pdf'],
      outputFormat: 'txt'
    },
    {
      id: 'pdf-to-html',
      name: 'PDF to HTML',
      extension: '.html',
      description: 'Convert PDF to HTML format',
      icon: FileCode,
      inputFormats: ['application/pdf'],
      outputFormat: 'html'
    }
  ];

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setConvertedFileUrl(null);
    setConvertedFileName("");
    
    // Auto-select compatible format if only one option
    const compatibleFormats = conversionFormats.filter(format =>
      format.inputFormats.includes(selectedFile.type)
    );
    
    if (compatibleFormats.length === 1) {
      setSelectedFormat(compatibleFormats[0]);
    } else {
      setSelectedFormat(null);
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "File exceeds 100MB limit",
        variant: "destructive",
      });
      return;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCompatibleFormats = () => {
    if (!file) return conversionFormats;
    return conversionFormats.filter(format =>
      format.inputFormats.includes(file.type)
    );
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('document')) return FileText;
    if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('image')) return Image;
    return FileCode;
  };

  const convertFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFormat) {
      toast({
        title: "No format selected",
        description: "Please select a conversion format",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', selectedFormat.outputFormat);
      formData.append('conversionType', selectedFormat.id);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 12;
        });
      }, 500);

      const response = await fetch('/api/pdf/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to convert file: ${response.statusText}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);

      // Generate output filename
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setConvertedFileName(`${baseName}${selectedFormat.extension}`);

      toast({
        title: "Success!",
        description: `File converted to ${selectedFormat.name.split(' to ')[1]} successfully`,
      });
    } catch (error) {
      console.error("Error converting file:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadConvertedFile = () => {
    if (convertedFileUrl && convertedFileName) {
      const link = document.createElement("a");
      link.href = convertedFileUrl;
      link.download = convertedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setFile(null);
    setSelectedFormat(null);
    setConvertedFileUrl(null);
    setConvertedFileName("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const FileTypeIcon = file ? getFileTypeIcon(file.type) : FileText;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {t("pdfConverter.title") || "محول PDF"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("pdfConverter.description") || "تحويل بين PDF وتنسيقات المستندات المختلفة بما في ذلك Word و Excel والصور والمزيد"}
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
            <h3 className="text-lg font-medium mb-2">{t("pdfConverter.uploadFile") || "رفع ملف"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("pdfConverter.dragDrop") || "اسحب وأسقط ملف هنا، أو انقر للتصفح"}
            </p>
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              {t("pdfConverter.chooseFile") || "اختر ملف"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp"
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
                <FileTypeIcon className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium">{file.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          {file && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Output Format</h3>
              
              <Select
                value={selectedFormat?.id || ""}
                onValueChange={(value) => {
                  const format = conversionFormats.find(f => f.id === value);
                  setSelectedFormat(format || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose conversion format" />
                </SelectTrigger>
                <SelectContent>
                  {getCompatibleFormats().map((format) => {
                    const Icon = format.icon;
                    return (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{format.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedFormat && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <selectedFormat.icon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {selectedFormat.name}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {selectedFormat.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Converting file...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={convertFile}
              disabled={!file || !selectedFormat || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Converting..." : "Convert File"}
            </Button>
            
            {file && (
              <Button variant="outline" onClick={resetTool}>
                Reset
              </Button>
            )}
          </div>

          {/* Conversion Results */}
          {convertedFileUrl && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Conversion Complete!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {convertedFileName} is ready for download
                  </p>
                </div>
                <Button onClick={downloadConvertedFile}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Supported Formats Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Supported formats: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Images (JPG/PNG/GIF/BMP)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
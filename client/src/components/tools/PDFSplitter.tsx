import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileUp, Download, Scissors, FileText, AlertCircle, Info } from "lucide-react";

interface SplitOption {
  type: 'pages' | 'ranges' | 'every' | 'size';
  value: string;
  label: string;
}

export default function PDFSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [splitOption, setSplitOption] = useState<SplitOption>({
    type: 'pages',
    value: '',
    label: 'Specific Pages'
  });
  const [pageInput, setPageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResults, setSplitResults] = useState<Array<{ name: string; url: string; pages: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const splitOptions: SplitOption[] = [
    { type: 'pages', value: 'pages', label: 'Specific Pages' },
    { type: 'ranges', value: 'ranges', label: 'Page Ranges' },
    { type: 'every', value: 'every', label: 'Every N Pages' },
    { type: 'size', value: 'size', label: 'Fixed Size Chunks' }
  ];

  const handleFileSelection = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "File exceeds 100MB limit",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    // Get page count from PDF
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/pdf/info', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error getting PDF info:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateInput = () => {
    if (!pageInput.trim()) {
      toast({
        title: "Input required",
        description: "Please specify pages or ranges to extract",
        variant: "destructive",
      });
      return false;
    }

    if (splitOption.type === 'pages') {
      const pages = pageInput.split(',').map(p => p.trim());
      for (const page of pages) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1 || (totalPages && pageNum > totalPages)) {
          toast({
            title: "Invalid page number",
            description: `Page ${page} is not valid. Pages must be between 1 and ${totalPages || 'N/A'}`,
            variant: "destructive",
          });
          return false;
        }
      }
    } else if (splitOption.type === 'ranges') {
      const ranges = pageInput.split(',').map(r => r.trim());
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(p => parseInt(p.trim()));
          if (isNaN(start) || isNaN(end) || start < 1 || end < start || (totalPages && end > totalPages)) {
            toast({
              title: "Invalid range",
              description: `Range ${range} is not valid`,
              variant: "destructive",
            });
            return false;
          }
        } else {
          const pageNum = parseInt(range);
          if (isNaN(pageNum) || pageNum < 1 || (totalPages && pageNum > totalPages)) {
            toast({
              title: "Invalid page number",
              description: `Page ${range} is not valid`,
              variant: "destructive",
            });
            return false;
          }
        }
      }
    } else if (splitOption.type === 'every') {
      const every = parseInt(pageInput);
      if (isNaN(every) || every < 1) {
        toast({
          title: "Invalid number",
          description: "Please enter a valid number of pages",
          variant: "destructive",
        });
        return false;
      }
    } else if (splitOption.type === 'size') {
      const size = parseInt(pageInput);
      if (isNaN(size) || size < 1) {
        toast({
          title: "Invalid size",
          description: "Please enter a valid chunk size",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const splitPDF = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!validateInput()) return;

    setIsProcessing(true);
    setProgress(0);
    setSplitResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('splitType', splitOption.type);
      formData.append('splitValue', pageInput);

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to split PDF: ${response.statusText}`);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);

      // Convert base64 results to blob URLs
      const results = data.files.map((fileData: any) => ({
        name: fileData.name,
        url: `data:application/pdf;base64,${fileData.data}`,
        pages: fileData.pages
      }));

      setSplitResults(results);

      toast({
        title: "Success!",
        description: `Successfully split PDF into ${results.length} files`,
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to split PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (fileData: { name: string; url: string; pages: string }) => {
    const link = document.createElement("a");
    link.href = fileData.url;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    splitResults.forEach((fileData, index) => {
      setTimeout(() => downloadFile(fileData), index * 100);
    });
  };

  const resetTool = () => {
    setFile(null);
    setTotalPages(null);
    setPageInput('');
    setSplitResults([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInputPlaceholder = () => {
    switch (splitOption.type) {
      case 'pages':
        return "e.g., 1,3,5,7";
      case 'ranges':
        return "e.g., 1-5,10-15,20";
      case 'every':
        return "e.g., 2 (split every 2 pages)";
      case 'size':
        return "e.g., 5 (5 pages per file)";
      default:
        return "";
    }
  };

  const getInputHelp = () => {
    switch (splitOption.type) {
      case 'pages':
        return "Enter specific page numbers separated by commas";
      case 'ranges':
        return "Enter page ranges (e.g., 1-5) or individual pages, separated by commas";
      case 'every':
        return "Split the PDF every N pages into separate files";
      case 'size':
        return "Create files with a fixed number of pages each";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            {t("pdfSplitter.title") || "تقسيم PDF"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("pdfSplitter.subtitle") || "استخراج صفحات أو نطاقات محددة من مستندات PDF"}
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
            <h3 className="text-lg font-medium mb-2">{t("pdfSplitter.uploadFile") || "رفع ملف PDF"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("pdfSplitter.dragDrop") || "اسحب وأسقط ملف PDF هنا، أو انقر للتصفح"}
            </p>
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              {t("pdfSplitter.chooseFile") || "اختر ملف"}
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {totalPages && (
                      <span>{totalPages} {t("pdfSplitter.pages") || "صفحات"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Split Options */}
          {file && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Split Options</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {splitOptions.map((option) => (
                  <Button
                    key={option.type}
                    variant={splitOption.type === option.type ? "default" : "outline"}
                    onClick={() => setSplitOption(option)}
                    className="text-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {splitOption.label} Input
                </label>
                <Input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder={getInputPlaceholder()}
                />
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{getInputHelp()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Splitting PDF...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={splitPDF}
              disabled={!file || !pageInput.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (t("pdfSplitter.splitting") || "جارٍ التقسيم...") : (t("pdfSplitter.split") || "تقسيم PDF")}
            </Button>
            
            {file && (
              <Button variant="outline" onClick={resetTool}>
                Reset
              </Button>
            )}
          </div>

          {/* Results */}
          {splitResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Split Results ({splitResults.length} files)</h3>
                <Button onClick={downloadAll} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>

              <div className="space-y-2">
                {splitResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20"
                  >
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        {result.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Pages: {result.pages}
                      </p>
                    </div>
                    <Button
                      onClick={() => downloadFile(result)}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
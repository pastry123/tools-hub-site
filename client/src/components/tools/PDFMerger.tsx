import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileUp, Download, X, Move3D, FileText, AlertCircle } from "lucide-react";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
}

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState("merged-document.pdf");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: PDFFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (file.type !== "application/pdf") {
        toast({
          title: t("pdfMerger.invalidFileType"),
          description: `${file.name} ${t("pdfMerger.notPdfFile")}`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: t("pdfMerger.fileTooLarge"),
          description: `${file.name} ${t("pdfMerger.exceedsLimit")}`,
          variant: "destructive",
        });
        continue;
      }

      const pdfFile: PDFFile = {
        id: Date.now() + Math.random().toString(),
        file,
        name: file.name,
        size: file.size,
      };

      newFiles.push(pdfFile);
    }

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: t("pdfMerger.insufficientFiles"),
        description: t("pdfMerger.selectAtLeastTwo"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      
      files.forEach((pdfFile, index) => {
        formData.append(`files`, pdfFile.file);
        formData.append(`order`, index.toString());
      });
      
      formData.append("outputName", outputFileName);

      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to merge PDFs: ${response.statusText}`);
      }

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const blob = await response.blob();
      clearInterval(progressInterval);
      setProgress(100);

      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);

      toast({
        title: t("pdfMerger.success"),
        description: t("pdfMerger.successMerged").replace("{count}", files.length.toString()),
      });
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast({
        title: t("pdfMerger.error"),
        description: error instanceof Error ? error.message : t("pdfMerger.failedToMerge"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMergedPDF = () => {
    if (mergedPdfUrl) {
      const link = document.createElement("a");
      link.href = mergedPdfUrl;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setFiles([]);
    setMergedPdfUrl(null);
    setProgress(0);
    setOutputFileName("merged-document.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("pdfMerger.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("pdfMerger.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelection(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("pdfMerger.uploadPdfFiles")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("pdfMerger.dragDropOrClick")}
            </p>
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              {t("pdfMerger.chooseFiles")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelection(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Output Filename */}
          {files.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("pdfMerger.outputFilename")}</label>
              <Input
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="merged-document.pdf"
              />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
                <Badge variant="outline">
                  Total: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                </Badge>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2 cursor-move">
                      <Move3D className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < files.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {files.length < 2 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{t("pdfMerger.addAtLeast2Files")}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("pdfMerger.merging")}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={mergePDFs}
              disabled={files.length < 2 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? t("pdfMerger.merging") || "Merging..." : t("pdfMerger.mergePdfs")}
            </Button>
            
            {files.length > 0 && (
              <Button variant="outline" onClick={resetTool}>
                {t("pdfMerger.reset")}
              </Button>
            )}
          </div>

          {/* Download Result */}
          {mergedPdfUrl && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    {t("pdfMerger.success")}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {t("pdfMerger.readyForDownload") || "Your merged PDF is ready for download"}
                  </p>
                </div>
                <Button onClick={downloadMergedPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("pdfMerger.download")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Download, Type, FileText, Palette, Move } from "lucide-react";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: string;
  rotation: number;
  style: string;
}

export default function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: "CONFIDENTIAL",
    fontSize: 50,
    opacity: 30,
    color: "#808080",
    position: "center",
    rotation: 45,
    style: "overlay"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const positions = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "top-center", label: "Top Center" },
    { value: "bottom-center", label: "Bottom Center" }
  ];

  const colors = [
    { value: "#000000", label: "Black", preview: "bg-black" },
    { value: "#808080", label: "Gray", preview: "bg-gray-500" },
    { value: "#FF0000", label: "Red", preview: "bg-red-500" },
    { value: "#0000FF", label: "Blue", preview: "bg-blue-500" },
    { value: "#008000", label: "Green", preview: "bg-green-500" },
    { value: "#800080", label: "Purple", preview: "bg-purple-500" }
  ];

  const styles = [
    { value: "overlay", label: "Overlay" },
    { value: "behind", label: "Behind Text" },
    { value: "stamp", label: "Stamp Style" }
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

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "File exceeds 100MB limit",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setWatermarkedPdfUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const addWatermark = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!watermarkSettings.text.trim()) {
      toast({
        title: "No watermark text",
        description: "Please enter watermark text",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('watermarkText', watermarkSettings.text);
      formData.append('fontSize', watermarkSettings.fontSize.toString());
      formData.append('opacity', (watermarkSettings.opacity / 100).toString());
      formData.append('color', watermarkSettings.color);
      formData.append('position', watermarkSettings.position);
      formData.append('rotation', watermarkSettings.rotation.toString());
      formData.append('style', watermarkSettings.style);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 300);

      const response = await fetch('/api/pdf/watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to add watermark: ${response.statusText}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setWatermarkedPdfUrl(url);

      toast({
        title: "Success!",
        description: "Watermark added to PDF successfully",
      });
    } catch (error) {
      console.error("Error adding watermark:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add watermark",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadWatermarkedPDF = () => {
    if (watermarkedPdfUrl && file) {
      const link = document.createElement("a");
      link.href = watermarkedPdfUrl;
      link.download = `watermarked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setFile(null);
    setWatermarkedPdfUrl(null);
    setProgress(0);
    setWatermarkSettings({
      text: "CONFIDENTIAL",
      fontSize: 50,
      opacity: 30,
      color: "#808080",
      position: "center",
      rotation: 45,
      style: "overlay"
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            PDF Watermark
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add text watermarks to PDF documents with customizable styling and positioning.
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
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Watermark Settings */}
          {file && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Watermark Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Watermark Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Watermark Text</label>
                  <Input
                    value={watermarkSettings.text}
                    onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter watermark text"
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Select
                    value={watermarkSettings.position}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          <div className="flex items-center gap-2">
                            <Move className="w-4 h-4" />
                            {pos.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Select
                    value={watermarkSettings.color}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.preview}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select
                    value={watermarkSettings.style}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Font Size</label>
                    <span className="text-sm text-muted-foreground">{watermarkSettings.fontSize}px</span>
                  </div>
                  <Slider
                    value={[watermarkSettings.fontSize]}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, fontSize: value[0] }))}
                    max={100}
                    min={20}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Opacity</label>
                    <span className="text-sm text-muted-foreground">{watermarkSettings.opacity}%</span>
                  </div>
                  <Slider
                    value={[watermarkSettings.opacity]}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, opacity: value[0] }))}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Rotation</label>
                    <span className="text-sm text-muted-foreground">{watermarkSettings.rotation}°</span>
                  </div>
                  <Slider
                    value={[watermarkSettings.rotation]}
                    onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, rotation: value[0] }))}
                    max={360}
                    min={0}
                    step={15}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h4 className="text-sm font-medium mb-3">Preview</h4>
                <div className="relative h-32 bg-white dark:bg-gray-700 rounded border flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      fontSize: `${Math.max(watermarkSettings.fontSize / 3, 12)}px`,
                      opacity: watermarkSettings.opacity / 100,
                      color: watermarkSettings.color,
                      transform: `rotate(${watermarkSettings.rotation}deg)`,
                      fontWeight: watermarkSettings.style === 'stamp' ? 'bold' : 'normal'
                    }}
                  >
                    {watermarkSettings.text}
                  </div>
                  <div className="text-xs text-gray-400 absolute bottom-2 right-2">
                    Document Preview
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adding watermark...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={addWatermark}
              disabled={!file || !watermarkSettings.text.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Adding Watermark..." : "Add Watermark"}
            </Button>
            
            {file && (
              <Button variant="outline" onClick={resetTool}>
                Reset
              </Button>
            )}
          </div>

          {/* Download Result */}
          {watermarkedPdfUrl && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Watermark Added Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your watermarked PDF is ready for download
                  </p>
                </div>
                <Button onClick={downloadWatermarkedPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
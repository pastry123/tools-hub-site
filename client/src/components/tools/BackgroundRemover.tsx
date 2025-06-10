import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Eraser, Sparkles, Info } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface RemovalOptions {
  size: string;
  type: string;
  format: string;
  crop: boolean;
  add_shadow: boolean;
  bg_color?: string;
}

interface RemovalResult {
  success: boolean;
  image: string;
  credits_charged?: number;
  credits_remaining?: number;
  error?: string;
}

interface AccountInfo {
  success: boolean;
  credits?: number;
  error?: string;
}

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [options, setOptions] = useState<RemovalOptions>({
    size: "auto",
    type: "auto", 
    format: "png",
    crop: false,
    add_shadow: false,
    bg_color: ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Query account info
  const { data: accountInfo } = useQuery<AccountInfo>({
    queryKey: ['/api/remove-bg/account'],
    refetchOnWindowFocus: false
  });

  // Background removal mutation
  const removeBackgroundMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: RemovalOptions }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('size', options.size);
      formData.append('type', options.type);
      formData.append('format', options.format);
      formData.append('crop', options.crop.toString());
      formData.append('add_shadow', options.add_shadow.toString());
      if (options.bg_color) formData.append('bg_color', options.bg_color);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove background');
      }

      return response.json() as Promise<RemovalResult>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResultUrl(`data:image/png;base64,${data.image}`);
        toast({
          title: "Background Removed Successfully",
          description: `Credits remaining: ${data.credits_remaining || 'Unknown'}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove background",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResultUrl("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveBackground = () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    removeBackgroundMutation.mutate({ file: selectedFile, options });
  };

  const downloadResult = () => {
    if (!resultUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${selectedFile.name.split('.')[0]}_no_bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResultUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eraser className="w-5 h-5" />
              AI Background Removal
            </CardTitle>
            <CardDescription>
              Upload an image and remove its background automatically using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Info */}
            {accountInfo?.success && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Credits remaining: {accountInfo.credits || 'Unknown'}
                </span>
              </div>
            )}

            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {selectedFile ? selectedFile.name : "Drop your image here"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse (max 10MB)
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Output Size</Label>
                <Select value={options.size} onValueChange={(value) => setOptions({...options, size: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="preview">Preview (0.25MP)</SelectItem>
                    <SelectItem value="regular">Regular (4MP)</SelectItem>
                    <SelectItem value="medium">Medium (10MP)</SelectItem>
                    <SelectItem value="hd">HD (25MP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Subject Type</Label>
                <Select value={options.type} onValueChange={(value) => setOptions({...options, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={options.format} onValueChange={(value) => setOptions({...options, format: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Transparent)</SelectItem>
                    <SelectItem value="jpg">JPG (White background)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bg_color">Background Color (optional)</Label>
                <Input
                  id="bg_color"
                  type="text"
                  placeholder="e.g., #ffffff or red"
                  value={options.bg_color}
                  onChange={(e) => setOptions({...options, bg_color: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="crop"
                  checked={options.crop}
                  onCheckedChange={(checked) => setOptions({...options, crop: checked})}
                />
                <Label htmlFor="crop">Auto Crop</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="add_shadow"
                  checked={options.add_shadow}
                  onCheckedChange={(checked) => setOptions({...options, add_shadow: checked})}
                />
                <Label htmlFor="add_shadow">Add Shadow</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleRemoveBackground}
                disabled={!selectedFile || removeBackgroundMutation.isPending}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {removeBackgroundMutation.isPending ? "Processing..." : "Remove Background"}
              </Button>
              <Button onClick={resetTool} variant="outline">
                Reset
              </Button>
            </div>

            {removeBackgroundMutation.isPending && (
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-center text-gray-600">
                  AI is processing your image...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={previewUrl}
                alt="Original"
                className="w-full h-auto rounded-lg border"
              />
            </CardContent>
          </Card>
        )}

        {resultUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Result
                <Button onClick={downloadResult} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='10' height='10' fill='%23cccccc'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23cccccc'/%3e%3c/svg%3e")`,
                  }}
                />
                <img
                  src={resultUrl}
                  alt="Result"
                  className="relative w-full h-auto rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FileText, Scissors, Merge, RotateCw, Shield, 
  Image, Type, Palette, Download, Trash2, Plus, X,
  Settings, Layers, Grid, MousePointer, Move, Copy,
  Save, RefreshCw, Archive, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  preview?: string;
  operations: PDFOperation[];
}

interface PDFOperation {
  id: string;
  type: 'rotate' | 'crop' | 'watermark' | 'compress' | 'split' | 'merge' | 'password' | 'extract-pages';
  params: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface BatchJob {
  id: string;
  files: PDFFile[];
  operations: PDFOperation[];
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: { file: PDFFile; output: Blob }[];
}

export default function PDFEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Operation parameters
  const [rotationAngle, setRotationAngle] = useState(90);
  const [compressionLevel, setCompressionLevel] = useState(50);
  const [watermarkText, setWatermarkText] = useState("");
  const [password, setPassword] = useState("");
  const [splitType, setSplitType] = useState("pages");
  const [splitValue, setSplitValue] = useState("1");

  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    const pdfFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== uploadedFiles.length) {
      toast({
        title: "Warning",
        description: "Only PDF files are supported",
        variant: "destructive",
      });
    }

    const newFiles: PDFFile[] = await Promise.all(
      pdfFiles.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append('pdf', file);
          
          const response = await fetch('/api/pdf/info', {
            method: 'POST',
            body: formData,
          });
          
          const info = await response.json();
          
          return {
            id: `file-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            pages: info.pages || 1,
            operations: []
          };
        } catch (error) {
          return {
            id: `file-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            pages: 1,
            operations: []
          };
        }
      })
    );

    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Success",
      description: `Added ${newFiles.length} PDF files`,
    });
  };

  const addOperation = (type: string) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files first",
        variant: "destructive",
      });
      return;
    }

    const operation: PDFOperation = {
      id: `op-${Date.now()}`,
      type: type as any,
      params: getOperationParams(type),
      status: 'pending'
    };

    setFiles(prev => prev.map(file => 
      selectedFiles.includes(file.id) 
        ? { ...file, operations: [...file.operations, operation] }
        : file
    ));

    toast({
      title: "Operation Added",
      description: `${type} operation queued for ${selectedFiles.length} files`,
    });
  };

  const getOperationParams = (type: string) => {
    switch (type) {
      case 'rotate':
        return { angle: rotationAngle };
      case 'compress':
        return { level: compressionLevel };
      case 'watermark':
        return { text: watermarkText };
      case 'password':
        return { password };
      case 'split':
        return { type: splitType, value: splitValue };
      default:
        return {};
    }
  };

  const processBatch = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "No files to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const batchJob: BatchJob = {
      id: `batch-${Date.now()}`,
      files: files.filter(f => f.operations.length > 0),
      operations: [],
      progress: 0,
      status: 'processing'
    };

    setBatchJobs(prev => [...prev, batchJob]);

    try {
      const results = [];
      const totalFiles = batchJob.files.length;

      for (let i = 0; i < batchJob.files.length; i++) {
        const file = batchJob.files[i];
        setProgress((i / totalFiles) * 100);

        const formData = new FormData();
        formData.append('pdf', file.file);
        formData.append('operations', JSON.stringify(file.operations));

        const response = await fetch('/api/pdf/batch-process', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          results.push({ file, output: blob });
        } else {
          throw new Error(`Failed to process ${file.name}`);
        }
      }

      batchJob.results = results;
      batchJob.status = 'completed';
      batchJob.progress = 100;
      setProgress(100);

      toast({
        title: "Batch Processing Complete",
        description: `Successfully processed ${results.length} files`,
      });

    } catch (error) {
      batchJob.status = 'failed';
      toast({
        title: "Batch Processing Failed",
        description: "Some files could not be processed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = (batchJob: BatchJob) => {
    if (!batchJob.results) return;

    batchJob.results.forEach(({ file, output }) => {
      const url = URL.createObjectURL(output);
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    setSelectedFiles(files.map(f => f.id));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced PDF Editor</h1>
        <p className="text-gray-600">Comprehensive PDF editing with batch processing capabilities</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop PDF files here or click to browse</p>
              <p className="text-sm text-gray-500">Supports multiple file selection and batch processing</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Loaded Files ({files.length})
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFiles}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="rounded"
                    />
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.pages} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.operations.length > 0 && (
                      <Badge variant="secondary">
                        {file.operations.length} operations
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            PDF Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rotate Pages</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[rotationAngle]}
                      onValueChange={(value) => setRotationAngle(value[0])}
                      max={360}
                      min={0}
                      step={90}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{rotationAngle}°</span>
                  </div>
                  <Button 
                    onClick={() => addOperation('rotate')} 
                    size="sm" 
                    className="w-full"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Add Rotation
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Compress PDF</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[compressionLevel]}
                      onValueChange={(value) => setCompressionLevel(value[0])}
                      max={100}
                      min={10}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{compressionLevel}%</span>
                  </div>
                  <Button 
                    onClick={() => addOperation('compress')} 
                    size="sm" 
                    className="w-full"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Add Compression
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Watermark</label>
                  <Input
                    placeholder="Watermark text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                  <Button 
                    onClick={() => addOperation('watermark')} 
                    size="sm" 
                    className="w-full"
                    disabled={!watermarkText.trim()}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Add Watermark
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Split PDF</label>
                  <Select value={splitType} onValueChange={setSplitType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pages">Split by Pages</SelectItem>
                      <SelectItem value="size">Split by Size</SelectItem>
                      <SelectItem value="range">Page Range</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value (e.g., 5 or 1-5)"
                    value={splitValue}
                    onChange={(e) => setSplitValue(e.target.value)}
                  />
                  <Button 
                    onClick={() => addOperation('split')} 
                    size="sm" 
                    className="w-full"
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Add Split
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Extract Pages</label>
                  <Input
                    placeholder="Page range (e.g., 1-3,5,7-10)"
                    value={splitValue}
                    onChange={(e) => setSplitValue(e.target.value)}
                  />
                  <Button 
                    onClick={() => addOperation('extract-pages')} 
                    size="sm" 
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Extract Pages
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Protection</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button 
                  onClick={() => addOperation('password')} 
                  size="sm" 
                  className="w-full"
                  disabled={!password.trim()}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Add Password Protection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Batch Processing</h3>
                  <p className="text-sm text-gray-500">
                    Process all selected files with queued operations
                  </p>
                </div>
                <Button 
                  onClick={processBatch}
                  disabled={isProcessing || files.filter(f => f.operations.length > 0).length === 0}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Process Batch
                    </>
                  )}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing files...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Batch Jobs History */}
      {batchJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Batch Jobs History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batchJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      job.status === 'completed' ? 'bg-green-500' :
                      job.status === 'failed' ? 'bg-red-500' :
                      job.status === 'processing' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        Batch Job #{job.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.files.length} files • {job.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && job.results && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResults(job)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    )}
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(90);
  const [pageIndices, setPageIndices] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl(null);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive"
      });
    }
  };

  const handleRotate = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('rotation', rotation.toString());
      
      if (pageIndices.trim()) {
        formData.append('pageIndices', pageIndices);
      }

      const response = await fetch('/api/pdf/rotate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to rotate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast({
        title: "Success",
        description: "PDF rotated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rotate PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `rotated_${file?.name || 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="w-5 h-5" />
            Rotate PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file">PDF File</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only</p>
                </div>
                <input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rotation">Rotation Angle</Label>
              <Select value={rotation.toString()} onValueChange={(value) => setRotation(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90° Clockwise</SelectItem>
                  <SelectItem value="180">180° (Upside Down)</SelectItem>
                  <SelectItem value="270">270° (90° Counter-clockwise)</SelectItem>
                  <SelectItem value="-90">90° Counter-clockwise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pageIndices">Page Numbers (optional)</Label>
              <Input
                id="pageIndices"
                value={pageIndices}
                onChange={(e) => setPageIndices(e.target.value)}
                placeholder="e.g., 1,3,5 or leave empty for all pages"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated page numbers. Leave empty to rotate all pages.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleRotate} 
            disabled={!file || isProcessing} 
            className="w-full"
          >
            {isProcessing ? 'Rotating PDF...' : 'Rotate PDF'}
          </Button>

          {downloadUrl && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    PDF Rotated Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your rotated PDF is ready for download.
                  </p>
                </div>
                <Button onClick={handleDownload} className="ml-4">
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
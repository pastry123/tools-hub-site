import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Droplets, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
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

  const handleAddWatermark = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    if (!watermarkText.trim()) {
      toast({
        title: "Error",
        description: "Please enter watermark text",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('watermarkText', watermarkText);

      const response = await fetch('/api/pdf/watermark', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add watermark to PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast({
        title: "Success",
        description: "Watermark added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add watermark to PDF",
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
      a.download = `watermarked_${file?.name || 'document.pdf'}`;
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
            <Droplets className="w-5 h-5" />
            Add Watermark to PDF
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

          <div>
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text (e.g., CONFIDENTIAL, DRAFT, Company Name)"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The watermark will be applied diagonally across each page
            </p>
          </div>

          <Button 
            onClick={handleAddWatermark} 
            disabled={!file || !watermarkText.trim() || isProcessing} 
            className="w-full"
          >
            {isProcessing ? 'Adding Watermark...' : 'Add Watermark'}
          </Button>

          {downloadUrl && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Watermark Added Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your watermarked PDF is ready for download.
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
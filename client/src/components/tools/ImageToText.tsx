import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Upload, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setExtractedText('');
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive"
      });
    }
  };

  const handleExtractText = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/image/ocr', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from image');
      }

      const data = await response.json();
      setExtractedText(data.text);

      toast({
        title: "Success",
        description: "Text extracted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract text from image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${file?.name?.split('.')[0] || 'image'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Text file downloaded successfully"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Image to Text (OCR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file">Image File</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF, WEBP</p>
                </div>
                <input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
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

          {previewUrl && (
            <div>
              <Label>Image Preview</Label>
              <div className="mt-2 border rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full max-w-md mx-auto block max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleExtractText} 
            disabled={!file || isProcessing} 
            className="w-full"
          >
            {isProcessing ? 'Extracting Text...' : 'Extract Text from Image'}
          </Button>

          {extractedText && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Extracted Text</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadText}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={extractedText}
                  readOnly
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Extracted text will appear here..."
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Note:</strong> OCR accuracy depends on image quality, text clarity, and font readability. 
                  For best results, use high-resolution images with clear, well-lit text.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
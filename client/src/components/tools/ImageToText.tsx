import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
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
        throw new Error('Failed to extract text');
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Image to Text (OCR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
            {file && (
              <p className="text-sm text-gray-500 mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          <Button onClick={handleExtract} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Extracting Text...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Extract Text from Image
              </>
            )}
          </Button>

          {extractedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Extracted Text</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[200px] bg-gray-50 dark:bg-gray-900"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
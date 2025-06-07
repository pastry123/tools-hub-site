import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
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
      formData.append('format', format);

      const response = await fetch('/api/image/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to convert image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Image converted to ${format.toUpperCase()} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Image Converter
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
                Selected: {file.name} ({file.type})
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="format">Convert to Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Converting...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Convert Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
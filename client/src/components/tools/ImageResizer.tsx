import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('png');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleResize = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive"
      });
      return;
    }

    if (!width && !height) {
      toast({
        title: "Error", 
        description: "Please specify at least width or height",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (width) formData.append('width', width);
      if (height) formData.append('height', height);
      formData.append('format', format);
      formData.append('maintainAspectRatio', maintainAspectRatio.toString());

      const response = await fetch('/api/image/resize', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to resize image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Image resized successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resize image",
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
            <Upload className="w-5 h-5" />
            Image Resizer
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (pixels)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 800"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (pixels)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 600"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="format">Output Format</Label>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onCheckedChange={(checked) => setMaintainAspectRatio(checked === true)}
            />
            <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
          </div>

          <Button onClick={handleResize} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Resize Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
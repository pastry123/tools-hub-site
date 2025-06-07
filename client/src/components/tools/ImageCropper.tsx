import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crop, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCrop = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive"
      });
      return;
    }

    if (!width || !height) {
      toast({
        title: "Error",
        description: "Please specify crop width and height",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('x', x);
      formData.append('y', y);
      formData.append('width', width);
      formData.append('height', height);
      formData.append('format', format);

      const response = await fetch('/api/image/crop', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to crop image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Image cropped successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to crop image",
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
            <Crop className="w-5 h-5" />
            Image Cropper
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
              <Label htmlFor="x">X Position</Label>
              <Input
                id="x"
                type="number"
                value={x}
                onChange={(e) => setX(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="y">Y Position</Label>
              <Input
                id="y"
                type="number"
                value={y}
                onChange={(e) => setY(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Crop Width</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="400"
              />
            </div>
            <div>
              <Label htmlFor="height">Crop Height</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="300"
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

          <Button onClick={handleCrop} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Crop Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
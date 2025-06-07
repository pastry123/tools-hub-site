import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [sizes, setSizes] = useState([16, 32, 48, 64, 128, 256]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSizeToggle = (size: number, checked: boolean) => {
    if (checked) {
      setSizes(prev => [...prev, size].sort((a, b) => a - b));
    } else {
      setSizes(prev => prev.filter(s => s !== size));
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive"
      });
      return;
    }

    if (sizes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one favicon size",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('backgroundColor', backgroundColor);

      const response = await fetch('/api/image/favicon', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to generate favicon');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Favicon generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate favicon",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const commonSizes = [16, 32, 48, 64, 128, 256];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Favicon Generator
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

          <div>
            <Label htmlFor="background-color">Background Color (optional)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="background-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Favicon Sizes (px)</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {commonSizes.map(size => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={sizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeToggle(size, checked === true)}
                  />
                  <Label htmlFor={`size-${size}`}>{size}x{size}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Generating...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Favicon
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
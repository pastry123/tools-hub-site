import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

interface ColorPalette {
  dominant: string;
  colors: ColorInfo[];
}

export default function ColorPaletteExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [colorCount, setColorCount] = useState('5');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
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
      formData.append('colorCount', colorCount);

      const response = await fetch('/api/image/palette', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to extract color palette');
      }

      const data = await response.json();
      setPalette(data);

      toast({
        title: "Success",
        description: "Color palette extracted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract color palette",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied",
      description: `Color ${color} copied to clipboard`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Palette Extractor
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
            <Label htmlFor="color-count">Number of Colors</Label>
            <Input
              id="color-count"
              type="number"
              value={colorCount}
              onChange={(e) => setColorCount(e.target.value)}
              placeholder="5"
              min="1"
              max="20"
              className="mt-2"
            />
          </div>

          <Button onClick={handleExtract} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Extracting...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Extract Color Palette
              </>
            )}
          </Button>

          {palette && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Dominant Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <div 
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: palette.dominant }}
                    onClick={() => copyColor(palette.dominant)}
                  />
                  <div>
                    <p className="font-mono text-sm">{palette.dominant}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyColor(palette.dominant)}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Color Palette</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {palette.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex)}
                      />
                      <div className="flex-1">
                        <p className="font-mono text-sm">{color.hex}</p>
                        <p className="text-xs text-gray-500">
                          RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b}) • {color.percentage}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyColor(color.hex)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
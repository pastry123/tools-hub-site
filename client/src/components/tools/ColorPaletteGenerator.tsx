import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Upload, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

export default function ColorPaletteGenerator() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = async () => {
    if (!image) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('colorCount', '5');

    try {
      const response = await fetch('/api/image/color-palette', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPalette(result.colors || []);
        toast({
          title: "Success",
          description: "Color palette extracted successfully!",
        });
      } else {
        throw new Error('Failed to extract colors');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract color palette from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied",
      description: `Color ${color} copied to clipboard`,
    });
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Palette Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
              Upload Image
            </label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-64 object-contain rounded-lg border"
                />
              </div>
              
              <Button 
                onClick={extractColors} 
                disabled={isProcessing || !image}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? "Extracting Colors..." : "Extract Color Palette"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {palette.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palette.map((color, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div 
                    className="w-full h-20 rounded-lg border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">HEX</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyColor(color.hex)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {color.hex}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">RGB</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyColor(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {color.percentage.toFixed(1)}% of image
                    </div>
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
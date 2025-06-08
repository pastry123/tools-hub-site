import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageWatermark() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [position, setPosition] = useState<string>("bottom-right");
  const [opacity, setOpacity] = useState([70]);
  const [fontSize, setFontSize] = useState([24]);
  const [color, setColor] = useState("#ffffff");
  const [processedImage, setProcessedImage] = useState<string>("");
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

  const addWatermark = async () => {
    if (!image) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', watermarkText);
    formData.append('position', position);
    formData.append('opacity', (opacity[0] / 100).toString());
    formData.append('fontSize', fontSize[0].toString());
    formData.append('color', color);

    try {
      const response = await fetch('/api/image/watermark', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
        toast({
          title: "Success",
          description: "Watermark added successfully!",
        });
      } else {
        throw new Error('Failed to add watermark');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add watermark to image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const a = document.createElement('a');
      a.href = processedImage;
      a.download = `watermarked_${image?.name || 'image.jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Image Watermark
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Watermark Text</label>
                  <Textarea
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text..."
                    className="min-h-20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Opacity: {opacity[0]}%
                  </label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Size: {fontSize[0]}px
                  </label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={72}
                    min={12}
                    step={2}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>

              <Button 
                onClick={addWatermark} 
                disabled={isProcessing || !image || !watermarkText}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? "Adding Watermark..." : "Add Watermark"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {processedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Watermarked Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <img
                src={processedImage}
                alt="Watermarked"
                className="max-w-full rounded-lg border"
              />
            </div>
            <Button onClick={downloadImage} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Watermarked Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
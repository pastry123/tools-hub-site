import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Droplets, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AddWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [position, setPosition] = useState('bottom-right');
  const [opacity, setOpacity] = useState([70]);
  const [fontSize, setFontSize] = useState('24');
  const [color, setColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setWatermarkedPreview('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAddWatermark = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
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
      formData.append('image', file);
      formData.append('text', text);
      formData.append('position', position);
      formData.append('opacity', (opacity[0] / 100).toString());
      formData.append('fontSize', fontSize);
      formData.append('color', color);

      const response = await fetch('/api/image/watermark', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add watermark');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Set preview
      setWatermarkedPreview(url);
      
      // Also trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Watermark added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add watermark",
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
            <Droplets className="w-5 h-5" />
            Add Watermark
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
            <Label htmlFor="watermark-text">Watermark Text</Label>
            <Input
              id="watermark-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter watermark text..."
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
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
            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                placeholder="24"
                min="8"
                max="72"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="opacity">Opacity ({opacity[0]}%)</Label>
            <Slider
              id="opacity"
              value={opacity}
              onValueChange={setOpacity}
              min={10}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="color">Text Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <Button onClick={handleAddWatermark} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Add Watermark
              </>
            )}
          </Button>

          {/* Image Previews */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Image */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Original Image</Label>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img 
                      src={imagePreview} 
                      alt="Original" 
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                </div>

                {/* Watermarked Preview */}
                {watermarkedPreview && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Watermarked Result</Label>
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img 
                        src={watermarkedPreview} 
                        alt="Watermarked" 
                        className="w-full h-48 object-contain rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
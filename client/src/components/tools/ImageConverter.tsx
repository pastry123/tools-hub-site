import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const imageFormats = [
  { value: 'png', label: 'PNG', description: 'Lossless compression, supports transparency' },
  { value: 'jpeg', label: 'JPEG', description: 'Lossy compression, smaller file size' },
  { value: 'webp', label: 'WebP', description: 'Modern format, excellent compression' },
  { value: 'bmp', label: 'BMP', description: 'Uncompressed bitmap format' },
  { value: 'tiff', label: 'TIFF', description: 'High quality, lossless format' },
  { value: 'gif', label: 'GIF', description: 'Supports animation, limited colors' },
  { value: 'ico', label: 'ICO', description: 'Icon format for Windows' },
  { value: 'svg', label: 'SVG', description: 'Vector format (for compatible inputs)' },
  { value: 'avif', label: 'AVIF', description: 'Next-gen format, excellent compression' },
  { value: 'heic', label: 'HEIC', description: 'High efficiency format' }
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: t("imageConverter.error"),
        description: t("imageConverter.selectImageFirst"),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('format', format);
      formData.append('quality', quality[0].toString());

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
        title: t("imageConverter.success"),
        description: t("imageConverter.convertedSuccessfully", { format: format.toUpperCase() })
      });
    } catch (error) {
      toast({
        title: t("imageConverter.error"),
        description: t("imageConverter.failedToConvert"),
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-3">
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
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label htmlFor="format">Convert to Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageFormats.map(fmt => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{fmt.label}</span>
                        <span className="text-xs text-gray-500">{fmt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality Control for lossy formats */}
          {(format === 'jpeg' || format === 'webp' || format === 'avif') && (
            <div className="space-y-3">
              <Label>Quality: {quality[0]}%</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Higher quality = larger file size, lower quality = smaller file size
              </p>
            </div>
          )}

          {/* Image Preview */}
          {preview && (
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-w-full max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          <Button onClick={handleConvert} disabled={isProcessing || !file} className="w-full">
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Converting to {format.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Convert to {format.toUpperCase()}
              </>
            )}
          </Button>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Supported input formats:</strong> PNG, JPEG, WebP, BMP, TIFF, GIF</p>
            <p><strong>Output formats:</strong> {imageFormats.length} formats including modern AVIF and HEIC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
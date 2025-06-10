import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

interface ColorAnalysis {
  dominant: string;
  colors: ExtractedColor[];
}

export default function ColorAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analysis, setAnalysis] = useState<ColorAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalysis(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const analyzeColors = async () => {
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

      const response = await fetch('/api/analyze-colors', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze colors');
      }

      const data = await response.json();
      setAnalysis(data);

      toast({
        title: "Success",
        description: `Found ${data.colors.length} distinct colors`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze image colors",
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
      description: `${color} copied to clipboard`
    });
  };

  const exportPalette = () => {
    if (!analysis) return;
    
    const paletteData = {
      image: file?.name,
      dominant: analysis.dominant,
      colors: analysis.colors,
      extracted: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t("colorAnalyzer.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="image-upload">{t("colorAnalyzer.uploadImage")}</Label>
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

          {imagePreview && (
            <div className="text-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-64 object-contain mx-auto rounded-lg border"
              />
            </div>
          )}

          <Button onClick={analyzeColors} disabled={isProcessing || !file} className="w-full">
            {isProcessing ? (
              t("colorAnalyzer.processing")
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t("colorAnalyzer.analyzeColors")}
              </>
            )}
          </Button>

          {analysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t("colorAnalyzer.colorAnalysis")} ({analysis.colors.length} {t("colorAnalyzer.colorsFound")})
                </h3>
                <Button onClick={exportPalette} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t("colorAnalyzer.export")}
                </Button>
              </div>

              <div>
                <Label className="text-base font-medium">Dominant Color</Label>
                <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div 
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: analysis.dominant }}
                    onClick={() => copyColor(analysis.dominant)}
                  />
                  <div className="flex-1">
                    <p className="font-mono text-lg">{analysis.dominant}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyColor(analysis.dominant)}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">All Colors</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 max-h-96 overflow-y-auto">
                  {analysis.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color.hex)}
                      />
                      <div className="flex-1 min-w-0">
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
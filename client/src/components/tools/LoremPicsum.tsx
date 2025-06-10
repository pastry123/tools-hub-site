import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Image, Copy, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoremPicsum() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState(false);
  const [specificId, setSpecificId] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    setIsProcessing(true);

    try {
      let url = `https://picsum.photos/${width}/${height}`;
      
      if (specificId) {
        url = `https://picsum.photos/seed/${specificId}/${width}/${height}`;
      }
      
      const params = [];
      if (blur) params.push('blur=2');
      if (grayscale) params.push('grayscale');
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      setResult(url);

      toast({
        title: "Success",
        description: "Lorem Picsum URL generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Lorem Picsum URL",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = `lorem-picsum-${width}x${height}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded",
      description: "Image download started"
    });
  };

  const generateRandom = () => {
    setSpecificId('');
    handleGenerate();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Lorem Picsum Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 400)}
                min={50}
                max={5000}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 300)}
                min={50}
                max={5000}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specificId">Specific Image ID (optional)</Label>
            <Input
              id="specificId"
              value={specificId}
              onChange={(e) => setSpecificId(e.target.value)}
              placeholder="e.g., 1, 237, 1025 (leave empty for random)"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Use a specific ID to get the same image consistently
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="grayscale"
                checked={grayscale}
                onCheckedChange={(checked) => setGrayscale(checked === true)}
              />
              <Label htmlFor="grayscale">Grayscale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blur"
                checked={blur}
                onCheckedChange={(checked) => setBlur(checked === true)}
              />
              <Label htmlFor="blur">Blur effect</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Generating...' : 'Generate URL'}
            </Button>
            <Button onClick={generateRandom} disabled={isProcessing} variant="outline">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {result && (
            <div className="space-y-4">
              <div>
                <Label>Generated Image</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={result} 
                    alt="Lorem Picsum" 
                    className="w-full max-w-md mx-auto block"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Image URL</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadImage}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm break-all">
                  {result}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                  <Label className="text-sm font-medium">Dimensions</Label>
                  <p className="text-lg font-bold">{width} × {height}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                  <Label className="text-sm font-medium">Style</Label>
                  <p className="text-lg font-bold">
                    {grayscale && blur ? 'Grayscale + Blur' : 
                     grayscale ? 'Grayscale' : 
                     blur ? 'Blurred' : 'Color'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-lg font-bold">Lorem Picsum</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
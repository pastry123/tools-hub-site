import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PlaceholderGenerator() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState('#cccccc');
  const [textColor, setTextColor] = useState('#333333');
  const [text, setText] = useState('');
  const [format, setFormat] = useState('svg');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/generator/placeholder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          width,
          height,
          backgroundColor,
          textColor,
          text: text || `${width}×${height}`,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate placeholder');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "Placeholder generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate placeholder",
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
      description: "Placeholder code copied to clipboard"
    });
  };

  const downloadFile = () => {
    const blob = new Blob([result], { type: format === 'svg' ? 'image/svg+xml' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placeholder-${width}x${height}.${format === 'svg' ? 'svg' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Placeholder file downloaded successfully"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Placeholder Image Generator
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
                max={2000}
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
                max={2000}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#cccccc"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#333333"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="text">Custom Text (optional)</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Default: ${width}×${height}`}
            />
          </div>

          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG Code</SelectItem>
                <SelectItem value="url">Data URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate Placeholder'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Generated Placeholder</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadFile}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              {format === 'svg' && (
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 text-center">
                  <div dangerouslySetInnerHTML={{ __html: result }} />
                </div>
              )}
              
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm overflow-auto max-h-40">
                {result}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
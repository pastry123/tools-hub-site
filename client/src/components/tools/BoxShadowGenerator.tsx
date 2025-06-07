import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Square, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BoxShadowGenerator() {
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(4);
  const [blur, setBlur] = useState(8);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [inset, setInset] = useState(false);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/generator/box-shadow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          horizontal,
          vertical,
          blur,
          spread,
          color,
          inset
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate box shadow');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "Box shadow generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate box shadow",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`box-shadow: ${result};`);
    toast({
      title: "Copied",
      description: "Box shadow CSS copied to clipboard"
    });
  };

  const previewStyle = result ? { boxShadow: result } : {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="w-5 h-5" />
            Box Shadow Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="horizontal">Horizontal Offset: {horizontal}px</Label>
                <Slider
                  value={[horizontal]}
                  onValueChange={(value) => setHorizontal(value[0])}
                  min={-50}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="vertical">Vertical Offset: {vertical}px</Label>
                <Slider
                  value={[vertical]}
                  onValueChange={(value) => setVertical(value[0])}
                  min={-50}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="blur">Blur Radius: {blur}px</Label>
                <Slider
                  value={[blur]}
                  onValueChange={(value) => setBlur(value[0])}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="spread">Spread Radius: {spread}px</Label>
                <Slider
                  value={[spread]}
                  onValueChange={(value) => setSpread(value[0])}
                  min={-20}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="color">Shadow Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inset"
                  checked={inset}
                  onCheckedChange={(checked) => setInset(checked === true)}
                />
                <Label htmlFor="inset">Inset shadow</Label>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-8 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div 
                    className="w-32 h-32 bg-white dark:bg-gray-700 rounded-md"
                    style={previewStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate Box Shadow'}
          </Button>

          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>CSS Code</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm break-all">
                box-shadow: {result};
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
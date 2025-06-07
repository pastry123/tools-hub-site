import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Copy, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CSSGradientGenerator() {
  const [type, setType] = useState('linear');
  const [direction, setDirection] = useState('to right');
  const [colors, setColors] = useState([
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 }
  ]);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/generator/css-gradient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          direction: type === 'linear' ? direction : undefined,
          colors
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate gradient');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "CSS gradient generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate gradient",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addColor = () => {
    setColors([...colors, { color: '#000000', position: 50 }]);
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index: number, field: 'color' | 'position', value: string | number) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied",
      description: "CSS gradient copied to clipboard"
    });
  };

  const previewStyle = result ? { background: result } : {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            CSS Gradient Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="type">Gradient Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear Gradient</SelectItem>
                <SelectItem value="radial">Radial Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'linear' && (
            <div>
              <Label htmlFor="direction">Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to right">To Right</SelectItem>
                  <SelectItem value="to left">To Left</SelectItem>
                  <SelectItem value="to bottom">To Bottom</SelectItem>
                  <SelectItem value="to top">To Top</SelectItem>
                  <SelectItem value="to bottom right">To Bottom Right</SelectItem>
                  <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                  <SelectItem value="to top right">To Top Right</SelectItem>
                  <SelectItem value="to top left">To Top Left</SelectItem>
                  <SelectItem value="45deg">45 degrees</SelectItem>
                  <SelectItem value="90deg">90 degrees</SelectItem>
                  <SelectItem value="135deg">135 degrees</SelectItem>
                  <SelectItem value="180deg">180 degrees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Color Stops</Label>
              <Button variant="outline" size="sm" onClick={addColor}>
                <Plus className="w-4 h-4 mr-2" />
                Add Color
              </Button>
            </div>
            <div className="space-y-3">
              {colors.map((colorStop, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={colorStop.color}
                    onChange={(e) => updateColor(index, 'color', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={colorStop.color}
                    onChange={(e) => updateColor(index, 'color', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={colorStop.position}
                    onChange={(e) => updateColor(index, 'position', parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  {colors.length > 2 && (
                    <Button variant="outline" size="sm" onClick={() => removeColor(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate CSS Gradient'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div>
                <Label>Preview</Label>
                <div 
                  className="w-full h-32 rounded-md border"
                  style={previewStyle}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>CSS Code</Label>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm break-all">
                  background: {result};
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
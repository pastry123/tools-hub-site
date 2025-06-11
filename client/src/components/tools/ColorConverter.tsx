import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

export default function ColorConverter() {
  const [input, setInput] = useState('');
  const [fromFormat, setFromFormat] = useState('hex');
  const [result, setResult] = useState<ColorResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleConvert = async () => {
    if (!input.trim()) {
      toast({
        title: t("colorConverter.error"),
        description: t("colorConverter.enterColorValue"),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/converter/color', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: input.trim(),
          fromFormat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to convert color');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Success",
        description: "Color converted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert color. Please check your input format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${format} value copied to clipboard`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="input">Input Color</Label>
              <Input
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., #ff0000 or rgb(255,0,0)"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="format">Input Format</Label>
              <Select value={fromFormat} onValueChange={setFromFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hex">HEX (#ff0000)</SelectItem>
                  <SelectItem value="rgb">RGB (255,0,0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Converting...' : 'Convert Color'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div 
                    className="w-full h-16 rounded-lg border-2 border-gray-300 mb-2"
                    style={{ backgroundColor: result.hex }}
                  />
                  <Label>Color Preview</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="font-semibold">HEX</Label>
                      <p className="font-mono text-sm">{result.hex}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.hex, 'HEX')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="font-semibold">RGB</Label>
                      <p className="font-mono text-sm">rgb({result.rgb.r}, {result.rgb.g}, {result.rgb.b})</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`, 'RGB')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="font-semibold">HSL</Label>
                      <p className="font-mono text-sm">hsl({result.hsl.h}, {result.hsl.s}%, {result.hsl.l}%)</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`, 'HSL')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <Label className="font-semibold">HSV</Label>
                      <p className="font-mono text-sm">hsv({result.hsv.h}, {result.hsv.s}%, {result.hsv.v}%)</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`hsv(${result.hsv.h}, ${result.hsv.s}%, ${result.hsv.v}%)`, 'HSV')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
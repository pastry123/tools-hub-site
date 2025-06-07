import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileJson, Copy, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFormat = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter JSON to format",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/converter/json-format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonString: input,
          indent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to format JSON');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: data.result.valid ? "JSON formatted successfully" : "JSON has errors but was processed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format JSON",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "JSON copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            JSON Formatter & Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input">JSON Input</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "example", "data": [1,2,3]}'
              rows={8}
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="indent">Indentation Spaces</Label>
            <Input
              id="indent"
              type="number"
              value={indent}
              onChange={(e) => setIndent(parseInt(e.target.value) || 2)}
              min={1}
              max={8}
              className="w-24"
            />
          </div>

          <Button onClick={handleFormat} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Formatting...' : 'Format & Validate JSON'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {result.valid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>Valid JSON</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span>Invalid JSON</span>
                  </div>
                )}
              </div>

              {result.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <Label className="text-red-700 dark:text-red-300">Error</Label>
                  <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Formatted JSON</Label>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.formatted)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={result.formatted}
                  readOnly
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
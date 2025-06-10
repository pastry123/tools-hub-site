import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCode, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JSMinifier() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleMinify = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter JavaScript to minify",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const original = input;
      const originalSize = original.length;
      
      // JavaScript minification
      const minified = original
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*=\s*/g, '=')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*-\s*/g, '-')
        .trim();

      const minifiedSize = minified.length;
      const savings = originalSize - minifiedSize;
      const compressionRatio = originalSize > 0 ? (savings / originalSize) * 100 : 0;

      setResult({
        original,
        minified,
        originalSize,
        minifiedSize,
        savings: compressionRatio,
        compressionRatio: originalSize > 0 ? originalSize / minifiedSize : 1
      });

      toast({
        title: "Success",
        description: `JavaScript minified - ${compressionRatio.toFixed(1)}% size reduction`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to minify JavaScript",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.minified);
    toast({
      title: "Copied",
      description: "Minified JavaScript copied to clipboard"
    });
  };

  const downloadFile = () => {
    const blob = new Blob([result.minified], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minified-script.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Minified JavaScript file downloaded successfully"
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            JavaScript Minifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input">JavaScript Code</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="// Your JavaScript code here&#10;function greetUser(name) {&#10;  const message = 'Hello, ' + name + '!';&#10;  console.log(message);&#10;  return message;&#10;}&#10;&#10;greetUser('World');"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={handleMinify} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Minifying...' : 'Minify JavaScript'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                  <Label className="text-sm font-medium">Original Size</Label>
                  <p className="text-lg font-bold">{formatBytes(result.originalSize)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                  <Label className="text-sm font-medium">Minified Size</Label>
                  <p className="text-lg font-bold">{formatBytes(result.minifiedSize)}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
                  <Label className="text-sm font-medium">Size Saved</Label>
                  <p className="text-lg font-bold text-green-600">{result.savings.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
                  <Label className="text-sm font-medium">Compression</Label>
                  <p className="text-lg font-bold text-blue-600">{result.compressionRatio.toFixed(1)}:1</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Minified JavaScript</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadFile}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={result.minified}
                  readOnly
                  rows={8}
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
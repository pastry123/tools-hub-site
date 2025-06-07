import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MarkdownToHTML() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter Markdown content",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/converter/markdown-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markdown: input })
      });

      if (!response.ok) {
        throw new Error('Failed to convert Markdown');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "Markdown converted to HTML successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert Markdown",
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
      description: "HTML copied to clipboard"
    });
  };

  const downloadHTML = () => {
    const blob = new Blob([result], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-content.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "HTML file downloaded successfully"
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Markdown to HTML Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input">Markdown Input</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# Heading&#10;&#10;This is **bold** text and this is *italic* text.&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link](https://example.com)"
              rows={10}
              className="font-mono"
            />
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Converting...' : 'Convert to HTML'}
          </Button>

          {result && (
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  HTML Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label>HTML Output</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadHTML}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={result}
                  readOnly
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="preview" className="space-y-4 mt-6">
                <Label>Live Preview</Label>
                <div 
                  className="p-4 border rounded-md bg-white dark:bg-gray-900 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
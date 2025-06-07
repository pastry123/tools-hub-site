import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Code, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CodeFormatter() {
  const [inputCode, setInputCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [indent, setIndent] = useState('2');
  const [outputCode, setOutputCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFormat = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to format",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/format-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: inputCode,
          language,
          indent: parseInt(indent)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to format code');
      }

      const data = await response.json();
      setOutputCode(data.result);

      toast({
        title: "Success",
        description: "Code formatted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format code",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Code Formatter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input-code">Input Code</Label>
            <Textarea
              id="input-code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your code here..."
              className="mt-2 min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="indent">Indent Size</Label>
              <Input
                id="indent"
                type="number"
                value={indent}
                onChange={(e) => setIndent(e.target.value)}
                min="1"
                max="8"
              />
            </div>
          </div>

          <Button onClick={handleFormat} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Formatting...' : 'Format Code'}
          </Button>

          {outputCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Formatted Code</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={outputCode}
                readOnly
                className="min-h-[200px] bg-gray-50 dark:bg-gray-900 font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
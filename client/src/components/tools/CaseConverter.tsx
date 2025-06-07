import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CaseConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [caseType, setCaseType] = useState('uppercase');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/case-convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          type: caseType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to convert case');
      }

      const data = await response.json();
      setOutputText(data.result);

      toast({
        title: "Success",
        description: "Text case converted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert text case",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Case Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input-text">Input Text</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="case-type">Conversion Type</Label>
            <Select value={caseType} onValueChange={setCaseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uppercase">UPPERCASE</SelectItem>
                <SelectItem value="lowercase">lowercase</SelectItem>
                <SelectItem value="title">Title Case</SelectItem>
                <SelectItem value="sentence">Sentence case</SelectItem>
                <SelectItem value="camel">camelCase</SelectItem>
                <SelectItem value="pascal">PascalCase</SelectItem>
                <SelectItem value="snake">snake_case</SelectItem>
                <SelectItem value="kebab">kebab-case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Converting...' : 'Convert Case'}
          </Button>

          {outputText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Output Text</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[120px] bg-gray-50 dark:bg-gray-900"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
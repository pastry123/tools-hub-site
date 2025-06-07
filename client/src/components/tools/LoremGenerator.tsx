import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoremGenerator() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState('3');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!count || parseInt(count) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid count",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/lorem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          count: parseInt(count),
          startWithLorem
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate lorem ipsum');
      }

      const data = await response.json();
      setOutputText(data.result);

      toast({
        title: "Success",
        description: "Lorem ipsum generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate lorem ipsum",
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
            <FileText className="w-5 h-5" />
            Lorem Ipsum Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="3"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="start-lorem"
              checked={startWithLorem}
              onCheckedChange={(checked) => setStartWithLorem(checked === true)}
            />
            <Label htmlFor="start-lorem">Start with "Lorem ipsum"</Label>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate Lorem Ipsum'}
          </Button>

          {outputText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Text</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] bg-gray-50 dark:bg-gray-900"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
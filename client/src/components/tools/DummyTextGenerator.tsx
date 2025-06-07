import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DummyTextGenerator() {
  const [paragraphs, setParagraphs] = useState('3');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!paragraphs || parseInt(paragraphs) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of paragraphs",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/dummy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paragraphs: parseInt(paragraphs)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate dummy text');
      }

      const data = await response.json();
      setOutputText(data.result);

      toast({
        title: "Success",
        description: "Dummy text generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate dummy text",
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
            Dummy Text Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="paragraphs">Number of Paragraphs</Label>
            <Input
              id="paragraphs"
              type="number"
              value={paragraphs}
              onChange={(e) => setParagraphs(e.target.value)}
              placeholder="3"
              min="1"
              max="20"
              className="mt-2"
            />
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate Dummy Text'}
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
                className="min-h-[300px] bg-gray-50 dark:bg-gray-900"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
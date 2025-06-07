import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCcw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TextReverser() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleReverse = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to reverse",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/reverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to reverse text');
      }

      const data = await response.json();
      setOutputText(data.result);

      toast({
        title: "Success",
        description: "Text reversed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reverse text",
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
            <RotateCcw className="w-5 h-5" />
            Text Reverser
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

          <Button onClick={handleReverse} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Reversing...' : 'Reverse Text'}
          </Button>

          {outputText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Reversed Text</Label>
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
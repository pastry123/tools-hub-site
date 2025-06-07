import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HashGenerator() {
  const [inputText, setInputText] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [outputHash, setOutputHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to hash",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/text/hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          algorithm
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate hash');
      }

      const data = await response.json();
      setOutputHash(data.result);

      toast({
        title: "Success",
        description: `${algorithm.toUpperCase()} hash generated successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hash",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputHash);
    toast({
      title: "Copied",
      description: "Hash copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hash Generator
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
            <Label htmlFor="algorithm">Hash Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md5">MD5</SelectItem>
                <SelectItem value="sha1">SHA1</SelectItem>
                <SelectItem value="sha256">SHA256</SelectItem>
                <SelectItem value="sha512">SHA512</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : `Generate ${algorithm.toUpperCase()} Hash`}
          </Button>

          {outputHash && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{algorithm.toUpperCase()} Hash</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={outputHash}
                readOnly
                className="min-h-[80px] bg-gray-50 dark:bg-gray-900 font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [fromFormat, setFromFormat] = useState('unix');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a timestamp",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/converter/timestamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: fromFormat === 'unix' ? parseInt(input) : input,
          fromFormat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to convert timestamp');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "Timestamp converted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert timestamp",
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
      description: "Value copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timestamp Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="fromFormat">Input Format</Label>
            <Select value={fromFormat} onValueChange={setFromFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unix">Unix Timestamp</SelectItem>
                <SelectItem value="iso">ISO String</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="input">
              {fromFormat === 'unix' ? 'Unix Timestamp' : 'ISO Date String'}
            </Label>
            <Input
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={fromFormat === 'unix' ? '1640995200' : '2022-01-01T00:00:00.000Z'}
            />
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Converting...' : 'Convert Timestamp'}
          </Button>

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Converted Results</h3>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">Unix Timestamp</Label>
                    <p className="font-mono">{result.unix}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.unix.toString())}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">ISO String</Label>
                    <p className="font-mono">{result.iso}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.iso)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">UTC String</Label>
                    <p className="font-mono">{result.utc}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.utc)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">Local Time</Label>
                    <p className="font-mono">{result.local}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.local)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div>
                    <Label className="text-sm font-medium">Formatted</Label>
                    <p className="font-mono">{result.formatted}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.formatted)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
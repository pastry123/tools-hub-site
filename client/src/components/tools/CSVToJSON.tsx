import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CSVToJSON() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/converter/csv-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvString: input })
      });

      if (!response.ok) {
        throw new Error('Failed to convert CSV');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: `Converted ${data.result.length} rows to JSON`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert CSV to JSON",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast({
      title: "Copied",
      description: "JSON copied to clipboard"
    });
  };

  const downloadJSON = () => {
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "JSON file downloaded successfully"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            CSV to JSON Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input">CSV Data</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="name,age,city&#10;John,25,New York&#10;Jane,30,San Francisco"
              rows={8}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter CSV data with headers in the first row
            </p>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Converting...' : 'Convert CSV to JSON'}
          </Button>

          {result.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>JSON Result ({result.length} records)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={JSON.stringify(result, null, 2)}
                readOnly
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
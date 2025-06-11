import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UUIDGenerator() {
  const [version, setVersion] = useState('v4');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/generator/uuid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version,
          uppercase,
          hyphens
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate UUID');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: t("uuidGenerator.success"),
        description: t("uuidGenerator.generatedSuccessfully")
      });
    } catch (error) {
      toast({
        title: t("uuidGenerator.error"),
        description: t("uuidGenerator.failedToGenerate"),
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
      description: "UUID copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            UUID Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="version">UUID Version</Label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1 (Timestamp-based)</SelectItem>
                <SelectItem value="v4">Version 4 (Random)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={uppercase}
                onCheckedChange={(checked) => setUppercase(checked === true)}
              />
              <Label htmlFor="uppercase">Uppercase</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hyphens"
                checked={hyphens}
                onCheckedChange={(checked) => setHyphens(checked === true)}
              />
              <Label htmlFor="hyphens">Include hyphens</Label>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate UUID'}
          </Button>

          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated UUID</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm break-all">
                {result}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
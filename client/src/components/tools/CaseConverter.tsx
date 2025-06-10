import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CaseConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [caseType, setCaseType] = useState('uppercase');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
            {t("caseConverter.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input-text">{t("caseConverter.inputText")}</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("caseConverter.enterText")}
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="case-type">{t("caseConverter.conversionType")}</Label>
            <Select value={caseType} onValueChange={setCaseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uppercase">{t("caseConverter.uppercase")}</SelectItem>
                <SelectItem value="lowercase">{t("caseConverter.lowercase")}</SelectItem>
                <SelectItem value="title">{t("caseConverter.titleCase")}</SelectItem>
                <SelectItem value="sentence">{t("caseConverter.sentenceCase")}</SelectItem>
                <SelectItem value="camel">{t("caseConverter.camelCase")}</SelectItem>
                <SelectItem value="pascal">{t("caseConverter.pascalCase")}</SelectItem>
                <SelectItem value="snake">{t("caseConverter.snakeCase")}</SelectItem>
                <SelectItem value="kebab">{t("caseConverter.kebabCase")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? t("caseConverter.converting") : t("caseConverter.convertCase")}
          </Button>

          {outputText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t("caseConverter.outputText")}</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t("caseConverter.copy")}
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
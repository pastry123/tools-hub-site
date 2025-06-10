import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TextToSlug() {
  const [inputText, setInputText] = useState('');
  const [separator, setSeparator] = useState('-');
  const [maxLength, setMaxLength] = useState('');
  const [lowercase, setLowercase] = useState(true);
  const [removeDiacritics, setRemoveDiacritics] = useState(true);
  const [outputSlug, setOutputSlug] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGenerate = async () => {
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
      const response = await fetch('/api/text/slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          separator,
          maxLength: maxLength ? parseInt(maxLength) : undefined,
          lowercase,
          removeDiacritics
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate slug');
      }

      const data = await response.json();
      setOutputSlug(data.result);

      toast({
        title: "Success",
        description: "Slug generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate slug",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputSlug);
    toast({
      title: "Copied",
      description: "Slug copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            {t("textSlug.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input-text">{t("textSlug.inputText")}</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("textSlug.enterText")}
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="separator">{t("textSlug.separator")}</Label>
              <Input
                id="separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                placeholder="-"
                maxLength={1}
              />
            </div>
            <div>
              <Label htmlFor="max-length">{t("textSlug.maxLength")}</Label>
              <Input
                id="max-length"
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                placeholder="50"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={lowercase}
                onCheckedChange={(checked) => setLowercase(checked === true)}
              />
              <Label htmlFor="lowercase">{t("textSlug.convertLowercase")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remove-diacritics"
                checked={removeDiacritics}
                onCheckedChange={(checked) => setRemoveDiacritics(checked === true)}
              />
              <Label htmlFor="remove-diacritics">{t("textSlug.removeDiacritics")}</Label>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : t("textSlug.generateSlug")}
          </Button>

          {outputSlug && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t("textSlug.generatedSlug")}</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm">
                {outputSlug}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
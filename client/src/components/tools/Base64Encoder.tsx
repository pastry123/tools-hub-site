import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Base64Encoder() {
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeResult, setEncodeResult] = useState('');
  const [decodeResult, setDecodeResult] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEncode = async () => {
    if (!encodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encode",
        variant: "destructive"
      });
      return;
    }

    setIsEncoding(true);

    try {
      const response = await fetch('/api/converter/base64/encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: encodeInput })
      });

      if (!response.ok) {
        throw new Error('Failed to encode');
      }

      const data = await response.json();
      setEncodeResult(data.result);

      toast({
        title: "Success",
        description: "Text encoded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode text",
        variant: "destructive"
      });
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDecode = async () => {
    if (!decodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter Base64 to decode",
        variant: "destructive"
      });
      return;
    }

    setIsDecoding(true);

    try {
      const response = await fetch('/api/converter/base64/decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base64: decodeInput })
      });

      if (!response.ok) {
        throw new Error('Failed to decode');
      }

      const data = await response.json();
      setDecodeResult(data.result);

      toast({
        title: "Success",
        description: "Base64 decoded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode Base64",
        variant: "destructive"
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
            <Lock className="w-5 h-5" />
            Base64 Encoder/Decoder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Encode
              </TabsTrigger>
              <TabsTrigger value="decode" className="flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                Decode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="encodeInput">Text to Encode</Label>
                <Textarea
                  id="encodeInput"
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  placeholder="Enter your text here..."
                  rows={4}
                />
              </div>

              <Button onClick={handleEncode} disabled={isEncoding} className="w-full">
                {isEncoding ? 'Encoding...' : 'Encode to Base64'}
              </Button>

              {encodeResult && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Base64 Result</Label>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(encodeResult)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={encodeResult}
                    readOnly
                    rows={4}
                    className="font-mono"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="decode" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="decodeInput">Base64 to Decode</Label>
                <Textarea
                  id="decodeInput"
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  placeholder="Enter Base64 encoded text..."
                  rows={4}
                />
              </div>

              <Button onClick={handleDecode} disabled={isDecoding} className="w-full">
                {isDecoding ? 'Decoding...' : 'Decode from Base64'}
              </Button>

              {decodeResult && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Decoded Text</Label>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(decodeResult)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={decodeResult}
                    readOnly
                    rows={4}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
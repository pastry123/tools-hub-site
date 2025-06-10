import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HTMLEncoder() {
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeResult, setEncodeResult] = useState('');
  const [decodeResult, setDecodeResult] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const { toast } = useToast();

  const handleEncode = () => {
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
      const encoded = encodeInput
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      setEncodeResult(encoded);

      toast({
        title: "Success",
        description: "HTML encoded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode HTML",
        variant: "destructive"
      });
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDecode = () => {
    if (!decodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter HTML to decode",
        variant: "destructive"
      });
      return;
    }

    setIsDecoding(true);

    try {
      const decoded = decodeInput
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');

      setDecodeResult(decoded);

      toast({
        title: "Success",
        description: "HTML decoded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode HTML",
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
            <Code className="w-5 h-5" />
            HTML Encoder/Decoder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="encodeInput">Text to Encode</Label>
                <Textarea
                  id="encodeInput"
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  placeholder="<div>Hello & welcome to our site!</div>"
                  rows={6}
                />
              </div>

              <Button onClick={handleEncode} disabled={isEncoding} className="w-full">
                {isEncoding ? 'Encoding...' : 'Encode HTML Entities'}
              </Button>

              {encodeResult && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Encoded Result</Label>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(encodeResult)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={encodeResult}
                    readOnly
                    rows={6}
                    className="font-mono"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="decode" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="decodeInput">HTML to Decode</Label>
                <Textarea
                  id="decodeInput"
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  placeholder="&lt;div&gt;Hello &amp; welcome to our site!&lt;/div&gt;"
                  rows={6}
                />
              </div>

              <Button onClick={handleDecode} disabled={isDecoding} className="w-full">
                {isDecoding ? 'Decoding...' : 'Decode HTML Entities'}
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
                    rows={6}
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
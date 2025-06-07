import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Copy, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JWTDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDecode = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JWT token",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/developer/jwt-decode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: input })
      });

      if (!response.ok) {
        throw new Error('Failed to decode JWT');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: data.result.valid ? "JWT decoded successfully" : "JWT decoded with warnings"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode JWT",
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
      description: "Data copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            JWT Decoder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="input">JWT Token</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={handleDecode} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Decoding...' : 'Decode JWT'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {result.valid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>Valid JWT Structure</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span>Invalid JWT</span>
                  </div>
                )}
                
                {result.expired && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Token Expired</span>
                  </div>
                )}
              </div>

              {result.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <Label className="text-red-700 dark:text-red-300">Error</Label>
                  <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                </div>
              )}

              {result.valid && (
                <Tabs defaultValue="header" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="signature">Signature</TabsTrigger>
                  </TabsList>

                  <TabsContent value="header" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label>JWT Header</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(JSON.stringify(result.header, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={JSON.stringify(result.header, null, 2)}
                      readOnly
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </TabsContent>

                  <TabsContent value="payload" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label>JWT Payload</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(JSON.stringify(result.payload, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={JSON.stringify(result.payload, null, 2)}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                    
                    {result.payload && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {result.payload.exp && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                            <Label className="text-sm font-medium">Expires At</Label>
                            <p className="text-sm">{new Date(result.payload.exp * 1000).toLocaleString()}</p>
                          </div>
                        )}
                        {result.payload.iat && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                            <Label className="text-sm font-medium">Issued At</Label>
                            <p className="text-sm">{new Date(result.payload.iat * 1000).toLocaleString()}</p>
                          </div>
                        )}
                        {result.payload.nbf && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                            <Label className="text-sm font-medium">Not Before</Label>
                            <p className="text-sm">{new Date(result.payload.nbf * 1000).toLocaleString()}</p>
                          </div>
                        )}
                        {result.payload.iss && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                            <Label className="text-sm font-medium">Issuer</Label>
                            <p className="text-sm">{result.payload.iss}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="signature" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label>JWT Signature</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(result.signature)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm break-all">
                      {result.signature}
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        <strong>Note:</strong> Signature verification requires the secret key and is not performed in this client-side decoder.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
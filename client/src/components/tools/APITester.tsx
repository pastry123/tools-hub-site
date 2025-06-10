import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Copy, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function APITester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const headersObj = headers.reduce((acc: Record<string, string>, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});

      const startTime = Date.now();
      
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'User-Agent': 'ToolHub-API-Tester/1.0',
          ...headersObj
        },
        mode: 'cors'
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.body = body;
        if (!headersObj['Content-Type'] && !headersObj['content-type']) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            'Content-Type': 'application/json'
          };
        }
      }

      const response = await fetch(url, fetchOptions);
      const responseTime = Date.now() - startTime;
      
      let responseData;
      const contentType = response.headers.get('content-type') || '';
      
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else if (contentType.includes('text/')) {
          responseData = await response.text();
        } else {
          responseData = `[Binary data - ${contentType}]`;
        }
      } catch (parseError) {
        responseData = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        responseTime
      };

      setResult(result);

      toast({
        title: "Success",
        description: `API tested - ${result.status} ${result.statusText}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let userFriendlyMessage = "Failed to test API";
      
      if (errorMessage.includes('CORS')) {
        userFriendlyMessage = "CORS error - API doesn't allow browser requests";
      } else if (errorMessage.includes('Failed to fetch')) {
        userFriendlyMessage = "Network error - check URL and connection";
      } else if (errorMessage.includes('net::ERR_')) {
        userFriendlyMessage = "Network blocked - check URL or try a public API";
      }

      const result = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        responseTime: 0,
        error: errorMessage
      };

      setResult(result);

      toast({
        title: "Error",
        description: userFriendlyMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Response copied to clipboard"
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Headers</Label>
              <Button variant="outline" size="sm" onClick={addHeader}>
                <Plus className="w-4 h-4 mr-2" />
                Add Header
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Header Name"
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Header Value"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => removeHeader(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <Label htmlFor="body">Request Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="JSON, XML, or any request body content..."
                rows={6}
                className="font-mono"
              />
            </div>
          )}

          <Button onClick={handleTest} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Testing...' : 'Send Request'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Label className="text-sm font-medium">Status</Label>
                  <p className={`text-lg font-bold ${getStatusColor(result.status)}`}>
                    {result.status} {result.statusText}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Label className="text-sm font-medium">Response Time</Label>
                  <p className="text-lg font-bold">{result.responseTime}ms</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Label className="text-sm font-medium">Content Type</Label>
                  <p className="text-sm">{result.headers['content-type'] || 'N/A'}</p>
                </div>
              </div>

              {result.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <Label className="text-red-700 dark:text-red-300">Error</Label>
                  <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                </div>
              )}

              <div>
                <Label>Response Headers</Label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md font-mono text-sm max-h-32 overflow-y-auto">
                  {Object.entries(result.headers).map(([key, value]) => (
                    <div key={key} className="break-all">
                      <span className="text-blue-600 dark:text-blue-400">{key}:</span> {value as string}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Response Body</Label>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                  readOnly
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
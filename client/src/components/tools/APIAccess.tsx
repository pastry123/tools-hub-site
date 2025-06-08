import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Code, Key, Terminal, Copy, Eye, EyeOff, Shield, 
  Zap, Globe, Book, Settings, Download, Play,
  Check, X, RefreshCw, AlertCircle, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  usageCount: number;
  lastUsed: Date | null;
  status: 'active' | 'suspended' | 'expired';
}

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  category: string;
  rateLimit: number;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example: string;
}

export default function APIAccess() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 'key-1',
      name: 'Production API',
      key: 'tb_live_sk_1234567890abcdef',
      permissions: ['pdf-tools', 'image-tools', 'text-tools'],
      rateLimit: 1000,
      usageCount: 342,
      lastUsed: new Date('2024-01-15'),
      status: 'active'
    }
  ]);
  
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [testRequest, setTestRequest] = useState<string>('');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const endpoints: APIEndpoint[] = [
    {
      method: 'POST',
      path: '/api/pdf/merge',
      description: 'Merge multiple PDF files into one',
      category: 'PDF Tools',
      rateLimit: 100,
      parameters: [
        { name: 'files', type: 'File[]', required: true, description: 'Array of PDF files to merge' },
        { name: 'order', type: 'string[]', required: false, description: 'Custom order for merging files' }
      ],
      response: 'application/pdf',
      example: `curl -X POST "https://api.toolhub.com/api/pdf/merge" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "files=@document1.pdf" \\
  -F "files=@document2.pdf"`
    },
    {
      method: 'POST',
      path: '/api/image/resize',
      description: 'Resize images to specified dimensions',
      category: 'Image Tools',
      rateLimit: 200,
      parameters: [
        { name: 'image', type: 'File', required: true, description: 'Image file to resize' },
        { name: 'width', type: 'number', required: true, description: 'Target width in pixels' },
        { name: 'height', type: 'number', required: true, description: 'Target height in pixels' },
        { name: 'maintain_aspect', type: 'boolean', required: false, description: 'Maintain aspect ratio' }
      ],
      response: 'image/*',
      example: `curl -X POST "https://api.toolhub.com/api/image/resize" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "width=800" \\
  -F "height=600"`
    },
    {
      method: 'POST',
      path: '/api/qr/generate',
      description: 'Generate QR codes for various data types',
      category: 'Barcode Tools',
      rateLimit: 500,
      parameters: [
        { name: 'data', type: 'string', required: true, description: 'Data to encode in QR code' },
        { name: 'size', type: 'number', required: false, description: 'QR code size (default: 200)' },
        { name: 'format', type: 'string', required: false, description: 'Output format (png, svg, pdf)' }
      ],
      response: 'image/png',
      example: `curl -X POST "https://api.toolhub.com/api/qr/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"data": "https://example.com", "size": 300}'`
    },
    {
      method: 'POST',
      path: '/api/pdf/batch-process',
      description: 'Process multiple PDF operations in batch',
      category: 'PDF Tools',
      rateLimit: 50,
      parameters: [
        { name: 'pdf', type: 'File', required: true, description: 'PDF file to process' },
        { name: 'operations', type: 'object[]', required: true, description: 'Array of operations to perform' }
      ],
      response: 'application/pdf',
      example: `curl -X POST "https://api.toolhub.com/api/pdf/batch-process" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "pdf=@document.pdf" \\
  -F 'operations=[{"type":"rotate","params":{"angle":90}}]'`
    }
  ];

  const generateAPIKey = () => {
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: `API Key ${apiKeys.length + 1}`,
      key: `tb_live_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['pdf-tools'],
      rateLimit: 1000,
      usageCount: 0,
      lastUsed: null,
      status: 'active'
    };

    setApiKeys(prev => [...prev, newKey]);
    toast({
      title: "API Key Generated",
      description: "New API key created successfully",
    });
  };

  const revokeAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, status: 'suspended' as const } : key
    ));
    toast({
      title: "API Key Revoked",
      description: "API key has been suspended",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const testAPIEndpoint = async () => {
    if (!selectedEndpoint || !testRequest) return;

    setIsTestingAPI(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        success: true,
        message: "API call successful",
        data: {
          processed: true,
          fileSize: "1.2MB",
          processingTime: "1.3s"
        }
      };

      setTestResponse(JSON.stringify(mockResponse, null, 2));
      toast({
        title: "API Test Successful",
        description: "The API endpoint responded correctly",
      });
    } catch (error) {
      setTestResponse(`Error: ${error}`);
      toast({
        title: "API Test Failed",
        description: "The API call encountered an error",
        variant: "destructive",
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">API Access & Documentation</h1>
        <p className="text-gray-600">Programmatic access to ToolHub's powerful utility suite</p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Key Management
                </div>
                <Button onClick={generateAPIKey}>
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge variant={
                          apiKey.status === 'active' ? 'default' :
                          apiKey.status === 'suspended' ? 'destructive' : 'secondary'
                        }>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeyValues[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeAPIKey(apiKey.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium">API Key:</label>
                        <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                          {showKeyValues[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                      <div>
                        <label className="font-medium">Permissions:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="font-medium">Usage:</label>
                        <p className="text-gray-600">
                          {apiKey.usageCount.toLocaleString()} / {apiKey.rateLimit.toLocaleString()} requests
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">Last Used:</label>
                        <p className="text-gray-600">
                          {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Available API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {endpoint.path}
                        </code>
                        <Badge variant="secondary">{endpoint.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Zap className="w-4 h-4" />
                        {endpoint.rateLimit}/hour
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{endpoint.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Parameters:</h4>
                        <div className="space-y-1">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center gap-2 text-sm">
                              <code className="bg-gray-100 px-1 rounded">{param.name}</code>
                              <span className="text-gray-500">{param.type}</span>
                              {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              <span className="text-gray-600">- {param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Example:</h4>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <pre>{endpoint.example}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                API Testing Console
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Endpoint</label>
                  <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an endpoint to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {endpoints.map((endpoint, index) => (
                        <SelectItem key={index} value={endpoint.path}>
                          {endpoint.method} {endpoint.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
                <Textarea
                  placeholder="Enter your request payload here..."
                  value={testRequest}
                  onChange={(e) => setTestRequest(e.target.value)}
                  rows={6}
                  className="font-mono"
                />
              </div>

              <Button 
                onClick={testAPIEndpoint}
                disabled={!selectedEndpoint || !testRequest || isTestingAPI}
                className="w-full"
              >
                {isTestingAPI ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing API...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test API Call
                  </>
                )}
              </Button>

              {testResponse && (
                <div>
                  <label className="block text-sm font-medium mb-2">Response</label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{testResponse}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Authentication</h3>
                <p className="text-gray-600 mb-3">
                  All API requests require authentication using your API key. Include it in the Authorization header:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded">
                  <pre>Authorization: Bearer YOUR_API_KEY</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Rate Limiting</h3>
                <p className="text-gray-600 mb-3">
                  API requests are rate-limited per key. Limits vary by endpoint and subscription tier.
                  Rate limit headers are included in responses:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                  <pre>{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Error Handling</h3>
                <p className="text-gray-600 mb-3">
                  The API uses conventional HTTP response codes and returns errors in JSON format:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                  <pre>{`{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameters",
    "details": ["Missing 'data' parameter"]
  }
}`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">SDKs & Libraries</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Code className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">JavaScript/Node.js</h4>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Code className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium">Python</h4>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Code className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-medium">PHP</h4>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
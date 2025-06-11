import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Radio, Smartphone, Wifi, CreditCard, IdCard,
  Key, Shield, AlertCircle, CheckCircle, Copy,
  RefreshCw, Play, Square
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface NFCTag {
  id: string;
  type: string;
  data: string;
  size: number;
  writable: boolean;
  locked: boolean;
  timestamp: Date;
  format: string;
  content?: {
    text?: string;
    url?: string;
    wifi?: { ssid: string; password: string; security: string };
    contact?: { name: string; phone: string; email: string };
  };
}

export default function RFIDReader() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [tags, setTags] = useState<NFCTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<NFCTag | null>(null);
  const [writeData, setWriteData] = useState<string>('');
  const [writeType, setWriteType] = useState<'text' | 'url' | 'wifi' | 'contact'>('text');

  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if Web NFC is supported
    if ('NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startReading = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "NFC is not supported on this device or browser",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReading(true);
      
      // Request permission first
      const permission = await navigator.permissions.query({ name: 'nfc' as any });
      if (permission.state === 'denied') {
        throw new Error('NFC permission denied');
      }

      // Simulate NFC reading for demonstration
      setTimeout(() => {
        const mockTag: NFCTag = {
          id: `tag-${Date.now()}`,
          type: 'NTAG213',
          data: 'https://example.com/product/12345',
          size: 180,
          writable: true,
          locked: false,
          timestamp: new Date(),
          format: 'NDEF',
          content: {
            url: 'https://example.com/product/12345'
          }
        };

        setTags(prev => [mockTag, ...prev]);
        setIsReading(false);

        toast({
          title: "Tag Detected",
          description: "Successfully read NFC tag",
        });
      }, 2000);

    } catch (error) {
      setIsReading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to read NFC tag",
        variant: "destructive",
      });
    }
  };

  const stopReading = () => {
    setIsReading(false);
    toast({
      title: "Stopped",
      description: "NFC reading stopped",
    });
  };

  const writeToTag = async () => {
    if (!selectedTag || !writeData) {
      toast({
        title: "Error",
        description: "Please select a tag and enter data to write",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate writing to NFC tag
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedTag: NFCTag = {
        ...selectedTag,
        data: writeData,
        timestamp: new Date(),
        content: parseWriteData(writeData, writeType)
      };

      setTags(prev => prev.map(tag => 
        tag.id === selectedTag.id ? updatedTag : tag
      ));

      setSelectedTag(updatedTag);
      setWriteData('');

      toast({
        title: "Success",
        description: "Data written to NFC tag successfully",
      });
    } catch (error) {
      toast({
        title: "Write Error",
        description: "Failed to write data to NFC tag",
        variant: "destructive",
      });
    }
  };

  const parseWriteData = (data: string, type: string) => {
    switch (type) {
      case 'url':
        return { url: data };
      case 'wifi':
        try {
          const parts = data.split(';');
          return {
            wifi: {
              ssid: parts[0] || '',
              password: parts[1] || '',
              security: parts[2] || 'WPA'
            }
          };
        } catch {
          return { text: data };
        }
      case 'contact':
        try {
          const parts = data.split(';');
          return {
            contact: {
              name: parts[0] || '',
              phone: parts[1] || '',
              email: parts[2] || ''
            }
          };
        } catch {
          return { text: data };
        }
      default:
        return { text: data };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Tag data copied to clipboard",
    });
  };

  const formatTagContent = (tag: NFCTag) => {
    if (tag.content?.url) {
      return { type: 'URL', value: tag.content.url };
    } else if (tag.content?.wifi) {
      const wifi = tag.content.wifi;
      return { type: 'WiFi', value: `${wifi.ssid} (${wifi.security})` };
    } else if (tag.content?.contact) {
      const contact = tag.content.contact;
      return { type: 'Contact', value: `${contact.name} - ${contact.phone}` };
    } else if (tag.content?.text) {
      return { type: 'Text', value: tag.content.text };
    } else {
      return { type: 'Raw', value: tag.data };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("rfidReader.title")}</h1>
        <p className="text-gray-600">{t("rfidReader.subtitle")}</p>
      </div>

      {!isSupported && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("rfidReader.nfcNotSupported")}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="read" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="read">{t("rfidReader.readTags")}</TabsTrigger>
          <TabsTrigger value="write">{t("rfidReader.writeTags")}</TabsTrigger>
          <TabsTrigger value="history">{t("rfidReader.tagHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                {t("rfidReader.nfcTagScanner")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                    {isReading ? (
                      <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                      <Smartphone className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    {!isReading ? (
                      <Button onClick={startReading} disabled={!isSupported} size="lg">
                        <Play className="w-5 h-5 mr-2" />
                        {t("rfidReader.startReading")}
                      </Button>
                    ) : (
                      <Button onClick={stopReading} variant="destructive" size="lg">
                        <Square className="w-5 h-5 mr-2" />
                        {t("rfidReader.stopReading")}
                      </Button>
                    )}
                  </div>
                  {isReading && (
                    <p className="text-sm text-gray-600 mt-2">
                      {t("rfidReader.holdDeviceNear")}
                    </p>
                  )}
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">{t("rfidReader.recentTags")}</h3>
                  <div className="space-y-2">
                    {tags.slice(0, 3).map((tag) => {
                      const content = formatTagContent(tag);
                      return (
                        <div key={tag.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{tag.type}</Badge>
                              <Badge variant="secondary">{content.type}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(content.value)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{content.value}</p>
                          <p className="text-xs text-gray-500">
                            {tag.timestamp.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="write" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
{t("rfidReader.writeToNfcTag")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tags.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
{t("rfidReader.readTagFirst")}
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("rfidReader.selectTag")}</label>
                    <div className="space-y-2">
                      {tags.filter(tag => tag.writable).map((tag) => (
                        <div 
                          key={tag.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedTag?.id === tag.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTag(tag)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{tag.type}</Badge>
                              <span className="text-sm">{tag.data.substring(0, 50)}...</span>
                            </div>
                            {selectedTag?.id === tag.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t("rfidReader.dataType")}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { value: 'text', label: t("rfidReader.text"), icon: <Key className="w-4 h-4" /> },
                        { value: 'url', label: t("rfidReader.url"), icon: <CreditCard className="w-4 h-4" /> },
                        { value: 'wifi', label: t("rfidReader.wifi"), icon: <Wifi className="w-4 h-4" /> },
                        { value: 'contact', label: t("rfidReader.contact"), icon: <IdCard className="w-4 h-4" /> }
                      ].map(type => (
                        <button
                          key={type.value}
                          onClick={() => setWriteType(type.value as any)}
                          className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                            writeType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.icon}
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("rfidReader.dataToWrite")}
                      {writeType === 'wifi' && <span className="text-xs text-gray-500 ml-2">{t("rfidReader.wifiFormat")}</span>}
                      {writeType === 'contact' && <span className="text-xs text-gray-500 ml-2">{t("rfidReader.contactFormat")}</span>}
                    </label>
                    <textarea
                      value={writeData}
                      onChange={(e) => setWriteData(e.target.value)}
                      placeholder={
                        writeType === 'text' ? t("rfidReader.enterText") :
                        writeType === 'url' ? 'https://example.com' :
                        writeType === 'wifi' ? 'MyNetwork;password123;WPA' :
                        'John Doe;+1234567890;john@example.com'
                      }
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={writeToTag}
                    disabled={!selectedTag || !writeData}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
{t("rfidReader.writeToTag")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("rfidReader.tagHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">{t("rfidReader.noTagsRead")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tags.map((tag) => {
                    const content = formatTagContent(tag);
                    return (
                      <div key={tag.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tag.type}</Badge>
                            <Badge variant="secondary">{content.type}</Badge>
                            <Badge variant={tag.writable ? "default" : "destructive"}>
                              {tag.writable ? "Writable" : "Read-only"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(content.value)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Content:</span>
                            <p className="text-gray-700 mt-1">{content.value}</p>
                          </div>
                          <div>
                            <span className="font-medium">Details:</span>
                            <div className="mt-1 space-y-1 text-gray-600">
                              <p>Size: {tag.size} bytes</p>
                              <p>Format: {tag.format}</p>
                              <p>Read: {tag.timestamp.toLocaleString()}</p>
                              <p>Status: {tag.locked ? 'Locked' : 'Unlocked'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
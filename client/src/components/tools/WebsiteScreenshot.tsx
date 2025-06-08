import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Camera, Globe, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WebsiteScreenshot() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fullPage, setFullPage] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const captureScreenshot = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }

    setIsCapturing(true);
    setScreenshotUrl("");

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: processedUrl,
          format,
          quality,
          width,
          height,
          fullPage
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const screenshotBlobUrl = URL.createObjectURL(blob);
        setScreenshotUrl(screenshotBlobUrl);
        toast({
          title: "Success",
          description: "Screenshot captured successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to capture screenshot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadScreenshot = () => {
    if (screenshotUrl) {
      const a = document.createElement('a');
      a.href = screenshotUrl;
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      a.download = `screenshot-${domain}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const presetSizes = [
    { name: "Desktop (1920x1080)", width: 1920, height: 1080 },
    { name: "Desktop (1366x768)", width: 1366, height: 768 },
    { name: "Tablet (768x1024)", width: 768, height: 1024 },
    { name: "Mobile (375x667)", width: 375, height: 667 },
    { name: "Mobile (414x896)", width: 414, height: 896 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Website Screenshot Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && captureScreenshot()}
                  className="pl-10"
                />
              </div>
              <Button onClick={captureScreenshot} disabled={isCapturing}>
                <Camera className="w-4 h-4 mr-2" />
                {isCapturing ? "Capturing..." : "Capture"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quality (%)</label>
              <Input
                type="number"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value) || 90)}
                min="10"
                max="100"
                disabled={format === 'png'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Screenshot Type</label>
              <Select value={fullPage.toString()} onValueChange={(value) => setFullPage(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Full Page</SelectItem>
                  <SelectItem value="false">Viewport Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Viewport Size</label>
              <Select 
                value={`${width}x${height}`} 
                onValueChange={(value) => {
                  const preset = presetSizes.find(p => `${p.width}x${p.height}` === value);
                  if (preset) {
                    setWidth(preset.width);
                    setHeight(preset.height);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presetSizes.map((preset) => (
                    <SelectItem key={preset.name} value={`${preset.width}x${preset.height}`}>
                      {preset.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Width</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
                  min="320"
                  max="3840"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Height</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 1080)}
                  min="240"
                  max="2160"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isCapturing && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Monitor className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <p className="text-gray-600">Capturing screenshot...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </CardContent>
        </Card>
      )}

      {screenshotUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshot Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={screenshotUrl}
                alt="Website Screenshot"
                className="w-full h-auto max-h-96 object-contain bg-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadScreenshot} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Screenshot
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(screenshotUrl, '_blank')}
              >
                View Full Size
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tips:</strong>
            <br />• Full page captures the entire webpage length
            <br />• Viewport only captures what's visible in the browser window
            <br />• PNG format preserves transparency but creates larger files
            <br />• JPEG is smaller but doesn't support transparency
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Upload, Download, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoToGifConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [gifResult, setGifResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  
  // Conversion options
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [width, setWidth] = useState([320]);
  const [height, setHeight] = useState([240]);
  const [fps, setFps] = useState([10]);
  const [quality, setQuality] = useState('medium');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      setGifResult('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setVideoPreview(url);
      
      // Get video info
      await getVideoInfo(selectedFile);
    }
  };

  const getVideoInfo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch('/api/media/info', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setVideoInfo(data.info);
        
        // Set default duration to video length or 3 seconds, whichever is smaller
        const videoDuration = data.info?.format?.duration ? parseFloat(data.info.format.duration) : 3;
        setDuration(Math.min(videoDuration, 3));
      }
    } catch (error) {
      console.error('Failed to get video info:', error);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('startTime', startTime.toString());
      formData.append('duration', duration.toString());
      formData.append('width', width[0].toString());
      formData.append('height', height[0].toString());
      formData.append('fps', fps[0].toString());
      formData.append('quality', quality);

      const response = await fetch('/api/media/video-to-gif', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert video');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGifResult(url);

      toast({
        title: "Success",
        description: "Video converted to GIF successfully"
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Failed to convert video to GIF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGif = () => {
    if (gifResult) {
      const a = document.createElement('a');
      a.href = gifResult;
      a.download = `converted-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "GIF file downloaded successfully"
      });
    }
  };

  const resetSettings = () => {
    setStartTime(0);
    setDuration(3);
    setWidth([320]);
    setHeight([240]);
    setFps([10]);
    setQuality('medium');
  };

  const updatePreviewTime = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Video to GIF Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="video-upload">Upload Video</Label>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-2"
            />
            {file && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                {videoInfo && (
                  <p>Duration: {parseFloat(videoInfo.format?.duration || 0).toFixed(1)}s | 
                     Resolution: {videoInfo.streams?.[0]?.width}x{videoInfo.streams?.[0]?.height}</p>
                )}
              </div>
            )}
          </div>

          {videoPreview && (
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Conversion Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview & Result</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-6">
                {/* Timing Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time (seconds)</Label>
                    <Input
                      id="start-time"
                      type="number"
                      value={startTime}
                      onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                      min="0"
                      max={videoInfo?.format?.duration || 300}
                      step="0.1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
                      min="0.5"
                      max="30"
                      step="0.5"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Dimension Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Width: {width[0]}px</Label>
                    <Slider
                      value={width}
                      onValueChange={setWidth}
                      min={100}
                      max={800}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Height: {height[0]}px</Label>
                    <Slider
                      value={height}
                      onValueChange={setHeight}
                      min={100}
                      max={600}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Quality Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Frame Rate: {fps[0]} FPS</Label>
                    <Slider
                      value={fps}
                      onValueChange={setFps}
                      min={5}
                      max={30}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Smaller file)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Better quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={updatePreviewTime} variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Preview Start Time
                  </Button>
                  <Button onClick={resetSettings} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Settings
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original Video */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Original Video</Label>
                    <div className="border rounded-lg p-2 bg-muted/20">
                      <video 
                        ref={videoRef}
                        src={videoPreview}
                        controls
                        className="w-full rounded"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>

                  {/* Generated GIF */}
                  {gifResult && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Generated GIF</Label>
                      <div className="border rounded-lg p-2 bg-muted/20">
                        <img 
                          src={gifResult}
                          alt="Generated GIF"
                          className="w-full rounded"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                      <Button onClick={downloadGif} className="w-full mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download GIF
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Convert Button */}
          <Button 
            onClick={handleConvert} 
            disabled={!file || isProcessing} 
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Converting to GIF...
              </>
            ) : (
              <>
                <Film className="w-4 h-4 mr-2" />
                Convert Video to GIF
              </>
            )}
          </Button>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tips:</strong>
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
              <li>• Keep duration short (3-10 seconds) for optimal GIF size</li>
              <li>• Lower frame rates create smaller files</li>
              <li>• Use medium quality for best balance of size and quality</li>
              <li>• Preview your start time before converting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Video, Upload, Download, Settings, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [convertedVideo, setConvertedVideo] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setConvertedVideo('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setVideoPreview(url);
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
      formData.append('outputFormat', outputFormat);
      formData.append('quality', quality[0].toString());

      const response = await fetch('/api/video/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to convert video');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedVideo(url);

      toast({
        title: "Success",
        description: "Video converted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert video. This feature requires server-side video processing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (convertedVideo) {
      const a = document.createElement('a');
      a.href = convertedVideo;
      a.download = `converted.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <p className="text-sm text-gray-500 mt-2">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="output-format">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="avi">AVI</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="gif">GIF (Animation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quality">Quality ({quality[0]}%)</Label>
              <Slider
                id="quality"
                value={quality}
                onValueChange={setQuality}
                min={10}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={handleConvert} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Film className="w-4 h-4 mr-2" />
                Convert Video
              </>
            )}
          </Button>

          {/* Video Previews */}
          {videoPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Video */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Original Video</Label>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <video 
                      src={videoPreview}
                      controls
                      className="w-full h-48 rounded"
                    />
                  </div>
                </div>

                {/* Converted Video */}
                {convertedVideo && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Converted Video</Label>
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <video 
                        src={convertedVideo}
                        controls
                        className="w-full h-48 rounded"
                      />
                    </div>
                    <Button onClick={downloadVideo} className="w-full mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download Converted Video
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Video conversion requires server-side processing with FFmpeg. 
              Currently showing UI interface - full functionality would need additional server setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
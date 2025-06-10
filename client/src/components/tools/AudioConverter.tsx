import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Music, Upload, Download, Settings, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState([128]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [convertedAudio, setConvertedAudio] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setConvertedAudio('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setAudioPreview(url);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('outputFormat', outputFormat);
      formData.append('bitrate', bitrate[0].toString());

      const response = await fetch('/api/audio/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to convert audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedAudio(url);

      toast({
        title: "Success",
        description: "Audio converted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert audio. This feature requires server-side audio processing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (convertedAudio) {
      const a = document.createElement('a');
      a.href = convertedAudio;
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
            <Music className="w-5 h-5" />
            Audio Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="audio-upload">Upload Audio</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
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
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                  <SelectItem value="aac">AAC</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                  <SelectItem value="m4a">M4A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bitrate">Bitrate ({bitrate[0]} kbps)</Label>
              <Slider
                id="bitrate"
                value={bitrate}
                onValueChange={setBitrate}
                min={64}
                max={320}
                step={32}
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
                <Volume2 className="w-4 h-4 mr-2" />
                Convert Audio
              </>
            )}
          </Button>

          {/* Audio Previews */}
          {audioPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Audio */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Original Audio</Label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <audio 
                      src={audioPreview}
                      controls
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Converted Audio */}
                {convertedAudio && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Converted Audio</Label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <audio 
                        src={convertedAudio}
                        controls
                        className="w-full"
                      />
                    </div>
                    <Button onClick={downloadAudio} className="w-full mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download Converted Audio
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Audio conversion requires server-side processing with FFmpeg. 
              Currently showing UI interface - full functionality would need additional server setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
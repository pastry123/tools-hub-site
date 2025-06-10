import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Upload, Download, Settings, Volume2, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [convertedAudio, setConvertedAudio] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioInfo, setAudioInfo] = useState<any>(null);
  
  // Conversion options
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('medium');
  const [customBitrate, setCustomBitrate] = useState('');
  const [sampleRate, setSampleRate] = useState('');
  const [channels, setChannels] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatOptions = [
    { value: 'mp3', label: 'MP3', description: 'Most compatible format' },
    { value: 'wav', label: 'WAV', description: 'Uncompressed, best quality' },
    { value: 'flac', label: 'FLAC', description: 'Lossless compression' },
    { value: 'aac', label: 'AAC', description: 'High quality, used by Apple' },
    { value: 'ogg', label: 'OGG', description: 'Open source, good compression' },
    { value: 'm4a', label: 'M4A', description: 'Apple lossless format' },
    { value: 'wma', label: 'WMA', description: 'Windows Media Audio' },
    { value: 'opus', label: 'OPUS', description: 'Modern, efficient codec' },
    { value: 'ac3', label: 'AC3', description: 'Dolby Digital audio' },
    { value: 'amr', label: 'AMR', description: 'Adaptive Multi-Rate' },
    { value: 'au', label: 'AU', description: 'Sun Microsystems format' },
    { value: 'ra', label: 'RA', description: 'RealAudio format' },
    { value: 'mp2', label: 'MP2', description: 'MPEG-1 Audio Layer II' },
    { value: 'aiff', label: 'AIFF', description: 'Audio Interchange File Format' },
    { value: 'dts', label: 'DTS', description: 'Digital Theater Systems' },
    { value: 'ape', label: 'APE', description: "Monkey's Audio lossless" },
    { value: 'tak', label: 'TAK', description: 'Tom\'s lossless Audio Kompressor' },
    { value: 'tta', label: 'TTA', description: 'True Audio lossless' },
    { value: 'gsm', label: 'GSM', description: 'Global System for Mobile' },
    { value: 'voc', label: 'VOC', description: 'Creative Voice File' }
  ];

  const qualitySettings = {
    low: { bitrate: '128k', description: 'Smaller file size' },
    medium: { bitrate: '192k', description: 'Balanced quality/size' },
    high: { bitrate: '320k', description: 'Best quality' }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file",
          description: "Please select an audio or video file",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      setConvertedAudio('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setAudioPreview(url);
      
      // Get audio info
      await getAudioInfo(selectedFile);
    }
  };

  const getAudioInfo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch('/api/media/info', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAudioInfo(data.info);
        
        // Auto-fill current audio properties
        const audioStream = data.info?.streams?.find((s: any) => s.codec_type === 'audio');
        if (audioStream) {
          setSampleRate(audioStream.sample_rate || '');
          setChannels(audioStream.channels?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Failed to get audio info:', error);
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
      formData.append('format', outputFormat);
      formData.append('quality', quality);
      
      if (customBitrate) {
        formData.append('bitrate', customBitrate);
      }
      if (sampleRate && sampleRate !== 'original') {
        formData.append('sampleRate', sampleRate);
      }
      if (channels && channels !== 'original') {
        formData.append('channels', channels);
      }

      const response = await fetch('/api/media/convert-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedAudio(url);

      toast({
        title: "Success",
        description: `Audio converted to ${outputFormat.toUpperCase()} successfully`
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Failed to convert audio",
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
      a.download = `converted-${Date.now()}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Audio file downloaded successfully"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Audio Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="audio-upload">Upload Audio File</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-2"
            />
            {file && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Selected: {file.name} ({formatFileSize(file.size)})</p>
                {audioInfo && (
                  <div className="mt-1">
                    {audioInfo.format?.duration && (
                      <p>Duration: {formatDuration(parseFloat(audioInfo.format.duration))}</p>
                    )}
                    {audioInfo.streams?.find((s: any) => s.codec_type === 'audio') && (
                      <p>
                        Quality: {audioInfo.streams.find((s: any) => s.codec_type === 'audio').sample_rate}Hz, 
                        {audioInfo.streams.find((s: any) => s.codec_type === 'audio').channels} channels,
                        {audioInfo.streams.find((s: any) => s.codec_type === 'audio').bit_rate && 
                          ` ${Math.round(audioInfo.streams.find((s: any) => s.codec_type === 'audio').bit_rate / 1000)}kbps`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {audioPreview && (
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Conversion Settings</TabsTrigger>
                <TabsTrigger value="preview">Audio Preview & Result</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-6">
                {/* Output Format */}
                <div>
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{format.label}</span>
                            <span className="text-xs text-muted-foreground">{format.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality">Quality Preset</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(qualitySettings).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span className="font-medium capitalize">{key}</span>
                              <span className="text-xs text-muted-foreground">
                                {value.bitrate} - {value.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="custom-bitrate">Custom Bitrate (optional)</Label>
                    <Input
                      id="custom-bitrate"
                      type="text"
                      value={customBitrate}
                      onChange={(e) => setCustomBitrate(e.target.value)}
                      placeholder="e.g., 256k, 1M"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Override quality preset (e.g., 128k, 256k, 320k)
                    </p>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sample-rate">Sample Rate (Hz)</Label>
                    <Select value={sampleRate} onValueChange={setSampleRate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Keep original" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Keep original</SelectItem>
                        <SelectItem value="22050">22,050 Hz</SelectItem>
                        <SelectItem value="44100">44,100 Hz (CD quality)</SelectItem>
                        <SelectItem value="48000">48,000 Hz (DVD quality)</SelectItem>
                        <SelectItem value="96000">96,000 Hz (High-res)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="channels">Channels</Label>
                    <Select value={channels} onValueChange={setChannels}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Keep original" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Keep original</SelectItem>
                        <SelectItem value="1">Mono (1 channel)</SelectItem>
                        <SelectItem value="2">Stereo (2 channels)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Format Information */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Format Information</h4>
                  <div className="text-sm text-muted-foreground">
                    {outputFormat === 'mp3' && (
                      <p>MP3: Universal compatibility, good compression. Best for music and podcasts.</p>
                    )}
                    {outputFormat === 'wav' && (
                      <p>WAV: Uncompressed audio, excellent quality. Large file sizes. Best for professional audio.</p>
                    )}
                    {outputFormat === 'flac' && (
                      <p>FLAC: Lossless compression, preserves original quality. Larger than lossy formats.</p>
                    )}
                    {outputFormat === 'aac' && (
                      <p>AAC: High-quality compression, used by Apple. Good for mobile devices.</p>
                    )}
                    {outputFormat === 'ogg' && (
                      <p>OGG: Open source format, excellent compression. Good for web and gaming.</p>
                    )}
                    {outputFormat === 'm4a' && (
                      <p>M4A: Apple's container format with AAC codec. Good quality and iTunes compatibility.</p>
                    )}
                    {outputFormat === 'wma' && (
                      <p>WMA: Windows Media Audio. Microsoft format with good compression.</p>
                    )}
                    {outputFormat === 'opus' && (
                      <p>OPUS: Modern codec with excellent compression. Best for streaming and VoIP.</p>
                    )}
                    {outputFormat === 'ac3' && (
                      <p>AC3: Dolby Digital surround sound format. Used in DVDs and Blu-rays.</p>
                    )}
                    {outputFormat === 'amr' && (
                      <p>AMR: Adaptive Multi-Rate codec optimized for speech and mobile.</p>
                    )}
                    {outputFormat === 'au' && (
                      <p>AU: Sun Microsystems audio format. Common on Unix systems.</p>
                    )}
                    {outputFormat === 'ra' && (
                      <p>RA: RealAudio format for streaming. Legacy web audio format.</p>
                    )}
                    {outputFormat === 'mp2' && (
                      <p>MP2: MPEG-1 Audio Layer II. Broadcast quality audio format.</p>
                    )}
                    {outputFormat === 'aiff' && (
                      <p>AIFF: Audio Interchange File Format. Apple's uncompressed format.</p>
                    )}
                    {outputFormat === 'dts' && (
                      <p>DTS: Digital Theater Systems surround sound format.</p>
                    )}
                    {outputFormat === 'ape' && (
                      <p>APE: Monkey's Audio lossless format with high compression.</p>
                    )}
                    {outputFormat === 'tak' && (
                      <p>TAK: Tom's lossless Audio Kompressor. Efficient lossless compression.</p>
                    )}
                    {outputFormat === 'tta' && (
                      <p>TTA: True Audio lossless codec with real-time compression.</p>
                    )}
                    {outputFormat === 'gsm' && (
                      <p>GSM: Global System for Mobile codec. Optimized for speech.</p>
                    )}
                    {outputFormat === 'voc' && (
                      <p>VOC: Creative Voice File format from Sound Blaster cards.</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original Audio */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Original Audio
                    </Label>
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <audio 
                        src={audioPreview}
                        controls
                        className="w-full"
                      />
                      {audioInfo && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>Format: {audioInfo.format?.format_name?.toUpperCase()}</p>
                          <p>Size: {formatFileSize(audioInfo.format?.size || file?.size || 0)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Converted Audio */}
                  {convertedAudio && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        Converted Audio ({outputFormat.toUpperCase()})
                      </Label>
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <audio 
                          src={convertedAudio}
                          controls
                          className="w-full"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>Format: {outputFormat.toUpperCase()}</p>
                          <p>Quality: {quality} ({qualitySettings[quality as keyof typeof qualitySettings]?.bitrate})</p>
                        </div>
                      </div>
                      <Button onClick={downloadAudio} className="w-full mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        Download {outputFormat.toUpperCase()}
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
                Converting Audio...
              </>
            ) : (
              <>
                <Music className="w-4 h-4 mr-2" />
                Convert to {outputFormat.toUpperCase()}
              </>
            )}
          </Button>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Audio Conversion Guide:</strong>
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
              <li>• <strong>MP3:</strong> Best for general use, universally compatible</li>
              <li>• <strong>WAV:</strong> Best for professional editing, no compression</li>
              <li>• <strong>AAC:</strong> Better quality than MP3 at same bitrate</li>
              <li>• <strong>FLAC:</strong> Lossless compression, preserves original quality</li>
              <li>• Higher bitrates = better quality but larger file sizes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
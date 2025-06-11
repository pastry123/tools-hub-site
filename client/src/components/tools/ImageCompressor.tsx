import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string>("");
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setOriginalFile(file);
        setOriginalSize(file.size);
        setCompressedImage("");
        setCompressedSize(0);
      } else {
        toast({
          title: t("imageCompressor.invalidFileType"),
          description: t("imageCompressor.selectImageFile"),
          variant: "destructive",
        });
      }
    }
  };

  const compressImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0);

        // Convert to compressed blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCompressedImage(url);
              setCompressedSize(blob.size);
              setIsProcessing(false);
              
              toast({
                title: t("imageCompressor.imageCompressed"),
                description: t("imageCompressor.compressedSuccessfully"),
              });
            }
          },
          'image/jpeg',
          quality[0] / 100
        );
      };

      img.src = URL.createObjectURL(originalFile);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: t("imageCompressor.compressionFailed"),
        description: t("imageCompressor.failedToCompress"),
        variant: "destructive",
      });
    }
  };

  const downloadImage = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = `compressed_${originalFile?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t("imageCompressor.downloadStarted"),
        description: t("imageCompressor.downloadInProgress"),
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = () => {
    if (originalSize && compressedSize) {
      return Math.round(((originalSize - compressedSize) / originalSize) * 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-8">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Drag and drop an image here or click to browse</p>
            <Button variant="outline">
              Choose Image File
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Compression Settings */}
      {originalFile && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Quality: {quality[0]}%</Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  min={10}
                  step={5}
                  className="mt-2"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Higher quality = larger file size
                </p>
              </div>

              <Button 
                onClick={compressImage}
                disabled={isProcessing}
                className="w-full primary-button"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Compressing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Compress Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {compressedImage && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Compression Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Original</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Size: {formatFileSize(originalSize)}</p>
                  <p className="text-sm text-slate-600">File: {originalFile?.name}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Compressed</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Size: {formatFileSize(compressedSize)}</p>
                  <p className="text-sm text-slate-600">Reduction: {getCompressionRatio()}%</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <img 
                src={compressedImage} 
                alt="Compressed" 
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-sm"
              />
            </div>

            <Button onClick={downloadImage} className="w-full bg-accent hover:bg-emerald-600">
              <Download className="w-4 h-4 mr-2" />
              Download Compressed Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

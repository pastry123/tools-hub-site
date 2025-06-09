import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Copy, Download, Loader2, Image, Languages } from "lucide-react";
import Tesseract from 'tesseract.js';

const languages = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' }
];

export default function ImageToText() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, JPEG, WEBP).",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setExtractedText("");
      setConfidence(0);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setExtractedText("");

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        selectedLanguage,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text.trim();
      setExtractedText(text);
      setConfidence(Math.round(result.data.confidence));
      
      if (text.length > 0) {
        toast({
          title: "Text extracted successfully",
          description: `Extracted ${text.length} characters with ${Math.round(result.data.confidence)}% confidence.`
        });
      } else {
        toast({
          title: "No text found",
          description: "No readable text was detected in the image. Try with a clearer image or different language.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract text from the image. Please try with a clearer image.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard."
    });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Text has been saved as extracted-text.txt"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Image to Text (OCR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Languages className="w-4 h-4" />
                Language
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Image className="w-4 h-4" />
                Image Preview
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img 
                  src={imagePreview} 
                  alt="Selected image" 
                  className="max-w-full max-h-64 mx-auto rounded"
                />
                <p className="text-sm text-gray-600 text-center mt-2">
                  {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
          )}

          {/* Extract Button */}
          <Button 
            onClick={extractText} 
            disabled={!selectedFile || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting Text...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Extract Text
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing image...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extracted Text</span>
              {confidence > 0 && (
                <span className="text-sm font-normal text-gray-600">
                  Confidence: {confidence}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={12}
              placeholder="Extracted text will appear here..."
              className="font-mono"
            />
            
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </Button>
              <Button onClick={downloadText} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download as TXT
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Tips for better results:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-contrast images with clear text</li>
                <li>Ensure text is horizontal and not rotated</li>
                <li>Select the correct language for the text</li>
                <li>Avoid blurry or low-resolution images</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
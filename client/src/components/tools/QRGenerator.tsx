import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { generateQRCodeURL, downloadQRCode, validateQRContent } from "@/lib/qrGenerator";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function QRGenerator() {
  const [content, setContent] = useState("");
  const [qrType, setQrType] = useState("text");
  const [size, setSize] = useState("300");
  const [format, setFormat] = useState("png");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGenerate = async () => {
    const validation = validateQRContent(content);
    if (!validation.isValid) {
      toast({
        title: t("qrGenerator.invalidContent"),
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const url = generateQRCodeURL({
        text: content,
        size: parseInt(size),
        format: format as 'png' | 'jpg' | 'svg',
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(url);
      
      toast({
        title: t("qrGenerator.successfullyGenerated"),
        description: t("qrGenerator.successfullyGenerated"),
      });
    } catch (error) {
      toast({
        title: t("qrGenerator.generationError"),
        description: t("qrGenerator.failedToGenerate"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, `qr-code.${format}`);
      toast({
        title: t("qrGenerator.download"),
        description: t("qrGenerator.download"),
      });
    }
  };

  const handleCopy = async () => {
    if (qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        toast({
          title: t("qrGenerator.copy"),
          description: t("qrGenerator.linkCopied"),
        });
      } catch (error) {
        toast({
          title: t("qrGenerator.generationError"),
          description: t("qrGenerator.failedToGenerate"),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="qr-type">{t("qrGenerator.type")}</Label>
          <Select value={qrType} onValueChange={setQrType}>
            <SelectTrigger>
              <SelectValue placeholder={t("qrGenerator.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">{t("qrGenerator.text")}</SelectItem>
              <SelectItem value="url">{t("qrGenerator.url")}</SelectItem>
              <SelectItem value="email">{t("qrGenerator.email")}</SelectItem>
              <SelectItem value="phone">{t("qrGenerator.phone")}</SelectItem>
              <SelectItem value="wifi">{t("qrGenerator.wifi")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">{t("qrGenerator.content")}</Label>
          <Textarea
            id="content"
            placeholder={t("qrGenerator.enterText")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200x200</SelectItem>
                <SelectItem value="300">300x300</SelectItem>
                <SelectItem value="400">400x400</SelectItem>
                <SelectItem value="500">500x500</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          className="w-full primary-button"
          disabled={isGenerating || !content.trim()}
        >
          <QrCode className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate QR Code"}
        </Button>
      </div>

      {/* Output Section */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Generated QR Code</h3>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 mb-6 min-h-[300px]">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Generated QR Code" 
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              ) : (
                <>
                  <QrCode className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-500 text-center">Your generated QR code will appear here</p>
                </>
              )}
            </div>

            {qrCodeUrl && (
              <div className="space-y-3">
                <Button onClick={handleDownload} className="w-full bg-accent hover:bg-emerald-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download {format.toUpperCase()}
                </Button>
                <Button onClick={handleCopy} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

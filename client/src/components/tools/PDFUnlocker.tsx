import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFUnlocker() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [unlockedPdf, setUnlockedPdf] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive",
      });
    }
  };

  const unlockPDF = async () => {
    if (!file || !password) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);

    try {
      const response = await fetch('/api/pdf/unlock', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setUnlockedPdf(url);
        toast({
          title: "Success",
          description: "PDF unlocked successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlock PDF');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unlock PDF. Check the password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (unlockedPdf) {
      const a = document.createElement('a');
      a.href = unlockedPdf;
      a.download = `unlocked_${file?.name || 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            PDF Unlock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="pdf-upload" className="block text-sm font-medium mb-2">
              Upload Protected PDF
            </label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm">
                  <strong>File:</strong> {file.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  PDF Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF password..."
                />
              </div>

              <Button 
                onClick={unlockPDF} 
                disabled={isProcessing || !password}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? "Unlocking PDF..." : "Unlock PDF"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {unlockedPdf && (
        <Card>
          <CardHeader>
            <CardTitle>Unlocked PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200">
                PDF successfully unlocked! The password protection has been removed.
              </p>
            </div>
            <Button onClick={downloadPDF} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Unlocked PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
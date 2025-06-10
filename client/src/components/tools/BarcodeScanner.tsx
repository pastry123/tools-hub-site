import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanResult {
  value: string;
  type: string;
  format: string;
  confidence: number;
  metadata?: {
    errorCorrectionLevel?: string;
    version?: string;
    mask?: string;
    region?: string;
    note?: string;
    segments?: Array<{
      mode: string;
      data: string;
    }>;
  };
}

interface MultipleScanResponse {
  results: ScanResult[];
  count: number;
  message: string;
}

export default function BarcodeScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setScanResults([]);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      toast({
        title: t("barcodeScanner.error"),
        description: t("barcodeScanner.selectValidImage"),
        variant: "destructive"
      });
    }
  };

  const handleScan = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file to scan",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/barcode/scan-all', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to scan barcode');
      }

      const data: MultipleScanResponse = await response.json();
      setScanResults(data.results);

      toast({
        title: "Success",
        description: data.message
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan barcode. Make sure the image contains a clear, readable barcode or QR code.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied",
      description: "Barcode value copied to clipboard"
    });
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'QR_CODE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'CODE_128': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CODE_39': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'EAN_13': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'EAN_8': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'UPC_A': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'UPC_E': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'DATA_MATRIX': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'AZTEC': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'PDF_417': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatBarcodeType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            {t("barcodeScanner.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file">{t("barcodeScanner.uploadImage")}</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">{t("barcodeScanner.clickUpload")}</span> {t("barcodeScanner.orDragDrop")}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF, WEBP</p>
                </div>
                <input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {previewUrl && (
            <div>
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t("barcodeScanner.imagePreview")}
              </Label>
              <div className="mt-2 border rounded-md overflow-hidden bg-white dark:bg-gray-900">
                <img 
                  src={previewUrl} 
                  alt="Barcode preview" 
                  className="w-full max-w-md mx-auto block max-h-64 object-contain p-4"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleScan} 
            disabled={!file || isScanning} 
            className="w-full"
          >
            {isScanning ? t("barcodeScanner.scanning") : t("barcodeScanner.scanButton")}
          </Button>

          {scanResults.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-4">
                  {t("barcodeScanner.scanSuccessful")} {scanResults.length} {scanResults.length > 1 ? t("barcodeScanner.barcodes") : t("barcodeScanner.barcode")}
                </h3>
                
                <div className="space-y-6">
                  {scanResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          Barcode #{index + 1}
                        </h4>
                        <Badge className={getTypeColor(result.format)}>
                          {formatBarcodeType(result.format)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium">Type</Label>
                          <p className="text-sm">{result.type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Format</Label>
                          <p className="text-sm">{formatBarcodeType(result.format)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Confidence</Label>
                          <p className="text-sm">{(result.confidence * 100).toFixed(1)}%</p>
                        </div>
                        {result.metadata?.region && (
                          <div>
                            <Label className="text-sm font-medium">Region</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {result.metadata.region}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Decoded Value</Label>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.value)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={result.value}
                          readOnly
                          rows={3}
                          className="font-mono text-sm"
                        />
                      </div>

                      {result.metadata?.note && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                          <strong>Note:</strong> {result.metadata.note}
                        </div>
                      )}

                      {result.metadata?.segments && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium">Data Segments</Label>
                          <div className="mt-2 space-y-2">
                            {result.metadata.segments.map((segment: any, segIndex: number) => (
                              <div key={segIndex} className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                                <div className="flex justify-between items-center">
                                  <Badge variant="outline">{segment.mode}</Badge>
                                  <span className="text-xs text-gray-500">
                                    {segment.data.length} chars
                                  </span>
                                </div>
                                <p className="text-sm mt-1 font-mono break-all">{segment.data}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>Supported formats:</strong> QR Code, Code 128, Code 39, EAN-13, EAN-8, 
              UPC-A, UPC-E, Data Matrix, Aztec, PDF 417, and more. For best results, 
              ensure the barcode is clear, well-lit, and properly aligned in the image.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
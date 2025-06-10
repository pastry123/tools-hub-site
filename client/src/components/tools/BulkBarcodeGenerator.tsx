import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Download, FileSpreadsheet, BarChart3, 
  CheckCircle, AlertCircle, Trash2, Eye, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface BarcodeItem {
  id: string;
  data: string;
  type: string;
  size: number;
  format: string;
  status: 'pending' | 'generated' | 'error';
  error?: string;
  result?: string;
}

interface BulkJob {
  id: string;
  name: string;
  items: BarcodeItem[];
  progress: number;
  status: 'preparing' | 'processing' | 'completed' | 'failed';
  settings: {
    type: string;
    size: number;
    format: string;
    includeText: boolean;
    backgroundColor: string;
    foregroundColor: string;
  };
}

export default function BulkBarcodeGenerator() {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [currentJob, setCurrentJob] = useState<BulkJob | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [manualData, setManualData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  const barcodeTypes = [
    { value: 'qr', label: 'QR Code' },
    { value: 'code128', label: 'Code 128' },
    { value: 'ean13', label: 'EAN-13' },
    { value: 'upc', label: 'UPC-A' },
    { value: 'datamatrix', label: 'Data Matrix' },
    { value: 'pdf417', label: 'PDF417' }
  ];

  const formats = [
    { value: 'png', label: 'PNG' },
    { value: 'svg', label: 'SVG' },
    { value: 'pdf', label: 'PDF' }
  ];

  const createNewJob = () => {
    const newJob: BulkJob = {
      id: `job-${Date.now()}`,
      name: `Bulk Job ${jobs.length + 1}`,
      items: [],
      progress: 0,
      status: 'preparing',
      settings: {
        type: 'qr',
        size: 200,
        format: 'png',
        includeText: true,
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }
    };

    setCurrentJob(newJob);
    setJobs(prev => [newJob, ...prev]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      parseCsvData(content);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (content: string) => {
    if (!currentJob) return;

    try {
      const lines = content.split('\n').filter(line => line.trim());
      const items: BarcodeItem[] = [];

      lines.forEach((line, index) => {
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length > 0 && columns[0]) {
          items.push({
            id: `item-${index}`,
            data: columns[0],
            type: currentJob.settings.type,
            size: currentJob.settings.size,
            format: currentJob.settings.format,
            status: 'pending'
          });
        }
      });

      const updatedJob = { ...currentJob, items };
      setCurrentJob(updatedJob);
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));

      toast({
        title: "CSV Loaded",
        description: `Loaded ${items.length} items from CSV file`,
      });
    } catch (error) {
      toast({
        title: "CSV Parse Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const parseManualData = () => {
    if (!currentJob || !manualData.trim()) return;

    const lines = manualData.split('\n').filter(line => line.trim());
    const items: BarcodeItem[] = lines.map((line, index) => ({
      id: `item-${index}`,
      data: line.trim(),
      type: currentJob.settings.type,
      size: currentJob.settings.size,
      format: currentJob.settings.format,
      status: 'pending'
    }));

    const updatedJob = { ...currentJob, items };
    setCurrentJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));

    toast({
      title: "Data Added",
      description: `Added ${items.length} items to the job`,
    });
  };

  const generateBarcodes = async () => {
    if (!currentJob || currentJob.items.length === 0) {
      toast({
        title: "No Data",
        description: "Please add data before generating barcodes",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const updatedJob = { ...currentJob };
    updatedJob.status = 'processing';
    setCurrentJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));

    try {
      for (let i = 0; i < currentJob.items.length; i++) {
        const item = currentJob.items[i];
        
        // Simulate barcode generation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const formData = new FormData();
        formData.append('text', item.data);
        formData.append('type', item.type);
        formData.append('size', item.size.toString());
        formData.append('format', item.format);

        try {
          const response = await fetch('/api/barcode/generate', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const blob = await response.blob();
            const result = URL.createObjectURL(blob);
            
            item.status = 'generated';
            item.result = result;
          } else {
            item.status = 'error';
            item.error = 'Generation failed';
          }
        } catch (error) {
          item.status = 'error';
          item.error = error instanceof Error ? error.message : 'Unknown error';
        }

        const progress = Math.round(((i + 1) / currentJob.items.length) * 100);
        updatedJob.progress = progress;
        
        setCurrentJob({ ...updatedJob });
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? { ...updatedJob } : job));
      }

      updatedJob.status = 'completed';
      setCurrentJob(updatedJob);
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));

      toast({
        title: "Generation Complete",
        description: `Generated ${currentJob.items.filter(item => item.status === 'generated').length} barcodes`,
      });
    } catch (error) {
      updatedJob.status = 'failed';
      setCurrentJob(updatedJob);
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));

      toast({
        title: "Generation Failed",
        description: "An error occurred during bulk generation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = async () => {
    if (!currentJob || currentJob.status !== 'completed') return;

    try {
      // Create download archive simulation
      const successfulItems = currentJob.items.filter(item => item.status === 'generated' && item.result);
      
      // For now, download first item as example
      if (successfulItems.length > 0 && successfulItems[0].result) {
        const response = await fetch(successfulItems[0].result);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample_barcode.${currentJob.settings.format}`;
        a.click();
      }


      toast({
        title: "Download Started",
        description: "Your barcode archive is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to create download archive",
        variant: "destructive",
      });
    }
  };

  const updateJobSettings = (key: string, value: any) => {
    if (!currentJob) return;

    const updatedJob = {
      ...currentJob,
      settings: { ...currentJob.settings, [key]: value }
    };

    setCurrentJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("bulkBarcode.title")}</h1>
        <p className="text-gray-600">{t("bulkBarcode.description")}</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("bulkBarcode.bulkJobs")}</h2>
        <Button onClick={createNewJob}>
          <BarChart3 className="w-4 h-4 mr-2" />
          {t("bulkBarcode.newBulkJob")}
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">{t("bulkBarcode.noBulkJobs")}</h3>
            <p className="text-gray-600 mb-4">{t("bulkBarcode.createFirstJob")}</p>
            <Button onClick={createNewJob}>
              {t("bulkBarcode.createNewJob")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="space-y-4">
            <h3 className="font-medium">{t("bulkBarcode.jobQueue")}</h3>
            {jobs.map((job) => (
              <Card 
                key={job.id}
                className={`cursor-pointer transition-colors ${
                  currentJob?.id === job.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setCurrentJob(job)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'processing' ? 'secondary' :
                      job.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.items.length} {t("bulkBarcode.items")}
                  </p>
                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="h-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {currentJob ? (
              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="setup">{t("bulkBarcode.setup")}</TabsTrigger>
                  <TabsTrigger value="data">{t("bulkBarcode.data")}</TabsTrigger>
                  <TabsTrigger value="settings">{t("bulkBarcode.settings")}</TabsTrigger>
                  <TabsTrigger value="results">{t("bulkBarcode.results")}</TabsTrigger>
                </TabsList>

                <TabsContent value="setup" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("bulkBarcode.dataInput")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("bulkBarcode.uploadCsv")}</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600 mb-2">{t("bulkBarcode.dropCsvFile")}</p>
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            {t("bulkBarcode.chooseFile")}
                          </Button>
                        </div>
                      </div>

                      <div className="text-center text-gray-500">or</div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t("bulkBarcode.manualInput")}</label>
                        <Textarea
                          placeholder={t("bulkBarcode.manualPlaceholder")}
                          value={manualData}
                          onChange={(e) => setManualData(e.target.value)}
                          rows={6}
                        />
                        <Button 
                          className="mt-2" 
                          onClick={parseManualData}
                          disabled={!manualData.trim()}
                        >
                          {t("bulkBarcode.addManualData")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("bulkBarcode.dataPreview")} ({currentJob.items.length} {t("bulkBarcode.items")})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentJob.items.length === 0 ? (
                        <div className="text-center py-8">
                          <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">{t("bulkBarcode.noDataLoaded")}</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {currentJob.items.slice(0, 50).map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{index + 1}. {item.data}</span>
                              <Badge variant={
                                item.status === 'generated' ? 'default' :
                                item.status === 'error' ? 'destructive' : 'outline'
                              }>
                                {item.status}
                              </Badge>
                            </div>
                          ))}
                          {currentJob.items.length > 50 && (
                            <p className="text-sm text-gray-500 text-center">
                              {t("bulkBarcode.andMore").replace("{count}", (currentJob.items.length - 50).toString())}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Generation Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Barcode Type</label>
                          <Select 
                            value={currentJob.settings.type}
                            onValueChange={(value) => updateJobSettings('type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {barcodeTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Output Format</label>
                          <Select 
                            value={currentJob.settings.format}
                            onValueChange={(value) => updateJobSettings('format', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formats.map(format => (
                                <SelectItem key={format.value} value={format.value}>
                                  {format.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Size (pixels)</label>
                          <Input 
                            type="number"
                            value={currentJob.settings.size}
                            onChange={(e) => updateJobSettings('size', parseInt(e.target.value))}
                            min="50"
                            max="1000"
                          />
                        </div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <Button 
                          onClick={generateBarcodes}
                          disabled={currentJob.items.length === 0 || isProcessing}
                          size="lg"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t("bulkBarcode.generating")}
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              {t("bulkBarcode.generateAll")}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {t("bulkBarcode.generationResults")}
                        {currentJob.status === 'completed' && (
                          <Button onClick={downloadResults}>
                            <Download className="w-4 h-4 mr-2" />
                            {t("bulkBarcode.downloadAll")}
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentJob.status === 'preparing' ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">{t("bulkBarcode.generateToSeeResults")}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {currentJob.items.filter(item => item.status === 'generated').length}
                              </div>
                              <div className="text-sm text-gray-600">{t("bulkBarcode.generated")}</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {currentJob.items.filter(item => item.status === 'error').length}
                              </div>
                              <div className="text-sm text-gray-600">{t("bulkBarcode.failed")}</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-600">
                                {currentJob.items.length}
                              </div>
                              <div className="text-sm text-gray-600">{t("bulkBarcode.total")}</div>
                            </div>
                          </div>

                          <div className="max-h-96 overflow-y-auto space-y-2">
                            {currentJob.items.map((item, index) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono">{index + 1}</span>
                                  <span className="text-sm">{item.data}</span>
                                  {item.status === 'generated' && item.result && (
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <Badge variant={
                                  item.status === 'generated' ? 'default' :
                                  item.status === 'error' ? 'destructive' : 'outline'
                                }>
                                  {item.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">{t("bulkBarcode.selectJobToStart")}</h3>
                  <p className="text-gray-600">{t("bulkBarcode.chooseJobOrCreate")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
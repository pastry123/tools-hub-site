import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Download, Shield, FileText, Eye, EyeOff, Lock, Key } from "lucide-react";

interface PasswordSettings {
  userPassword: string;
  ownerPassword: string;
  permissions: {
    allowPrinting: boolean;
    allowCopying: boolean;
    allowModifying: boolean;
    allowAnnotations: boolean;
    allowFormFilling: boolean;
    allowAccessibility: boolean;
  };
}

export default function PDFProtector() {
  const [file, setFile] = useState<File | null>(null);
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>({
    userPassword: "",
    ownerPassword: "",
    permissions: {
      allowPrinting: false,
      allowCopying: false,
      allowModifying: false,
      allowAnnotations: false,
      allowFormFilling: true,
      allowAccessibility: true,
    }
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "File exceeds 100MB limit",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setProtectedPdfUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const generateSecurePassword = (length: number = 12) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const protectPDF = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!passwordSettings.userPassword.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a user password to protect the PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userPassword', passwordSettings.userPassword);
      if (passwordSettings.ownerPassword) {
        formData.append('ownerPassword', passwordSettings.ownerPassword);
      }
      formData.append('permissions', JSON.stringify(passwordSettings.permissions));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 17;
        });
      }, 250);

      const response = await fetch('/api/pdf/protect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to protect PDF: ${response.statusText}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProtectedPdfUrl(url);

      toast({
        title: "Success!",
        description: "PDF protected with password successfully",
      });
    } catch (error) {
      console.error("Error protecting PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to protect PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProtectedPDF = () => {
    if (protectedPdfUrl && file) {
      const link = document.createElement("a");
      link.href = protectedPdfUrl;
      link.download = `protected-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setFile(null);
    setProtectedPdfUrl(null);
    setProgress(0);
    setPasswordSettings({
      userPassword: "",
      ownerPassword: "",
      permissions: {
        allowPrinting: false,
        allowCopying: false,
        allowModifying: false,
        allowAnnotations: false,
        allowFormFilling: true,
        allowAccessibility: true,
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            PDF Password Protection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Secure your PDF documents with password protection and permission controls.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileSelection(files[0]);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload PDF File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a PDF file here, or click to browse
            </p>
            <Button variant="outline">
              <FileUp className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelection(files[0]);
                }
              }}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password Settings */}
          {file && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Security Settings</h3>
              
              <div className="space-y-4">
                {/* User Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    User Password (Required)
                  </label>
                  <div className="relative">
                    <Input
                      type={showUserPassword ? "text" : "password"}
                      value={passwordSettings.userPassword}
                      onChange={(e) => setPasswordSettings(prev => ({ ...prev, userPassword: e.target.value }))}
                      placeholder="Enter password to open the PDF"
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPasswordSettings(prev => ({ ...prev, userPassword: generateSecurePassword() }))}
                        className="h-6 px-2 text-xs"
                      >
                        Generate
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUserPassword(!showUserPassword)}
                        className="h-6 w-6 p-0"
                      >
                        {showUserPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This password will be required to open and view the PDF
                  </p>
                </div>

                {/* Owner Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Owner Password (Optional)
                  </label>
                  <div className="relative">
                    <Input
                      type={showOwnerPassword ? "text" : "password"}
                      value={passwordSettings.ownerPassword}
                      onChange={(e) => setPasswordSettings(prev => ({ ...prev, ownerPassword: e.target.value }))}
                      placeholder="Enter password for permissions control"
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPasswordSettings(prev => ({ ...prev, ownerPassword: generateSecurePassword() }))}
                        className="h-6 px-2 text-xs"
                      >
                        Generate
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                        className="h-6 w-6 p-0"
                      >
                        {showOwnerPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This password allows you to modify permissions and security settings
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium">Document Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowPrinting"
                      checked={passwordSettings.permissions.allowPrinting}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowPrinting: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowPrinting" className="text-sm">Allow Printing</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowCopying"
                      checked={passwordSettings.permissions.allowCopying}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowCopying: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowCopying" className="text-sm">Allow Text Copying</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowModifying"
                      checked={passwordSettings.permissions.allowModifying}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowModifying: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowModifying" className="text-sm">Allow Document Modification</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowAnnotations"
                      checked={passwordSettings.permissions.allowAnnotations}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowAnnotations: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowAnnotations" className="text-sm">Allow Adding Annotations</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowFormFilling"
                      checked={passwordSettings.permissions.allowFormFilling}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowFormFilling: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowFormFilling" className="text-sm">Allow Form Filling</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowAccessibility"
                      checked={passwordSettings.permissions.allowAccessibility}
                      onCheckedChange={(checked) =>
                        setPasswordSettings(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, allowAccessibility: checked as boolean }
                        }))
                      }
                    />
                    <label htmlFor="allowAccessibility" className="text-sm">Allow Accessibility Access</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protecting PDF...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={protectPDF}
              disabled={!file || !passwordSettings.userPassword.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Protecting..." : "Protect PDF"}
            </Button>
            
            {file && (
              <Button variant="outline" onClick={resetTool}>
                Reset
              </Button>
            )}
          </div>

          {/* Download Result */}
          {protectedPdfUrl && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    PDF Protected Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Your password-protected PDF is ready for download
                  </p>
                </div>
                <Button onClick={downloadProtectedPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Security Tips */}
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Security Tips</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Use strong passwords with a mix of letters, numbers, and symbols</li>
              <li>• Keep your passwords secure and don't share them unnecessarily</li>
              <li>• The owner password provides additional control over document permissions</li>
              <li>• Consider disabling permissions that aren't necessary for your use case</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
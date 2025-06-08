import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, Download, FileText, Edit3, Save, 
  CheckSquare, Calendar, User, Mail, Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date' | 'checkbox' | 'select' | 'textarea';
  value: string | boolean;
  required: boolean;
  options?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface PDFFormData {
  id: string;
  name: string;
  file: File;
  fields: FormField[];
  pages: number;
  preview?: string;
  filled: boolean;
}

export default function PDFFormFiller() {
  const [pdfForms, setPdfForms] = useState<PDFFormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<PDFFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldTemplates, setFieldTemplates] = useState<Record<string, any>>({
    personal: {
      'first_name': 'John',
      'last_name': 'Doe',
      'email': 'john.doe@example.com',
      'phone': '+1 (555) 123-4567',
      'address': '123 Main Street, City, State 12345',
      'date_of_birth': '1990-01-01'
    },
    business: {
      'company_name': 'Acme Corporation',
      'contact_person': 'John Smith',
      'business_email': 'contact@acme.com',
      'business_phone': '+1 (555) 987-6543',
      'tax_id': '12-3456789',
      'business_address': '456 Business Ave, Corporate City, State 54321'
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid File",
            description: "Please upload PDF files only",
            variant: "destructive",
          });
          continue;
        }

        // Analyze PDF form fields
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('/api/pdf/analyze-form', {
          method: 'POST',
          body: formData,
        });

        const analysis = await response.json();

        const newForm: PDFFormData = {
          id: `form-${Date.now()}-${Math.random()}`,
          name: file.name.replace('.pdf', ''),
          file,
          fields: analysis.fields || generateSampleFields(),
          pages: analysis.pages || 1,
          preview: analysis.preview,
          filled: false
        };

        setPdfForms(prev => [...prev, newForm]);
      }

      toast({
        title: "PDF Analyzed",
        description: "Successfully detected form fields",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze PDF form fields",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSampleFields = (): FormField[] => {
    return [
      {
        id: 'field-1',
        name: 'first_name',
        type: 'text',
        value: '',
        required: true,
        x: 100,
        y: 150,
        width: 200,
        height: 25,
        page: 1
      },
      {
        id: 'field-2',
        name: 'last_name',
        type: 'text',
        value: '',
        required: true,
        x: 350,
        y: 150,
        width: 200,
        height: 25,
        page: 1
      },
      {
        id: 'field-3',
        name: 'email',
        type: 'email',
        value: '',
        required: true,
        x: 100,
        y: 200,
        width: 300,
        height: 25,
        page: 1
      },
      {
        id: 'field-4',
        name: 'phone',
        type: 'text',
        value: '',
        required: false,
        x: 100,
        y: 250,
        width: 200,
        height: 25,
        page: 1
      },
      {
        id: 'field-5',
        name: 'agree_terms',
        type: 'checkbox',
        value: false,
        required: true,
        x: 100,
        y: 300,
        width: 20,
        height: 20,
        page: 1
      }
    ];
  };

  const updateFieldValue = (fieldId: string, value: string | boolean) => {
    if (!selectedForm) return;

    const updatedFields = selectedForm.fields.map(field =>
      field.id === fieldId ? { ...field, value } : field
    );

    const updatedForm = { ...selectedForm, fields: updatedFields };
    setSelectedForm(updatedForm);
    setPdfForms(prev => prev.map(form => 
      form.id === updatedForm.id ? updatedForm : form
    ));
  };

  const applyTemplate = (templateName: string) => {
    if (!selectedForm || !fieldTemplates[templateName]) return;

    const template = fieldTemplates[templateName];
    const updatedFields = selectedForm.fields.map(field => {
      const templateValue = template[field.name];
      if (templateValue !== undefined) {
        return { ...field, value: templateValue };
      }
      return field;
    });

    const updatedForm = { ...selectedForm, fields: updatedFields };
    setSelectedForm(updatedForm);
    setPdfForms(prev => prev.map(form => 
      form.id === updatedForm.id ? updatedForm : form
    ));

    toast({
      title: "Template Applied",
      description: `Applied ${templateName} template data`,
    });
  };

  const fillForm = async () => {
    if (!selectedForm) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedForm.file);
      formData.append('fields', JSON.stringify(selectedForm.fields));

      const response = await fetch('/api/pdf/fill-form', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filled_${selectedForm.name}.pdf`;
        a.click();

        const updatedForm = { ...selectedForm, filled: true };
        setSelectedForm(updatedForm);
        setPdfForms(prev => prev.map(form => 
          form.id === updatedForm.id ? updatedForm : form
        ));

        toast({
          title: "Form Filled",
          description: "PDF form has been filled and downloaded",
        });
      } else {
        throw new Error('Failed to fill form');
      }
    } catch (error) {
      toast({
        title: "Fill Failed",
        description: "Could not fill PDF form",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    if (!selectedForm) return false;

    const requiredFields = selectedForm.fields.filter(field => field.required);
    const emptyFields = requiredFields.filter(field => 
      field.value === '' || field.value === false
    );

    if (emptyFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill required fields: ${emptyFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Form Filler</h1>
        <p className="text-gray-600">Fill out interactive PDF forms quickly and efficiently</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">PDF Forms</h2>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload PDF Form
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {pdfForms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No PDF forms uploaded</h3>
            <p className="text-gray-600 mb-4">Upload a PDF form to start filling it out</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form List */}
          <div className="space-y-4">
            <h3 className="font-medium">Uploaded Forms</h3>
            {pdfForms.map((form) => (
              <Card 
                key={form.id}
                className={`cursor-pointer transition-colors ${
                  selectedForm?.id === form.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedForm(form)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{form.name}</h4>
                    <Badge variant={form.filled ? 'default' : 'outline'}>
                      {form.filled ? 'Filled' : 'Empty'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {form.fields.length} fields • {form.pages} pages
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form Editor */}
          <div className="lg:col-span-3">
            {selectedForm ? (
              <Tabs defaultValue="fill" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fill">Fill Form</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="fill" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-5 h-5" />
                          {selectedForm.name}
                        </div>
                        <Button 
                          onClick={() => validateForm() && fillForm()}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Fill & Download
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedForm.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                              {getFieldIcon(field.type)}
                              {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {field.required && <span className="text-red-500">*</span>}
                            </label>
                            
                            {field.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value as boolean}
                                  onCheckedChange={(checked) => 
                                    updateFieldValue(field.id, checked as boolean)
                                  }
                                />
                                <span className="text-sm">I agree to the terms</span>
                              </div>
                            ) : field.type === 'select' ? (
                              <Select 
                                value={field.value as string}
                                onValueChange={(value) => updateFieldValue(field.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : field.type === 'textarea' ? (
                              <Textarea
                                value={field.value as string}
                                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                                rows={3}
                              />
                            ) : (
                              <Input
                                type={field.type}
                                value={field.value as string}
                                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                                required={field.required}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pre-filled Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h3 className="font-medium mb-2">Personal Information</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Common personal details for forms
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => applyTemplate('personal')}
                            className="w-full"
                          >
                            Apply Personal Template
                          </Button>
                        </Card>

                        <Card className="p-4">
                          <h3 className="font-medium mb-2">Business Information</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Company and business details
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => applyTemplate('business')}
                            className="w-full"
                          >
                            Apply Business Template
                          </Button>
                        </Card>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-medium mb-3">Field Mapping</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedForm.fields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between text-sm p-2 border rounded">
                              <span className="font-mono">{field.name}</span>
                              <Badge variant="outline">{field.type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Form Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">PDF Preview</h3>
                        <p className="text-gray-600 mb-4">
                          Preview of {selectedForm.name} with {selectedForm.fields.length} fields
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                          <div>
                            <h4 className="font-medium mb-2">Form Statistics</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>Total fields: {selectedForm.fields.length}</li>
                              <li>Required fields: {selectedForm.fields.filter(f => f.required).length}</li>
                              <li>Filled fields: {selectedForm.fields.filter(f => f.value && f.value !== '').length}</li>
                              <li>Pages: {selectedForm.pages}</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Field Types</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>Text: {selectedForm.fields.filter(f => f.type === 'text').length}</li>
                              <li>Email: {selectedForm.fields.filter(f => f.type === 'email').length}</li>
                              <li>Checkbox: {selectedForm.fields.filter(f => f.type === 'checkbox').length}</li>
                              <li>Other: {selectedForm.fields.filter(f => !['text', 'email', 'checkbox'].includes(f.type)).length}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a PDF form</h3>
                  <p className="text-gray-600">Choose a form from the list to start filling it out</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
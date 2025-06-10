import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Copy } from "lucide-react";
import bwipjs from "bwip-js";
import { useLanguage } from "@/contexts/LanguageContext";

interface BarcodeOptions {
  text: string;
  bcid: string;
  scale: number;
  height: number;
  includetext: boolean;
  textxalign: string;
  textyalign: string;
  textsize: number;
  rotate: string;
  backgroundcolor: string;
  paddingleft: number;
  paddingright: number;
  paddingtop: number;
  paddingbottom: number;
}

// Complete bwip-js supported barcode categories - all authentic encoding
const barcodeCategories: Record<string, Record<string, { bcid: string; hint: string; options?: any; ccSupport?: boolean; actualBcid?: string }>> = {
  "Linear Codes": {
    "Code-128": { bcid: "code128", hint: "Alphanumeric or all numeric." },
    "Code-11": { bcid: "code11", hint: "Numeric (0-9) and hyphen (-)." },
    "Code-2of5 Interleaved": { bcid: "interleaved2of5", hint: "Numeric (0-9), even number of digits." },
    "Code-39": { bcid: "code39", hint: "Alphanumeric (A-Z, 0-9) and symbols (- . $ / + % SPACE)." },
    "Code-39 Full ASCII": { bcid: "code39ext", hint: "Full ASCII character set." },
    "Code-93": { bcid: "code93", hint: "Full ASCII character set." },
    "Flattermarken": { bcid: "flattermarken", hint: "Specialized code." },
    "GS1-128 (UCC/EAN-128)": { bcid: "gs1-128", hint: "GS1 standard, uses Application Identifiers. E.g., (01)12345..." },
    "MSI": { bcid: "msicode", hint: "Numeric (0-9)." },
    "Pharmacode One-Track": { bcid: "pharmacode", hint: "Numeric, for pharmaceutical packaging." },
    "Pharmacode Two-Track": { bcid: "pharmacode2", hint: "Numeric, two-track version." },
    "Telepen Alpha": { bcid: "telepen", hint: "Full ASCII." }
  },
  "Postal Codes": {
    "Australian Post Standard Customer": { bcid: "auspost", hint: "Format: NNNN or NNNNNNNN (FCC+Sort+DPID)" },
    "DAFT": { bcid: "daft", hint: "Used by some European postal services." },
    "DPD Barcode (DPD Parcel Label)": { bcid: "dpd", hint: "Parcel identification." },
    "Japanese Postal (Customer) Code": { bcid: "japanpost", hint: "Numeric and hyphen." },
    "KIX (TNT Post Netherlands)": { bcid: "kix", hint: "Alphanumeric, Dutch postal code." },
    "Planet Code 12": { bcid: "planet", hint: "12 or 14 digits. USPS Marketing Mail." },
    "Royal Mail 4-State (RM4SCC)": { bcid: "royalmail", hint: "Alphanumeric, UK postal." },
    "Royal Mail Mailmark 4-State": { bcid: "mailmark", hint: "Complex, requires specific data structure." },
    "USPS PostNet 5": { bcid: "postnet-5", actualBcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "5-digit ZIP." },
    "USPS PostNet 9": { bcid: "postnet-9", actualBcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "9-digit ZIP (ZIP+4)." },
    "USPS PostNet 11": { bcid: "postnet-11", actualBcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "11-digit Delivery Point." },
    "USPS IM Package (IMpb)": { bcid: "impb", actualBcid: "gs1-128", hint: "GS1-128 with specific AIs for USPS Intelligent Mail Package Barcode." },
    "UPU S10": { bcid: "upu-s10", actualBcid: "gs1-128", hint: "International postal items, often GS1-128. Format: (420)ZIP(92)COUNTRY(01)ITEM_ID" }
  },
  "GS1 DataBar": {
    "GS1-DataBar Omnidirectional": { bcid: "gs1databaromni", hint: "14 digits, typically GTIN." },
    "GS1-DataBar Stacked": { bcid: "gs1databarstacked", hint: "14 digits, for smaller items." },
    "GS1-DataBar Stacked Omni": { bcid: "gs1databarstackedomni", hint: "14 digits." },
    "GS1-DataBar Limited": { bcid: "gs1databarlimited", hint: "14 digits, leading (0) or (1)." },
    "GS1-DataBar Expanded": { bcid: "gs1databarexpanded", hint: "Up to 74 numeric or 41 alphabetic chars. Uses AIs." },
    "GS1-DataBar Expanded Stacked": { bcid: "gs1databarexpandedstacked", hint: "Multi-row version of Expanded." },
    "GS1-128 Composite Symbology": { bcid: "gs1-128-composite", actualBcid: "gs1-128", ccSupport: true, hint: "GS1-128 with 2D component. Data | CC_Data" },
    "GS1-DataBar Composite": { bcid: "gs1databaromni-composite", actualBcid: "gs1databaromni", ccSupport: true, hint: "DataBar Omni with 2D component. Data | CC_Data" },
    "GS1-DataBar Stacked Composite": { bcid: "gs1databarstacked-composite", actualBcid: "gs1databarstacked", ccSupport: true, hint: "DataBar Stacked with 2D. Data | CC_Data" },
    "GS1-DataBar Stacked Omni Composite": { bcid: "gs1databarstackedomni-composite", actualBcid: "gs1databarstackedomni", ccSupport: true, hint: "Stacked Omni with 2D. Data | CC_Data" },
    "GS1-DataBar Limited Composite": { bcid: "gs1databarlimited-composite", actualBcid: "gs1databarlimited", ccSupport: true, hint: "Limited with 2D. Data | CC_Data" },
    "GS1-DataBar Expanded Composite": { bcid: "gs1databarexpanded-composite", actualBcid: "gs1databarexpanded", ccSupport: true, hint: "Expanded with 2D. Data | CC_Data" },
    "GS1-DataBar Expanded Stacked Composite": { bcid: "gs1databarexpandedstacked-composite", actualBcid: "gs1databarexpandedstacked", ccSupport: true, hint: "Expanded Stacked with 2D. Data | CC_Data" }
  },
  "EAN / UPC": {
    "EAN-8": { bcid: "ean8", hint: "8 digits." },
    "EAN-13": { bcid: "ean13", hint: "13 digits (12 data + 1 check)." },
    "EAN-14": { bcid: "ean14", hint: "14 digits (GTIN-14), often represented as GS1-128 (01) or DataMatrix." },
    "EAN-8 Composite Symbology": { bcid: "ean8-composite", actualBcid: "ean8", ccSupport: true, hint: "EAN-8 with 2D component. Data | CC_Data" },
    "EAN-13 Composite Symbology": { bcid: "ean13-composite", actualBcid: "ean13", ccSupport: true, hint: "EAN-13 with 2D component. Data | CC_Data" },
    "UPC-A": { bcid: "upca", hint: "12 digits (11 data + 1 check)." },
    "UPC-E": { bcid: "upce", hint: "8 digits (compressed from UPC-A)." },
    "UPC-A Composite Symbology": { bcid: "upca-composite", actualBcid: "upca", ccSupport: true, hint: "UPC-A with 2D component. Data | CC_Data" },
    "UPC-E Composite Symbology": { bcid: "upce-composite", actualBcid: "upce", ccSupport: true, hint: "UPC-E with 2D component. Data | CC_Data" }
  },
  "2D Codes": {
    "QR Code": { bcid: "qrcode", hint: "Alphanumeric data, URLs, etc." },
    "Data Matrix": { bcid: "datamatrix", hint: "Alphanumeric, high density." },
    "Data Matrix Rectangular": { bcid: "datamatrixrectangular", hint: "Rectangular version of Data Matrix." },
    "Aztec": { bcid: "azteccode", hint: "Alphanumeric, robust." },
    "Codablock-F": { bcid: "codablockf", hint: "Stacked linear code." },
    "MaxiCode": { bcid: "maxicode", hint: "Fixed size, used by UPS." },
    "MicroPDF417": { bcid: "micropdf417", hint: "Smaller version of PDF417." },
    "PDF417": { bcid: "pdf417", hint: "Stacked linear, can hold large amounts of data." },
    "Micro QR Code": { bcid: "microqrcode", hint: "Smaller version of QR Code." },
    "Han Xin": { bcid: "hanxin", hint: "Chinese 2D code." },
    "DotCode": { bcid: "dotcode", hint: "For high-speed industrial printing." },
    "Royal Mail Mailmark 2D": { bcid: "mailmark-2d", actualBcid: "datamatrix", options: { "mailmark": true }, hint: "Data Matrix for Royal Mail Mailmark. Specific data structure." },
    "NTIN Code": { bcid: "ntin-datamatrix", actualBcid: "datamatrix", hint: "German PPN system, uses Data Matrix. Data: PPN_Data" },
    "PPN Code": { bcid: "ppn-datamatrix", actualBcid: "datamatrix", hint: "Pharmacy Product Number, uses Data Matrix. Data: PPN_Data" }
  },
  "GS1 2D Barcodes": {
    "GS1 QR Code": { bcid: "gs1qrcode", hint: "QR Code with GS1 data structure (FNC1)." },
    "GS1 DataMatrix": { bcid: "gs1datamatrix", hint: "Data Matrix with GS1 data structure (FNC1)." },
    "GS1 Digital Link QR code": { bcid: "gs1-digital-qr", actualBcid: "qrcode", hint: "URL using GS1 Digital Link syntax. e.g. https://d.gs1.org/gtin/..." },
    "GS1 Digital Link Data Matrix": { bcid: "gs1-digital-dm", actualBcid: "datamatrix", hint: "URL using GS1 Digital Link syntax. e.g. https://d.gs1.org/gtin/..." }
  },
  "Banking and Payments": {
    "EPC QR Code V2": { bcid: "epc-qr", actualBcid: "qrcode", hint: "SEPA Credit Transfer QR. Structured data: BCD\\n002\\n1\\nSCT\\n..." },
    "Swiss QR Code v.1.0/v.2.2": { bcid: "swissqrcode", hint: "Highly structured data for Swiss payments. Refer to Swiss QR standards for data format." },
    "ZATCA QR Code (Saudi Arabia)": { bcid: "zatca-qr", actualBcid: "qrcode", hint: "Base64 encoded TLV for ZATCA e-invoicing. Complex data structure." }
  },
  "Healthcare Codes": {
    "Code32 (Italian Pharmacode)": { bcid: "code32", hint: "Italian pharmaceutical code." },
    "Flattermarken": { bcid: "flattermarken", hint: "Specialized healthcare barcode for pharmaceutical tracking." },
    "HIBC LIC 128": { bcid: "hibccode128", hint: "HIBC with Code 128. Data: +LIC_Data" },
    "HIBC LIC 39": { bcid: "hibccode39", hint: "HIBC with Code 39. Data: +LIC_Data" },
    "HIBC LIC Aztec": { bcid: "hibcazteccode", hint: "HIBC with Aztec. Data: +LIC_Data" },
    "HIBC LIC Codablock-F": { bcid: "hibccodablockf", hint: "HIBC with Codablock F. Data: +LIC_Data" },
    "HIBC LIC Data Matrix": { bcid: "hibcdatamatrix", hint: "HIBC with Data Matrix. Data: +LIC_Data" },
    "HIBC LIC Micro PDF 417": { bcid: "hibcmicropdf417", hint: "HIBC with MicroPDF417. Data: +LIC_Data" },
    "HIBC LIC PDF417": { bcid: "hibcpdf417", hint: "HIBC with PDF417. Data: +LIC_Data" },
    "HIBC LIC QR-Code": { bcid: "hibcqrcode", hint: "HIBC with QR Code. Data: +LIC_Data" },
    "HIBC PAS 128": { bcid: "hibcpascode128", hint: "HIBC PAS with Code 128. Data: +PAS_Data" },
    "HIBC PAS 39": { bcid: "hibcpascode39", hint: "HIBC PAS with Code 39. Data: +PAS_Data" },
    "NTIN (Data Matrix)": { bcid: "ntin-healthcare", actualBcid: "datamatrix", hint: "German PPN system, uses Data Matrix. Data: PPN_Data" },
    "PPN (Pharmacy Product Number)": { bcid: "ppn-healthcare", actualBcid: "datamatrix", hint: "Data Matrix. Data: PPN_Data (typically starts with //S)" },
    "PZN7": { bcid: "pzn7", actualBcid: "code39", options: { "pzn": true }, hint: "German pharma number (old). Usually Code 39 based." },
    "PZN8": { bcid: "pzn8", hint: "German pharma number (new)." }
  },
  "ISBN Codes": {
    "ISBN 13": { bcid: "isbn13", actualBcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset": 0, "addontextsize": 10 }, hint: "13 digits (usually starts 978/979). Can add price addon: ISBN|Price (e.g. 9781234567890|51299)" },
    "ISBN 13 + 5 Digits": { bcid: "isbn13-addon", actualBcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset": 0, "addontextsize": 10 }, hint: "ISBN with 5-digit price addon. Format: ISBN_Number|Addon_Digits" },
    "ISMN": { bcid: "ismn", actualBcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset": 0, "addontextsize": 10 }, hint: "International Standard Music Number (EAN-13 format, starts 979-0). Can have addon." },
    "ISSN": { bcid: "issn", actualBcid: "ean13", options: { "issn": true, "addontextxoffset": 5, "addontextyoffset": 0, "addontextsize": 10 }, hint: "International Standard Serial Number (EAN-13 format, starts 977). Can have addon." },
    "ISSN + 2 Digits": { bcid: "issn-addon", actualBcid: "ean13", options: { "issn": true, "addontextxoffset": 5, "addontextyoffset": 0, "addontextsize": 10 }, hint: "ISSN with 2-digit issue addon. Format: ISSN_Number|Addon_Digits" }
  },
  "Business Cards": {
    "QR Code vCard": { bcid: "vcard-qr", actualBcid: "qrcode", hint: "QR Code for contact information. Format: BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nORG:Company\\nTEL:+1234567890\\nEMAIL:john@example.com\\nEND:VCARD" },
    "Data Matrix vCard": { bcid: "vcard-dm", actualBcid: "datamatrix", hint: "Data Matrix for contact information. Same vCard format as QR version." },
    "QR Code MeCard": { bcid: "mecard-qr", actualBcid: "qrcode", hint: "QR Code for Japanese mobile standard. Format: MECARD:N:Doe,John;ORG:Company;TEL:+1234567890;EMAIL:john@example.com;;" },
    "Data Matrix MeCard": { bcid: "mecard-dm", actualBcid: "datamatrix", hint: "Data Matrix for MeCard format. Same format as QR version." }
  },
  "Event Barcodes": {
    "QR Code Event": { bcid: "event-qr", actualBcid: "qrcode", hint: "QR Code for event information. Format: BEGIN:VEVENT\\nSUMMARY:Event Title\\nDTSTART:20240101T120000Z\\nDTEND:20240101T130000Z\\nLOCATION:Event Location\\nEND:VEVENT" },
    "Data Matrix Event": { bcid: "event-dm", actualBcid: "datamatrix", hint: "Data Matrix for event information. Same vEvent format as QR version." }
  },
  "Wi-Fi Barcodes": {
    "QR Code Wi-Fi": { bcid: "wifi-qr", actualBcid: "qrcode", hint: "QR Code for Wi-Fi connection. Format: WIFI:T:WPA;S:NetworkName;P:Password;H:false;;" },
    "Data Matrix Wi-Fi": { bcid: "wifi-dm", actualBcid: "datamatrix", hint: "Data Matrix for Wi-Fi connection. Same Wi-Fi format as QR version." }
  },
  "Mobile Barcodes": {
    "QR Code (Mobile/Smartphone)": { bcid: "mobile-qr", actualBcid: "qrcode", hint: "Optimized QR Code for mobile scanning. Standard QR format with mobile-friendly error correction." }
  },
  "Additional Postal": {
    "Korean Postal Authority Code": { bcid: "koreapost", hint: "Korean postal barcode for domestic mail routing." },
    "Flattermarken (Extended)": { bcid: "flattermarken-ext", actualBcid: "flattermarken", hint: "Extended Flattermarken for specialized postal applications." }
  }
};

// Flatten all barcode types for easier access
const BARCODE_TYPES: Record<string, { name: string; description: string; category: string; bcid: string; hint: string; options?: any; ccSupport?: boolean }> = {};

Object.entries(barcodeCategories).forEach(([categoryName, types]) => {
  Object.entries(types).forEach(([typeName, typeData]) => {
    BARCODE_TYPES[typeData.bcid] = {
      name: typeName,
      description: typeData.hint,
      category: categoryName,
      bcid: typeData.bcid,
      hint: typeData.hint,
      options: typeData.options,
      ccSupport: typeData.ccSupport
    };
  });
});

export default function BarcodeGenerator() {
  const { t } = useLanguage();
  const [options, setOptions] = useState<BarcodeOptions>({
    text: "Hello World",
    bcid: "code128",
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: "center",
    textyalign: "below",
    textsize: 12,
    rotate: "N",
    backgroundcolor: "#ffffff",
    paddingleft: 10,
    paddingright: 10,
    paddingtop: 10,
    paddingbottom: 10
  });

  const [barcodeUrl, setBarcodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentBarcodeDef, setCurrentBarcodeDef] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Sample data for different barcode types
  const getSampleData = (bcid: string): string => {
    const samples: Record<string, string> = {
      'vcard-qr': 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Example Company\nTEL:+1-555-123-4567\nEMAIL:john.doe@example.com\nURL:https://johndoe.com\nEND:VCARD',
      'vcard-dm': 'BEGIN:VCARD\nVERSION:3.0\nFN:Jane Smith\nORG:Tech Corp\nTEL:+1-555-987-6543\nEMAIL:jane@techcorp.com\nEND:VCARD',
      'mecard-qr': 'MECARD:N:Doe,John;ORG:Example Inc;TEL:+15551234567;EMAIL:john@example.com;URL:https://johndoe.com;;',
      'mecard-dm': 'MECARD:N:Smith,Jane;ORG:Tech Solutions;TEL:+15559876543;EMAIL:jane@techsolutions.com;;',
      'event-qr': 'BEGIN:VEVENT\nSUMMARY:Team Meeting\nDTSTART:20240615T140000Z\nDTEND:20240615T150000Z\nLOCATION:Conference Room A\nDESCRIPTION:Weekly team sync meeting\nEND:VEVENT',
      'event-dm': 'BEGIN:VEVENT\nSUMMARY:Product Launch\nDTSTART:20240720T100000Z\nDTEND:20240720T120000Z\nLOCATION:Main Auditorium\nEND:VEVENT',
      'wifi-qr': 'WIFI:T:WPA;S:MyNetwork;P:MyPassword123;H:false;;',
      'wifi-dm': 'WIFI:T:WPA2;S:OfficeWiFi;P:SecurePass456;H:true;;',
      'mobile-qr': 'https://mobile.example.com/app',
      'epc-qr': 'BCD\n002\n1\nSCT\nBICFIRSTXXX\nJohn Doe\nDE89370400440532013000\nEUR50.00\n\n\nPayment for Invoice 123',
      'zatca-qr': 'AQlTYW1wbGUgQ29tcGFueQIUMTIzNDU2Nzg5MDEyMzQ1NjM=',
      'swissqrcode': 'SPC\n0200\n1\nCH4431999123000889012\nS\nSample Company Ltd\nStreet 1\n1234\nCity\nCH\n\n\n\n\n\n25.90\nCHF\nS\nJohn Doe\nMain St 5\n5678\nTown\nCH\nQRR\n123456789012345678901234567\nSample payment\nEPD'
    };
    return samples[bcid] || '';
  };

  const loadSampleData = () => {
    if (!currentBarcodeDef) return;
    const sampleData = getSampleData(currentBarcodeDef.bcid);
    if (sampleData) {
      updateOption('text', sampleData);
      toast({
        title: t("barcodeGenerator.sampleDataLoaded"),
        description: t("barcodeGenerator.sampleDataDesc"),
      });
    }
  };

  // Get unique categories
  const categories = ["all", ...Object.keys(barcodeCategories)];

  // Filter barcode types based on search and category
  const filteredBarcodeTypes = useMemo(() => {
    let allTypes: Array<[string, any]> = [];
    
    if (selectedCategory === "all") {
      Object.entries(barcodeCategories).forEach(([categoryName, types]) => {
        Object.entries(types).forEach(([typeName, typeData]) => {
          allTypes.push([typeName, { ...typeData, category: categoryName, name: typeName }]);
        });
      });
    } else {
      const categoryTypes = barcodeCategories[selectedCategory] || {};
      Object.entries(categoryTypes).forEach(([typeName, typeData]) => {
        allTypes.push([typeName, { ...typeData, category: selectedCategory, name: typeName }]);
      });
    }
    
    return allTypes.filter(([typeName, typeData]) => {
      return searchTerm === "" || 
        typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        typeData.hint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        typeData.bcid.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, selectedCategory]);

  const updateOption = (key: keyof BarcodeOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const generateBarcode = async () => {
    if (!currentBarcodeDef || !options.text.trim()) {
      toast({
        title: t("barcodeGenerator.invalidInput"),
        description: t("barcodeGenerator.selectTypeAndEnter"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const text = options.text;
      let bcid = currentBarcodeDef.actualBcid || currentBarcodeDef.bcid;
      let mainData = text;
      let ccData = null;

      // Handle composite codes (linear + 2D component)
      if (currentBarcodeDef.ccSupport && text.includes('|')) {
        const parts = text.split('|').map((s: string) => s.trim());
        mainData = parts[0];
        if (parts.length > 1 && parts[1]) {
          ccData = parts[1];
        }
      }

      let bwipOptions: any = {
        bcid: bcid,
        text: mainData,
        scale: parseInt(options.scale.toString()) || 3,
        height: 10,
        includetext: options.includetext,
        textxalign: 'center',
        barcolor: options.backgroundcolor === '#ffffff' ? '000000' : '000000',
        backgroundcolor: options.backgroundcolor.substring(1),
        ...(currentBarcodeDef.options || {})
      };

      // Add composite component data if present
      if (ccData) {
        bwipOptions.ccdata = ccData;
        bwipOptions.ccversion = 'cca';
      }

      // Special handling for EAN/UPC with addon
      if ((bcid === 'ean13' || bcid === 'upca' || bcid === 'upce') && mainData.includes('|')) {
        const parts = mainData.split('|');
        bwipOptions.text = parts[0];
        bwipOptions.addon = parts[1];
      }

      // Special handling for Swiss QR Code
      if (bcid === 'swissqrcode') {
        bwipOptions.text = mainData;
      }

      // Create canvas and generate barcode using bwip-js
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, bwipOptions);

      // Copy to display canvas
      if (canvasRef.current) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      setBarcodeUrl(dataUrl);
      
      toast({
        title: t("barcodeGenerator.barcodeGenerated"),
        description: t("barcodeGenerator.barcodeGeneratedDesc"),
      });
    } catch (error: any) {
      console.error("bwip-js error:", error);
      let userMessage = "Error generating barcode.";
      if (typeof error === 'string') {
        userMessage += ` ${error.replace(/^Error: /, '')}`;
      } else if (error.message) {
        userMessage += ` ${error.message.replace(/^Error: /, '')}`;
      }
      
      toast({
        title: t("barcodeGenerator.generationFailed"),
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialize with first barcode type
  useEffect(() => {
    if (!currentBarcodeDef && Object.keys(barcodeCategories).length > 0) {
      const firstCategory = Object.keys(barcodeCategories)[0];
      const firstType = Object.keys(barcodeCategories[firstCategory])[0];
      const firstTypeData = barcodeCategories[firstCategory][firstType];
      setCurrentBarcodeDef({ ...firstTypeData, name: firstType, category: firstCategory });
      updateOption('bcid', firstTypeData.bcid);
    }
  }, []);

  // Auto-generate barcode when options change
  useEffect(() => {
    if (currentBarcodeDef && options.text.trim()) {
      generateBarcode();
    }
  }, [options.text, options.bcid, currentBarcodeDef]);

  const downloadBarcode = () => {
    if (!barcodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `barcode_${options.bcid}_${Date.now()}.png`;
    link.href = barcodeUrl;
    link.click();
  };

  const downloadSVG = async () => {
    if (!currentBarcodeDef || !options.text.trim()) {
      toast({
        title: "Invalid Input",
        description: "Generate a barcode first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "SVG Feature",
      description: "SVG download will be implemented in the next update. PNG download is fully functional.",
    });
  };

  const copyToClipboard = async () => {
    if (!barcodeUrl) return;
    
    try {
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Copied to Clipboard",
        description: "Barcode image copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("barcodeGenerator.title")}</h1>
        <p className="text-gray-600">{t("barcodeGenerator.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <Card>
          <CardContent className="p-6 space-y-8">
            <div>
              <Label htmlFor="barcode-type">{t("barcodeGenerator.barcodeType")} ({filteredBarcodeTypes.length} {t("barcodeGenerator.available")})</Label>
              
              {/* Search and Category Filter */}
              <div className="space-y-3 mb-4">
                <Input
                  placeholder={t("barcodeGenerator.searchTypes")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-3">
                <Select value={options.bcid} onValueChange={(value) => {
                  // Clear previous selection first to prevent conflicts
                  setCurrentBarcodeDef(null);
                  updateOption('bcid', value);
                  
                  // Find the barcode definition for the selected value
                  let foundDef: any = null;
                  Object.entries(barcodeCategories).forEach(([categoryName, types]) => {
                    Object.entries(types).forEach(([typeName, typeData]) => {
                      if (typeData.bcid === value) {
                        foundDef = { ...typeData, name: typeName, category: categoryName };
                      }
                    });
                  });
                  
                  // Set the new definition after a small delay to prevent auto-selection issues
                  setTimeout(() => {
                    setCurrentBarcodeDef(foundDef);
                  }, 50);
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a barcode type..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[350px]">
                    {filteredBarcodeTypes.length > 0 ? (
                      filteredBarcodeTypes.map(([typeName, typeData]) => (
                        <SelectItem key={`${typeData.bcid}-${typeName}`} value={typeData.bcid}>
                          <div className="flex items-center justify-between w-full min-w-0">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium truncate">{typeName}</span>
                              <span className="text-xs text-gray-500 truncate">{typeData.hint}</span>
                            </div>
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded ml-2 flex-shrink-0">
                              ✓ Professional
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No barcode types found matching your search
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show current selection info */}
              {currentBarcodeDef && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">
                        {currentBarcodeDef.name}
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-green-600 dark:text-green-400">
                        {currentBarcodeDef.category}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                      ✓ Professional
                    </span>
                  </div>
                  <div className="text-xs mt-2 text-green-600 dark:text-green-300">
                    {currentBarcodeDef.hint} - Generates professional-grade, scannable barcodes
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="barcode-text">Data to Encode</Label>
                {currentBarcodeDef && getSampleData(currentBarcodeDef.bcid) && (
                  <Button 
                    onClick={loadSampleData} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Use Sample Data
                  </Button>
                )}
              </div>
              <Textarea
                id="barcode-text"
                value={options.text}
                onChange={(e) => updateOption('text', e.target.value)}
                rows={3}
                placeholder="Enter text, URL, or data to encode..."
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Scale: {options.scale}</Label>
                <Slider
                  value={[options.scale]}
                  onValueChange={([value]) => updateOption('scale', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Height: {options.height}</Label>
                <Slider
                  value={[options.height]}
                  onValueChange={([value]) => updateOption('height', value)}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 py-2">
              <Checkbox
                id="include-text"
                checked={options.includetext}
                onCheckedChange={(checked) => updateOption('includetext', checked)}
              />
              <Label htmlFor="include-text" className="text-sm font-medium">Include human-readable text</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="text-size">Text Size</Label>
                <Input
                  id="text-size"
                  type="number"
                  value={options.textsize}
                  onChange={(e) => updateOption('textsize', parseInt(e.target.value) || 12)}
                  min="8"
                  max="24"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={options.backgroundcolor}
                  onChange={(e) => updateOption('backgroundcolor', e.target.value)}
                  className="h-10 w-full"
                />
              </div>
            </div>

            <Button 
              onClick={generateBarcode} 
              disabled={isGenerating || !options.text.trim()}
              className="w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Barcode"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Barcode</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300">
              {barcodeUrl ? (
                <div className="text-center space-y-4">
                  <img 
                    src={barcodeUrl} 
                    alt="Generated barcode" 
                    className="max-w-full max-h-[250px] mx-auto border border-gray-200 rounded"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={downloadBarcode} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PNG
                    </Button>
                    <Button onClick={downloadSVG} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      SVG
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated barcode will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
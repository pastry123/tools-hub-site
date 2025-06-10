import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getToolById } from "@/lib/toolCategories";
import { useUserData } from "@/contexts/UserDataContext";
import { useEffect } from "react";
import QRGenerator from "@/components/tools/QRGenerator";
import BarcodeGenerator from "@/components/tools/BarcodeGenerator";
import PDFMerger from "@/components/tools/PDFMerger";
import PDFSplitter from "@/components/tools/PDFSplitter";
import PDFCompressor from "@/components/tools/PDFCompressor";
import PDFConverter from "@/components/tools/PDFConverter";
import PDFProtector from "@/components/tools/PDFProtector";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import ImageCompressor from "@/components/tools/ImageCompressor";
import WordCounter from "@/components/tools/WordCounter";
import UnitConverter from "@/components/tools/UnitConverter";
import BackgroundRemover from "@/components/tools/BackgroundRemover";
import ImageResizer from "@/components/tools/ImageResizer";
import ImageConverter from "@/components/tools/ImageConverter";
import ImageCropper from "@/components/tools/ImageCropper";
import FaviconGenerator from "@/components/tools/FaviconGenerator";
import ColorAnalyzer from "@/components/tools/ColorAnalyzer";

import AddWatermark from "@/components/tools/AddWatermark";
import ImageWatermark from "@/components/tools/ImageWatermark";
import CaseConverter from "@/components/tools/CaseConverter";
import LoremGenerator from "@/components/tools/LoremGenerator";
import TextReverser from "@/components/tools/TextReverser";
import HashGenerator from "@/components/tools/HashGenerator";
import CodeFormatter from "@/components/tools/CodeFormatter";
import TextToSlug from "@/components/tools/TextToSlug";
import ColorConverter from "@/components/tools/ColorConverter";
import CurrencyConverter from "@/components/tools/CurrencyConverter";
import UUIDGenerator from "@/components/tools/UUIDGenerator";
import TimestampConverter from "@/components/tools/TimestampConverter";
import Base64Encoder from "@/components/tools/Base64Encoder";
import URLEncoder from "@/components/tools/URLEncoder";
import JSONFormatter from "@/components/tools/JSONFormatter";
import CSVToJSON from "@/components/tools/CSVToJSON";
import MarkdownToHTML from "@/components/tools/MarkdownToHTML";
import PlaceholderGenerator from "@/components/tools/PlaceholderGenerator";
import CSSGradientGenerator from "@/components/tools/CSSGradientGenerator";
import BoxShadowGenerator from "@/components/tools/BoxShadowGenerator";
import MetaTagGenerator from "@/components/tools/MetaTagGenerator";
import RegexTester from "@/components/tools/RegexTester";
import APITester from "@/components/tools/APITester";
import JWTDecoder from "@/components/tools/JWTDecoder";
import HTMLEncoder from "@/components/tools/HTMLEncoder";
import CSSMinifier from "@/components/tools/CSSMinifier";
import JSMinifier from "@/components/tools/JSMinifier";
import LoremPicsum from "@/components/tools/LoremPicsum";
import TextDiffTool from "@/components/tools/TextDiffTool";
import PDFRotate from "@/components/tools/PDFRotate";
import PDFWatermark from "@/components/tools/PDFWatermark";
import PDFUnlocker from "@/components/tools/PDFUnlocker";
import ImageToText from "@/components/tools/ImageToText";
import BarcodeScanner from "@/components/tools/BarcodeScanner";
import InvoiceGenerator from "@/components/tools/InvoiceGenerator";
import SignatureGenerator from "@/components/tools/SignatureGenerator";
import AdvancedESign from "@/components/tools/AdvancedESign";

import APIAccess from "@/components/tools/APIAccess";
import MobileAppPlan from "@/components/tools/MobileAppPlan";
import RFIDReader from "@/components/tools/RFIDReader";
import BulkBarcodeGenerator from "@/components/tools/BulkBarcodeGenerator";


import PDFPageNumbers from "@/components/tools/PDFPageNumbers";
import TimezoneConverter from "@/components/tools/TimezoneConverter";
import DNSLookup from "@/components/tools/DNSLookup";
import WebsiteScreenshot from "@/components/tools/WebsiteScreenshot";
import VideoConverter from "@/components/tools/VideoConverter";
import VideoToGifConverter from "@/components/tools/VideoToGifConverter";
import AudioConverter from "@/components/tools/AudioConverter";
import { Shield, Smartphone, Download } from "lucide-react";

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const toolData = getToolById(toolId!);
  const { addToRecent, addToFavorites, removeFromFavorites, isFavorite } = useUserData();

  useEffect(() => {
    if (toolId) {
      addToRecent(toolId);
    }
  }, [toolId, addToRecent]);

  if (!toolData) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tool Not Found</h2>
        </div>
      </main>
    );
  }

  const { tool, category } = toolData;

  const breadcrumbItems = [
    { name: category.title, href: `/category/${category.id}` },
    { name: tool.name }
  ];

  const renderTool = () => {
    // Handle all barcode-related tools
    const barcodeTools = [
      'qr-generator', 'barcode-generator', 'code128-generator', 'ean13-generator', 'datamatrix-generator', 'code-128', 'code-11', 'code-2of5', 'code-39', 'code-39-ascii', 
      'code-93', 'flattermarken', 'gs1-128', 'msi', 'pharmacode-one', 'pharmacode-two',
      'telepen-alpha', 'australia-post', 'daft', 'dpd-barcode', 'japanese-postal',
      'kix', 'korean-postal', 'planet-12', 'royal-mail-4state', 'royal-mail-mailmark-4state',
      'royal-mail-mailmark-2d', 'usps-postnet-5', 'usps-postnet-9', 'usps-postnet-11',
      'usps-im-package', 'upu-s10', 'gs1-databar-stacked', 'gs1-databar-stacked-omni',
      'gs1-databar-limited', 'gs1-databar-expanded', 'gs1-databar-expanded-stacked',
      'gs1-128-composite', 'gs1-databar-composite', 'ean-8', 'ean-13', 'ean-14',
      'ean-8-composite', 'ean-13-composite', 'upc-a', 'upc-e', 'upc-a-composite',
      'upc-e-composite', 'qr-code', 'qr-code-mobile', 'data-matrix', 'aztec',
      'codablock-f', 'maxicode', 'micropdf417', 'pdf417', 'micro-qr', 'han-xin',
      'dotcode', 'ntin-code', 'ppn-code', 'gs1-qr', 'gs1-datamatrix', 'gs1-digital-link-qr',
      'gs1-digital-link-dm', 'epc-qr-v2', 'swiss-qr-v1', 'swiss-qr-v2-no-ref',
      'swiss-qr-v2-creditor', 'swiss-qr-v2-qr-ref', 'zatca-qr', 'mobile-qr',
      'mobile-datamatrix', 'mobile-aztec', 'code32', 'hibc-lic-128', 'hibc-lic-39',
      'hibc-lic-aztec', 'hibc-pas-qr', 'ntin-datamatrix', 'pzn7', 'pzn8',
      'isbn-13', 'isbn-13-5', 'ismn', 'issn', 'issn-2', 'qr-vcard', 'datamatrix-vcard',
      'qr-mecard', 'datamatrix-mecard', 'event-qr', 'event-datamatrix', 'wifi-qr',
      'wifi-datamatrix'
    ];

    if (barcodeTools.includes(tool.id)) {
      return <BarcodeGenerator />;
    }

    switch (tool.id) {
      case 'barcode-scanner':
        return <BarcodeScanner />;
      case 'pdf-merge':
        return <PDFMerger />;
      case 'pdf-split':
        return <PDFSplitter />;
      case 'pdf-compress':
        return <PDFCompressor />;
      case 'pdf-to-text':
      case 'images-to-pdf':
      case 'pdf-to-images':
        return <PDFConverter />;
      case 'pdf-watermark':
        return <PDFWatermark />;
      case 'pdf-rotate':
        return <PDFRotate />;
      case 'pdf-protect':
      case 'pdf-protector':
        return <PDFProtector />;
      case 'pdf-unlock':
        return <PDFUnlocker />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'text-diff':
        return <TextDiffTool />;
      case 'image-compressor':
        return <ImageCompressor />;
      case 'image-watermark':
        return <ImageWatermark />;
      case 'image-to-text':
        return <ImageToText />;
      case 'background-remover':
        return <BackgroundRemover />;
      case 'image-resize':
        return <ImageResizer />;
      case 'image-format-converter':
        return <ImageConverter />;
      case 'image-crop':
        return <ImageCropper />;
      case 'word-counter':
        return <WordCounter />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'favicon-generator':
        return <FaviconGenerator />;
      case 'color-palette-generator':
        return <ColorAnalyzer />;
      case 'add-watermark':
      case 'image-watermark':
        return <AddWatermark />;
      case 'case-converter':
        return <CaseConverter />;
      case 'lorem-generator':
        return <LoremGenerator />;
      case 'text-reverser':
        return <TextReverser />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'code-formatter':
        return <CodeFormatter />;
      case 'text-to-slug':
        return <TextToSlug />;
      case 'dummy-text':
        return <LoremGenerator />;
      case 'color-converter':
        return <ColorConverter />;
      case 'currency-converter':
        return <CurrencyConverter />;
      case 'timestamp-converter':
        return <TimestampConverter />;
      case 'base64-encoder':
        return <Base64Encoder />;
      case 'url-encoder':
        return <URLEncoder />;
      case 'json-formatter':
        return <JSONFormatter />;
      case 'csv-to-json':
        return <CSVToJSON />;
      case 'markdown-to-html':
        return <MarkdownToHTML />;
      case 'uuid-generator':
        return <UUIDGenerator />;
      case 'placeholder-generator':
        return <PlaceholderGenerator />;
      case 'css-gradient':
        return <CSSGradientGenerator />;
      case 'box-shadow':
        return <BoxShadowGenerator />;
      case 'meta-tag-generator':
        return <MetaTagGenerator />;
      case 'regex-tester':
        return <RegexTester />;
      case 'api-tester':
        return <APITester />;
      case 'jwt-decoder':
        return <JWTDecoder />;
      case 'html-encoder':
        return <HTMLEncoder />;
      case 'css-minifier':
        return <CSSMinifier />;
      case 'js-minifier':
        return <JSMinifier />;
      case 'lorem-picsum':
        return <LoremPicsum />;
      case 'meta-tags':
      case 'meta-tag-generator':
        return <MetaTagGenerator />;
      case 'css-gradient':
      case 'gradient-generator':
        return <CSSGradientGenerator />;
      case 'invoice-generator':
        return <InvoiceGenerator />;
      case 'signature-generator':
        return <SignatureGenerator />;

      case 'pdf-page-numbers':
        return <PDFPageNumbers />;
      case 'pdf-esign':
        return <AdvancedESign />;

      case 'timezone-converter':
        return <TimezoneConverter />;
      case 'dns-lookup':
        return <DNSLookup />;
      case 'website-screenshot':
        return <WebsiteScreenshot />;
      case 'api-access':
        return <APIAccess />;
      case 'mobile-app-plan':
        return <MobileAppPlan />;
      case 'rfid-reader':
        return <RFIDReader />;
      case 'bulk-barcode-generator':
        return <BulkBarcodeGenerator />;
      case 'video-to-gif':
        return <VideoToGifConverter />;
      case 'audio-converter':
        return <AudioConverter />;

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <i className={`fas ${tool.icon} text-${category.color}-500 text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Tool Coming Soon</h3>
              <p className="text-slate-600 dark:text-gray-300">{tool.description}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Tool Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-2xl flex items-center justify-center`}>
              <i className={`fas ${tool.icon} text-${category.color}-500 text-2xl`}></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{tool.name}</h1>
              <p className="text-slate-600 dark:text-gray-300">{tool.description}</p>
            </div>
          </div>
          <Button
            variant={isFavorite(toolId!) ? "default" : "outline"}
            size="lg"
            onClick={() => {
              if (isFavorite(toolId!)) {
                removeFromFavorites(toolId!);
              } else {
                addToFavorites(toolId!);
              }
            }}
            className="flex items-center gap-2"
          >
            <Heart className={`w-5 h-5 ${isFavorite(toolId!) ? 'fill-current' : ''}`} />
            {isFavorite(toolId!) ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
        </div>

        {/* Tool Component */}
        {renderTool()}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <Shield className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Secure & Private</h3>
            <p className="text-slate-600 text-sm">All processing happens in your browser. Your data never leaves your device.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Smartphone className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Mobile Optimized</h3>
            <p className="text-slate-600 text-sm">Works perfectly on all devices and screen sizes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Download className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Multiple Formats</h3>
            <p className="text-slate-600 text-sm">Download results in various formats for maximum compatibility.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

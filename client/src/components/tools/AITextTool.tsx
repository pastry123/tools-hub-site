import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, Sparkles, Copy, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

interface DetectionResult {
  isAI: boolean;
  confidence: number;
  indicators: string[];
  analysis: string;
}

interface HumanizedResult {
  humanizedText: string;
  changes: string[];
  readabilityScore: number;
}

export default function AITextTool() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<'detect' | 'humanize'>('detect');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [humanizedResult, setHumanizedResult] = useState<HumanizedResult | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const detectAIText = async () => {
    if (!inputText.trim()) {
      toast({
        title: t("aiTextTool.error"),
        description: t("aiTextTool.enterTextFirst"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDetectionResult(null);

    try {
      const response = await fetch('/api/ai-text-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect AI text');
      }

      const result = await response.json();
      setDetectionResult(result);

      toast({
        title: t("aiTextTool.detectionComplete"),
        description: t("aiTextTool.detectionCompleteDesc"),
      });
    } catch (error) {
      toast({
        title: t("aiTextTool.detectionFailed"),
        description: t("aiTextTool.detectionFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const humanizeText = async () => {
    if (!inputText.trim()) {
      toast({
        title: t("aiTextTool.error"),
        description: t("aiTextTool.enterTextFirst"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setHumanizedResult(null);

    try {
      const response = await fetch('/api/ai-text-humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to humanize text');
      }

      const result = await response.json();
      setHumanizedResult(result);

      toast({
        title: t("aiTextTool.humanizationComplete"),
        description: t("aiTextTool.humanizationCompleteDesc"),
      });
    } catch (error) {
      toast({
        title: t("aiTextTool.humanizationFailed"),
        description: t("aiTextTool.humanizationFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t("aiTextTool.copied"),
        description: t("aiTextTool.copiedDesc"),
      });
    } catch (error) {
      toast({
        title: t("aiTextTool.copyFailed"),
        description: t("aiTextTool.copyFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const resetTool = () => {
    setInputText("");
    setDetectionResult(null);
    setHumanizedResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t("aiTextTool.title")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("aiTextTool.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'detect' ? 'default' : 'outline'}
              onClick={() => setMode('detect')}
              className="flex-1"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {t("aiTextTool.aiDetector")}
            </Button>
            <Button
              variant={mode === 'humanize' ? 'default' : 'outline'}
              onClick={() => setMode('humanize')}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("aiTextTool.aiHumanizer")}
            </Button>
          </div>

          {/* Input Text Area */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("aiTextTool.inputText")}
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === 'detect' ? t("aiTextTool.detectPlaceholder") : t("aiTextTool.humanizePlaceholder")}
              className="min-h-[200px]"
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
              <span>{inputText.length}/5000 {t("aiTextTool.characters")}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetTool}
                disabled={!inputText && !detectionResult && !humanizedResult}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {t("aiTextTool.reset")}
              </Button>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={mode === 'detect' ? detectAIText : humanizeText}
            disabled={isProcessing || !inputText.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'detect' ? t("aiTextTool.detecting") : t("aiTextTool.humanizing")}
              </>
            ) : (
              <>
                {mode === 'detect' ? (
                  <AlertCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {mode === 'detect' ? t("aiTextTool.detectText") : t("aiTextTool.humanizeText")}
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={66} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {mode === 'detect' ? t("aiTextTool.analyzingText") : t("aiTextTool.processingText")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Detection Results */}
      {detectionResult && mode === 'detect' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t("aiTextTool.detectionResults")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {detectionResult.isAI ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t("aiTextTool.likelyAI")}
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t("aiTextTool.likelyHuman")}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("aiTextTool.confidence")}: {detectionResult.confidence}%
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t("aiTextTool.analysis")}</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {detectionResult.analysis}
              </p>
            </div>

            {detectionResult.indicators.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("aiTextTool.indicators")}</h4>
                <ul className="space-y-1">
                  {detectionResult.indicators.map((indicator, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Humanization Results */}
      {humanizedResult && mode === 'humanize' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t("aiTextTool.humanizedText")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {t("aiTextTool.readabilityScore")}: {humanizedResult.readabilityScore}/100
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(humanizedResult.humanizedText)}
              >
                <Copy className="w-4 h-4 mr-1" />
                {t("aiTextTool.copy")}
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t("aiTextTool.improvedText")}</h4>
              <div className="bg-muted p-4 rounded border">
                <p className="whitespace-pre-wrap">{humanizedResult.humanizedText}</p>
              </div>
            </div>

            {humanizedResult.changes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("aiTextTool.changesApplied")}</h4>
                <ul className="space-y-1">
                  {humanizedResult.changes.map((change, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
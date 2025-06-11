import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Copy, RotateCcw } from "lucide-react";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const calculateStats = (inputText: string) => {
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    
    // Words count
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    
    // Sentences count
    const sentences = inputText.trim() === '' ? 0 : inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Paragraphs count
    const paragraphs = inputText.trim() === '' ? 0 : inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime
    });
  };

  const clearText = () => {
    setText("");
    toast({
      title: t("wordCounter.clearText"),
      description: t("wordCounter.textCleared"),
    });
  };

  const copyStats = async () => {
    const statsText = `
${t("wordCounter.textStats")}:
${t("wordCounter.characters")}: ${stats.characters}
${t("wordCounter.charactersNoSpaces")}: ${stats.charactersNoSpaces}
${t("wordCounter.words")}: ${stats.words}
${t("wordCounter.sentences")}: ${stats.sentences}
${t("wordCounter.paragraphs")}: ${stats.paragraphs}
${t("wordCounter.readingTime")}: ${stats.readingTime}
    `.trim();

    try {
      await navigator.clipboard.writeText(statsText);
      toast({
        title: t("wordCounter.statsCopied"),
        description: t("wordCounter.statscopiedDesc"),
      });
    } catch (error) {
      toast({
        title: t("wordCounter.copyFailed"),
        description: t("wordCounter.copyFailedDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Text Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="text-input">{t("wordCounter.enterText")}</Label>
          <Textarea
            id="text-input"
            placeholder={t("wordCounter.enterText")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            className="resize-none"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={clearText} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("wordCounter.clearText")}
          </Button>
          <Button onClick={copyStats} variant="outline" className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            {t("wordCounter.copyStats")}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t("wordCounter.textStats")}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.characters.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.characters")}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.charactersNoSpaces.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.charactersNoSpaces")}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.words.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.words")}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.sentences.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.sentences")}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.paragraphs.toLocaleString()}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.paragraphs")}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.readingTime}</p>
                <p className="text-sm text-slate-600">{t("wordCounter.readingTime")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-slate-800 mb-3">{t("wordCounter.readingMetrics")}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>{t("wordCounter.avgWordsPerSentence")}:</span>
                <span className="font-medium">
                  {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("wordCounter.avgCharsPerWord")}:</span>
                <span className="font-medium">
                  {stats.words > 0 ? Math.round(stats.charactersNoSpaces / stats.words) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("wordCounter.readingLevel")}:</span>
                <span className="font-medium">
                  {stats.words > 0 && stats.sentences > 0 ? 
                    (stats.words / stats.sentences < 15 ? t("wordCounter.easy") : 
                     stats.words / stats.sentences < 20 ? t("wordCounter.medium") : t("wordCounter.hard")) : 'N/A'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

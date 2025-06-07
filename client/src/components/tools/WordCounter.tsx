import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
      title: "Text Cleared",
      description: "The text area has been cleared.",
    });
  };

  const copyStats = async () => {
    const statsText = `
Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading time: ${stats.readingTime} minute(s)
    `.trim();

    try {
      await navigator.clipboard.writeText(statsText);
      toast({
        title: "Stats Copied",
        description: "Text statistics copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy statistics to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Text Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="text-input">Enter or paste your text</Label>
          <Textarea
            id="text-input"
            placeholder="Type or paste your text here to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            className="resize-none"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={clearText} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Text
          </Button>
          <Button onClick={copyStats} variant="outline" className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy Stats
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Text Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.characters.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Characters</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.charactersNoSpaces.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Characters (no spaces)</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.words.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Words</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.sentences.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Sentences</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.paragraphs.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Paragraphs</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.readingTime}</p>
                <p className="text-sm text-slate-600">Reading time (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-slate-800 mb-3">Reading Metrics</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Average words per sentence:</span>
                <span className="font-medium">
                  {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average characters per word:</span>
                <span className="font-medium">
                  {stats.words > 0 ? Math.round(stats.charactersNoSpaces / stats.words) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reading level:</span>
                <span className="font-medium">
                  {stats.words > 0 && stats.sentences > 0 ? 
                    (stats.words / stats.sentences < 15 ? 'Easy' : 
                     stats.words / stats.sentences < 20 ? 'Medium' : 'Hard') : 'N/A'
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

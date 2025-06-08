import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DummyTextGenerator() {
  const [textType, setTextType] = useState("lorem");
  const [count, setCount] = useState(5);
  const [countType, setCountType] = useState("paragraphs");
  const [generatedText, setGeneratedText] = useState("");
  const { toast } = useToast();

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];

  const randomWords = [
    "apple", "banana", "computer", "mountain", "ocean", "forest", "building",
    "sunshine", "rainbow", "butterfly", "adventure", "journey", "discovery",
    "innovation", "creativity", "inspiration", "freedom", "harmony", "balance",
    "wisdom", "knowledge", "experience", "growth", "development", "progress",
    "success", "achievement", "excellence", "quality", "performance", "efficiency"
  ];

  const generateSentence = (words: string[], minWords = 8, maxWords = 20) => {
    const sentenceLength = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const sentence = [];
    
    for (let i = 0; i < sentenceLength; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    
    return sentence.join(" ") + ".";
  };

  const generateParagraph = (words: string[], sentences = 5) => {
    const paragraph = [];
    for (let i = 0; i < sentences; i++) {
      paragraph.push(generateSentence(words));
    }
    return paragraph.join(" ");
  };

  const generateText = () => {
    const words = textType === "lorem" ? loremWords : randomWords;
    let result = "";

    switch (countType) {
      case "words":
        const wordArray = [];
        for (let i = 0; i < count; i++) {
          wordArray.push(words[Math.floor(Math.random() * words.length)]);
        }
        result = wordArray.join(" ");
        break;

      case "sentences":
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence(words));
        }
        result = sentences.join(" ");
        break;

      case "paragraphs":
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph(words));
        }
        result = paragraphs.join("\n\n");
        break;
    }

    setGeneratedText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dummy Text Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Type</label>
              <Select value={textType} onValueChange={setTextType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lorem">Lorem Ipsum</SelectItem>
                  <SelectItem value="random">Random Words</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Count</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Generate</label>
              <Select value={countType} onValueChange={setCountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateText} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Text
          </Button>

          {generatedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Generated Text</label>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-64 font-mono text-sm"
              />
              <div className="text-xs text-gray-500">
                Words: {generatedText.split(/\s+/).length} | 
                Characters: {generatedText.length} | 
                Characters (no spaces): {generatedText.replace(/\s/g, '').length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
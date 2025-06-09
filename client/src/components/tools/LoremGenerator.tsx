import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoremGenerator() {
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
    "apple", "banana", "cherry", "dragon", "elephant", "falcon", "galaxy", "harmony",
    "island", "jungle", "kitten", "lemon", "mountain", "nectar", "ocean", "penguin",
    "quartz", "rainbow", "sunset", "thunder", "umbrella", "violet", "whisper", "xylophone",
    "yellow", "zebra", "adventure", "butterfly", "crystal", "diamond", "emerald", "forest",
    "golden", "horizon", "infinity", "journey", "kingdom", "lighthouse", "miracle", "notebook"
  ];

  const generateLoremSentence = (minWords = 4, maxWords = 18): string => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const sentence = [];
    
    for (let i = 0; i < wordCount; i++) {
      const word = loremWords[Math.floor(Math.random() * loremWords.length)];
      sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    
    return sentence.join(' ') + '.';
  };

  const generateRandomSentence = (minWords = 4, maxWords = 18): string => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const sentence = [];
    
    for (let i = 0; i < wordCount; i++) {
      const word = randomWords[Math.floor(Math.random() * randomWords.length)];
      sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    
    return sentence.join(' ') + '.';
  };

  const generateParagraph = (sentenceCount = 4): string => {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      if (textType === "lorem") {
        sentences.push(generateLoremSentence());
      } else {
        sentences.push(generateRandomSentence());
      }
    }
    return sentences.join(' ');
  };

  const generateText = () => {
    let result = "";
    
    switch (countType) {
      case "words":
        const words = [];
        const wordList = textType === "lorem" ? loremWords : randomWords;
        for (let i = 0; i < count; i++) {
          words.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
        result = words.join(' ') + '.';
        break;
        
      case "sentences":
        const sentences = [];
        for (let i = 0; i < count; i++) {
          if (textType === "lorem") {
            sentences.push(generateLoremSentence());
          } else {
            sentences.push(generateRandomSentence());
          }
        }
        result = sentences.join(' ');
        break;
        
      case "paragraphs":
      default:
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;
    }
    
    setGeneratedText(result);
    
    toast({
      title: "Text Generated",
      description: `Generated ${count} ${countType} successfully.`
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied to Clipboard",
      description: "Generated text has been copied to your clipboard."
    });
  };

  const clearText = () => {
    setGeneratedText("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lorem Ipsum Generator
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
          
          <div className="flex gap-3">
            <Button onClick={generateText} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Text
            </Button>
            
            {generatedText && (
              <>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={clearText} variant="outline">
                  Clear
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedText && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              rows={12}
              className="w-full"
              placeholder="Generated text will appear here..."
            />
            
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Character count:</strong> {generatedText.length}</p>
              <p><strong>Word count:</strong> {generatedText.split(/\s+/).filter(word => word.length > 0).length}</p>
              <p><strong>Paragraph count:</strong> {generatedText.split('\n\n').length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
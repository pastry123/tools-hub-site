import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AITextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState("general");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const { toast } = useToast();

  const contentTypes = [
    { value: "general", label: "General Text" },
    { value: "email", label: "Email" },
    { value: "blog-post", label: "Blog Post" },
    { value: "social-media", label: "Social Media Post" },
    { value: "product-description", label: "Product Description" },
    { value: "creative-story", label: "Creative Story" },
    { value: "business-proposal", label: "Business Proposal" },
    { value: "article", label: "Article" },
    { value: "press-release", label: "Press Release" },
    { value: "marketing-copy", label: "Marketing Copy" }
  ];

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "creative", label: "Creative" },
    { value: "persuasive", label: "Persuasive" },
    { value: "informative", label: "Informative" },
    { value: "conversational", label: "Conversational" }
  ];

  const lengthOptions = [
    { value: "short", label: "Short (1-2 paragraphs)" },
    { value: "medium", label: "Medium (3-5 paragraphs)" },
    { value: "long", label: "Long (6+ paragraphs)" }
  ];

  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate text",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          contentType,
          tone,
          length
        })
      });

      const data = await response.json();
      
      if (response.ok && data.generatedText) {
        setGeneratedText(data.generatedText);
        toast({
          title: "Success",
          description: "Text generated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate text",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedText) return;
    
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const downloadText = () => {
    if (!generatedText) return;
    
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-text.txt';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Text file downloaded successfully",
    });
  };

  const clearAll = () => {
    setPrompt("");
    setGeneratedText("");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Text Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((toneOption) => (
                    <SelectItem key={toneOption.value} value={toneOption.value}>
                      {toneOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Length</label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengthOptions.map((lengthOption) => (
                    <SelectItem key={lengthOption.value} value={lengthOption.value}>
                      {lengthOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... (e.g., 'Write a blog post about sustainable energy solutions')"
              className="min-h-[120px]"
            />
          </div>

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button 
              onClick={generateText} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Text"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          {/* Generated Text */}
          {generatedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Text</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {contentTypes.find(t => t.value === contentType)?.label}
                  </Badge>
                  <Badge variant="outline">
                    {toneOptions.find(t => t.value === tone)?.label}
                  </Badge>
                </div>
              </div>
              
              <div className="relative">
                <Textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Generated text will appear here..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </Button>
                
                <Button 
                  onClick={downloadText}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Tips for Better Results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific with your prompt - include context, audience, and purpose</li>
              <li>• Choose the appropriate content type and tone for your needs</li>
              <li>• For longer content, provide detailed requirements and structure</li>
              <li>• You can edit the generated text directly in the output area</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
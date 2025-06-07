import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tags, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [viewport, setViewport] = useState('width=device-width, initial-scale=1.0');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/generator/meta-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          keywords,
          author: author || undefined,
          viewport: viewport || undefined,
          ogTitle: ogTitle || undefined,
          ogDescription: ogDescription || undefined,
          ogImage: ogImage || undefined,
          twitterCard: twitterCard || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate meta tags');
      }

      const data = await response.json();
      setResult(data.result);

      toast({
        title: "Success",
        description: "Meta tags generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate meta tags",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied",
      description: "Meta tags copied to clipboard"
    });
  };

  const downloadHTML = () => {
    const blob = new Blob([result], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Meta tags file downloaded successfully"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Meta Tag Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your Page Title"
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your Name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your page content..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div>
            <Label htmlFor="viewport">Viewport</Label>
            <Input
              id="viewport"
              value={viewport}
              onChange={(e) => setViewport(e.target.value)}
              placeholder="width=device-width, initial-scale=1.0"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Open Graph Tags</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Open Graph title (defaults to page title)"
                />
              </div>
              <div>
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <Input
                  id="twitterCard"
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  placeholder="summary_large_image"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ogDescription">OG Description</Label>
              <Textarea
                id="ogDescription"
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder="Open Graph description (defaults to meta description)"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="ogImage">OG Image URL</Label>
              <Input
                id="ogImage"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Generating...' : 'Generate Meta Tags'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Generated Meta Tags</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadHTML}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={result}
                readOnly
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
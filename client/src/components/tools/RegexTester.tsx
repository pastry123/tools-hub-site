import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Copy, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTest = () => {
    if (!pattern.trim()) {
      toast({
        title: "Error",
        description: "Please enter a regex pattern",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;
      let matchIndex = 0;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          matchIndex++;
          if (matchIndex > 1000) break; // Prevent infinite loops
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setResult({
        matches,
        isValid: true,
        flags,
        totalMatches: matches.length
      });

      toast({
        title: "Success",
        description: `Found ${matches.length} matches`
      });
    } catch (error) {
      setResult({
        matches: [],
        isValid: false,
        flags,
        totalMatches: 0,
        error: error instanceof Error ? error.message : 'Invalid regex pattern'
      });
      
      toast({
        title: "Error",
        description: "Invalid regex pattern",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Regex Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="pattern">Regular Expression Pattern</Label>
            <Input
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter your regex pattern (without delimiters)"
              className="font-mono"
            />
          </div>

          <div>
            <Label>Flags</Label>
            <div className="flex gap-4 mt-2">
              {[
                { flag: 'g', label: 'Global' },
                { flag: 'i', label: 'Case Insensitive' },
                { flag: 'm', label: 'Multiline' },
                { flag: 's', label: 'Dot All' },
                { flag: 'u', label: 'Unicode' },
                { flag: 'y', label: 'Sticky' }
              ].map(({ flag, label }) => (
                <div key={flag} className="flex items-center space-x-2">
                  <Checkbox
                    id={flag}
                    checked={flags.includes(flag)}
                    onCheckedChange={() => toggleFlag(flag)}
                  />
                  <Label htmlFor={flag} className="text-sm">{label} ({flag})</Label>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Selected flags: /{pattern}/{flags}
            </div>
          </div>

          <div>
            <Label htmlFor="testString">Test String</Label>
            <Textarea
              id="testString"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter the text to test against your regex..."
              rows={6}
            />
          </div>

          <Button onClick={handleTest} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Testing...' : 'Test Regex'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {result.isValid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span>Valid Regex</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="w-5 h-5" />
                      <span>Invalid Regex</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.totalMatches} matches found
                </div>
              </div>

              {result.matches.length > 0 && (
                <div>
                  <Label>Matches</Label>
                  <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                    {result.matches.map((match: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-mono text-sm break-all">{match.match}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Position: {match.index}
                              {match.groups && match.groups.length > 0 && (
                                <span className="ml-4">Groups: {match.groups.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard(match.match)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.totalMatches === 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    No matches found for the given pattern.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
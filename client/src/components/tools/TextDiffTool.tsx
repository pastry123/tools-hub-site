import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, GitBranch } from "lucide-react";

export default function TextDiffTool() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState<string[]>([]);

  const calculateDiff = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: string[] = [];
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        result.push(`  ${line1}`);
      } else if (line1 && !line2) {
        result.push(`- ${line1}`);
      } else if (!line1 && line2) {
        result.push(`+ ${line2}`);
      } else {
        result.push(`- ${line1}`);
        result.push(`+ ${line2}`);
      }
    }
    
    setDiffResult(result);
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setDiffResult([]);
  };

  const copyDiff = () => {
    navigator.clipboard.writeText(diffResult.join('\n'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Text Diff Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Original Text</label>
              <Textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Enter your original text here..."
                className="min-h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Modified Text</label>
              <Textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Enter your modified text here..."
                className="min-h-32"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={calculateDiff} disabled={!text1 || !text2}>
              <FileText className="w-4 h-4 mr-2" />
              Compare Texts
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {diffResult.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Diff Result</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {diffResult.filter(line => line.startsWith('+')).length} additions
              </Badge>
              <Badge variant="destructive">
                {diffResult.filter(line => line.startsWith('-')).length} deletions
              </Badge>
              <Button size="sm" variant="outline" onClick={copyDiff}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {diffResult.map((line, index) => (
                <div
                  key={index}
                  className={`${
                    line.startsWith('+')
                      ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                      : line.startsWith('-')
                      ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'text-slate-600 dark:text-slate-400'
                  } px-2 py-1`}
                >
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
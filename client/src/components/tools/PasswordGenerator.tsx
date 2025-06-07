import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Key, Copy, RefreshCw } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("");
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      toast({
        title: "No Character Types Selected",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(newPassword);
    calculateStrength(newPassword);
    
    toast({
      title: "Password Generated",
      description: "Your new password has been generated successfully!",
    });
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    
    if (includeUppercase) score += 25;
    if (includeLowercase) score += 25;
    if (includeNumbers) score += 25;
    if (includeSymbols) score += 25;
    
    if (pwd.length >= 12) score += 25;
    if (pwd.length >= 16) score += 25;
    
    score = Math.min(100, score);
    setStrength(score);
    
    if (score < 50) {
      setStrengthText("Weak password");
    } else if (score < 75) {
      setStrengthText("Medium strength");
    } else {
      setStrengthText("Strong password");
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        toast({
          title: "Copied to Clipboard",
          description: "Password copied to clipboard successfully!",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy password to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (password) {
      calculateStrength(password);
    }
  }, [includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const getStrengthColor = () => {
    if (strength < 50) return "bg-red-600";
    if (strength < 75) return "bg-yellow-600";
    return "bg-green-600";
  };

  const getStrengthTextColor = () => {
    if (strength < 50) return "text-red-700";
    if (strength < 75) return "text-yellow-700";
    return "text-green-700";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings */}
      <div className="space-y-6">
        <div>
          <Label>Password Length: {length[0]}</Label>
          <Slider
            value={length}
            onValueChange={setLength}
            max={128}
            min={4}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-4">
          <Label>Character Types</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
              />
              <Label htmlFor="uppercase">Include Uppercase Letters (A-Z)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
              />
              <Label htmlFor="lowercase">Include Lowercase Letters (a-z)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              />
              <Label htmlFor="numbers">Include Numbers (0-9)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
              />
              <Label htmlFor="symbols">Include Symbols (!@#$%^&*)</Label>
            </div>
          </div>
        </div>

        <Button onClick={generatePassword} className="w-full primary-button">
          <Key className="w-4 h-4 mr-2" />
          Generate Password
        </Button>
      </div>

      {/* Generated Password */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Label>Generated Password</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={password}
                readOnly
                placeholder="Click generate to create password"
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!password}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {password && (
          <Card>
            <CardContent className="p-6">
              <Label className="mb-2 block">Password Strength</Label>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${strength}%` }}
                ></div>
              </div>
              <p className={`text-sm font-medium ${getStrengthTextColor()}`}>
                {strengthText}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-slate-800 mb-3">Password Tips</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Use at least 12 characters for better security</li>
              <li>• Include a mix of character types</li>
              <li>• Avoid using personal information</li>
              <li>• Use different passwords for different accounts</li>
              <li>• Consider using a password manager</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

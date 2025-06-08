import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Server, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
  priority?: number;
}

interface WhoisData {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  nameServers: string[];
  status: string[];
  contacts: {
    registrant: any;
    admin: any;
    tech: any;
  };
}

export default function DNSLookup() {
  const [domain, setDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<Record<string, DNSRecord[]>>({});
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA', 'PTR'];

  const performDNSLookup = async () => {
    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDnsRecords({});
    setWhoisData(null);

    try {
      const response = await fetch('/api/dns/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setDnsRecords(data.dns || {});
        setWhoisData(data.whois || null);
        toast({
          title: "Success",
          description: "DNS lookup completed successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'DNS lookup failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform DNS lookup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            DNS Lookup / Whois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain name (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performDNSLookup()}
              className="flex-1"
            />
            <Button onClick={performDNSLookup} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Looking up..." : "Lookup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.keys(dnsRecords).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              DNS Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordTypes.map(type => {
                const records = dnsRecords[type];
                if (!records || records.length === 0) return null;

                return (
                  <div key={type} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{type}</Badge>
                      <span className="text-sm text-gray-600">
                        {records.length} record{records.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {records.map((record, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded font-mono text-sm">
                          <div className="break-all">{record.value}</div>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            {record.ttl && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                TTL: {record.ttl}s
                              </span>
                            )}
                            {record.priority && (
                              <span>Priority: {record.priority}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {whoisData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Whois Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Domain Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domain:</span>
                      <span className="font-mono">{whoisData.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registrar:</span>
                      <span>{whoisData.registrar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registered:</span>
                      <span>{formatDate(whoisData.registrationDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span>{formatDate(whoisData.expirationDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex flex-wrap gap-1">
                    {whoisData.status.map((status, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Name Servers</h4>
                <div className="space-y-1">
                  {whoisData.nameServers.map((ns, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-sm">
                      {ns}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Performing DNS lookup and whois query...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
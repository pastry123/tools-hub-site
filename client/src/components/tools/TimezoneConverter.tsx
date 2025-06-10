import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, X } from 'lucide-react';

const timezones = [
  { value: 'UTC', label: 'UTC', name: 'Coordinated Universal Time', offset: 0 },
  { value: 'America/New_York', label: 'New York', name: 'Eastern Time', offset: -5 },
  { value: 'America/Los_Angeles', label: 'Los Angeles', name: 'Pacific Time', offset: -8 },
  { value: 'Europe/London', label: 'London', name: 'Greenwich Mean Time', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris', name: 'Central European Time', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tokyo', name: 'Japan Standard Time', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Shanghai', name: 'China Standard Time', offset: 8 },
  { value: 'Australia/Sydney', label: 'Sydney', name: 'Australian Eastern Time', offset: 10 },
  { value: 'America/Chicago', label: 'Chicago', name: 'Central Time', offset: -6 },
  { value: 'Asia/Kolkata', label: 'Mumbai', name: 'India Standard Time', offset: 5.5 },
  { value: 'Europe/Berlin', label: 'Berlin', name: 'Central European Time', offset: 1 },
  { value: 'America/Denver', label: 'Denver', name: 'Mountain Time', offset: -7 },
  { value: 'Asia/Dubai', label: 'Dubai', name: 'Gulf Standard Time', offset: 4 },
  { value: 'Asia/Singapore', label: 'Singapore', name: 'Singapore Standard Time', offset: 8 },
  { value: 'America/Sao_Paulo', label: 'São Paulo', name: 'Brasília Time', offset: -3 },
];

export default function TimezoneConverter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState(['America/New_York', 'Europe/London']);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addZone = (zoneValue: string) => {
    if (!selectedZones.includes(zoneValue) && selectedZones.length < 6) {
      setSelectedZones([...selectedZones, zoneValue]);
    }
  };

  const removeZone = (zoneValue: string) => {
    if (selectedZones.length > 1) {
      setSelectedZones(selectedZones.filter(zone => zone !== zoneValue));
    }
  };

  const getZoneTime = (timezone: string) => {
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getZoneDate = (timezone: string) => {
    return new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimezoneInfo = (timezone: string) => {
    return timezones.find(tz => tz.value === timezone);
  };

  const availableZones = timezones.filter(tz => !selectedZones.includes(tz.value));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Zone Converter
          </CardTitle>
          <div className="text-center text-xl font-mono text-muted-foreground">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zone Selection */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Add Time Zone:</Label>
            <Select onValueChange={addZone}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a timezone to add" />
              </SelectTrigger>
              <SelectContent>
                {availableZones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label} ({tz.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Zone Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedZones.map((zone) => {
              const zoneInfo = getTimezoneInfo(zone);
              const time = getZoneTime(zone);
              const date = getZoneDate(zone);
              
              return (
                <Card key={zone} className="p-4 relative">
                  {selectedZones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeZone(zone)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{zoneInfo?.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {zoneInfo?.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold">
                        {time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {date}
                      </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      UTC{zoneInfo?.offset === 0 ? '' : zoneInfo?.offset && zoneInfo.offset > 0 ? `+${zoneInfo.offset}` : zoneInfo?.offset}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedZones.length < 6 && availableZones.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You can add up to 6 time zones for comparison
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
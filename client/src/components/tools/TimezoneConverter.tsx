import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Clock, Plus, Trash2 } from "lucide-react";

interface TimeZone {
  id: string;
  name: string;
  offset: string;
  time: string;
}

export default function TimezoneConverter() {
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  });
  
  const [timeZones, setTimeZones] = useState<TimeZone[]>([
    { id: 'UTC', name: 'UTC (Coordinated Universal Time)', offset: '+00:00', time: '' },
    { id: 'America/New_York', name: 'New York (EST/EDT)', offset: '', time: '' },
    { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)', offset: '', time: '' },
    { id: 'Europe/London', name: 'London (GMT/BST)', offset: '', time: '' },
    { id: 'Europe/Paris', name: 'Paris (CET/CEST)', offset: '', time: '' },
    { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: '', time: '' },
    { id: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: '', time: '' },
    { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)', offset: '', time: '' }
  ]);

  const [newTimeZone, setNewTimeZone] = useState('');

  const popularTimeZones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'America/Sao_Paulo',
    'America/Mexico_City',
    'Asia/Singapore',
    'Asia/Hong_Kong'
  ];

  const formatTimeZoneName = (tz: string) => {
    if (tz === 'UTC') return 'UTC (Coordinated Universal Time)';
    const parts = tz.split('/');
    if (parts.length === 2) {
      const city = parts[1].replace(/_/g, ' ');
      const region = parts[0];
      return `${city} (${region})`;
    }
    return tz.replace(/_/g, ' ');
  };

  const convertTime = () => {
    if (!selectedDateTime) return;

    const inputDate = new Date(selectedDateTime);
    
    const updatedTimeZones = timeZones.map(tz => {
      try {
        const convertedTime = new Date(inputDate.toLocaleString("en-US", {timeZone: tz.id}));
        const utcTime = new Date(inputDate.getTime() + inputDate.getTimezoneOffset() * 60000);
        const targetTime = new Date(utcTime.toLocaleString("en-US", {timeZone: tz.id}));
        
        const timeString = targetTime.toLocaleString('en-US', {
          timeZone: tz.id,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        // Calculate offset
        const now = new Date();
        const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        const targetNow = new Date(utcNow.toLocaleString("en-US", {timeZone: tz.id}));
        const offsetMinutes = (targetNow.getTime() - utcNow.getTime()) / (1000 * 60);
        const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
        const offsetMins = Math.abs(offsetMinutes) % 60;
        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const offset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

        return {
          ...tz,
          time: timeString,
          offset: offset
        };
      } catch (error) {
        return {
          ...tz,
          time: 'Invalid timezone',
          offset: 'N/A'
        };
      }
    });

    setTimeZones(updatedTimeZones);
  };

  const addTimeZone = () => {
    if (!newTimeZone || timeZones.some(tz => tz.id === newTimeZone)) return;

    const newTz: TimeZone = {
      id: newTimeZone,
      name: formatTimeZoneName(newTimeZone),
      offset: '',
      time: ''
    };

    setTimeZones([...timeZones, newTz]);
    setNewTimeZone('');
  };

  const removeTimeZone = (id: string) => {
    setTimeZones(timeZones.filter(tz => tz.id !== id));
  };

  useEffect(() => {
    convertTime();
  }, [selectedDateTime]);

  useEffect(() => {
    // Update times every minute
    const interval = setInterval(() => {
      if (selectedDateTime) {
        convertTime();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDateTime, timeZones]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Time Zone Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Date & Time
            </label>
            <Input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Select value={newTimeZone} onValueChange={setNewTimeZone}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add a timezone..." />
              </SelectTrigger>
              <SelectContent>
                {popularTimeZones
                  .filter(tz => !timeZones.some(existing => existing.id === tz))
                  .map(tz => (
                    <SelectItem key={tz} value={tz}>
                      {formatTimeZoneName(tz)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={addTimeZone} disabled={!newTimeZone}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {timeZones.map((tz) => (
          <Card key={tz.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <h3 className="font-medium">{tz.name}</h3>
                      <p className="text-sm text-gray-600">UTC {tz.offset}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {tz.time ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {tz.time.split(' ')[0]}
                      </p>
                      <p className="text-lg font-mono font-bold">
                        {tz.time.split(' ')[1]}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-mono font-bold">Converting...</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimeZone(tz.id)}
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Times automatically update every minute. The converter accounts for daylight saving time when applicable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
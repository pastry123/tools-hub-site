import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calculator, ArrowRightLeft, RefreshCw, Clock } from "lucide-react";

interface ConversionUnit {
  name: string;
  value: number; // Conversion factor to base unit
  symbol: string;
}

const conversions = {
  length: {
    name: "Length",
    baseUnit: "meter",
    units: [
      { name: "Millimeter", value: 0.001, symbol: "mm" },
      { name: "Centimeter", value: 0.01, symbol: "cm" },
      { name: "Meter", value: 1, symbol: "m" },
      { name: "Kilometer", value: 1000, symbol: "km" },
      { name: "Inch", value: 0.0254, symbol: "in" },
      { name: "Foot", value: 0.3048, symbol: "ft" },
      { name: "Yard", value: 0.9144, symbol: "yd" },
      { name: "Mile", value: 1609.344, symbol: "mi" }
    ]
  },
  currency: {
    name: "Currency",
    baseUnit: "USD",
    units: [
      { name: "US Dollar", value: 1, symbol: "USD" },
      { name: "Euro", value: 1, symbol: "EUR" },
      { name: "British Pound", value: 1, symbol: "GBP" },
      { name: "Japanese Yen", value: 1, symbol: "JPY" },
      { name: "Canadian Dollar", value: 1, symbol: "CAD" },
      { name: "Australian Dollar", value: 1, symbol: "AUD" },
      { name: "Swiss Franc", value: 1, symbol: "CHF" },
      { name: "Chinese Yuan", value: 1, symbol: "CNY" },
      { name: "Indian Rupee", value: 1, symbol: "INR" },
      { name: "Brazilian Real", value: 1, symbol: "BRL" },
      { name: "Russian Ruble", value: 1, symbol: "RUB" },
      { name: "South Korean Won", value: 1, symbol: "KRW" },
      { name: "Mexican Peso", value: 1, symbol: "MXN" },
      { name: "Singapore Dollar", value: 1, symbol: "SGD" },
      { name: "New Zealand Dollar", value: 1, symbol: "NZD" }
    ]
  },
  weight: {
    name: "Weight",
    baseUnit: "kilogram",
    units: [
      { name: "Milligram", value: 0.000001, symbol: "mg" },
      { name: "Gram", value: 0.001, symbol: "g" },
      { name: "Kilogram", value: 1, symbol: "kg" },
      { name: "Tonne", value: 1000, symbol: "t" },
      { name: "Ounce", value: 0.0283495, symbol: "oz" },
      { name: "Pound", value: 0.453592, symbol: "lb" },
      { name: "Stone", value: 6.35029, symbol: "st" }
    ]
  },
  temperature: {
    name: "Temperature",
    baseUnit: "celsius",
    units: [
      { name: "Celsius", value: 1, symbol: "°C" },
      { name: "Fahrenheit", value: 1, symbol: "°F" },
      { name: "Kelvin", value: 1, symbol: "K" }
    ]
  },
  volume: {
    name: "Volume",
    baseUnit: "liter",
    units: [
      { name: "Milliliter", value: 0.001, symbol: "ml" },
      { name: "Liter", value: 1, symbol: "l" },
      { name: "Gallon (US)", value: 3.78541, symbol: "gal" },
      { name: "Gallon (UK)", value: 4.54609, symbol: "gal" },
      { name: "Fluid Ounce (US)", value: 0.0295735, symbol: "fl oz" },
      { name: "Cup (US)", value: 0.236588, symbol: "cup" },
      { name: "Pint (US)", value: 0.473176, symbol: "pt" },
      { name: "Quart (US)", value: 0.946353, symbol: "qt" }
    ]
  }
};

export default function UnitConverter() {
  const [activeTab, setActiveTab] = useState("currency");
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [result, setResult] = useState("");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const { toast } = useToast();

  // Fetch exchange rates on component mount and when currency tab is selected
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      const response = await fetch('/api/currency/rates');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(data.lastUpdated);
      
      // Update currency units with live rates
      const currencyCategory = conversions.currency;
      currencyCategory.units.forEach(unit => {
        if (data.rates[unit.symbol]) {
          unit.value = data.rates[unit.symbol];
        }
      });
    } catch (error) {
      toast({
        title: "Exchange Rate Error",
        description: "Failed to fetch live exchange rates. Using cached rates.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Load exchange rates when currency tab is selected
  React.useEffect(() => {
    if (activeTab === 'currency') {
      fetchExchangeRates();
    }
  }, [activeTab]);

  const convertValue = () => {
    if (!inputValue || !fromUnit || !toUnit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to convert.",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = conversions[activeTab as keyof typeof conversions];
    const fromUnitData = categoryData.units.find(unit => unit.name === fromUnit);
    const toUnitData = categoryData.units.find(unit => unit.name === toUnit);

    if (!fromUnitData || !toUnitData) return;

    let convertedValue: number;

    if (activeTab === "temperature") {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else if (activeTab === "currency") {
      // Currency conversion using live exchange rates
      const fromRate = exchangeRates[fromUnitData.symbol] || fromUnitData.value;
      const toRate = exchangeRates[toUnitData.symbol] || toUnitData.value;
      
      // Convert to USD first, then to target currency
      const usdValue = value / fromRate;
      convertedValue = usdValue * toRate;
    } else {
      // Convert to base unit first, then to target unit
      const baseValue = value * fromUnitData.value;
      convertedValue = baseValue / toUnitData.value;
    }

    // Format result based on conversion type
    let formattedResult = convertedValue.toString();
    let toastDescription = "";

    if (activeTab === "currency") {
      formattedResult = convertedValue.toFixed(2);
      toastDescription = `${value} ${fromUnitData.symbol} = ${formattedResult} ${toUnitData.symbol}`;
    } else {
      formattedResult = convertedValue.toFixed(6);
      toastDescription = `${value} ${fromUnitData.symbol} = ${formattedResult} ${toUnitData.symbol}`;
    }

    setResult(formattedResult);
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius = value;
    if (from === "Fahrenheit") {
      celsius = (value - 32) * 5/9;
    } else if (from === "Kelvin") {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target
    if (to === "Fahrenheit") {
      return celsius * 9/5 + 32;
    } else if (to === "Kelvin") {
      return celsius + 273.15;
    }
    
    return celsius;
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    
    if (result) {
      setInputValue(result);
      setResult(inputValue);
    }
  };

  const clearAll = () => {
    setInputValue("");
    setFromUnit("");
    setToUnit("");
    setResult("");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="length">Length</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        {Object.entries(conversions).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    {category.name} Converter
                  </h3>
                  {key === 'currency' && (
                    <div className="flex items-center gap-2">
                      {isLoadingRates && (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchExchangeRates}
                        disabled={isLoadingRates}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh Rates
                      </Button>
                    </div>
                  )}
                </div>

                {key === 'currency' && lastUpdated && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Exchange rates last updated: {new Date(lastUpdated).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From */}
                  <div className="space-y-3">
                    <Label>From</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.units.map(unit => (
                          <SelectItem key={unit.name} value={unit.name}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={swapUnits}
                      disabled={!fromUnit || !toUnit}
                      className="mt-8"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* To */}
                  <div className="space-y-3">
                    <Label>To</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.units.map(unit => (
                          <SelectItem key={unit.name} value={unit.name}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Result"
                      value={result}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800 font-mono text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={convertValue} className="flex-1 primary-button">
                    <Calculator className="w-4 h-4 mr-2" />
                    Convert
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

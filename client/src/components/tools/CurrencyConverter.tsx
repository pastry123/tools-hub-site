import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRightLeft, RefreshCw, Clock, TrendingUp } from "lucide-react";

interface ExchangeRates {
  rates: Record<string, number>;
  lastUpdated: string;
  base: string;
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" }
];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      const response = await fetch('/api/currency/rates');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      setExchangeRates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  React.useEffect(() => {
    fetchExchangeRates();
  }, []);

  const convertCurrency = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          from: fromCurrency,
          to: toCurrency
        })
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      setResult(data.result.toFixed(2));

      const fromSymbol = currencies.find(c => c.code === fromCurrency)?.symbol || fromCurrency;
      const toSymbol = currencies.find(c => c.code === toCurrency)?.symbol || toCurrency;

      toast({
        title: "Conversion Complete",
        description: `${fromSymbol}${value} = ${toSymbol}${data.result.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Unable to convert currency. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (result) {
      setAmount(result);
      setResult("");
    }
  };

  const clearAll = () => {
    setAmount("");
    setResult("");
  };

  const getCurrentRate = () => {
    if (!exchangeRates || !exchangeRates.rates) return null;
    const fromRate = exchangeRates.rates[fromCurrency] || 1;
    const toRate = exchangeRates.rates[toCurrency] || 1;
    return (toRate / fromRate).toFixed(4);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t("currencyConverter.title") || "محول العملات في الوقت الفعلي"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {exchangeRates && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4 mr-2" />
                {t("currencyConverter.lastUpdated") || "آخر تحديث"}: {new Date(exchangeRates.lastUpdated).toLocaleString()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchExchangeRates}
                disabled={isLoadingRates}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingRates ? 'animate-spin' : ''}`} />
                {t("currencyConverter.refresh") || "تحديث"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* From Currency */}
            <div className="space-y-3">
              <Label>{t("currencyConverter.from") || "من"}</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={t("currencyConverter.enterAmount") || "أدخل المبلغ"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-3">
              <Label>{t("currencyConverter.to") || "إلى"}</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder={t("currencyConverter.convertedAmount") || "المبلغ المحول"}
                value={result}
                readOnly
                className="font-mono"
              />
            </div>
          </div>

          {/* Exchange Rate Display */}
          {getCurrentRate() && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                1 {fromCurrency} = {getCurrentRate()} {toCurrency}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={convertCurrency} 
              disabled={isLoading || !amount} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("currencyConverter.converting") || "جارٍ التحويل..."}
                </>
              ) : (
                t("currencyConverter.convertCurrency") || "تحويل العملة"
              )}
            </Button>
            <Button onClick={clearAll} variant="outline" className="flex-1">
              {t("currencyConverter.clear") || "مسح"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{t("currencyConverter.liveExchangeRates") || "أسعار الصرف المباشرة"}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-300">
                  {t("currencyConverter.realTimeData") || "بيانات العملة في الوقت الفعلي يتم تحديثها كل ساعة من الأسواق المالية"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{t("currencyConverter.autoRefresh") || "التحديث التلقائي"}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-300">
                  {t("currencyConverter.intelligentCaching") || "تحديث الأسعار تلقائياً مع نظام تخزين مؤقت ذكي"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
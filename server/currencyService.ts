interface ExchangeRateResponse {
  rates: Record<string, number>;
  lastUpdated: string;
  base: string;
}

export class CurrencyService {
  private cachedRates: Record<string, number> = {};
  private lastFetch: Date | null = null;
  private cacheDuration = 1000 * 60 * 60; // 1 hour cache

  async getExchangeRates(): Promise<ExchangeRateResponse> {
    // Check if we have cached rates that are still fresh
    if (this.lastFetch && 
        Date.now() - this.lastFetch.getTime() < this.cacheDuration && 
        Object.keys(this.cachedRates).length > 0) {
      return {
        rates: this.cachedRates,
        lastUpdated: this.lastFetch.toISOString(),
        base: 'USD'
      };
    }

    try {
      // Using exchangerate-api.com (free tier: 1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the rates
      this.cachedRates = data.rates;
      this.lastFetch = new Date();

      return {
        rates: data.rates,
        lastUpdated: this.lastFetch.toISOString(),
        base: 'USD'
      };

    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      
      // Return cached rates if available, otherwise provide fallback
      if (Object.keys(this.cachedRates).length > 0) {
        return {
          rates: this.cachedRates,
          lastUpdated: this.lastFetch?.toISOString() || new Date().toISOString(),
          base: 'USD'
        };
      }

      // Fallback rates (static rates as last resort)
      const fallbackRates = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110,
        'CAD': 1.25,
        'AUD': 1.35,
        'CHF': 0.92,
        'CNY': 6.45,
        'INR': 74.5,
        'BRL': 5.2,
        'RUB': 74,
        'KRW': 1180,
        'MXN': 20.1,
        'SGD': 1.35,
        'NZD': 1.42
      };

      return {
        rates: fallbackRates,
        lastUpdated: new Date().toISOString(),
        base: 'USD'
      };
    }
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    const { rates } = await this.getExchangeRates();
    
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }
}

export const currencyService = new CurrencyService();
interface ToolUsage {
  toolId: string;
  toolName: string;
  category: string;
  usageCount: number;
  lastUsed: Date;
  avgResponseTime?: number;
  successRate?: number;
}

interface DailyStats {
  date: string;
  totalRequests: number;
  uniqueTools: number;
  topTools: string[];
  avgResponseTime: number;
}

interface SystemMetrics {
  uptime: number;
  totalRequests: number;
  uniqueToolsUsed: number;
  averageResponseTime: number;
  popularCategories: Record<string, number>;
  hourlyDistribution: Record<string, number>;
}

export class AnalyticsService {
  private toolUsage: Map<string, ToolUsage> = new Map();
  private dailyStats: Map<string, DailyStats> = new Map();
  private requestLog: Array<{
    toolId: string;
    timestamp: Date;
    responseTime: number;
    success: boolean;
  }> = [];
  private startTime = Date.now();

  // Track tool usage
  trackToolUsage(toolId: string, toolName: string, category: string, responseTime: number = 0, success: boolean = true) {
    const existing = this.toolUsage.get(toolId);
    
    if (existing) {
      existing.usageCount++;
      existing.lastUsed = new Date();
      existing.avgResponseTime = existing.avgResponseTime 
        ? (existing.avgResponseTime + responseTime) / 2 
        : responseTime;
      existing.successRate = existing.successRate 
        ? (existing.successRate + (success ? 1 : 0)) / 2 
        : (success ? 1 : 0);
    } else {
      this.toolUsage.set(toolId, {
        toolId,
        toolName,
        category,
        usageCount: 1,
        lastUsed: new Date(),
        avgResponseTime: responseTime,
        successRate: success ? 1 : 0
      });
    }

    // Add to request log
    this.requestLog.push({
      toolId,
      timestamp: new Date(),
      responseTime,
      success
    });

    // Keep only last 1000 requests to prevent memory issues
    if (this.requestLog.length > 1000) {
      this.requestLog = this.requestLog.slice(-1000);
    }

    // Update daily stats
    this.updateDailyStats(toolId, responseTime);
  }

  private updateDailyStats(toolId: string, responseTime: number) {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.dailyStats.get(today);

    if (existing) {
      existing.totalRequests++;
      existing.avgResponseTime = (existing.avgResponseTime + responseTime) / 2;
      if (!existing.topTools.includes(toolId)) {
        existing.topTools.push(toolId);
      }
    } else {
      this.dailyStats.set(today, {
        date: today,
        totalRequests: 1,
        uniqueTools: 1,
        topTools: [toolId],
        avgResponseTime: responseTime
      });
    }
  }

  // Get popular tools
  getPopularTools(limit: number = 10): ToolUsage[] {
    return Array.from(this.toolUsage.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Get recent activity
  getRecentActivity(limit: number = 20): Array<{
    toolId: string;
    toolName?: string;
    timestamp: Date;
    responseTime: number;
    success: boolean;
  }> {
    return this.requestLog
      .slice(-limit)
      .reverse()
      .map(log => ({
        ...log,
        toolName: this.toolUsage.get(log.toolId)?.toolName
      }));
  }

  // Get system metrics
  getSystemMetrics(): SystemMetrics {
    const uptime = Date.now() - this.startTime;
    const totalRequests = this.requestLog.length;
    const uniqueToolsUsed = this.toolUsage.size;
    
    const avgResponseTime = this.requestLog.length > 0 
      ? this.requestLog.reduce((sum, log) => sum + log.responseTime, 0) / this.requestLog.length
      : 0;

    // Calculate popular categories
    const popularCategories: Record<string, number> = {};
    this.toolUsage.forEach(tool => {
      popularCategories[tool.category] = (popularCategories[tool.category] || 0) + tool.usageCount;
    });

    // Calculate hourly distribution (last 24 hours)
    const hourlyDistribution: Record<string, number> = {};
    const now = new Date();
    const last24Hours = this.requestLog.filter(log => 
      now.getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    for (let hour = 0; hour < 24; hour++) {
      hourlyDistribution[hour.toString()] = 0;
    }

    last24Hours.forEach(log => {
      const hour = log.timestamp.getHours().toString();
      hourlyDistribution[hour]++;
    });

    return {
      uptime,
      totalRequests,
      uniqueToolsUsed,
      averageResponseTime: avgResponseTime,
      popularCategories,
      hourlyDistribution
    };
  }

  // Get daily statistics
  getDailyStats(days: number = 7): DailyStats[] {
    const stats: DailyStats[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = this.dailyStats.get(dateStr);
      if (dayStats) {
        stats.push(dayStats);
      } else {
        stats.push({
          date: dateStr,
          totalRequests: 0,
          uniqueTools: 0,
          topTools: [],
          avgResponseTime: 0
        });
      }
    }

    return stats;
  }

  // Get category breakdown
  getCategoryBreakdown(): Array<{
    category: string;
    toolCount: number;
    usageCount: number;
    avgResponseTime: number;
  }> {
    const categoryMap = new Map<string, {
      toolCount: number;
      usageCount: number;
      totalResponseTime: number;
      responseCount: number;
    }>();

    this.toolUsage.forEach(tool => {
      const existing = categoryMap.get(tool.category);
      if (existing) {
        existing.usageCount += tool.usageCount;
        existing.totalResponseTime += (tool.avgResponseTime || 0) * tool.usageCount;
        existing.responseCount += tool.usageCount;
      } else {
        categoryMap.set(tool.category, {
          toolCount: 1,
          usageCount: tool.usageCount,
          totalResponseTime: (tool.avgResponseTime || 0) * tool.usageCount,
          responseCount: tool.usageCount
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      toolCount: data.toolCount,
      usageCount: data.usageCount,
      avgResponseTime: data.responseCount > 0 ? data.totalResponseTime / data.responseCount : 0
    }));
  }

  // Clear old data (can be called periodically)
  cleanup() {
    // Keep only last 30 days of daily stats
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    Array.from(this.dailyStats.keys()).forEach(date => {
      if (new Date(date) < cutoffDate) {
        this.dailyStats.delete(date);
      }
    });

    // Keep only last 1000 request logs
    if (this.requestLog.length > 1000) {
      this.requestLog = this.requestLog.slice(-1000);
    }
  }
}

export const analyticsService = new AnalyticsService();
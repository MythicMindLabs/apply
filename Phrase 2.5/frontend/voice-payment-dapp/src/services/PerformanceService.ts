// Performance Monitoring Service for EchoPay-2
// Tracks and optimizes application performance metrics

export interface PerformanceMetrics {
  voiceProcessingTime: number;
  networkLatency: number;
  transactionTime: number;
  memoryUsage: number;
  errorRate: number;
  userSatisfactionScore: number;
  timestamp: number;
}

export interface PerformanceTarget {
  voiceProcessingTime: number; // < 1.5 seconds
  networkLatency: number; // < 500ms  
  transactionTime: number; // < 5 seconds
  memoryUsage: number; // < 80%
  errorRate: number; // < 1%
  userSatisfactionScore: number; // > 4.0/5.0
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: keyof PerformanceMetrics;
  message: string;
  timestamp: number;
  resolved: boolean;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics[];
  private alerts: PerformanceAlert[];
  private targets: PerformanceTarget;
  private isMonitoring: boolean;
  private reportingInterval?: number;

  private constructor() {
    this.metrics = [];
    this.alerts = [];
    this.isMonitoring = false;
    
    // Performance targets based on EchoPay-2 requirements
    this.targets = {
      voiceProcessingTime: 1500, // 1.5 seconds
      networkLatency: 500, // 500ms
      transactionTime: 5000, // 5 seconds
      memoryUsage: 0.8, // 80%
      errorRate: 0.01, // 1%
      userSatisfactionScore: 4.0, // 4.0/5.0
    };

    this.initializePerformanceMonitoring();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializePerformanceMonitoring(): void {
    // Initialize Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Long Tasks (> 50ms)
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`);
              this.reportError(new Error(`Long task: ${entry.duration}ms`), {
                type: 'performance',
                duration: entry.duration,
              });
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor Layout Shifts
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let cumulativeScore = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cumulativeScore += entry.value;
            }
          });
          
          if (cumulativeScore > 0.1) { // CLS threshold
            this.createAlert('warning', 'userSatisfactionScore', 
              `Cumulative Layout Shift: ${cumulativeScore.toFixed(3)}`);
          }
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error);
      }
    }

    // Monitor memory usage if available
    if ('memory' in performance) {
      this.startMemoryMonitoring();
    }

    // Start regular performance reporting
    this.startPerformanceReporting();
  }

  // Voice Processing Performance
  public measureVoiceProcessing<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return operation().then((result) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric('voiceProcessingTime', duration);
      
      if (duration > this.targets.voiceProcessingTime) {
        this.createAlert('warning', 'voiceProcessingTime', 
          `${operationName} took ${duration.toFixed(2)}ms (target: ${this.targets.voiceProcessingTime}ms)`);
      }
      
      console.log(`Voice processing (${operationName}): ${duration.toFixed(2)}ms`);
      return result;
      
    }).catch((error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric('voiceProcessingTime', duration);
      this.reportError(error, { operation: operationName, duration });
      
      throw error;
    });
  }

  // Network Performance Monitoring
  public async measureNetworkLatency(
    api: any,
    operation: string
  ): Promise<number> {
    const startTime = performance.now();
    
    try {
      // Ping the network by getting chain info
      await api.rpc.system.chain();
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      this.recordMetric('networkLatency', latency);
      
      if (latency > this.targets.networkLatency) {
        this.createAlert('warning', 'networkLatency',
          `High network latency: ${latency.toFixed(2)}ms for ${operation}`);
      }
      
      return latency;
      
    } catch (error) {
      this.createAlert('critical', 'networkLatency',
        `Network operation failed: ${operation}`);
      throw error;
    }
  }

  // Transaction Performance Monitoring
  public measureTransactionTime<T>(
    transaction: () => Promise<T>,
    transactionType: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return transaction().then((result) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric('transactionTime', duration);
      
      if (duration > this.targets.transactionTime) {
        this.createAlert('warning', 'transactionTime',
          `Slow transaction: ${transactionType} took ${duration.toFixed(2)}ms`);
      }
      
      console.log(`Transaction (${transactionType}): ${duration.toFixed(2)}ms`);
      return result;
      
    }).catch((error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric('transactionTime', duration);
      this.reportError(error, { transaction: transactionType, duration });
      
      throw error;
    });
  }

  // Memory Usage Monitoring
  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        this.recordMetric('memoryUsage', usageRatio);
        
        if (usageRatio > this.targets.memoryUsage) {
          this.createAlert('warning', 'memoryUsage',
            `High memory usage: ${(usageRatio * 100).toFixed(1)}%`);
            
          // Trigger garbage collection hints
          this.optimizeMemory();
        }
        
        if (usageRatio > 0.95) {
          this.createAlert('critical', 'memoryUsage',
            `Critical memory usage: ${(usageRatio * 100).toFixed(1)}%`);
        }
      }
    };

    // Check memory every 10 seconds
    setInterval(checkMemory, 10000);
    checkMemory(); // Initial check
  }

  // Memory Optimization
  public optimizeMemory(): void {
    try {
      // Clean up old metrics (keep only last 1000 entries)
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
      
      // Clean up resolved alerts older than 1 hour
      const oneHourAgo = Date.now() - 3600000;
      this.alerts = this.alerts.filter(alert => 
        !alert.resolved || alert.timestamp > oneHourAgo
      );
      
      // Force garbage collection hints
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Clear caches if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name);
            }
          });
        });
      }
      
      console.log('Memory optimization completed');
      
    } catch (error) {
      console.warn('Memory optimization failed:', error);
    }
  }

  // Error Tracking and Reporting
  public reportError(
    error: Error,
    context?: any
  ): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Calculate error rate
    const recentErrors = this.getRecentErrorCount();
    const recentOperations = this.getRecentOperationCount();
    const errorRate = recentOperations > 0 ? recentErrors / recentOperations : 0;
    
    this.recordMetric('errorRate', errorRate);
    
    if (errorRate > this.targets.errorRate) {
      this.createAlert('critical', 'errorRate',
        `High error rate: ${(errorRate * 100).toFixed(2)}%`);
    }

    // Log error for monitoring
    console.error('EchoPay-2 Error:', errorData);
    
    // Report to external monitoring service (if configured)
    this.sendErrorToMonitoring(errorData);
  }

  private getRecentErrorCount(): number {
    const fiveMinutesAgo = Date.now() - 300000;
    return this.alerts.filter(alert => 
      alert.timestamp > fiveMinutesAgo && alert.type === 'critical'
    ).length;
  }

  private getRecentOperationCount(): number {
    const fiveMinutesAgo = Date.now() - 300000;
    return this.metrics.filter(metric => 
      metric.timestamp > fiveMinutesAgo
    ).length;
  }

  // User Satisfaction Tracking
  public recordUserSatisfaction(score: number, context?: string): void {
    if (score < 1 || score > 5) {
      console.warn('Invalid satisfaction score:', score);
      return;
    }
    
    this.recordMetric('userSatisfactionScore', score);
    
    if (score < this.targets.userSatisfactionScore) {
      this.createAlert('warning', 'userSatisfactionScore',
        `Low user satisfaction: ${score}/5.0 ${context ? `(${context})` : ''}`);
    }
    
    console.log(`User satisfaction recorded: ${score}/5.0`);
  }

  // Performance Reporting
  private startPerformanceReporting(): void {
    // Report performance metrics every 30 seconds
    this.reportingInterval = window.setInterval(() => {
      this.generatePerformanceReport();
    }, 30000);
  }

  public generatePerformanceReport(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    
    const recent = this.getRecentMetrics();
    const report: PerformanceMetrics = {
      voiceProcessingTime: this.calculateAverage(recent, 'voiceProcessingTime'),
      networkLatency: this.calculateAverage(recent, 'networkLatency'),
      transactionTime: this.calculateAverage(recent, 'transactionTime'),
      memoryUsage: this.calculateAverage(recent, 'memoryUsage'),
      errorRate: this.calculateAverage(recent, 'errorRate'),
      userSatisfactionScore: this.calculateAverage(recent, 'userSatisfactionScore'),
      timestamp: Date.now(),
    };
    
    console.log('EchoPay-2 Performance Report:', report);
    
    // Check against targets and create alerts
    this.checkPerformanceTargets(report);
    
    return report;
  }

  private getRecentMetrics(): PerformanceMetrics[] {
    const fiveMinutesAgo = Date.now() - 300000;
    return this.metrics.filter(m => m.timestamp > fiveMinutesAgo);
  }

  private calculateAverage(
    metrics: PerformanceMetrics[],
    field: keyof PerformanceMetrics
  ): number {
    if (metrics.length === 0) return 0;
    
    const values = metrics
      .map(m => m[field] as number)
      .filter(v => typeof v === 'number' && !isNaN(v));
      
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private checkPerformanceTargets(report: PerformanceMetrics): void {
    Object.entries(this.targets).forEach(([key, target]) => {
      const metric = key as keyof PerformanceMetrics;
      const value = report[metric] as number;
      
      if (value > target) {
        const severity = value > target * 1.5 ? 'critical' : 'warning';
        this.createAlert(severity, metric,
          `${metric} exceeded target: ${value.toFixed(2)} > ${target}`);
      }
    });
  }

  // Alert Management
  private createAlert(
    type: 'warning' | 'critical',
    metric: keyof PerformanceMetrics,
    message: string
  ): void {
    const alert: PerformanceAlert = {
      type,
      metric,
      message,
      timestamp: Date.now(),
      resolved: false,
    };
    
    this.alerts.push(alert);
    
    // Limit alerts to prevent memory issues
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    console.log(`Performance Alert [${type.toUpperCase()}]:`, message);
  }

  public getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  public resolveAlert(alertIndex: number): void {
    if (alertIndex >= 0 && alertIndex < this.alerts.length) {
      this.alerts[alertIndex].resolved = true;
    }
  }

  // Utility Methods
  private recordMetric(
    type: keyof PerformanceMetrics,
    value: number
  ): void {
    const metric: PerformanceMetrics = {
      voiceProcessingTime: type === 'voiceProcessingTime' ? value : 0,
      networkLatency: type === 'networkLatency' ? value : 0,
      transactionTime: type === 'transactionTime' ? value : 0,
      memoryUsage: type === 'memoryUsage' ? value : 0,
      errorRate: type === 'errorRate' ? value : 0,
      userSatisfactionScore: type === 'userSatisfactionScore' ? value : 0,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    
    // Limit metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private sendErrorToMonitoring(errorData: any): void {
    // This would integrate with services like Sentry, DataDog, etc.
    // For now, we'll just store locally
    try {
      const errors = JSON.parse(localStorage.getItem('echopay-errors') || '[]');
      errors.push(errorData);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('echopay-errors', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error data:', error);
    }
  }

  // Performance Optimization Recommendations
  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const recent = this.getRecentMetrics();
    
    if (recent.length === 0) return recommendations;
    
    const avgVoiceTime = this.calculateAverage(recent, 'voiceProcessingTime');
    const avgMemoryUsage = this.calculateAverage(recent, 'memoryUsage');
    const avgNetworkLatency = this.calculateAverage(recent, 'networkLatency');
    const avgErrorRate = this.calculateAverage(recent, 'errorRate');
    
    if (avgVoiceTime > this.targets.voiceProcessingTime) {
      recommendations.push('Consider optimizing voice recognition algorithms or using Web Workers');
    }
    
    if (avgMemoryUsage > this.targets.memoryUsage) {
      recommendations.push('Implement more aggressive memory cleanup and caching strategies');
    }
    
    if (avgNetworkLatency > this.targets.networkLatency) {
      recommendations.push('Consider using a faster RPC endpoint or implementing request batching');
    }
    
    if (avgErrorRate > this.targets.errorRate) {
      recommendations.push('Review error handling and implement better retry mechanisms');
    }
    
    return recommendations;
  }

  // Public API
  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getCurrentPerformance(): PerformanceMetrics | null {
    return this.generatePerformanceReport();
  }

  public getPerformanceTargets(): PerformanceTarget {
    return { ...this.targets };
  }

  public updatePerformanceTargets(newTargets: Partial<PerformanceTarget>): void {
    this.targets = { ...this.targets, ...newTargets };
  }

  public startMonitoring(): void {
    this.isMonitoring = true;
    console.log('EchoPay-2 Performance monitoring started');
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
    console.log('EchoPay-2 Performance monitoring stopped');
  }

  // Cleanup
  public destroy(): void {
    this.stopMonitoring();
    this.metrics = [];
    this.alerts = [];
  }
}

export default PerformanceService.getInstance();

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  jitter?: boolean;
}

export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  private jitter: boolean;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.jitter = options.jitter ?? true;
  }

  canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requests.length < this.maxRequests;
  }

  async waitForAvailability(): Promise<void> {
    while (!this.canMakeRequest()) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.windowMs - Date.now();
      
      if (waitTime > 0) {
        const jitterMs = this.jitter ? Math.random() * 1000 : 0;
        await this.sleep(waitTime + jitterMs);
      }
      
      this.cleanOldRequests();
    }
  }

  recordRequest(): void {
    this.requests.push(Date.now());
    this.cleanOldRequests();
  }

  async handleRateLimit(retryAfterSeconds: number): Promise<void> {
    const waitTime = retryAfterSeconds * 1000;
    const jitter = Math.random() * 1000;
    await this.sleep(waitTime + jitter);
    this.requests = [];
  }

  private cleanOldRequests(): void {
    const now = Date.now();
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
  }

  getCurrentRequestCount(): number {
    this.cleanOldRequests();
    return this.requests.length;
  }

  getEstimatedWaitTime(): number {
    if (this.canMakeRequest()) {
      return 0;
    }
    const oldestRequest = this.requests[0];
    const waitTime = oldestRequest + this.windowMs - Date.now();
    return Math.max(0, waitTime);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


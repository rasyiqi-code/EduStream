/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed cache
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (e.g., userId)
   * @param maxRequests - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limit exceeded
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry) return maxRequests;
    
    const now = Date.now();
    if (now > entry.resetAt) return maxRequests;
    
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until reset in milliseconds
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    
    const now = Date.now();
    if (now > entry.resetAt) return 0;
    
    return entry.resetAt - now;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

// Global instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  AI_GENERATION: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Anda telah mencapai batas generate AI. Silakan coba lagi dalam 1 jam.',
  },
  VIDEO_CREATION: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Anda telah mencapai batas upload video. Silakan coba lagi dalam 1 jam.',
  },
  PLAYLIST_CREATION: {
    maxRequests: 15,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Anda telah mencapai batas buat playlist. Silakan coba lagi dalam 1 jam.',
  },
} as const;


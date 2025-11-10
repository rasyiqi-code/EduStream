/**
 * Analytics & Monitoring System
 * 
 * This module provides analytics tracking and error monitoring.
 * For production, integrate with:
 * - Google Analytics
 * - Firebase Analytics
 * - Sentry for error tracking
 * - LogRocket for session replay
 */

// Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface PageViewEvent {
  path: string;
  title: string;
}

// Simple console-based analytics for development
class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
  }

  /**
   * Track page view
   */
  pageView({ path, title }: PageViewEvent) {
    if (!this.enabled) {
      console.log('[Analytics] Page View:', path, title);
      return;
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
      });
    }

    // Firebase Analytics
    if (typeof window !== 'undefined' && (window as any).firebase) {
      // Will be implemented when Firebase Analytics is setup
    }
  }

  /**
   * Track custom event
   */
  event({ name, properties }: AnalyticsEvent) {
    if (!this.enabled) {
      console.log('[Analytics] Event:', name, properties);
      return;
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, properties);
    }
  }

  /**
   * Track video watch
   */
  videoWatch(videoId: string, videoTitle: string, progress: number) {
    this.event({
      name: 'video_watch',
      properties: {
        video_id: videoId,
        video_title: videoTitle,
        progress_percentage: progress,
      },
    });
  }

  /**
   * Track course start
   */
  courseStart(playlistId: string, playlistName: string) {
    this.event({
      name: 'course_start',
      properties: {
        playlist_id: playlistId,
        playlist_name: playlistName,
      },
    });
  }

  /**
   * Track search
   */
  search(query: string, resultsCount: number) {
    this.event({
      name: 'search',
      properties: {
        search_term: query,
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track user signup
   */
  signup(method: string) {
    this.event({
      name: 'sign_up',
      properties: {
        method,
      },
    });
  }

  /**
   * Track login
   */
  login(method: string) {
    this.event({
      name: 'login',
      properties: {
        method,
      },
    });
  }
}

// Error monitoring
class ErrorMonitoring {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
  }

  /**
   * Initialize error monitoring
   * In production, this would initialize Sentry
   */
  init() {
    if (!this.enabled) {
      console.log('[Error Monitoring] Development mode - logging to console');
      return;
    }

    // Sentry initialization would go here
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 1.0,
    // });
  }

  /**
   * Capture error
   */
  captureError(error: Error, context?: Record<string, any>) {
    if (!this.enabled) {
      console.error('[Error Monitoring] Error:', error, context);
      return;
    }

    // Sentry.captureException(error, { extra: context });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.enabled) {
      console.log(`[Error Monitoring] ${level.toUpperCase()}:`, message);
      return;
    }

    // Sentry.captureMessage(message, level);
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string) {
    if (!this.enabled) {
      console.log('[Error Monitoring] Set User:', userId, email);
      return;
    }

    // Sentry.setUser({ id: userId, email });
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (!this.enabled) {
      console.log('[Error Monitoring] Clear User');
      return;
    }

    // Sentry.setUser(null);
  }
}

// Export instances
export const analytics = new Analytics();
export const errorMonitoring = new ErrorMonitoring();

// Initialize on module load
if (typeof window !== 'undefined') {
  errorMonitoring.init();
}


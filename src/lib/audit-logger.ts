/**
 * Audit Logging System
 * Track important user actions for security and compliance
 */

import { Firestore, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export type AuditAction = 
  | 'video_created'
  | 'video_updated'
  | 'video_deleted'
  | 'playlist_created'
  | 'playlist_updated'
  | 'playlist_deleted'
  | 'user_login'
  | 'user_logout'
  | 'role_changed'
  | 'settings_updated';

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string | null;
  action: AuditAction;
  resourceType: 'video' | 'playlist' | 'user' | 'settings';
  resourceId: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  private firestore: Firestore | null = null;
  private enabled: boolean;

  constructor() {
    // Only enable in production or when explicitly configured
    this.enabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGS === 'true';
  }

  /**
   * Initialize with Firestore instance
   */
  initialize(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Log an audit event
   */
  async log(log: Omit<AuditLog, 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<boolean> {
    if (!this.enabled || !this.firestore) {
      console.log('[Audit Log]', log.action, log.resourceType, log.resourceId);
      return false;
    }

    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        ...log,
        timestamp: serverTimestamp() as Timestamp,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        // IP address would be set via server-side function
      };

      await addDoc(collection(this.firestore, 'audit-logs'), auditLog);
      return true;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return false;
    }
  }

  /**
   * Helper methods for common actions
   */

  async logVideoCreated(userId: string, userEmail: string | null, videoId: string, videoTitle: string) {
    return this.log({
      userId,
      userEmail,
      action: 'video_created',
      resourceType: 'video',
      resourceId: videoId,
      resourceName: videoTitle,
    });
  }

  async logVideoUpdated(userId: string, userEmail: string | null, videoId: string, videoTitle: string, changes: Record<string, any>) {
    return this.log({
      userId,
      userEmail,
      action: 'video_updated',
      resourceType: 'video',
      resourceId: videoId,
      resourceName: videoTitle,
      metadata: { changes },
    });
  }

  async logVideoDeleted(userId: string, userEmail: string | null, videoId: string, videoTitle: string) {
    return this.log({
      userId,
      userEmail,
      action: 'video_deleted',
      resourceType: 'video',
      resourceId: videoId,
      resourceName: videoTitle,
    });
  }

  async logPlaylistCreated(userId: string, userEmail: string | null, playlistId: string, playlistName: string) {
    return this.log({
      userId,
      userEmail,
      action: 'playlist_created',
      resourceType: 'playlist',
      resourceId: playlistId,
      resourceName: playlistName,
    });
  }

  async logPlaylistUpdated(userId: string, userEmail: string | null, playlistId: string, playlistName: string, changes: Record<string, any>) {
    return this.log({
      userId,
      userEmail,
      action: 'playlist_updated',
      resourceType: 'playlist',
      resourceId: playlistId,
      resourceName: playlistName,
      metadata: { changes },
    });
  }

  async logPlaylistDeleted(userId: string, userEmail: string | null, playlistId: string, playlistName: string) {
    return this.log({
      userId,
      userEmail,
      action: 'playlist_deleted',
      resourceType: 'playlist',
      resourceId: playlistId,
      resourceName: playlistName,
    });
  }

  async logUserLogin(userId: string, userEmail: string | null) {
    return this.log({
      userId,
      userEmail,
      action: 'user_login',
      resourceType: 'user',
      resourceId: userId,
    });
  }

  async logUserLogout(userId: string, userEmail: string | null) {
    return this.log({
      userId,
      userEmail,
      action: 'user_logout',
      resourceType: 'user',
      resourceId: userId,
    });
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();


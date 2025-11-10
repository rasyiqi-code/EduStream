/**
 * @file use-notifications.ts
 * @description Hook for managing in-app notifications
 * 
 * Features:
 * - Real-time notification updates
 * - Mark as read/unread
 * - Delete notifications
 * - Unread count badge
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export type NotificationType = 
  | 'new_video'
  | 'new_course'
  | 'comment'
  | 'reply'
  | 'course_update'
  | 'completion'
  | 'announcement'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: {
    videoId?: string;
    courseId?: string;
    commentId?: string;
    authorId?: string;
    [key: string]: any;
  };
}

interface UseNotificationsOptions {
  limit?: number;
  autoRefresh?: boolean;
}

/**
 * Hook to manage user notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { limit: maxLimit = 50, autoRefresh = true } = options;
  const firestore = useFirestore();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for notifications
  useEffect(() => {
    if (!firestore || !user || !autoRefresh) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: Notification[] = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const notif: Notification = {
            id: doc.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            icon: data.icon,
            isRead: data.isRead || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: data.metadata,
          };
          notifs.push(notif);
          if (!notif.isRead) unread++;
        });

        setNotifications(notifs);
        setUnreadCount(unread);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, user, maxLimit, autoRefresh]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!firestore) return;

    try {
      const notifRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notifRef, {
        isRead: true,
      });

      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [firestore]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!firestore || !user) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      
      const updatePromises = unreadNotifications.map((n) => {
        const notifRef = doc(firestore, 'notifications', n.id);
        return updateDoc(notifRef, { isRead: true });
      });

      await Promise.all(updatePromises);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [firestore, user, notifications]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!firestore) return;

    try {
      const notifRef = doc(firestore, 'notifications', notificationId);
      await deleteDoc(notifRef);

      // Update local state
      setNotifications((prev) => {
        const notif = prev.find((n) => n.id === notificationId);
        if (notif && !notif.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [firestore]);

  /**
   * Delete all notifications
   */
  const deleteAll = useCallback(async () => {
    if (!firestore || !user) return;

    try {
      const deletePromises = notifications.map((n) => {
        const notifRef = doc(firestore, 'notifications', n.id);
        return deleteDoc(notifRef);
      });

      await Promise.all(deletePromises);

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [firestore, user, notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };
}

/**
 * Helper function to create a notification
 * Can be called from anywhere in the app
 */
export async function createNotification(
  firestore: any,
  userId: string,
  notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>
) {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      icon: notification.icon,
      isRead: false,
      createdAt: serverTimestamp(),
      metadata: notification.metadata || {},
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Helper to create notifications for multiple users
 */
export async function createBulkNotifications(
  firestore: any,
  userIds: string[],
  notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>
) {
  try {
    const promises = userIds.map((userId) =>
      createNotification(firestore, userId, notification)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}


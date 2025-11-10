/**
 * @file notification-triggers.ts
 * @description Helper functions to trigger notifications for various events
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { createNotification, createBulkNotifications } from '@/hooks/use-notifications';

/**
 * Send notification to all students when a new video is published
 */
export async function notifyNewVideo(
  firestore: any,
  videoId: string,
  videoTitle: string,
  instructorName: string
) {
  try {
    // Get all students
    const usersRef = collection(firestore, 'users');
    const studentsQuery = query(usersRef, where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);

    const studentIds = studentsSnapshot.docs.map((doc) => doc.id);

    if (studentIds.length === 0) return;

    // Create notifications for all students
    await createBulkNotifications(firestore, studentIds, {
      type: 'new_video',
      title: 'Video Baru Tersedia! 🎬',
      message: `${instructorName} telah menambahkan "${videoTitle}"`,
      link: `/watch/${videoId}`,
      icon: '🎬',
      metadata: {
        videoId,
        authorName: instructorName,
      },
    });
  } catch (error) {
    console.error('Error notifying new video:', error);
  }
}

/**
 * Send notification to all students when a new course is published
 */
export async function notifyNewCourse(
  firestore: any,
  courseId: string,
  courseName: string,
  instructorName: string,
  videoCount: number
) {
  try {
    // Get all students
    const usersRef = collection(firestore, 'users');
    const studentsQuery = query(usersRef, where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);

    const studentIds = studentsSnapshot.docs.map((doc) => doc.id);

    if (studentIds.length === 0) return;

    // Create notifications for all students
    await createBulkNotifications(firestore, studentIds, {
      type: 'new_course',
      title: 'Kursus Baru Tersedia! 📚',
      message: `${instructorName} telah membuat kursus "${courseName}" dengan ${videoCount} video`,
      link: `/playlist/${courseId}`,
      icon: '📚',
      metadata: {
        courseId,
        authorName: instructorName,
        videoCount,
      },
    });
  } catch (error) {
    console.error('Error notifying new course:', error);
  }
}

/**
 * Send notification when course is updated (new videos added)
 */
export async function notifyCourseUpdate(
  firestore: any,
  courseId: string,
  courseName: string,
  updateMessage: string
) {
  try {
    // Get all students who have watched videos in this course
    // For now, notify all students
    const usersRef = collection(firestore, 'users');
    const studentsQuery = query(usersRef, where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);

    const studentIds = studentsSnapshot.docs.map((doc) => doc.id);

    if (studentIds.length === 0) return;

    await createBulkNotifications(firestore, studentIds, {
      type: 'course_update',
      title: `Update: ${courseName}`,
      message: updateMessage,
      link: `/playlist/${courseId}`,
      icon: '🔄',
      metadata: {
        courseId,
      },
    });
  } catch (error) {
    console.error('Error notifying course update:', error);
  }
}

/**
 * Send notification when user completes a course
 */
export async function notifyCourseCompletion(
  firestore: any,
  userId: string,
  courseId: string,
  courseName: string
) {
  try {
    await createNotification(firestore, userId, {
      type: 'completion',
      title: 'Selamat! 🎉',
      message: `Anda telah menyelesaikan kursus "${courseName}"!`,
      link: `/playlist/${courseId}`,
      icon: '🎉',
      metadata: {
        courseId,
      },
    });
  } catch (error) {
    console.error('Error notifying course completion:', error);
  }
}

/**
 * Send notification for system announcements
 */
export async function notifyAnnouncement(
  firestore: any,
  title: string,
  message: string,
  link?: string,
  targetRole?: 'student' | 'instructor' | 'all'
) {
  try {
    const usersRef = collection(firestore, 'users');
    
    let usersQuery;
    if (targetRole && targetRole !== 'all') {
      usersQuery = query(usersRef, where('role', '==', targetRole));
    } else {
      usersQuery = query(usersRef);
    }
    
    const usersSnapshot = await getDocs(usersQuery);
    const userIds = usersSnapshot.docs.map((doc) => doc.id);

    if (userIds.length === 0) return;

    await createBulkNotifications(firestore, userIds, {
      type: 'announcement',
      title: `📢 ${title}`,
      message,
      link,
      icon: '📢',
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
  }
}


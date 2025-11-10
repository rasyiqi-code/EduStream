/**
 * @file course-rating.ts
 * @description Course rating and review system
 */

import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

export interface CourseRating {
  courseId: string;
  userId: string;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
}

/**
 * Rate a course
 */
export async function rateCourse(
  firestore: Firestore,
  userId: string,
  courseId: string,
  rating: number,
  review?: string
): Promise<void> {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  try {
    const ratingRef = doc(firestore, 'course-ratings', `${courseId}_${userId}`);
    const existingRating = await getDoc(ratingRef);

    const ratingData = {
      courseId,
      userId,
      rating,
      review: review || '',
      createdAt: new Date(),
    };

    await setDoc(ratingRef, ratingData);

    // Update course average rating
    await updateCourseRating(firestore, courseId);
  } catch (error) {
    console.error('Error rating course:', error);
    throw error;
  }
}

/**
 * Update course average rating
 */
async function updateCourseRating(firestore: Firestore, courseId: string): Promise<void> {
  try {
    const ratingsRef = collection(firestore, 'course-ratings');
    const q = query(ratingsRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const ratings = snapshot.docs.map((doc) => doc.data().rating);
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    const courseRef = doc(firestore, 'playlists', courseId);
    await updateDoc(courseRef, {
      rating: Math.round(average * 10) / 10, // Round to 1 decimal
      ratingCount: ratings.length,
    });
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
}

/**
 * Get user's rating for a course
 */
export async function getUserRating(
  firestore: Firestore,
  userId: string,
  courseId: string
): Promise<CourseRating | null> {
  try {
    const ratingRef = doc(firestore, 'course-ratings', `${courseId}_${userId}`);
    const ratingDoc = await getDoc(ratingRef);

    if (!ratingDoc.exists()) return null;

    return ratingDoc.data() as CourseRating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
}


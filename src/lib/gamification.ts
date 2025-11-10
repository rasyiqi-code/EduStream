/**
 * @file gamification.ts
 * @description Gamification system with points, badges, and achievements
 */

import { doc, updateDoc, increment, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { createNotification } from '@/hooks/use-notifications';

// Point values for different actions
export const POINTS = {
  WATCH_VIDEO: 10,
  COMPLETE_VIDEO: 50,
  COMPLETE_COURSE: 100,
  PASS_QUIZ_FIRST_TRY: 30,
  PASS_QUIZ: 20,
  ADD_NOTE: 5,
  ADD_COMMENT: 5,
  HELPFUL_COMMENT: 10, // When upvoted
  DAILY_LOGIN: 5,
  SEVEN_DAY_STREAK: 50,
};

export interface UserStats {
  userId: string;
  totalPoints: number;
  level: number;
  videosWatched: number;
  videosCompleted: number;
  coursesCompleted: number;
  quizzesPassed: number;
  notesCreated: number;
  commentsPosted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first_video',
    name: 'First Steps',
    description: 'Complete your first video',
    icon: '🎬',
    requirement: 'videosCompleted >= 1',
    points: 10,
  },
  {
    id: 'first_course',
    name: 'Course Master',
    description: 'Complete your first course',
    icon: '📚',
    requirement: 'coursesCompleted >= 1',
    points: 50,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Pass 10 quizzes',
    icon: '🎓',
    requirement: 'quizzesPassed >= 10',
    points: 100,
  },
  {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Create 50 notes',
    icon: '📝',
    requirement: 'notesCreated >= 50',
    points: 50,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Post 100 comments',
    icon: '💬',
    requirement: 'commentsPosted >= 100',
    points: 50,
  },
  {
    id: 'streak_week',
    name: '7-Day Streak',
    description: 'Login for 7 consecutive days',
    icon: '🔥',
    requirement: 'currentStreak >= 7',
    points: 100,
  },
  {
    id: 'streak_month',
    name: '30-Day Streak',
    description: 'Login for 30 consecutive days',
    icon: '🏆',
    requirement: 'currentStreak >= 30',
    points: 500,
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Complete 20 videos',
    icon: '⭐',
    requirement: 'videosCompleted >= 20',
    points: 200,
  },
];

/**
 * Award points to a user
 */
export async function awardPoints(
  firestore: Firestore,
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  try {
    const statsRef = doc(firestore, 'user-stats', userId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        totalPoints: increment(points),
      });
    } else {
      await setDoc(statsRef, {
        userId,
        totalPoints: points,
        level: 1,
        videosWatched: 0,
        videosCompleted: 0,
        coursesCompleted: 0,
        quizzesPassed: 0,
        notesCreated: 0,
        commentsPosted: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
    }

    // Check for new badges
    const updatedStats = await getDoc(statsRef);
    if (updatedStats.exists()) {
      await checkAndAwardBadges(firestore, userId, updatedStats.data() as UserStats);
    }
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

/**
 * Update user stats for an action
 */
export async function updateUserStats(
  firestore: Firestore,
  userId: string,
  statUpdates: Partial<UserStats>
): Promise<void> {
  try {
    const statsRef = doc(firestore, 'user-stats', userId);
    await updateDoc(statsRef, statUpdates);

    // Check for new badges
    const updatedStats = await getDoc(statsRef);
    if (updatedStats.exists()) {
      await checkAndAwardBadges(firestore, userId, updatedStats.data() as UserStats);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

/**
 * Check and award badges based on user stats
 */
async function checkAndAwardBadges(
  firestore: Firestore,
  userId: string,
  stats: UserStats
): Promise<void> {
  const earnedBadges = stats.badges || [];
  const newBadges: string[] = [];

  for (const badge of BADGES) {
    if (earnedBadges.includes(badge.id)) continue;

    // Evaluate requirement
    const meetsRequirement = eval(badge.requirement.replace(/(\w+)/g, 'stats.$1'));

    if (meetsRequirement) {
      newBadges.push(badge.id);

      // Award badge points
      await awardPoints(firestore, userId, badge.points, `Badge: ${badge.name}`);

      // Send notification
      await createNotification(firestore, userId, {
        type: 'completion',
        title: `Badge Unlocked! ${badge.icon}`,
        message: `You've earned the "${badge.name}" badge!`,
        link: `/profile/${userId}`,
        icon: badge.icon,
        metadata: { badgeId: badge.id },
      });
    }
  }

  if (newBadges.length > 0) {
    const statsRef = doc(firestore, 'user-stats', userId);
    await updateDoc(statsRef, {
      badges: [...earnedBadges, ...newBadges],
    });
  }
}

/**
 * Get leaderboard (top users by points)
 */
export async function getLeaderboard(
  firestore: Firestore,
  limitCount = 100,
  period: 'all-time' | 'monthly' | 'weekly' = 'all-time'
): Promise<UserStats[]> {
  try {
    const statsRef = collection(firestore, 'user-stats');
    const q = query(statsRef, orderBy('totalPoints', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as UserStats);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Calculate user level based on points
 */
export function calculateLevel(points: number): number {
  // Level formula: sqrt(points / 100)
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

/**
 * Get points needed for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  return (currentLevel * currentLevel) * 100;
}


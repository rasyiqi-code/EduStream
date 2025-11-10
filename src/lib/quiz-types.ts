/**
 * @file quiz-types.ts
 * @description Type definitions for quiz and assessment system
 */

import { Timestamp } from 'firebase/firestore';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ (4 options typically)
  correctAnswer: string | number; // Index for MCQ, 'true'/'false' for T/F, text for short answer
  points: number; // Points for this question
  explanation?: string; // Shown after answering
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId?: string; // Optional: quiz for entire course
  videoId?: string; // Optional: quiz for specific video
  questions: QuizQuestion[];
  passingScore: number; // Percentage (e.g., 70 = 70%)
  timeLimit?: number; // In minutes, undefined = no limit
  allowRetry: boolean;
  maxAttempts?: number; // undefined = unlimited
  showCorrectAnswers: boolean; // Show answers after completion
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  authorId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isPublished: boolean;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number; // Percentage (0-100)
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // In seconds
  attemptNumber: number;
}

export interface QuizProgress {
  quizId: string;
  userId: string;
  attempts: number;
  bestScore: number;
  lastAttemptId?: string;
  passed: boolean;
  completedAt?: Timestamp;
}


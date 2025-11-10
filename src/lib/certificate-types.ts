/**
 * @file certificate-types.ts
 * @description Type definitions for certificates
 */

import { Timestamp } from 'firebase/firestore';

export interface Certificate {
  id: string;
  certificateId: string; // Unique verification ID
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  completionDate: Timestamp;
  score?: number; // Quiz average score
  totalDuration?: number; // Hours
  issuedAt: Timestamp;
  verificationUrl: string;
}


/**
 * Email Verification System
 * Handles email verification flow for Firebase Auth
 */

import { User, sendEmailVerification } from 'firebase/auth';

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(user: User): Promise<boolean> {
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: false,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified ?? false;
}

/**
 * Check if user needs to verify email
 */
export function needsEmailVerification(user: User | null): boolean {
  if (!user) return false;
  
  // Don't require verification for certain domains (e.g., school domain)
  const exemptDomains = ['ma-alhuda.sch.id'];
  const userDomain = user.email?.split('@')[1];
  
  if (userDomain && exemptDomains.includes(userDomain)) {
    return false;
  }
  
  return !user.emailVerified;
}


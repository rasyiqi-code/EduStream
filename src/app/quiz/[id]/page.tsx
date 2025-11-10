/**
 * @file quiz/[id]/page.tsx
 * @description Quiz taking page
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Quiz, QuizAttempt } from '@/lib/quiz-types';
import { QuizTake } from '@/components/quiz-take';
import { QuizResults } from '@/components/quiz-results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Clock, Award, AlertCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

function QuizPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuizPageContent() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const [isStarted, setIsStarted] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  const quizId = params.id as string;

  const quizRef = useMemoFirebase(() => {
    if (!firestore || !quizId) return null;
    return doc(firestore, 'quizzes', quizId);
  }, [firestore, quizId]);

  const { data: quiz, isLoading } = useDoc<Quiz>(quizRef);

  if (isLoading) {
    return <QuizPageSkeleton />;
  }

  if (!quiz) {
    notFound();
    return null;
  }

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  // Quiz not started yet - show intro
  if (!isStarted && !attempt) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription className="text-base mt-2">
                {quiz.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{quiz.questions.length} Pertanyaan</div>
                  <div className="text-sm text-muted-foreground">{totalPoints} Total Poin</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {quiz.timeLimit ? `${quiz.timeLimit} menit` : 'Unlimited'}
                  </div>
                  <div className="text-sm text-muted-foreground">Waktu</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{quiz.passingScore}%</div>
                  <div className="text-sm text-muted-foreground">Passing Score</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {quiz.allowRetry ? 'Ya' : 'Tidak'}
                  </div>
                  <div className="text-sm text-muted-foreground">Retry Allowed</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 p-4 border rounded-lg bg-background">
              <h3 className="font-semibold">Instruksi:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Jawab semua pertanyaan sebelum submit</li>
                <li>Anda bisa navigasi antar pertanyaan dengan bebas</li>
                {quiz.timeLimit && <li>Quiz akan auto-submit jika waktu habis</li>}
                <li>Passing score: {quiz.passingScore}%</li>
                {quiz.allowRetry && <li>Anda bisa mengulang quiz jika belum lulus</li>}
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => setIsStarted(true)} className="gap-2">
                <PlayCircle className="h-5 w-5" />
                Mulai Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  if (isStarted && !attempt) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <QuizTake quiz={quiz} onComplete={(attemptData) => setAttempt(attemptData)} />
      </div>
    );
  }

  // Quiz completed - show results
  if (attempt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizResults
          quiz={quiz}
          attempt={attempt}
          onRetry={
            quiz.allowRetry
              ? () => {
                  setAttempt(null);
                  setIsStarted(true);
                }
              : undefined
          }
          onContinue={() => {
            if (quiz.courseId) {
              router.push(`/playlist/${quiz.courseId}`);
            } else if (quiz.videoId) {
              router.push(`/watch/${quiz.videoId}`);
            } else {
              router.push('/dashboard');
            }
          }}
        />
      </div>
    );
  }

  return null;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizPageSkeleton />}>
      <QuizPageContent />
    </Suspense>
  );
}


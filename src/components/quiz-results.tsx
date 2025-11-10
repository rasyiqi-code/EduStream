/**
 * @file quiz-results.tsx
 * @description Quiz results display with detailed feedback
 */

'use client';

import React from 'react';
import type { Quiz, QuizAttempt } from '@/lib/quiz-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface QuizResultsProps {
  quiz: Quiz & { id: string };
  attempt: QuizAttempt;
  onRetry?: () => void;
  onContinue?: () => void;
}

export function QuizResults({ quiz, attempt, onRetry, onContinue }: QuizResultsProps) {
  const passed = attempt.passed;
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.answers.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Results Summary */}
      <Card className={cn(
        "border-2",
        passed ? "border-green-500 bg-green-500/5" : "border-orange-500 bg-orange-500/5"
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-green-500" />
            ) : (
              <Award className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Selamat! Anda Lulus! 🎉' : 'Belum Lulus 📚'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {passed
              ? 'Anda telah berhasil menyelesaikan quiz ini!'
              : 'Jangan menyerah! Coba lagi untuk meningkatkan skor.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-primary">{attempt.score}%</div>
              <div className="text-sm text-muted-foreground mt-1">Skor Anda</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold">{correctCount}/{totalQuestions}</div>
              <div className="text-sm text-muted-foreground mt-1">Benar</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold">{quiz.passingScore}%</div>
              <div className="text-sm text-muted-foreground mt-1">Passing Score</div>
            </div>
          </div>

          <Progress value={attempt.score} className="h-3 mb-4" />

          <div className="flex gap-2 justify-center">
            {!passed && quiz.allowRetry && onRetry && (
              <Button onClick={onRetry} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            )}
            {onContinue && (
              <Button onClick={onContinue} size="lg">
                {passed ? 'Lanjutkan' : 'Kembali'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Answers (if enabled) */}
      {quiz.showCorrectAnswers && (
        <Card>
          <CardHeader>
            <CardTitle>Review Jawaban</CardTitle>
            <CardDescription>
              Lihat jawaban Anda dan pembahasan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find((a) => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;

              return (
                <div key={question.id} className="space-y-3">
                  {index > 0 && <Separator />}
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <Badge variant={isCorrect ? 'default' : 'destructive'}>
                          {userAnswer?.pointsEarned || 0}/{question.points}
                        </Badge>
                      </div>

                      {question.type === 'multiple_choice' ? (
                        <div className="space-y-1 text-sm">
                          <p className={cn(
                            "font-medium",
                            isCorrect ? "text-green-600" : "text-red-600"
                          )}>
                            Jawaban Anda: {question.options?.[Number(userAnswer?.answer)] || 'Tidak dijawab'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-600 font-medium">
                              Jawaban Benar: {question.options?.[Number(question.correctAnswer)]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <p className={cn(
                            "font-medium",
                            isCorrect ? "text-green-600" : "text-red-600"
                          )}>
                            Jawaban Anda: {String(userAnswer?.answer) === 'true' ? 'True' : 'False'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-600 font-medium">
                              Jawaban Benar: {String(question.correctAnswer) === 'true' ? 'True' : 'False'}
                            </p>
                          )}
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                          <p className="font-medium text-muted-foreground mb-1">💡 Penjelasan:</p>
                          <p>{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


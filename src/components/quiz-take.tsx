/**
 * @file quiz-take.tsx  
 * @description Quiz taking interface for students
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '@/lib/quiz-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuizTakeProps {
  quiz: Quiz & { id: string };
  onComplete: (attempt: QuizAttempt) => void;
}

export function QuizTake({ quiz, onComplete }: QuizTakeProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Shuffle questions if enabled
  const questions = React.useMemo(() => {
    if (quiz.shuffleQuestions) {
      return [...quiz.questions].sort(() => Math.random() - 0.5);
    }
    return quiz.questions;
  }, [quiz]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = answers.size;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (answer: string | number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!firestore || !user) return;

    // Check if all questions answered
    if (answers.size < questions.length) {
      toast({
        variant: 'destructive',
        title: 'Belum Selesai',
        description: `Anda baru menjawab ${answers.size} dari ${questions.length} pertanyaan.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Grade the quiz
      const quizAnswers: QuizAnswer[] = questions.map((q) => {
        const userAnswer = answers.get(q.id);
        const isCorrect = String(userAnswer) === String(q.correctAnswer);
        return {
          questionId: q.id,
          answer: userAnswer || '',
          isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
        };
      });

      const earnedPoints = quizAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= quiz.passingScore;

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Get attempt number
      const attemptsRef = collection(firestore, 'user-quiz-attempts', user.uid, 'attempts');
      const attemptData: Omit<QuizAttempt, 'id'> = {
        quizId: quiz.id,
        userId: user.uid,
        answers: quizAnswers,
        score,
        totalPoints,
        earnedPoints,
        passed,
        startTime: startTime as any,
        endTime: endTime as any,
        duration,
        attemptNumber: 1, // TODO: increment based on previous attempts
      };

      const attemptDoc = await addDoc(attemptsRef, {
        ...attemptData,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
      });

      toast({
        title: passed ? 'Selamat! 🎉' : 'Belum Lulus',
        description: passed
          ? `Anda lulus dengan skor ${score}%!`
          : `Skor Anda ${score}%. Passing score: ${quiz.passingScore}%`,
      });

      onComplete({
        ...attemptData,
        id: attemptDoc.id,
      } as QuizAttempt);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal submit quiz. Coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAnswer = answers.get(currentQuestion.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription className="mt-2">{quiz.description}</CardDescription>
            </div>
            {timeRemaining !== null && (
              <Badge
                variant={timeRemaining < 60 ? 'destructive' : 'secondary'}
                className="text-lg px-4 py-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {answeredCount} / {questions.length} dijawab
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Pertanyaan {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary">{currentQuestion.points} poin</Badge>
          </div>
          <CardTitle className="mt-4 text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'multiple_choice' ? (
            <RadioGroup
              value={String(selectedAnswer ?? '')}
              onValueChange={(value) => handleSelectAnswer(Number(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                      String(selectedAnswer) === String(index)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <RadioGroup
              value={String(selectedAnswer ?? '')}
              onValueChange={handleSelectAnswer}
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                    selectedAnswer === 'true'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="true" id="true-option" />
                  <Label htmlFor="true-option" className="flex-1 cursor-pointer">
                    ✅ True (Benar)
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                    selectedAnswer === 'false'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="false" id="false-option" />
                  <Label htmlFor="false-option" className="flex-1 cursor-pointer">
                    ❌ False (Salah)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answers.size < questions.length}
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                variant={currentQuestionIndex === index ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "w-10 h-10 p-0",
                  answers.has(q.id) && currentQuestionIndex !== index && "border-green-500 text-green-500"
                )}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


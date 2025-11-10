/**
 * @file quiz-builder.tsx
 * @description Quiz builder form for instructors/admins
 */

'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'z';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { UserProfile, Quiz, QuizQuestion, QuestionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false']),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  points: z.number().min(1).max(100),
  explanation: z.string().optional(),
});

const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  courseId: z.string().optional(),
  videoId: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().optional(),
  allowRetry: z.boolean(),
  maxAttempts: z.number().optional(),
  showCorrectAnswers: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
});

interface QuizBuilderProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  quiz?: Quiz & { id: string };
  courseId?: string;
  videoId?: string;
}

export function QuizBuilder({ isOpen, setIsOpen, quiz, courseId, videoId }: QuizBuilderProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(quiz);

  const form = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: quiz || {
      title: '',
      description: '',
      courseId: courseId || '',
      videoId: videoId || '',
      questions: [
        {
          type: 'multiple_choice',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 10,
          explanation: '',
        },
      ],
      passingScore: 70,
      timeLimit: undefined,
      allowRetry: true,
      maxAttempts: undefined,
      showCorrectAnswers: true,
      shuffleQuestions: false,
      shuffleOptions: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const onSubmit = async (values: z.infer<typeof quizSchema>) => {
    if (!firestore || !user) return;

    setIsSubmitting(true);

    try {
      const quizData = {
        ...values,
        authorId: user.uid,
        isPublished: true,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && quiz) {
        const quizRef = doc(firestore, 'quizzes', quiz.id);
        await updateDoc(quizRef, quizData);
        toast({
          title: 'Quiz Diperbarui',
          description: 'Quiz berhasil diperbarui.',
        });
      } else {
        await addDoc(collection(firestore, 'quizzes'), {
          ...quizData,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Quiz Dibuat',
          description: 'Quiz berhasil dibuat dan dipublish.',
        });
      }

      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan quiz. Coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quiz' : 'Buat Quiz Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update quiz dan pertanyaan'
              : 'Buat quiz untuk menguji pemahaman siswa'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Quiz</FormLabel>
                      <FormControl>
                        <Input placeholder="cth: Quiz Aljabar Dasar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Jelaskan tujuan quiz ini..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Score (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (menit)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Kosongkan untuk unlimited"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Settings */}
                <div className="space-y-3 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="allowRetry"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Allow Retry</FormLabel>
                          <FormDescription className="text-xs">
                            Siswa bisa mengulang quiz
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showCorrectAnswers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Correct Answers</FormLabel>
                          <FormDescription className="text-xs">
                            Tampilkan jawaban benar setelah selesai
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuffleQuestions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Shuffle Questions</FormLabel>
                          <FormDescription className="text-xs">
                            Acak urutan soal
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pertanyaan</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        type: 'multiple_choice',
                        question: '',
                        options: ['', '', '', ''],
                        correctAnswer: 0,
                        points: 10,
                        explanation: '',
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pertanyaan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Pertanyaan {index + 1}</span>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Question Type */}
                      <FormField
                        control={form.control}
                        name={`questions.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipe Pertanyaan</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {/* Question Text */}
                      <FormField
                        control={form.control}
                        name={`questions.${index}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pertanyaan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tulis pertanyaan di sini..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Options (for MCQ) */}
                      {form.watch(`questions.${index}.type`) === 'multiple_choice' && (
                        <div className="space-y-2">
                          <FormLabel>Pilihan Jawaban</FormLabel>
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <FormField
                              key={optionIndex}
                              control={form.control}
                              name={`questions.${index}.options.${optionIndex}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={`Pilihan ${String.fromCharCode(65 + optionIndex)}`}
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      )}

                      {/* Correct Answer */}
                      <FormField
                        control={form.control}
                        name={`questions.${index}.correctAnswer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jawaban Benar</FormLabel>
                            <FormControl>
                              {form.watch(`questions.${index}.type`) === 'multiple_choice' ? (
                                <RadioGroup
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={String(field.value)}
                                >
                                  {[0, 1, 2, 3].map((optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value={String(optIndex)}
                                        id={`q${index}-opt${optIndex}`}
                                      />
                                      <Label htmlFor={`q${index}-opt${optIndex}`}>
                                        Pilihan {String.fromCharCode(65 + optIndex)}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              ) : (
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={String(field.value)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id={`q${index}-true`} />
                                    <Label htmlFor={`q${index}-true`}>True</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id={`q${index}-false`} />
                                    <Label htmlFor={`q${index}-false`}>False</Label>
                                  </div>
                                </RadioGroup>
                              )}
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Points */}
                      <FormField
                        control={form.control}
                        name={`questions.${index}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Explanation */}
                      <FormField
                        control={form.control}
                        name={`questions.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Jelaskan mengapa jawaban ini benar..."
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


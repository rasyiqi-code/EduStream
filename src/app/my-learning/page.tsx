/**
 * @file my-learning/page.tsx
 * @description Personal learning dashboard with analytics
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target,
  BookOpen,
  Calendar,
  Flame
} from 'lucide-react';

function MyLearningPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyLearningPageContent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // Fetch user progress
  const progressQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'user-progress', user.uid, 'videos');
  }, [firestore, user]);

  const { data: progressData, isLoading } = useCollection(progressQuery);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!progressData) return {
      totalVideos: 0,
      completed: 0,
      inProgress: 0,
      totalWatchTime: 0,
      completionRate: 0,
    };

    const completed = progressData.filter((p: any) => p.completed).length;
    const inProgress = progressData.filter((p: any) => !p.completed && p.percentage > 5).length;
    const totalWatchTime = Math.round(
      progressData.reduce((sum: number, p: any) => sum + ((p.duration * p.percentage) / 100), 0) / 3600
    );

    return {
      totalVideos: progressData.length,
      completed,
      inProgress,
      totalWatchTime,
      completionRate: progressData.length > 0 ? Math.round((completed / progressData.length) * 100) : 0,
    };
  }, [progressData]);

  if (isUserLoading || isLoading) {
    return <MyLearningPageSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary" />
          My Learning
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and achievements
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWatchTime}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.totalVideos} videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Videos finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Videos ongoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future features */}
      <Card>
        <CardHeader>
          <CardTitle>Study Time Heatmap</CardTitle>
          <CardDescription>Your daily learning activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Heatmap visualization coming soon</p>
            <p className="text-sm mt-2">Track your daily study habits</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyLearningPage() {
  return (
    <Suspense fallback={<MyLearningPageSkeleton />}>
      <MyLearningPageContent />
    </Suspense>
  );
}


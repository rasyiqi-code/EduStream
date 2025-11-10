/**
 * @file leaderboard/page.tsx
 * @description Leaderboard page showing top learners
 */

'use client';

import React, { Suspense } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { UserStats } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import Link from 'next/link';

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

const rankColors = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-orange-600',
};

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
};

function LeaderboardPageContent() {
  const firestore = useFirestore();

  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'user-stats'),
      orderBy('totalPoints', 'desc'),
      limit(100)
    );
  }, [firestore]);

  const { data: stats, isLoading } = useCollection<UserStats>(leaderboardQuery);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top learners di platform EduStream
        </p>
      </div>

      <Tabs defaultValue="all-time" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="all-time">
          <Card>
            <CardHeader>
              <CardTitle>Top 100 Learners</CardTitle>
              <CardDescription>
                Ranked by total points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LeaderboardSkeleton />
              ) : stats && stats.length > 0 ? (
                <div className="space-y-2">
                  {stats.map((userStat, index) => {
                    const rank = index + 1;
                    const RankIcon = rankIcons[rank as keyof typeof rankIcons];
                    const rankColor = rankColors[rank as keyof typeof rankColors];

                    return (
                      <Link
                        key={userStat.userId}
                        href={`/profile/${userStat.userId}`}
                        className="block"
                      >
                        <div
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-accent',
                            rank <= 3 && 'bg-gradient-to-r from-accent/50 to-transparent'
                          )}
                        >
                          {/* Rank */}
                          <div className={cn('w-8 text-center font-bold', rankColor)}>
                            {RankIcon ? (
                              <RankIcon className="h-6 w-6 mx-auto" />
                            ) : (
                              <span className="text-lg">{rank}</span>
                            )}
                          </div>

                          {/* Avatar & Name */}
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {getInitials(`User ${rank}`)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              User {userStat.userId.substring(0, 8)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Level {userStat.level}
                              </Badge>
                              {userStat.currentStreak > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Flame className="h-3 w-3 mr-1 text-orange-500" />
                                  {userStat.currentStreak} day streak
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {userStat.totalPoints.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Monthly leaderboard coming soon</p>
              <p className="text-sm mt-2">Track points earned this month</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Weekly leaderboard coming soon</p>
              <p className="text-sm mt-2">Track points earned this week</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><LeaderboardSkeleton /></div>}>
      <LeaderboardPageContent />
    </Suspense>
  );
}


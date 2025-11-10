/**
 * @file profile/[userId]/page.tsx
 * @description Public user profile page with stats and achievements
 */

'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Video
} from 'lucide-react';
import { VideoCard } from '@/components/video-card';
import { getInitials } from '@/lib/utils';
import { notFound } from 'next/navigation';

function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

function ProfilePageContent() {
  const params = useParams();
  const firestore = useFirestore();
  const userId = params.userId as string;

  // Fetch user profile
  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  // Fetch user's certificates
  const certificatesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'certificates'),
      where('userId', '==', userId)
    );
  }, [firestore, userId]);

  const { data: certificates, isLoading: isCertificatesLoading } = useCollection(certificatesQuery);

  // Fetch user's progress
  const progressQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, 'user-progress', userId, 'videos');
  }, [firestore, userId]);

  const { data: progressData } = useCollection(progressQuery);

  // Calculate stats
  const stats = React.useMemo(() => {
    const completedCount = progressData?.filter((p: any) => p.completed).length || 0;
    const inProgressCount = progressData?.filter((p: any) => !p.completed && p.percentage > 5).length || 0;
    const totalWatchTime = Math.round(
      (progressData?.reduce((sum: number, p: any) => sum + ((p.duration * p.percentage) / 100), 0) || 0) / 3600
    );

    return {
      certificatesEarned: certificates?.length || 0,
      coursesCompleted: completedCount,
      coursesInProgress: inProgressCount,
      totalWatchTime, // in hours
    };
  }, [certificates, progressData]);

  if (isProfileLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    notFound();
    return null;
  }

  const roleColors = {
    admin: 'bg-red-500',
    instructor: 'bg-blue-500',
    student: 'bg-green-500',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.photoURL || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {getInitials(profile.displayName || profile.email)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {profile.displayName || 'Unnamed User'}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={roleColors[profile.role]}>
                    {profile.role}
                  </Badge>
                  {profile.email && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profile.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio placeholder */}
              <p className="text-muted-foreground">
                Member sejak {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">Videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesInProgress}</div>
            <p className="text-xs text-muted-foreground">Videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWatchTime}h</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certificates">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Trophy className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="activity">
            <TrendingUp className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          {isCertificatesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((cert: any) => (
                <Card key={cert.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      {cert.courseName}
                    </CardTitle>
                    <CardDescription>
                      Completed on {cert.completionDate?.toDate().toLocaleDateString('id-ID')}
                    </CardDescription>
                  </CardHeader>
                  {cert.score && (
                    <CardContent>
                      <Badge className="text-sm">Score: {cert.score}%</Badge>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No certificates yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{stats.coursesCompleted} video{stats.coursesCompleted !== 1 && 's'} completed</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Activity timeline coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}


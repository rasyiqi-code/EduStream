/**
 * @file admin/analytics/page.tsx
 * @description Analytics dashboard with charts and metrics
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, where, Timestamp } from 'firebase/firestore';
import type { UserProfile, Video, Playlist } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Video as VideoIcon, 
  PlayCircle, 
  Eye,
  Clock,
  Award,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Check if current user is admin
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Fetch all data for analytics
  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const playlistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'playlists'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: videos, isLoading: isVideosLoading } = useCollection<Video>(videosQuery);
  const { data: playlists, isLoading: isPlaylistsLoading } = useCollection<Playlist>(playlistsQuery);
  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isProfileLoading && userProfile?.role !== 'admin') {
      router.replace('/dashboard');
      toast({
        variant: 'destructive',
        title: 'Akses Ditolak',
        description: 'Halaman ini hanya untuk admin.',
      });
    }
  }, [userProfile, isProfileLoading, router, toast]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!videos || !playlists || !users) {
      return {
        totalViews: 0,
        totalDuration: 0,
        averageDuration: 0,
        roleDistribution: [],
        videosPerMonth: [],
        topVideos: [],
        topCourses: [],
      };
    }

    // Total views
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

    // Total duration (in hours)
    const totalDuration = Math.round(videos.reduce((sum, v) => sum + (v.duration || 0), 0) / 3600);

    // Average duration (in minutes)
    const averageDuration = Math.round(
      videos.reduce((sum, v) => sum + (v.duration || 0), 0) / videos.length / 60
    );

    // Role distribution for pie chart
    const roleDistribution = [
      { name: 'Students', value: users.filter((u) => u.role === 'student').length },
      { name: 'Instructors', value: users.filter((u) => u.role === 'instructor').length },
      { name: 'Admins', value: users.filter((u) => u.role === 'admin').length },
    ];

    // Videos per month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const videosPerMonth = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('id-ID', { month: 'short' });
      const count = videos.filter((v) => {
        if (!v.uploadDate) return false;
        const videoDate = v.uploadDate.toDate();
        return (
          videoDate.getMonth() === month.getMonth() &&
          videoDate.getFullYear() === month.getFullYear()
        );
      }).length;
      videosPerMonth.push({ month: monthName, videos: count });
    }

    // Top 5 most viewed videos
    const topVideos = [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((v) => ({
        name: v.title.substring(0, 30) + (v.title.length > 30 ? '...' : ''),
        views: v.views || 0,
      }));

    // Top 5 courses by video count
    const topCourses = [...playlists]
      .sort((a, b) => (b.videoIds?.length || 0) - (a.videoIds?.length || 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.name.substring(0, 30) + (p.name.length > 30 ? '...' : ''),
        videos: p.videoIds?.length || 0,
      }));

    return {
      totalViews,
      totalDuration,
      averageDuration,
      roleDistribution,
      videosPerMonth,
      topVideos,
      topCourses,
    };
  }, [videos, playlists, users]);

  if (isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return null;
  }

  const isLoading = isVideosLoading || isPlaylistsLoading || isUsersLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Platform insights dan performance metrics
        </p>
      </div>

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all videos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <VideoIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videos?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Videos uploaded
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalDuration}h</div>
                  <p className="text-xs text-muted-foreground">
                    Avg {analytics.averageDuration} min/video
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Videos per Month */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Uploads</CardTitle>
                  <CardDescription>Videos uploaded per month (last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.videosPerMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="videos" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Roles</CardTitle>
                  <CardDescription>Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Videos by Views */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Viewed Videos</CardTitle>
                  <CardDescription>Top 5 videos by view count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topVideos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Largest Courses</CardTitle>
                  <CardDescription>Top 5 courses by video count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topCourses} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="videos" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User growth chart coming soon</p>
                  <p className="text-sm mt-2">
                    Requires createdAt timestamp on user profiles
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Platform usage statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Total Videos</span>
                    </div>
                    <span className="text-2xl font-bold">{videos?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Total Courses</span>
                    </div>
                    <span className="text-2xl font-bold">{playlists?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Total Views</span>
                    </div>
                    <span className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Active Users</span>
                    </div>
                    <span className="text-2xl font-bold">{users?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content by Category</CardTitle>
                  <CardDescription>Videos grouped by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Category breakdown coming soon</p>
                    <p className="text-sm mt-2">
                      Add category field to videos first
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}


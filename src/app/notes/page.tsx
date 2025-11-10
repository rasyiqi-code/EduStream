/**
 * @file notes/page.tsx
 * @description All notes page with search and export
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/lib/note-types';
import type { Video } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, Download, Star, Clock, Video as VideoIcon } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

function NotesPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesPageContent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { notes, isLoading } = useNotes();

  // Get all videos for note context
  const videosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'videos'));
  }, [firestore]);

  const { data: videos } = useCollection<Video>(videosQuery);

  const videoMap = useMemo(() => {
    if (!videos) return new Map();
    return new Map(videos.map((v) => [v.id, v]));
  }, [videos]);

  // Filter notes by search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;

    const term = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.content.toLowerCase().includes(term) ||
        videoMap.get(note.videoId)?.title.toLowerCase().includes(term)
    );
  }, [notes, searchTerm, videoMap]);

  // Group notes by video
  const notesByVideo = useMemo(() => {
    const grouped = new Map<string, typeof filteredNotes>();
    
    filteredNotes.forEach((note) => {
      const existing = grouped.get(note.videoId) || [];
      grouped.set(note.videoId, [...existing, note]);
    });

    return grouped;
  }, [filteredNotes]);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const exportNotes = () => {
    // Export as plain text
    let exportText = '# My Notes - EduStream\n\n';
    
    notesByVideo.forEach((videoNotes, videoId) => {
      const video = videoMap.get(videoId);
      exportText += `## ${video?.title || 'Unknown Video'}\n\n`;
      
      videoNotes.forEach((note) => {
        const timestamp = note.timestamp ? `[${Math.floor(note.timestamp / 60)}:${Math.floor(note.timestamp % 60).toString().padStart(2, '0')}]` : '';
        const content = note.content.replace(/<[^>]*>/g, ''); // Strip HTML
        exportText += `${timestamp} ${content}\n\n`;
      });
      
      exportText += '---\n\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Notes Exported',
      description: 'Your notes have been downloaded as a text file.',
    });
  };

  if (isUserLoading || isLoading) {
    return <NotesPageSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FileText className="h-10 w-10 text-primary" />
          My Notes
        </h1>
        <p className="text-muted-foreground">
          {notes.length} note{notes.length !== 1 && 's'} across {notesByVideo.size} video{notesByVideo.size !== 1 && 's'}
        </p>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={exportNotes} disabled={notes.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Notes grouped by video */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <CardTitle className="mb-2">No Notes Yet</CardTitle>
            <CardDescription>
              Start taking notes while watching videos to see them here
            </CardDescription>
          </CardContent>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No notes match your search
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(notesByVideo.entries()).map(([videoId, videoNotes]) => {
            const video = videoMap.get(videoId);
            
            return (
              <Card key={videoId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/watch/${videoId}`} className="hover:underline">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <VideoIcon className="h-5 w-5 text-primary" />
                          {video?.title || 'Unknown Video'}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        {videoNotes.length} note{videoNotes.length !== 1 && 's'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videoNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        note.isHighlighted && 'bg-yellow-500/10 border-yellow-500'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.timestamp !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor(note.timestamp / 60)}:{Math.floor(note.timestamp % 60).toString().padStart(2, '0')}
                            </Badge>
                          )}
                          {note.isHighlighted && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                              Highlighted
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(note.createdAt.toDate())}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesPageSkeleton />}>
      <NotesPageContent />
    </Suspense>
  );
}


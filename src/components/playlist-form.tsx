
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Playlist, Video } from '@/lib/types';
import { notifyNewCourse } from '@/lib/notification-triggers';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Search } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus memiliki minimal 3 karakter.' }),
  description: z.string().optional(),
  videoIds: z.array(z.string()).default([]),
});

type PlaylistFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  playlist?: Playlist;
};

export function PlaylistForm({ isOpen, setIsOpen, playlist }: PlaylistFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditing = !!playlist;
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      videoIds: [],
    },
  });

  const videosQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'videos'), where('authorId', '==', user.uid));
  }, [firestore, user]);

  const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    
    return videos.filter(video => {
      // In new model, every video MUST have a playlistId
      // Show videos that either don't have a playlist yet OR belong to current playlist being edited
      const isUnassigned = !video.playlistId;
      const isInCurrentPlaylist = isEditing && video.playlistId === playlist.id;
      
      const matchesFilter = isEditing ? (isUnassigned || isInCurrentPlaylist) : isUnassigned;
      
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

  }, [videos, searchQuery, isEditing, playlist]);


  useEffect(() => {
    if (playlist) {
      form.reset({
        name: playlist.name,
        description: playlist.description,
        videoIds: playlist.videoIds || [],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        videoIds: [],
      });
    }
  }, [playlist, form, isOpen]); // Rerun on isOpen to reset form when re-opening

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Anda harus login untuk mengelola playlist.',
      });
      return;
    }

    const batch = writeBatch(firestore);

    if (isEditing && playlist) {
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        
        const originalVideoIds = playlist.videoIds || [];
        const newVideoIds = values.videoIds;
        const addedIds = newVideoIds.filter(id => !originalVideoIds.includes(id));
        const removedIds = originalVideoIds.filter(id => !newVideoIds.includes(id));

        // Update playlist document
        batch.update(playlistRef, {
            name: values.name,
            description: values.description || '',
            videoIds: newVideoIds,
        });

        // Add playlistId to newly added videos
        addedIds.forEach(videoId => {
            const videoRef = doc(firestore, 'videos', videoId);
            // In new model, video can only belong to one playlist
            batch.update(videoRef, { playlistId: playlist.id });
        });

        // Note: In the new model, videos MUST belong to a playlist
        // When removing videos from playlist, we don't delete them,
        // they just remain with their current playlistId until reassigned
        // If you want to remove videos entirely, use separate delete functionality

        toast({
            title: 'Kursus Diperbarui',
            description: 'Perubahan kursus Anda telah disimpan.',
        });

    } else {
        const newPlaylistRef = doc(collection(firestore, 'playlists'));
        const newPlaylistData = {
          id: newPlaylistRef.id,
          name: values.name,
          description: values.description || '',
          videoIds: values.videoIds,
          authorId: user.uid,
        };
        batch.set(newPlaylistRef, newPlaylistData);
        
        // Assign videos to this new playlist
        values.videoIds.forEach(videoId => {
            const videoRef = doc(firestore, 'videos', videoId);
            batch.update(videoRef, { playlistId: newPlaylistRef.id });
        });

        toast({
            title: 'Kursus Dibuat',
            description: 'Kursus baru berhasil dibuat. Sekarang tambahkan bab/seri video!',
        });
        
        // Send notification to all students about new course
        try {
            await notifyNewCourse(
                firestore,
                newPlaylistRef.id,
                values.name,
                user.displayName || 'Instruktur',
                values.videoIds.length
            );
        } catch (error) {
            console.error('Failed to send course notifications:', error);
            // Don't block the flow
        }
    }
    
    await batch.commit();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Kursus/Materi' : 'Buat Kursus/Materi Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Ubah detail kursus Anda. Bab/seri dikelola saat menambah video.'
              : 'Buat paket materi baru. Setelah ini, tambahkan bab-bab/seri video ke dalamnya.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kursus/Materi</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Aljabar Dasar" {...field} />
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
                  <FormLabel>Deskripsi Kursus</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan tentang materi yang akan dipelajari di kursus ini..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="videoIds"
                render={() => (
                    <FormItem>
                        <div className="space-y-2">
                            <FormLabel className="text-base">Atur Bab/Seri (Opsional)</FormLabel>
                            <FormDescription>
                                Anda bisa tambahkan bab/seri nanti. Video baru otomatis masuk saat dibuat.
                            </FormDescription>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                placeholder="Cari video..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                                />
                            </div>
                        </div>
                     <ScrollArea className="rounded-md border">
                        <div className="p-4">
                        {areVideosLoading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : filteredVideos && filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => (
                                <FormField
                                key={video.id}
                                control={form.control}
                                name="videoIds"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={video.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 hover:bg-accent transition-colors"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(video.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), video.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== video.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <Image src={video.thumbnailUrl} alt={video.title} width={106} height={60} className="rounded-md aspect-video object-cover" />
                                        <FormLabel className="font-normal w-full cursor-pointer">
                                            {video.title}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-10">
                                {searchQuery ? "Video tidak ditemukan." : "Anda belum mengunggah video atau semua video sudah masuk playlist."}
                            </p>
                        )}
                        </div>
                    </ScrollArea>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <DialogFooter>
               <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

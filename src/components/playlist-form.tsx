
"use client";

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Playlist, Video } from '@/lib/types';
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
    // Only fetch videos created by the current instructor
    return query(collection(firestore, 'videos'), where('authorId', '==', user.uid));
  }, [firestore, user]);

  const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

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
  }, [playlist, form]);

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
        // Update playlist
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        const updatedData = {
          name: values.name,
          description: values.description || '',
          videoIds: values.videoIds,
          authorId: user.uid, // ensure authorId is present
        };
        batch.update(playlistRef, updatedData);

        // Also update the playlistIds in the associated video documents
        const videosToUpdate = values.videoIds;
        videosToUpdate.forEach(videoId => {
            const videoRef = doc(firestore, 'videos', videoId);
            batch.update(videoRef, {
                playlistIds: arrayUnion(playlist.id)
            });
        });

        toast({
            title: 'Playlist Diperbarui',
            description: 'Perubahan Anda telah disimpan.',
        });
    } else {
        // Create new playlist
        const newPlaylistRef = doc(collection(firestore, 'playlists'));
        const newPlaylistData = {
          id: newPlaylistRef.id,
          name: values.name,
          description: values.description || '',
          videoIds: values.videoIds,
          authorId: user.uid,
        };
        batch.set(newPlaylistRef, newPlaylistData);
        
        // Also update the playlistIds in the associated video documents
        const videosToUpdate = values.videoIds;
        videosToUpdate.forEach(videoId => {
            const videoRef = doc(firestore, 'videos', videoId);
            batch.update(videoRef, {
                playlistIds: arrayUnion(newPlaylistRef.id)
            });
        });

        toast({
            title: 'Playlist Dibuat',
            description: 'Playlist baru Anda telah dibuat.',
        });
    }
    
    await batch.commit();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Playlist' : 'Buat Playlist Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Ubah detail playlist Anda dan pilih video yang akan dimasukkan.'
              : 'Isi detail untuk playlist baru Anda dan pilih video.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Playlist</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Aljabar Dasar" {...field} />
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
                    <Textarea placeholder="Jelaskan tentang playlist ini..." {...field} />
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
                    <div className="mb-4">
                        <FormLabel className="text-base">Pilih Video</FormLabel>
                        <FormDescription>
                            Pilih video yang ingin Anda masukkan ke dalam playlist ini.
                        </FormDescription>
                    </div>
                     <ScrollArea className="h-[25vh] rounded-md border p-4">
                        {areVideosLoading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : videos && videos.length > 0 ? (
                            videos.map((video) => (
                                <FormField
                                key={video.id}
                                control={form.control}
                                name="videoIds"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={video.id}
                                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 hover:bg-accent transition-colors"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(video.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, video.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== video.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <Image src={video.thumbnailUrl} alt={video.title} width={80} height={45} className="rounded-md aspect-video object-cover" />
                                        <FormLabel className="font-normal w-full cursor-pointer">
                                            {video.title}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-10">Anda belum mengunggah video apa pun.</p>
                        )}
                    </ScrollArea>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

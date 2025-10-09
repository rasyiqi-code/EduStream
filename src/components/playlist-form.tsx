"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Playlist } from '@/lib/types';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus memiliki minimal 3 karakter.' }),
  description: z.string().optional(),
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
    },
  });

  useEffect(() => {
    if (playlist) {
      form.reset({
        name: playlist.name,
        description: playlist.description,
      });
    } else {
      form.reset({
        name: '',
        description: '',
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

    if (isEditing && playlist) {
        // Update playlist
        const playlistRef = doc(firestore, 'playlists', playlist.id);
        const updatedData = {
          name: values.name,
          description: values.description || '',
        };
        updateDocumentNonBlocking(playlistRef, updatedData);
        toast({
            title: 'Playlist Diperbarui',
            description: 'Perubahan Anda telah disimpan.',
        });
    } else {
        // Create new playlist
        const newPlaylistData = {
          ...values,
          description: values.description || '',
          videoIds: [],
        };
        addDocumentNonBlocking(collection(firestore, 'playlists'), newPlaylistData);
        toast({
            title: 'Playlist Dibuat',
            description: 'Playlist baru Anda telah dibuat.',
        });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Playlist' : 'Buat Playlist Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Ubah detail playlist Anda.'
              : 'Isi detail untuk playlist baru Anda.'}
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
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

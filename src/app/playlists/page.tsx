"use client";

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import type { Playlist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { PlaylistForm } from '@/components/playlist-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function PlaylistListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PlaylistsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined);
  const firestore = useFirestore();
  const { toast } = useToast();

  const playlistsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'playlists');
  }, [firestore]);

  const { data: playlists, isLoading } = useCollection<Playlist>(playlistsCollection);

  const handleEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedPlaylist(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (playlistId: string) => {
    if (!firestore) return;
    const playlistDocRef = doc(firestore, 'playlists', playlistId);
    
    // Using non-blocking delete. Error is handled globally.
    deleteDocumentNonBlocking(playlistDocRef);

    toast({
        title: "Playlist Dihapus",
        description: "Playlist telah berhasil dihapus.",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Playlist</h1>
          <p className="text-muted-foreground">Buat, edit, dan hapus playlist kursus Anda.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Playlist Baru
        </Button>
      </div>

      <PlaylistForm
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        playlist={selectedPlaylist}
      />
      
      {isLoading ? (
        <PlaylistListSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists?.map((playlist) => (
            <Card key={playlist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2">{playlist.name}</CardTitle>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(playlist)}>
                        Edit
                      </DropdownMenuItem>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Hapus
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat diurungkan. Ini akan menghapus playlist secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(playlist.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-3 h-[60px]">{playlist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{playlist.videoIds?.length || 0} video</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && playlists?.length === 0 && (
         <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Playlist</h3>
            <p className="text-sm text-muted-foreground mb-4">Mulai dengan membuat playlist baru.</p>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Playlist Baru
            </Button>
        </div>
      )}
    </div>
  );
}

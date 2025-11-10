
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Clapperboard, Youtube, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection } from "@/firebase";
import { collection, serverTimestamp, addDoc, doc, type FieldValue, query, where } from "firebase/firestore";
import type { Video, UserProfile, Playlist } from "@/lib/types";
import { useDoc } from "@/firebase/firestore/use-doc";
import { generateVideoDescription } from "@/ai/flows/generate-video-description";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { validateVideoSubmission } from "@/lib/content-moderation";
import { notifyNewVideo } from "@/lib/notification-triggers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Judul harus minimal 2 karakter.",
  }),
  description: z.string().optional(),
  videoType: z.enum(["mp4", "youtube"], {
    required_error: "Pilih tipe sumber video.",
  }),
  url: z.string().url({ message: "Masukkan URL yang valid." }),
  playlistId: z.string().min(1, {
    message: "Pilih kursus/materi untuk video ini.",
  }),
  episodeNumber: z.number().optional(),
});

type AddVideoDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  video?: Video; // Make video optional for editing
};


export function AddVideoDialog({ isOpen, setIsOpen, video }: AddVideoDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const isEditing = !!video;


  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  // Fetch user's playlists for selection
  const playlistsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'playlists'), where('authorId', '==', user.uid));
  }, [firestore, user]);
  const { data: playlists, isLoading: arePlaylistsLoading } = useCollection<Playlist>(playlistsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videoType: "youtube",
      url: "",
      playlistId: "",
      episodeNumber: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && video) {
      form.reset({
        title: video.title,
        description: video.description,
        videoType: video.youtubeId ? 'youtube' : 'mp4',
        url: video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : video.videoUrl || '',
        playlistId: video.playlistId || '',
        episodeNumber: video.episodeNumber,
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        description: "",
        videoType: "youtube",
        url: "",
        playlistId: "",
        episodeNumber: undefined,
      });
    }
  }, [isOpen, video, form]);


  function getYouTubeVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const handleGenerateDescription = async () => {
    const title = form.getValues("title");
    if (!title) {
      toast({
        variant: "destructive",
        title: "Judul kosong",
        description: "Masukkan judul terlebih dahulu sebelum generate deskripsi.",
      });
      return;
    }
    
    // Check if Gemini API key is configured
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    if (!hasGeminiKey) {
      toast({
        variant: "destructive",
        title: "AI Tidak Tersedia",
        description: "Fitur AI generation belum dikonfigurasi. Silakan isi deskripsi secara manual.",
      });
      return;
    }
    
    // Rate limiting check
    if (!user) return;
    const rateLimitKey = `ai_gen_${user.uid}`;
    const { maxRequests, windowMs, message } = RATE_LIMITS.AI_GENERATION;
    
    if (!rateLimiter.check(rateLimitKey, maxRequests, windowMs)) {
      const remaining = rateLimiter.getRemaining(rateLimitKey, maxRequests);
      const timeUntilReset = rateLimiter.getTimeUntilReset(rateLimitKey);
      const minutesUntilReset = Math.ceil(timeUntilReset / (60 * 1000));
      
      toast({
        variant: "destructive",
        title: "Batas Tercapai",
        description: `${message} Sisa ${remaining}/${maxRequests} requests. Reset dalam ${minutesUntilReset} menit.`,
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateVideoDescription({ title });
      if (result.description) {
        form.setValue("description", result.description);
        const remaining = rateLimiter.getRemaining(rateLimitKey, maxRequests);
        toast({
          title: "Deskripsi Berhasil Dibuat",
          description: `AI telah membuat deskripsi untuk video Anda. Sisa ${remaining}/${maxRequests} requests.`,
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        variant: "destructive",
        title: "Generate Gagal",
        description: "Tidak dapat membuat deskripsi saat ini. Silakan coba lagi.",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Error Autentikasi",
            description: "Anda harus login untuk menambah atau edit video.",
        });
        return;
    }

    // Content moderation check
    const validation = validateVideoSubmission(
      values.title,
      values.description || '',
      values.url
    );

    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Konten Tidak Valid",
        description: validation.errors.join('. '),
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      toast({
        variant: "default",
        title: "Peringatan",
        description: validation.warnings.join('. '),
      });
    }

    let videoData: Partial<Omit<Video, 'id'>> = {
      title: values.title,
      description: values.description || "",
    };
    
    if (values.videoType === 'youtube') {
      const youtubeId = getYouTubeVideoId(values.url);
      if (youtubeId) {
        videoData.youtubeId = youtubeId;
        videoData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
        // Don't set videoUrl at all (omit it instead of undefined)
      } else {
        toast({
          variant: "destructive",
          title: "URL YouTube Tidak Valid",
          description: "Masukkan URL YouTube yang valid.",
        });
        return;
      }
    } else {
      videoData.videoUrl = values.url;
      videoData.thumbnailUrl = 'https://picsum.photos/seed/video/640/360';
      // Don't set youtubeId at all (omit it instead of undefined)
    }
    
    if (isEditing && video) {
        // Update existing video
        const videoRef = doc(firestore, 'videos', video.id);
        updateDocumentNonBlocking(videoRef, videoData);
        toast({
            title: "Video Updated!",
            description: `${values.title} has been successfully updated.`,
        });
    } else {
        // Get selected playlist to determine episode number
        const selectedPlaylist = playlists?.find((p: Playlist) => p.id === values.playlistId);
        const nextEpisodeNumber = selectedPlaylist ? (selectedPlaylist.videoIds?.length || 0) + 1 : 1;
        
        // Add new video - Only include defined fields
        const baseVideoData: any = {
          title: values.title,
          description: values.description || "",
          uploadDate: serverTimestamp(),
          duration: 300, 
          channel: user.displayName || "Anonymous",
          channelAvatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/48/48`,
          authorId: user.uid,
          authorRole: userProfile.role,
          playlistId: values.playlistId, // REQUIRED - Course assignment
          episodeNumber: values.episodeNumber || nextEpisodeNumber,
          thumbnailUrl: videoData.thumbnailUrl || 'https://picsum.photos/seed/6/640/360',
        };
        
        // Only add youtubeId OR videoUrl, never both, never undefined
        if (videoData.youtubeId) {
          baseVideoData.youtubeId = videoData.youtubeId;
        } else if (videoData.videoUrl) {
          baseVideoData.videoUrl = videoData.videoUrl;
        }
        
        const videosCollection = collection(firestore, 'videos');
        const docRefPromise = addDocumentNonBlocking(videosCollection, baseVideoData);
        
        // Update playlist to include this video
        const playlistRef = doc(firestore, 'playlists', values.playlistId);
        docRefPromise.then(async (docRef) => {
            if(docRef) {
                updateDocumentNonBlocking(playlistRef, {
                    videoIds: [...(selectedPlaylist?.videoIds || []), docRef.id],
                    episodeCount: nextEpisodeNumber,
                    updatedAt: serverTimestamp(),
                });
                
                toast({
                  title: "Bab/Seri Ditambahkan!",
                  description: `${values.title} berhasil ditambahkan ke kursus.`,
                });
                
                // Send notification to all students
                try {
                    await notifyNewVideo(
                        firestore,
                        docRef.id,
                        values.title,
                        user.displayName || 'Instruktur'
                    );
                } catch (error) {
                    console.error('Failed to send notifications:', error);
                    // Don't block the flow if notification fails
                }
                
                router.push(`/watch/${docRef.id}`);
            }
        });
    }

    setIsOpen(false);
  }
  
  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'instructor')) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Bab/Seri' : 'Tambah Bab/Seri Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Ubah detail bab/seri ini." : "Tambahkan bab/seri baru ke dalam kursus/materi."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Playlist Selection - REQUIRED */}
            <FormField
              control={form.control}
              name="playlistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kursus/Materi <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kursus untuk bab ini" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {arePlaylistsLoading ? (
                        <SelectItem value="loading" disabled>Memuat kursus...</SelectItem>
                      ) : playlists && playlists.length > 0 ? (
                        playlists.map((playlist: Playlist) => (
                          <SelectItem key={playlist.id} value={playlist.id}>
                            {playlist.name} ({playlist.videoIds?.length || 0} bab)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Belum ada kursus. Buat kursus dulu!
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Bab/Seri</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Bab 1 - Pengenalan Aljabar" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Description (Optional)</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="A brief summary of the video content..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Video Source</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="youtube" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Youtube /> YouTube
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="mp4" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                           <Clapperboard /> MP4 URL
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Batal
              </Button>
              <Button type="submit" disabled={!form.watch('playlistId')}>
                {isEditing ? "Simpan Perubahan" : "Tambah Bab/Seri"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
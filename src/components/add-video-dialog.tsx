
"use client";

import { useState } from "react";
import { useRouter }from "next/navigation";
import { PlusCircle, Clapperboard, Youtube } from "lucide-react";
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
  DialogTrigger,
  DialogClose,
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
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import type { Video, UserProfile } from "@/lib/types";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  videoType: z.enum(["mp4", "youtube"], {
    required_error: "You need to select a video source type.",
  }),
  url: z.string().url({ message: "Please enter a valid URL." }),
});

export function AddVideoDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videoType: "youtube",
      url: "",
    },
  });

  function getYouTubeVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to add a video.",
        });
        return;
    }

    let videoData: Omit<Video, 'id'> = {
      title: values.title,
      description: values.description || "",
      thumbnailUrl: 'https://picsum.photos/seed/6/640/360',
      uploadDate: serverTimestamp(),
      duration: 0, 
      channel: user.displayName || "Anonymous",
      channelAvatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/48/48`,
      authorId: user.uid,
      authorRole: userProfile.role,
    };

    if (values.videoType === 'youtube') {
      const youtubeId = getYouTubeVideoId(values.url);
      if (youtubeId) {
        videoData.youtubeId = youtubeId;
        videoData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
      } else {
        toast({
          variant: "destructive",
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL.",
        });
        return;
      }
    } else {
      videoData.videoUrl = values.url;
    }
    
    try {
        const videosCollection = collection(firestore, 'videos');
        const docRef = await addDoc(videosCollection, videoData);
        
        toast({
          title: "Video Added!",
          description: `${values.title} has been successfully added.`,
        });
        
        form.reset();
        setOpen(false);
        
        router.push(`/watch/${docRef.id}`);

    } catch(e: any) {
        console.error("Error adding video: ", e);
        toast({
            variant: "destructive",
            title: "Error adding video",
            description: "Could not add video. See console for details.",
        });
    }

  }
  
  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'instructor')) {
    return null;
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add a New Video</DialogTitle>
          <DialogDescription>
            Provide details for the new educational video. You can use a direct
            MP4 link or a YouTube URL.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to Algebra" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
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
                      defaultValue={field.value}
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
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Video</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

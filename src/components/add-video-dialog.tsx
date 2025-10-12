
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
import { useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, addDoc, doc, type FieldValue } from "firebase/firestore";
import type { Video, UserProfile } from "@/lib/types";
import { useDoc } from "@/firebase/firestore/use-doc";
import { generateVideoDescription } from "@/ai/flows/generate-video-description";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videoType: "youtube",
      url: "",
    },
  });

  useEffect(() => {
    if (isOpen && video) {
      form.reset({
        title: video.title,
        description: video.description,
        videoType: video.youtubeId ? 'youtube' : 'mp4',
        url: video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : video.videoUrl || '',
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        description: "",
        videoType: "youtube",
        url: "",
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
        title: "Title is missing",
        description: "Please enter a title before generating a description.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateVideoDescription({ title });
      if (result.description) {
        form.setValue("description", result.description);
        toast({
          title: "Description Generated",
          description: "An AI-powered description has been created.",
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a description at this time.",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !userProfile) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to add or edit a video.",
        });
        return;
    }

    let videoData: Partial<Omit<Video, 'id'>> = {
      title: values.title,
      description: values.description || "",
    };
    
    if (values.videoType === 'youtube') {
      const youtubeId = getYouTubeVideoId(values.url);
      if (youtubeId) {
        videoData.youtubeId = youtubeId;
        videoData.videoUrl = undefined; // Clear videoUrl if it was set before
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
      videoData.youtubeId = undefined; // Clear youtubeId if it was set before
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
        // Add new video
        let newVideoData: Omit<Video, 'id' | 'uploadDate'> & { uploadDate: FieldValue } = {
          ...videoData,
          uploadDate: serverTimestamp(),
          duration: 300, 
          channel: user.displayName || "Anonymous",
          channelAvatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/48/48`,
          authorId: user.uid,
          authorRole: userProfile.role,
          playlistIds: [],
          title: values.title,
          description: values.description || "",
          thumbnailUrl: videoData.thumbnailUrl || 'https://picsum.photos/seed/6/640/360',
        };
        const videosCollection = collection(firestore, 'videos');
        const docRefPromise = addDocumentNonBlocking(videosCollection, newVideoData);
    
        toast({
          title: "Video Added!",
          description: `${values.title} has been successfully added.`,
        });

        docRefPromise.then(docRef => {
            if(docRef) {
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Video' : 'Add a New Video'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this video." : "Provide details for the new educational video."}
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
                  Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Video"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
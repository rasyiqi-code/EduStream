import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";
import { Play, Clock } from "lucide-react";
import { formatDuration, formatRelativeTime, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { VideoProgressOverlay } from "@/components/video-progress-bar";
import { useVideoProgress } from "@/hooks/use-video-progress";

interface VideoCardProps {
  video: Video;
}

function formatTimeAgo(timestamp: any): string {
  if (!timestamp || !timestamp.seconds) {
    return 'Baru saja';
  }
  const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  return formatRelativeTime(date);
}

export function VideoCard({ video }: VideoCardProps) {
  const timeAgo = formatTimeAgo(video.uploadDate);
  
  // Auto-load progress for this video
  const { progress } = useVideoProgress({
    videoId: video.id,
    duration: video.duration || 0,
  });

  return (
    <div className="group">
      <Link href={`/watch/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={640}
            height={360}
            className="w-full h-full object-cover"
            data-ai-hint="video thumbnail"
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-8 w-8 fill-current" />
            </div>
          </div>
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
          
          {/* Progress bar overlay */}
          {progress && (
            <VideoProgressOverlay
              percentage={progress.percentage}
              completed={progress.completed}
            />
          )}
        </div>
      </Link>
      
      <div className="flex items-start gap-3 mt-3">
        <Link href="#" className="flex-shrink-0">
          <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-colors duration-300">
            <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-accent text-white">
              {getInitials(video.channel)}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {video.title}
            </h3>
          </Link>
          
          <Link href="#" className="block mt-1">
            <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {video.channel}
            </p>
          </Link>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {video.episodeNumber && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  Bab {video.episodeNumber}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

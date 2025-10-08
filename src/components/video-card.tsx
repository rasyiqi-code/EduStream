import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";

interface VideoCardProps {
  video: Video;
}

function formatTimeAgo(timestamp: any): string {
  if (!timestamp || !timestamp.seconds) {
    return 'just now';
  }
  const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return "just now";
}

export function VideoCard({ video }: VideoCardProps) {
  const timeAgo = formatTimeAgo(video.uploadDate);

  return (
    <Card className="overflow-hidden border-0 shadow-none rounded-lg bg-transparent">
      <CardContent className="p-0">
        <Link href={`/watch/${video.id}`} className="block group">
          <div className="aspect-video overflow-hidden rounded-xl">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={640}
              height={360}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="video thumbnail"
            />
          </div>
        </Link>
        <div className="flex items-start gap-4 mt-3">
          <Link href="#">
            <Avatar>
              <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
              <AvatarFallback>
                {video.channel.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/watch/${video.id}`}>
              <h3 className="font-semibold text-base leading-snug line-clamp-2">
                {video.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{video.channel}</p>
            <div className="text-sm text-muted-foreground">
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

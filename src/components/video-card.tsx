import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
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
              <span>{video.views} views</span>
              <span className="mx-1">&bull;</span>
              <span>{video.uploadedAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

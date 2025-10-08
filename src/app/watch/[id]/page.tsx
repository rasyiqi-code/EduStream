import Image from 'next/image';
import Link from 'next/link';
import { videos } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';

function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
    return (
        <div className="aspect-video w-full">
            <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
}

function MP4Player({ videoUrl }: { videoUrl: string }) {
    return (
        <div className="aspect-video w-full">
            <video
                className="w-full h-full rounded-xl bg-black"
                controls
                autoPlay
                src={videoUrl}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

function SuggestedVideos({ currentVideoId }: { currentVideoId: string }) {
    const suggested = videos.filter(v => v.id !== currentVideoId).slice(0, 5);
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Up Next</h2>
            {suggested.map((video) => (
                <Link href={`/watch/${video.id}`} key={video.id} className="flex items-start gap-4 group">
                    <div className="w-40 aspect-video overflow-hidden rounded-lg shrink-0">
                         <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            width={160}
                            height={90}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="video thumbnail"
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                        <p className="text-xs text-muted-foreground">{video.views} views</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default function WatchPage({ params: { id } }: { params: { id: string } }) {
  const video = videos.find((v) => v.id === id);

  if (!video) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2">
        {video.youtubeId ? (
          <YouTubePlayer videoId={video.youtubeId} title={video.title} />
        ) : video.videoUrl ? (
          <MP4Player videoUrl={video.videoUrl} />
        ) : (
          <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center">
            <p>Video source not available.</p>
          </div>
        )}
        <div className="mt-4 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{video.title}</h1>
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
                    <AvatarFallback>{video.channel.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{video.channel}</p>
                    <div className="text-sm text-muted-foreground">
                        <span>{video.views} views</span>
                        <span className="mx-1">&bull;</span>
                        <span>{video.uploadedAt}</span>
                    </div>
                </div>
            </div>
             <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{video.description}</p>
            </div>
        </div>
      </div>
      <aside className="lg:col-span-1">
        <SuggestedVideos currentVideoId={video.id} />
      </aside>
    </div>
  );
}

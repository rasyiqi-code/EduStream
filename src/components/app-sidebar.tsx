
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListVideo, Film, Cog, Home, PlayCircle } from "lucide-react";
import { collection, doc, query, where } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Playlist, UserProfile, Video } from '@/lib/types';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
  SidebarMenuSkeleton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useMemo } from "react";

function PlaylistItems() {
    const pathname = usePathname();
    const firestore = useFirestore();
    
    const playlistsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'playlists');
    }, [firestore]);

    const { data: playlists, isLoading } = useCollection<Playlist>(playlistsCollection);

    if (isLoading) {
        return (
            <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </>
        )
    }

    return (
        <>
            {playlists?.map((playlist) => (
              <SidebarMenuItem key={playlist.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(`/playlist/${playlist.id}`)}
                  tooltip={playlist.name}
                >
                  <Link href={`/playlist/${playlist.id}`}>
                    <ListVideo />
                    <span>{playlist.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </>
    );
}

function WatchPlaylist({ playlistId, activeVideoId }: { playlistId: string, activeVideoId: string }) {
    const firestore = useFirestore();
    const pathname = usePathname();

    const playlistRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'playlists', playlistId);
    }, [firestore, playlistId]);

    const { data: playlist, isLoading: isPlaylistLoading } = useDoc<Playlist>(playlistRef);
    
    const videoIds = useMemo(() => playlist?.videoIds?.slice(0, 30) || [], [playlist?.videoIds]);

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || videoIds.length === 0) return null;
        return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, JSON.stringify(videoIds)]);

    const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

    const orderedVideos = useMemo(() => {
        if (!videos || !playlist?.videoIds) return [];
        const videoMap = new Map(videos.map(v => [v.id, v]));
        return playlist.videoIds.map(id => videoMap.get(id)).filter((v): v is Video => !!v);
    }, [videos, playlist?.videoIds]);

    if (isPlaylistLoading || areVideosLoading) {
        return <SidebarMenuSkeleton showIcon />;
    }

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href={`/playlist/${playlistId}`}>
                        <ListVideo />
                        <span className="font-semibold">{playlist?.name}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuSub>
                {orderedVideos.map((video) => (
                    <SidebarMenuItem key={video.id}>
                         <SidebarMenuSubButton
                            asChild
                            isActive={pathname.endsWith(video.id)}
                        >
                            <Link href={`/watch/${video.id}`}>
                                <PlayCircle />
                                <span>{video.title}</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenuSub>
        </>
    );
}

function WatchContextSidebar() {
    const firestore = useFirestore();
    const pathname = usePathname();
    const videoId = pathname.split('/')[2];

    const videoRef = useMemoFirebase(() => {
        if (!firestore || !videoId) return null;
        return doc(firestore, 'videos', videoId);
    }, [firestore, videoId]);

    const { data: video, isLoading } = useDoc<Video>(videoRef);
    const firstPlaylistId = video?.playlistIds?.[0];
    
    if (isLoading) return <SidebarMenuSkeleton showIcon />;
    
    if (firstPlaylistId) {
        return <WatchPlaylist playlistId={firstPlaylistId} activeVideoId={videoId} />;
    }

    // Fallback if video is not in a playlist to show all courses
    return <PlaylistItems />;
}


export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';
  const isWatchPage = pathname.startsWith('/watch/');

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="flex md:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-foreground">EduStream</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4 md:pt-0">
         <SidebarGroup>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/`}
                  tooltip="Dashboard"
                >
                  <Link href="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{isWatchPage ? "Daftar Video" : "Courses"}</SidebarGroupLabel>
          <SidebarMenu>
            {isWatchPage ? <WatchContextSidebar /> : <PlaylistItems />}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {isAdmin && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(`/playlists`)}
                  tooltip="Kelola Playlist"
                >
                  <Link href="/playlists">
                    <Cog />
                    <span>Kelola Playlist</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}

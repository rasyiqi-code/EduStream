
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

function WatchContextSidebar() {
    const firestore = useFirestore();
    const pathname = usePathname();
    const videoId = pathname.split('/')[2];

    const videoRef = useMemoFirebase(() => {
        if (!firestore || !videoId) return null;
        return doc(firestore, 'videos', videoId);
    }, [firestore, videoId]);

    const { data: video, isLoading: isVideoLoading } = useDoc<Video>(videoRef);
    
    const firstPlaylistId = video?.playlistIds?.[0];

    const playlistRef = useMemoFirebase(() => {
        if (!firestore || !firstPlaylistId) return null;
        return doc(firestore, 'playlists', firstPlaylistId);
    }, [firestore, firstPlaylistId]);

    const { data: playlist, isLoading: isPlaylistLoading } = useDoc<Playlist>(playlistRef);
    
    const videoIds = useMemo(() => playlist?.videoIds?.slice(0, 30) || [], [playlist?.videoIds]);

    const videosQuery = useMemoFirebase(() => {
        if (!firestore || videoIds.length === 0) return null;
        // Using JSON.stringify on videoIds to create a stable dependency for useMemoFirebase
        return query(collection(firestore, 'videos'), where('__name__', 'in', videoIds));
    }, [firestore, JSON.stringify(videoIds)]);

    const { data: videos, isLoading: areVideosLoading } = useCollection<Video>(videosQuery);

    const orderedVideos = useMemo(() => {
        if (!videos || !playlist?.videoIds) return [];
        const videoMap = new Map(videos.map(v => [v.id, v]));
        return playlist.videoIds.map(id => videoMap.get(id)).filter((v): v is Video => !!v);
    }, [videos, playlist?.videoIds]);

    if (isVideoLoading || isPlaylistLoading || areVideosLoading) {
        return <SidebarMenuSkeleton showIcon />;
    }

    if (!firstPlaylistId || !playlist) {
      // If video is not in a playlist, fallback to all courses
      return <PlaylistItems />;
    }

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href={`/playlist/${firstPlaylistId}`}>
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
  const homeHref = user ? "/dashboard" : "/";

  // Only render the sidebar on the watch page
  if (!isWatchPage) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="flex md:hidden">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold text-lg">
          <div className="h-6 w-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-sm">A</div>
          <span className="text-foreground">Ajhar</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4 md:pt-0">
        <SidebarGroup>
          <SidebarGroupLabel>Daftar Isi</SidebarGroupLabel>
          <SidebarMenu>
             <WatchContextSidebar />
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

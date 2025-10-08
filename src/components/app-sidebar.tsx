"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListVideo, Film } from "lucide-react";
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Playlist } from '@/lib/types';
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
} from "@/components/ui/sidebar";

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

export function AppSidebar() {

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
          <SidebarGroupLabel>Playlists</SidebarGroupLabel>
          <SidebarMenu>
            <PlaylistItems />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

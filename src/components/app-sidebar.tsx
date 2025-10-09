"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListVideo, Film, Cog, Home } from "lucide-react";
import { collection, doc } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Playlist, UserProfile } from '@/lib/types';
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
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';

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
          <SidebarGroupLabel>Courses</SidebarGroupLabel>
          <SidebarMenu>
            <PlaylistItems />
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

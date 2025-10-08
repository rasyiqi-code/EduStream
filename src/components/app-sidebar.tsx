"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListVideo, Film } from "lucide-react";

import { playlists } from "@/lib/data";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip="Home"
            >
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Playlists</SidebarGroupLabel>
          <SidebarMenu>
            {playlists.map((playlist) => (
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

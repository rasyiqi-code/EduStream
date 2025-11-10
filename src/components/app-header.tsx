
'use client';

import Link from "next/link";
import { Film, Menu, Search, LogOut, ArrowLeft, LogIn, Heart, Compass, Bell } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React, { type FormEvent, Suspense, useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddVideoDialog } from "@/components/add-video-dialog";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { signOut } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPanel } from "@/components/notifications-panel";


function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get("search") ?? "";

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("search") as string;
    // Always route to dashboard for search results
    router.push(`/dashboard?search=${searchQuery}`);
  };

  return (
    <form
      onSubmit={onSearch}
      className="relative w-full max-w-md"
      data-tour="search"
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Cari video..."
        defaultValue={defaultSearch}
        className="pl-10 rounded-full border-muted-foreground/20 focus-visible:ring-primary"
      />
    </form>
  )
}

function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isUserLoading) {
    return <Skeleton className="h-7 w-7 rounded-full" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="rounded-full px-4 shadow-md hover:shadow-lg transition-all"
      asChild
    >
      <Link href="/login">
        <LogIn className="h-4 w-4 mr-2" />
        <span>Masuk</span>
      </Link>
    </Button>
  )
}

function MobileSearch({ onSearch }: { onSearch: (event: FormEvent<HTMLFormElement>) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const defaultSearch = searchParams.get("search") ?? "";
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the input when the search opens
            inputRef.current?.focus();
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="md:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Open Search</span>
            </Button>
        );
    }

    return (
        <div className="absolute inset-0 z-20 flex h-full w-full items-center gap-2 bg-background px-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Close Search</span>
            </Button>
            <form onSubmit={onSearch} className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="search"
                    name="search"
                    placeholder="Search videos..."
                    defaultValue={defaultSearch}
                    className="pl-8 w-full"
                />
            </form>
        </div>
    );
}

export function AppHeader() {
  const { toggleSidebar, isMobile: isSidebarMobile } = useSidebar();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const isWatchPage = pathname.startsWith('/watch/');
  const isLoginPage = pathname.startsWith('/login');
  
  const homeHref = user ? "/dashboard" : "/";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("search") as string;
    router.push(`/dashboard?search=${searchQuery}`);
  };


  return (
    <header 
      className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm"
      role="banner"
      aria-label="Main navigation"
    >
      {user && isWatchPage ? (
        // Watch Page Header (logged in)
        <>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden" // Only show on mobile
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
        </>
      ) : user ? (
        // Default Header (logged in)
        <>
          <Link href={homeHref} className="flex items-center gap-3 font-bold text-xl hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-lg flex items-center justify-center shadow-md">
                <span className="text-base">A</span>
              </div>
              <span className="hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Ajhar</span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            <Link href="/browse" data-tour="browse">
              <Button variant="ghost" size="sm" className="gap-2">
                <Compass className="h-4 w-4" />
                <span>Browse</span>
              </Button>
            </Link>
          </nav>
        </>
      ) : (
        // Public Header (logged out)
        <Link href={homeHref} className="flex items-center gap-3 font-bold text-xl hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-lg flex items-center justify-center shadow-md">
            <span className="text-base">A</span>
          </div>
          <span className="hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Ajhar</span>
        </Link>
      )}
      
      {!isLoginPage && (
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            {user && (
              <>
                 <div className="hidden w-full md:flex md:justify-center">
                    <Suspense fallback={<Skeleton className="h-10 w-full max-w-md rounded-full" />}>
                        <SearchBar />
                    </Suspense>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Suspense fallback={null}>
                        <MobileSearch onSearch={handleSearch} />
                    </Suspense>
                    <NotificationsPanel />
                    <Button variant="ghost" size="icon" asChild className="rounded-full" data-tour="favorites">
                      <Link href="/favorites">
                        <Heart className="h-5 w-5" />
                        <span className="sr-only">Favorites</span>
                      </Link>
                    </Button>
                    <div data-tour="theme">
                        <ThemeToggle />
                    </div>
                    <div data-tour="profile">
                        <UserNav />
                    </div>
                </div>
              </>
            )}
            {!user && (
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <UserNav />
              </div>
            )}
          </div>
      )}

      {isLoginPage && <div className="ml-auto"><UserNav /></div>}

    </header>
  );
}

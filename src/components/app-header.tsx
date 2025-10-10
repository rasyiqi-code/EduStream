
'use client';

import Link from "next/link";
import { Film, Menu, Search, LogOut, ArrowLeft } from "lucide-react";
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
    >
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Search videos..."
        defaultValue={defaultSearch}
        className="pl-8 w-full"
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
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button asChild>
      <Link href="/login">Sign In</Link>
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
    <header className="sticky top-0 z-10 flex h-12 items-center gap-4 bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {isWatchPage && (
        <>
          {isSidebarMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          ) : (
            <SidebarTrigger />
          )}
        </>
      )}
      
      {!isWatchPage && <Link href={homeHref} className="flex items-center gap-2 font-semibold text-lg">
        <Film className="h-6 w-6 text-primary" />
        <span className="hidden md:inline-block">Ajhar</span>
      </Link>}
      
      {!isLoginPage && (
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            {user && (
              <>
                 <div className="hidden w-full md:flex md:justify-center">
                    <Suspense fallback={<Skeleton className="h-10 w-full max-w-md" />}>
                        <SearchBar />
                    </Suspense>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Suspense fallback={null}>
                        <MobileSearch onSearch={handleSearch} />
                    </Suspense>
                    <UserNav />
                </div>
              </>
            )}
            {!user && <div className="ml-auto"><UserNav /></div>}
          </div>
      )}

      {isLoginPage && <div className="ml-auto"><UserNav /></div>}

    </header>
  );
}

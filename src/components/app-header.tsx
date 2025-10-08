"use client";

import Link from "next/link";
import { Film, Menu, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddVideoDialog } from "@/components/add-video-dialog";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "./ui/skeleton";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get("search") ?? "";

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("search") as string;
    router.push(`/?search=${searchQuery}`);
  };

  return (
    <form
      onSubmit={onSearch}
      className="ml-auto flex-1 sm:flex-initial"
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Search videos..."
          defaultValue={defaultSearch}
          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
        />
      </div>
    </form>
  )
}

function SearchBarSkeleton() {
  return <Skeleton className="h-10 w-[300px] sm:w-[300px] md:w-[200px] lg:w-[300px] ml-auto" />
}


export function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {isMobile ? (
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
      <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
        <Film className="h-6 w-6 text-primary" />
        <span className="text-lg">EduStream</span>
      </Link>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Suspense fallback={<SearchBarSkeleton />}>
          <SearchBar />
        </Suspense>
        <AddVideoDialog />
      </div>
    </header>
  );
}

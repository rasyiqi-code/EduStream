
'use client';

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';
import React from "react";

const AppHeader = dynamic(() => import('@/components/app-header').then(mod => mod.AppHeader), { ssr: false });
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => mod.AppSidebar), { ssr: false });

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';
    const isWatchPage = pathname.startsWith('/watch');

    // Conditional padding: No top padding on watch page, default padding otherwise.
    const mainClass = isWatchPage 
        ? 'px-2 sm:px-0' 
        : `py-4 px-2 sm:px-6 ${!isLandingPage ? 'pt-[calc(3.5rem+1rem)]' : ''}`;
    
    return (
        <main className={mainClass}>
            {children}
        </main>
    );
}

const DynamicMainContent = dynamic(() => Promise.resolve(MainContent), { ssr: false });


export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWatchPage = pathname.startsWith('/watch/');
    const isLoginPage = pathname === '/login';

    return (
        <SidebarProvider defaultOpen={true}>
          {isWatchPage && <AppSidebar />}
          <SidebarInset className={!isWatchPage ? '!pl-0' : ''}>
            {!isLoginPage && <AppHeader />}
            <DynamicMainContent>{children}</DynamicMainContent>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
    )
}

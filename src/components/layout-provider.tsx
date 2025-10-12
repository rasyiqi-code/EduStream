
'use client';

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';
    const isWatchPage = pathname.startsWith('/watch');

    // Conditional padding: No top padding on watch page, default padding otherwise.
    // On watch page, also remove horizontal padding for mobile (px-0) and add it back for larger screens (sm:px-6)
    const mainClass = isWatchPage
        ? 'sm:px-6'
        : `px-2 py-4 sm:px-6`;

    return (
        <main className={mainClass}>
            {children}
        </main>
    );
}


export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWatchPage = pathname.startsWith('/watch/');
    const isLoginPage = pathname === '/login';

    return (
        <SidebarProvider defaultOpen={true}>
          {isWatchPage && <AppSidebar />}
          <SidebarInset className={!isWatchPage ? '!pl-0' : ''}>
            {!isLoginPage && <AppHeader />}
            <MainContent>{children}</MainContent>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
    )
}

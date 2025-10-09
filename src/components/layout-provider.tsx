
'use client';

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';

const AppHeader = dynamic(() => import('@/components/app-header').then(mod => mod.AppHeader), { ssr: false });
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => mod.AppSidebar), { ssr: false });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWatchPage = pathname.startsWith('/watch/');
    const isLoginPage = pathname === '/login';
    const isLandingPage = pathname === '/';

    // A more robust layout that keeps the header present during navigation
    return (
        <SidebarProvider defaultOpen={true}>
          {isWatchPage && <AppSidebar />}
          <SidebarInset className={!isWatchPage ? '!pl-0' : ''}>
            {!isLoginPage && <AppHeader />}
            <main className="p-4 sm:p-6">
              {children}
            </main>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
    )
}

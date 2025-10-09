
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

    return (
        <SidebarProvider defaultOpen={true}>
          {/* AppSidebar will conditionally render null, so it's safe to always include it */}
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
    )
}

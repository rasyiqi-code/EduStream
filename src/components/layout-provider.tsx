'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';

const AppHeader = dynamic(() => import('@/components/app-header').then(mod => mod.AppHeader), { ssr: false });
const AppSidebar = dynamic(() => import('@/components/app-sidebar').then(mod => mod.AppSidebar), { ssr: false });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false}>
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

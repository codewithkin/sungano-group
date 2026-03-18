import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@sungano-group/ui/components/sidebar";
import { Separator } from "@sungano-group/ui/components/separator";
import { TooltipProvider } from "@sungano-group/ui/components/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@sungano-group/ui/components/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardActions } from "@/components/dashboard-actions";
import { NotificationsDrawer } from "@/components/notifications-drawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset className="bg-[#f5f7fb]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-white/90 px-4 md:px-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <NotificationsDrawer />
              <DashboardActions />
            </div>
          </header>
          <main className="flex-1 overflow-auto px-3 py-4 md:px-6 md:py-6">
            <div className="min-h-full rounded-3xl border border-border/60 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

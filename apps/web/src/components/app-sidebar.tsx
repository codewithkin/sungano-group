"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  Wrench,
  Package,
  Route,
  Building2,
  DollarSign,
  BarChart3,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@sungano-group/ui/components/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sungano-group/ui/components/collapsible";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: "" },
    ],
  },
  {
    label: "Fleet Management",
    items: [
      { title: "Trucks", href: "/dashboard/fleet/trucks", icon: Truck, badge: "24" },
      { title: "Trailers", href: "/dashboard/fleet/trailers", icon: Package, badge: "12" },
      { title: "Maintenance", href: "/dashboard/fleet/maintenance", icon: Wrench, badge: "3" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Drivers", href: "/dashboard/drivers", icon: Users, badge: "120" },
      { title: "Dispatch", href: "/dashboard/dispatch", icon: Route, badge: "6" },
      { title: "Customers", href: "/dashboard/customers", icon: Building2, badge: "18" },
    ],
  },
  {
    label: "Finance & Analytics",
    items: [
      { title: "Costs", href: "/dashboard/costs", icon: DollarSign, badge: "" },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: "" },
      { title: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle, badge: "2" },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  // Check if a group has an active item
  const isGroupActive = (group: (typeof navGroups)[number]) => {
    return group.items.some(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-white/90">
      <SidebarHeader className="border-b border-border/60 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-sm">
            SG
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Sungano</span>
            <span className="text-[11px] text-muted-foreground">Dispatch</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-1 space-y-1">
        {navGroups.map((group) => {
          const groupActive = isGroupActive(group);

          return (
            <Collapsible key={group.label} defaultOpen={groupActive} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel className="px-2">
                  <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground">
                    <span>{group.label}</span>
                    <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-1 pb-1">
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              isActive={isActive}
                              className={`group relative w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm transition shadow-none hover:bg-muted/70 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:gap-0 ${
                                isActive
                                  ? "bg-primary/10 text-primary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-full before:bg-primary"
                                  : "text-foreground"
                              }`}
                            >
                              <Link href={item.href} className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                                <item.icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                {item.badge ? (
                                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                                    {item.badge}
                                  </span>
                                ) : null}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 px-3 py-3 group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-muted-foreground">Stay productive.</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

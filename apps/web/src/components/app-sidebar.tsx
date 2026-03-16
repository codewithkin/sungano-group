"use client";

import Image from "next/image";
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
import { Separator } from "@sungano-group/ui/components/separator";
import UserMenu from "./user-menu";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Fleet Management",
    items: [
      { title: "Trucks", href: "/dashboard/fleet/trucks", icon: Truck },
      { title: "Trailers", href: "/dashboard/fleet/trailers", icon: Package },
      { title: "Maintenance", href: "/dashboard/fleet/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Drivers", href: "/dashboard/drivers", icon: Users },
      { title: "Dispatch", href: "/dashboard/dispatch", icon: Route },
      { title: "Customers", href: "/dashboard/customers", icon: Building2 },
    ],
  },
  {
    label: "Finance & Analytics",
    items: [
      { title: "Costs", href: "/dashboard/costs", icon: DollarSign },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
          <Image
            src="/logo.jpeg"
            alt="Sungano Group"
            width={36}
            height={36}
            className="rounded-md shrink-0"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight">Sungano Group</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Dispatch Management
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="flex items-center justify-end px-2 pb-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <UserMenu />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Truck, Users, Wrench, Package, AlertTriangle, Route } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sungano-group/ui/components/card";
import { Badge } from "@sungano-group/ui/components/badge";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@sungano-group/ui/components/chart";
import { trpc } from "@/utils/trpc";

type UserSession = {
  user: {
    id: string;
    username: string;
    role: string;
    name?: string | null;
    email?: string | null;
  };
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
  badge,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  tone?: "default" | "warning" | "destructive" | "success";
  badge?: string;
}) {
  const toneClass = {
    default: "text-muted-foreground",
    warning: "text-amber-500",
    destructive: "text-red-500",
    success: "text-emerald-500",
  }[tone];

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
          {description ? (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{badge}</span>
          ) : null}
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60">
            <Icon className={`size-4 ${toneClass}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview({
  session,
}: {
  session: UserSession;
}) {
  const truckStats = useQuery(trpc.truck.stats.queryOptions());
  const trailerStats = useQuery(trpc.trailer.stats.queryOptions());
  const driverStats = useQuery(trpc.driver.stats.queryOptions());
  const maintenanceStats = useQuery(trpc.maintenance.stats.queryOptions());

  const isLoading =
    truckStats.isLoading ||
    trailerStats.isLoading ||
    driverStats.isLoading ||
    maintenanceStats.isLoading;

  const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  } as const;

  const chartConfig = {
    trucks: { label: "Trucks", color: "hsl(var(--primary))" },
    drivers: { label: "Drivers", color: "#22c55e" },
    incidents: { label: "Incidents", color: "#f97316" },
  };

  const baseTrend = [
    { day: "Mon", trucks: 8, drivers: 12, incidents: 1 },
    { day: "Tue", trucks: 9, drivers: 11, incidents: 0 },
    { day: "Wed", trucks: 10, drivers: 12, incidents: 1 },
    { day: "Thu", trucks: 9, drivers: 12, incidents: 2 },
    { day: "Fri", trucks: 11, drivers: 13, incidents: 1 },
    { day: "Sat", trucks: 7, drivers: 10, incidents: 0 },
    { day: "Sun", trucks: 6, drivers: 9, incidents: 0 },
  ];

  const trendData = baseTrend.map((item) => ({
    ...item,
    trucks: (truckStats.data?.available ?? item.trucks) || item.trucks,
    drivers: (driverStats.data?.available ?? item.drivers) || item.drivers,
    incidents: (maintenanceStats.data?.overdue ?? item.incidents) || item.incidents,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.username}. Here is your latest operational overview.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/70 bg-white/90">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                key: "trucks-total",
                card: (
                  <StatCard
                    title="Total Trucks"
                    value={truckStats.data?.total ?? 0}
                    description={`${truckStats.data?.available ?? 0} available`}
                    icon={Truck}
                    badge="Fleet"
                  />
                ),
              },
              {
                key: "trucks-transit",
                card: (
                  <StatCard
                    title="Trucks In Transit"
                    value={truckStats.data?.inTransit ?? 0}
                    description="Currently on the road"
                    icon={Route}
                    tone="success"
                    badge="Live"
                  />
                ),
              },
              {
                key: "trailers",
                card: (
                  <StatCard
                    title="Total Trailers"
                    value={trailerStats.data?.total ?? 0}
                    description={`${trailerStats.data?.available ?? 0} available`}
                    icon={Package}
                    badge="Assets"
                  />
                ),
              },
              {
                key: "drivers",
                card: (
                  <StatCard
                    title="Active Drivers"
                    value={driverStats.data?.total ?? 0}
                    description={`${driverStats.data?.available ?? 0} available`}
                    icon={Users}
                    badge="People"
                  />
                ),
              },
              {
                key: "drivers-trip",
                card: (
                  <StatCard
                    title="Drivers On Trip"
                    value={driverStats.data?.onTrip ?? 0}
                    description="Currently assigned"
                    icon={Users}
                    tone="success"
                    badge="Trips"
                  />
                ),
              },
              {
                key: "maintenance",
                card: (
                  <StatCard
                    title="Trucks in Maintenance"
                    value={truckStats.data?.maintenance ?? 0}
                    description="Being serviced"
                    icon={Wrench}
                    tone="warning"
                    badge="Service"
                  />
                ),
              },
              {
                key: "overdue",
                card: (
                  <StatCard
                    title="Overdue Maintenance"
                    value={maintenanceStats.data?.overdue ?? 0}
                    description="Requires attention"
                    icon={AlertTriangle}
                    tone={(maintenanceStats.data?.overdue ?? 0) > 0 ? "destructive" : "default"}
                    badge="Alerts"
                  />
                ),
              },
              {
                key: "licenses",
                card: (
                  <StatCard
                    title="Expiring Licenses"
                    value={driverStats.data?.expiringLicenses ?? 0}
                    description="Within 30 days"
                    icon={AlertTriangle}
                    tone={(driverStats.data?.expiringLicenses ?? 0) > 0 ? "warning" : "default"}
                    badge="Compliance"
                  />
                ),
              },
            ].map(({ key, card }, idx) => (
              <motion.div key={key} {...fadeIn} transition={{ ...fadeIn.transition, delay: idx * 0.04 }}>
                {card}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <motion.div {...fadeIn} className="xl:col-span-2">
              <Card className="border-border/70 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Performance Overview</CardTitle>
                  <CardDescription>Weekly availability and incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <AreaChart data={trendData} margin={{ left: 6, right: 6 }}>
                      <CartesianGrid vertical={false} className="stroke-border/50" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="trucks" stroke="var(--color-trucks)" fill="var(--color-trucks)" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="drivers" stroke="var(--color-drivers)" fill="var(--color-drivers)" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="incidents" stroke="var(--color-incidents)" fill="var(--color-incidents)" fillOpacity={0.12} strokeWidth={2} />
                      <ChartLegend verticalAlign="bottom" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} className="xl:col-span-1">
              <Card className="border-border/70 bg-white/90 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-base">Fleet Status</CardTitle>
                  <CardDescription>Current availability breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {truckStats.data && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Available</span>
                        <Badge variant="secondary">{truckStats.data.available}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">In Transit</span>
                        <Badge variant="default">{truckStats.data.inTransit}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Maintenance</span>
                        <Badge variant="outline">{truckStats.data.maintenance}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Out of Service</span>
                        <Badge variant="destructive">{truckStats.data.outOfService}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <motion.div {...fadeIn} className="xl:col-span-1">
              <Card className="border-border/70 bg-white/90 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-base">Driver Status</CardTitle>
                  <CardDescription>Current driver availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {driverStats.data && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Available</span>
                        <Badge variant="secondary">{driverStats.data.available}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">On Trip</span>
                        <Badge variant="default">{driverStats.data.onTrip}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Off Duty</span>
                        <Badge variant="outline">{driverStats.data.offDuty}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Suspended</span>
                        <Badge variant="destructive">{driverStats.data.suspended}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} className="xl:col-span-2">
              <Card className="border-border/70 bg-white/90 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-base">Maintenance Overview</CardTitle>
                  <CardDescription>Scheduled maintenance status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {maintenanceStats.data && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Scheduled</span>
                        <Badge variant="secondary">{maintenanceStats.data.scheduled}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">In Progress</span>
                        <Badge variant="default">{maintenanceStats.data.inProgress}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <Badge variant="outline">{maintenanceStats.data.completed}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue</span>
                        <Badge variant="destructive">{maintenanceStats.data.overdue}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

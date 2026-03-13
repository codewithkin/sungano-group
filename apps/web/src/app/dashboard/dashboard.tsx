"use client";

import { useQuery } from "@tanstack/react-query";
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
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "destructive" | "success";
}) {
  const colorMap = {
    default: "text-muted-foreground",
    warning: "text-amber-500",
    destructive: "text-red-500",
    success: "text-emerald-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`size-4 ${colorMap[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview({
  session,
}: {
  session: typeof authClient.$Infer.Session;
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

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your fleet operations.
        </p>
      </div>

      {/* Quick stats */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Trucks"
            value={truckStats.data?.total ?? 0}
            description={`${truckStats.data?.available ?? 0} available`}
            icon={Truck}
          />
          <StatCard
            title="Trucks In Transit"
            value={truckStats.data?.inTransit ?? 0}
            description="Currently on the road"
            icon={Route}
            variant="success"
          />
          <StatCard
            title="Total Trailers"
            value={trailerStats.data?.total ?? 0}
            description={`${trailerStats.data?.available ?? 0} available`}
            icon={Package}
          />
          <StatCard
            title="Active Drivers"
            value={driverStats.data?.total ?? 0}
            description={`${driverStats.data?.available ?? 0} available`}
            icon={Users}
          />
          <StatCard
            title="Drivers On Trip"
            value={driverStats.data?.onTrip ?? 0}
            description="Currently assigned"
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Trucks in Maintenance"
            value={truckStats.data?.maintenance ?? 0}
            description="Being serviced"
            icon={Wrench}
            variant="warning"
          />
          <StatCard
            title="Overdue Maintenance"
            value={maintenanceStats.data?.overdue ?? 0}
            description="Requires attention"
            icon={AlertTriangle}
            variant={
              (maintenanceStats.data?.overdue ?? 0) > 0 ? "destructive" : "default"
            }
          />
          <StatCard
            title="Expiring Licenses"
            value={driverStats.data?.expiringLicenses ?? 0}
            description="Within 30 days"
            icon={AlertTriangle}
            variant={
              (driverStats.data?.expiringLicenses ?? 0) > 0
                ? "warning"
                : "default"
            }
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fleet Status</CardTitle>
            <CardDescription>Current fleet availability breakdown</CardDescription>
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

        <Card>
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

        <Card>
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
      </div>
    </div>
  );
}

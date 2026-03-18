"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sungano-group/ui/components/card";
import { Badge } from "@sungano-group/ui/components/badge";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
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

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "secondary",
  ON_TRIP: "default",
  OFF_DUTY: "outline",
  SUSPENDED: "destructive",
};

function formatDate(value?: string | Date | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

function formatMetric(value?: number | null, suffix = "%", decimals = 0) {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(decimals)}${suffix}`;
}

export default function DriverDashboard({ session }: { session: UserSession }) {
  const { data: rawData, isLoading, error } = useQuery(trpc.driver.me.queryOptions());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = rawData as any;

  const latestScore = data?.performanceScores?.[0];
  const currentAssignment = data?.assignments?.[0];

  const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  } as const;

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name ?? session.user.username}
          </p>
        </div>
        <p className="text-sm text-destructive">Could not load your driver data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">Driver Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.username}
        </p>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <motion.div {...fadeIn}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your current details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : data ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">{data.user.name ?? "Unnamed"}</p>
                    <p className="text-muted-foreground text-xs">{data.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={statusVariants[data.status] ?? "default"}>{data.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{data.phoneNumber ?? "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">License</span>
                    <span className="font-mono text-sm">{data.licenseNumber}</span>
                    <span className="text-xs text-muted-foreground">({data.licenseClass})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Expiry</span>
                    <span className="font-medium">{formatDate(data.licenseExpiry)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Assigned Truck</span>
                    <span className="font-medium">
                      {currentAssignment?.truck
                        ? `${currentAssignment.truck.unitNumber} — ${currentAssignment.truck.make} ${currentAssignment.truck.model}`
                        : "Unassigned"}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Performance KPIs</CardTitle>
              <CardDescription>Latest recorded period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-5 text-sm">
                  <KpiCard label="On-time Delivery" value={formatMetric(latestScore?.onTimeDeliveryPct)} />
                  <KpiCard label="Fuel Efficiency" value={formatMetric(latestScore?.fuelEfficiency, " mpg", 1)} />
                  <KpiCard label="Safety" value={formatMetric(latestScore?.safetyScore)} />
                  <KpiCard label="Hours Compliance" value={formatMetric(latestScore?.hoursCompliance)} />
                  <KpiCard label="Customer Rating" value={formatMetric(latestScore?.customerRating, " /5", 1)} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <motion.div {...fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Trips</CardTitle>
              <CardDescription>Your latest assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                ))
              ) : data?.trips?.length ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.trips.map((trip: any) => (
                  <div key={trip.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div>
                      <p className="font-medium">{trip.tripNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.truck ? `Truck ${trip.truck.unitNumber}` : "Unassigned"} · {formatDate(trip.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">{trip.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent trips</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Incidents</CardTitle>
              <CardDescription>Latest reported issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))
              ) : data?.incidents?.length ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.incidents.map((incident: any) => (
                  <div key={incident.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div>
                      <p className="font-medium">{incident.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(incident.reportedAt)}</p>
                    </div>
                    <Badge variant="outline">{incident.severity}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent incidents</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-md p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

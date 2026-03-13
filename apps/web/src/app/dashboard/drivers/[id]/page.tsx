"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, Shield, Calendar, Truck, Clock } from "lucide-react";

import { Button } from "@sungano-group/ui/components/button";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@sungano-group/ui/components/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import { Avatar, AvatarFallback } from "@sungano-group/ui/components/avatar";
import { Progress } from "@sungano-group/ui/components/progress";
import { trpc } from "@/utils/trpc";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default",
  ON_TRIP: "secondary",
  OFF_DUTY: "outline",
  SUSPENDED: "destructive",
};

export default function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: driver, isLoading } = useQuery(
    trpc.driver.byId.queryOptions({ id })
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!driver) return null;

  const currentAssignment = driver.assignments?.find((a) => a.isCurrent);
  const initials = driver.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/drivers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <Avatar className="size-12">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {driver.user.name}
            </h1>
            <Badge variant={statusColors[driver.status]}>
              {driver.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Mail className="size-3" /> {driver.user.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="size-3" /> {driver.phoneNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Shield className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">License</p>
              <p className="font-semibold font-mono text-sm">{driver.licenseNumber}</p>
              <p className="text-xs text-muted-foreground">Class {driver.licenseClass}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Calendar className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">License Expiry</p>
              <p className="font-semibold">
                {new Date(driver.licenseExpiry).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Truck className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Assigned Truck</p>
              <p className="font-semibold">
                {currentAssignment?.truck?.unitNumber ?? "None"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Calendar className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Hire Date</p>
              <p className="font-semibold">
                {new Date(driver.hireDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hours">Hours of Service</TabsTrigger>
          <TabsTrigger value="trips">Recent Trips</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{driver.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{driver.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{driver.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium font-mono">{driver.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Class</p>
                  <p className="font-medium">{driver.licenseClass}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medical Expiry</p>
                  <p className="font-medium">
                    {driver.medicalExpiryDate
                      ? new Date(driver.medicalExpiryDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">{driver.emergencyContact ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Phone</p>
                  <p className="font-medium">{driver.emergencyPhone ?? "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Hours of Service (Last 14 days)</CardTitle>
              <CardDescription>Daily driving and on-duty hours</CardDescription>
            </CardHeader>
            <CardContent>
              {driver.hoursLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto size-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hours logged yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {driver.hoursLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="min-w-[80px] text-sm font-medium">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span>Driving: {log.drivingHrs}h</span>
                          <span>On-duty: {log.onDutyHrs}h</span>
                          <span>Sleeper: {log.sleeperHrs}h</span>
                          <span>Off: {log.offDutyHrs}h</span>
                        </div>
                        <Progress value={(log.drivingHrs / 11) * 100} className="h-2" />
                        <p className="text-[10px] text-muted-foreground">
                          {log.drivingHrs}/11h driving limit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip #</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No trips yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    driver.trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium font-mono">{trip.tripNumber}</TableCell>
                        <TableCell>{trip.truck?.unitNumber ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{trip.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(trip.plannedStartTime).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(trip.plannedEndTime).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Scores</CardTitle>
              <CardDescription>Monthly performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {driver.performanceScores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>On-Time %</TableHead>
                      <TableHead>Fuel Eff.</TableHead>
                      <TableHead>Safety</TableHead>
                      <TableHead>HOS Compliance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driver.performanceScores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell>
                          {new Date(score.period).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                        </TableCell>
                        <TableCell>{score.onTimeDeliveryPct.toFixed(1)}%</TableCell>
                        <TableCell>{score.fuelEfficiency?.toFixed(1) ?? "—"} km/L</TableCell>
                        <TableCell>{score.safetyScore?.toFixed(0) ?? "—"}/100</TableCell>
                        <TableCell>{score.hoursCompliance?.toFixed(1) ?? "—"}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No assignment history
                      </TableCell>
                    </TableRow>
                  ) : (
                    driver.assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.truck.unitNumber} — {a.truck.make} {a.truck.model}
                        </TableCell>
                        <TableCell>{new Date(a.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{a.endDate ? new Date(a.endDate).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={a.isCurrent ? "default" : "outline"}>
                            {a.isCurrent ? "Current" : "Past"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

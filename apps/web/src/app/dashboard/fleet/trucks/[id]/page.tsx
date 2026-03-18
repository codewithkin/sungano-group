"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Truck, Fuel, Gauge, Calendar, User } from "lucide-react";

import { Button } from "@sungano-group/ui/components/button";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sungano-group/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sungano-group/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sungano-group/ui/components/table";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import { Separator } from "@sungano-group/ui/components/separator";
import { trpc } from "@/utils/trpc";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default",
  IN_TRANSIT: "secondary",
  MAINTENANCE: "outline",
  OUT_OF_SERVICE: "destructive",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  IN_TRANSIT: "In Transit",
  MAINTENANCE: "Maintenance",
  OUT_OF_SERVICE: "Out of Service",
};

const maintenanceStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

export default function TruckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: truck, isLoading } = useQuery(
    trpc.truck.byId.queryOptions({ id })
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!truck) return null;

  const currentAssignment = truck.assignments?.find((a) => a.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fleet/trucks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {truck.unitNumber}
            </h1>
            <Badge variant={statusColors[truck.status]}>
              {statusLabels[truck.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {truck.make} {truck.model} ({truck.year})
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Gauge className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Mileage</p>
              <p className="text-lg font-semibold">{truck.mileage.toLocaleString()} km</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Fuel className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fuel</p>
              <p className="text-lg font-semibold">{truck.fuelType}</p>
              <p className="text-xs text-muted-foreground">{truck.tankCapacityLitres}L tank</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Truck className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="text-lg font-semibold">{truck.licensePlate}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <User className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Assigned Driver</p>
              <p className="text-lg font-semibold">
                {currentAssignment?.driver?.user?.name ?? "Unassigned"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Logs</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-medium font-mono text-sm">{truck.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Make / Model</p>
                  <p className="font-medium">{truck.make} {truck.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-medium">{truck.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{truck.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-medium">{truck.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tank Capacity</p>
                  <p className="font-medium">{truck.tankCapacityLitres} litres</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="font-medium">
                    {new Date(truck.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Recent maintenance records</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {truck.maintenanceLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No maintenance records
                      </TableCell>
                    </TableRow>
                  ) : (
                    truck.maintenanceLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant={maintenanceStatusColors[log.status]}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(log.scheduledDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          R {log.cost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Logs</CardTitle>
              <CardDescription>Recent fuel entries</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Litres</TableHead>
                    <TableHead>Cost/L</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {truck.fuelLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No fuel logs yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    truck.fuelLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                        <TableCell>{log.station ?? "—"}</TableCell>
                        <TableCell>{log.litres}L</TableCell>
                        <TableCell>R {log.costPerLitre.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R {log.totalCost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Driver Assignments</CardTitle>
              <CardDescription>History of driver assignments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {truck.assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No assignments
                      </TableCell>
                    </TableRow>
                  ) : (
                    truck.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.driver?.user?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {assignment.endDate
                            ? new Date(assignment.endDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.isCurrent ? "default" : "outline"}>
                            {assignment.isCurrent ? "Current" : "Past"}
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

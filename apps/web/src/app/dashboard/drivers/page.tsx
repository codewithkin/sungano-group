"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Eye, Trash2, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@sungano-group/ui/components/button";
import { Input } from "@sungano-group/ui/components/input";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@sungano-group/ui/components/select";
import {
  Card, CardContent, CardDescription, CardHeader,
} from "@sungano-group/ui/components/card";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  Alert, AlertDescription, AlertTitle,
} from "@sungano-group/ui/components/alert";
import { trpc } from "@/utils/trpc";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default",
  ON_TRIP: "secondary",
  OFF_DUTY: "outline",
  SUSPENDED: "destructive",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.driver.list.queryOptions({
      search: search || undefined,
      status: statusFilter !== "all" ? (statusFilter as "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED") : undefined,
    })
  );

  const stats = useQuery(trpc.driver.stats.queryOptions());

  const deleteDriver = useMutation({
    ...trpc.driver.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.driver.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.driver.stats.queryKey() });
      toast.success("Driver removed");
    },
    onError: (err) => toast.error(err.message),
  });

  const isLicenseExpiringSoon = (expiry: string | Date) => {
    const d = new Date(expiry);
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d <= thirtyDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver roster</p>
        </div>
      </div>

      {/* Alerts */}
      {(stats.data?.expiringLicenses ?? 0) > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>License Expiry Warning</AlertTitle>
          <AlertDescription>
            {stats.data?.expiringLicenses} driver(s) have licenses expiring within 30 days.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.data?.total ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Available</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.data?.available ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>On Trip</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.data?.onTrip ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Off Duty</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{stats.data?.offDuty ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Suspended</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.data?.suspended ?? "—"}</p></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned Truck</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="mx-auto size-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No drivers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((driver: any) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{driver.user.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{driver.phoneNumber}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{driver.licenseNumber}</span>
                      <span className="text-xs text-muted-foreground ml-1">({driver.licenseClass})</span>
                    </TableCell>
                    <TableCell>
                      <span className={isLicenseExpiringSoon(driver.licenseExpiry) ? "text-red-600 font-medium" : ""}>
                        {new Date(driver.licenseExpiry).toLocaleDateString()}
                      </span>
                      {isLicenseExpiringSoon(driver.licenseExpiry) && (
                        <AlertTriangle className="inline ml-1 size-3 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[driver.status] ?? "default"}>
                        {statusLabels[driver.status] ?? driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {driver.assignments?.[0]?.truck ? (
                        <span className="text-sm">
                          {driver.assignments[0].truck.unitNumber} — {driver.assignments[0].truck.make} {driver.assignments[0].truck.model}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/drivers/${driver.id}`} className="flex w-full items-center">
                              <Eye className="mr-2 size-4" />View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { if (confirm("Remove this driver?")) deleteDriver.mutate({ id: driver.id }); }}
                          >
                            <Trash2 className="mr-2 size-4" />Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

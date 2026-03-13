"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@sungano-group/ui/components/button";
import { Input } from "@sungano-group/ui/components/input";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@sungano-group/ui/components/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@sungano-group/ui/components/select";
import { Label } from "@sungano-group/ui/components/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@sungano-group/ui/components/tabs";
import {
  Alert, AlertDescription, AlertTitle,
} from "@sungano-group/ui/components/alert";
import { trpc } from "@/utils/trpc";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

function ScheduleMaintenanceDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const trucks = useQuery(trpc.truck.list.queryOptions({ limit: 100 }));
  const trailers = useQuery(trpc.trailer.list.queryOptions({ limit: 100 }));

  const createMaintenance = useMutation({
    ...trpc.maintenance.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.stats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.upcoming.queryKey() });
      toast.success("Maintenance scheduled");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const truckId = form.get("truckId") as string;
    const trailerId = form.get("trailerId") as string;
    createMaintenance.mutate({
      type: form.get("type") as "SCHEDULED" | "UNSCHEDULED" | "INSPECTION",
      description: form.get("description") as string,
      cost: parseFloat(form.get("cost") as string) || 0,
      scheduledDate: form.get("scheduledDate") as string,
      vendorName: (form.get("vendorName") as string) || undefined,
      truckId: truckId && truckId !== "none" ? truckId : undefined,
      trailerId: trailerId && trailerId !== "none" ? trailerId : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
          <DialogDescription>Create a new maintenance entry.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="SCHEDULED">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="UNSCHEDULED">Unscheduled</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input id="scheduledDate" name="scheduledDate" type="date" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Oil change, brake inspection..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="truckId">Truck</Label>
              <Select name="truckId" defaultValue="none">
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trucks.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.unitNumber} — {t.make} {t.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trailerId">Trailer</Label>
              <Select name="trailerId" defaultValue="none">
                <SelectTrigger><SelectValue placeholder="Select trailer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trailers.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.unitNumber} — {t.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost (R)</Label>
              <Input id="cost" name="cost" type="number" placeholder="0" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor</Label>
              <Input id="vendorName" name="vendorName" placeholder="Service center name" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMaintenance.isPending}>
              {createMaintenance.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MaintenancePage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const stats = useQuery(trpc.maintenance.stats.queryOptions());
  const overdue = useQuery(trpc.maintenance.overdue.queryOptions());
  const upcoming = useQuery(trpc.maintenance.upcoming.queryOptions());
  const { data, isLoading } = useQuery(
    trpc.maintenance.list.queryOptions({
      status: statusFilter !== "all" ? (statusFilter as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") : undefined,
    })
  );

  const completeMaintenance = useMutation({
    ...trpc.maintenance.complete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.stats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.upcoming.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.maintenance.overdue.queryKey() });
      toast.success("Maintenance marked as complete");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Schedule and track vehicle maintenance</p>
        </div>
        <ScheduleMaintenanceDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Schedule Maintenance
          </Button>
        </ScheduleMaintenanceDialog>
      </div>

      {/* Overdue alert */}
      {(stats.data?.overdue ?? 0) > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Overdue Maintenance</AlertTitle>
          <AlertDescription>
            {stats.data?.overdue} maintenance item(s) are past their scheduled date.
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
          <CardHeader className="pb-2"><CardDescription>Scheduled</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.data?.scheduled ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>In Progress</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{stats.data?.inProgress ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Completed</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.data?.completed ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Overdue</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.data?.overdue ?? "—"}</p></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming (30d)</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="flex gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MaintenanceTable items={data?.items ?? []} isLoading={isLoading} onComplete={(id) => completeMaintenance.mutate({ id })} />
        </TabsContent>

        <TabsContent value="upcoming">
          <MaintenanceTable items={upcoming.data ?? []} isLoading={upcoming.isLoading} onComplete={(id) => completeMaintenance.mutate({ id })} />
        </TabsContent>

        <TabsContent value="overdue">
          <MaintenanceTable items={overdue.data ?? []} isLoading={overdue.isLoading} onComplete={(id) => completeMaintenance.mutate({ id })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MaintenanceTable({
  items,
  isLoading,
  onComplete,
}: {
  items: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    scheduledDate: string | Date;
    cost: number;
    vendorName?: string | null;
    truck?: { id: string; unitNumber: string; make: string; model: string } | null;
    trailer?: { id: string; unitNumber: string; type: string } | null;
  }>;
  isLoading: boolean;
  onComplete: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Wrench className="mx-auto size-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No maintenance records</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.truck ? (
                      <span>{item.truck.unitNumber} — {item.truck.make}</span>
                    ) : item.trailer ? (
                      <span>{item.trailer.unitNumber} — {item.trailer.type}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">{item.description}</TableCell>
                  <TableCell>{new Date(item.scheduledDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[item.status] ?? "outline"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">R {item.cost.toLocaleString()}</TableCell>
                  <TableCell>
                    {(item.status === "SCHEDULED" || item.status === "IN_PROGRESS") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComplete(item.id)}
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

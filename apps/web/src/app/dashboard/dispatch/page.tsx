"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Truck, Package, MapPin, Clock, ArrowRight,
  Play, CheckCircle2, XCircle, ChevronRight, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@sungano-group/ui/components/button";
import { Input } from "@sungano-group/ui/components/input";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@sungano-group/ui/components/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@sungano-group/ui/components/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@sungano-group/ui/components/select";
import { Label } from "@sungano-group/ui/components/label";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import { Checkbox } from "@sungano-group/ui/components/checkbox";
import { ScrollArea } from "@sungano-group/ui/components/scroll-area";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@sungano-group/ui/components/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import { Separator } from "@sungano-group/ui/components/separator";
import { trpc } from "@/utils/trpc";

const tripStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNED: "secondary",
  DISPATCHED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

const shipmentStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ASSIGNED: "default",
  PICKED_UP: "default",
  IN_TRANSIT: "default",
  DELIVERED: "outline",
  CANCELLED: "destructive",
};

/* ─────────── Create Trip Dialog ─────────── */
function CreateTripDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const drivers = useQuery(trpc.driver.list.queryOptions({ status: "AVAILABLE", limit: 100 }));
  const trucks = useQuery(trpc.truck.list.queryOptions({ status: "AVAILABLE", limit: 100 }));
  const trailers = useQuery(trpc.trailer.list.queryOptions({ status: "AVAILABLE", limit: 100 }));
  const unassigned = useQuery(trpc.shipment.unassigned.queryOptions());

  const createTrip = useMutation({
    ...trpc.trip.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.shipment.unassigned.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.shipment.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.shipment.stats.queryKey() });
      toast.success("Trip created successfully");
      setOpen(false);
      setSelectedShipments([]);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const trailerId = form.get("trailerId") as string;
    createTrip.mutate({
      driverId: form.get("driverId") as string,
      truckId: form.get("truckId") as string,
      trailerId: trailerId && trailerId !== "none" ? trailerId : undefined,
      plannedStartTime: form.get("plannedStartTime") as string,
      projectedEndTime: form.get("projectedEndTime") as string,
      plannedDistanceKm: parseFloat(form.get("plannedDistanceKm") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
      shipmentIds: selectedShipments.length > 0 ? selectedShipments : undefined,
    });
  };

  const toggleShipment = (id: string) => {
    setSelectedShipments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelectedShipments([]); }}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>Assign driver, vehicle and shipments to a trip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Driver *</Label>
              <Select name="driverId" required>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {drivers.data?.items.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{(d as any).user?.name ?? d.licenseNumber} — {d.licenseNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Truck *</Label>
              <Select name="truckId" required>
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  {trucks.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.unitNumber} — {t.make} {t.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trailer</Label>
              <Select name="trailerId" defaultValue="none">
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trailers.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.unitNumber} — {t.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input name="plannedDistanceKm" type="number" placeholder="Optional" />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input name="plannedStartTime" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label>Projected End Time *</Label>
              <Input name="projectedEndTime" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input name="notes" placeholder="Optional trip notes" />
          </div>

          {/* Shipment selection */}
          <div className="space-y-2">
            <Label>Assign Shipments ({selectedShipments.length} selected)</Label>
            <Card>
              <ScrollArea className="h-[180px]">
                <div className="p-3 space-y-2">
                  {(unassigned.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No unassigned shipments</p>
                  ) : (
                    unassigned.data?.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleShipment(s.id)}
                      >
                        <Checkbox checked={selectedShipments.includes(s.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.referenceNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.customer.name} — {s.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(s.requestedPickup).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Trip Detail Sheet ─────────── */
function TripDetailSheet({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const trip = useQuery(trpc.trip.byId.queryOptions({ id: tripId }));

  const dispatchTrip = useMutation({
    ...trpc.trip.dispatch.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.byId.queryKey({ id: tripId }) });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      toast.success("Trip dispatched");
    },
    onError: (err) => toast.error(err.message),
  });

  const startTrip = useMutation({
    ...trpc.trip.start.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.byId.queryKey({ id: tripId }) });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      toast.success("Trip started");
    },
    onError: (err) => toast.error(err.message),
  });

  const completeTrip = useMutation({
    ...trpc.trip.complete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.byId.queryKey({ id: tripId }) });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.shipment.stats.queryKey() });
      toast.success("Trip completed");
    },
    onError: (err) => toast.error(err.message),
  });

  const finishTrip = useMutation({
    ...trpc.trip.finishTrip.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trip.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trip.byId.queryKey({ id: tripId }) });
      queryClient.invalidateQueries({ queryKey: trpc.trip.stats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.shipment.stats.queryKey() });
      toast.success("Trip finished");
    },
    onError: (err) => toast.error(err.message),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = trip.data as any;

  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t?.tripNumber ?? "Loading..."}</SheetTitle>
          <SheetDescription>Trip details and actions</SheetDescription>
        </SheetHeader>
        {!t ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            {/* Status + actions */}
            <div className="flex items-center gap-3">
              <Badge variant={tripStatusColors[t.status]}>{t.status}</Badge>
              {t.status === "PLANNED" && (
                <Button size="sm" onClick={() => dispatchTrip.mutate({ id: t.id })}>
                  <Play className="mr-1 size-3" /> Dispatch
                </Button>
              )}
              {t.status === "DISPATCHED" && (
                <Button size="sm" onClick={() => startTrip.mutate({ id: t.id })}>
                  <Play className="mr-1 size-3" /> Start
                </Button>
              )}
              {t.status === "IN_PROGRESS" && (
                <div className="space-y-2">
                  <Button size="sm" onClick={() => finishTrip.mutate({ id: t.id })} className="w-full">
                    <CheckCircle2 className="mr-1 size-3" /> Finish Trip
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => completeTrip.mutate({ id: t.id })} className="w-full">
                    <CheckCircle2 className="mr-1 size-3" /> Complete (Legacy)
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Resources */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Driver</p>
                <p className="font-medium">{t.driver.user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Truck</p>
                <p className="font-medium">{t.truck.unitNumber} — {t.truck.make}</p>
              </div>
              {t.trailer && (
                <div>
                  <p className="text-muted-foreground">Trailer</p>
                  <p className="font-medium">{t.trailer.unitNumber} — {t.trailer.type}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-medium">{t.plannedDistanceKm ? `${t.plannedDistanceKm} km` : "—"}</p>
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase">Schedule</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Planned Start</p>
                  <p>{new Date(t.plannedStartTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projected End</p>
                  <p>{new Date(t.projectedEndTime).toLocaleString()}</p>
                </div>
                {t.actualStartTime && (
                  <div>
                    <p className="text-muted-foreground">Actual Start</p>
                    <p>{new Date(t.actualStartTime).toLocaleString()}</p>
                  </div>
                )}
                {t.endTime && (
                  <div>
                    <p className="text-muted-foreground">Actual End</p>
                    <p>{new Date(t.endTime).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Shipments */}
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Shipments ({t.shipments.length})
              </p>
              {t.shipments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shipments assigned</p>
              ) : (
                <div className="space-y-2">
                  {t.shipments.map((s: any) => (
                    <Card key={s.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{s.referenceNumber}</p>
                          <p className="text-xs text-muted-foreground">{s.customer.name}</p>
                        </div>
                        <Badge variant={shipmentStatusColors[s.status] ?? "outline"} className="text-xs">{s.status}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        <span className="truncate">{s.pickupAddress}</span>
                        <ArrowRight className="size-3 shrink-0" />
                        <span className="truncate">{s.deliveryAddress}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Stops */}
            {t.stops.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Stops ({t.stops.length})
                  </p>
                  <div className="space-y-2">
                    {t.stops.map((stop: any, i: number) => (
                      <div key={stop.id} className="flex items-start gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </div>
                          {i < t.stops.length - 1 && <div className="w-px h-6 bg-border" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{stop.type}</Badge>
                            <Badge variant={stop.status === "COMPLETED" ? "outline" : "secondary"} className="text-xs">
                              {stop.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{stop.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {t.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Notes</p>
                  <p className="text-sm">{t.notes}</p>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ─────────── Main Dispatch Page ─────────── */
export default function DispatchPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const tripStats = useQuery(trpc.trip.stats.queryOptions());
  const shipmentStats = useQuery(trpc.shipment.stats.queryOptions());
  const unassigned = useQuery(trpc.shipment.unassigned.queryOptions());

  const trips = useQuery(
    trpc.trip.list.queryOptions({
      status: statusFilter !== "all" ? (statusFilter as "PLANNED" | "DISPATCHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") : undefined,
      search: search || undefined,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispatch Board</h1>
          <p className="text-muted-foreground">Plan trips, assign shipments and manage dispatch operations</p>
        </div>
        <CreateTripDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Create Trip
          </Button>
        </CreateTripDialog>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Unassigned</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{shipmentStats.data?.pending ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>In Transit</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{shipmentStats.data?.inTransit ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Planned Trips</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{tripStats.data?.planned ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Dispatched</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-indigo-600">{tripStats.data?.dispatched ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Active Trips</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{tripStats.data?.inProgress ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Completed</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{tripStats.data?.completed ?? "—"}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unassigned shipments panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" />
              Unassigned Shipments
            </CardTitle>
            <CardDescription>{unassigned.data?.length ?? 0} awaiting dispatch</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 pr-2">
                {unassigned.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (unassigned.data ?? []).length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                    <p className="text-sm text-muted-foreground">All shipments assigned!</p>
                  </div>
                ) : (
                  unassigned.data?.map((s) => (
                    <Card key={s.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{s.referenceNumber}</p>
                        <Badge variant="secondary" className="text-xs">PENDING</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.customer.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        <span className="truncate max-w-[100px]">{s.pickupAddress}</span>
                        <ArrowRight className="size-3 shrink-0" />
                        <span className="truncate max-w-[100px]">{s.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        Pickup: {new Date(s.requestedPickup).toLocaleDateString()}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Trips table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="size-4" />
              Trips
            </CardTitle>
            <CardDescription>All trips with their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search trip number..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip #</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipments</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (trips.data?.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Truck className="mx-auto size-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No trips found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  trips.data?.items.map((trip: any) => (
                    <TripDetailSheet key={trip.id} tripId={trip.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{trip.tripNumber}</TableCell>
                        <TableCell>{trip.driver.user.name}</TableCell>
                        <TableCell>{trip.truck.unitNumber}</TableCell>
                        <TableCell>
                          <Badge variant={tripStatusColors[trip.status]}>{trip.status}</Badge>
                        </TableCell>
                        <TableCell>{trip._count.shipments}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(trip.plannedStartTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    </TripDetailSheet>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

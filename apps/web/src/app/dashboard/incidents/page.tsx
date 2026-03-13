"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, AlertTriangle, Shield, CheckCircle2, MapPin,
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@sungano-group/ui/components/select";
import { Label } from "@sungano-group/ui/components/label";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  Alert, AlertDescription, AlertTitle,
} from "@sungano-group/ui/components/alert";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@sungano-group/ui/components/sheet";
import { Separator } from "@sungano-group/ui/components/separator";
import { trpc } from "@/utils/trpc";

const severityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

/* ─── Report Incident Dialog ─── */
function ReportIncidentDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const drivers = useQuery(trpc.driver.list.queryOptions({ limit: 100 }));
  const trucks = useQuery(trpc.truck.list.queryOptions({ limit: 100 }));

  const report = useMutation({
    ...trpc.analytics.reportIncident.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.analytics.incidents.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.analytics.incidentStats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.analytics.kpis.queryKey() });
      toast.success("Incident reported");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const driverId = f.get("driverId") as string;
    const truckId = f.get("truckId") as string;
    report.mutate({
      type: f.get("type") as "ACCIDENT" | "BREAKDOWN" | "DELAY" | "COMPLIANCE" | "THEFT" | "WEATHER" | "OTHER",
      severity: f.get("severity") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      description: f.get("description") as string,
      location: (f.get("location") as string) || undefined,
      driverId: driverId && driverId !== "none" ? driverId : undefined,
      truckId: truckId && truckId !== "none" ? truckId : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>Log a new safety or operational incident.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue="OTHER">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ACCIDENT", "BREAKDOWN", "DELAY", "COMPLIANCE", "THEFT", "WEATHER", "OTHER"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select name="severity" defaultValue="MEDIUM">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input name="description" placeholder="What happened?" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Location</Label>
              <Input name="location" placeholder="e.g. N1 near Polokwane" />
            </div>
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select name="driverId" defaultValue="none">
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {drivers.data?.items.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Truck</Label>
              <Select name="truckId" defaultValue="none">
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trucks.data?.items.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.unitNumber} — {t.make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={report.isPending}>
              {report.isPending ? "Submitting..." : "Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Resolve Sheet ─── */
function ResolveSheet({ incidentId, children }: { incidentId: string; children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const incident = useQuery(trpc.analytics.incidentById.queryOptions({ id: incidentId }));

  const resolve = useMutation({
    ...trpc.analytics.resolveIncident.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.analytics.incidents.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.analytics.incidentStats.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.analytics.kpis.queryKey() });
      toast.success("Incident resolved");
    },
    onError: (err) => toast.error(err.message),
  });

  const [resolution, setResolution] = useState("");

  const inc = incident.data;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Incident Details</SheetTitle>
          <SheetDescription>View and resolve this incident</SheetDescription>
        </SheetHeader>
        {!inc ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Badge variant={severityColors[inc.severity]}>{inc.severity}</Badge>
              <Badge variant="outline">{inc.type}</Badge>
              {inc.resolvedAt ? (
                <Badge variant="outline" className="text-emerald-600">RESOLVED</Badge>
              ) : (
                <Badge variant="destructive">OPEN</Badge>
              )}
            </div>

            <Separator />

            <div className="text-sm space-y-2">
              <p>{inc.description}</p>
              {inc.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3" /> {inc.location}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Driver</p>
                <p className="font-medium">{inc.driver?.user.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Truck</p>
                <p className="font-medium">{inc.truck ? `${inc.truck.unitNumber} — ${inc.truck.make}` : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reported</p>
                <p>{new Date(inc.reportedAt).toLocaleString()}</p>
              </div>
              {inc.resolvedAt && (
                <div>
                  <p className="text-muted-foreground">Resolved</p>
                  <p>{new Date(inc.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            {inc.resolution && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Resolution</p>
                  <p className="text-sm">{inc.resolution}</p>
                </div>
              </>
            )}

            {!inc.resolvedAt && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Input
                    placeholder="How was this resolved?"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    disabled={!resolution.trim() || resolve.isPending}
                    onClick={() => resolve.mutate({ id: inc.id, resolution })}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    {resolve.isPending ? "Resolving..." : "Mark Resolved"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main Page ─── */
export default function IncidentsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");

  const stats = useQuery(trpc.analytics.incidentStats.queryOptions());
  const incidents = useQuery(
    trpc.analytics.incidents.queryOptions({
      severity: severityFilter !== "all" ? (severityFilter as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") : undefined,
      resolved: resolvedFilter === "all" ? undefined : resolvedFilter === "resolved",
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Track and manage safety & operational incidents</p>
        </div>
        <ReportIncidentDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Report Incident
          </Button>
        </ReportIncidentDialog>
      </div>

      {/* Alert for critical */}
      {(stats.data?.bySeverity.find((s) => s.severity === "CRITICAL")?.count ?? 0) > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Critical Incidents</AlertTitle>
          <AlertDescription>
            {stats.data?.bySeverity.find((s) => s.severity === "CRITICAL")?.count} critical incident(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.data?.total ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Open</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.data?.open ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Resolved</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.data?.resolved ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Resolution Rate</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.data && stats.data.total > 0
                ? `${Math.round((stats.data.resolved / stats.data.total) * 100)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Severities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (incidents.data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Shield className="mx-auto size-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No incidents found</p>
                  </TableCell>
                </TableRow>
              ) : (
                incidents.data?.items.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell><Badge variant="outline">{inc.type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={severityColors[inc.severity]}>{inc.severity}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{inc.description}</TableCell>
                    <TableCell className="text-sm">{inc.driver?.user.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{inc.truck?.unitNumber ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inc.reportedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {inc.resolvedAt ? (
                        <Badge variant="outline" className="text-emerald-600">Resolved</Badge>
                      ) : (
                        <Badge variant="destructive">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ResolveSheet incidentId={inc.id}>
                        <Button variant="ghost" size="sm">View</Button>
                      </ResolveSheet>
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

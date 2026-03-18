"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@sungano-group/ui/components/select";
import { Label } from "@sungano-group/ui/components/label";
import {
  Card, CardContent, CardDescription, CardHeader,
} from "@sungano-group/ui/components/card";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
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

const trailerTypeLabels: Record<string, string> = {
  FLATBED: "Flatbed",
  REEFER: "Reefer",
  DRY_VAN: "Dry Van",
  TANKER: "Tanker",
  LOWBED: "Lowbed",
  CURTAIN_SIDE: "Curtain Side",
  CONTAINER: "Container",
};

function AddTrailerDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createTrailer = useMutation({
    ...trpc.trailer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trailer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trailer.stats.queryKey() });
      toast.success("Trailer added successfully");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createTrailer.mutate({
      unitNumber: form.get("unitNumber") as string,
      type: form.get("type") as "FLATBED" | "REEFER" | "DRY_VAN" | "TANKER" | "LOWBED" | "CURTAIN_SIDE" | "CONTAINER",
      capacityTonnes: parseFloat(form.get("capacityTonnes") as string),
      licensePlate: form.get("licensePlate") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Trailer</DialogTitle>
          <DialogDescription>Enter the trailer details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input id="unitNumber" name="unitNumber" placeholder="TRL-005" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="DRY_VAN">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(trailerTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityTonnes">Capacity (tonnes)</Label>
              <Input id="capacityTonnes" name="capacityTonnes" type="number" placeholder="30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" name="licensePlate" placeholder="GP-TRL-005" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createTrailer.isPending}>
              {createTrailer.isPending ? "Adding..." : "Add Trailer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TrailersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.trailer.list.queryOptions({
      search: search || undefined,
      status: statusFilter !== "all" ? (statusFilter as "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "OUT_OF_SERVICE") : undefined,
    })
  );

  const deleteTrailer = useMutation({
    ...trpc.trailer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.trailer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.trailer.stats.queryKey() });
      toast.success("Trailer deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const stats = useQuery(trpc.trailer.stats.queryOptions());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trailers</h1>
          <p className="text-muted-foreground">Manage your trailer fleet</p>
        </div>
        <AddTrailerDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Trailer
          </Button>
        </AddTrailerDialog>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.data?.total ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Available</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.data?.available ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>In Transit</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.data?.inTransit ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Maintenance</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{stats.data?.maintenance ?? "—"}</p></CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search trailers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Package className="mx-auto size-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No trailers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((trailer) => (
                  <TableRow key={trailer.id}>
                    <TableCell className="font-medium">{trailer.unitNumber}</TableCell>
                    <TableCell>{trailerTypeLabels[trailer.type] ?? trailer.type}</TableCell>
                    <TableCell>{trailer.licensePlate}</TableCell>
                    <TableCell>{trailer.capacityTonnes} tonnes</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[trailer.status] ?? "default"}>
                        {statusLabels[trailer.status] ?? trailer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Pencil className="mr-2 size-4" />Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { if (confirm("Delete this trailer?")) deleteTrailer.mutate({ id: trailer.id }); }}
                          >
                            <Trash2 className="mr-2 size-4" />Delete
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

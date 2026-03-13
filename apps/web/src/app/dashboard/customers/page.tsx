"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, Building2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@sungano-group/ui/components/button";
import { Input } from "@sungano-group/ui/components/input";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@sungano-group/ui/components/dialog";
import { Label } from "@sungano-group/ui/components/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import { trpc } from "@/utils/trpc";

/* ─── Add Customer Dialog ─── */
function AddCustomerDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const create = useMutation({
    ...trpc.customer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.customer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.customer.stats.queryKey() });
      toast.success("Customer added");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate({
      name: f.get("name") as string,
      email: (f.get("email") as string) || undefined,
      phone: (f.get("phone") as string) || undefined,
      address: (f.get("address") as string) || undefined,
      city: (f.get("city") as string) || undefined,
      province: (f.get("province") as string) || undefined,
      postalCode: (f.get("postalCode") as string) || undefined,
      notes: (f.get("notes") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Register a new customer in the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Company / Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Shoprite Holdings" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="contact@company.co.za" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+27..." />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Street address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Johannesburg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" placeholder="Gauteng" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" placeholder="2000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ─── */
export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const stats = useQuery(trpc.customer.stats.queryOptions());
  const { data, isLoading } = useQuery(
    trpc.customer.list.queryOptions({ search: search || undefined })
  );

  const deleteCustomer = useMutation({
    ...trpc.customer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.customer.list.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.customer.stats.queryKey() });
      toast.success("Customer deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <AddCustomerDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Add Customer
          </Button>
        </AddCustomerDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Customers</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.data?.total ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>With Active Shipments</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.data?.withActiveShipments ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Added (30d)</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.data?.recentlyAdded ?? "—"}</p></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Shipments</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Building2 className="mx-auto size-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-sm">
                        {c.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="size-3" /> {c.email}
                          </div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="size-3" /> {c.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.city || c.province ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3" />
                          {[c.city, c.province].filter(Boolean).join(", ")}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{c._count.shipments}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋯</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${c.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Delete this customer?")) deleteCustomer.mutate({ id: c.id });
                            }}
                          >
                            Delete
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

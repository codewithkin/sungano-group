"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@sungano-group/ui/components/button";
import { Badge } from "@sungano-group/ui/components/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import { Separator } from "@sungano-group/ui/components/separator";
import { trpc } from "@/utils/trpc";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ASSIGNED: "default",
  PICKED_UP: "default",
  IN_TRANSIT: "default",
  DELIVERED: "outline",
  CANCELLED: "destructive",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useQuery(trpc.customer.byId.queryOptions({ id }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!customer) return <p>Customer not found.</p>;

  const delivered = customer.shipments.filter((s) => s.status === "DELIVERED").length;
  const active = customer.shipments.filter((s) =>
    ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(s.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-6" />
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Customer since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Shipments</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold">{customer._count.shipments}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Active</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{active}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Delivered</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{delivered}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Cancelled</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {customer.shipments.filter((s) => s.status === "CANCELLED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  {customer.address && <p>{customer.address}</p>}
                  <p>{[customer.city, customer.province, customer.postalCode].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <>
                <Separator />
                <p className="text-muted-foreground">{customer.notes}</p>
              </>
            )}
            {!customer.email && !customer.phone && !customer.address && (
              <p className="text-muted-foreground">No contact details recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4" />
            Recent Shipments
          </CardTitle>
          <CardDescription>Latest 20 shipments for this customer</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested Pickup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No shipments yet
                  </TableCell>
                </TableRow>
              ) : (
                customer.shipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.referenceNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate max-w-[120px]">{s.pickupAddress}</span>
                        <ArrowRight className="size-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{s.deliveryAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[s.status] ?? "outline"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.requestedPickup).toLocaleDateString()}
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

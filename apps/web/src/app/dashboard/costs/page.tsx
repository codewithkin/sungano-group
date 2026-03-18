"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Fuel, DollarSign, Wrench, TrendingUp, Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

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
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@sungano-group/ui/components/tabs";
import { trpc } from "@/utils/trpc";

const PIE_COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#6b7280"];

const categoryLabels: Record<string, string> = {
  FUEL: "Fuel",
  TOLLS: "Tolls",
  MAINTENANCE: "Maintenance",
  ACCOMMODATION: "Accommodation",
  FINES: "Fines",
  PERMITS: "Permits",
  OTHER: "Other",
};

/* ─── Add Expense Dialog ─── */
function AddExpenseDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const create = useMutation({
    ...trpc.cost.createExpense.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.cost.expenses.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.summary.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.monthlyCosts.queryKey() });
      toast.success("Expense recorded");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate({
      category: f.get("category") as "FUEL" | "TOLLS" | "MAINTENANCE" | "ACCOMMODATION" | "FINES" | "PERMITS" | "OTHER",
      description: f.get("description") as string,
      amount: parseFloat(f.get("amount") as string),
      date: f.get("date") as string,
      tripId: (f.get("tripId") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
          <DialogDescription>Add an operational expense.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue="OTHER">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input name="description" placeholder="e.g. N1 toll gate" required />
            </div>
            <div className="space-y-2">
              <Label>Amount (R)</Label>
              <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Add Fuel Log Dialog ─── */
function AddFuelLogDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const trucks = useQuery(trpc.truck.list.queryOptions({ limit: 100 }));

  const create = useMutation({
    ...trpc.cost.createFuelLog.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.cost.fuelLogs.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.summary.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.cost.monthlyCosts.queryKey() });
      toast.success("Fuel log recorded");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const litres = parseFloat(f.get("litres") as string);
    const costPerLitre = parseFloat(f.get("costPerLitre") as string);
    create.mutate({
      truckId: f.get("truckId") as string,
      litres,
      costPerLitre,
      totalCost: litres * costPerLitre,
      mileageAt: parseInt(f.get("mileageAt") as string),
      station: (f.get("station") as string) || undefined,
      date: f.get("date") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Fuel</DialogTitle>
          <DialogDescription>Record a fuel purchase.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Truck</Label>
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
              <Label>Litres</Label>
              <Input name="litres" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label>Cost/Litre (R)</Label>
              <Input name="costPerLitre" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label>Mileage (km)</Label>
              <Input name="mileageAt" type="number" required />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Station</Label>
              <Input name="station" placeholder="e.g. Shell N1 Pretoria" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Log Fuel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ─── */
export default function CostDashboardPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const summary = useQuery(trpc.cost.summary.queryOptions());
  const monthly = useQuery(trpc.cost.monthlyCosts.queryOptions({ months: 6 }));
  const fuelLogs = useQuery(trpc.cost.fuelLogs.queryOptions());
  const expenses = useQuery(
    trpc.cost.expenses.queryOptions({
      category: categoryFilter !== "all" ? (categoryFilter as "FUEL" | "TOLLS" | "MAINTENANCE" | "ACCOMMODATION" | "FINES" | "PERMITS" | "OTHER") : undefined,
    })
  );

  const s = summary.data;

  const pieData = s?.expenses.byCategory.map((c) => ({
    name: categoryLabels[c.category] ?? c.category,
    value: c.total,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Costs & Expenses</h1>
          <p className="text-muted-foreground">
            {s ? `${new Date(s.period.from).toLocaleDateString()} — ${new Date(s.period.to).toLocaleDateString()}` : "Last 30 days overview"}
          </p>
        </div>
        <div className="flex gap-2">
          <AddFuelLogDialog>
            <Button variant="outline">
              <Fuel className="mr-2 size-4" />
              Log Fuel
            </Button>
          </AddFuelLogDialog>
          <AddExpenseDialog>
            <Button>
              <Plus className="mr-2 size-4" />
              Record Expense
            </Button>
          </AddExpenseDialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><DollarSign className="size-3" /> Grand Total</CardDescription>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">R {(s?.grandTotal ?? 0).toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Fuel className="size-3" /> Fuel</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">R {(s?.fuel.totalCost ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{(s?.fuel.totalLitres ?? 0).toLocaleString()} litres</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Receipt className="size-3" /> Expenses</CardDescription>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">R {(s?.expenses.total ?? 0).toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Wrench className="size-3" /> Maintenance</CardDescription>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">R {(s?.maintenance.total ?? 0).toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4" />
              Monthly Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthly.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => {
                    if (typeof value === 'number') return `R ${value.toLocaleString()}`;
                    return value;
                  }} />
                  <Legend />
                  <Bar dataKey="fuel" stackId="a" fill="#2563eb" name="Fuel" />
                  <Bar dataKey="expenses" stackId="a" fill="#d97706" name="Expenses" />
                  <Bar dataKey="maintenance" stackId="a" fill="#059669" name="Maintenance" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
            <CardDescription>By category (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => {
                    if (typeof value === 'number') return `R ${value.toLocaleString()}`;
                    return value;
                  }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <div className="flex gap-3 mb-4">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (expenses.data?.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No expenses recorded</TableCell>
                    </TableRow>
                  ) : (
                    expenses.data?.items.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell><Badge variant="outline">{categoryLabels[exp.category] ?? exp.category}</Badge></TableCell>
                        <TableCell className="max-w-[250px] truncate">{exp.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{exp.trip?.tripNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(exp.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-medium">R {exp.amount.toLocaleString()}</TableCell>
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck</TableHead>
                    <TableHead>Litres</TableHead>
                    <TableHead>R/Litre</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelLogs.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (fuelLogs.data?.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No fuel logs</TableCell>
                    </TableRow>
                  ) : (
                    fuelLogs.data?.items.map((fl) => (
                      <TableRow key={fl.id}>
                        <TableCell className="font-medium">{fl.truck.unitNumber}</TableCell>
                        <TableCell>{fl.litres.toFixed(1)}L</TableCell>
                        <TableCell>R {fl.costPerLitre.toFixed(2)}</TableCell>
                        <TableCell>{fl.mileageAt.toLocaleString()} km</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fl.station ?? "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(fl.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-medium">R {fl.totalCost.toLocaleString()}</TableCell>
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

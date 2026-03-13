"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3, Truck, Package, Users, Route, TrendingUp,
  Shield, Star, Clock, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

import { Badge } from "@sungano-group/ui/components/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@sungano-group/ui/components/card";
import { Progress } from "@sungano-group/ui/components/progress";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sungano-group/ui/components/table";
import { Separator } from "@sungano-group/ui/components/separator";
import { trpc } from "@/utils/trpc";

export default function AnalyticsPage() {
  const kpis = useQuery(trpc.analytics.kpis.queryOptions());
  const avgPerf = useQuery(trpc.analytics.averagePerformance.queryOptions());
  const performances = useQuery(trpc.analytics.performanceScores.queryOptions({ limit: 20 }));
  const incidentStats = useQuery(trpc.analytics.incidentStats.queryOptions());

  const k = kpis.data;
  const ap = avgPerf.data;

  const radarData = ap
    ? [
        { metric: "On-Time", value: ap.avg.onTimeDelivery },
        { metric: "Safety", value: ap.avg.safety },
        { metric: "HOS Compliance", value: ap.avg.hoursCompliance },
        { metric: "Fuel Efficiency", value: Math.min(ap.avg.fuelEfficiency, 100) },
        { metric: "Rating", value: (ap.avg.customerRating / 5) * 100 },
      ]
    : [];

  const incidentTypeData = incidentStats.data?.byType.map((t) => ({
    name: t.type,
    count: t.count,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance monitoring, KPIs & risk overview (30 days)</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Route className="size-3" /> Trips</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{k?.totalTrips ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{k?.completedTrips ?? 0} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><TrendingUp className="size-3" /> Trip Completion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{k?.tripCompletionRate ?? 0}%</p>
            <Progress value={k?.tripCompletionRate ?? 0} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Package className="size-3" /> Delivery Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{k?.deliveryRate ?? 0}%</p>
            <Progress value={k?.deliveryRate ?? 0} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Users className="size-3" /> Active Drivers</CardDescription>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{k?.activeDrivers ?? "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><AlertTriangle className="size-3" /> Open Incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{k?.openIncidents ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart — fleet performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="size-4" />
              Fleet Performance Average
            </CardTitle>
            <CardDescription>Across {ap?.count ?? 0} scored periods</CardDescription>
          </CardHeader>
          <CardContent>
            {avgPerf.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : radarData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">No performance data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" className="text-xs" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                  <Radar name="Average" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Incident breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Incidents by Type
            </CardTitle>
            <CardDescription>
              {incidentStats.data?.total ?? 0} total — {incidentStats.data?.open ?? 0} open
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incidentStats.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : incidentTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">No incidents reported</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incidentTypeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" name="Incidents" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open incident severity */}
      {(incidentStats.data?.bySeverity ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {incidentStats.data?.bySeverity.map((s) => (
                <div key={s.severity} className="flex items-center gap-2">
                  <Badge
                    variant={
                      s.severity === "CRITICAL" ? "destructive" :
                      s.severity === "HIGH" ? "destructive" :
                      s.severity === "MEDIUM" ? "default" : "secondary"
                    }
                  >
                    {s.severity}
                  </Badge>
                  <span className="text-lg font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver performance table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="size-4" />
            Driver Performance Scores
          </CardTitle>
          <CardDescription>Recent performance periods</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>On-Time %</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>HOS Compliance</TableHead>
                <TableHead>Fuel Eff.</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (performances.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No performance scores recorded
                  </TableCell>
                </TableRow>
              ) : (
                performances.data?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.driver.user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.period).toLocaleDateString("en-ZA", { year: "numeric", month: "short" })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={p.onTimeDeliveryPct} className="h-1.5 w-16" />
                        <span className="text-sm">{p.onTimeDeliveryPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.safetyScore != null ? `${p.safetyScore}%` : "—"}</TableCell>
                    <TableCell>{p.hoursCompliance != null ? `${p.hoursCompliance}%` : "—"}</TableCell>
                    <TableCell>{p.fuelEfficiency != null ? `${p.fuelEfficiency.toFixed(1)}` : "—"}</TableCell>
                    <TableCell>
                      {p.customerRating != null ? (
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span>{p.customerRating.toFixed(1)}</span>
                        </div>
                      ) : "—"}
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

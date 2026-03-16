import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@sungano-group/env/web";

import DashboardOverview from "./dashboard";
import DriverDashboard from "./driver-dashboard";

export default async function DashboardPage() {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      cookie: (await headers()).get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const data = (await res.json()) as { user: unknown };
  if (!data?.user || typeof data.user !== "object") {
    redirect("/login");
  }

  if ((data as { user: any }).user?.role === "DRIVER") {
    return <DriverDashboard session={data as { user: any }} />;
  }

  return <DashboardOverview session={data as { user: any }} />;
}

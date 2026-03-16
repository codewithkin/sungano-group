import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@sungano-group/env/web";

export default async function Home() {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      cookie: (await headers()).get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (res.ok) {
    redirect("/dashboard");
  }

  redirect("/login");
}

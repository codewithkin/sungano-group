import { Input } from "@sungano-group/ui/components/input";
import { Label } from "@sungano-group/ui/components/label";
import Image from "next/image";

export default function Login () {
  return (
    <section className="grid md:grid-cols-2">
      {/* Actual login form */}
      <article className="px-40 py-36">
        {/* Welcome message and logo */}
        <article className="flex flex-col gap-4 pb-8">
          <Image
          src="/logo.jpeg"
          alt="Sungano Group Logo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <h1 className="text-xl font-medium">Welcome to Sungano Group</h1>
        </article>

        <article className="flex flex-col gap-4">
          <article className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="joshuasmith"
          />
        </article>

        <article className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="********"
            type="password"
          />
        </article>
        </article>
      </article>

      {/* White truck creative */}
      <article></article>
    </section>
  )
}
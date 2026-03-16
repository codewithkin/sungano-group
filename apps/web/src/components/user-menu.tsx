import { Button } from "@sungano-group/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sungano-group/ui/components/dropdown-menu";
import { Skeleton } from "@sungano-group/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "@/lib/auth-client";

export default function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });

  const { mutateAsync: signOut, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      router.push("/");
    },
  });

  if (isLoading) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!data?.user) {
    return (
      <Link href="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  const user = data.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {user.name ?? user.username}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{user.email ?? user.username}</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              signOut();
            }}
            disabled={isLoggingOut}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  CheckCheck,
  Route,
  Truck,
  AlertTriangle,
  Info,
  Trash2,
} from "lucide-react";
function formatDistanceToNow(date: Date, opts?: { addSuffix?: boolean }): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  let str: string;
  if (seconds < 60) str = "just now";
  else if (seconds < 3600) str = `${Math.floor(seconds / 60)}m ago`;
  else if (seconds < 86400) str = `${Math.floor(seconds / 3600)}h ago`;
  else str = `${Math.floor(seconds / 86400)}d ago`;
  return opts?.addSuffix ? str : str;
}

import { toast } from "sonner";

import { Button } from "@sungano-group/ui/components/button";
import { Badge } from "@sungano-group/ui/components/badge";
import { ScrollArea } from "@sungano-group/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@sungano-group/ui/components/sheet";
import { Separator } from "@sungano-group/ui/components/separator";
import { cn } from "@sungano-group/ui/lib/utils";
import { trpc } from "@/utils/trpc";

type NotificationType =
  | "TRIP_CREATED"
  | "TRIP_DISPATCHED"
  | "TRIP_STARTED"
  | "TRIP_FINISHED"
  | "TRIP_CANCELLED"
  | "MAINTENANCE_DUE"
  | "LICENSE_EXPIRY"
  | "GENERAL";

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "TRIP_CREATED":
    case "TRIP_DISPATCHED":
    case "TRIP_STARTED":
    case "TRIP_FINISHED":
    case "TRIP_CANCELLED":
      return <Route className="size-4 shrink-0 text-blue-500" />;
    case "MAINTENANCE_DUE":
      return <Truck className="size-4 shrink-0 text-amber-500" />;
    case "LICENSE_EXPIRY":
      return <AlertTriangle className="size-4 shrink-0 text-red-500" />;
    default:
      return <Info className="size-4 shrink-0 text-muted-foreground" />;
  }
}

export function NotificationsDrawer() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    ...trpc.notification.list.queryOptions(),
    refetchInterval: 30_000,
  });

  const unreadCount = data?.unreadCount ?? 0;

  const markRead = useMutation({
    ...trpc.notification.markRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notification.list.queryKey() });
    },
  });

  const markAllRead = useMutation({
    ...trpc.notification.markAllRead.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notification.list.queryKey() });
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotification = useMutation({
    ...trpc.notification.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.notification.list.queryKey() });
    },
  });

  const items = data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full p-0 text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base font-semibold">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {unreadCount} unread
              </Badge>
            )}
          </SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="rounded-full bg-muted p-4">
              <BellOff className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              Activity on trips, maintenance, and more will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 transition-colors",
                    !item.read && "bg-blue-50/60"
                  )}
                >
                  <div className="mt-0.5 rounded-md bg-white p-1.5 shadow-sm ring-1 ring-border">
                    <NotificationIcon type={item.type as NotificationType} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        item.read ? "text-muted-foreground" : "font-medium text-foreground"
                      )}
                    >
                      {item.message}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Mark as read"
                        onClick={() => markRead.mutate({ id: item.id })}
                        disabled={markRead.isPending}
                      >
                        <CheckCheck className="size-3.5 text-blue-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title="Delete"
                      onClick={() => deleteNotification.mutate({ id: item.id })}
                      disabled={deleteNotification.isPending}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator />
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>{items.length} notification{items.length !== 1 ? "s" : ""}</span>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={() => {
                if (items.length > 0) {
                  Promise.all(items.map((n) => deleteNotification.mutateAsync({ id: n.id })))
                    .then(() => toast.success("All notifications cleared"))
                    .catch(() => toast.error("Failed to clear notifications"));
                }
              }}
            >
              <Trash2 className="size-3" />
              Clear all
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

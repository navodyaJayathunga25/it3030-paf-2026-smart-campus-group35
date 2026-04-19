import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { notificationService } from "@/services/notificationService";
import type { NotificationType } from "@/lib/types";
import { Bell, CalendarCheck, Wrench, MessageSquare, CheckCheck, Circle, Loader2, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<NotificationType, React.ElementType> = {
  BOOKING: CalendarCheck,
  TICKET: Wrench,
  COMMENT: MessageSquare,
  USER: UserPlus,
};

const typeColors: Record<NotificationType, string> = {
  BOOKING: "bg-blue-100 text-blue-600",
  TICKET: "bg-emerald-100 text-emerald-600",
  COMMENT: "bg-purple-100 text-purple-600",
  USER: "bg-amber-100 text-amber-600",
};

export default function Notifications() {
  const [filter, setFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getAll,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      toast.success("All notifications marked as read");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      toast.success("Notification deleted");
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete notification");
    },
  });

  const filtered = filter === "ALL"
    ? notifications
    : filter === "UNREAD"
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === filter);

  if (isLoading) return (
    <AppLayout title="Notifications" subtitle="Stay updated on your bookings and tickets">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Notifications" subtitle="Stay updated on your bookings and tickets">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {["ALL", "UNREAD", "BOOKING", "TICKET", "COMMENT", "USER"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === "ALL" ? "All" : f === "UNREAD" ? "Unread" : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-blue-600"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((notif) => {
          const Icon = typeIcons[notif.type];
          const colorClass = typeColors[notif.type];
          return (
            <Card
              key={notif.id}
              className={`border-0 shadow-sm hover:shadow-md transition-all ${
                !notif.read ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link
                      to={notif.link ?? "#"}
                      onClick={() => !notif.read && markReadMutation.mutate(notif.id)}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {notif.title}
                    </Link>
                    {!notif.read && <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />}
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                  {notif.read && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-slate-500 hover:text-red-600"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDeleteTarget({ id: notif.id, title: notif.title });
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications</p>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-md">
          <AlertDialogHeader className="text-left">
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-slate-900">Delete read notification?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This will permanently remove "{deleteTarget?.title}" from your notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              Delete notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

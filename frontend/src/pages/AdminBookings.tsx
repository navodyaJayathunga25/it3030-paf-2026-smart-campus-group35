import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BookingStatusBadge } from "@/components/StatusBadge";
import { bookingService } from "@/services/bookingService";
import { Search, CheckCircle2, XCircle, Clock, Users, CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [openRejectId, setOpenRejectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: bookingService.getAllForAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => bookingService.approve(id),
    onSuccess: () => {
      toast.success("Booking approved");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingService.reject(id, reason),
    onSuccess: () => {
      toast.success("Booking rejected");
      setOpenRejectId(null);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchRole = roleFilter === "ALL" || b.userRole === roleFilter;
    const matchSearch =
      b.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRole && matchSearch;
  });

  return (
    <AppLayout title="All Bookings" subtitle="Review and manage booking requests">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by resource, user, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] h-11">
            <SelectValue placeholder="User Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="LECTURER">Lecturer</SelectItem>
            <SelectItem value="TECHNICIAN">Technician</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{filtered.length} bookings</p>
          <div className="space-y-3">
            {filtered.map((booking) => (
              <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link to={`/bookings/${booking.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                            #{booking.id.slice(-8).toUpperCase()} — {booking.resourceName}
                          </Link>
                          <BookingStatusBadge status={booking.status} />
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                            {booking.userRole === "LECTURER" ? "👨‍🏫 Lecturer" : booking.userRole === "TECHNICIAN" ? "🔧 Technician" : "👤 User"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{booking.purpose}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>By: {booking.userName}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.date} · {booking.startTime}–{booking.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.expectedAttendees}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.status === "PENDING" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => approveMutation.mutate(booking.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Dialog open={openRejectId === booking.id} onOpenChange={(open) => setOpenRejectId(open ? booking.id : null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="text-xs">
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Booking #{booking.id.slice(-8).toUpperCase()}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Provide a reason for rejection..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                              />
                              <Button
                                variant="destructive"
                                className="w-full"
                                disabled={!reason || rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate({ id: booking.id, reason })}
                              >
                                {rejectMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Confirm Rejection
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">No bookings match your criteria.</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

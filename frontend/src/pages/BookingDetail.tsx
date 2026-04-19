import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { resourceService } from "@/services/resourceService";
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, XCircle, Ban, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingService.getById(id!),
    enabled: !!id,
  });

  const { data: resource } = useQuery({
    queryKey: ["resource", booking?.resourceId],
    queryFn: () => resourceService.getById(booking!.resourceId),
    enabled: !!booking?.resourceId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancel(id!),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to cancel"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => bookingService.deleteCancelled(id!),
    onSuccess: () => {
      toast.success("Cancelled booking deleted");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      navigate(-1);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to delete booking"),
  });

  const canDeleteCancelledBooking =
    booking?.status === "CANCELLED" &&
    user?.id === booking.userId &&
    user?.role !== "ADMIN";

  if (isLoading) return (
    <AppLayout title="Booking Details">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </AppLayout>
  );

  if (!booking) return (
    <AppLayout title="Booking Not Found">
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Booking not found.</p>
        <Link to="/bookings"><Button variant="outline">Back to Bookings</Button></Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title={`Booking #${booking.id.slice(-8).toUpperCase()}`} subtitle={booking.resourceName}>
      <Button variant="ghost" className="mb-4 text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Workflow */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Booking Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {["PENDING", "APPROVED/REJECTED", "COMPLETED"].map((label, i) => {
                  const isActive = i === 0 ? true :
                    i === 1 ? ["APPROVED", "REJECTED"].includes(booking.status) :
                    booking.status === "CANCELLED" || booking.status === "APPROVED";
                  const isRejected = i === 1 && booking.status === "REJECTED";
                  return (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isRejected ? "bg-red-100" : isActive ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          {isRejected ? <XCircle className="h-5 w-5 text-red-600" /> :
                           isActive ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> :
                           <div className="h-3 w-3 rounded-full bg-slate-300" />}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${
                          isRejected ? "text-red-600" : isActive ? "text-emerald-600" : "text-slate-400"
                        }`}>{label}</span>
                      </div>
                      {i < 2 && (
                        <div className={`h-0.5 w-16 mx-2 ${isActive ? "bg-emerald-300" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Booking Details</CardTitle>
                <BookingStatusBadge status={booking.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Resource</p>
                  <p className="text-sm font-medium text-slate-900">{booking.resourceName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Date</p>
                  <p className="text-sm font-medium text-slate-900">{booking.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Time</p>
                  <p className="text-sm font-medium text-slate-900">{booking.startTime} – {booking.endTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Attendees</p>
                  <p className="text-sm font-medium text-slate-900">{booking.expectedAttendees}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Purpose</p>
                <p className="text-sm text-slate-700">{booking.purpose}</p>
              </div>
              {booking.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{booking.rejectionReason}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Submitted</p>
                <p className="text-sm text-slate-700">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {(booking.status === "APPROVED" || booking.status === "PENDING") && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Actions</h3>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>
          )}

          {canDeleteCancelledBooking && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Actions</h3>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Cancelled Booking
                </Button>
              </CardContent>
            </Card>
          )}

          {resource && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Resource Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {resource.location}
                  </div>
                  {resource.capacity && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />
                      Capacity: {resource.capacity}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {resource.availabilityWindows}
                  </div>
                </div>
                <Link to={`/facilities/${resource.id}`}>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Resource
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

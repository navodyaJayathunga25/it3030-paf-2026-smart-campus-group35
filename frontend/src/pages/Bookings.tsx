import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingStatusBadge } from "@/components/StatusBadge";
import { bookingService } from "@/services/bookingService";
import { CalendarCheck, Plus, Clock, Users, ArrowRight, Loader2 } from "lucide-react";

export default function Bookings() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingService.getAll,
  });

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  if (isLoading) return (
    <AppLayout title="My Bookings" subtitle="View and manage your booking requests">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="My Bookings" subtitle="View and manage your booking requests">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-500">{filtered.length} bookings</span>
        </div>
        <Link to="/facilities">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {filtered.map((booking) => (
          <Link key={booking.id} to={`/bookings/${booking.id}`}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CalendarCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {booking.resourceName}
                        </h3>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{booking.purpose}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.date} · {booking.startTime}-{booking.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.expectedAttendees} attendees
                        </span>
                      </div>
                      {booking.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded">
                          Reason: {booking.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No bookings found</p>
          <Link to="/facilities">
            <Button variant="outline">Browse Facilities</Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
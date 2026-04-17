import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge, TicketStatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { ticketService } from "@/services/ticketService";
import { notificationService } from "@/services/notificationService";
import {
  CalendarCheck, Wrench, Bell, Building2, Plus, ArrowRight,
  Clock, AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingService.getAll,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.getAll,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30_000,
  });

  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  const summaryCards = [
    { label: "Upcoming Bookings", value: approvedBookings, icon: CalendarCheck, color: "from-blue-500 to-blue-600" },
    { label: "Pending Approvals", value: pendingBookings, icon: Clock, color: "from-amber-500 to-amber-600" },
    { label: "Active Tickets", value: openTickets, icon: Wrench, color: "from-emerald-500 to-emerald-600" },
    { label: "Unread Notifications", value: unreadCount, icon: Bell, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back, ${user?.name ?? "User"}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/facilities">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Browse Facilities</p>
                <p className="text-xs text-slate-500">Find and book resources</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/tickets/create">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Report Issue</p>
                <p className="text-xs text-slate-500">Create maintenance ticket</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/notifications">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              <Link to="/bookings">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0, 4).map((booking) => (
              <Link key={booking.id} to={`/bookings/${booking.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CalendarCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{booking.resourceName}</p>
                      <p className="text-xs text-slate-500">{booking.date} · {booking.startTime}–{booking.endTime}</p>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </Link>
            ))}
            {bookings.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No bookings yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Tickets</CardTitle>
              <Link to="/tickets">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.slice(0, 4).map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      ticket.priority === "CRITICAL" ? "bg-red-100" :
                      ticket.priority === "HIGH" ? "bg-orange-100" :
                      ticket.priority === "MEDIUM" ? "bg-blue-100" : "bg-slate-100"
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        ticket.priority === "CRITICAL" ? "text-red-600" :
                        ticket.priority === "HIGH" ? "text-orange-600" :
                        ticket.priority === "MEDIUM" ? "text-blue-600" : "text-slate-600"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ticket.category}</p>
                      <p className="text-xs text-slate-500">{ticket.location}</p>
                    </div>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
            {tickets.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No tickets yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

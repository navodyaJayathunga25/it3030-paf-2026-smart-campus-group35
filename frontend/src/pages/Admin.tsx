import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/userService";
import { bookingService } from "@/services/bookingService";
import { resourceService } from "@/services/resourceService";
import {
  CalendarCheck, Building2, Users, TrendingUp,
  Clock, CheckCircle2, AlertTriangle, BarChart3, Loader2, Trophy,
} from "lucide-react";

const peakHours = [
  { hour: "09:00", count: 42 }, { hour: "10:00", count: 56 },
  { hour: "11:00", count: 48 }, { hour: "13:00", count: 38 },
  { hour: "14:00", count: 62 }, { hour: "15:00", count: 45 },
  { hour: "16:00", count: 30 },
];
const maxCount = Math.max(...peakHours.map((h) => h.count));

export default function Admin() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
  });

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ["admin-bookings-summary"],
    queryFn: bookingService.getAll,
  });

  const { data: resources = [], isLoading: isResourcesLoading } = useQuery({
    queryKey: ["admin-resources-summary"],
    queryFn: resourceService.getAll,
  });

  if (isLoading) return (
    <AppLayout title="Admin Dashboard" subtitle="Campus operations overview">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </AppLayout>
  );

  const summaryCards = [
    { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: "from-blue-500 to-blue-600" },
    { label: "Pending Approvals", value: stats?.pendingBookings ?? 0, icon: Clock, color: "from-amber-500 to-amber-600" },
    { label: "Open Tickets", value: (stats?.openTickets ?? 0) + (stats?.inProgressTickets ?? 0), icon: AlertTriangle, color: "from-red-500 to-red-600" },
    { label: "Total Resources", value: stats?.totalResources ?? 0, icon: Building2, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Resolved Tickets", value: stats?.resolvedTickets ?? 0, icon: TrendingUp, color: "from-indigo-500 to-indigo-600" },
  ];

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "CANCELLED" && booking.status !== "REJECTED"
  );

  const bookingCountByResource = activeBookings.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.resourceId] = (acc[booking.resourceId] ?? 0) + 1;
    return acc;
  }, {});

  const topResources = resources
    .map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type.replace(/_/g, " "),
      bookings: bookingCountByResource[resource.id] ?? 0,
    }))
    .filter((resource) => resource.bookings > 0)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  const topResourceMaxBookings = Math.max(...topResources.map((resource) => resource.bookings), 1);

  return (
    <AppLayout title="Admin Dashboard" subtitle="Campus operations overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Ticket Status Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Ticket Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Open", value: stats?.openTickets ?? 0, color: "from-red-400 to-red-500", max: stats?.totalTickets ?? 1 },
                { label: "In Progress", value: stats?.inProgressTickets ?? 0, color: "from-amber-400 to-amber-500", max: stats?.totalTickets ?? 1 },
                { label: "Resolved", value: stats?.resolvedTickets ?? 0, color: "from-emerald-400 to-emerald-500", max: stats?.totalTickets ?? 1 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-24">{item.label}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1 mr-3">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-6 text-right">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Peak Booking Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {peakHours.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">{h.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all"
                    style={{ height: `${(h.count / maxCount) * 100}%` }}
                  />
                  <span className="text-[10px] text-slate-500">{h.hour}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Resources Summary */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Top Resources Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(isBookingsLoading || isResourcesLoading) ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : topResources.length === 0 ? (
            <p className="text-sm text-slate-500">No booking activity available yet.</p>
          ) : (
            <div className="space-y-4">
              {topResources.map((resource, index) => (
                <div key={resource.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {index + 1}. {resource.name}
                      </p>
                      <p className="text-xs text-slate-500">{resource.type}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {resource.bookings} bookings
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${(resource.bookings / topResourceMaxBookings) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Level Timers */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Service Level Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Avg. Time to First Response", value: "2.4 hrs", target: "4 hrs" },
              { label: "Avg. Time to Resolution", value: "18.6 hrs", target: "24 hrs" },
              { label: "Booking Approval Time", value: "3.2 hrs", target: "6 hrs" },
            ].map((metric) => (
              <div key={metric.label} className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">Target: {metric.target}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

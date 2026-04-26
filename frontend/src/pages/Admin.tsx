import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/userService";
import { bookingService } from "@/services/bookingService";
import {
  CalendarCheck,
  Building2,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Loader2,
  Award,
} from "lucide-react";

const BUSINESS_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function toHourSlot(startTime: string): string | null {
  if (!startTime) return null;
  const hour = Number(startTime.split(":")[0]);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function Admin() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
  });

  const { data: adminBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["admin-bookings-peak-hours"],
    queryFn: bookingService.getAllForAdmin,
  });

  if (isLoading)
    return (
      <AppLayout title="Admin Dashboard" subtitle="Campus operations overview">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );

  const summaryCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingBookings ?? 0,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Open Tickets",
      value: (stats?.openTickets ?? 0) + (stats?.inProgressTickets ?? 0),
      icon: AlertTriangle,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Rejected Tickets",
      value: stats?.rejectedTickets ?? 0,
      icon: AlertTriangle,
      color: "from-rose-500 to-rose-600",
    },
    {
      label: "Total Resources",
      value: stats?.totalResources ?? 0,
      icon: Building2,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Resolved Tickets",
      value: stats?.resolvedTickets ?? 0,
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const hourCounts = BUSINESS_HOURS.reduce<Record<string, number>>(
    (acc, hour) => {
      acc[hour] = 0;
      return acc;
    },
    {},
  );

  adminBookings
    .filter((booking) => booking.status === "APPROVED")
    .forEach((booking) => {
      const slot = toHourSlot(booking.startTime);
      if (!slot) return;
      if (!(slot in hourCounts)) return;
      hourCounts[slot] += 1;
    });

  const peakHours = BUSINESS_HOURS.map((hour) => ({
    hour,
    count: hourCounts[hour] ?? 0,
  }));
  const maxCount = Math.max(1, ...peakHours.map((h) => h.count));
  const hasPeakHoursData = peakHours.some((h) => h.count > 0);

  // Calculate top resources by booking count
  const resourceBookingCounts = adminBookings
    .filter((booking) => booking.status === "APPROVED")
    .reduce<Record<string, { name: string; count: number }>>(
      (acc, booking) => {
        if (!acc[booking.resourceId]) {
          acc[booking.resourceId] = { name: booking.resourceName, count: 0 };
        }
        acc[booking.resourceId].count += 1;
        return acc;
      },
      {},
    );

  const topResources = Object.values(resourceBookingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <AppLayout title="Admin Dashboard" subtitle="Campus operations overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}
                >
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
                {
                  label: "Open",
                  value: stats?.openTickets ?? 0,
                  color: "from-emerald-400 to-green-500",
                  max: stats?.totalTickets ?? 1,
                },
                {
                  label: "In Progress",
                  value: stats?.inProgressTickets ?? 0,
                  color: "from-amber-400 to-amber-500",
                  max: stats?.totalTickets ?? 1,
                },
                {
                  label: "Resolved",
                  value: stats?.resolvedTickets ?? 0,
                  color: "from-emerald-400 to-emerald-500",
                  max: stats?.totalTickets ?? 1,
                },
                {
                  label: "Rejected",
                  value: stats?.rejectedTickets ?? 0,
                  color: "from-rose-400 to-rose-500",
                  max: stats?.totalTickets ?? 1,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-24">
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1 mr-3">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          style={{
                            width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-6 text-right">
                        {item.value}
                      </span>
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
            {isLoadingBookings ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              </div>
            ) : hasPeakHoursData ? (
              <div className="flex items-stretch gap-1 h-44">
                {peakHours.map((h) => (
                  <div
                    key={h.hour}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] font-medium text-slate-500">
                      {h.count}
                    </span>
                    <div className="w-full h-28 bg-slate-100 rounded-md flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all"
                        style={{
                          height: `${h.count > 0 ? Math.max(8, (h.count / maxCount) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{h.hour}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-slate-500">
                No approved booking data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Resources Summary */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" /> Top Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : topResources.length > 0 ? (
            <div className="space-y-3">
              {topResources.map((resource, index) => {
                const maxBookings = topResources[0]?.count ?? 1;
                const barPercentage =
                  maxBookings > 0 ? (resource.count / maxBookings) * 100 : 0;
                const colors = [
                  "from-blue-400 to-blue-500",
                  "from-purple-400 to-purple-500",
                  "from-pink-400 to-pink-500",
                  "from-indigo-400 to-indigo-500",
                  "from-cyan-400 to-cyan-500",
                ];

                return (
                  <div key={resource.name} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold text-slate-700 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {resource.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {resource.count} booking{resource.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all`}
                          style={{ width: `${barPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-slate-500">
              No booking data available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Level Timers */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Service Level Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Avg. Time to First Response",
                value: "2.4 hrs",
                target: "4 hrs",
              },
              {
                label: "Avg. Time to Resolution",
                value: "18.6 hrs",
                target: "24 hrs",
              },
              {
                label: "Booking Approval Time",
                value: "3.2 hrs",
                target: "6 hrs",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="text-center p-4 rounded-xl bg-slate-50"
              >
                <p className="text-xs text-slate-500 mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metric.value}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">
                    Target: {metric.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

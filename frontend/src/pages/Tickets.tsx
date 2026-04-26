import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { ticketService } from "@/services/ticketService";
import { formatDate } from "@/lib/date";
import {
  Wrench,
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";

export default function Tickets() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const canCreateTicket = user?.role !== "TECHNICIAN";

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.getAll,
  });

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [tickets, statusFilter, priorityFilter]);

  if (isLoading)
    return (
      <AppLayout
        title="My Tickets"
        subtitle="View and manage your maintenance tickets"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );

  return (
    <AppLayout
      title="My Tickets"
      subtitle="View and manage your maintenance tickets"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-500">
            {filtered.length} tickets
          </span>
        </div>
        {canCreateTicket && (
          <Link to="/tickets/create">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" /> New Ticket
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        ticket.priority === "CRITICAL"
                          ? "bg-red-100"
                          : ticket.priority === "HIGH"
                            ? "bg-orange-100"
                            : ticket.priority === "MEDIUM"
                              ? "bg-blue-100"
                              : "bg-slate-100"
                      }`}
                    >
                      <Wrench
                        className={`h-6 w-6 ${
                          ticket.priority === "CRITICAL"
                            ? "text-red-600"
                            : ticket.priority === "HIGH"
                              ? "text-orange-600"
                              : ticket.priority === "MEDIUM"
                                ? "text-blue-600"
                                : "text-slate-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {ticket.category}
                        </h3>
                        <TicketStatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ticket.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.assignedToName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.assignedToName}
                          </span>
                        )}
                      </div>
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
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No tickets found</p>
          {canCreateTicket && (
            <Link to="/tickets/create">
              <Button variant="outline">Create a Ticket</Button>
            </Link>
          )}
        </div>
      )}
    </AppLayout>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ticketService } from "@/services/ticketService";
import { Search, Wrench, MapPin, Clock, User, UserPlus, Loader2, ChevronRight } from "lucide-react";

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: ticketService.getAll,
  });

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchSearch =
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppLayout title="All Tickets" subtitle="Manage maintenance and incident tickets">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by category, location, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-11">
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{filtered.length} tickets</p>
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block group">
                <Card className="border-0 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          ticket.priority === "CRITICAL" ? "bg-red-100" :
                          ticket.priority === "HIGH" ? "bg-orange-100" :
                          ticket.priority === "MEDIUM" ? "bg-blue-100" : "bg-slate-100"
                        }`}>
                          <Wrench className={`h-6 w-6 ${
                            ticket.priority === "CRITICAL" ? "text-red-600" :
                            ticket.priority === "HIGH" ? "text-orange-600" :
                            ticket.priority === "MEDIUM" ? "text-blue-600" : "text-slate-600"
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                              {ticket.category}
                            </span>
                            <TicketStatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                          <p className="text-sm text-slate-600 mb-1 line-clamp-1">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />{ticket.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{ticket.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            {ticket.assignedToName && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <UserPlus className="h-3 w-3" />{ticket.assignedToName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 flex-shrink-0 self-center" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">No tickets match your criteria.</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ticketService } from "@/services/ticketService";
import { userService } from "@/services/userService";
import { Search, Wrench, MapPin, Clock, User, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: ticketService.getAll,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const technicians = users.filter((u) => u.role === "TECHNICIAN");

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, techId }: { ticketId: string; techId: string }) =>
      ticketService.assignTechnician(ticketId, techId),
    onSuccess: () => {
      toast.success("Technician assigned");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
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
              <Card key={ticket.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
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
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link to={`/tickets/${ticket.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                            #{ticket.id.slice(-8).toUpperCase()} — {ticket.category}
                          </Link>
                          <TicketStatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        <p className="text-sm text-slate-600 mb-1 line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />{ticket.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{ticket.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ticket.assignedToName ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50">
                          <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">{ticket.assignedToName}</span>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(techId) => assignMutation.mutate({ ticketId: ticket.id, techId })}
                          disabled={assignMutation.isPending}
                        >
                          <SelectTrigger className="w-[160px] h-9 text-xs">
                            <SelectValue placeholder="Assign Technician" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TicketStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ticketService } from "@/services/ticketService";
import { formatDate } from "@/lib/date";
import { Wrench, MapPin, Clock, ArrowRight, CheckCircle2, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MyAssignedTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.getAll,
  });

  const startWorkMutation = useMutation({
    mutationFn: (ticketId: string) => ticketService.updateStatus(ticketId, "IN_PROGRESS"),
    onSuccess: () => {
      toast.success("Ticket marked as In Progress");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to update status"),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ ticketId, notes }: { ticketId: string; notes: string }) =>
      ticketService.updateStatus(ticketId, "RESOLVED", notes),
    onSuccess: () => {
      toast.success("Ticket marked as Resolved");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setResolvingId(null);
      setResolutionNotes("");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to resolve ticket"),
  });

  // Technician sees only assigned tickets from the API (backend scopes this)
  const filtered = statusFilter === "ALL"
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  return (
    <AppLayout title="My Assigned Tickets" subtitle="Manage tickets assigned to you">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10">
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
          <span className="text-sm text-slate-500">{filtered.length} tickets</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
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
                          {ticket.category}
                        </Link>
                        <TicketStatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="text-sm text-slate-600 mb-1 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{ticket.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatDate(ticket.createdAt)}
                        </span>
                        <span>Reported by: {ticket.userName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ticket.status === "IN_PROGRESS" && (
                      <Dialog
                        open={resolvingId === ticket.id}
                        onOpenChange={(o) => { setResolvingId(o ? ticket.id : null); if (!o) setResolutionNotes(""); }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Ticket #{ticket.id.slice(-8).toUpperCase()}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add resolution notes..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              rows={4}
                            />
                            <Button
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => resolveMutation.mutate({ ticketId: ticket.id, notes: resolutionNotes })}
                              disabled={resolveMutation.isPending}
                            >
                              {resolveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Mark as Resolved
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {ticket.status === "OPEN" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        onClick={() => startWorkMutation.mutate(ticket.id)}
                        disabled={startWorkMutation.isPending}
                      >
                        {startWorkMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5 mr-1" />
                        )}
                        Start Work
                      </Button>
                    )}
                    <Link to={`/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No assigned tickets</p>
        </div>
      )}
    </AppLayout>
  );
}

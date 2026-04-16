import { Badge } from "@/components/ui/badge";
import type { BookingStatus, TicketStatus, ResourceStatus, TicketPriority } from "@/lib/types";

const bookingStatusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

const ticketStatusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

const resourceStatusStyles: Record<ResourceStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OUT_OF_SERVICE: "bg-red-100 text-red-800 border-red-200",
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={`${bookingStatusStyles[status]} font-medium text-xs`}>
      {status}
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={`${ticketStatusStyles[status]} font-medium text-xs`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <Badge variant="outline" className={`${resourceStatusStyles[status]} font-medium text-xs`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={`${priorityStyles[priority]} font-medium text-xs`}>
      {priority}
    </Badge>
  );
}
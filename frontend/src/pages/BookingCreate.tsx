import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calender";
import { resourceService } from "@/services/resourceService";
import { bookingService } from "@/services/bookingService";
import { timeSlots } from "@/lib/types";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export default function BookingCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedResourceId = searchParams.get("resource") || "";

  const [selectedResource, setSelectedResource] = useState(preselectedResourceId);
  const [date, setDate] = useState("");
  const [selectedSlotIndexes, setSelectedSlotIndexes] = useState<number[]>([]);
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState("1");

  const minBookDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, []);

  const maxBookDate = useMemo(() => {
    const max = new Date(minBookDate);
    max.setDate(max.getDate() + 30);
    return max;
  }, [minBookDate]);

  const slotIntervals = useMemo(
    () => timeSlots.slice(0, -1).map((start, index) => ({
      index,
      start,
      end: timeSlots[index + 1],
      label: `${start} - ${timeSlots[index + 1]}`,
    })),
    []
  );

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", "ACTIVE"],
    queryFn: () => resourceService.getAll({ status: "ACTIVE" }),
  });

  const { data: approvedBookings = [] } = useQuery({
    queryKey: ["bookings", "availability", selectedResource, date],
    queryFn: () => bookingService.getApprovedByResourceAndDate(selectedResource, date),
    enabled: !!selectedResource && !!date,
  });

  const occupiedSlotIndexes = useMemo(() => {
    const occupied = new Set<number>();

    approvedBookings
      .forEach((booking) => {
        const startIndex = timeSlots.indexOf(booking.startTime);
        const endIndex = timeSlots.indexOf(booking.endTime);

        if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
          return;
        }

        for (let i = startIndex; i < endIndex; i += 1) {
          occupied.add(i);
        }
      });

    return occupied;
  }, [approvedBookings]);

  const sortedSelectedSlots = useMemo(
    () => [...selectedSlotIndexes].sort((a, b) => a - b),
    [selectedSlotIndexes]
  );

  const isSlotSelectionContiguous = useMemo(() => {
    if (sortedSelectedSlots.length === 0) return false;

    for (let i = 1; i < sortedSelectedSlots.length; i += 1) {
      if (sortedSelectedSlots[i] !== sortedSelectedSlots[i - 1] + 1) {
        return false;
      }
    }

    return true;
  }, [sortedSelectedSlots]);

  const startTime =
    sortedSelectedSlots.length > 0 && isSlotSelectionContiguous
      ? timeSlots[sortedSelectedSlots[0]]
      : "";
  const endTime =
    sortedSelectedSlots.length > 0 && isSlotSelectionContiguous
      ? timeSlots[sortedSelectedSlots[sortedSelectedSlots.length - 1] + 1]
      : "";

  const mutation = useMutation({
    mutationFn: () => bookingService.create({
      resourceId: selectedResource,
      date,
      startTime,
      endTime,
      purpose,
      expectedAttendees: parseInt(attendees) || 1,
    }),
    onSuccess: (booking) => {
      toast.success("Booking request submitted successfully");
      navigate(`/bookings/${booking.id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to submit booking"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !date || !startTime || !endTime || !purpose) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isSlotSelectionContiguous) {
      toast.error("Please select continuous time slots");
      return;
    }
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    mutation.mutate();
  };

  const selectedDate = date ? parseDateKey(date) : undefined;

  const handleResourceChange = (resourceId: string) => {
    setSelectedResource(resourceId);
    setDate("");
    setSelectedSlotIndexes([]);
  };

  const handleDateSelect = (selected?: Date) => {
    if (!selected) {
      setDate("");
      setSelectedSlotIndexes([]);
      return;
    }

    const selectedKey = formatDateKey(selected);
    setDate(selectedKey);
    setSelectedSlotIndexes([]);
  };

  const toggleSlotSelection = (slotIndex: number) => {
    if (occupiedSlotIndexes.has(slotIndex)) {
      return;
    }

    setSelectedSlotIndexes((current) => {
      if (current.includes(slotIndex)) {
        return current.filter((index) => index !== slotIndex);
      }
      return [...current, slotIndex];
    });
  };

  return (
    <AppLayout title="New Booking" subtitle="Request a facility or resource">
      <Button variant="ghost" className="mb-4 text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Resource *</Label>
              <Select value={selectedResource} onValueChange={handleResourceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {r.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedResource ? (
              <div className="space-y-2">
                <Label>Date * (next 30 days)</Label>
                <Card className="border border-slate-200 shadow-none">
                  <CardContent className="p-2 md:p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={{
                        before: minBookDate,
                        after: maxBookDate,
                      }}
                      defaultMonth={selectedDate ?? minBookDate}
                      className="rounded-md"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Select a resource first to view available dates.
              </p>
            )}

            {selectedResource && date && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Available Time Slots *</Label>
                  <span className="text-xs text-slate-500">
                    {date}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {slotIntervals.map((slot) => {
                    const isOccupied = occupiedSlotIndexes.has(slot.index);
                    const isSelected = selectedSlotIndexes.includes(slot.index);

                    return (
                      <button
                        key={slot.index}
                        type="button"
                        onClick={() => toggleSlotSelection(slot.index)}
                        disabled={isOccupied}
                        className={`h-11 rounded-md border text-xs md:text-sm transition-colors ${
                          isOccupied
                            ? "border-red-400 bg-red-500 text-white cursor-not-allowed"
                            : isSelected
                              ? "border-blue-500 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {isOccupied ? `${slot.label} (Booked)` : slot.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Selected
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Booked / Unavailable
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input value={startTime} placeholder="Select slots" readOnly />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input value={endTime} placeholder="Select slots" readOnly />
              </div>
            </div>

            {selectedSlotIndexes.length > 0 && !isSlotSelectionContiguous && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Please select continuous slots only.
              </p>
            )}

            <div className="space-y-2">
              <Label>Expected Attendees</Label>
              <Input
                type="number"
                min="1"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Purpose *</Label>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the purpose of this booking..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              disabled={
                mutation.isPending ||
                !selectedResource ||
                !date ||
                selectedSlotIndexes.length === 0 ||
                !isSlotSelectionContiguous
              }
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CalendarPlus className="h-4 w-4 mr-2" />
              )}
              Book Now
            </Button>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
}

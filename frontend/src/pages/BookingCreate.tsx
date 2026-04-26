import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resourceService } from "@/services/resourceService";
import { bookingService } from "@/services/bookingService";
import { timeSlots } from "@/lib/types";
import { parseAvailabilityWindows, isWithinAvailability } from "@/lib/utils";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preselectedResourceId = searchParams.get("resource") || "";

  const [selectedResource, setSelectedResource] = useState(preselectedResourceId);
  const [date, setDate] = useState("");
  const [selectedSlotIndexes, setSelectedSlotIndexes] = useState<number[]>([]);
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState("1");

  const slotIntervals = useMemo(
    () =>
      timeSlots.slice(0, -1).map((start, index) => ({
        index,
        start,
        end: timeSlots[index + 1],
        label: `${start} - ${timeSlots[index + 1]}`,
      })),
    []
  );

  const minBookDateStr = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }, []);

  const maxBookDateStr = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 31);
    return t.toISOString().slice(0, 10);
  }, []);

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", "ACTIVE"],
    queryFn: () => resourceService.getAll({ status: "ACTIVE" }),
  });

  const { data: approvedBookings = [] } = useQuery({
    queryKey: ["bookings", "availability", selectedResource, date],
    queryFn: () => bookingService.getApprovedByResourceAndDate(selectedResource, date),
    enabled: !!selectedResource && !!date,
  });

  const normalizeTime = (t: string) => (t ? t.slice(0, 5) : t); // "08:00:00" -> "08:00"

  const occupiedSlotIndexes = useMemo(() => {
    const occupied = new Set<number>();
    approvedBookings.forEach((b) => {
      const s = timeSlots.indexOf(normalizeTime(b.startTime));
      const e = timeSlots.indexOf(normalizeTime(b.endTime));
      if (s === -1 || e === -1 || e <= s) return;
      for (let i = s; i < e; i += 1) occupied.add(i);
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
      if (sortedSelectedSlots[i] !== sortedSelectedSlots[i - 1] + 1) return false;
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

  const toggleSlotSelection = (slotIndex: number) => {
    if (occupiedSlotIndexes.has(slotIndex)) return;
    if (unavailableSlotIndexes.has(slotIndex)) return;
    setSelectedSlotIndexes((current) =>
      current.includes(slotIndex)
        ? current.filter((i) => i !== slotIndex)
        : [...current, slotIndex]
    );
  };

  const selectedResourceObj = resources.find((r) => r.id === selectedResource);

  const availabilityWindows = useMemo(
    () => parseAvailabilityWindows(selectedResourceObj?.availabilityWindows),
    [selectedResourceObj]
  );

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    return h * 60 + m;
  };

  const selectedWeekday = date ? new Date(`${date}T00:00:00`).getDay() : -1;

  const unavailableSlotIndexes = useMemo(() => {
    const unavailable = new Set<number>();
    if (!date) return unavailable;
    timeSlots.slice(0, -1).forEach((start, index) => {
      const end = timeSlots[index + 1];
      if (!isWithinAvailability(availabilityWindows, selectedWeekday, toMin(start), toMin(end))) {
        unavailable.add(index);
      }
    });
    return unavailable;
  }, [availabilityWindows, selectedWeekday, date]);

  const mutation = useMutation({
    mutationFn: () =>
      bookingService.create({
        resourceId: selectedResource,
        date,
        startTime,
        endTime,
        purpose,
        expectedAttendees: parseInt(attendees) || 1,
      }),
    onSuccess: (booking) => {
      toast.success("Booking request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      navigate(`/bookings/${booking.id}`);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Failed to submit booking"),
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
    const parsedAttendees = parseInt(attendees) || 1;
    if (selectedResourceObj?.capacity && parsedAttendees > selectedResourceObj.capacity) {
      toast.error(
        `Expected attendees cannot exceed the resource's capacity of ${selectedResourceObj.capacity}`
      );
      return;
    }
    mutation.mutate();
  };

  const canSubmit =
    !!selectedResource &&
    !!date &&
    !!startTime &&
    !!endTime &&
    !!purpose &&
    isSlotSelectionContiguous &&
    !mutation.isPending &&
    (!selectedResourceObj?.capacity || parseInt(attendees) <= selectedResourceObj.capacity);

  return (
    <AppLayout title="Create Booking" subtitle="Request a resource booking">
      <Button variant="ghost" className="mb-4 text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Select Resource</Label>
                <Select
                  value={selectedResource}
                  onValueChange={(v) => {
                    setSelectedResource(v);
                    setDate("");
                    setSelectedSlotIndexes([]);
                  }}
                >
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
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-900">Booking Details</h3>

                <div className="grid md:grid-cols-[220px,1fr] gap-6">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      min={minBookDateStr}
                      max={maxBookDateStr}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSelectedSlotIndexes([]);
                      }}
                    />
                  </div>

                  {selectedResource && date && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Available Time Slots *</Label>
                        <span className="text-xs text-slate-500">{date}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {slotIntervals.map((slot) => {
                          const isUnavailable = unavailableSlotIndexes.has(slot.index);
                          const isOccupied = !isUnavailable && occupiedSlotIndexes.has(slot.index);
                          const isSelected = selectedSlotIndexes.includes(slot.index);
                          return (
                            <button
                              key={slot.index}
                              type="button"
                              onClick={() => toggleSlotSelection(slot.index)}
                              disabled={isOccupied || isUnavailable}
                              className={`h-11 rounded-md border text-xs md:text-sm transition-colors ${
                                isUnavailable
                                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : isOccupied
                                  ? "border-red-400 bg-red-500 text-white cursor-not-allowed"
                                  : isSelected
                                  ? "border-blue-500 bg-blue-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {isUnavailable
                                ? `${slot.label} (Closed)`
                                : isOccupied
                                ? `${slot.label} (Booked)`
                                : slot.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Selected
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Booked
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Closed
                        </span>
                      </div>
                      {selectedSlotIndexes.length > 0 && !isSlotSelectionContiguous && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                          Please select continuous slots only.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Describe the purpose of your booking..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Expected Attendees
                    {selectedResourceObj?.capacity && (
                      <span className="text-xs text-slate-500 ml-1">
                        (Max: {selectedResourceObj.capacity})
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedResourceObj?.capacity || undefined}
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Number of attendees"
                  />
                  {parseInt(attendees) > (selectedResourceObj?.capacity || 0) &&
                    selectedResourceObj?.capacity && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        Attendees exceed the resource capacity of {selectedResourceObj.capacity}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resource</span>
                    <span className="font-medium text-slate-900 text-right">
                      {selectedResourceObj?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-medium text-slate-900">{date || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-medium text-slate-900">
                      {startTime && endTime ? `${startTime} – ${endTime}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attendees</span>
                    <span className="font-medium text-slate-900">{attendees || "—"}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-4 w-4 mr-2" />
                  )}
                  Submit Booking
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Your booking will be reviewed by an admin
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}

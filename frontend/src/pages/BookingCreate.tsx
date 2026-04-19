import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedResourceId = searchParams.get("resource") || "";

  const [selectedResource, setSelectedResource] = useState(preselectedResourceId);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState("1");

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

  const occupiedSlotIndexes = useMemo(() => {
    const occupied = new Set<number>();
    approvedBookings.forEach((b) => {
      const s = timeSlots.indexOf(b.startTime);
      const e = timeSlots.indexOf(b.endTime);
      if (s === -1 || e === -1 || e <= s) return;
      for (let i = s; i < e; i += 1) occupied.add(i);
    });
    return occupied;
  }, [approvedBookings]);

  const hasConflict = useMemo(() => {
    if (!startTime || !endTime) return false;
    const s = timeSlots.indexOf(startTime);
    const e = timeSlots.indexOf(endTime);
    if (s === -1 || e === -1 || e <= s) return false;
    for (let i = s; i < e; i += 1) if (occupiedSlotIndexes.has(i)) return true;
    return false;
  }, [startTime, endTime, occupiedSlotIndexes]);

  const selectedResourceObj = resources.find((r) => r.id === selectedResource);

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
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    if (hasConflict) {
      toast.error("Selected time overlaps an existing booking");
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
    startTime < endTime &&
    !hasConflict &&
    !mutation.isPending;

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
                <Select value={selectedResource} onValueChange={setSelectedResource}>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      min={minBookDateStr}
                      max={maxBookDateStr}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.slice(0, -1).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots
                          .filter((t) => !startTime || t > startTime)
                          .map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasConflict && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    Selected time overlaps an existing approved booking.
                  </p>
                )}

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
                  <Label>Expected Attendees</Label>
                  <Input
                    type="number"
                    min="1"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Number of attendees"
                  />
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

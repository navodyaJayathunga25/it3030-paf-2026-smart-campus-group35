import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import { resourceService } from "@/services/resourceService";
import { getResourceTypeIcon, getResourceTypeLabel, timeSlots } from "@/lib/types";
import type { Resource } from "@/lib/types";
import { Search, Plus, Pencil, Trash2, MapPin, Users, Loader2, X, Clock } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_TIME_OPTIONS = timeSlots.slice(0, -1);
const END_TIME_OPTIONS = timeSlots.slice(1);

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "LECTURER", label: "Lecturer" },
];
const ALLOWED_ROLE_VALUES = ROLE_OPTIONS.map((role) => role.value);

interface AvailabilitySlot {
  days: string[];
  fromTime: string;
  toTime: string;
}

const emptyForm = {
  name: "", type: "LECTURE_HALL" as string, capacity: "", location: "",
  description: "", status: "ACTIVE" as string, facilities: "",
  availabilitySlots: [] as AvailabilitySlot[],
  allowedRoles: [] as string[],
};

const availabilityTimeOptionsAreValid = (fromTime: string, toTime: string) => {
  const fromIndex = timeSlots.indexOf(fromTime);
  const toIndex = timeSlots.indexOf(toTime);
  return fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex;
};

export default function AdminResources() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourceService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => resourceService.create(data),
    onSuccess: () => {
      toast.success("Resource created");
      setDialogOpen(false);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => resourceService.update(id, data),
    onSuccess: () => {
      toast.success("Resource updated");
      setDialogOpen(false);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourceService.delete(id),
    onSuccess: () => {
      toast.success("Resource deleted");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const addAvailabilitySlot = () => {
    setForm({
      ...form,
      availabilitySlots: [...form.availabilitySlots, { days: [], fromTime: "08:00", toTime: "08:30" }],
    });
  };

  const removeAvailabilitySlot = (index: number) => {
    setForm({
      ...form,
      availabilitySlots: form.availabilitySlots.filter((_, i) => i !== index),
    });
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...form.availabilitySlots];
    if (field === "days") {
      const currentDays = updated[index].days;
      updated[index].days = currentDays.includes(value)
        ? currentDays.filter((d) => d !== value)
        : [...currentDays, value];
    } else {
      (updated[index] as any)[field] = value;
    }
    setForm({ ...form, availabilitySlots: updated });
  };

  const handleSubmit = () => {
    const selectedRoles = form.allowedRoles.filter((role) => ALLOWED_ROLE_VALUES.includes(role));

    // Validation
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.location.trim()) return toast.error("Location is required");
    if (!form.status) return toast.error("Status is required");
    if (selectedRoles.length === 0) return toast.error("Please select access roles");
    if (form.capacity && (isNaN(Number(form.capacity)) || Number(form.capacity) < 0)) {
      return toast.error("Capacity must be a positive number");
    }

    const invalidSlot = form.availabilitySlots.find((slot) => {
      if (slot.days.length === 0) return true;
      if (!timeSlots.includes(slot.fromTime) || !timeSlots.includes(slot.toTime)) return true;
      if (!availabilityTimeOptionsAreValid(slot.fromTime, slot.toTime)) return true;
      return false;
    });

    if (invalidSlot) {
      return toast.error("Each time slot must use 30-minute intervals between 08:00 and 20:00, and the end time must be after the start time.");
    }

    // Build availability windows string
    const availabilityWindows = form.availabilitySlots
      .filter((slot) => slot.days.length > 0)
      .map((slot) => `${slot.days.join(",")} ${slot.fromTime}-${slot.toTime}`)
      .join("; ");

    const payload = {
      name: form.name,
      type: form.type,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      location: form.location,
      description: form.description,
      status: form.status,
      facilities: form.facilities ? form.facilities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      availabilityWindows: availabilityWindows || null,
      allowedRoles: selectedRoles,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (resource: Resource) => {
    // Parse availability windows back to slots
    const slots: AvailabilitySlot[] = [];
    if (resource.availabilityWindows) {
      const parts = resource.availabilityWindows.split(";").map((p) => p.trim());
      for (const part of parts) {
        const match = part.match(/^([A-Za-z,]+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
        if (match) {
          slots.push({
            days: match[1].split(",").map((d) => d.trim()),
            fromTime: match[2],
            toTime: match[3],
          });
        }
      }
    }

    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity?.toString() ?? "",
      location: resource.location,
      description: resource.description ?? "",
      status: resource.status,
      facilities: (resource.facilities ?? []).join(", "),
      availabilitySlots: slots.length > 0 ? slots : [],
      allowedRoles: (resource.allowedRoles ?? []).filter((role) => ALLOWED_ROLE_VALUES.includes(role)),
    });
    setEditId(resource.id);
    setCapacityError("");
    setDialogOpen(true);
  };

  const getResourceDescription = (resource: Resource) => {
    const customDescription = resource.description?.trim();
    if (customDescription) return customDescription;

    const typeLabel = getResourceTypeLabel(resource.type);
    const capacityPart = resource.capacity ? ` with capacity for ${resource.capacity} people` : "";
    return `${typeLabel} located at ${resource.location}${capacityPart}.`;
  };

  return (
    <AppLayout title="Manage Resources" subtitle="Add, edit, and manage campus resources">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] h-11">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="LECTURE_HALL">Lecture Halls</SelectItem>
            <SelectItem value="LAB">Laboratories</SelectItem>
            <SelectItem value="MEETING_ROOM">Meeting Rooms</SelectItem>
            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm); setCapacityError(""); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md h-11">
              <Plus className="h-4 w-4 mr-2" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Resource name" />
                </div>
                <div className="space-y-1">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LECTURE_HALL">Lecture Hall</SelectItem>
                      <SelectItem value="LAB">Laboratory</SelectItem>
                      <SelectItem value="MEETING_ROOM">Meeting Room</SelectItem>
                      <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Status *</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Location *</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Building A, Ground Floor" />
                </div>
                <div className="space-y-1">
                  <Label>Capacity</Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={form.capacity} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setForm({ ...form, capacity: "" });
                        setCapacityError("");
                      } else if (/^\d+$/.test(val)) {
                        setForm({ ...form, capacity: val });
                        setCapacityError("");
                      } else {
                        setCapacityError("Only numbers are allowed in Capacity field");
                      }
                    }} 
                    placeholder="0"
                    className={capacityError ? "border-red-500" : ""}
                  />
                  {capacityError && <p className="text-red-500 text-sm mt-1">{capacityError}</p>}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Availability</Label>
                  {form.availabilitySlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                      <div className="flex flex-wrap gap-1 flex-1">
                        {DAYS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => updateAvailabilitySlot(idx, "days", day)}
                            className={`px-2 py-1 text-xs rounded ${
                              slot.days.includes(day)
                                ? "bg-blue-600 text-white"
                                : "bg-white border text-slate-600"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      <Clock className="h-4 w-4 text-slate-400" />
                      <Select
                        value={slot.fromTime}
                        onValueChange={(v) => updateAvailabilitySlot(idx, "fromTime", v)}
                      >
                        <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {START_TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-slate-400">-</span>
                      <Select
                        value={slot.toTime}
                        onValueChange={(v) => updateAvailabilitySlot(idx, "toTime", v)}
                      >
                        <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {END_TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => removeAvailabilitySlot(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAvailabilitySlot}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                  </Button>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Facilities (comma-separated)</Label>
                  <Input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="Projector, Wi-Fi, AC" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Access Control *</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          const current = form.allowedRoles;
                          const updated = current.includes(role.value)
                            ? current.filter((r) => r !== role.value)
                            : [...current, role.value];
                          setForm({ ...form, allowedRoles: updated });
                        }}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          form.allowedRoles.includes(role.value)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Select one or both roles. If both User and Lecturer should access, select both.</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label>Description</Label>
                    <span className={`text-xs font-medium ${form.description.length > 400 ? "text-orange-600" : form.description.length > 450 ? "text-red-600" : "text-slate-500"}`}>
                      {form.description.length}/500
                    </span>
                  </div>
                  <Textarea 
                    value={form.description} 
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setForm({ ...form, description: e.target.value });
                      }
                    }} 
                    rows={3}
                    placeholder="Enter description (max 500 characters)"
                    className={form.description.length > 450 ? "border-red-300 focus:border-red-500" : ""}
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-2"
              onClick={handleSubmit}
              disabled={!form.name || !form.location || !form.status || form.allowedRoles.length === 0 || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Update Resource" : "Create Resource"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((resource) => (
            <Card key={resource.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {getResourceTypeIcon(resource.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900">{resource.name}</h3>
                        <ResourceStatusBadge status={resource.status} />
                        <span className="text-xs text-slate-500">{getResourceTypeLabel(resource.type)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 max-w-2xl leading-relaxed line-clamp-2">
                        {getResourceDescription(resource)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{resource.location}</span>
                        {resource.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" />Cap: {resource.capacity}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(resource)}>
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Dialog open={deleteId === resource.id} onOpenChange={(o) => setDeleteId(o ? resource.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Resource</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-slate-600">Are you sure you want to delete "{resource.name}"? This cannot be undone.</p>
                        <div className="flex gap-3 mt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => deleteMutation.mutate(resource.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">No resources found.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

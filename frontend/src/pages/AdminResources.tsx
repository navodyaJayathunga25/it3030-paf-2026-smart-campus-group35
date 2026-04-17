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
import { getResourceTypeIcon, getResourceTypeLabel } from "@/lib/types";
import type { Resource } from "@/lib/types";
import { Search, Plus, Pencil, Trash2, MapPin, Users, Loader2, X, Clock } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

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

export default function AdminResources() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
      availabilitySlots: [...form.availabilitySlots, { days: [], fromTime: "08:00", toTime: "18:00" }],
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
    setDialogOpen(true);
  };

  
}

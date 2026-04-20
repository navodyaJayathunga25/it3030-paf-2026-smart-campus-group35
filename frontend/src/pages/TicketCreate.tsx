import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ticketService } from "@/services/ticketService";
import { resourceService } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { ticketCategories } from "@/lib/types";
import type { TicketPriority } from "@/lib/types";
import { uploadManyToCloudinary } from "@/lib/cloudinary";
import {
  ArrowLeft,
  Upload,
  X,
  Send,
  Loader2,
  FileText,
  MapPin,
  ImageIcon,
  UserCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const priorityOptions: {
  value: TicketPriority;
  label: string;
  description: string;
  dot: string;
  ring: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
    description: "Minor issue, no rush",
    dot: "bg-emerald-500",
    ring: "peer-data-[state=checked]:ring-emerald-500 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Should be addressed soon",
    dot: "bg-amber-500",
    ring: "peer-data-[state=checked]:ring-amber-500 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Affecting daily work",
    dot: "bg-orange-500",
    ring: "peer-data-[state=checked]:ring-orange-500 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    description: "Urgent, blocking operations",
    dot: "bg-red-500",
    ring: "peer-data-[state=checked]:ring-red-500 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50",
  },
];

const MAX_DESCRIPTION = 1000;

export default function TicketCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [resourceId, setResourceId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);

  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourceService.getAll({ status: "ACTIVE" }),
  });

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === resourceId),
    [resources, resourceId],
  );

  const [uploading, setUploading] = useState(false);

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files],
  );

  const handleResourceChange = (v: string) => {
    const id = v === "none" ? "" : v;
    setResourceId(id);
    if (id) {
      const picked = resources.find((r) => r.id === id);
      if (picked?.location && (!location || locationAutoFilled)) {
        setLocation(picked.location);
        setLocationAutoFilled(true);
      }
    } else if (locationAutoFilled) {
      setLocation("");
      setLocationAutoFilled(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        try {
          attachmentUrls = await uploadManyToCloudinary(files);
        } finally {
          setUploading(false);
        }
      }
      return ticketService.create({
        resourceId: resourceId || undefined,
        location,
        category,
        description,
        priority: priority as TicketPriority,
        contactEmail,
        contactPhone,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      });
    },
    onSuccess: (ticket) => {
      toast.success("Ticket created successfully");
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message ?? err.message ?? "Failed to create ticket",
      ),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const total = files.length + selected.length;
    if (total > 3) {
      toast.error("Maximum 3 attachments allowed");
      return;
    }
    setFiles([...files, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const isFormValid =
    category.trim().length > 0 &&
    priority !== "" &&
    location.trim().length > 0 &&
    description.trim().length > 0 &&
    contactEmail.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate();
  };

  const isSubmitting = mutation.isPending || uploading;

  return (
    <AppLayout
      title="Create Ticket"
      subtitle="Report an issue or request maintenance"
    >
      <Button
        variant="ghost"
        className="mb-4 text-slate-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
        {/* Section: Issue Details */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Issue Details
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tell us what needs attention
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Related Resource{" "}
                  <span className="text-slate-400 text-xs font-normal">
                    (optional)
                  </span>
                </Label>
                <Select
                  value={resourceId || "none"}
                  onValueChange={handleResourceChange}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {resources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                        <span className="text-slate-400 ml-2 text-xs">
                          {r.location}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedResource && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <Info className="h-3 w-3" />
                    {selectedResource.type.replace("_", " ")} ·{" "}
                    {selectedResource.location}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Priority <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {priorityOptions.map((p) => {
                  const checked = priority === p.value;
                  return (
                    <label
                      key={p.value}
                      className={cn(
                        "relative cursor-pointer rounded-lg border p-3 transition-all hover:border-slate-300",
                        checked
                          ? "border-2 shadow-sm"
                          : "border-slate-200 bg-white",
                        checked && p.value === "LOW" && "border-emerald-500 bg-emerald-50",
                        checked && p.value === "MEDIUM" && "border-amber-500 bg-amber-50",
                        checked && p.value === "HIGH" && "border-orange-500 bg-orange-50",
                        checked && p.value === "CRITICAL" && "border-red-500 bg-red-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p.value}
                        checked={checked}
                        onChange={() => setPriority(p.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", p.dot)} />
                        <span className="text-sm font-medium text-slate-800">
                          {p.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        {p.description}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <span
                  className={cn(
                    "text-xs",
                    description.length > MAX_DESCRIPTION
                      ? "text-red-500"
                      : "text-slate-400",
                  )}
                >
                  {description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, MAX_DESCRIPTION))
                }
                placeholder="Describe the issue clearly — what happened, when did it start, and any steps to reproduce it."
                rows={5}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section: Location */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Location
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Where is the issue located?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setLocationAutoFilled(false);
                  }}
                  placeholder="e.g. Building A, Room 101"
                  className="pl-9 h-10"
                />
              </div>
              {locationAutoFilled && selectedResource && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 pt-1">
                  <Info className="h-3 w-3" />
                  Auto-filled from selected resource. You can edit if needed.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Attachments */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Attachments
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add up to 3 images (optional)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {files.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-lg p-8 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-6 w-6 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  Click to upload images
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG up to 3 files
                </p>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((p, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
                      <p className="text-[10px] text-white truncate">
                        {p.name}
                      </p>
                    </div>
                  </div>
                ))}
                {files.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-xs text-slate-500">Add more</span>
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Contact */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                <UserCircle2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Contact Information
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  How can our team reach you?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Contact Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Contact Phone{" "}
                  <span className="text-slate-400 text-xs font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="flex items-center gap-3 pb-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </p>
        </div>
        </div>

        {/* Right sidebar: Submit summary */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-200 shadow-sm lg:sticky lg:top-6">
            <CardHeader className="border-b bg-slate-50/60">
              <CardTitle className="text-base font-semibold">
                Submit Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-800">
                    {category || <span className="text-slate-400">—</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Priority</span>
                  {priority ? (
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          priorityOptions.find((p) => p.value === priority)?.dot,
                        )}
                      />
                      {priorityOptions.find((p) => p.value === priority)?.label}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-500">Attachments</span>
                  <span className="font-medium text-slate-800">
                    {files.length}/3
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full text-white shadow-md transition-all",
                  isFormValid && !isSubmitting
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    : "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed hover:bg-slate-300",
                )}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Submit Ticket"}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Your ticket will be reviewed and assigned
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppLayout>
  );
}

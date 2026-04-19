import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { ticketService } from "@/services/ticketService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { User, Mail, Shield, CalendarCheck, Wrench, Camera, Loader2 } from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB raw input
const MAX_DIMENSION = 512;

async function fileToResizedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const roleBadge: Record<string, string> = {
  USER: "bg-blue-100 text-blue-800 border-blue-200",
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  TECHNICIAN: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickFile = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const resized = await fileToResizedDataUrl(file);
      await userService.updateMyPicture(resized);
      await refreshUser();
      toast.success("Profile picture updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingService.getAll,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.getAll,
  });

  const approvedBookings = bookings.filter(
    (b) => b.status === "APPROVED",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const openTickets = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
  ).length;

  return (
    <AppLayout title="Profile" subtitle="Manage your account settings">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={handlePickFile}
                    disabled={uploading}
                    title="Change profile picture"
                    className="relative block h-20 w-20 rounded-full overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0) ?? "U"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {uploading ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <Badge
                    className={`mt-1 border ${roleBadge[user?.role ?? "USER"]}`}
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Full Name
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{user?.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{user?.email}</p>
                  </div>
                </div>
                {user?.department && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Department
                    </p>
                    <p className="text-sm text-slate-900">{user.department}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Account Role
                  </p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{user?.role}</p>
                  </div>
                </div>
                {user?.createdAt && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Member Since
                    </p>
                    <p className="text-sm text-slate-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Activity Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-slate-700">
                      Approved Bookings
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-700">
                    {approvedBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-slate-700">
                      Pending Bookings
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-700">
                    {pendingBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-slate-700">
                      Active Tickets
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {openTickets}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Account Info
              </h3>
              <p className="text-xs text-slate-500">
                Authenticated via Google OAuth 2.0. Your profile is managed
                through your Google account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

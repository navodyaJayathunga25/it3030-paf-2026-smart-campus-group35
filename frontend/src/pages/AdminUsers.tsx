import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";
import type { UserRole, UserStatus } from "@/lib/types";
import { Search, Mail, Shield, Loader2, ToggleLeft, ToggleRight, CircleDot } from "lucide-react";
import { toast } from "sonner";

const roleBadgeStyles: Record<UserRole, string> = {
  USER: "bg-blue-100 text-blue-800 border-blue-200",
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  TECHNICIAN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LECTURER: "bg-amber-100 text-amber-800 border-amber-200",
};

const statusBadgeStyles: Record<UserStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateRole(id, role),
    onSuccess: () => {
      toast.success("User role updated");
      invalidateUsers();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      userService.updateStatus(id, active),
    onSuccess: () => {
      toast.success("User active state updated");
      invalidateUsers();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.approve(id, role),
    onSuccess: () => {
      toast.success("User approved");
      invalidateUsers();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => userService.reject(id),
    onSuccess: () => {
      toast.success("User rejected");
      invalidateUsers();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to reject"),
  });

  const handleStatusChange = (
    id: string,
    currentStatus: UserStatus,
    next: UserStatus,
    role: UserRole,
  ) => {
    if (next === currentStatus) return;
    if (next === "APPROVED") {
      approveMutation.mutate({ id, role });
    } else if (next === "REJECTED") {
      rejectMutation.mutate(id);
    }
    // PENDING is a read-only state once an admin has acted; ignore selection back to PENDING
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const userStatus: UserStatus = u.status ?? "APPROVED";
    const matchStatus = statusFilter === "ALL" || userStatus === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const pendingCount = users.filter((u) => (u.status ?? "APPROVED") === "PENDING").length;

  return (
    <AppLayout title="Manage Users" subtitle="View and manage platform users">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px] h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">
              Pending{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] h-11">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="TECHNICIAN">Technician</SelectItem>
            <SelectItem value="LECTURER">Lecturer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-2">
            {filtered.length} users
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-700">
                • {pendingCount} pending approval
              </span>
            )}
          </p>
          {filtered.map((user) => {
            const userStatus: UserStatus = user.status ?? "APPROVED";
            const isPending = userStatus === "PENDING";
            return (
              <Card
                key={user.id}
                className={`border-0 shadow-sm hover:shadow-md transition-all ${
                  isPending ? "ring-1 ring-amber-200 bg-amber-50/30" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{user.name}</h3>
                          <Badge className={`text-[10px] border ${roleBadgeStyles[user.role]}`}>{user.role}</Badge>
                          <Badge className={`text-[10px] border ${statusBadgeStyles[userStatus]}`}>{userStatus}</Badge>
                          {!user.active && userStatus === "APPROVED" && (
                            <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                          {user.department && <span>{user.department}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Select
                        value={user.role}
                        onValueChange={(role) => roleMutation.mutate({ id: user.id, role: role as UserRole })}
                        disabled={roleMutation.isPending}
                      >
                        <SelectTrigger className="w-[130px] h-9 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="TECHNICIAN">Technician</SelectItem>
                          <SelectItem value="LECTURER">Lecturer</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={userStatus}
                        onValueChange={(next) =>
                          handleStatusChange(user.id, userStatus, next as UserStatus, user.role)
                        }
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        <SelectTrigger className="w-[140px] h-9 text-xs">
                          <CircleDot className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING" disabled>Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      {userStatus === "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 text-xs gap-1"
                          onClick={() => activeMutation.mutate({ id: user.id, active: !user.active })}
                          disabled={activeMutation.isPending}
                        >
                          {user.active ? (
                            <><ToggleRight className="h-4 w-4 text-emerald-600" /> Active</>
                          ) : (
                            <><ToggleLeft className="h-4 w-4 text-slate-400" /> Inactive</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">No users found.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

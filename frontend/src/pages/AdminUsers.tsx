import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";
import type { UserRole } from "@/lib/types";
import { Search, Mail, Shield, Loader2, ToggleLeft, ToggleRight, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

const roleBadgeStyles: Record<UserRole, string> = {
  USER: "bg-blue-100 text-blue-800 border-blue-200",
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  TECHNICIAN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LECTURER: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const { data: pendingUsers = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["users", "pending"],
    queryFn: userService.getPending,
  });

  const [pendingRoleSelection, setPendingRoleSelection] = useState<Record<string, UserRole>>({});

  const approveMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.approve(id, role),
    onSuccess: () => {
      toast.success("User approved");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "pending"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => userService.reject(id),
    onSuccess: () => {
      toast.success("User rejected");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "pending"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to reject"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateRole(id, role),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      userService.updateStatus(id, active),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed"),
  });

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AppLayout title="Manage Users" subtitle="View and manage platform users">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
          {pendingUsers.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {pendingUsers.length}
            </Badge>
          )}
        </div>

        {pendingLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card className="border-0 shadow-sm bg-slate-50">
            <CardContent className="p-5 text-sm text-slate-500 text-center">
              No users waiting for approval.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => {
              const selectedRole = pendingRoleSelection[user.id] ?? "USER";
              return (
                <Card key={user.id} className="border border-amber-200 bg-amber-50/50 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        {user.picture ? (
                          <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{user.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                            {user.department && <span>{user.department}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Select
                          value={selectedRole}
                          onValueChange={(role) =>
                            setPendingRoleSelection((prev) => ({ ...prev, [user.id]: role as UserRole }))
                          }
                          disabled={approveMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px] h-9 text-xs bg-white">
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

                        <Button
                          size="sm"
                          className="h-9 gap-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => approveMutation.mutate({ id: user.id, role: selectedRole })}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => rejectMutation.mutate(user.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
          <p className="text-sm text-slate-500 mb-2">{filtered.length} users</p>
          {filtered.map((user) => (
            <Card key={user.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-slate-900">{user.name}</h3>
                        <Badge className={`text-[10px] border ${roleBadgeStyles[user.role]}`}>{user.role}</Badge>
                        {!user.active && <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                        {user.department && <span>{user.department}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Select
                      value={user.role}
                      onValueChange={(role) => roleMutation.mutate({ id: user.id, role: role as UserRole })}
                      disabled={roleMutation.isPending}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => statusMutation.mutate({ id: user.id, active: !user.active })}
                      disabled={statusMutation.isPending}
                    >
                      {user.active ? (
                        <><ToggleRight className="h-4 w-4 text-emerald-600" /> Active</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-slate-400" /> Inactive</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

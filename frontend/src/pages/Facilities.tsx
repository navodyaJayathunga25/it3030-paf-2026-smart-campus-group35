import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { resourceService } from "@/services/resourceService";
import { getResourceTypeIcon, getResourceTypeLabel } from "@/lib/types";
import { Search, Grid3X3, List, MapPin, Users, Clock, ArrowRight, Loader2 } from "lucide-react";

export default function Facilities() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [capacityFilter, setCapacityFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", typeFilter, statusFilter, search],
    queryFn: () => resourceService.getAll({
      type: typeFilter !== "ALL" ? typeFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: search || undefined,
    }),
  });

  const visibleResources = resources.filter((resource) => {
    const allowedRoles = resource.allowedRoles ?? [];
    if (allowedRoles.length === 0) return true;
    return !!user?.role && allowedRoles.includes(user.role);
  });

  const filtered = visibleResources.filter((resource) => {
    if (capacityFilter === "ALL") return true;

    const capacity = resource.capacity;
    if (capacity == null) return false;

    if (capacityFilter === "RANGE_1_30") return capacity >= 1 && capacity <= 30;
    if (capacityFilter === "RANGE_31_60") return capacity >= 31 && capacity <= 60;
    if (capacityFilter === "RANGE_61_120") return capacity >= 61 && capacity <= 120;
    if (capacityFilter === "RANGE_121_PLUS") return capacity >= 121;

    return true;
  });

  return (
    <AppLayout title="Facilities & Assets" subtitle="Browse and book campus resources">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative w-full md:max-w-4xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white/70 p-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[180px]">
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
            </SelectContent>
          </Select>

          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[190px]">
              <SelectValue placeholder="Capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Capacities</SelectItem>
              <SelectItem value="RANGE_1_30">1 to 30</SelectItem>
              <SelectItem value="RANGE_31_60">31 to 60</SelectItem>
              <SelectItem value="RANGE_61_120">61 to 120</SelectItem>
              <SelectItem value="RANGE_121_PLUS">121+</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1 border rounded-lg p-1 sm:ml-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500 mb-4">{filtered.length} resources found</p>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((resource) => (
            <Link key={resource.id} to={`/facilities/${resource.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-0">
                  {/* Resource Header with gradient */}
                  <div className={`h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden ${
                    resource.type === "LECTURE_HALL" ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                    resource.type === "LAB" ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                    resource.type === "MEETING_ROOM" ? "bg-gradient-to-br from-purple-500 to-violet-600" :
                    "bg-gradient-to-br from-amber-500 to-orange-600"
                  }`}>
                    <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                      {getResourceTypeIcon(resource.type)}
                    </span>
                    <div className="absolute top-3 right-3">
                      <ResourceStatusBadge status={resource.status} />
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xs font-medium text-white/80 bg-black/20 px-2 py-1 rounded-md">
                        {getResourceTypeLabel(resource.type)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {resource.name}
                    </h3>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {resource.location}
                      </div>
                      {resource.capacity && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          Capacity: {resource.capacity}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {resource.availabilityWindows}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(resource.facilities ?? []).slice(0, 2).map((a) => (
                          <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {a}
                          </span>
                        ))}
                        {(resource.facilities?.length ?? 0) > 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            +{(resource.facilities?.length ?? 0) - 2}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filtered.map((resource) => (
            <Link key={resource.id} to={`/facilities/${resource.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    resource.type === "LECTURE_HALL" ? "bg-blue-100" :
                    resource.type === "LAB" ? "bg-emerald-100" :
                    resource.type === "MEETING_ROOM" ? "bg-purple-100" :
                    "bg-amber-100"
                  }`}>
                    <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {resource.name}
                      </h3>
                      <ResourceStatusBadge status={resource.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{resource.location}</span>
                      {resource.capacity && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />Cap: {resource.capacity}</span>
                      )}
                      <span>{getResourceTypeLabel(resource.type)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No resources match your search criteria.</p>
        </div>
      )}
    </AppLayout>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import { resourceService } from "@/services/resourceService";
import { getResourceTypeIcon, getResourceTypeLabel } from "@/lib/types";
import { Search, Grid3X3, List, MapPin, Users, Clock, ArrowRight, Loader2 } from "lucide-react";

export default function Facilities() {
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

  const filtered = resources.filter((resource) => {
    if (capacityFilter === "ALL") return true;

    const capacity = resource.capacity;
    if (capacity == null) return capacityFilter === "UNSPECIFIED";

    if (capacityFilter === "RANGE_1_30") return capacity >= 1 && capacity <= 30;
    if (capacityFilter === "RANGE_31_60") return capacity >= 31 && capacity <= 60;
    if (capacityFilter === "RANGE_61_120") return capacity >= 61 && capacity <= 120;
    if (capacityFilter === "RANGE_121_PLUS") return capacity >= 121;

    return true;
  });

  
      
    </AppLayout>
  );
}
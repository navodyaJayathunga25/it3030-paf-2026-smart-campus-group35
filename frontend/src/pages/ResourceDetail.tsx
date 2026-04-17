import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceStatusBadge } from "@/components/StatusBadge";
import { resourceService } from "@/services/resourceService";
import { bookingService } from "@/services/bookingService";
import { getResourceTypeIcon, getResourceTypeLabel } from "@/lib/types";
import { MapPin, Users, Clock, ArrowLeft, CalendarPlus, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getById(id!),
    enabled: !!id,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingService.getAll,
  });

  if (isLoading) {
    return (
      <AppLayout title="Resource Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!resource) {
    return (
      <AppLayout title="Resource Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">The resource you're looking for doesn't exist.</p>
          <Link to="/facilities">
            <Button variant="outline">Back to Facilities</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const resourceBookings = allBookings.filter(
    (b) => b.resourceId === resource.id && b.status === "APPROVED"
  );

  return (
    <AppLayout title={resource.name} subtitle={getResourceTypeLabel(resource.type)}>
      <Button variant="ghost" className="mb-4 text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className={`h-48 flex items-center justify-center relative ${
              resource.type === "LECTURE_HALL" ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
              resource.type === "LAB" ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
              resource.type === "MEETING_ROOM" ? "bg-gradient-to-br from-purple-500 to-violet-600" :
              "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}>
              <span className="text-7xl opacity-80">{getResourceTypeIcon(resource.type)}</span>
              <div className="absolute top-4 right-4">
                <ResourceStatusBadge status={resource.status} />
              </div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{resource.name}</h2>
              {resource.description && (
                <p className="text-slate-600 leading-relaxed mb-4">{resource.description}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{resource.location}</span>
                </div>
                {resource.capacity && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Capacity: {resource.capacity}</span>
                  </div>
                )}
                {resource.availabilityWindows && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{resource.availabilityWindows}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {resourceBookings.length > 0 ? (
                <div className="space-y-2">
                  {resourceBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{b.purpose}</p>
                        <p className="text-xs text-slate-500">{b.date} · {b.startTime}–{b.endTime}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                        Confirmed
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Now Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Book This Resource</h3>
              {resource.status === "ACTIVE" ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Select your preferred date and time to make a booking request.
                  </p>
                  <Link to={`/bookings/create?resource=${resource.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                      <CalendarPlus className="h-4 w-4 mr-2" /> Book Now
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-4 w-4" />
                  <span>Currently out of service</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          {resource.amenities && resource.amenities.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resource.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900">{getResourceTypeLabel(resource.type)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Building</span>
                <span className="font-medium text-slate-900">{resource.building}</span>
              </div>
              {resource.floor && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-medium text-slate-900">{resource.floor}</span>
                </div>
              )}
              {resource.capacity && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Capacity</span>
                  <span className="font-medium text-slate-900">{resource.capacity} people</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <ResourceStatusBadge status={resource.status} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

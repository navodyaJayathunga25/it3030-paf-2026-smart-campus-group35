import { Toaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import AuthError from "./pages/AuthError";
import AuthPending from "./pages/AuthPending";

// User pages
import Dashboard from "./pages/Dashboard";
import Facilities from "./pages/Facilities";
import ResourceDetail from "./pages/ResourceDetail";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail";
import BookingCreate from "./pages/BookingCreate";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import TicketCreate from "./pages/TicketCreate";
import Notifications from "./pages/Notification";
import Profile from "./pages/Profile";

// Admin pages
import Admin from "./pages/Admin";
import AdminBookings from "./pages/AdminBookings";
import AdminTickets from "./pages/AdminTickets";
import AdminResources from "./pages/AdminResources";
import AdminUsers from "./pages/AdminUsers";

// Technician pages
import MyAssignedTickets from "./pages/MyAssignedTickets";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === "PENDING") {
    return <Navigate to="/auth/pending" replace />;
  }

  if (user?.status === "REJECTED") {
    return <Navigate to="/auth/error?reason=rejected" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ShadcnToaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route path="/auth/pending" element={<AuthPending />} />

            {/* User (authenticated) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities/:id"
              element={
                <ProtectedRoute>
                  <ResourceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/create"
              element={
                <ProtectedRoute>
                  <BookingCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/create"
              element={
                <ProtectedRoute>
                  <TicketCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* Technician */}
            <Route
              path="/technician/tickets"
              element={
                <ProtectedRoute roles={["TECHNICIAN", "ADMIN"]}>
                  <MyAssignedTickets />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

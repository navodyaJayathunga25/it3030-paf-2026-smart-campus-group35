import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Wrench,
  Bell,
  User,
  Shield,
  ClipboardList,
  Users,
  Package,
  HardHat,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
  {
    label: "Facilities",
    href: "/facilities",
    icon: Building2,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
  {
    label: "My Bookings",
    href: "/bookings",
    icon: CalendarCheck,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
  {
    label: "My Tickets",
    href: "/tickets",
    icon: Wrench,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    roles: ["USER", "ADMIN", "TECHNICIAN", "LECTURER"],
  },
];

const adminItems: NavItem[] = [
  { label: "Admin Dashboard", href: "/admin", icon: Shield, roles: ["ADMIN"] },
  {
    label: "All Bookings",
    href: "/admin/bookings",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    label: "All Tickets",
    href: "/admin/tickets",
    icon: Wrench,
    roles: ["ADMIN"],
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: Package,
    roles: ["ADMIN"],
  },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
];

const techItems: NavItem[] = [
  {
    label: "Assigned Tickets",
    href: "/technician/tickets",
    icon: HardHat,
    roles: ["TECHNICIAN"],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role ?? "USER";

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const renderNavGroup = (items: NavItem[], title?: string) => {
    const filtered = items.filter((item) => item.roles.includes(role));
    if (filtered.length === 0) return null;
    return (
      <div className="mb-6">
        {title && (
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {title}
          </p>
        )}
        <nav className="space-y-1 px-2">
          {filtered.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">
            smartcampus
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">
            Smart Operations
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {renderNavGroup(navItems, "Main")}
        {renderNavGroup(adminItems, "Administration")}
        {renderNavGroup(techItems, "Technician")}
      </div>

      {/* User Info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-[10px] text-slate-400">{user?.role ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({
  children,
  title,
  subtitle,
}: AppLayoutProps) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppSidebar />
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover cursor-pointer"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                  {user?.name?.charAt(0) ?? "U"}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

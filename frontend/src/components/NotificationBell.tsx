import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationService.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate("/notifications")}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
}

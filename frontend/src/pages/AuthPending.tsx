import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap } from "lucide-react";

export default function AuthPendingPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const handleReturnHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
          <GraduationCap className="h-9 w-9 text-white" />
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/30 blur-xl rounded-full"></div>
            <Clock
              className="relative h-12 w-12 text-amber-500"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          Awaiting Admin Approval
        </h1>

        <p className="text-base text-muted-foreground">
          Your account{email ? ` (${email})` : ""} has been created and is waiting for an
          administrator to review it and assign your role. You'll be able to sign in once
          your account has been approved.
        </p>

        <p className="text-sm text-gray-500">
          Please check back later, or contact the campus administrator if this is urgent.
        </p>

        <div className="flex justify-center pt-2">
          <Button onClick={handleReturnHome} className="px-6">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

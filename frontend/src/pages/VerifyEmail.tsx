import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authService } from "@/services/authService";
import axios from "axios";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing a token.");
      return;
    }
    authService
      .verifyEmail(token)
      .then((msg) => {
        setStatus("success");
        setMessage(msg);
      })
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Verification failed."
          : "Verification failed.";
        setStatus("error");
        setMessage(msg);
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-6">
      <Card className="relative w-full max-w-md border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900 mt-4">
                Verifying your email…
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div className="h-14 w-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email verified</h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {message} Once an administrator approves your account, you'll
                receive a welcome email and can sign in.
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-blue-600 font-medium hover:underline"
              >
                Back to Sign In
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="h-14 w-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Verification failed
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {message}
              </p>
              <Link
                to="/register"
                className="inline-block mt-6 text-blue-600 font-medium hover:underline"
              >
                Register again
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState("");

  const getNameValidationMessage = (value: string) => {
    if (!value.trim()) {
      return "Full name is required.";
    }
    return "";
  };

  const getEmailValidationMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "University email is required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "Enter a valid email address.";
    }
    return "";
  };

  const getPasswordValidationMessage = (value: string) => {
    if (!value) {
      return "Password is required.";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  };

  const validateForm = () => {
    const nextErrors = {
      name: getNameValidationMessage(name),
      email: getEmailValidationMessage(email),
      password: getPasswordValidationMessage(password),
    };

    setErrors({
      name: nextErrors.name || undefined,
      email: nextErrors.email || undefined,
      password: nextErrors.password || undefined,
    });

    return !nextErrors.name && !nextErrors.email && !nextErrors.password;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      toast.error("Please fill all fields. Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        department: department || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Registration failed. Please try again."
        : "Registration failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-6">
        <Card className="relative w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              We've sent a verification link to <strong>{email}</strong>. Click
              the link to confirm your address. After that, an administrator
              will review and approve your account before you can sign in.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-blue-600 font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                SMART CAMPUS
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Join the smart campus platform
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium border-slate-200 hover:bg-slate-50"
            onClick={() => authService.loginWithGoogle()}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400">
              or register with email
            </span>
          </div>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10 h-11"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    setErrors((prev) => ({
                      ...prev,
                      name: getNameValidationMessage(value) || undefined,
                    }));
                    if (serverError) {
                      setServerError("");
                    }
                  }}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                University Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    setErrors((prev) => ({
                      ...prev,
                      email: getEmailValidationMessage(value) || undefined,
                    }));
                    if (serverError) {
                      setServerError("");
                    }
                  }}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-slate-700">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    setErrors((prev) => ({
                      ...prev,
                      password: getPasswordValidationMessage(value) || undefined,
                    }));
                    if (serverError) {
                      setServerError("");
                    }
                  }}
                  minLength={8}
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-600">{errors.password}</p>
              )}
            </div>
            {serverError && (
              <p className="text-sm font-medium text-red-600">{serverError}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

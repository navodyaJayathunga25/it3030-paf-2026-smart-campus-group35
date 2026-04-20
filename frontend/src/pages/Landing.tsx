import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Building2,
  CalendarCheck,
  Wrench,
  Bell,
  Shield,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Users,
  BarChart3,
  HardHat,
} from "lucide-react";

const HERO_IMG =
  "https://static.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg";
const BOOKING_IMG =
  "https://mgx-backend-cdn.metadl.com/generate/images/422905/2026-04-12/0bf5a29c-f23e-4d63-8dba-8e11435e655e.png";
const MAINTENANCE_IMG =
  "https://mgx-backend-cdn.metadl.com/generate/images/422905/2026-04-12/aa1ddd2c-6722-47a9-bd36-559dcd485865.png";

const features = [
  {
    icon: Building2,
    title: "Facilities Catalogue",
    description:
      "Browse and search lecture halls, labs, meeting rooms, and equipment with real-time availability.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: CalendarCheck,
    title: "Smart Booking",
    description:
      "Theater-style seat selection for halls, time-slot booking for equipment, with conflict prevention.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Wrench,
    title: "Incident Ticketing",
    description:
      "Report maintenance issues with image evidence, track resolution progress in real-time.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Stay updated with booking approvals, ticket status changes, and comment alerts.",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Secure OAuth 2.0 login with USER, ADMIN, and TECHNICIAN roles for proper access control.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    description:
      "Dashboard with usage analytics, peak hours, and service-level tracking for administrators.",
    color: "from-rose-500 to-rose-600",
  },
];

const stats = [
  { value: "50+", label: "Bookable Resources" },
  { value: "1,200+", label: "Monthly Bookings" },
  { value: "98%", label: "Resolution Rate" },
  { value: "24/7", label: "System Availability" },
];

const workflow = [
  {
    step: "1",
    title: "Browse Resources",
    desc: "Explore available facilities and equipment",
  },
  {
    step: "2",
    title: "Book or Report",
    desc: "Make a booking or submit a maintenance ticket",
  },
  {
    step: "3",
    title: "Get Approved",
    desc: "Admin reviews and approves your request",
  },
  {
    step: "4",
    title: "Track & Manage",
    desc: "Monitor status and receive notifications",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              SMART CAMPUS
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#modules"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Modules
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Campus Operations Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Your Campus,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Smarter
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                One platform to manage facility bookings, maintenance tickets,
                and campus operations. Streamline workflows with role-based
                access and real-time notifications.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all text-base px-8"
                  >
                    Start Booking <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[
                  "OAuth 2.0 Secure",
                  "Role-Based Access",
                  "Real-time Updates",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 text-sm text-slate-500"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50">
                <img
                  src={HERO_IMG}
                  alt="Smart Campus"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-[#0F172A] to-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A comprehensive platform designed for modern campus operations
              management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <CardContent className="p-6">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple 4-step process to manage campus operations
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {workflow.map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
                {i < workflow.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section id="modules" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {/* Booking Module */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Theater-Style Booking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Book lecture halls with an interactive seat selection interface.
                Choose time slots for equipment and meeting rooms. The system
                automatically prevents scheduling conflicts.
              </p>
              <ul className="space-y-3">
                {[
                  "Interactive seat/slot selection",
                  "Conflict prevention",
                  "Approval workflow",
                  "Status tracking",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
              <img
                src={BOOKING_IMG}
                alt="Booking System"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Maintenance Module */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
              <img
                src={MAINTENANCE_IMG}
                alt="Maintenance System"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Maintenance & Incident Ticketing
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Report issues with photo evidence, track resolution progress,
                and communicate with technicians through an integrated comment
                system.
              </p>
              <ul className="space-y-3">
                {[
                  "Image attachments (up to 3)",
                  "Priority-based tracking",
                  "Technician assignment",
                  "Resolution notes & comments",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built for Every Role
            </h2>
            <p className="text-lg text-slate-600">
              Tailored experiences for different campus stakeholders
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                role: "Students & Staff",
                desc: "Browse facilities, make bookings, report issues, and track requests.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Shield,
                role: "Administrators",
                desc: "Approve bookings, manage resources, assign technicians, and view analytics.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: HardHat,
                role: "Technicians",
                desc: "View assigned tickets, update status, add resolution notes, and communicate.",
                color: "from-emerald-500 to-emerald-600",
              },
            ].map((item) => (
              <Card
                key={item.role}
                className="border-0 shadow-sm hover:shadow-lg transition-all text-center p-8"
              >
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.role}
                </h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Modernize Your Campus?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join the smart campus revolution. Start managing facilities and
            maintenance efficiently today.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-base px-10 shadow-lg"
            >
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                SMART CAMPUS
              </span>
            </div>
            <p className="text-sm">
              © 2026 Smart Campus Operations Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
